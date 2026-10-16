import { writeFileSync } from 'node:fs'

const live = 'https://wake-me-gps-web.vercel.app'
const repo = 'https://github.com/ErickAlexSanchez/wake-me-gps-web'

const readme = `# WakeMeGPS

A location alarm for the moment you need to get off. You choose a place and a radius. The phone rings when you enter that circle.

**Live app:** ${live}
**Privacy:** ${live}/privacidad
**Source:** ${repo}

The same React interface is the website and, packaged with Capacitor, the Android app. The website is what you can open and walk through. Android is the trip you can trust with the screen off.

## Who it is for

Someone on a bus, a combi, or the metro who wants to sleep or look away and still wake up near a chosen stop. The product is a place and a distance. A clock alarm cannot do that job.

## The decision that shapes the architecture

A sleeping passenger will not keep a browser tab awake. The web build says that in the interface. Android starts a foreground location service only while the alarm is armed, and that service decides when to ring. The WebView is allowed to sleep.

## Decisions, and why

### One interface, two watchers

Vite, React, and TypeScript own the screens, the map, and the saved places. Capacitor ships that build inside the Android app. One interface means the trip a reviewer sees on the web is the trip on the phone.

The watcher is not shared. In the browser, \`watchPosition\` plus a Wake Lock plus a notification is the whole mechanism, and it stops being reliable when the tab is backgrounded. On Android, a local Capacitor plugin (Java, registered in \`MainActivity\`) runs a foreground service of type \`location\`. Using the stock geolocation plugin would have put the decision back in the WebView.

### No account and no server

The location never leaves the phone for a backend of ours, because there is no backend. Saved places, the radius, the tone, and the armed alarm live in local storage. That keeps the privacy story short enough to explain in one sentence, and it removes accounts, sync, and a database from the design.

Two network calls remain, and both are part of finding the place: the typed search goes to Photon (Komoot, over OpenStreetMap), and the map tiles come from OpenStreetMap.

### OpenStreetMap instead of a paid map

Leaflet draws the map. Photon searches it. There is no Google key and no billing account. The tradeoff is search and cartography that are good enough to pick a plaza or a station, which is the whole task. Turn-by-turn navigation is a different product.

### The trigger is written twice, on purpose

\`evaluateFix\` in \`src/domain/geo.ts\` and \`AlarmMath\` in Java apply the same rules:

- The alarm fires after two fixes in a row inside the radius. One noisy reading is not an arrival.
- A fix coarser than \`max(radius, 80 m)\` is ignored. A vague reading must not count as "you are there."
- Arming while already inside asks for confirmation and stays quiet until the person leaves and comes back in. Otherwise the alarm would ring the moment it is armed.

The formula is duplicated because the Android process has to keep counting if the WebView is frozen. A bridge call on every fix would depend on the part that goes to sleep. The TypeScript side is covered by unit tests. The Java side is the same math, running where the service lives.

The line that says "how early" is the radius divided by the current speed. It is a hint on screen. Entering the radius is the trigger.

### Search prefers the place near you

Photon ranks by how famous a name is. Typing "Cozumel" was returning the island, and plazas with that name in other countries, ahead of a street a few kilometers away. The search sends the current latitude and longitude, asks Photon to focus on roughly a metro area, and then sorts those candidates by distance. Closer results come first, and each row shows the kilometers.

### The map frames the trip when the alarm is armed

On open, the app asks for the location and centers on it. After the alarm is armed, the map fits the person, the destination, and the radius circle. Later GPS ticks do not keep yanking the camera. The fit happens when the trip starts.

### Language and theme stay on the device

The interface is Spanish and English. The theme is light, dark, or the system. Both are chosen in the header and stored locally. On Android, the notification and the full-screen alarm use the same language as the screen, and changing the language during a trip does not reset the watch.

### The website and the Play Store binary are different deliveries

Vercel hosts this repository and rewrites every path to \`index.html\`, so a refresh on \`/viaje\` or \`/privacidad\` still opens the app. That site is not what Play installs. Play installs a signed Android App Bundle. The privacy URL on the store listing is the hosted page, \`${live}/privacidad\`.

## A trip

1. The app asks for the location and shows where you are.
2. You search or tap the map. Matches are ordered by distance.
3. You pick a radius: 100, 250, 500, or 1000 meters, or a custom value from 50 to 5000.
4. You arm the alarm. The map zooms out until you and the destination both fit.
5. Two acceptable fixes inside the circle start the tone. Vibration is optional.
6. One action stops it: "Ya desperté" or "I'm awake."

Underground, the GPS often disappears. The screen says the alarm rings when the phone can place itself inside the radius again, often at the station exit.

## Where the responsibility sits

| Piece | Responsibility |
| --- | --- |
| \`src/domain\` | Distance, the trigger, preferences, and the Photon search. No React. |
| \`src/state\` | The trip: idle, armed, ringing. The UI reads this. |
| \`src/location\` | The watcher. Web uses the browser. Android calls the local plugin. |
| \`src/ui\` | Map, the ticket where you arm the alarm, the trip bar, the ringing screen, privacy. |

This repository is the website. The Android project and the Play listing images stay on the machine that builds the store bundle. They are not published here.

The package id is \`app.yallegue.despertador\`. The visible name is WakeMeGPS. The id stays stable so a later update replaces the same Play listing.

## What was left out

Ads, accounts, cloud sync, and location collection while the alarm is off. Each of those would change the privacy disclosure and the Play data-safety form. They are easier to add before the first store submission than after it.

## If you want to run the checks

\`\`\`bash
npm test
\`\`\`

That suite locks the distance, the two-fix rule, the coarse-fix rejection, and the nearby-first search order.

The Android checklist, the signed bundle path, and the Play Console answers are in [\`play-console.md\`](play-console.md).
`

