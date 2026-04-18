import { HealthMetricsView } from "@/features/healthMetrics";
import { Header } from "@/widgets/header";

export const ActivityPage = () => {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <Header title="Активность" navigateBack />
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto grid min-w-0 gap-3 pb-3">
          <HealthMetricsView />
        </div>
      </div>
    </div>
  );
};
