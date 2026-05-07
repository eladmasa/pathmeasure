"use client";

import type { AppStatus, GeoPermission } from "@/lib/types";

type PanelMode = "compact" | "details" | "hidden";

type ControlPanelProps = {
  errorMessage: string | null;
  gpsAccuracy: number | null;
  hasRoute: boolean;
  permission: GeoPermission;
  pointsRecorded: number;
  signalMessage: string | null;
  status: AppStatus;
  straightDistanceMeters: number;
  totalDistanceMeters: number;
  panelMode: PanelMode;
  onAskPermission: () => void;
  onClear: () => void;
  onHide: () => void;
  onShow: () => void;
  onShowDetails: () => void;
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

function getStatusLabel(status: AppStatus): string {
  return status[0].toUpperCase() + status.slice(1);
}

export default function ControlPanel({
  errorMessage,
  gpsAccuracy,
  hasRoute,
  permission,
  pointsRecorded,
  signalMessage,
  status,
  straightDistanceMeters,
  totalDistanceMeters,
  panelMode,
  onAskPermission,
  onClear,
  onHide,
  onShow,
  onShowDetails,
  onStart,
  onStop,
}: ControlPanelProps) {
  if (panelMode === "hidden") {
    return (
      <button
        className="rounded-full border border-white/15 bg-slate-950/84 px-4 py-3 text-sm font-semibold text-slate-50 shadow-xl backdrop-blur-xl"
        type="button"
        onClick={onShow}
      >
        Show Controls
      </button>
    );
  }

  const hasStats = hasRoute || gpsAccuracy !== null;
  const showStart = status !== "recording";
  const shouldShowPermissionButton = permission !== "granted" && !hasRoute;

  return (
    <section className="rounded-[24px] border border-white/15 bg-slate-950/84 p-3 text-slate-50 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {showStart ? (
          <button
            className="flex-1 rounded-2xl bg-cyan-400 px-4 py-4 text-base font-semibold text-slate-950 transition active:scale-[0.99]"
            type="button"
            onClick={onStart}
          >
            Start Recording
          </button>
        ) : (
          <button
            className="flex-1 rounded-2xl bg-rose-400 px-4 py-4 text-base font-semibold text-slate-950 transition active:scale-[0.99]"
            type="button"
            onClick={onStop}
          >
            Stop Recording
          </button>
        )}

        {shouldShowPermissionButton ? (
          <button
            className="rounded-2xl border border-white/15 bg-white/6 px-4 py-4 text-sm font-semibold text-slate-50 transition active:scale-[0.99]"
            type="button"
            onClick={onAskPermission}
          >
            Enable GPS
          </button>
        ) : null}

        {(hasStats || errorMessage || signalMessage) && panelMode === "compact" ? (
          <button
            className="rounded-2xl border border-white/15 bg-white/6 px-4 py-4 text-sm font-semibold text-slate-50 transition active:scale-[0.99]"
            type="button"
            onClick={onShowDetails}
          >
            Details
          </button>
        ) : null}
      </div>

      {panelMode === "compact" && hasStats ? (
        <div className="mt-2 flex items-center gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200"
            type="button"
            onClick={onHide}
          >
            Hide Panel
          </button>
          {hasRoute ? (
            <button
              className="rounded-xl border border-white/15 bg-white/6 px-3 py-2 text-xs font-semibold text-slate-200"
              type="button"
              onClick={onClear}
            >
              Clear Route
            </button>
          ) : null}
        </div>
      ) : null}

      {panelMode === "details" ? (
        <>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200 uppercase">
                GPS Walk Tracker
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-100">
                Status: {getStatusLabel(status)}
              </p>
            </div>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              type="button"
              onClick={onHide}
            >
              Hide
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
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

          <div className="mt-3 flex items-center gap-2">
            {hasRoute ? (
              <button
                className="rounded-2xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-50 transition active:scale-[0.99]"
                type="button"
                onClick={onClear}
              >
                Clear
              </button>
            ) : null}
            <button
              className="rounded-2xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-50 transition active:scale-[0.99]"
              type="button"
              onClick={onShow}
            >
              Minimize
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-400">
            Secure context required. Use localhost during development and HTTPS in production.
          </p>
        </>
      ) : null}
    </section>
  );
}
