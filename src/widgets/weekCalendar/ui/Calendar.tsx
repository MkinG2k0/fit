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
import styles from "./WeekCalendar.module.css";

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
    <div>
      <motion.div
        drag="y"
        dragDirectionLock
        onDragEnd={(_, info) => calendarPullHandler(info)}
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 800, bounceDamping: 25 }}
        dragElastic={0.15}
        whileDrag={{ scale: 1.05 }}
        className={"bg-white z-20"}
      >
        <div
          className={`${styles.calendar} relative overflow-hidden transition-all duration-1000 ${
            calendarExpanded ? "h-[380px]" : "h-[105px]"
          }`}
        >
          <AnimatePresence mode="wait">
            {!calendarExpanded ? (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={"absolute inset-0"}
              >
                <WeekSwiper {...props} />
              </motion.div>
            ) : (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
                className={"absolute inset-0"}
              >
                <MonthSwiper {...props} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={"flex justify-center relative bottom-8"}>
          <GripHorizontal />
        </div>
      </motion.div>
    </div>
  );
};
