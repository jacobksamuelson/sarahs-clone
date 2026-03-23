@AGENTS.md

# Sarah's Clone

A family voice reminder app that plays preset reminders and custom text in Sarah's voice using ElevenLabs TTS.

## Architecture
- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Serverless API route** (`app/api/speak/route.ts`) proxies ElevenLabs TTS to keep the API key secret
- Single-page app: landing page with preset buttons, custom text input, and photo gallery
- Deployed on **Vercel**

## Environment Variables
```
ELEVENLABS_API_KEY=   # ElevenLabs API key
ELEVENLABS_VOICE_ID=  # Custom voice ID for Sarah's voice
```

## Design
- Warm & elegant aesthetic inspired by style reference (cream/white background, gold accents, serif typography)
- Mobile-first — kids use tablets/phones
- Photo gallery of family photos at the bottom

## Key Files
- `app/page.tsx` — Main UI (buttons, text input, gallery)
- `app/api/speak/route.ts` — ElevenLabs TTS proxy
- `public/photos/` — Family photos for gallery

## Commands
```bash
npm run dev    # Local dev server
npm run build  # Production build
vercel         # Deploy to Vercel
```
