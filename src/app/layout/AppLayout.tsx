import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/widgets";

interface AppLayoutProps {
  children: ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Тренировки",
  "/onboarding": "Добро пожаловать",
  "/exercises": "Упражнения",
  "/timer": "Таймер",
  "/analytics": "Аналитика",
  "/settings": "Настройки",
  "/body-metrics": "Параметры тела",
  "/activity": "Активность",
  "/health": "Активность",
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const isHomePage = pathname !== "/";
  const pageTitle = PAGE_TITLES[pathname] ?? "Тренировки";

  return (
    <div className="flex h-dvh flex-col overflow-x-hidden overflow-y-auto gap-2 p-2 bg-background text-foreground pb-4">
      <Header date={!isHomePage} title={pageTitle} navigateBack={isHomePage} />
      {children}
    </div>
  );
};
