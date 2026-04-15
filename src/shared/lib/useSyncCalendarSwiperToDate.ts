import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import type dayjs from "dayjs";
import type { Swiper as SwiperType } from "swiper/types";
import type { daysArray } from "@/entities/calendarDay";

const DEFAULT_SYNC_ANIMATION_MS = 300;
const RESET_POSITION_ANIMATION_MS = 0;
const DEFER_TO_NEXT_TICK_MS = 0;

interface UseSyncCalendarSwiperToDateParams {
  selectedDate: dayjs.Dayjs;
  slides: daysArray[];
  setSlides: Dispatch<SetStateAction<daysArray[]>>;
  swiperRef: MutableRefObject<{ swiper: SwiperType } | null>;
  preloadCount: number;
  getTargetStart: (date: dayjs.Dayjs) => dayjs.Dayjs;
  buildSlidesAroundTarget: (targetStart: dayjs.Dayjs) => daysArray[];
  syncAnimationMs?: number;
}

export const useSyncCalendarSwiperToDate = ({
  selectedDate,
  slides,
  setSlides,
  swiperRef,
  preloadCount,
  getTargetStart,
  buildSlidesAroundTarget,
  syncAnimationMs = DEFAULT_SYNC_ANIMATION_MS,
}: UseSyncCalendarSwiperToDateParams) => {
  useEffect(() => {
    const targetStart = getTargetStart(selectedDate);
    const targetIndex = slides.findIndex((slide) =>
      slide.start.isSame(targetStart, "day"),
    );

    if (targetIndex !== -1) {
      swiperRef.current?.swiper?.slideTo(targetIndex, syncAnimationMs);
      return;
    }

    const nextSlides = buildSlidesAroundTarget(targetStart);
    setSlides(nextSlides);

    setTimeout(() => {
      swiperRef.current?.swiper?.slideTo(
        preloadCount,
        RESET_POSITION_ANIMATION_MS,
      );
    }, DEFER_TO_NEXT_TICK_MS);
  }, [
    buildSlidesAroundTarget,
    getTargetStart,
    preloadCount,
    selectedDate,
    setSlides,
    slides,
    swiperRef,
    syncAnimationMs,
  ]);
};
