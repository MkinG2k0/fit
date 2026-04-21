export interface AppSettingsSectionDefinition {
  /** Стабильный ключ внутри JSON-файла экспорта */
  id: string;
  title: string;
  description: string;
  exportSnapshot: () => Promise<unknown | null>;
  importSnapshot: (payload: unknown) => Promise<void>;
}
