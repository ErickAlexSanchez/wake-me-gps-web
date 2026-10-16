import { leadSeconds } from './geo.ts'

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '-'
  if (meters < 1000) return `${Math.round(meters)} m`
  const digits = meters < 10_000 ? 1 : 0
  return `${(meters / 1000).toFixed(digits)} km`
}

export type Lead =
  | { kind: 'still' }
  | { kind: 'seconds'; seconds: number }
  | { kind: 'minutes'; minutes: number }

/** How early the radius is at the current speed. Copy lives in the catalog. */
export function lead(radiusM: number, speedMps: number | null): Lead {
  const seconds = leadSeconds(radiusM, speedMps)
  if (seconds == null) return { kind: 'still' }
  if (seconds < 90) return { kind: 'seconds', seconds: Math.max(1, Math.round(seconds)) }
  return { kind: 'minutes', minutes: Math.max(1, Math.round(seconds / 60)) }
}
