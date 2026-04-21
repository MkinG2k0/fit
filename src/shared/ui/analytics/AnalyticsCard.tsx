import { cva, type VariantProps } from "class-variance-authority";
import type { PropsWithChildren } from "react";
import { cn } from "@/shared/ui/lib/utils";

const analyticsCardVariants = cva(
  "overflow-hidden rounded-xl border px-4 py-4 shadow-sm sm:px-5",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        accent:
          "border-primary/40 bg-card text-foreground shadow-lg shadow-primary/10",
        muted: "border-border bg-muted/40 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface AnalyticsCardProps
  extends PropsWithChildren, VariantProps<typeof analyticsCardVariants> {
  className?: string;
}

export const AnalyticsCard = ({
  children,
  className,
  variant,
}: AnalyticsCardProps) => {
  return (
    <article className={cn(analyticsCardVariants({ variant }), className)}>
      {children}
    </article>
  );
};
