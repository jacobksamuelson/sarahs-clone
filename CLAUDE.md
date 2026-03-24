@AGENTS.md

# Sarah's Helper

A family voice app for Sarah's kids (Leo & Felix) and husband Jake. Two main features:

1. **Quick Reminders** — Preset buttons and custom text input that play messages in Sarah's cloned voice via ElevenLabs TTS
2. **Mom's Notes** — Sarah records a voice note → Whisper transcribes it → GPT-4o-mini extracts a checklist with assignees (Leo, Felix, Boys, Jake, Everyone) → family members check off tasks

## Architecture
- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Serverless API routes:**
  - `app/api/speak/route.ts` — ElevenLabs TTS proxy
  - `app/api/transcribe/route.ts` — OpenAI Whisper proxy
  - `app/api/extract-checklist/route.ts` — GPT-4o-mini checklist extraction
- State: localStorage via `useSyncExternalStore` (no database)
- Deployed on **Vercel**

## Environment Variables
```
ELEVENLABS_API_KEY=   # ElevenLabs API key
ELEVENLABS_VOICE_ID=  # Custom voice ID for Sarah's voice
OPENAI_API_KEY=       # OpenAI API key (Whisper transcription + GPT-4o-mini checklist extraction)
```

## Design
- Warm & elegant aesthetic (cream/white background, gold accents, serif typography)
- Mobile-first — kids use tablets/phones
- Photo gallery of family photos at the bottom

## Key Files
- `app/page.tsx` — Main UI with top-level nav (Quick Reminders / Mom's Notes)
- `app/components/TopNav.tsx` — Tab switcher
- `app/components/MomsNotes.tsx` — Notes list container
- `app/components/RecordingModal.tsx` — Record → transcribe → extract → review flow
- `app/components/NoteCard.tsx` — Note card with transcript, TTS playback, checklist
- `app/hooks/useMomsNotes.ts` — localStorage CRUD for notes
- `app/api/speak/route.ts` — ElevenLabs TTS proxy
- `app/api/transcribe/route.ts` — Whisper transcription proxy
- `app/api/extract-checklist/route.ts` — Checklist extraction
- `public/photos/` — Family photos for gallery

## Commands
```bash
npm run dev    # Local dev server
npm run build  # Production build
vercel         # Deploy to Vercel
```
