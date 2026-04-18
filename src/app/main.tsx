import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import { AppRoutes } from "./router/routes.tsx";
import { registerServiceWorker } from "./providers/pwa/register.ts";
import { ThemeProvider } from "./providers/theme";
import { WorkoutHealthPermissionInit } from "./providers/WorkoutHealthPermissionInit";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BrowserRouter>
      <WorkoutHealthPermissionInit />
      <div className={"p-2"}>
        <AppRoutes />
      </div>
    </BrowserRouter>
  </ThemeProvider>,
);
