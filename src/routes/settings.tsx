import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings, useSettingsActions } from '@/hooks/useSettings'
import { formatRelativeTime } from '@/lib/time'
import { useState } from 'react'
import ModalView, { ConfirmationModal } from '@/components/ModalView'

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
    <ConfirmationModal
      prompt="Are you sure you want to reset and reseed the local database?"
      buttons={[
        { label: "Reset and reseed", variant: "destructive", onClick: onReseed },
        { label: "Cancel", onClick: () => setShowReseedModal(false) }
      ]}
      show={showReseedModal}
    />
  </div>
}
