import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useCalendarStore } from "@/entities/calendarDay";
import { firstLetterToUpperCase } from "@/shared/lib";
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
  const setObservableDate = useCalendarStore(
    (state) => state.setObservableDate,
  );
  const navigate = useNavigate();
  const isTodaySelected = selectedDate.isSame(dayjs(), "day");

  const handleNavigateToToday = () => {
    const today = dayjs();
    setSelectedDate(today);
    setObservableDate(today);
  };

  return (
    <div className="flex items-start justify-between gap-1 text-center font-bold">
      <div className="flex min-w-0 items-center gap-2.5 max-[480px]:gap-2">
        {navigateBack && (
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft />
          </Button>
        )}
        <div className="text-left text-3xl leading-none max-[480px]:text-2xl">
          {title}
        </div>
        {date && (
          <div className="text-sm text-muted-foreground max-[320px]:text-xs">
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
