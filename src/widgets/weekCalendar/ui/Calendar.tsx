import { GripHorizontal } from "lucide-react";
import { type PanInfo } from "motion";
import { useState } from "react";
// @ts-ignore
import "swiper/css";
import { motion, AnimatePresence } from "motion/react";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import isoWeek from "dayjs/plugin/isoWeek";
import { useCalendarStore } from "@/entities/calendarDay";
import { MonthSwiper } from "@/features/monthSwiper";
import { WeekSwiper } from "@/features/weekSwiper";
import { cn } from "@/shared/lib";

dayjs.extend(isoWeek);
dayjs.locale("ru");

export const WeekSlider = () => {
  const setObservableDate = useCalendarStore(
    (state) => state.setObservableDate,
  );
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  const props = {
    setObservableDate,
    selectedDate,
  };

  const calendarPullHandler = (info: PanInfo) => {
    if (info.offset.y >= 120) {
      setCalendarExpanded(true);
    } else if (
      info.offset.y < 80 &&
      Math.abs(info.offset.y / info.offset.x) > 1
    ) {
      setCalendarExpanded(false);
    }
  };

  return (
    <motion.div
      drag="y"
      dragDirectionLock
      onDragEnd={(event, info) => {
        void event;
        calendarPullHandler(info);
      }}
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragTransition={{ bounceStiffness: 800, bounceDamping: 25 }}
      dragElastic={0.15}
      className={"z-50 bg-background text-foreground"}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-xl p-2 border border-border bg-card shadow-sm transition-[height] duration-300",
          calendarExpanded ? "h-87.5" : "h-30",
        )}
      >
        <AnimatePresence mode="wait">
          {!calendarExpanded ? (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <WeekSwiper {...props} />
            </motion.div>
          ) : (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeIn" }}
            >
              <MonthSwiper {...props} />
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={
            "absolute bottom-2 w-full flex cursor-pointer justify-center text-muted-foreground"
          }
        >
          <GripHorizontal />
        </div>
      </div>
    </motion.div>
  );
};
