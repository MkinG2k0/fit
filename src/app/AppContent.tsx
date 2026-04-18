import { useLocation } from "react-router-dom";
import { AppRoutes } from "./router/routes.tsx";

export const AppContent = () => {
  const { pathname } = useLocation();
  const isOnboarding = pathname === "/onboarding";
  return (
    <div className={isOnboarding ? "" : "p-2"}>
      <AppRoutes />
    </div>
  );
};
