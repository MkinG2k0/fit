export const MAX_SET_DURATION_SEC = 300;
export const DEFAULT_SET_DURATION_SEC = 60;

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
  const endTime = now;
  let startTime: Date;

  if (previousSetEndTime) {
    startTime = previousSetEndTime;
  } else {
    startTime = new Date(endTime.getTime() - defaultDurationSec * 1000);
  }

  const durationSec = (endTime.getTime() - startTime.getTime()) / 1000;
  if (durationSec > MAX_SET_DURATION_SEC) {
    startTime = new Date(endTime.getTime() - MAX_SET_DURATION_SEC * 1000);
  }

  return { startTime, endTime };
};
