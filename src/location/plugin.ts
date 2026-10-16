import { registerPlugin } from '@capacitor/core'
import type { LocationAlarmPlugin } from './types.ts'

/**
 * @capacitor/geolocation can read a point, but it does not keep a foreground
 * service or sound over the lock screen. This local plugin does both on Android.
 * The web class is the fallback while the tab stays open.
 */
export const LocationAlarm = registerPlugin<LocationAlarmPlugin>('LocationAlarm', {
  web: () => import('./web.ts').then((module) => new module.LocationAlarmWeb()),
})
