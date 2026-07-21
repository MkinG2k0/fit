import { useState } from "react";
import { Share2 } from "lucide-react";
import type { AnalyticsPeriod } from "@/entities/analytics";
import type { CalendarDay } from "@/entities/calendarDay";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { ShareStatsSheet } from "./ShareStatsSheet";

interface ShareStatsButtonProps {
  days: Record<string, CalendarDay>;
  defaultPeriod: AnalyticsPeriod;
}

export const ShareStatsButton = ({
  days,
  defaultPeriod,
}: ShareStatsButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Share2 aria-hidden="true" />
        Поделиться
      </Button>
      <ShareStatsSheet
        open={open}
        onOpenChange={setOpen}
        days={days}
        defaultPeriod={defaultPeriod}
      />
    </>
  );
};
