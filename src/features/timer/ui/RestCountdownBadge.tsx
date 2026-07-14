import { useTimer as useLibTimer } from "react-timer-hook";
import { useEffect, useRef } from "react";
import { useRestTimerStore } from "../slice/restTimerStore";

const formatMmSs = (minutes: number, seconds: number): string =>
  `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

/**
 * Live rest countdown for workout summary. Hidden when no active deadline.
 */
export const RestCountdownBadge = () => {
  const endAt = useRestTimerStore((s) => s.endAt);
  const pausedRemainingMs = useRestTimerStore((s) => s.pausedRemainingMs);
  const restartRef = useRef<(expiry: Date, autoStart?: boolean) => void>(
    () => undefined,
  );
  const pauseLibRef = useRef<() => void>(() => undefined);

  const initialExpiry =
    endAt != null
      ? new Date(endAt)
      : pausedRemainingMs != null
        ? new Date(Date.now() + pausedRemainingMs)
        : new Date(Date.now() + 1000);

  const { minutes, seconds, restart, pause } = useLibTimer({
    expiryTimestamp: initialExpiry,
    autoStart: endAt != null,
  });

  restartRef.current = restart;
  pauseLibRef.current = pause;

  useEffect(() => {
    if (endAt != null) {
      restartRef.current(new Date(endAt), true);
      return;
    }
    if (pausedRemainingMs != null && pausedRemainingMs > 0) {
      restartRef.current(new Date(Date.now() + pausedRemainingMs), false);
      pauseLibRef.current();
    }
  }, [endAt, pausedRemainingMs]);

  if (endAt == null && pausedRemainingMs == null) {
    return null;
  }

  const remainingSec =
    endAt != null
      ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      : Math.max(0, Math.ceil((pausedRemainingMs ?? 0) / 1000));

  if (remainingSec <= 0 && endAt == null) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1"
      aria-label={`Отдых ${formatMmSs(minutes, seconds)}`}
    >
      <span className="text-[10px] font-medium text-muted-foreground">
        Отдых
      </span>
      <span className="font-numeric text-sm font-bold leading-none text-primary">
        {formatMmSs(minutes, seconds)}
      </span>
    </div>
  );
};
