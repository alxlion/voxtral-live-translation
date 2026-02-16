import type { APIRoute } from 'astro';
import { Mistral } from '@mistralai/mistralai';

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = request.headers.get('x-mistral-key') || process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Mistral API key not configured' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || undefined;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await audioFile.arrayBuffer();

    const mistral = new Mistral({ apiKey });
    const response = await mistral.audio.transcriptions.complete({
      model: 'voxtral-mini-latest',
      file: {
        fileName: audioFile.name || 'audio.webm',
        content: new Uint8Array(arrayBuffer),
      },
      language,
    });

    return new Response(
      JSON.stringify({
        text: response.text,
        language: response.language,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('Transcription error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
