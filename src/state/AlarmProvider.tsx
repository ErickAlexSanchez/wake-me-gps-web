import { Capacitor } from '@capacitor/core'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { playTone, primeTone, releaseScreen, reholdScreenIfNeeded, startVibration, stopTone, stopVibration } from '../audio/tones.ts'
import { haversineM } from '../domain/geo.ts'
import { loadAlarm, loadPlaces, loadPrefs, saveAlarm, savePlaces, savePrefs } from '../domain/storage.ts'
import type { AlarmFix, Locale, Place, Prefs, StoredAlarm, ThemeChoice, ToneId } from '../domain/types.ts'
import { MIN_RADIUS_M, MAX_RADIUS_M } from '../domain/types.ts'
import { resolveTheme } from '../domain/prefs.ts'
import { alarmCopy } from '../i18n/copy.ts'
import { translate } from '../i18n/catalog.ts'
import { LocationAlarm } from '../location/plugin.ts'
import type { PluginListenerHandle } from '@capacitor/core'
import { applyDocument } from '../theme/apply.ts'
import { AlarmContext, type AlarmContextValue } from './alarm-context.ts'

function errorCodeOf(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  const code = (error as { code: unknown }).code
  return typeof code === 'string' ? code : undefined
}

function sameSpot(a: Place, b: Place): boolean {
  return Math.abs(a.lat - b.lat) < 0.00005 && Math.abs(a.lng - b.lng) < 0.00005
}

