import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import { AppRoutes } from "./router/routes.tsx";
import { registerServiceWorker } from "./providers/pwa/register.ts";

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>,
);
