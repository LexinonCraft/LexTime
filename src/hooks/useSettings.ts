import { useLiveQuery } from "dexie-react-hooks"

import { getSettings, reseedDatabase } from "@/data/repositories/settingsRepository"
import type { AppSettings } from "@/types/domain"

const fallbackSettings: AppSettings = {
  id: "app",
  autoSeededAt: null,
  updatedAt: 0,
}

export function useSettings(): AppSettings {
  return useLiveQuery(getSettings, []) ?? fallbackSettings
}

export function useSettingsActions() {
  return {
    reseedDatabase,
  }
}
