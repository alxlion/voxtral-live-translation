import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      mistral: !!process.env.MISTRAL_API_KEY,
      deepl: !!process.env.DEEPL_API_KEY,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
