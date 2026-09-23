# WORLD AI

Coding-first AI PWA built with React + TypeScript + Vite + Firebase.

## Current live features
- Firebase email/password + Google sign-in
- Password reset
- Account/profile navigation
- Chat UI with real server-side Gemini/Grok responses
- Coding workspace
- Gemini image generation workspace
- White / Black / WORLD themes
- PWA manifest + service worker + install prompt handling
- Mobile standalone layout

## Vercel environment variables
Add these in Vercel Project Settings → Environment Variables. Do not put provider secrets in `VITE_*` variables.

```text
GEMINI_API_KEY=...
XAI_API_KEY=...
```

Optional model overrides:
```text
GEMINI_TEXT_MODEL=gemini-3.8-flash
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
XAI_TEXT_MODEL=grok-4.7
```

After changing environment variables, redeploy the project.

## Notes
The `/api/chat` and `/api/image` Vercel functions keep provider keys on the server. For production Pro billing and robust per-user quotas, add server-side Firebase token verification before opening paid endpoints to public traffic.
