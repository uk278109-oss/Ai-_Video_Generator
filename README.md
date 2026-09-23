# WORLD AI

WORLD AI is a React + TypeScript + Vite PWA foundation with Firebase authentication and Firestore-backed chat/memory data.

## Included in this build

- WORLD AI splash screen and app shell
- Email/password sign in
- Google sign in
- Forgot password
- Multi-step account creation: display name, email, password, age, category and AI interests
- Connected sidebar navigation for Home, Images, Library, Projects, Scheduled, Tools, Code Builder, Voice AI and Pro
- Account center
- Settings with compact White / Black / WORLD themes
- Memory controls
- Chat history create/rename/delete foundation
- PWA manifest, service worker generation and install prompt handling
- Real PNG PWA icons

## Pro status

The Pro plan in this build is a **product placeholder**. No payment, subscription or billing is active. The UI is ready for a future billing/backend phase.

## AI API status

Gemini, Grok/xAI and open-source model APIs are **not connected yet**. The next AI phase should put provider keys behind server-side routes and an AI router. Never put provider secret keys in client-side React code.

## Build

```bash
npm install
npm run build
npm run dev
```

Deploy with Vercel as a Vite project:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `./`

For PWA installation, use HTTPS (Vercel provides this) and a browser that supports the install prompt. The Install App button uses the browser's `beforeinstallprompt` event when available.
