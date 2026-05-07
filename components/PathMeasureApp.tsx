"use client";

import dynamic from "next/dynamic";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import ControlPanel from "@/components/ControlPanel";
import {
  getStraightDistanceMeters,
  getTotalDistanceMeters,
} from "@/lib/distance";
import type { AppStatus, GeoPermission, PanelMode, TrackPoint } from "@/lib/types";

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
  const [panelMode, setPanelMode] = useState<PanelMode>("compact");
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const pendingStartAfterPermissionRef = useRef(false);
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

  useEffect(() => {
    if (status === "recording" || route.length > 0) {
      setPanelMode((currentMode) =>
        currentMode === "hidden" ? "hidden" : "details",
      );
    }
  }, [route.length, status]);

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
      setErrorMessage(null);

      if (statusRef.current !== "recording") {
        setSignalMessage(null);
        if (pendingStartAfterPermissionRef.current) {
          pendingStartAfterPermissionRef.current = false;
          startRecording();
        }
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
    setShowPermissionPrompt(false);
    pendingStartAfterPermissionRef.current = false;

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
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestSingleLocationFix = useEffectEvent(() => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    setErrorMessage(null);
    setSignalMessage("Waiting for location access...");
    setShowPermissionPrompt(false);

    navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15_000,
    });
  });

  const openPermissionPrompt = useEffectEvent(() => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    setShowPermissionPrompt(true);
    setErrorMessage(null);
  });

  const startRecording = useEffectEvent(() => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by this browser.");
      return;
    }

    if (permission !== "granted" && currentPoint === null) {
      pendingStartAfterPermissionRef.current = true;
      setShowPermissionPrompt(true);
      return;
    }

    pendingStartAfterPermissionRef.current = false;
    stopGeolocationWatch();
    routeRef.current = [];
    lastSavedAtRef.current = 0;
    setRoute([]);
    setStatus("recording");
    setErrorMessage(null);
    setSignalMessage("Waiting for a strong GPS fix...");
    setPanelMode("details");
    setShowPermissionPrompt(false);

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
    pendingStartAfterPermissionRef.current = false;
    routeRef.current = [];
    lastSavedAtRef.current = 0;
    setRoute([]);
    setStatus("idle");
    setSignalMessage(null);
    setErrorMessage(null);
    setPanelMode("compact");
    setShowPermissionPrompt(false);
  });

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-50">
      <MapView
        center={INITIAL_MAP_CENTER}
        currentPoint={currentPoint}
        gpsAccuracy={lastAccuracy}
        route={route}
        straightDistanceMeters={straightDistance}
        status={status}
        totalDistanceMeters={totalDistance}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-4">
        <div className="inline-flex rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs font-medium tracking-[0.24em] text-cyan-200 uppercase backdrop-blur">
          PathMeasure
        </div>
      </div>

      {showPermissionPrompt ? (
        <div className="absolute inset-0 z-[600] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[28px] border border-white/15 bg-slate-950 p-5 shadow-2xl shadow-slate-950/45">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200 uppercase">
              Location Access
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Allow GPS for walking distance
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              PathMeasure only uses your location after you ask it to. Continue to show
              the browser permission popup.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl border border-white/15 bg-white/6 px-4 py-4 text-sm font-semibold text-slate-50"
                type="button"
                onClick={() => setShowPermissionPrompt(false)}
              >
                Not now
              </button>
              <button
                className="rounded-2xl bg-cyan-400 px-4 py-4 text-sm font-semibold text-slate-950"
                type="button"
                onClick={requestSingleLocationFix}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:p-4">
        <div className="pointer-events-auto mx-auto w-full max-w-md">
          <ControlPanel
            errorMessage={errorMessage}
            gpsAccuracy={lastAccuracy}
            hasRoute={route.length > 0}
            panelMode={panelMode}
            permission={permission}
            pointsRecorded={route.length}
            signalMessage={signalMessage}
            status={status}
            straightDistanceMeters={straightDistance}
            totalDistanceMeters={totalDistance}
            onAskPermission={openPermissionPrompt}
            onClear={clearRoute}
            onHide={() => setPanelMode("hidden")}
            onShow={() => setPanelMode("compact")}
            onShowDetails={() => setPanelMode("details")}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>
      </div>
    </main>
  );
}