const play = `# Play Console

Package: \`app.yallegue.despertador\`. Display name: WakeMeGPS. versionCode 1, versionName 1.0, targetSdk 36.

The signed bundle is \`android/app/build/outputs/bundle/release/app-release.aab\`. Rebuild it with \`scripts/build-aab.ps1\`. That script needs Android SDK platform 36 and JDK 21. Capacitor 8 does not compile on Java 17. The script looks for JDK 21 in \`%LOCALAPPDATA%\\Java\\jdk-21\` or in an Adoptium install.

The website and this bundle are separate. Play installs the bundle. The privacy policy URL is the website.

## Account

- Developer registration is a one-time 25 USD fee at https://play.google.com/console
- You upload the bundle from that account.

## The file that gets uploaded

- \`android/app/build/outputs/bundle/release/app-release.aab\`
- The first run of the script creates \`android/release.keystore\` and writes the password to \`android/keystore.properties\`.
- Neither file is committed. Without that keystore, later updates cannot be published.

## Listing copy

- Name: WakeMeGPS
- Short description: An alarm that rings when you arrive at a place.
- Full description: Choose a plaza, a station, or a point on the map, and a radius of 100, 250, 500, or 1000 meters, or one you type. The app rings when you enter that radius. While the phone is moving, it shows how many seconds that distance represents. You can change the tone and the vibration. On Android the alarm keeps running with the screen off while it is armed. In the browser the tab has to stay open.

## Privacy and data safety

- Privacy policy URL: ${live}/privacidad
- Before you submit, add a contact email on that page. The current copy says this build does not include one.
- Data safety: location is collected on the device for the alarm. It is not shared with a server of ours, because there is no server. It is not sold.
- A place search sends the typed text to Photon (OpenStreetMap). The map requests tiles from OpenStreetMap. That is not a stored route.

## Permissions to declare

- Precise location.
- Notifications.
- A foreground service of type location. It runs only while the alarm is armed and shows the "Alarm on" notice.
- On Android 14 and newer, the system may ask separately for permission to open a full-screen activity over the lock screen. Tapping the notification is the fallback.

## Graphics

The listing images stay in a local \`play-store/\` folder. That folder is not part of this website repository.

- Icon: \`play-store/icon-512.png\` (512x512, 32-bit PNG).
- Feature graphic: \`play-store/feature-graphic-1024x500.png\` (1024x500, no alpha).
- Phone, four screenshots at 1080x1920: \`play-store/phone/\`.
- 7-inch tablet, four screenshots at 1080x1920: \`play-store/tablet-7/\`.
- 10-inch tablet, four screenshots at 1440x2560: \`play-store/tablet-10/\`.

## Before review

- On a real phone, arm a short radius and walk, or use a mock location.
- Confirm the "Alarm on" notification stays until you arrive or cancel.
- The website tells the user that, with the screen off, the browser may stop measuring.
`

writeFileSync('README.md', readme, 'utf8')
writeFileSync('play-console.md', play, 'utf8')
console.log('docs written')
