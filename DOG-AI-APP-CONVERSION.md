# DOG AI app conversion

## Android Studio
Open the `android` directory as an Android Studio project. Set the deployed HTTPS site in `android/gradle.properties`:

`WEB_APP_URL=https://your-real-vercel-domain.vercel.app/`

Then Sync Project with Gradle Files and build an APK.

## AppGeyser
For AppGeyser, deploy the web project first, then use the HTTPS Vercel URL in the website/web-app converter. App name: `DOG AI`.

## PWA
The root web project includes an explicit `public/manifest.json`, PWA plugin configuration, service-worker generation, and install prompt handling.

## Mascot
DOG AI uses the 