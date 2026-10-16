import { createContext, use } from 'react'
import type { AlarmFix, Locale, Place, Prefs, StoredAlarm, ThemeChoice, ToneId } from '../domain/types.ts'

export interface AlarmContextValue {
  places: Place[]
  draft: Place | null
  prefs: Prefs
  alarm: StoredAlarm | null
  fix: AlarmFix | null
  phase: 'idle' | 'trip' | 'ringing'
  busy: boolean
  errorCode: string | null
  confirmInside: boolean
  distanceM: number | null
  setDraft: (place: Place | null) => void
  setRadius: (radiusM: number) => void
  setTone: (tone: ToneId) => void
  setVibrate: (vibrate: boolean) => void
  setLocale: (locale: Locale) => void
  setTheme: (theme: ThemeChoice) => void
  saveDraft: () => void
  removePlace: (id: string) => void
  locate: () => Promise<void>
  arm: (suppressUntilExit: boolean) => Promise<void>
  dismissConfirm: () => void
  endAlarm: () => Promise<void>
}

export const AlarmContext = createContext<AlarmContextValue | null>(null)

export function useAlarm(): AlarmContextValue {
  const value = use(AlarmContext)
  if (!value) throw new Error('useAlarm must be used within AlarmProvider')
  return value
}
