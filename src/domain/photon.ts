import { haversineM } from './geo.ts'
import type { Locale } from './types.ts'

const SHOWN = 6
const CANDIDATES = 10
/** Metro-area focus: about 32 km. Prominence is almost ignored so a local plaza beats a famous namesake abroad. */
const BIAS_ZOOM = '11'
const BIAS_SCALE = '0.1'

export interface PlaceHit {
  name: string
  detail: string
  lat: number
  lng: number
}

export function parsePhoton(payload: unknown): PlaceHit[] {
  if (!payload || typeof payload !== 'object') return []
  const features = (payload as { features?: unknown }).features
  if (!Array.isArray(features)) return []

  const hits: PlaceHit[] = []
  for (const feature of features) {
    if (!feature || typeof feature !== 'object') continue
    const record = feature as {
      geometry?: { coordinates?: unknown }
      properties?: { name?: unknown; street?: unknown; city?: unknown; state?: unknown; country?: unknown }
    }
    const coords = record.geometry?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) continue
    const lng = Number(coords[0])
    const lat = Number(coords[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    const props = record.properties ?? {}
    const name = typeof props.name === 'string' && props.name ? props.name : typeof props.street === 'string' && props.street ? props.street : ''
    const detail = [props.city, props.state, props.country].filter((part): part is string => typeof part === 'string' && part.length > 0).join(', ')
    hits.push({ name, detail, lat, lng })
  }
  return hits
}

export function rankByDistance(hits: PlaceHit[], bias: { lat: number; lng: number } | null): PlaceHit[] {
  if (!bias || hits.length < 2) return hits
  return [...hits].sort(
    (a, b) =>
      haversineM(bias.lat, bias.lng, a.lat, a.lng) - haversineM(bias.lat, bias.lng, b.lat, b.lng),
  )
}

export async function searchPlaces(
  query: string,
  bias: { lat: number; lng: number } | null,
  signal: AbortSignal,
  lang: Locale,
): Promise<PlaceHit[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', bias ? String(CANDIDATES) : String(SHOWN))
  url.searchParams.set('lang', lang === 'en' ? 'en' : 'default')
  if (bias) {
    url.searchParams.set('lat', String(bias.lat))
    url.searchParams.set('lon', String(bias.lng))
    url.searchParams.set('zoom', BIAS_ZOOM)
    url.searchParams.set('location_bias_scale', BIAS_SCALE)
  }
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    const error = new Error('search failed') as Error & { code: string }
    error.code = 'SEARCH_FAILED'
    throw error
  }
  return rankByDistance(parsePhoton(await response.json()), bias).slice(0, SHOWN)
}
