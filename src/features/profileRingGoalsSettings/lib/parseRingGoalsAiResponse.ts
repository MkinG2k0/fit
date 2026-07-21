import {
  MIN_RING_GOAL_VALUE,
  type RingGoalsSettings,
} from "@/entities/user";

const EXTRACT_ERROR =
  "Не удалось разобрать ответ ИИ. Попробуйте ещё раз.";

const extractJsonPayload = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(EXTRACT_ERROR);
  }

  const tryParse = (text: string): unknown | null => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  };

  const direct = tryParse(trimmed);
  if (direct !== null) {
    return direct;
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    const fenced = tryParse(fenceMatch[1].trim());
    if (fenced !== null) {
      return fenced;
    }
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    const objectSlice = tryParse(trimmed.slice(objectStart, objectEnd + 1));
    if (objectSlice !== null) {
      return objectSlice;
    }
  }

  throw new Error(EXTRACT_ERROR);
};

const parseGoalInteger = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    if (Number.isSafeInteger(rounded) && rounded >= MIN_RING_GOAL_VALUE) {
      return rounded;
    }
    return null;
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    if (Number.isSafeInteger(parsed) && parsed >= MIN_RING_GOAL_VALUE) {
      return parsed;
    }
  }
  return null;
};

export const parseRingGoalsAiResponse = (raw: string): RingGoalsSettings => {
  const payload = extractJsonPayload(raw);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(EXTRACT_ERROR);
  }
  const record = payload as { fullSetCount?: unknown; fullVolume?: unknown };
  const fullSetCount = parseGoalInteger(record.fullSetCount);
  const fullVolume = parseGoalInteger(record.fullVolume);
  if (fullSetCount === null || fullVolume === null) {
    throw new Error(EXTRACT_ERROR);
  }
  return { fullSetCount, fullVolume };
};
