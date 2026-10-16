# WakeMeGPS

A location alarm for the moment you need to get off. You choose a place and a radius. The phone rings when you enter that circle.

**Live app:** https://wake-me-gps-web.vercel.app
**Privacy:** https://wake-me-gps-web.vercel.app/privacidad
**Source:** https://github.com/ErickAlexSanchez/wake-me-gps-web

The same React interface is the website and, packaged with Capacitor, the Android app. The website is what you can open and walk through. Android is the trip you can trust with the screen off.

## Who it is for

Someone on a bus, a combi, or the metro who wants to sleep or look away and still wake up near a chosen stop. The product is a place and a distance. A clock alarm cannot do that job.

## The decision that shapes the architecture

A sleeping passenger will not keep a browser tab awake. The web build says that in the interface. Android starts a foreground location service only while the alarm is armed, and that service decides when to ring. The WebView is allowed to sleep.

## Decisions, and why

### One interface, two watchers

Vite, React, and TypeScript own the screens, the map, and the saved places. Capacitor ships that build inside the Android app. One interface means the trip a reviewer sees on the web is the trip on the phone.

The watcher is not shared. In the browser, `watchPosition` plus a Wake Lock plus a notification is the whole mechanism, and it stops being reliable when the tab is backgrounded. On Android, a local Capacitor plugin (Java, registered in `MainActivity`) runs a foreground service of type `location`. Using the stock geolocation plugin would have put the decision back in the WebView.

### No account and no server

The location never leaves the phone for a backend of ours, because there is no backend. Saved places, the radius, the tone, and the armed alarm live in local storage. That keeps the privacy story short enough to explain in one sentence, and it removes accounts, sync, and a database from the design.

Two network calls remain, and both are part of finding the place: the typed search goes to Photon (Komoot, over OpenStreetMap), and the map tiles come from OpenStreetMap.

### OpenStreetMap instead of a paid map

Leaflet draws the map. Photon searches it. There is no Google key and no billing account. The tradeoff is search and cartography that are good enough to pick a plaza or a station, which is the whole task. Turn-by-turn navigation is a different product.

### The trigger is written twice, on purpose

`evaluateFix` in `src/domain/geo.ts` and `AlarmMath` in Java apply the same rules:

- The alarm fires after two fixes in a row inside the radius. One noisy reading is not an arrival.
- A fix coarser than `max(radius, 80 m)` is ignored. A vague reading must not count as "you are there."
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

Vercel hosts this repository and rewrites every path to `index.html`, so a refresh on `/viaje` or `/privacidad` still opens the app. That site is not what Play installs. Play installs a signed Android App Bundle. The privacy URL on the store listing is the hosted page, `https://wake-me-gps-web.vercel.app/privacidad`.

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
| `src/domain` | Distance, the trigger, preferences, and the Photon search. No React. |
| `src/state` | The trip: idle, armed, ringing. The UI reads this. |
| `src/location` | The watcher. Web uses the browser. Android calls the local plugin. |
| `src/ui` | Map, the ticket where you arm the alarm, the trip bar, the ringing screen, privacy. |

This repository is the website. The Android project and the Play listing images stay on the machine that builds the store bundle. They are not published here.

The package id is `app.yallegue.despertador`. The visible name is WakeMeGPS. The id stays stable so a later update replaces the same Play listing.

## What was left out

Ads, accounts, cloud sync, and location collection while the alarm is off. Each of those would change the privacy disclosure and the Play data-safety form. They are easier to add before the first store submission than after it.

## If you want to run the checks

```bash
npm test
```

That suite locks the distance, the two-fix rule, the coarse-fix rejection, and the nearby-first search order.

The Android checklist, the signed bundle path, and the Play Console answers are in [`play-console.md`](play-console.md).
