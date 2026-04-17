import { type JSX, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const TimerPage = lazy(() =>
  import("@/pages/TimerPage").then((m) => ({ default: m.TimerPage })),
);
const ExercisePage = lazy(() =>
  import("@/pages/ExercisePage").then((m) => ({ default: m.ExercisePage })),
);
const AnalyticsPage = lazy(() =>
  import("@/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const BodyMetricsPage = lazy(() =>
  import("@/pages/BodyMetricsPage").then((m) => ({
    default: m.BodyMetricsPage,
  })),
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <ExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timer"
        element={
          <ProtectedRoute>
            <TimerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/body-metrics"
        element={
          <ProtectedRoute>
            <BodyMetricsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};

