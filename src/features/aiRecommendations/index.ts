export type {
  AiRecommendationPeriod,
  AiRecommendationKind,
} from "./model/types";
export {
  AI_RECOMMENDATION_PERIODS,
  AI_RECOMMENDATION_KINDS,
  getPeriodLabel,
  getKindLabel,
} from "./model/types";
export { filterDaysByPeriod } from "./lib/filterDaysByPeriod";
export { buildWorkoutLogText } from "./lib/buildWorkoutLogText";
export { getSystemPrompt, buildUserPrompt } from "./lib/prompts";
export { AiRecommendationsPanel } from "./ui/AiRecommendationsPanel";
