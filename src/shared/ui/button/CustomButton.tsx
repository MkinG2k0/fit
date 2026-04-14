import type { MouseEventHandler, ReactNode } from "react";
import { Button } from "../shadCNComponents/ui/button.tsx";
import { twMerge } from "tailwind-merge";

interface CustomButtonProps {
  buttonHandler: (event?: MouseEventHandler<HTMLButtonElement>) => void;
  children?: ReactNode;
  classes?: string;
}

export const CustomButton = ({
  buttonHandler,
  children,
  classes,
}: CustomButtonProps) => {
  return (
    <Button
      onClick={() => buttonHandler()}
      className={twMerge(
        classes,
        "p-2 border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
      )}
    >
      {children}
    </Button>
  );
};
