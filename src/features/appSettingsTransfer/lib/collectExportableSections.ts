import type { AppSettingsSectionDefinition } from "../model/types";

export const collectExportableSections = async (
  definitions: AppSettingsSectionDefinition[],
): Promise<Record<string, unknown>> => {
  const sections: Record<string, unknown> = {};
  for (const definition of definitions) {
    const snapshot = await definition.exportSnapshot();
    if (snapshot !== null && snapshot !== undefined) {
      sections[definition.id] = snapshot;
    }
  }
  return sections;
};
