import { type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { RestTimerExpiryWatcher } from "@/features/timer";
import { Header } from "@/widgets";

interface AppLayoutProps {
  children: ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "Тренировки",
  "/onboarding": "Добро пожаловать",
  "/exercises": "Упражнения",
  "/exercises/create": "Создание упражнения",
  "/exercises/edit": "Редактирование упражнения",
  "/exercises/bulk-create": "Массовое создание упражнений",
  "/presets/create": "Создание пресета",
  "/presets/edit": "Редактирование пресета",
  "/timer": "Таймер",
  "/analytics": "Аналитика",
  "/ai-recommendations": "AI рекомендации",
  "/news": "Новости",
  "/settings": "Настройки",
  "/body-metrics": "Параметры тела",
  "/load-table": "Таблица нагрузок",
  "/activity": "Активность",
  "/health": "Активность",
};

const resolvePageTitle = (pathname: string) => {
  if (pathname.startsWith("/load-table/")) {
    return "Таблица нагрузок";
  }
  return PAGE_TITLES[pathname] ?? "Тренировки";
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { pathname } = useLocation();
  const isHomePage = pathname !== "/";
  const pageTitle = resolvePageTitle(pathname);

  return (
    <div
      className="flex h-dvh min-h-dvh flex-col overflow-x-hidden overflow-y-auto gap-2 bg-background text-foreground
    mx-auto max-w-5xl
    pt-[max(0.75rem,env(safe-area-inset-top,0px))]
    pr-[max(0.5rem,env(safe-area-inset-right,0px))]
    pb-[max(1rem,env(safe-area-inset-bottom,0px))]
    pl-[max(0.5rem,env(safe-area-inset-left,0px))]"
    >
      <RestTimerExpiryWatcher />
      <Header date={!isHomePage} title={pageTitle} navigateBack={isHomePage} />
      {children}
    </div>
  );
};
