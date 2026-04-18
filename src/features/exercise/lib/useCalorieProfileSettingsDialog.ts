import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useCalorieProfileSettingsDialog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("calorieProfile") !== "1") {
      return;
    }
    setOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("calorieProfile");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return { open, setOpen };
};
