import type { AppSettingsSectionDefinition } from "../model/types";

export const collectExportableSections = (
  definitions: AppSettingsSectionDefinition[],
): Record<string, unknown> => {
  const sections: Record<string, unknown> = {};
  for (const definition of definitions) {
    const snapshot = definition.exportSnapshot();
    if (snapshot !== null && snapshot !== undefined) {
      sections[definition.id] = snapshot;
    }
  }
  return sections;
};
