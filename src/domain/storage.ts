import { detectLocale, isLocale, isThemeChoice } from './prefs.ts'
import type { Place, Prefs, StoredAlarm, ToneId } from './types.ts'
import { TONE_IDS } from './types.ts'

const PLACES_KEY = 'ya-llegue.places'
const ALARM_KEY = 'ya-llegue.alarm'
const PREFS_KEY = 'ya-llegue.prefs'

const DEFAULT_PREFS: Prefs = { radiusM: 250, tone: 'campana', vibrate: true, locale: 'es', theme: 'system' }

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or a full disk: the trip still runs in memory */
  }
}

function isPlace(value: unknown): value is Place {
  if (!value || typeof value !== 'object') return false
  const place = value as Place
  return typeof place.id === 'string' && typeof place.name === 'string' && Number.isFinite(place.lat) && Number.isFinite(place.lng)
}

function isTone(value: unknown): value is ToneId {
  return typeof value === 'string' && (TONE_IDS as readonly string[]).includes(value)
}

export function loadPlaces(): Place[] {
  const value = readJson(PLACES_KEY)
  if (!Array.isArray(value)) return []
  return value.filter(isPlace)
}

export function savePlaces(places: Place[]) {
  writeJson(PLACES_KEY, places)
}

export function loadAlarm(): StoredAlarm | null {
  const value = readJson(ALARM_KEY)
  if (!value || typeof value !== 'object') return null
  const alarm = value as StoredAlarm
  if (!isPlace(alarm.place) || !isTone(alarm.tone) || !Number.isFinite(alarm.radiusM)) return null
  return {
    place: alarm.place,
    radiusM: alarm.radiusM,
    tone: alarm.tone,
    vibrate: Boolean(alarm.vibrate),
    suppressUntilExit: Boolean(alarm.suppressUntilExit),
    ringing: Boolean(alarm.ringing),
  }
}

export function saveAlarm(alarm: StoredAlarm | null) {
  writeJson(ALARM_KEY, alarm)
}

export function loadPrefs(): Prefs {
  const value = readJson(PREFS_KEY)
  const language = typeof navigator === 'undefined' ? undefined : navigator.language
  if (!value || typeof value !== 'object') return { ...DEFAULT_PREFS, locale: detectLocale(language) }
  const prefs = value as Prefs
  return {
    radiusM: Number.isFinite(prefs.radiusM) ? prefs.radiusM : DEFAULT_PREFS.radiusM,
    tone: isTone(prefs.tone) ? prefs.tone : DEFAULT_PREFS.tone,
    vibrate: typeof prefs.vibrate === 'boolean' ? prefs.vibrate : DEFAULT_PREFS.vibrate,
    locale: isLocale(prefs.locale) ? prefs.locale : detectLocale(language),
    theme: isThemeChoice(prefs.theme) ? prefs.theme : DEFAULT_PREFS.theme,
  }
}

export function savePrefs(prefs: Prefs) {
  writeJson(PREFS_KEY, prefs)
}
