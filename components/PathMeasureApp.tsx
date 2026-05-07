"use client";

import dynamic from "next/dynamic";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import ControlPanel from "@/components/ControlPanel";
import {
  getStraightDistanceMeters,
  getTotalDistanceMeters,
} from "@/lib/distance";
import type { AppStatus, GeoPermission, TrackPoint } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

const MAX_ACCEPTABLE_ACCURACY_METERS = 20;
const MIN_DISTANCE_BETWEEN_POINTS_METERS = 5;
const MIN_SAVE_INTERVAL_MS = 3_000;
const INITIAL_MAP_CENTER: [number, number] = [40.7128, -74.006];

function positionToTrackPoint(position: GeolocationPosition): TrackPoint {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

export default function PathMeasureApp() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [route, setRoute] = useState<TrackPoint[]>([]);
  const [currentPoint, setCurrentPoint] = useState<TrackPoint | null>(null);
  const [permission, setPermission] = useState<GeoPermission>("unknown");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signalMessage, setSignalMessage] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const routeRef = useRef<TrackPoint[]>([]);
  const statusRef = useRef<AppStatus>("idle");
  const lastSavedAtRef = useRef<number>(0);

  const totalDistance = getTotalDistanceMeters(route);
  const straightDistance = getStraightDistanceMeters(route);
  const lastAccuracy = currentPoint?.accuracy ?? null;

  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const stopGeolocationWatch = useEffectEvent(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  });

  const handlePositionUpdate = useEffectEvent(
    (position: GeolocationPosition) => {
      const nextPoint = positionToTrackPoint(position);
      setCurrentPoint(nextPoint);
      setPermission("granted");

      if (statusRef.current !== "recording") {
        return;
      }

      if (nextPoint.accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
        setSignalMessage(
          `Weak GPS signal. Waiting for ${MAX_ACCEPTABLE_ACCURACY_METERS} m accuracy or better.`,
        );
        return;
      }

      const lastSavedPoint = routeRef.current[routeRef.current.length - 1];
      if (!lastSavedPoint) {
        lastSavedAtRef.current = nextPoint.timestamp;
        setSignalMessage(null);
        setRoute([nextPoint]);
        return;
      }

      if (nextPoint.timestamp - lastSavedAtRef.current < MIN_SAVE_INTERVAL_MS) {
        return;
      }

      const distanceFromLastSaved = getStraightDistanceMeters([
        lastSavedPoint,
        nextPoint,
      ]);

      if (distanceFromLastSaved < MIN_DISTANCE_BETWEEN_POINTS_METERS) {
        return;
      }

      lastSavedAtRef.current = nextPoint.timestamp;
      setSignalMessage(null);
      setRoute((currentRoute) => [...currentRoute, nextPoint]);
    },
  );

  const handlePositionError = useEffectEvent((error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      setPermission("denied");
      setErrorMessage(
        "Location permission was denied. Enable location access in Safari settings and try again.",
      );
    } else if (error.code === error.TIMEOUT) {
      setErrorMessage(
        "Timed out while waiting for GPS. Move to an open area and try again.",
      );
    } else {
      setErrorMessage(
        "Unable to read your location right now. Check GPS signal and try again.",
      );
    }

    if (statusRef.current === "recording") {
      stopGeolocationWatch();
      setStatus(routeRef.current.length > 0 ? "stopped" : "idle");
    }
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      maximumAge: 15_000,
      timeout: 10_000,
    });
  }, [handlePositionError, handlePositionUpdate]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startRecording = useEffectEvent(() => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    stopGeolocationWatch();
    routeRef.current = [];
    lastSavedAtRef.current = 0;
    setRoute([]);
    setStatus("recording");
    setErrorMessage(null);
    setSignalMessage("Waiting for a strong GPS fix...");

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      },
    );
  });

  const stopRecording = useEffectEvent(() => {
    stopGeolocationWatch();
    setSignalMessage(null);
    setStatus(routeRef.current.length > 0 ? "stopped" : "idle");
  });

  const clearRoute = useEffectEvent(() => {
    stopGeolocationWatch();
    routeRef.current = [];
    lastSavedAtRef.current = 0;
    setRoute([]);
    setStatus("idle");
    setSignalMessage(null);
    setErrorMessage(null);
  });

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-50">
      <MapView
        center={INITIAL_MAP_CENTER}
        currentPoint={currentPoint}
        route={route}
        status={status}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-4">
        <div className="inline-flex rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs font-medium tracking-[0.24em] text-cyan-200 uppercase backdrop-blur">
          PathMeasure
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:p-4">
        <div className="pointer-events-auto mx-auto w-full max-w-md">
          <ControlPanel
            errorMessage={errorMessage}
            gpsAccuracy={lastAccuracy}
            permission={permission}
            pointsRecorded={route.length}
            signalMessage={signalMessage}
            status={status}
            straightDistanceMeters={straightDistance}
            totalDistanceMeters={totalDistance}
            onClear={clearRoute}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>
      </div>
    </main>
  );
}
