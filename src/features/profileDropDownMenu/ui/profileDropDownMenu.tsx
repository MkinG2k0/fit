import { Menu, ScrollText, Timer as TimerIcon } from "lucide-react";
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full relative right-5">
        <div className="grid gap-2">
          <div
            onClick={() => {
              navigate("/timer");
            }}
            className="flex flex-row items-center gap-4"
          >
            <TimerIcon />
            <div>Таймер</div>
          </div>
          <Separator />
          <div
            onClick={() => {
              navigate("/exercises/");
            }}
            className="flex flex-row items-center gap-4"
          >
            <ScrollText />
            <div>Список упражнений</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
