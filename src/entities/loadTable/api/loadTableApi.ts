import { zustandAppStorage } from "@/shared/lib/storageAdapter";

const LOAD_TABLE_STORAGE_KEY = "load-table-store";

export const loadTableStorageApi = zustandAppStorage;

export const getLoadTableStorageKey = () => LOAD_TABLE_STORAGE_KEY;
