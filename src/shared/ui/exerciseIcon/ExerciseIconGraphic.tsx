import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib";
import { EXERCISE_ICON_SVG_BY_ID, type ExerciseIconGraphicId } from "./svgHtml";

const exerciseIconGraphicRootClassName =
  "inline-flex shrink-0 text-muted-foreground [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:max-h-full";

export type { ExerciseIconGraphicId };

export interface ExerciseIconGraphicProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  iconId: ExerciseIconGraphicId;
}

export const ExerciseIconGraphic = ({
  iconId,
  className,
  ...rest
}: ExerciseIconGraphicProps) => {
  const markup = EXERCISE_ICON_SVG_BY_ID[iconId];

  return (
    <span
      {...rest}
      className={cn(exerciseIconGraphicRootClassName, className)}
      aria-hidden
      // Разметка только из локальных SVG в репозитории (без пользовательского HTML).
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml -- trusted static SVG
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};
