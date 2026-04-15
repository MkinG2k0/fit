import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useCalendarStore } from "@/entities/calendarDay";
import { firstLetterToUpperCase } from "@/shared/lib";
import style from "./Header.module.css";
import { ProfileDropDownMenu } from "@/features/profileDropDownMenu";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";

interface HeaderProps {
  date?: boolean;
  navigateBack?: boolean;
  title: string;
}

export const Header = ({ date, title, navigateBack }: HeaderProps) => {
  const observableDate = useCalendarStore((state) => state.observableDate);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const setObservableDate = useCalendarStore((state) => state.setObservableDate);
  const navigate = useNavigate();
  const isTodaySelected = selectedDate.isSame(dayjs(), "day");

  const handleNavigateToToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    setObservableDate(today);
  };

  return (
    <div className={style.header}>
      <div className={style.title}>
        {navigateBack && (
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft />
          </Button>
        )}
        <div className={style.pageName}>{title}</div>
        {date && (
          <div className={style.month}>
            {firstLetterToUpperCase(observableDate.format("MMMM YYYY"))}
          </div>
        )}
        {date && !isTodaySelected && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleNavigateToToday}
          >
            Сегодня
          </Button>
        )}
      </div>
      <ProfileDropDownMenu />
    </div>
  );
};
