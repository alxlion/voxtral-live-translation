import type { APIRoute } from 'astro';
import { Translator } from 'deepl-node';

export const POST: APIRoute = async ({ request }) => {
  try {
    const apiKey = request.headers.get('x-deepl-key') || process.env.DEEPL_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DeepL API key not configured' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { text, sourceLang, targetLang } = await request.json();

    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: 'Missing text or targetLang' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const translator = new Translator(apiKey);
    const result = await translator.translateText(
      text,
      sourceLang || null,
      targetLang,
    );

    return new Response(
      JSON.stringify({
        translatedText: result.text,
        detectedSourceLang: result.detectedSourceLang,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('Translation error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
