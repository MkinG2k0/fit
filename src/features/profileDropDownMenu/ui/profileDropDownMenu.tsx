import {
  ChartColumnBig,
  Cog,
  Menu,
  ScrollText,
  Timer as TimerIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/shadCNComponents/ui/button.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/shadCNComponents/ui/popover.tsx";
import { Separator } from "@/shared/ui/shadCNComponents/ui/separator.tsx";

export const ProfileDropDownMenu = () => {
  const navigate = useNavigate();
  const handleTimerNavigate = () => {
    navigate("/timer");
  };

  const handleExercisesNavigate = () => {
    navigate("/exercises");
  };

  const handleAnalyticsNavigate = () => {
    navigate("/analytics");
  };

  const handleSettingsNavigate = () => {
    navigate("/settings");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full relative right-5">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleTimerNavigate}
          >
            <TimerIcon />
            <div>Таймер</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleExercisesNavigate}
          >
            <ScrollText />
            <div>Список упражнений</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleAnalyticsNavigate}
          >
            <ChartColumnBig />
            <div>Аналитика</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleSettingsNavigate}
          >
            <Cog />
            <div>Настройки</div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
