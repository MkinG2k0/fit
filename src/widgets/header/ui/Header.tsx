import { ArrowLeft } from "lucide-react";
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
  const navigate = useNavigate();
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
      </div>
      <ProfileDropDownMenu />
    </div>
  );
};
