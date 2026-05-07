import type { TrackPoint } from "@/lib/types";

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function getDistanceMeters(from: TrackPoint, to: TrackPoint): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_METERS * angularDistance;
}

export function getTotalDistanceMeters(points: TrackPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let index = 1; index < points.length; index += 1) {
    totalDistance += getDistanceMeters(points[index - 1], points[index]);
  }

  return totalDistance;
}

export function getStraightDistanceMeters(points: TrackPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  return getDistanceMeters(points[0], points[points.length - 1]);
}
