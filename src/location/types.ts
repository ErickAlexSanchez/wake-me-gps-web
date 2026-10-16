import type { PluginListenerHandle } from '@capacitor/core'
import type { AlarmCopy } from '../i18n/copy.ts'
import type { AlarmFix, ToneId } from '../domain/types.ts'

export interface StartAlarmOptions extends AlarmCopy {
  lat: number
  lng: number
  radiusM: number
  tone: ToneId
  vibrate: boolean
  suppressUntilExit: boolean
}

export interface ShowAlarmOptions extends AlarmCopy {
  tone: ToneId
  vibrate: boolean
}

export interface LocationAlarmPlugin {
  getCurrentPosition(): Promise<AlarmFix>
  start(options: StartAlarmOptions): Promise<void>
  stop(): Promise<void>
  showAlarm(options: ShowAlarmOptions): Promise<void>
  updateCopy(options: AlarmCopy): Promise<void>
  addListener(eventName: 'location', listenerFunc: (fix: AlarmFix) => void): Promise<PluginListenerHandle>
  addListener(eventName: 'arrived', listenerFunc: () => void): Promise<PluginListenerHandle>
  addListener(eventName: 'dismissed', listenerFunc: () => void): Promise<PluginListenerHandle>
  addListener(eventName: 'error', listenerFunc: (error: { code: string }) => void): Promise<PluginListenerHandle>
}
