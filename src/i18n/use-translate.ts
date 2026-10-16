import { useCallback } from 'react'
import { useAlarm } from '../state/alarm-context.ts'
import { translate, type MessageKey } from './catalog.ts'

export function useTranslate() {
  const { prefs } = useAlarm()
  return useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(prefs.locale, key, vars),
    [prefs.locale],
  )
}
