import type { AppSettingsBundle } from "@/shared/lib/appSettingsTransfer";
import type { AppSettingsSectionDefinition } from "../model/types";

export interface ApplySectionsResult {
  appliedIds: string[];
  errors: { sectionId: string; message: string }[];
}

export const applySelectedBundleSections = async (
  bundle: AppSettingsBundle,
  selectedIds: ReadonlySet<string>,
  definitions: AppSettingsSectionDefinition[],
): Promise<ApplySectionsResult> => {
  const appliedIds: string[] = [];
  const errors: { sectionId: string; message: string }[] = [];
  const definitionById = new Map(definitions.map((d) => [d.id, d]));

  for (const sectionId of selectedIds) {
    const definition = definitionById.get(sectionId);
    if (!definition) {
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(bundle.sections, sectionId)) {
      errors.push({
        sectionId,
        message: "В файле нет этого раздела.",
      });
      continue;
    }
    try {
      await definition.importSnapshot(bundle.sections[sectionId]);
      appliedIds.push(sectionId);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Не удалось применить раздел.";
      errors.push({ sectionId, message });
    }
  }

  return { appliedIds, errors };
};
