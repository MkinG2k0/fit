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
const ActivityPage = lazy(() =>
  import("@/pages/ActivityPage").then((m) => ({ default: m.ActivityPage })),
);
const OnboardingPage = lazy(() =>
  import("@/pages/OnboardingPage").then((m) => ({ default: m.OnboardingPage })),
);
const BulkCreateExercisesPage = lazy(() =>
  import("@/pages/BulkCreateExercisesPage").then((m) => ({
    default: m.BulkCreateExercisesPage,
  })),
);
const CreateExercisePage = lazy(() =>
  import("@/pages/CreateExercisePage").then((m) => ({
    default: m.CreateExercisePage,
  })),
);
const CreatePresetPage = lazy(() =>
  import("@/pages/CreatePresetPage").then((m) => ({
    default: m.CreatePresetPage,
  })),
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
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
        path="/exercises/bulk-create"
        element={
          <ProtectedRoute>
            <BulkCreateExercisesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/create"
        element={
          <ProtectedRoute>
            <CreateExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exercises/edit"
        element={
          <ProtectedRoute>
            <CreateExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presets/create"
        element={
          <ProtectedRoute>
            <CreatePresetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presets/edit"
        element={
          <ProtectedRoute>
            <CreatePresetPage />
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
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        }
      />
      <Route path="/health" element={<Navigate to="/activity" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return children;
};

