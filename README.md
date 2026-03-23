# Sarah's Helper

A warm, family voice reminder app that lets the kids hear mom's voice with a single tap. Built as a personal project using an ElevenLabs custom voice clone.

## What It Does

Sarah's Helper has two main features:

**Preset Voice Buttons** — Large, tappable buttons organized into categories:
- **Reminders**: "Brush your teeth", "Wash your hands before dinner", "Put away your clothes", and more
- **Love**: Personal messages for each family member

**Custom Text-to-Speech** — Type anything and hear it spoken in Sarah's voice.

The app also features a family photo gallery at the bottom and is designed to be used on a tablet or phone by the kids.

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** — warm, elegant design with gold accents and serif typography
- **ElevenLabs TTS API** — custom voice clone, proxied through a serverless API route to keep the API key secure
- **Vercel** — deployed and hosted

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your ElevenLabs credentials:
   ```
   ELEVENLABS_API_KEY=your_api_key
   ELEVENLABS_VOICE_ID=your_voice_id
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deploy

Deploy to Vercel and set the two environment variables (`ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`) in the Vercel dashboard.

## Made With Love

A personal project for the Samuelson family.
