import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useSettings } from '@/hooks/useSettings'

export function LanguageObserver() {
  const settings = useSettings()
  const { i18n } = useTranslation()

  useEffect(() => {
    i18n.changeLanguage(settings.language)
  }, [settings.language, i18n])

  return null
}