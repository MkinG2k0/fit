import type { AppSettingsSectionDefinition } from "../model/types";
import { APP_SETTINGS_SECTION_IDS } from "./appSettingsSectionRegistry";
import { stripExerciseMediaFromSnapshot } from "./stripExerciseMediaFromSnapshot";

export interface CollectExportableSectionsOptions {
  includeExerciseMedia: boolean;
}

export const collectExportableSections = async (
  definitions: AppSettingsSectionDefinition[],
  options: CollectExportableSectionsOptions,
): Promise<Record<string, unknown>> => {
  const sections: Record<string, unknown> = {};
  for (const definition of definitions) {
    let snapshot = await definition.exportSnapshot();
    if (snapshot !== null && snapshot !== undefined) {
      if (
        !options.includeExerciseMedia &&
        definition.id === APP_SETTINGS_SECTION_IDS.exercises
      ) {
        snapshot = stripExerciseMediaFromSnapshot(snapshot);
      }
      sections[definition.id] = snapshot;
    }
  }
  return sections;
};
