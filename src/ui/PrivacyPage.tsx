import { Link } from 'react-router-dom'
import { useTranslate } from '../i18n/use-translate.ts'

export function PrivacyPage() {
  const t = useTranslate()
  return (
    <article className="privacy">
      <p>{t('privacyLead')}</p>
      <h2>{t('privacyStoredTitle')}</h2>
      <p>{t('privacyStored')}</p>
      <h2>{t('privacyLeavesTitle')}</h2>
      <p>{t('privacyLeaves')}</p>
      <h2>{t('privacyAndroidTitle')}</h2>
      <p>{t('privacyAndroid')}</p>
      <h2>{t('privacyContactTitle')}</h2>
      <p>{t('privacyContact')}</p>
      <p>
        <Link to="/">{t('privacyBack')}</Link>
      </p>
    </article>
  )
}
