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
    <div
      className="flex h-dvh min-h-dvh flex-col overflow-x-hidden overflow-y-auto gap-2 bg-background text-foreground
    pt-[max(0.75rem,env(safe-area-inset-top,0px))]
    pr-[max(0.5rem,env(safe-area-inset-right,0px))]
    pb-[max(1rem,env(safe-area-inset-bottom,0px))]
    pl-[max(0.5rem,env(safe-area-inset-left,0px))]"
    >
      <Header date={!isHomePage} title={pageTitle} navigateBack={isHomePage} />
      {children}
    </div>
  );
};
