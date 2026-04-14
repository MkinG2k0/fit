import {
  APP_SETTINGS_BUNDLE_KIND,
  APP_SETTINGS_FORMAT_VERSION,
} from "./constants";
import type { AppSettingsBundle } from "./types";
import { isPlainObject } from "./guards";

export const buildAppSettingsBundle = (
  sections: Record<string, unknown>,
): AppSettingsBundle => ({
  kind: APP_SETTINGS_BUNDLE_KIND,
  formatVersion: APP_SETTINGS_FORMAT_VERSION,
  exportedAt: new Date().toISOString(),
  sections,
});

export type ParseAppSettingsBundleResult =
  | { ok: true; bundle: AppSettingsBundle }
  | { ok: false; errorMessage: string };

export const parseAppSettingsBundleJson = (
  raw: string,
): ParseAppSettingsBundleResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errorMessage: "Файл не является корректным JSON." };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, errorMessage: "Ожидался объект настроек." };
  }

  if (parsed.kind !== APP_SETTINGS_BUNDLE_KIND) {
    return {
      ok: false,
      errorMessage: "Неизвестный тип файла. Нужен экспорт настроек MagFitDiary.",
    };
  }

  if (typeof parsed.formatVersion !== "number") {
    return { ok: false, errorMessage: "В файле отсутствует версия формата." };
  }

  if (parsed.formatVersion > APP_SETTINGS_FORMAT_VERSION) {
    return {
      ok: false,
      errorMessage:
        "Файл создан в более новой версии приложения. Обновите приложение и повторите импорт.",
    };
  }

  if (!isPlainObject(parsed.sections)) {
    return { ok: false, errorMessage: "В файле нет разделов настроек." };
  }

  const exportedAt =
    typeof parsed.exportedAt === "string"
      ? parsed.exportedAt
      : new Date().toISOString();

  return {
    ok: true,
    bundle: {
      kind: APP_SETTINGS_BUNDLE_KIND,
      formatVersion: parsed.formatVersion,
      exportedAt,
      sections: parsed.sections,
    },
  };
};

export const stringifyAppSettingsBundle = (bundle: AppSettingsBundle): string =>
  `${JSON.stringify(bundle, null, 2)}\n`;
