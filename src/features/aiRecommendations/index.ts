export type { AiRecommendationPeriod } from "./model/types";
export {
  AI_RECOMMENDATION_PERIODS,
  getPeriodLabel,
} from "./model/types";
export { filterDaysByPeriod } from "./lib/filterDaysByPeriod";
export { buildWorkoutLogText } from "./lib/buildWorkoutLogText";
export { getSystemPrompt, buildUserPrompt } from "./lib/prompts";
export { AiRecommendationsPanel } from "./ui/AiRecommendationsPanel";
