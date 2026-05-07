"use client";

import type { AppStatus, GeoPermission } from "@/lib/types";

type ControlPanelProps = {
  errorMessage: string | null;
  gpsAccuracy: number | null;
  permission: GeoPermission;
  pointsRecorded: number;
  signalMessage: string | null;
  status: AppStatus;
  straightDistanceMeters: number;
  totalDistanceMeters: number;
  onClear: () => void;
  onStart: () => void;
  onStop: () => void;
};

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }

  return `${meters.toFixed(0)} m`;
}

function formatAccuracy(accuracy: number | null): string {
  if (accuracy === null) {
    return "--";
  }

  return `${accuracy.toFixed(0)} m`;
}

function statusTone(status: AppStatus): string {
  if (status === "recording") {
    return "text-emerald-300";
  }

  if (status === "stopped") {
    return "text-amber-200";
  }

  return "text-slate-200";
}

export default function ControlPanel({
  errorMessage,
  gpsAccuracy,
  permission,
  pointsRecorded,
  signalMessage,
  status,
  straightDistanceMeters,
  totalDistanceMeters,
  onClear,
  onStart,
  onStop,
}: ControlPanelProps) {
  const showStart = status !== "recording";
  const permissionMessage =
    permission === "denied"
      ? "Location permission denied"
      : permission === "granted"
        ? "Location access enabled"
        : "Location permission pending";

  return (
    <section className="rounded-[28px] border border-white/15 bg-slate-950/84 p-4 text-slate-50 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200 uppercase">
            GPS Walk Tracker
          </p>
          <p className={`mt-1 text-lg font-semibold ${statusTone(status)}`}>
            Status: {status[0].toUpperCase()}
            {status.slice(1)}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {permissionMessage}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/6 p-3">
          <p className="text-xs text-slate-300">Walked distance</p>
          <p className="mt-1 text-2xl font-semibold">{formatDistance(totalDistanceMeters)}</p>
        </div>
        <div className="rounded-2xl bg-white/6 p-3">
          <p className="text-xs text-slate-300">Straight distance</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatDistance(straightDistanceMeters)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/6 p-3">
          <p className="text-xs text-slate-300">GPS accuracy</p>
          <p className="mt-1 text-xl font-semibold">{formatAccuracy(gpsAccuracy)}</p>
        </div>
        <div className="rounded-2xl bg-white/6 p-3">
          <p className="text-xs text-slate-300">Points recorded</p>
          <p className="mt-1 text-xl font-semibold">{pointsRecorded}</p>
        </div>
      </div>

      {signalMessage ? (
        <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
          {signalMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {showStart ? (
          <button
            className="col-span-2 rounded-2xl bg-cyan-400 px-4 py-4 text-base font-semibold text-slate-950 transition active:scale-[0.99]"
            type="button"
            onClick={onStart}
          >
            Start Recording
          </button>
        ) : (
          <button
            className="col-span-2 rounded-2xl bg-rose-400 px-4 py-4 text-base font-semibold text-slate-950 transition active:scale-[0.99]"
            type="button"
            onClick={onStop}
          >
            Stop Recording
          </button>
        )}
        <button
          className="rounded-2xl border border-white/15 bg-white/6 px-4 py-4 text-base font-semibold text-slate-50 transition active:scale-[0.99]"
          type="button"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        Secure context required. Use localhost during development and HTTPS in production.
      </p>
    </section>
  );
}
