export interface AppSettingsSectionDefinition {
  /** Стабильный ключ внутри JSON-файла экспорта */
  id: string;
  title: string;
  description: string;
  exportSnapshot: () => unknown | null;
  importSnapshot: (payload: unknown) => void;
}
