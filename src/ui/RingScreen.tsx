import { displayPlace } from '../i18n/copy.ts'
import { useTranslate } from '../i18n/use-translate.ts'
import { useAlarm } from '../state/alarm-context.ts'

export function RingScreen() {
  const { alarm, endAlarm } = useAlarm()
  const t = useTranslate()
  const name = alarm ? displayPlace(alarm.place.name, t) : t('destinationFallback')

  return (
    <section className="ring">
      <div className="ring-mark" aria-hidden="true" />
      <h1>{name}</h1>
      <p>{t('inside')}</p>
      <button type="button" className="primary" onClick={() => void endAlarm()}>
        {t('awake')}
      </button>
    </section>
  )
}
