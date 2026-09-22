# FirstAI — React Native App Setup Guide

## Ek hi code, do jagah chalta hai

Ye poora app **React** mein likha hai (React Native), isliye ek hi codebase se:
- **Web version** banta hai → Vercel par deploy karke browser mein khulta hai, aur "Add to Home Screen" karne se phone par installable app jaisa lagta hai (PWA)
- **Real native app** banti hai → EAS Build se .apk/.aab, Play Store/App Store ke liye

Koi alag code nahi likhna — jo neeche steps hain, unse dono ban jaate hain.


Ye guide bilkul step-by-step hai. Coding nahi aani chahiye — bas ye commands copy-paste karni hain.

## Cheezein jo chahiye (ek baar install karni hain)

1. **Node.js** install karein: https://nodejs.org (LTS version download karein, normal software jaisa install ho jayega)
2. **Expo Go** app apne phone par install karein:
   - Android: Play Store se "Expo Go" search karein
   - iPhone: App Store se "Expo Go" search karein
3. **Free AI API key** (Groq se, bilkul free):
   - https://console.groq.com par account banayein (Google se sign in ho sakta hai)
   - "API Keys" section mein jaayein, "Create API Key" dabayein
   - Key copy kar ke rakh lein (baad mein app ke Settings mein daalni hai)

## Step 1 — Project banayein

Apne computer par terminal / command prompt kholein aur ye chalayein:

```
npx create-expo-app FirstAI
cd FirstAI
```

Ye ek naya, sahi-versions wala Expo project bana dega (automatically latest compatible versions le leta hai, isliye koi version-mismatch ka jhanjhat nahi hoga).

## Step 2 — Zaroori packages install karein

```
npx expo install react-native-webview @react-native-async-storage/async-storage
```

## Step 3 — Diye gaye files copy karein

Is zip mein jo files hain, unhe apne naye `FirstAI` folder mein copy karein aur **overwrite** kar dein:

- `App.js` → root mein daalein (jo `create-expo-app` ne banaya tha, usse replace kar dein)
- `app.json` → root mein daalein (replace kar dein)
- `package.json` → root mein daalein (replace kar dein) — phir `npm install` ek baar chala lein
- `src/` poora folder → root mein copy kar dein

Terminal mein wapas ye chalayein taake sab dependencies theek se install ho jayein:

```
npm install
```

## Step 4 — App chalayein aur phone par dekhein

```
npx expo start
```

Terminal mein ek **QR code** dikhega:
- **Android**: Expo Go app kholein → "Scan QR Code" → is QR ko scan karein
- **iPhone**: normal Camera app se QR scan karein → "Open in Expo Go" par tap karein

App turant aapke phone par khul jayegi — live! Jab bhi code mein koi change karein, phone par turant dikh jayega.

## Step 5 — App ke andar AI key daalein

App khulne ke baad, top-right par **⚙ Settings** button dabayein, Groq wali API key paste karein, "Save" dabayein. Ab "💬 Mentor" tab mein ja kar AI se baat kar sakte hain — jo bhi bolenge, wo HTML/CSS/JS likh kar Code tab mein daal dega, aur Preview tab mein turant dikhega.

---

## Baad mein — Real APK ya App Store build

Jab app test ho jaaye aur aap satisfied hon, to real install-able file banane ke liye **EAS Build** (Expo ka free build service) use karein:

```
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
```

- Ye ek **.apk / .aab file** banayega jo aap seedha kisi bhi Android phone par install kar sakte hain, ya Google Play Store par upload kar sakte hain
- Android ke liye ye **free** hai (sirf Play Store par publish karne ke liye Google ka one-time $25 developer account fee lagta hai)
- iPhone/App Store ke liye:
  ```
  eas build --platform ios
  ```
  Iske liye **Apple Developer account** chahiye hoga (paid, $99/saal) — ye Apple ki requirement hai, isse bypass nahi kiya ja sakta

## Vercel par 404 aaye to (troubleshooting)

Agar deploy ke baad 404 dikhe, ye check karein:

1. **Root Directory sahi hai**: Vercel Project Settings → General → "Root Directory" khaali/blank hona chahiye (agar GitHub repo mein `App.js`, `package.json` seedhe root mein hain, jaisa is guide mein bataya gaya tha)
2. **vercel.json** is project mein already shamil hai — ye Vercel ko khud bata deta hai build/output settings, isliye dashboard mein manually kuch set karne ki zaroorat nahi
3. **Latest code push hua ho**: `package.json` mein web ke zaroori packages (`react-dom`, `react-native-web`, `@expo/metro-runtime`) add kiye gaye hain — agar purana `package.json` GitHub par hai to naya wala push/overwrite karein
4. Vercel ke "Deployments" tab mein jaa kar us deployment par click karein → "Build Logs" dekhein — agar wahan koi red error line ho to wo bhejein, uska exact fix bata dunga
5. Fix push karne ke baad Vercel khud-ba-khud redeploy kar dega (agar GitHub se connected hai)

## Kuch important baatein

- **API key security**: Abhi key seedha app ke andar (phone par) save hoti hai. Agar app publicly launch karni hai (bahut logon ke liye), to behtar hoga key ko ek chhote backend server ke peeche rakhein taake koi aapki key na dekh sake — jab wahan tak pahunchein to bata dein, main uska bhi setup bana dunga.
- **Groq free tier** mein reasonable daily limits hain jo shuru mein kaafi hain; agar zyada use badhe to paid tier ya doosra provider (Gemini, OpenAI) switch kiya ja sakta hai — sirf `src/api/aiClient.js` file mein URL/model change karna hoga.
- Koi bhi step mein atak jayein to jo exact error message aaye wo mujhe bhej dein, main us hisaab se fix bata dunga.
