import { AppRoutes } from "./router/routes.tsx";
import { AppLayout } from "./layout/AppLayout.tsx";

export const AppContent = () => {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  );
};
