export interface AiFillSetValues {
  weight: number;
  reps: number;
}

const EXTRACT_ERROR =
  "Не удалось разобрать ответ ИИ. Попробуйте ещё раз.";

const EMPTY_SETS_ERROR =
  "Не удалось разобрать ответ: нет валидных подходов.";

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

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const arraySlice = tryParse(trimmed.slice(arrayStart, arrayEnd + 1));
    if (arraySlice !== null) {
      return arraySlice;
    }
  }

  throw new Error(EXTRACT_ERROR);
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.round(parsed);
    }
  }
  return null;
};

const coerceSetsArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const sets = (payload as { sets?: unknown }).sets;
    if (Array.isArray(sets)) {
      return sets;
    }
  }
  throw new Error(EXTRACT_ERROR);
};

/**
 * Парсит ответ модели в список {weight, reps}.
 * Бросает Error с русским сообщением при битом/пустом результате.
 */
export const parseAiFillSets = (raw: string): AiFillSetValues[] => {
  const payload = extractJsonPayload(raw);
  const items = coerceSetsArray(payload);

  const sets: AiFillSetValues[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const record = item as { weight?: unknown; reps?: unknown };
    const weight = normalizeNumber(record.weight);
    const reps = normalizeNumber(record.reps);
    if (weight === null || reps === null) {
      continue;
    }
    sets.push({ weight, reps });
  }

  if (sets.length === 0) {
    throw new Error(EMPTY_SETS_ERROR);
  }

  return sets;
};
