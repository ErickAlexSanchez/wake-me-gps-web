# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite, React, TypeScript, and Capacitor for the Android package. Confirmed in the approved plan.

## Users

Someone riding a combi, a bus, or the metro who wants to sleep or look away and wake up near a chosen place.

## Product Purpose

WakeMeGPS watches the phone's location and sounds an alarm when the person enters a radius around a destination. Success means they wake up near that place, with enough warning to get off, and can stop the alarm immediately.

## Positioning

The alarm is tied to a place and a distance, not to a clock time. The person sets how close, hears an estimate of how many seconds that distance means at their current speed, and the phone stays on that trip until they arrive or cancel.

## Operating Context

Used in a moving vehicle, often with the screen off and the phone in a pocket or bag. The web version is the same interface. Android is the reliable trip: a foreground service keeps watching while the alarm is armed. The web version is for trying the trip with the tab open and the screen on.

## Capabilities and Constraints

- Search a place or tap the map. Map tiles and place search use OpenStreetMap (Leaflet, Photon). No Google API and no account.
- Radius presets: 100, 250, 500, and 1000 meters, plus a custom value. The smallest useful radius is still tens of meters because GPS drifts.
- The "how early" line is the radius divided by current speed. The trigger itself is entering the radius.
- Several generated tones, vibration on or off, and on Android the alarm volume.
- Saved places stay on the device.
- Arming while already inside asks for confirmation and does not sound until the person leaves and comes back.
- The alarm sounds after two location readings in a row inside the radius.
- Underground metro often has no GPS. The app says the alarm sounds when the phone can place itself inside the radius again, often at the station exit.
- The web app warns that a locked screen or a background tab may stop the watch.
- Privacy: location stays on the phone. A place search sends the typed text to OpenStreetMap. The policy is part of the web app.
- No cloud sync. The public web host is Vercel. The Play Console upload is done by the owner.
- Package id: `app.yallegue.despertador`.

## Brand Commitments

Name: WakeMeGPS. Interface language: Spanish (informal) and English. No paid map or geocoding account.

## Evidence on Hand

The website is hosted on Vercel. Store screenshots stay in a local play-store folder and are not part of this web repository. Do not invent reviews, download counts, or a publisher name.

## Product Principles

- The destination and the distance are the whole product.
- Say when the phone cannot be trusted, especially underground and in the browser.
- Keep the GPS on the device.
- Waking up is the moment that must be unmistakable, and stopping it must be one action.

## Accessibility & Inclusion

The person may be half asleep, in the dark, on a moving bus. Text and the stop control must stay readable and large. The alarm is sound plus optional vibration, not sound alone.
