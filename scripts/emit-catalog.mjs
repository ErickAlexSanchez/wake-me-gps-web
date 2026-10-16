import { writeFileSync } from 'node:fs'

const es = {
  brand: 'WakeMeGPS',
  where: '\u00bfD\u00f3nde te bajo?',
  destinationFallback: 'Tu destino',
  language: 'Idioma',
  appearance: 'Apariencia',
  themeSystem: 'Auto',
  themeLight: 'Claro',
  themeDark: 'Oscuro',
  localeEs: 'Espa\u00f1ol',
  localeEn: 'English',
  place: 'Lugar',
  placePlaceholder: 'Plaza, estaci\u00f3n, calle',
  searching: 'Buscando...',
  offline: 'Sin conexi\u00f3n no puedo buscar. Si el mapa ya se ve, t\u00f3calo.',
  savePlace: 'Guardar lugar',
  removePlace: 'Quitar {name}',
  emptyHint: 'Busca una plaza o toca el mapa.',
  radiusLegend: 'Qu\u00e9 tan cerca',
  radiusGroup: 'Radio en metros',
  meters: 'Metros',
  toneLegend: 'Tono',
  toneCampana: 'Campana',
  tonePulso: 'Pulso',
  toneSirena: 'Sirena',
  toneClasico: 'Cl\u00e1sico',
  vibrate: 'Vibrar',
  metro: 'En el metro bajo tierra el GPS casi no llega. La alarma suena cuando el tel\u00e9fono vuelva a ubicarse dentro del radio, a menudo al salir de la estaci\u00f3n.',
  nativeArmed: 'La alarma sigue en la barra de notificaciones hasta que llegues o la canceles.',
  webArmed: 'En el navegador la alarma solo es fiable con esta pesta\u00f1a abierta y la pantalla encendida.',
  alreadyInside: 'Ya est\u00e1s dentro de este radio. Si activas ahora, no sonar\u00e1 hasta que salgas y vuelvas a entrar.',
  armAnyway: 'Activar de todos modos',
  pickRadius: 'Elegir otro radio',
  readingGps: 'Leyendo el GPS...',
  arm: 'Activar alarma',
  privacy: 'Privacidad',
  install: 'Instalar',
  tripLabel: 'Viaje en curso',
  seekingGps: 'Buscando GPS...',
  tripRadius: '{name} \u00b7 radio de {radius} m',
  suppress: 'No sonar\u00e1 hasta que salgas del radio y vuelvas a entrar.',
  nativeTrip: 'Puedes apagar la pantalla. La notificaci\u00f3n "{title}" tiene que seguir ah\u00ed.',
  webTrip: 'Deja esta pesta\u00f1a abierta y la pantalla encendida. Si el navegador duerme, la alarma no suena.',
  cancel: 'Cancelar alarma',
  inside: 'Est\u00e1s dentro del radio.',
  awake: 'Ya despert\u00e9',
  mapLabel: 'Mapa para elegir el lugar de la alarma',
  mapPoint: 'Punto en el mapa',
  unnamedPlace: 'Lugar sin nombre',
  leadStill: 'Sin movimiento claro, el aviso es al entrar en el radio.',
  leadSeconds: 'A esta velocidad, el radio son unos {seconds} segundos antes.',
  leadMinute: 'A esta velocidad, el radio es un minuto antes.',
  leadMinutes: 'A esta velocidad, el radio son unos {minutes} minutos antes.',
  errorDenied: 'Sin permiso de ubicaci\u00f3n no puedo despertarte. Act\u00edvalo en el navegador o en Ajustes del tel\u00e9fono.',
  errorTimeout: 'El GPS tard\u00f3 demasiado. Int\u00e9ntalo otra vez donde el cielo est\u00e9 m\u00e1s abierto.',
  errorSearch: 'No pude buscar ahora. Toca el mapa para marcar el lugar.',
  errorUnavailable: 'No pude leer tu ubicaci\u00f3n. Revisa que el GPS est\u00e9 encendido.',
  tripTitle: 'Alarma activa',
  arrivedTitle: 'Ya llegaste',
  privacyTitle: 'Privacidad',
  privacyLead: 'WakeMeGPS usa la ubicaci\u00f3n del tel\u00e9fono para saber si ya entraste al radio de tu destino. Esa posici\u00f3n se queda en el aparato. No hay cuenta ni un servidor de esta app que la reciba.',
  privacyStoredTitle: 'Qu\u00e9 se guarda en el tel\u00e9fono',
  privacyStored: 'Los lugares que guardas, el radio, el tono y la alarma activa viven en el almacenamiento local. Si borras los datos del navegador o de la app, se borran con ellos.',
  privacyLeavesTitle: 'Qu\u00e9 sale del tel\u00e9fono',
  privacyLeaves: 'Al buscar un lugar, el texto que escribes se env\u00eda a Photon (Komoot) para consultar OpenStreetMap. El mapa pide im\u00e1genes de mapa a los servidores de OpenStreetMap. Esas peticiones no incluyen un perfil tuyo.',
  privacyAndroidTitle: 'Android',
  privacyAndroid: 'La app pide ubicaci\u00f3n precisa para medir la distancia, y notificaciones para avisar que la alarma sigue activa y para encender la pantalla al llegar. El servicio corre solo mientras la alarma est\u00e1 armada. Al cancelar o al despertar, se detiene. La vibraci\u00f3n suena solo si la dejas activada.',
  privacyContactTitle: 'Contacto',
  privacyContact: 'Esta copia no trae un correo de contacto. Quien publique la app tiene que escribir aqu\u00ed un medio para responder antes de subirla a Play Store.',
  privacyBack: 'Volver a la alarma',
}

