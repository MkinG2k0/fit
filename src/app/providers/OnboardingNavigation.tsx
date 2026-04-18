import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/entities/user";

export const OnboardingNavigation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onboarding = useUserStore((s) => s.workoutCalorieProfileOnboarding);
  const [hydrated, setHydrated] = useState(() =>
    useUserStore.persist.hasHydrated(),
  );

  useEffect(() => {
    return useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const needsOnboarding = onboarding === "pending";
    if (needsOnboarding && pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (!needsOnboarding && pathname === "/onboarding") {
      navigate("/", { replace: true });
    }
  }, [hydrated, navigate, onboarding, pathname]);

  return null;
};
