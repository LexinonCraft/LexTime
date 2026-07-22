import { db } from "@/lib/db"
import { ensureSeedData } from "@/lib/seed"

let bootstrapPromise: Promise<void> | null = null

export function ensureDbInitialized(): Promise<void> {
  if (bootstrapPromise) {
    return bootstrapPromise
  }

  bootstrapPromise = (async () => {
    await db.open()

    const existingSettings = await db.settings.get("app")
    if (!existingSettings) {
      await db.settings.put({
        id: "app",
        autoSeededAt: null,
        updatedAt: Date.now(),
      })
    }

    await ensureSeedData()

    const settings = await db.settings.get("app")
    if (settings && !settings.autoSeededAt) {
      await db.settings.put({
        ...settings,
        autoSeededAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  })()

  return bootstrapPromise
}
