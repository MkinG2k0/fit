import { toBlob } from "html-to-image";

export const renderShareCardToPng = async (
  element: HTMLElement,
): Promise<Blob> => {
  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });

  if (!blob) {
    throw new Error("Не удалось создать изображение.");
  }

  return blob;
};
