import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { displayPlace } from '../i18n/copy.ts'
import { useTranslate } from '../i18n/use-translate.ts'
import { useAlarm } from '../state/alarm-context.ts'
import { Chrome } from './Chrome.tsx'
import { MapPane } from './MapPane.tsx'
import { PrivacyPage } from './PrivacyPage.tsx'
import { RingScreen } from './RingScreen.tsx'
import { Ticket } from './Ticket.tsx'
import { TripBar } from './TripBar.tsx'

export function Shell() {
  const { phase, alarm, draft } = useAlarm()
  const t = useTranslate()
  const location = useLocation()
  const navigate = useNavigate()
  const privacy = location.pathname === '/privacidad' || location.pathname === '/privacidad/'
  const place = alarm?.place ?? (phase === 'idle' ? draft : null)
  const heading = privacy ? t('privacyTitle') : place ? displayPlace(place.name, t) : t('where')

  useEffect(() => {
    if (privacy) return
    if (phase === 'ringing' && location.pathname !== '/sonando') navigate('/sonando', { replace: true })
    else if (phase === 'trip' && location.pathname !== '/viaje') navigate('/viaje', { replace: true })
    else if (phase === 'idle' && (location.pathname === '/viaje' || location.pathname === '/sonando')) navigate('/', { replace: true })
  }, [location.pathname, navigate, phase, privacy])

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable('App')) return
    const handle = App.addListener('backButton', ({ canGoBack }) => {
      if (phase === 'ringing') return
      if (canGoBack) window.history.back()
      else void App.minimizeApp()
    })
    return () => {
      void handle.then((listener) => listener.remove())
    }
  }, [phase])

  return (
    <div className={phase === 'ringing' ? 'app ringing' : 'app'}>
      {phase !== 'ringing' && (
        <header className="blind">
          <Link to="/" className="wordmark">
            {t('brand')}
          </Link>
          <Chrome />
          <h1>{heading}</h1>
        </header>
      )}
      <div className="window">
        <Routes>
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/sonando" element={<RingScreen />} />
          <Route path="*" element={<MapPane />} />
        </Routes>
      </div>
      {phase === 'idle' && !privacy && <Ticket />}
      {phase === 'trip' && !privacy && <TripBar />}
    </div>
  )
}
