import { Capacitor } from '@capacitor/core'
import { useEffect, useId, useState } from 'react'
import { previewTone } from '../audio/tones.ts'
import { formatDistance, lead } from '../domain/format.ts'
import { haversineM } from '../domain/geo.ts'
import { searchPlaces, type PlaceHit } from '../domain/photon.ts'
import { MAX_RADIUS_M, MIN_RADIUS_M, RADIUS_PRESETS, TONE_IDS } from '../domain/types.ts'
import { displayPlace, errorKey, leadText, TONE_KEY } from '../i18n/copy.ts'
import { useTranslate } from '../i18n/use-translate.ts'
import { bindInstallPrompt } from '../pwa/register.ts'
import { Link } from 'react-router-dom'
import { useAlarm } from '../state/alarm-context.ts'
import { IconClose, IconSearch } from './icons.tsx'

function HitMeta({ hit }: { hit: PlaceHit }) {
  const { fix } = useAlarm()
  const distance = fix ? formatDistance(haversineM(fix.lat, fix.lng, hit.lat, hit.lng)) : ''
  const meta = [distance, hit.detail].filter(Boolean).join(' · ')
  if (!meta) return null
  return <small>{meta}</small>
}

export function Ticket() {
  const alarm = useAlarm()
  const t = useTranslate()
  const searchId = useId()
  const radiusId = useId()
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<PlaceHit[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [install, setInstall] = useState<(() => Promise<void>) | null>(null)
  const native = Capacitor.isNativePlatform()

  useEffect(() => bindInstallPrompt((next) => setInstall(() => next)), [])

  useEffect(() => {
    const onStatus = () => setOnline(navigator.onLine)
    window.addEventListener('online', onStatus)
    window.addEventListener('offline', onStatus)
    return () => {
      window.removeEventListener('online', onStatus)
      window.removeEventListener('offline', onStatus)
    }
  }, [])

  const queryReady = query.trim().length >= 2

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSearching(true)
      setSearchError(null)
      const bias = alarm.fix ? { lat: alarm.fix.lat, lng: alarm.fix.lng } : null
      void searchPlaces(trimmed, bias, controller.signal, alarm.prefs.locale)
        .then((next) => setHits(next))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : 'SEARCH_FAILED'
          setSearchError(code)
          setHits([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false)
        })
    }, 400)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [alarm.fix, alarm.prefs.locale, query])

  const radiusInvalid = alarm.prefs.radiusM < MIN_RADIUS_M || alarm.prefs.radiusM > MAX_RADIUS_M
  const speed = alarm.fix?.speed ?? null

  return (
    <form
      className="ticket"
      onSubmit={(event) => {
        event.preventDefault()
        void alarm.arm(false)
      }}
    >
      <label className="field" htmlFor={searchId}>
        <span>{t('place')}</span>
        <span className="search">
          <IconSearch />
          <input
            id={searchId}
            value={query}
            placeholder={t('placePlaceholder')}
            autoComplete="off"
            enterKeyHint="search"
            onFocus={() => {
              const stale = !alarm.fix || Date.now() - alarm.fix.timestamp > 45_000
              if (stale) void alarm.locate()
            }}
            onChange={(event) => setQuery(event.target.value)}
          />
        </span>
      </label>

      {searching && <p className="status">{t('searching')}</p>}
      {searchError && <p className="status error">{t(errorKey(searchError))}</p>}
      {!online && <p className="status">{t('offline')}</p>}

      {queryReady && hits.length > 0 && (
        <ul className="hits">
          {hits.map((hit) => (
            <li key={`${hit.lat},${hit.lng},${hit.name}`}>
              <button
                type="button"
                className="hit"
                onClick={() => {
                  alarm.setDraft({ id: crypto.randomUUID(), name: hit.name, lat: hit.lat, lng: hit.lng })
                  setQuery(hit.name || t('unnamedPlace'))
                  setHits([])
                }}
              >
                <strong>{hit.name || t('unnamedPlace')}</strong>
                <HitMeta hit={hit} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {alarm.draft && (
        <div className="chosen">
          <p>
            <strong>{displayPlace(alarm.draft.name, t)}</strong>
          </p>
          <button type="button" className="text" onClick={alarm.saveDraft}>
            {t('savePlace')}
          </button>
        </div>
      )}

      {alarm.places.length > 0 && (
        <ul className="saved">
          {alarm.places.map((place) => {
            const label = displayPlace(place.name, t)
            return (
              <li key={place.id}>
                <button type="button" className="pill" onClick={() => alarm.setDraft(place)}>
                  {label}
                </button>
                <button type="button" className="icon-button" aria-label={t('removePlace', { name: label })} onClick={() => alarm.removePlace(place.id)}>
                  <IconClose />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!alarm.draft && alarm.places.length === 0 && <p className="status">{t('emptyHint')}</p>}

      <fieldset className="radius">
        <legend>{t('radiusLegend')}</legend>
        <div className="presets" role="radiogroup" aria-label={t('radiusGroup')}>
          {RADIUS_PRESETS.map((meters) => (
            <button
              key={meters}
              type="button"
              role="radio"
              aria-checked={alarm.prefs.radiusM === meters}
              className={alarm.prefs.radiusM === meters ? 'preset on' : 'preset'}
              onClick={() => alarm.setRadius(meters)}
            >
              {meters} m
            </button>
          ))}
        </div>
        <label className="field compact" htmlFor={radiusId}>
          <span>{t('meters')}</span>
          <input
            id={radiusId}
            type="number"
            inputMode="numeric"
            min={MIN_RADIUS_M}
            max={MAX_RADIUS_M}
            step={10}
            value={alarm.prefs.radiusM}
            onChange={(event) => alarm.setRadius(Number(event.target.value))}
          />
        </label>
      </fieldset>

      <p className="status">{leadText(alarm.prefs.locale, lead(alarm.prefs.radiusM, speed))}</p>

      <fieldset className="tones">
        <legend>{t('toneLegend')}</legend>
        <div className="presets">
          {TONE_IDS.map((tone) => (
            <button
              key={tone}
              type="button"
              className={alarm.prefs.tone === tone ? 'preset on' : 'preset'}
              aria-pressed={alarm.prefs.tone === tone}
              onClick={() => {
                alarm.setTone(tone)
                previewTone(tone)
              }}
            >
              {t(TONE_KEY[tone])}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="check">
        <input
          type="checkbox"
          checked={alarm.prefs.vibrate}
          onChange={(event) => alarm.setVibrate(event.target.checked)}
        />
        {t('vibrate')}
      </label>

      <p className="note">{t('metro')}</p>
      <p className="note">{native ? t('nativeArmed') : t('webArmed')}</p>

      {alarm.errorCode && <p className="status error">{t(errorKey(alarm.errorCode))}</p>}

      {alarm.confirmInside ? (
        <div className="confirm">
          <p>{t('alreadyInside')}</p>
          <button type="button" className="primary" disabled={alarm.busy} onClick={() => void alarm.arm(true)}>
            {t('armAnyway')}
          </button>
          <button type="button" className="text" onClick={alarm.dismissConfirm}>
            {t('pickRadius')}
          </button>
        </div>
      ) : (
        <button className="primary" type="submit" disabled={!alarm.draft || alarm.busy || radiusInvalid}>
          {alarm.busy ? t('readingGps') : t('arm')}
        </button>
      )}

      <p className="fine">
        <Link to="/privacidad">{t('privacy')}</Link>
        {install && (
          <button type="button" className="text" onClick={() => void install()}>
            {t('install')}
          </button>
        )}
      </p>
    </form>
  )
}
