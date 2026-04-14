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
        "text-black p-2 bg-transparent border-1 border-black",
      )}
    >
      {children}
    </Button>
  );
};
