# Play Console

Package: `app.yallegue.despertador`. Display name: WakeMeGPS. versionCode 1, versionName 1.0, targetSdk 36.

The signed bundle is `android/app/build/outputs/bundle/release/app-release.aab`. Rebuild it with `scripts/build-aab.ps1`. That script needs Android SDK platform 36 and JDK 21. Capacitor 8 does not compile on Java 17. The script looks for JDK 21 in `%LOCALAPPDATA%\Java\jdk-21` or in an Adoptium install.

The website and this bundle are separate. Play installs the bundle. The privacy policy URL is the website.

## Account

- Developer registration is a one-time 25 USD fee at https://play.google.com/console
- You upload the bundle from that account.

## The file that gets uploaded

- `android/app/build/outputs/bundle/release/app-release.aab`
- The first run of the script creates `android/release.keystore` and writes the password to `android/keystore.properties`.
- Neither file is committed. Without that keystore, later updates cannot be published.

## Listing copy

- Name: WakeMeGPS
- Short description: An alarm that rings when you arrive at a place.
- Full description: Choose a plaza, a station, or a point on the map, and a radius of 100, 250, 500, or 1000 meters, or one you type. The app rings when you enter that radius. While the phone is moving, it shows how many seconds that distance represents. You can change the tone and the vibration. On Android the alarm keeps running with the screen off while it is armed. In the browser the tab has to stay open.

## Privacy and data safety

- Privacy policy URL: https://wake-me-gps-web.vercel.app/privacidad
- Before you submit, add a contact email on that page. The current copy says this build does not include one.
- Data safety: location is collected on the device for the alarm. It is not shared with a server of ours, because there is no server. It is not sold.
- A place search sends the typed text to Photon (OpenStreetMap). The map requests tiles from OpenStreetMap. That is not a stored route.

## Permissions to declare

- Precise location.
- Notifications.
- A foreground service of type location. It runs only while the alarm is armed and shows the "Alarm on" notice.
- On Android 14 and newer, the system may ask separately for permission to open a full-screen activity over the lock screen. Tapping the notification is the fallback.

## Graphics

The listing images stay in a local `play-store/` folder. That folder is not part of this website repository.

- Icon: `play-store/icon-512.png` (512x512, 32-bit PNG).
- Feature graphic: `play-store/feature-graphic-1024x500.png` (1024x500, no alpha).
- Phone, four screenshots at 1080x1920: `play-store/phone/`.
- 7-inch tablet, four screenshots at 1080x1920: `play-store/tablet-7/`.
- 10-inch tablet, four screenshots at 1440x2560: `play-store/tablet-10/`.

## Before review

- On a real phone, arm a short radius and walk, or use a mock location.
- Confirm the "Alarm on" notification stays until you arrive or cancel.
- The website tells the user that, with the screen off, the browser may stop measuring.
