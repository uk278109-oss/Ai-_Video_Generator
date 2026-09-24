# DOG AI — Final Base

DOG AI is the coding-first AI web/PWA project plus an Android WebView wrapper.

## Included
- React + TypeScript + Vite frontend
- Firebase authentication/database integration hooks
- Server-side Gemini/Grok API routes for Vercel
- Coding workspace
- Image generation workspace
- White / Black / WORLD appearance modes
- PWA manifest + service-worker build configuration
- Automatic PWA install prompt with browser fallback instructions
- DOG AI mascot used for splash/loading states across the app
- Android Studio project under `android/`
- AppGeyser instructions
- DOG AI Android package id: `com.dogai.app`

## Vercel environment variables
Set these on Vercel (server-side only):

```text
GEMINI_API_KEY=...
XAI_API_KEY=...
```

Optional model overrides are supported by the API files.

## Vercel deployment
Framework: Vite
Build command: `npm run build`
Output directory: `dist`
Install command: `npm install`

## Android Studio
1. Deploy the root web project to Vercel over HTTPS.
2. Open the `android/` folder in Android Studio.
3. Edit `android/gradle.properties` and set `WEB_APP_URL` to the real Vercel HTTPS URL.
4. Sync Gradle and build the APK.
5. The Android package/application id is `com.dogai.app`.

The Android app does not contain Gemini/XAI secrets. It loads the deployed web app; provider keys stay on the Vercel server.

## AppGeyser
Use the deployed HTTPS Vercel URL in the AppGeyser website/web-app conversion flow. Set the app name to `DOG AI` and use `public/pwa-512.png` for the icon when requested.

## Important
Do not put `GEMINI_API_KEY` or `XAI_API_KEY` in client-side `VITE_*` variables or in the Android project.
