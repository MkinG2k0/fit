import { APP_SETTINGS_BUNDLE_KIND } from "./constants";

export interface AppSettingsBundle {
  kind: typeof APP_SETTINGS_BUNDLE_KIND;
  formatVersion: number;
  exportedAt: string;
  sections: Record<string, unknown>;
}
