import { appStorage } from "@/shared/lib/storageAdapter";
import type {
  AiRecommendationKind,
  AiRecommendationPeriod,
} from "../model/types";

const STORAGE_KEY = "ai-recommendations";

export interface SavedRecommendation {
  content: string;
  updatedAt: string;
}

type RecommendationsMap = Partial<Record<string, SavedRecommendation>>;

export const recommendationStorageKey = (
  period: AiRecommendationPeriod,
  kind: AiRecommendationKind,
): string => `${period}:${kind}`;

const isCompositeKey = (key: string): boolean => key.includes(":");

export const loadSavedRecommendation = async (
  period: AiRecommendationPeriod,
  kind: AiRecommendationKind,
): Promise<SavedRecommendation | null> => {
  const map = await appStorage.getJson<RecommendationsMap>(STORAGE_KEY);
  if (!map) {
    return null;
  }

  const key = recommendationStorageKey(period, kind);
  if (!isCompositeKey(key)) {
    return null;
  }

  const saved = map[key];
  if (!saved?.content?.trim()) {
    return null;
  }
  return saved;
};

export const saveRecommendation = async (
  period: AiRecommendationPeriod,
  kind: AiRecommendationKind,
  content: string,
): Promise<void> => {
  const map =
    (await appStorage.getJson<RecommendationsMap>(STORAGE_KEY)) ?? {};
  const key = recommendationStorageKey(period, kind);
  map[key] = {
    content,
    updatedAt: new Date().toISOString(),
  };
  await appStorage.setJson(STORAGE_KEY, map);
};
