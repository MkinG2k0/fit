import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";

/** `endDate` в Capgo exclusive — сдвигаем на 1 мс, чтобы включить момент завершения подхода. */
const EXCLUSIVE_END_DATE_SLACK_MS = 1;

/**
 * Запрос чтения пульса для сценария «ккал на подход».
 * Не бросает наружу: на web/iOS/ошибке возвращает false.
 */
export async function ensureWorkoutHeartRateReadAccess(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }
  try {
    const { available } = await Health.isAvailable();
    if (!available) {
      return false;
    }
    const checked = await Health.checkAuthorization({
      read: ["heartRate"],
    });
    if (checked.readAuthorized.includes("heartRate")) {
      return true;
    }
    const granted = await Health.requestAuthorization({
      read: ["heartRate"],
    });
    return granted.readAuthorized.includes("heartRate");
  } catch {
    return false;
  }
}

/**
 * Чтение выборки BPM в окне времени. Пустой массив при ошибке или отсутствии данных.
 */
export async function readHeartRateBpmSamples(
  start: Date,
  end: Date,
): Promise<number[]> {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }
  try {
    const { available } = await Health.isAvailable();
    if (!available) {
      return [];
    }
    const startDate = start.toISOString();
    const endDate = new Date(
      end.getTime() + EXCLUSIVE_END_DATE_SLACK_MS,
    ).toISOString();
    const { samples } = await Health.readSamples({
      dataType: "heartRate",
      startDate,
      endDate,
      limit: 500,
      ascending: true,
    });
    return samples
      .filter((s) => s.dataType === "heartRate" && Number.isFinite(s.value))
      .map((s) => s.value);
  } catch {
    return [];
  }
}
