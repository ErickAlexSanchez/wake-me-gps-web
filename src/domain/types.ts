export const TONE_IDS = ['campana', 'pulso', 'sirena', 'clasico'] as const

export type ToneId = (typeof TONE_IDS)[number]

export interface Place {
  id: string
  name: string
  lat: number
  lng: number
}

export interface AlarmFix {
  lat: number
  lng: number
  accuracy: number | null
  speed: number | null
  timestamp: number
}

export interface StoredAlarm {
  place: Place
  radiusM: number
  tone: ToneId
  vibrate: boolean
  suppressUntilExit: boolean
  ringing: boolean
}

export const LOCALES = ['es', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const THEME_CHOICES = ['system', 'light', 'dark'] as const

export type ThemeChoice = (typeof THEME_CHOICES)[number]

export type ResolvedTheme = 'light' | 'dark'

export interface Prefs {
  radiusM: number
  tone: ToneId
  vibrate: boolean
  locale: Locale
  theme: ThemeChoice
}

export const RADIUS_PRESETS = [100, 250, 500, 1000] as const

export const MIN_RADIUS_M = 50
export const MAX_RADIUS_M = 5000
