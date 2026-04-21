import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { runStorageMigration } from "@/shared/lib";
import "./styles/index.css";
import { registerServiceWorker } from "./providers/pwa/register.ts";
import { ThemeProvider } from "./providers/theme";
import { WorkoutHealthPermissionInit } from "./providers/WorkoutHealthPermissionInit";
import { WorkoutCaloriesRecalculationInit } from "./providers/WorkoutCaloriesRecalculationInit";
import { OnboardingNavigation } from "./providers/OnboardingNavigation";
import { AppContent } from "./AppContent.tsx";

registerServiceWorker();
void runStorageMigration();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <WorkoutHealthPermissionInit />
      <WorkoutCaloriesRecalculationInit />
      <OnboardingNavigation />
      <AppContent />
    </BrowserRouter>
  </ThemeProvider>,
);
