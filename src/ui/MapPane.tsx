import { latLngBounds } from 'leaflet'
import { useEffect, useRef } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useTranslate } from '../i18n/use-translate.ts'
import { useAlarm } from '../state/alarm-context.ts'

function token(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

const FALLBACK = { lat: 19.4326, lng: -99.1332 }

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function FrameMap({
  span,
  lat,
  lng,
  zoom,
  userLat,
  userLng,
  radiusM,
}: {
  span: boolean
  lat: number
  lng: number
  zoom: number
  userLat: number | null
  userLng: number | null
  radiusM: number
}) {
  const map = useMap()
  const last = useRef('')
  useEffect(() => {
    const key = span
      ? `s:${lat.toFixed(5)},${lng.toFixed(5)}:${Math.round(radiusM)}`
      : `p:${lat.toFixed(5)},${lng.toFixed(5)}:${zoom}`
    if (last.current === key) return
    last.current = key
    if (!span || userLat == null || userLng == null) {
      map.flyTo([lat, lng], zoom, { duration: 0.45 })
      return
    }
    const bounds = latLngBounds([userLat, userLng], [lat, lng])
    const dLat = radiusM / 111_320
    const dLng = radiusM / (111_320 * Math.max(0.2, Math.abs(Math.cos((lat * Math.PI) / 180))))
    bounds.extend([lat + dLat, lng + dLng])
    bounds.extend([lat - dLat, lng - dLng])
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16, animate: true })
  }, [lat, lng, map, radiusM, span, userLat, userLng, zoom])
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 80)
    return () => window.clearTimeout(id)
  }, [map])
  return null
}

export function MapPane() {
  const { draft, alarm, fix, prefs, phase, setDraft } = useAlarm()
  const t = useTranslate()
  const accent = token('--button', '#ffb000')
  const ink = token('--button-ink', '#1a1206')
  const marker = token('--cream', '#f4efe2')
  const target = alarm?.place ?? draft
  const radius = alarm?.radiusM ?? prefs.radiusM
  const center = target ?? (fix ? { lat: fix.lat, lng: fix.lng } : FALLBACK)
  const zoom = target || fix ? 16 : 12
  const span = phase === 'trip' && fix != null && target != null

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      zoomControl
      attributionControl
      className="map"
      aria-label={t('mapLabel')}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FrameMap
        span={span}
        lat={span && target ? target.lat : center.lat}
        lng={span && target ? target.lng : center.lng}
        zoom={zoom}
        userLat={fix?.lat ?? null}
        userLng={fix?.lng ?? null}
        radiusM={radius}
      />
      {phase === 'idle' && (
        <ClickCatcher
          onPick={(lat, lng) => setDraft({ id: crypto.randomUUID(), name: '', lat, lng })}
        />
      )}
      {target && (
        <>
          <Circle
            center={[target.lat, target.lng]}
            radius={radius}
            pathOptions={{ color: accent, weight: 2, fillColor: accent, fillOpacity: 0.16 }}
          />
          <CircleMarker
            center={[target.lat, target.lng]}
            radius={7}
            pathOptions={{ color: ink, weight: 2, fillColor: accent, fillOpacity: 1 }}
          />
        </>
      )}
      {fix && (
        <CircleMarker
          center={[fix.lat, fix.lng]}
          radius={8}
          pathOptions={{ color: accent, weight: 3, fillColor: marker, fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  )
}
