DOG AI — Phase 1 Core Engine patch

Changed files:
- api/engine.ts — new central DOG AI engine/router endpoint.
- api/chat.ts — backward-compatible wrapper to the engine.
- src/pages/Home.tsx — frontend now calls /api/engine and no longer sends provider selection.

New optional Vercel environment variables for an OpenAI-compatible open-model endpoint:
- DOG_ENGINE_BASE_URL=https://YOUR-ENDPOINT/v1
- DOG_ENGINE_API_KEY=YOUR_KEY_IF_REQUIRED
- DOG_ENGINE_MODEL=YOUR_MODEL_NAME

Do not put API keys in source code.

Compatibility:
If DOG_ENGINE_BASE_URL is not configured, the engine temporarily falls back to the existing Gemini configuration so the current app can continue working while the open-model endpoint is being connected.
