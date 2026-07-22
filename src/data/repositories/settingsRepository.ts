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
  })
}
