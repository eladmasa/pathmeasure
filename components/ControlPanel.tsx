"use client";

import type {
  AppStatus,
  PanelMode,
  SavedSegment,
  UnitSystem,
} from "@/lib/types";
import { formatDistance } from "@/lib/distance";

type SegmentStats = {
  straightDistanceMeters: number;
  totalDistanceMeters: number;
};

type ControlPanelProps = {
  activeStats: SegmentStats;
  errorMessage: string | null;
  hasAnyRoute: boolean;
  savedSegments: SavedSegment[];
  signalMessage: string | null;
  status: AppStatus;
  panelMode: PanelMode;
  unitSystem: UnitSystem;
  onClear: () => void;
  onDetails: () => void;
  onHide: () => void;
  onShow: () => void;
  onStart: () => void;
  onStop: () => void;
};

export default function ControlPanel({
  activeStats,
  errorMessage,
  hasAnyRoute,
  savedSegments,
  signalMessage,
  status,
  panelMode,
  unitSystem,
  onClear,
  onDetails,
  onHide,
  onShow,
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

  const showStart = status !== "recording";

  return (
    <section className="rounded-[24px] border border-white/15 bg-slate-950/84 p-3 text-slate-50 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
      <p className="mb-3 text-center text-sm font-medium text-slate-200">
        {showStart ? "Walk straight and start recording" : "Recording segment"}
      </p>

      <button
        className={`w-full rounded-2xl px-4 py-4 text-base font-semibold transition active:scale-[0.99] ${
          showStart ? "bg-cyan-400 text-slate-950" : "bg-rose-400 text-slate-950"
        }`}
        type="button"
        onClick={showStart ? onStart : onStop}
      >
        {showStart ? "Start Recording" : "Stop"}
      </button>

      {panelMode === "compact" && (savedSegments.length > 0 || errorMessage || signalMessage) ? (
        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <button
            className="text-cyan-200"
            type="button"
            onClick={onDetails}
          >
            Details
          </button>
        </div>
      ) : null}

      {panelMode === "details" ? (
        <>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200 uppercase">
              Segment Details
            </p>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              type="button"
              onClick={onHide}
            >
              Close
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-xs text-slate-300">Current walked</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatDistance(activeStats.totalDistanceMeters, unitSystem)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/6 p-3">
              <p className="text-xs text-slate-300">Current straight</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatDistance(activeStats.straightDistanceMeters, unitSystem)}
              </p>
            </div>
          </div>

          {savedSegments.length > 0 ? (
            <div className="mt-3 rounded-2xl bg-white/6 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200 uppercase">
                  Saved Segments
                </p>
                <p className="text-xs text-slate-300">{savedSegments.length} total</p>
              </div>
              <div className="space-y-2">
                {savedSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{segment.label}</p>
                      <p className="text-xs text-slate-300">{segment.points.length} points</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-300">Walked</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDistance(segment.totalDistanceMeters, unitSystem)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-300">Straight</p>
                      <p className="text-sm font-semibold text-white">
                        {formatDistance(segment.straightDistanceMeters, unitSystem)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

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

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hasAnyRoute ? (
              <button
                className="rounded-2xl border border-white/15 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-50 transition active:scale-[0.99]"
                type="button"
                onClick={onClear}
              >
                Clear All
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
