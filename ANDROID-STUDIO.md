# DOG AI — Android Studio build

This project contains a complete Android Studio WebView wrapper in `android/`.

## 1) Deploy the web app first

Deploy the root Vite project to Vercel. Your deployed URL must be HTTPS because the Android wrapper loads that URL.

## 2) Put the Vercel URL into the Android project

Open:

`android/gradle.properties`

Change:

`WEB_APP_URL=https://YOUR-DOG-AI-VERCEL-DOMAIN.vercel.app/`

to your real HTTPS Vercel URL.

## 3) Open Android Studio

Open the **`android`** folder (not the repository root) in Android Studio.
Let Android Studio download the Android Gradle Plugin/Gradle dependencies if prompted.

Then:

- Sync Project with Gradle Files
- Run on a phone/emulator, or
- Build > Build APK(s)

The APK will be generated under `android/app/build/outputs/apk/`.

## 4) AppGeyser

AppGeyser does not need this Android project. Use the same deployed HTTPS Vercel URL as the website URL in AppGeyser's website-to-app flow.

## Important

The Android wrapper is intentionally a secure WebView shell around the real DOG AI web app. AI API keys remain server-side on Vercel; do not put Gemini/XAI keys inside Android code.
