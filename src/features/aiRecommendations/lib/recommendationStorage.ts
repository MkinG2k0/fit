import { appStorage } from "@/shared/lib/storageAdapter";
import type { AiRecommendationPeriod } from "../model/types";

const STORAGE_KEY = "ai-recommendations";

export interface SavedRecommendation {
  content: string;
  updatedAt: string;
}

type RecommendationsMap = Partial<
  Record<AiRecommendationPeriod, SavedRecommendation>
>;

export const loadSavedRecommendation = async (
  period: AiRecommendationPeriod,
): Promise<SavedRecommendation | null> => {
  const map = await appStorage.getJson<RecommendationsMap>(STORAGE_KEY);
  const saved = map?.[period];
  if (!saved?.content?.trim()) {
    return null;
  }
  return saved;
};

export const saveRecommendation = async (
  period: AiRecommendationPeriod,
  content: string,
): Promise<void> => {
  const map =
    (await appStorage.getJson<RecommendationsMap>(STORAGE_KEY)) ?? {};
  map[period] = {
    content,
    updatedAt: new Date().toISOString(),
  };
  await appStorage.setJson(STORAGE_KEY, map);
};
