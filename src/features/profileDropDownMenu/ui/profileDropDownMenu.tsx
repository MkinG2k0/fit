import {
  Activity,
  ChartColumnBig,
  Cog,
  House,
  Menu,
  Ruler,
  ScrollText,
  Timer as TimerIcon,
} from "lucide-react";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
            onClick={() => handleNavigate("/")}
          >
            <House />
            <div>Главная</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/timer")}
          >
            <TimerIcon />
            <div>Таймер</div>
          </Button>

          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/body-metrics")}
          >
            <Ruler />
            <div>Параметры тела</div>
          </Button>

          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/activity")}
          >
            <Activity />
            <div>Активность</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/exercises")}
          >
            <ScrollText />
            <div>Список упражнений</div>
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/analytics")}
          >
            <ChartColumnBig />
            <div>Аналитика</div>
          </Button>

          <Separator />
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => handleNavigate("/settings")}
          >
            <Cog />
            <div>Настройки</div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
