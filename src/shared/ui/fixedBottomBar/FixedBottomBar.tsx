import type { ReactNode } from "react";
import { cn } from "@shared/lib";

export type FixedBottomBarProps = {
  children: ReactNode;
  className?: string;
};

export const FixedBottomBar = ({
  children,
  className,
}: FixedBottomBarProps) => {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]",
        className,
      )}
    >
      {children}
    </div>
  );
};
