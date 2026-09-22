# WORLD AI — Phase 2

Phase 2 adds a real account layer and persistent user workspace on top of Phase 1.

## Included

- Firebase Email/Password sign up and login
- Persistent Firebase auth session
- Logout
- Per-user Firestore profile
- Per-user chat list with create / rename / delete
- Per-user Memory collection
- Memory enable/disable control
- Delete one memory / clear all memories
- Light / Dark / System appearance
- Persistent per-user appearance preference
- Responsive settings panel
- Responsive mobile sidebar
- Search chats
- PWA foundation retained from Phase 1
- Firestore security rules scoped to the authenticated user's UID

This is intentionally **not a 1:1 ChatGPT copy**. WORLD AI keeps its own branding and UI while using familiar AI-workspace patterns.

## 1. Create Firebase project

In Firebase Console:

1. Create a project.
2. Add a Web App.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create a **Cloud Firestore** database.
5. Publish `firestore.rules`.
6. Copy the Web App config values.

## 2. Configure local environment

Copy `.env.example` to `.env` and fill the six Firebase values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Do not put Firebase Admin/service-account private keys in this frontend project.

## 3. Install and run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run preview
```

## 4. Firestore data shape

```text
users/{uid}
  displayName
  email
  createdAt
  memoryEnabled

users/{uid}/memories/{memoryId}
  text
  createdAt

users/{uid}/chats/{chatId}
  title
  createdAt
  updatedAt

users/{uid}/chats/{chatId}/messages/{messageId}
  role
  content
  createdAt
```

Phase 2 deliberately does not put Gemini/Grok/API secrets in the browser. AI provider calls should be added through secure server-side routes in Phase 3.