export function AlarmProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>(() => loadPlaces())
  const [draft, setDraft] = useState<Place | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs())
  const [alarm, setAlarm] = useState<StoredAlarm | null>(() => loadAlarm())
  const [fix, setFix] = useState<AlarmFix | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [confirmInside, setConfirmInside] = useState(false)
  const [systemLight, setSystemLight] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches)
  const handles = useRef<PluginListenerHandle[]>([])
  const ending = useRef(false)
  const resumed = useRef(false)

  const clearHandles = useCallback(async () => {
    const current = handles.current
    handles.current = []
    await Promise.all(current.map((handle) => handle.remove()))
  }, [])

  const endAlarm = useCallback(async () => {
    if (ending.current) return
    ending.current = true
    stopTone()
    stopVibration()
    await releaseScreen()
    await clearHandles()
    try {
      await LocationAlarm.stop()
    } catch {
      // The screen already ends the trip. A native stop failure must not trap the user here.
    }
    saveAlarm(null)
    setAlarm(null)
    setConfirmInside(false)
    ending.current = false
  }, [clearHandles])

  const markRinging = useCallback(() => {
    setAlarm((current) => {
      if (!current || current.ringing) return current
      const next = { ...current, ringing: true }
      saveAlarm(next)
      return next
    })
    void releaseScreen()
  }, [])

  const attach = useCallback(async (next: StoredAlarm, locale: Locale) => {
    await clearHandles()
    await LocationAlarm.start({
      lat: next.place.lat,
      lng: next.place.lng,
      radiusM: next.radiusM,
      tone: next.tone,
      vibrate: next.vibrate,
      suppressUntilExit: next.suppressUntilExit,
      ...alarmCopy(locale, next.place.name),
    })
    handles.current = [
      await LocationAlarm.addListener('location', (nextFix) => setFix(nextFix)),
      await LocationAlarm.addListener('arrived', () => markRinging()),
      await LocationAlarm.addListener('dismissed', () => {
        void endAlarm()
      }),
      await LocationAlarm.addListener('error', (payload) => setErrorCode(payload.code)),
    ]
  }, [clearHandles, endAlarm, markRinging])

  useEffect(() => {
    if (resumed.current) return
    resumed.current = true
    const stored = loadAlarm()
    if (!stored) return
    const locale = loadPrefs().locale
    if (stored.ringing) {
      if (Capacitor.isNativePlatform()) {
        void LocationAlarm.showAlarm({
          tone: stored.tone,
          vibrate: stored.vibrate,
          ...alarmCopy(locale, stored.place.name),
        })
      }
      return
    }
    void attach(stored, locale).catch((attachError: unknown) => setErrorCode(errorCodeOf(attachError) ?? 'LOCATION_UNAVAILABLE'))
  }, [attach])

  useEffect(() => {
    if (!alarm || alarm.ringing || Capacitor.isNativePlatform()) return
    void reholdScreenIfNeeded()
    const onVisible = () => {
      void reholdScreenIfNeeded()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [alarm])

  useEffect(() => {
    if (!alarm?.ringing || Capacitor.isNativePlatform()) return
    playTone(alarm.tone)
    if (alarm.vibrate) startVibration()
    return () => {
      stopTone()
      stopVibration()
    }
  }, [alarm])

  useEffect(() => {
    if (!alarm?.ringing || Capacitor.isNativePlatform()) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const body = alarm.place.name.trim() ? alarm.place.name : translate(prefs.locale, 'mapPoint')
    try {
      new Notification(translate(prefs.locale, 'brand'), { body, lang: prefs.locale, tag: 'ya-llegue' })
    } catch {
      // Some browsers only allow notifications from a service worker.
    }
  }, [alarm, prefs.locale])

  useEffect(() => {
    if (prefs.theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => setSystemLight(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [prefs.theme])

  // Apply before children read computed colors, so the map markers match the theme on the same frame.
  applyDocument(prefs.locale, resolveTheme(prefs.theme, systemLight))

  const updatePrefs = useCallback((next: Prefs) => {
    const radiusM = Math.min(MAX_RADIUS_M, Math.max(MIN_RADIUS_M, Math.round(next.radiusM)))
    const stored = { ...next, radiusM }
    setPrefs(stored)
    savePrefs(stored)
  }, [])

  const arm = useCallback(async (suppressUntilExit: boolean) => {
    if (!draft) return
    setErrorCode(null)
    setBusy(true)
    try {
      if (!Capacitor.isNativePlatform()) {
        primeTone(prefs.tone)
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          void Notification.requestPermission()
        }
        await reholdScreenIfNeeded()
      }
      const here = await LocationAlarm.getCurrentPosition()
      setFix(here)
      const distance = haversineM(here.lat, here.lng, draft.lat, draft.lng)
      if (!suppressUntilExit && distance <= prefs.radiusM) {
        setConfirmInside(true)
        return
      }
      const next: StoredAlarm = {
        place: draft,
        radiusM: prefs.radiusM,
        tone: prefs.tone,
        vibrate: prefs.vibrate,
        suppressUntilExit,
        ringing: false,
      }
      saveAlarm(next)
      setAlarm(next)
      setConfirmInside(false)
      await attach(next, prefs.locale)
    } catch (armError: unknown) {
      setErrorCode(errorCodeOf(armError) ?? 'LOCATION_UNAVAILABLE')
    } finally {
      setBusy(false)
    }
  }, [attach, draft, prefs])

  const saveDraft = useCallback(() => {
    if (!draft) return
    setPlaces((current) => {
      if (current.some((place) => sameSpot(place, draft))) return current
      const next = [draft, ...current].slice(0, 12)
      savePlaces(next)
      return next
    })
  }, [draft])

  const removePlace = useCallback((id: string) => {
    setPlaces((current) => {
      const next = current.filter((place) => place.id !== id)
      savePlaces(next)
      return next
    })
  }, [])

  const setLocale = useCallback((locale: Locale) => {
    updatePrefs({ ...prefs, locale })
    if (alarm && Capacitor.isNativePlatform()) {
      void LocationAlarm.updateCopy(alarmCopy(locale, alarm.place.name))
    }
  }, [alarm, prefs, updatePrefs])

  const setTheme = useCallback((theme: ThemeChoice) => {
    updatePrefs({ ...prefs, theme })
  }, [prefs, updatePrefs])

  const locate = useCallback(async () => {
    try {
      const here = await LocationAlarm.getCurrentPosition()
      setFix(here)
      setErrorCode(null)
    } catch (error: unknown) {
      setErrorCode(errorCodeOf(error) ?? 'LOCATION_UNAVAILABLE')
    }
  }, [])

  useEffect(() => {
    const pending = LocationAlarm.getCurrentPosition()
    void pending.then(
      (here) => {
        setFix(here)
        setErrorCode(null)
      },
      (error: unknown) => {
        setErrorCode(errorCodeOf(error) ?? 'LOCATION_UNAVAILABLE')
      },
    )
  }, [])

  const distanceM = useMemo(() => {
    const target = alarm?.place ?? draft
    if (!fix || !target) return null
    return haversineM(fix.lat, fix.lng, target.lat, target.lng)
  }, [alarm, draft, fix])

  const phase = !alarm ? 'idle' : alarm.ringing ? 'ringing' : 'trip'

  const value = useMemo<AlarmContextValue>(() => ({
    places,
    draft,
    prefs,
    alarm,
    fix,
    phase,
    busy,
    errorCode,
    confirmInside,
    distanceM,
    setDraft,
    setRadius: (radiusM: number) => updatePrefs({ ...prefs, radiusM }),
    setTone: (tone: ToneId) => updatePrefs({ ...prefs, tone }),
    setVibrate: (vibrate: boolean) => updatePrefs({ ...prefs, vibrate }),
    setLocale,
    setTheme,
    locate,
    saveDraft,
    removePlace,
    arm,
    dismissConfirm: () => setConfirmInside(false),
    endAlarm,
  }), [places, draft, prefs, alarm, fix, phase, busy, errorCode, confirmInside, distanceM, updatePrefs, setLocale, setTheme, locate, saveDraft, removePlace, arm, endAlarm])

  return <AlarmContext value={value}>{children}</AlarmContext>
}
