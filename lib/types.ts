export type AppStatus = "idle" | "recording" | "stopped";

export type GeoPermission = "unknown" | "granted" | "denied";

export type TrackPoint = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type PanelMode = "compact" | "details" | "hidden";

export type MapStyle = "street" | "satellite";

export type UnitSystem = "metric" | "us";

export type SavedSegment = {
  id: string;
  label: string;
  points: TrackPoint[];
  totalDistanceMeters: number;
  straightDistanceMeters: number;
  lastAccuracy: number | null;
};
