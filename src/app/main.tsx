import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import { registerServiceWorker } from "./providers/pwa/register.ts";
import { ThemeProvider } from "./providers/theme";
import { WorkoutHealthPermissionInit } from "./providers/WorkoutHealthPermissionInit";
import { OnboardingNavigation } from "./providers/OnboardingNavigation";
import { AppContent } from "./AppContent.tsx";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <WorkoutHealthPermissionInit />
      <OnboardingNavigation />
      <AppContent />
    </BrowserRouter>
  </ThemeProvider>,
);
