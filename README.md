# Voxtral Live Translation

Real-time speech transcription and translation powered by [Mistral AI](https://mistral.ai/) (Voxtral) and [DeepL](https://www.deepl.com/).

Speak into your microphone and get live transcription with instant translation across 11 languages.

## Supported Languages

French, English, Chinese, Spanish, Portuguese, Russian, German, Japanese, Korean, Italian, Dutch

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- A [Mistral AI API key](https://console.mistral.ai/)
- A [DeepL API key](https://www.deepl.com/en/your-account/keys) (Free plan works)

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in your API keys
cp .env.example .env

# Build the project
npm run build

# Start the server
node server.mjs
```

The app will be available at `http://localhost:4003`.

API keys can also be entered directly in the browser via the settings modal (stored in localStorage).

## Docker

```bash
docker build -t voxtral-live-translation .
docker run -p 4003:4003 --env-file .env voxtral-live-translation
```

## How It Works

1. **Microphone capture** - Audio is captured via the Web Audio API and streamed as PCM to the server
2. **Real-time transcription** - The server forwards audio to Mistral's Voxtral realtime WebSocket API for live speech-to-text
3. **Translation** - Transcribed segments are sent to DeepL for translation into the selected target language

## Tech Stack

- [Astro](https://astro.build/) with SSR (Node.js adapter)
- [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- [Mistral AI SDK](https://www.npmjs.com/package/@mistralai/mistralai) (Voxtral realtime transcription)
- [DeepL Node SDK](https://www.npmjs.com/package/deepl-node) (text translation)
- WebSocket (via [ws](https://www.npmjs.com/package/ws)) for real-time audio streaming
