import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandAppStorage } from "@/shared/lib/storageAdapter";

export const DEFAULT_REST_DURATION_SEC = 120;
export const MIN_REST_DURATION_SEC = 15;
export const MAX_REST_DURATION_SEC = 600;

export const clampRestDurationSec = (sec: number): number => {
  if (!Number.isFinite(sec)) {
    return DEFAULT_REST_DURATION_SEC;
  }
  return Math.min(
    MAX_REST_DURATION_SEC,
    Math.max(MIN_REST_DURATION_SEC, Math.round(sec)),
  );
};

interface RestTimerState {
  /** Epoch ms deadline — source of truth for remaining time. */
  endAt: number | null;
  /** Configured length for manual /timer start (default 2 min). */
  durationSec: number;
  /** Remaining ms while paused (endAt is cleared on pause). */
  pausedRemainingMs: number | null;
}

interface RestTimerActions {
  start: (durationSec: number) => void;
  clear: () => void;
  setDurationSec: (sec: number) => void;
  pause: () => void;
  resume: () => void;
}

export const useRestTimerStore = create<RestTimerState & RestTimerActions>()(
  persist(
    (set, get) => ({
      endAt: null,
      durationSec: DEFAULT_REST_DURATION_SEC,
      pausedRemainingMs: null,

      start: (durationSec) => {
        const sec = clampRestDurationSec(durationSec);
        set({
          endAt: Date.now() + sec * 1000,
          durationSec: sec,
          pausedRemainingMs: null,
        });
      },

      clear: () => {
        set({ endAt: null, pausedRemainingMs: null });
      },

      setDurationSec: (sec) => {
        set({ durationSec: clampRestDurationSec(sec) });
      },

      pause: () => {
        const { endAt } = get();
        if (endAt == null) {
          return;
        }
        set({
          pausedRemainingMs: Math.max(0, endAt - Date.now()),
          endAt: null,
        });
      },

      resume: () => {
        const { pausedRemainingMs } = get();
        if (pausedRemainingMs == null || pausedRemainingMs <= 0) {
          set({ pausedRemainingMs: null });
          return;
        }
        set({
          endAt: Date.now() + pausedRemainingMs,
          pausedRemainingMs: null,
        });
      },
    }),
    {
      name: "rest-timer",
      storage: createJSONStorage(() => zustandAppStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<RestTimerState>;
        let endAt =
          typeof p.endAt === "number" && Number.isFinite(p.endAt)
            ? p.endAt
            : null;
        let pausedRemainingMs =
          typeof p.pausedRemainingMs === "number" &&
          Number.isFinite(p.pausedRemainingMs)
            ? Math.max(0, p.pausedRemainingMs)
            : null;

        if (endAt != null && endAt <= Date.now()) {
          endAt = null;
        }
        if (pausedRemainingMs != null && pausedRemainingMs <= 0) {
          pausedRemainingMs = null;
        }

        return {
          ...current,
          ...p,
          endAt,
          pausedRemainingMs,
          durationSec:
            typeof p.durationSec === "number" && Number.isFinite(p.durationSec)
              ? clampRestDurationSec(p.durationSec)
              : current.durationSec,
        };
      },
    },
  ),
);

export const getRemainingMs = (
  endAt: number | null,
  pausedRemainingMs: number | null = null,
): number => {
  if (endAt != null) {
    return Math.max(0, endAt - Date.now());
  }
  if (pausedRemainingMs != null) {
    return Math.max(0, pausedRemainingMs);
  }
  return 0;
};
