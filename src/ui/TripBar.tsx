import { Capacitor } from '@capacitor/core'
import { formatDistance, lead } from '../domain/format.ts'
import { displayPlace, errorKey, leadText } from '../i18n/copy.ts'
import { useTranslate } from '../i18n/use-translate.ts'
import { useAlarm } from '../state/alarm-context.ts'

export function TripBar() {
  const { alarm, distanceM, fix, errorCode, endAlarm, prefs } = useAlarm()
  const t = useTranslate()
  if (!alarm) return null
  const native = Capacitor.isNativePlatform()
  const name = displayPlace(alarm.place.name, t)

  return (
    <section className="ticket trip" aria-label={t('tripLabel')}>
      <p className="distance">{distanceM == null ? t('seekingGps') : formatDistance(distanceM)}</p>
      <p className="status">{t('tripRadius', { name, radius: alarm.radiusM })}</p>
      <p className="status">{leadText(prefs.locale, lead(alarm.radiusM, fix?.speed ?? null))}</p>
      {alarm.suppressUntilExit && <p className="note">{t('suppress')}</p>}
      <p className="note">{native ? t('nativeTrip', { title: t('tripTitle') }) : t('webTrip')}</p>
      {errorCode && <p className="status error">{t(errorKey(errorCode))}</p>}
      <button type="button" className="primary ghost" onClick={() => void endAlarm()}>
        {t('cancel')}
      </button>
    </section>
  )
}
