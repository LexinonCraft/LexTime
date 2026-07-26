import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings, useSettingsActions } from '@/hooks/useSettings'
import { formatRelativeTime } from '@/lib/time'
import { useState } from 'react'
import ModalView from '@/components/ModalView'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const settings = useSettings()
  const { reseedDatabase } = useSettingsActions()
  const [busy, setBusy] = useState(false)

  const [showReseedModal, setShowReseedModal] = useState(false)

  const onReseed = async () => {
    setBusy(true)
    try {
      await reseedDatabase()
    } finally {
      setBusy(false)
    }
  }

  return <div className="p-3 space-y-3">
    <h1 className="text-3xl font-bold mb-5">Settings</h1>
    <Card>
      <CardHeader>
        <CardTitle>Local-first storage</CardTitle>
        <CardDescription>All data is stored in your browser using IndexedDB.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Last seeded: {settings.autoSeededAt ? formatRelativeTime(settings.autoSeededAt) : "never"}
        </p>
        <Button className="w-full" variant="destructive" disabled={busy} onClick={() => setShowReseedModal(true)}>
          {busy ? "Resetting..." : "Reset and reseed local database"}
        </Button>
      </CardContent>
    </Card>
    <ModalView height="small" show={showReseedModal}>
      <div className="p-3 flex flex-col justify-evenly h-full">
        <div className="py-10">
          <p className="text-center font-bold text-xl">Are you sure you want to reset and reseed the local database?</p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <Button variant="destructive" disabled={busy} className="p-5" onClick={onReseed}>
            {busy ? "Resetting..." : "Reset and reseed"}
          </Button>
          <Button variant="secondary" className="p-5" onClick={() => setShowReseedModal(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalView>
  </div>
}