const en = {
  brand: 'WakeMeGPS',
  where: 'Where should I wake you?',
  destinationFallback: 'Your stop',
  language: 'Language',
  appearance: 'Appearance',
  themeSystem: 'Auto',
  themeLight: 'Light',
  themeDark: 'Dark',
  localeEs: 'Espa\u00f1ol',
  localeEn: 'English',
  place: 'Place',
  placePlaceholder: 'Plaza, station, street',
  searching: 'Searching...',
  offline: 'Search needs a connection. If the map is already up, tap it.',
  savePlace: 'Save place',
  removePlace: 'Remove {name}',
  emptyHint: 'Search for a plaza or tap the map.',
  radiusLegend: 'How close',
  radiusGroup: 'Radius in meters',
  meters: 'Meters',
  toneLegend: 'Tone',
  toneCampana: 'Bell',
  tonePulso: 'Pulse',
  toneSirena: 'Siren',
  toneClasico: 'Classic',
  vibrate: 'Vibrate',
  metro: 'Underground, GPS usually drops out. The alarm sounds when the phone can place itself inside the radius again, often at the station exit.',
  nativeArmed: 'The alarm stays in the notification bar until you arrive or cancel.',
  webArmed: 'In the browser the alarm is reliable only with this tab open and the screen on.',
  alreadyInside: 'You are already inside this radius. If you arm it now, it stays quiet until you leave and come back in.',
  armAnyway: 'Arm anyway',
  pickRadius: 'Pick another radius',
  readingGps: 'Reading GPS...',
  arm: 'Arm alarm',
  privacy: 'Privacy',
  install: 'Install',
  tripLabel: 'Trip in progress',
  seekingGps: 'Looking for GPS...',
  tripRadius: '{name} \u00b7 {radius} m radius',
  suppress: 'It stays quiet until you leave the radius and come back in.',
  nativeTrip: 'You can turn the screen off. The "{title}" notification has to stay up.',
  webTrip: 'Keep this tab open and the screen on. If the browser sleeps, the alarm does not sound.',
  cancel: 'Cancel alarm',
  inside: 'You are inside the radius.',
  awake: "I'm awake",
  mapLabel: 'Map for choosing where the alarm should sound',
  mapPoint: 'Point on the map',
  unnamedPlace: 'Unnamed place',
  leadStill: 'No clear movement, so the alarm is the moment you enter the radius.',
  leadSeconds: 'At this speed, that radius is about {seconds} seconds out.',
  leadMinute: 'At this speed, that radius is about a minute out.',
  leadMinutes: 'At this speed, that radius is about {minutes} minutes out.',
  errorDenied: 'Without location permission I cannot wake you. Turn it on in the browser or in the phone settings.',
  errorTimeout: 'GPS took too long. Try again where the sky is more open.',
  errorSearch: 'Search failed. Tap the map to mark the place.',
  errorUnavailable: 'I could not read your location. Check that GPS is on.',
  tripTitle: 'Alarm on',
  arrivedTitle: 'You are here',
  privacyTitle: 'Privacy',
  privacyLead: 'WakeMeGPS uses the phone location to know when you enter the radius around your destination. That position stays on the device. There is no account, and this app has no server that receives it.',
  privacyStoredTitle: 'What stays on the phone',
  privacyStored: 'Saved places, the radius, the tone, and the armed alarm live in local storage. Clearing the browser or the app clears them too.',
  privacyLeavesTitle: 'What leaves the phone',
  privacyLeaves: 'When you search for a place, the text you type is sent to Photon (Komoot) to look it up on OpenStreetMap. The map requests images from OpenStreetMap servers. Those requests do not include a profile of you.',
  privacyAndroidTitle: 'Android',
  privacyAndroid: 'The app asks for precise location to measure the distance, and for notifications to show that the alarm is still armed and to turn the screen on when you arrive. The service runs only while the alarm is armed. It stops when you cancel or when you wake. Vibration runs only if you leave it on.',
  privacyContactTitle: 'Contact',
  privacyContact: 'This copy has no contact email. Whoever publishes the app has to write a way to reply here before submitting it to the Play Store.',
  privacyBack: 'Back to the alarm',
}

const esKeys = Object.keys(es).sort()
const enKeys = Object.keys(en).sort()
if (esKeys.join() !== enKeys.join()) {
  throw new Error('catalog keys differ')
}

function block(name, obj) {
  const lines = Object.entries(obj).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`)
  return `const ${name} = {\n${lines.join('\n')}\n} as const\n`
}

const file = `// User-facing copy. Spanish is the product voice. English is the second locale.
// Edit scripts/emit-catalog.mjs and run \`node scripts/emit-catalog.mjs\` so this file stays UTF-8.
${block('es', es)}
${block('en', en)}
export type MessageKey = keyof typeof es

type CatalogParity = keyof typeof en extends MessageKey
  ? MessageKey extends keyof typeof en
    ? true
    : never
  : never

export const catalogsMatch: CatalogParity = true

export const catalogs = { es, en }

export type Locale = keyof typeof catalogs

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = catalogs[locale][key]
  if (!vars) return template
  return template.replace(/\\{(\\w+)\\}/g, (_, name: string) => {
    const value = vars[name]
    return value == null ? '' : String(value)
  })
}
`

writeFileSync(new URL('../src/i18n/catalog.ts', import.meta.url), file, 'utf8')
