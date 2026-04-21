import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const REVOKE_OBJECT_URL_DELAY_MS = 1000;
const CANCELLED_ERROR_TOKENS = ["cancel", "canceled", "cancelled"];
const NATIVE_EXPORT_DIRECTORIES: readonly Directory[] = [
  Directory.Documents,
  Directory.Cache,
];

export type DownloadTextFileResult =
  | "browser-download"
  | "native-share"
  | "native-cancelled";

const downloadInBrowser = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, REVOKE_OBJECT_URL_DELAY_MS);
};

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    return typeof message === "string" ? message : "";
  }
  return "";
};

const isShareCancelledError = (error: unknown): boolean => {
  const message = extractErrorMessage(error).toLowerCase();
  return CANCELLED_ERROR_TOKENS.some((token) => message.includes(token));
};

const writeFileForSharing = async (filename: string, content: string) => {
  let lastError: unknown = null;
  for (const directory of NATIVE_EXPORT_DIRECTORIES) {
    try {
      return await Filesystem.writeFile({
        path: filename,
        data: content,
        directory,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw (
    lastError ?? new Error("Не удалось сохранить файл в доступную директорию устройства.")
  );
};

const shareInNativeApp = async (
  filename: string,
  content: string,
): Promise<DownloadTextFileResult> => {
  const { uri } = await writeFileForSharing(filename, content);

  try {
    await Share.share({
      title: "Экспорт настроек",
      text: "JSON-файл с резервной копией настроек приложения.",
      url: uri,
      dialogTitle: "Поделиться файлом настроек",
    });
    return "native-share";
  } catch (error) {
    if (isShareCancelledError(error)) {
      return "native-cancelled";
    }
    throw error;
  }
};

export const downloadTextFile = async (
  filename: string,
  content: string,
  mimeType: string,
): Promise<DownloadTextFileResult> => {
  if (Capacitor.isNativePlatform()) {
    return shareInNativeApp(filename, content);
  }

  downloadInBrowser(filename, content, mimeType);
  return "browser-download";
};
