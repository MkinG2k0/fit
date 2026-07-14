import { useCallback, useEffect, useRef } from "react";
import { useTimer as useLibTimer } from "react-timer-hook";
import {
  clampRestDurationSec,
  getRemainingMs,
  useRestTimerStore,
} from "../slice/restTimerStore";
import { playNotificationSound, sendPushNotification } from "./notifications";

const idleExpiry = () => new Date(Date.now() + 60_000);

export const useTimer = () => {
  const endAt = useRestTimerStore((s) => s.endAt);
  const durationSec = useRestTimerStore((s) => s.durationSec);
  const pausedRemainingMs = useRestTimerStore((s) => s.pausedRemainingMs);
  const storeStart = useRestTimerStore((s) => s.start);
  const storeClear = useRestTimerStore((s) => s.clear);
  const storePause = useRestTimerStore((s) => s.pause);
  const storeResume = useRestTimerStore((s) => s.resume);
  const storeSetDurationSec = useRestTimerStore((s) => s.setDurationSec);

  const expireFiredRef = useRef(false);
  const restartRef = useRef<(expiry: Date, autoStart?: boolean) => void>(
    () => undefined,
  );
  const pauseLibRef = useRef<() => void>(() => undefined);

  const handleExpire = useCallback(() => {
    if (expireFiredRef.current) {
      return;
    }
    expireFiredRef.current = true;
    playNotificationSound();
    void sendPushNotification();
    storeClear();
  }, [storeClear]);

  const initialExpiry =
    endAt != null
      ? new Date(endAt)
      : pausedRemainingMs != null
        ? new Date(Date.now() + pausedRemainingMs)
        : idleExpiry();

  const {
    seconds: libSeconds,
    minutes: libMinutes,
    isRunning: libIsRunning,
    pause: pauseLib,
    restart,
  } = useLibTimer({
    expiryTimestamp: initialExpiry,
    autoStart: endAt != null,
    onExpire: handleExpire,
  });

  restartRef.current = restart;
  pauseLibRef.current = pauseLib;

  useEffect(() => {
    if (endAt != null) {
      expireFiredRef.current = false;
      restartRef.current(new Date(endAt), true);
      return;
    }
    if (pausedRemainingMs != null && pausedRemainingMs > 0) {
      restartRef.current(new Date(Date.now() + pausedRemainingMs), false);
      pauseLibRef.current();
      return;
    }
    restartRef.current(idleExpiry(), false);
  }, [endAt, pausedRemainingMs]);

  const isActive = endAt != null || pausedRemainingMs != null;
  const isRunning = endAt != null && libIsRunning;

  const idleMinutes = Math.floor(durationSec / 60);
  const idleSeconds = durationSec % 60;

  const minutes = isActive ? libMinutes : idleMinutes;
  const seconds = isActive ? libSeconds : idleSeconds;
  const initialMinutes = idleMinutes;
  const initialSeconds = idleSeconds;

  const startTimer = useCallback(() => {
    if (endAt != null) {
      storePause();
      pauseLibRef.current();
      return;
    }
    if (pausedRemainingMs != null) {
      storeResume();
      return;
    }
    storeStart(durationSec);
  }, [durationSec, endAt, pausedRemainingMs, storePause, storeResume, storeStart]);

  const resetTimer = useCallback(() => {
    expireFiredRef.current = false;
    storeClear();
    restartRef.current(idleExpiry(), false);
  }, [storeClear]);

  const setTime = useCallback(
    (newMinutes: number, newSeconds: number) => {
      if (endAt != null || pausedRemainingMs != null) {
        return;
      }
      const rawMin = Number.isFinite(newMinutes) ? newMinutes : 0;
      const rawSec = Number.isFinite(newSeconds) ? newSeconds : 0;
      const clampedMinutes = Math.min(Math.max(0, Math.round(rawMin)), 60);
      const clampedSeconds = Math.min(Math.max(0, Math.round(rawSec)), 59);
      storeSetDurationSec(
        clampRestDurationSec(clampedMinutes * 60 + clampedSeconds),
      );
    },
    [endAt, pausedRemainingMs, storeSetDurationSec],
  );

  return {
    minutes,
    seconds,
    initialMinutes,
    initialSeconds,
    isRunning,
    remainingMs: getRemainingMs(endAt, pausedRemainingMs),
    startTimer,
    resetTimer,
    setTime,
  };
};
