import { db, resetDatabase } from "@/lib/db"
import { ensureSeedData } from "@/lib/seed"
import type { AppSettings } from "@/types/domain"

export async function getSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("app")

  if (existing) {
    return existing
  }

  const settings: AppSettings = {
    id: "app",
    autoSeededAt: null,
    updatedAt: Date.now(),
    language: "en"
  }

  await db.settings.put(settings)
  return settings
}

export async function reseedDatabase(): Promise<void> {
  await resetDatabase()
  await ensureSeedData()

  await db.settings.put({
    id: "app",
    autoSeededAt: Date.now(),
    updatedAt: Date.now(),
    language: "en"
  })
}

export async function updateLanguage(language: string): Promise<void> {
  await db.settings.update("app", {
    language,
    updatedAt: Date.now()
  })
}
