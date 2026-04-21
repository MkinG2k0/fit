import { Header } from "@/widgets";
import { BodyMetricsDashboard } from "@/widgets/bodyMetricsDashboard";

export const BodyMetricsPage = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden gap-2 bg-background text-foreground">
      <Header title="Параметры тела" navigateBack />

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto grid w-full max-w-6xl gap-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4">
          <p className="text-sm text-muted-foreground">
            Отслеживайте изменения обхватов и веса от замера к замеру
          </p>
          <BodyMetricsDashboard />
        </div>
      </div>
    </div>
  );
};
