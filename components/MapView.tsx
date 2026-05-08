"use client";

import { Fragment, useEffect, useRef } from "react";
import L from "leaflet";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import { formatDistance, getDistanceMeters } from "@/lib/distance";
import type {
  AppStatus,
  MapStyle,
  SavedSegment,
  TrackPoint,
  UnitSystem,
} from "@/lib/types";

type MapViewProps = {
  center: [number, number];
  currentPoint: TrackPoint | null;
  currentRoute: TrackPoint[];
  mapStyle: MapStyle;
  savedSegments: SavedSegment[];
  straightDistanceMeters: number;
  status: AppStatus;
  totalDistanceMeters: number;
  unitSystem: UnitSystem;
};

const SEGMENT_COLORS = ["#22d3ee", "#34d399", "#f59e0b", "#f472b6", "#a78bfa", "#fb7185"];

function getSegmentLabelPoint(points: TrackPoint[]): [number, number] | null {
  if (points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    return [points[0].latitude, points[0].longitude];
  }

  let totalDistance = 0;

  for (let index = 1; index < points.length; index += 1) {
    totalDistance += getDistanceMeters(points[index - 1], points[index]);
  }

  if (totalDistance === 0) {
    const midpoint = points[Math.floor(points.length / 2)];
    return [midpoint.latitude, midpoint.longitude];
  }

  const halfwayDistance = totalDistance / 2;
  let traversedDistance = 0;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segmentDistance = getDistanceMeters(start, end);

    if (traversedDistance + segmentDistance >= halfwayDistance) {
      const remainingDistance = halfwayDistance - traversedDistance;
      const ratio = segmentDistance === 0 ? 0 : remainingDistance / segmentDistance;
      const latitude = start.latitude + (end.latitude - start.latitude) * ratio;
      const longitude = start.longitude + (end.longitude - start.longitude) * ratio;

      return [latitude, longitude];
    }

    traversedDistance += segmentDistance;
  }

  const lastPoint = points[points.length - 1];
  return [lastPoint.latitude, lastPoint.longitude];
}

function createDistanceIcon(distanceMeters: number, unitSystem: UnitSystem) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background: rgba(2, 6, 23, 0.82);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 999px;
        color: white;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 10px;
        box-shadow: 0 10px 24px rgba(2, 6, 23, 0.28);
        white-space: nowrap;
        backdrop-filter: blur(8px);
      ">
        ${formatDistance(distanceMeters, unitSystem)}
      </div>
    `,
    iconAnchor: [0, 0],
  });
}

function MapController({
  currentPoint,
  currentRoute,
  savedSegments,
  status,
}: Pick<MapViewProps, "currentPoint" | "currentRoute" | "savedSegments" | "status">) {
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
    const allPositions = [
      ...savedSegments.flatMap((segment) =>
        segment.points.map((point) => [point.latitude, point.longitude] as [number, number]),
      ),
      ...currentRoute.map((point) => [point.latitude, point.longitude] as [number, number]),
    ];

    if (allPositions.length < 2) {
      return;
    }

    map.fitBounds(allPositions, {
      padding: [48, 48],
      maxZoom: 18,
    });
  }, [currentRoute, map, savedSegments]);

  return null;
}

export default function MapView({
  center,
  currentPoint,
  currentRoute,
  mapStyle,
  savedSegments,
  straightDistanceMeters,
  status,
  totalDistanceMeters,
  unitSystem,
}: MapViewProps) {
  const currentRoutePositions = currentRoute.map(
    (point) => [point.latitude, point.longitude] as [number, number],
  );
  const hasOverlayStats =
    status === "recording" || savedSegments.length > 0 || currentRoute.length > 0;
  const waitingForGps =
    status === "recording" && currentRoute.length === 0;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        className="h-full w-full"
        zoom={16}
        zoomControl={false}
      >
        {mapStyle === "street" ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <MapController
          currentPoint={currentPoint}
          currentRoute={currentRoute}
          savedSegments={savedSegments}
          status={status}
        />

        {savedSegments.map((segment, index) => {
          const positions = segment.points.map(
            (point) => [point.latitude, point.longitude] as [number, number],
          );
          const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
          const labelPoint = getSegmentLabelPoint(segment.points);

          if (positions.length < 2) {
            return null;
          }

          return (
            <Fragment key={segment.id}>
              <Polyline
                key={`${segment.id}-line`}
                pathOptions={{
                  color,
                  lineCap: "round",
                  lineJoin: "round",
                  opacity: 0.9,
                  weight: 5,
                }}
                positions={positions}
              />
              {labelPoint ? (
                <Marker
                  key={`${segment.id}-label`}
                  icon={createDistanceIcon(segment.totalDistanceMeters, unitSystem)}
                  interactive={false}
                  position={labelPoint}
                />
              ) : null}
            </Fragment>
          );
        })}

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

        {currentRoutePositions.length > 1 ? (
          <Polyline
            pathOptions={{
              color: "#0f172a",
              lineCap: "round",
              lineJoin: "round",
              opacity: 0.95,
              weight: 8,
            }}
            positions={currentRoutePositions}
          />
        ) : null}

        {currentRoutePositions.length > 1 ? (
          <Polyline
            pathOptions={{
              color: "#22d3ee",
              lineCap: "round",
              lineJoin: "round",
              opacity: 1,
              weight: 4,
            }}
            positions={currentRoutePositions}
          />
        ) : null}
      </MapContainer>

      {hasOverlayStats ? (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-[450] flex justify-center px-4">
          <div className="grid w-full max-w-sm grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Straight</p>
              <p className="mt-1 text-lg font-semibold">
                {formatDistance(straightDistanceMeters, unitSystem)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/78 px-3 py-2 text-white shadow-lg backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Walked</p>
              <p className="mt-1 text-lg font-semibold">
                {formatDistance(totalDistanceMeters, unitSystem)}
              </p>
            </div>
            {waitingForGps ? (
              <div className="col-span-2 rounded-2xl border border-amber-300/20 bg-slate-950/78 px-3 py-2 text-center text-sm text-amber-100 shadow-lg backdrop-blur">
                Waiting for GPS...
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
