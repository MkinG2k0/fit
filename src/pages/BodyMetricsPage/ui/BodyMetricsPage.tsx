import { BodyMetricsDashboard } from "@/widgets/bodyMetricsDashboard";

export const BodyMetricsPage = () => {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-3 pb-3 sm:gap-4 sm:px-4 sm:pb-4">
      <p className="text-sm text-muted-foreground">
        Отслеживайте изменения обхватов и веса от замера к замеру
      </p>
      <BodyMetricsDashboard />
    </div>
  );
};
