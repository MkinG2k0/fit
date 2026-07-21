import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const BASE64_CHUNK_SIZE = 0x8000;
const REVOKE_OBJECT_URL_DELAY_MS = 1000;
const CANCELLED_ERROR_TOKENS = ["cancel", "canceled", "cancelled"];

export type SharePngResult =
  | "native-share"
  | "native-cancelled"
  | "web-share"
  | "browser-download";

const blobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + BASE64_CHUNK_SIZE),
    );
  }

  return btoa(binary);
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

const shareInNativeApp = async (
  filename: string,
  blob: Blob,
): Promise<SharePngResult> => {
  const data = await blobToBase64(blob);
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data,
    directory: Directory.Cache,
  });

  try {
    await Share.share({
      title: "Fit",
      url: uri,
      dialogTitle: "Поделиться статистикой",
    });
    return "native-share";
  } catch (error) {
    if (isShareCancelledError(error)) {
      return "native-cancelled";
    }
    throw error;
  }
};

const downloadInBrowser = (filename: string, blob: Blob): void => {
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

export const sharePngFile = async (
  filename: string,
  blob: Blob,
): Promise<SharePngResult> => {
  if (Capacitor.isNativePlatform()) {
    return shareInNativeApp(filename, blob);
  }

  const file = new File([blob], filename, { type: "image/png" });
  if (
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] })
  ) {
    await navigator.share({ files: [file], title: "Fit" });
    return "web-share";
  }

  downloadInBrowser(filename, blob);
  return "browser-download";
};
