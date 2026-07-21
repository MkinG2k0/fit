import type { CalendarDay } from "@/entities/calendarDay";
import type { RingGoalsSettings } from "@/entities/user";
import { createChatCompletion } from "@/shared/api";
import { buildRingGoalsHistorySummary } from "./buildRingGoalsHistorySummary";
import {
  buildRingGoalsUserPrompt,
  getRingGoalsSystemPrompt,
} from "./buildRingGoalsAiPrompts";
import { parseRingGoalsAiResponse } from "./parseRingGoalsAiResponse";

export const suggestRingGoalsFromHistory = async (
  days: Record<string, CalendarDay>,
): Promise<RingGoalsSettings> => {
  const summary = buildRingGoalsHistorySummary(days);
  const response = await createChatCompletion([
    { role: "system", content: getRingGoalsSystemPrompt() },
    { role: "user", content: buildRingGoalsUserPrompt(summary) },
  ]);

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Шлюз вернул пустой ответ. Попробуйте ещё раз.");
  }

  return parseRingGoalsAiResponse(content);
};
