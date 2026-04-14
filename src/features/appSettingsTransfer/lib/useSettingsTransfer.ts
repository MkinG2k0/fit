import { useCallback, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  APP_SETTINGS_EXPORT_FILENAME_PREFIX,
  buildAppSettingsBundle,
  parseAppSettingsBundleJson,
  stringifyAppSettingsBundle,
  type AppSettingsBundle,
} from "@/shared/lib/appSettingsTransfer";
import { applySelectedBundleSections } from "./applySelectedBundleSections";
import { collectExportableSections } from "./collectExportableSections";
import { downloadTextFile } from "./downloadTextFile";
import { getAppSettingsSectionDefinitions } from "./appSettingsSectionRegistry";
import type { AppSettingsSectionDefinition } from "../model/types";

const JSON_FILE_MIME = "application/json;charset=utf-8";
const ISO_DATE_SLICE_LENGTH = 10;

export type StatusMessage =
  | { variant: "success"; text: string }
  | { variant: "error"; text: string };

export const useSettingsTransfer = () => {
  const definitions = useMemo(() => getAppSettingsSectionDefinitions(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingBundle, setPendingBundle] = useState<AppSettingsBundle | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  const handleExport = useCallback(() => {
    const sections = collectExportableSections(definitions);
    if (Object.keys(sections).length === 0) {
      setStatus({
        variant: "error",
        text: "Нечего экспортировать: в браузере ещё нет сохранённых настроек.",
      });
      return;
    }
    const bundle = buildAppSettingsBundle(sections);
    const datePart = bundle.exportedAt.slice(0, ISO_DATE_SLICE_LENGTH);
    const filename = `${APP_SETTINGS_EXPORT_FILENAME_PREFIX}-${datePart}.json`;
    downloadTextFile(filename, stringifyAppSettingsBundle(bundle), JSON_FILE_MIME);
    setStatus({
      variant: "success",
      text: "Файл с настройками сформирован и отправлен в загрузки браузера.",
    });
  }, [definitions]);

  const handlePickImportFile = useCallback(() => {
    clearStatus();
    fileInputRef.current?.click();
  }, [clearStatus]);

  const handleImportFileSelected = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const parsed = parseAppSettingsBundleJson(text);
        if (!parsed.ok) {
          setStatus({ variant: "error", text: parsed.errorMessage });
          return;
        }
        const keysInFile = Object.keys(parsed.bundle.sections);
        const allowed = definitions
          .filter((definition) => keysInFile.includes(definition.id))
          .map((definition) => definition.id);
        if (allowed.length === 0) {
          setStatus({
            variant: "error",
            text: "В файле нет знакомых разделов настроек для этого приложения.",
          });
          return;
        }
        setPendingBundle(parsed.bundle);
        setSelectedSectionIds(new Set(allowed));
        setImportOpen(true);
      };
      reader.onerror = () => {
        setStatus({ variant: "error", text: "Не удалось прочитать выбранный файл." });
      };
      reader.readAsText(file, "utf-8");
    },
    [definitions],
  );

  const handleCloseImport = useCallback(() => {
    setImportOpen(false);
    setPendingBundle(null);
    setSelectedSectionIds(new Set());
  }, []);

  const handleToggleSection = useCallback((sectionId: string, checked: boolean) => {
    setSelectedSectionIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(sectionId);
      } else {
        next.delete(sectionId);
      }
      return next;
    });
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!pendingBundle) {
      return;
    }
    if (selectedSectionIds.size === 0) {
      setStatus({ variant: "error", text: "Отметьте хотя бы один раздел для импорта." });
      return;
    }
    const result = applySelectedBundleSections(
      pendingBundle,
      selectedSectionIds,
      definitions,
    );
    handleCloseImport();
    if (result.errors.length > 0 && result.appliedIds.length === 0) {
      const first = result.errors[0];
      setStatus({
        variant: "error",
        text: `Импорт не выполнен. «${first.sectionId}»: ${first.message}`,
      });
      return;
    }
    if (result.errors.length > 0) {
      const first = result.errors[0];
      setStatus({
        variant: "error",
        text: `Применено разделов: ${result.appliedIds.length}. Ошибка в «${first.sectionId}»: ${first.message}`,
      });
      return;
    }
    setStatus({
      variant: "success",
      text: `Импортировано разделов: ${result.appliedIds.length}.`,
    });
  }, [definitions, handleCloseImport, pendingBundle, selectedSectionIds]);

  const unknownSectionKeys = useMemo(() => {
    if (!pendingBundle) {
      return [];
    }
    const known = new Set(definitions.map((definition) => definition.id));
    return Object.keys(pendingBundle.sections).filter((key) => !known.has(key));
  }, [definitions, pendingBundle]);

  const importableDefinitions = useMemo((): AppSettingsSectionDefinition[] => {
    if (!pendingBundle) {
      return [];
    }
    return definitions.filter((definition) =>
      Object.prototype.hasOwnProperty.call(pendingBundle.sections, definition.id),
    );
  }, [definitions, pendingBundle]);

  return {
    definitions,
    fileInputRef,
    status,
    clearStatus,
    handleExport,
    handlePickImportFile,
    handleImportFileSelected,
    importOpen,
    handleCloseImport,
    pendingBundle,
    selectedSectionIds,
    handleToggleSection,
    handleConfirmImport,
    unknownSectionKeys,
    importableDefinitions,
  };
};
