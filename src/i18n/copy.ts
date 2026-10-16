import type { ToneId } from '../domain/types.ts'
import type { Lead } from '../domain/format.ts'
import { translate, type Locale, type MessageKey } from './catalog.ts'

export type AlarmCopy = {
  name: string
  tripTitle: string
  arrivedTitle: string
  arrivedStatus: string
  stopLabel: string
}

export function displayPlace(name: string, t: (key: MessageKey) => string): string {
  return name.trim() ? name : t('mapPoint')
}

export function alarmCopy(locale: Locale, placeName: string): AlarmCopy {
  return {
    name: displayPlace(placeName, (key) => translate(locale, key)),
    tripTitle: translate(locale, 'tripTitle'),
    arrivedTitle: translate(locale, 'arrivedTitle'),
    arrivedStatus: translate(locale, 'inside'),
    stopLabel: translate(locale, 'awake'),
  }
}

export const TONE_KEY = {
  campana: 'toneCampana',
  pulso: 'tonePulso',
  sirena: 'toneSirena',
  clasico: 'toneClasico',
} as const satisfies Record<ToneId, MessageKey>

const ERROR_KEYS = {
  LOCATION_DENIED: 'errorDenied',
  LOCATION_TIMEOUT: 'errorTimeout',
  SEARCH_FAILED: 'errorSearch',
  LOCATION_UNAVAILABLE: 'errorUnavailable',
} as const satisfies Record<string, MessageKey>

export function errorKey(code: string | undefined): MessageKey {
  if (code != null && Object.hasOwn(ERROR_KEYS, code)) return ERROR_KEYS[code as keyof typeof ERROR_KEYS]
  return 'errorUnavailable'
}

export function leadText(locale: Locale, fact: Lead): string {
  if (fact.kind === 'still') return translate(locale, 'leadStill')
  if (fact.kind === 'seconds') return translate(locale, 'leadSeconds', { seconds: fact.seconds })
  if (fact.minutes === 1) return translate(locale, 'leadMinute')
  return translate(locale, 'leadMinutes', { minutes: fact.minutes })
}
