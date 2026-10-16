export interface WatchState {
  streak: number
  suppress: boolean
}

export interface WatchStep extends WatchState {
  fire: boolean
}

const EARTH_M = 6_371_000
const INSIDE_STREAK = 2

export function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const p1 = (lat1 * Math.PI) / 180
  const p2 = (lat2 * Math.PI) / 180
  const dp = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return 2 * EARTH_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Ignore a fix whose uncertainty is larger than both the radius and 80 m. */
export function fixIsTooCoarse(accuracyM: number | null, radiusM: number): boolean {
  return accuracyM != null && Number.isFinite(accuracyM) && accuracyM > Math.max(radiusM, 80)
}

export function evaluateFix(
  state: WatchState,
  distanceM: number,
  radiusM: number,
  accuracyM: number | null,
): WatchStep {
  if (fixIsTooCoarse(accuracyM, radiusM)) {
    return { streak: state.streak, suppress: state.suppress, fire: false }
  }

  const inside = distanceM <= radiusM
  if (state.suppress) {
    if (!inside) return { streak: 0, suppress: false, fire: false }
    return { streak: 0, suppress: true, fire: false }
  }
  if (!inside) return { streak: 0, suppress: false, fire: false }

  const streak = state.streak + 1
  return { streak, suppress: false, fire: streak >= INSIDE_STREAK }
}

export function leadSeconds(radiusM: number, speedMps: number | null): number | null {
  if (speedMps == null || !Number.isFinite(speedMps) || speedMps < 1) return null
  return radiusM / speedMps
}
