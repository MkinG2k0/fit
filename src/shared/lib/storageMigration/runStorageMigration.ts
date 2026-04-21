import { localStorageDriver } from "../storageAdapter/localStorageDriver";
import { preferencesDriver } from "../storageAdapter/preferencesDriver";

const STORAGE_MIGRATION_MARKER_KEY = "storage:migration:v1";
const STORAGE_MIGRATION_MARKER_VALUE = "completed";

const shouldSkipMigration = async (): Promise<boolean> => {
  try {
    const marker = await preferencesDriver.getItem(STORAGE_MIGRATION_MARKER_KEY);
    return marker === STORAGE_MIGRATION_MARKER_VALUE;
  } catch {
    return false;
  }
};

export const runStorageMigration = async (): Promise<void> => {
  try {
    if (await shouldSkipMigration()) {
      return;
    }

    const localStorageKeys = await localStorageDriver.keys();
    for (const key of localStorageKeys) {
      const value = await localStorageDriver.getItem(key);
      if (value === null) {
        continue;
      }

      const existingPreferenceValue = await preferencesDriver.getItem(key);
      if (existingPreferenceValue !== null) {
        continue;
      }

      await preferencesDriver.setItem(key, value);
    }

    await preferencesDriver.setItem(
      STORAGE_MIGRATION_MARKER_KEY,
      STORAGE_MIGRATION_MARKER_VALUE,
    );
  } catch {
    return;
  }
};
