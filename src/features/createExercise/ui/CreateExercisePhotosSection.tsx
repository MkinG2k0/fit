import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface CreateExercisePhotosSectionProps {
  photoDataUrls: string[];
  exerciseName: string;
  photoError: string;
  maxPhotosCount: number;
  onTakePhoto: () => Promise<void>;
  onPickFromGallery: () => Promise<void>;
  onRemovePhoto: (index: number) => void;
}

export const CreateExercisePhotosSection = ({
  photoDataUrls,
  exerciseName,
  photoError,
  maxPhotosCount,
  onTakePhoto,
  onPickFromGallery,
  onRemovePhoto,
}: CreateExercisePhotosSectionProps) => {
  return (
    <div className="flex gap-2 flex-col ">
      <label htmlFor="exercise-photo" className="text-sm font-medium">
        Фото упражнения
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" onClick={onTakePhoto}>
          Сделать фото
        </Button>
        <Button type="button" variant="outline" onClick={onPickFromGallery}>
          Выбрать из галереи
        </Button>
      </div>
      {photoError ? <p className="text-sm text-red-500">{photoError}</p> : null}
      <p className="text-xs text-muted-foreground">
        До {maxPhotosCount} фото, каждое до 10 МБ.
      </p>
      {photoDataUrls.length > 0 ? (
        <div className="space-y-2">
          <Swiper slidesPerView={1} spaceBetween={8} className="w-full">
            {photoDataUrls.map((photoDataUrl, index) => (
              <SwiperSlide key={photoDataUrl}>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Фото {index + 1} из {photoDataUrls.length}
                  </p>
                  <img
                    src={photoDataUrl}
                    alt={`Фото упражнения ${exerciseName || ""} #${index + 1}`}
                    className="h-40 w-full rounded-md border object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => onRemovePhoto(index)}
                  >
                    Удалить
                  </Button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}
    </div>
  );
};
