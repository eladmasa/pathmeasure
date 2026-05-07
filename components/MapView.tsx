"use client";

import { useEffect, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";

import type { AppStatus, TrackPoint } from "@/lib/types";

type MapViewProps = {
  center: [number, number];
  currentPoint: TrackPoint | null;
  route: TrackPoint[];
  status: AppStatus;
};

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
  route,
  status,
}: MapViewProps) {
  const routePositions = route.map(
    (point) => [point.latitude, point.longitude] as [number, number],
  );

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
    </div>
  );
}
