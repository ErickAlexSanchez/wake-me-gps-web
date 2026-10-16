import { WebPlugin } from '@capacitor/core'
import { evaluateFix, haversineM } from '../domain/geo.ts'
import type { AlarmFix } from '../domain/types.ts'
import type { AlarmCopy } from '../i18n/copy.ts'
import type { LocationAlarmPlugin, ShowAlarmOptions, StartAlarmOptions } from './types.ts'

function toFix(position: GeolocationPosition): AlarmFix {
  const speed = position.coords.speed
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
    speed: speed != null && Number.isFinite(speed) && speed >= 0 ? speed : null,
    timestamp: position.timestamp,
  }
}

function locationError(code: number): Error & { code: string } {
  const mapped = code === 1 ? 'LOCATION_DENIED' : code === 3 ? 'LOCATION_TIMEOUT' : 'LOCATION_UNAVAILABLE'
  const error = new Error('location') as Error & { code: string }
  error.code = mapped
  return error
}

/**
 * Browser watch. It pauses when the tab is hidden or the screen locks.
 * Android uses the native service instead of this class.
 */
export class LocationAlarmWeb extends WebPlugin implements LocationAlarmPlugin {
  private watchId: number | null = null
  private state = { streak: 0, suppress: false }
  private target: StartAlarmOptions | null = null

  async getCurrentPosition(): Promise<AlarmFix> {
    if (!('geolocation' in navigator)) throw locationError(2)
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(toFix(position)),
        (error) => reject(locationError(error.code)),
        { enableHighAccuracy: true, timeout: 20_000, maximumAge: 5_000 },
      )
    })
  }

  async start(options: StartAlarmOptions): Promise<void> {
    this.stopWatch()
    this.target = options
    this.state = { streak: 0, suppress: options.suppressUntilExit }
    if (!('geolocation' in navigator)) {
      this.notifyListeners('error', { code: 'LOCATION_UNAVAILABLE' })
      return
    }
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.onFix(toFix(position)),
      (error) => this.notifyListeners('error', { code: locationError(error.code).code }),
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 20_000 },
    )
  }

  async stop(): Promise<void> {
    this.stopWatch()
    this.target = null
  }

  async showAlarm(_options: ShowAlarmOptions): Promise<void> {
    this.notifyListeners('arrived', {})
  }

  async updateCopy(_options: AlarmCopy): Promise<void> {
    // React already renders the new copy. The browser watch does not keep its own strings.
  }

  private onFix(fix: AlarmFix) {
    const target = this.target
    if (!target) return
    this.notifyListeners('location', fix)
    const distance = haversineM(fix.lat, fix.lng, target.lat, target.lng)
    const next = evaluateFix(this.state, distance, target.radiusM, fix.accuracy)
    this.state = { streak: next.streak, suppress: next.suppress }
    if (!next.fire) return
    this.stopWatch()
    this.notifyListeners('arrived', {})
  }

  private stopWatch() {
    if (this.watchId != null) navigator.geolocation.clearWatch(this.watchId)
    this.watchId = null
  }
}
