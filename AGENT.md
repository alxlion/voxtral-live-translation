# Real-Time Audio Transcription & Translation

## Project Overview

Astro SSR website that captures microphone audio, transcribes it in near-real-time using Mistral's Voxtral API, and translates it using DeepL's free API. Supports French-English bidirectional translation.

## Tech Stack

- **Framework**: Astro with `@astrojs/node` adapter (SSR, standalone mode)
- **Transcription**: Mistral API (`voxtral-mini-latest` model) via `@mistralai/mistralai`
- **Translation**: DeepL Free API via `deepl-node`
- **Frontend**: Vanilla JS (no framework), `getUserMedia` + `MediaRecorder`

## Architecture

```
Microphone → 3s audio chunks → /api/transcribe (Mistral) → /api/translate (DeepL) → Display
```

- Audio is captured in 3-second chunks via `MediaRecorder` with `timeslice`
- Each chunk is sent as `FormData` to the transcription API endpoint
- Transcribed text is then sent as JSON to the translation API endpoint
- Chunks process concurrently (not queued) with placeholder elements to preserve order
- Blobs smaller than ~1KB are skipped (silence/noise)

## File Structure

```
src/
  env.d.ts                    # TypeScript env var declarations
  pages/
    index.astro               # UI + client-side audio/fetch logic
    api/
      transcribe.ts           # POST: audio blob → Mistral → { text, language }
      translate.ts            # POST: { text, sourceLang, targetLang } → DeepL → { translatedText }
  styles/
    global.css                # Dark theme, two-panel layout
```

## Environment Variables

Required in `.env`:
- `MISTRAL_API_KEY` — from https://console.mistral.ai
- `DEEPL_API_KEY` — from https://www.deepl.com/en/your-account/keys (Free plan)

## Development

**Always run npm/node commands inside a Docker container**, not on the host. Use:

```bash
# Build
docker run --rm -v "$PWD":/app -w /app node:22-slim npm run build

# Dev server
docker run --rm -v "$PWD":/app -w /app -p 4003:4003 node:22-slim npm run dev

# Install dependencies
docker run --rm -v "$PWD":/app -w /app node:22-slim npm install
```

## API Endpoints

### POST /api/transcribe
- **Input**: `FormData` with `audio` (File) and `language` (string: `fr` or `en`)
- **Output**: `{ text: string, language: string }`

### POST /api/translate
- **Input**: JSON `{ text: string, sourceLang: string, targetLang: string }`
- **Output**: `{ translatedText: string, detectedSourceLang: string }`
- **Note**: DeepL requires `en-US` or `en-GB` for English target (not `en`); French target is `fr`

## Key Decisions

- **3-second chunks**: Balances latency vs transcription quality
- **`complete()` not `stream()`**: For 3s audio, round-trip is ~1.5s; streaming adds complexity for minimal gain
- **HTTP fetch, no WebSocket**: Fetch every 3s has negligible overhead vs WebSocket
- **FormData for audio**: Binary in JSON requires base64 (+33% size); FormData sends raw binary
- **No frontend framework**: DOM manipulation is trivial (append `<p>` elements)
