import type { PropsWithChildren } from "react";
import { cn } from "@/shared/ui/lib/utils";

interface AnalyticsSectionTitleProps extends PropsWithChildren {
  className?: string;
  subtitle?: string;
}

export const AnalyticsSectionTitle = ({
  className,
  subtitle,
  children,
}: AnalyticsSectionTitleProps) => {
  return (
    <header className={cn("mb-3", className)}>
      <h3 className="text-base font-semibold text-foreground">{children}</h3>
      {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
    </header>
  );
};
