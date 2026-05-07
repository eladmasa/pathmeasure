"use client";

import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";

import type { AppStatus, TrackPoint } from "@/lib/types";

type MapViewProps = {
  center: [number, number];
  currentPoint: TrackPoint | null;
  gpsAccuracy: number | null;
  route: TrackPoint[];
  straightDistanceMeters: number;
  status: AppStatus;
  totalDistanceMeters: number;
};

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }

  return `${meters.toFixed(0)} m`;
}

function MapController({
  currentPoint,
  route,
  status,
}: Pick<MapViewProps, "currentPoint" | "route" | "status">) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!currentPoint || hasCenteredRef.current) {
      return;
    }

    map.setView([currentPoint.latitude, currentPoint.longitude], 18);
    hasCenteredRef.current = true;
  }, [currentPoint, map]);

  useEffect(() => {
    if (status !== "recording" || !currentPoint) {
      return;
    }

    map.panTo([currentPoint.latitude, currentPoint.longitude], {
      animate: true,
      duration: 0.75,
    });
  }, [currentPoint, map, status]);

  useEffect(() => {
    if (route.length < 2) {
      return;
    }

    map.fitBounds(
      route.map((point) => [point.latitude, point.longitude] as [number, number]),
      {
        padding: [48, 48],
        maxZoom: 18,
      },
    );
  }, [map, route]);

  return null;
}

export default function MapView({
  center,
  currentPoint,
  gpsAccuracy,
  route,
  straightDistanceMeters,
  status,
  totalDistanceMeters,
}: MapViewProps) {
  const routePositions = route.map(
    (point) => [point.latitude, point.longitude] as [number, number],
  );
  const hasOverlayStats = route.length > 0 || gpsAccuracy !== null;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        className="h-full w-full"
        zoom={16}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController currentPoint={currentPoint} route={route} status={status} />

        {currentPoint ? (
          <>
            <Circle
              center={[currentPoint.latitude, currentPoint.longitude]}
              pathOptions={{
                color: "#38bdf8",
                fillColor: "#7dd3fc",
                fillOpacity: 0.18,
                weight: 1,
              }}
              radius={currentPoint.accuracy}
            />
            <CircleMarker
              center={[currentPoint.latitude, currentPoint.longitude]}
              pathOptions={{
                color: "#ffffff",
                fillColor: "#0ea5e9",
                fillOpacity: 1,
                weight: 2,
              }}
              radius={8}
            />
          </>
        ) : null}

        {routePositions.length > 1 ? (
          <Polyline
            pathOptions={{
              color: "#0f172a",
              lineCap: "round",
              lineJoin: "round",
              opacity: 0.95,
              weight: 8,
            }}
            positions={routePositions}
          />
        ) : null}

        {routePositions.length > 1 ? (
          <Polyline
            pathOptions={{
              color: "#22d3ee",
              lineCap: "round",
              lineJoin: "round",
              opacity: 1,
              weight: 4,
            }}
            positions={routePositions}
          />
        ) : null}
      </MapContainer>

      {hasOverlayStats ? (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-[450] flex justify-center px-4">
          <div className="grid w-full max-w-sm grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Walked</p>
              <p className="mt-1 text-lg font-semibold">{formatDistance(totalDistanceMeters)}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Straight</p>
              <p className="mt-1 text-lg font-semibold">
                {formatDistance(straightDistanceMeters)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Accuracy</p>
              <p className="mt-1 text-lg font-semibold">
                {gpsAccuracy === null ? "--" : `${gpsAccuracy.toFixed(0)} m`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Status</p>
              <p className="mt-1 text-lg font-semibold">
                {status[0].toUpperCase()}
                {status.slice(1)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
