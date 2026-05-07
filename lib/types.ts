export type AppStatus = "idle" | "recording" | "stopped";

export type GeoPermission = "unknown" | "granted" | "denied";

export type TrackPoint = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type PanelMode = "compact" | "details" | "hidden";
