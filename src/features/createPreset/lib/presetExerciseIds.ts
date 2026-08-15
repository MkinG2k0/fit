export const dedupePreserveOrder = (ids: string[]): string[] => {
  const seen = new Set<string>();
  const uniqueIds: string[] = [];

  for (const id of ids) {
    const trimmedId = id.trim();
    if (!trimmedId || seen.has(trimmedId)) {
      continue;
    }

    seen.add(trimmedId);
    uniqueIds.push(trimmedId);
  }

  return uniqueIds;
};

export const appendUniqueExerciseIds = (
  existing: string[],
  incoming: string[],
): string[] => {
  const uniqueExisting = dedupePreserveOrder(existing);
  const seen = new Set(uniqueExisting);
  const appendedIds: string[] = [];

  for (const id of incoming) {
    const trimmedId = id.trim();
    if (!trimmedId || seen.has(trimmedId)) {
      continue;
    }

    seen.add(trimmedId);
    appendedIds.push(trimmedId);
  }

  return [...uniqueExisting, ...appendedIds];
};
