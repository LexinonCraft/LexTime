import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { ConfirmationModal } from '@/components/ModalView'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettings, useSettingsActions } from '@/hooks/useSettings'
import { languages } from '@/lib/i18n'
import { formatRelativeTime } from '@/lib/time'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const settings = useSettings()
  const { reseedDatabase, updateLanguage } = useSettingsActions()
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

  function onLanguageChange(value: string) {
    updateLanguage(value)
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
    <Card>
      <CardHeader>
        <CardTitle>Language</CardTitle>
        <CardDescription>Change the language of the application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={settings.language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
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
