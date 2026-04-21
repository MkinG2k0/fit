export const MAX_SET_DURATION_SEC = 300;
export const DEFAULT_SET_DURATION_SEC = 60;
export const END_TIME_BUFFER_SEC = 15;

export interface SetTimeRange {
  startTime: Date;
  endTime: Date;
}

/**
 * Окно времени подхода для выборки HR. `now` должен совпадать с моментом
 * сохранения `endTime` подхода (один вызов `new Date()` в UI).
 */
export const getSetTimeRange = (
  previousSetEndTime: Date | null,
  defaultDurationSec: number = DEFAULT_SET_DURATION_SEC,
  now: Date = new Date(),
): SetTimeRange => {
  const endTime = new Date(now.getTime() + END_TIME_BUFFER_SEC * 1000);
  let startTime: Date;

  if (
    previousSetEndTime &&
    Number.isFinite(previousSetEndTime.getTime()) &&
    previousSetEndTime.getTime() < endTime.getTime()
  ) {
    startTime = previousSetEndTime;
  } else {
    startTime = new Date(now.getTime() - defaultDurationSec * 1000);
  }

  const durationSec = (endTime.getTime() - startTime.getTime()) / 1000;
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    startTime = new Date(endTime.getTime() - defaultDurationSec * 1000);
  } else if (durationSec > MAX_SET_DURATION_SEC) {
    startTime = new Date(endTime.getTime() - MAX_SET_DURATION_SEC * 1000);
  }

  return { startTime, endTime };
};
