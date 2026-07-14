import { AiRecommendationsPanel } from "@/features/aiRecommendations";

export const AiRecommendationsPage = () => {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2.5 pb-4 sm:gap-4 sm:px-3">
      <p className="text-sm text-muted-foreground">
        Рекомендации по весу и повторам на основе вашего журнала тренировок
      </p>
      <AiRecommendationsPanel />
    </div>
  );
};
