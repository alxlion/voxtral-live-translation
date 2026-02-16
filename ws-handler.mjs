import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { RealtimeTranscription, AudioEncoding } = require('@mistralai/mistralai/extra/realtime');

export function handleTranscriptionSocket(ws) {
  console.log('[WS] Client connected');
  let mistralConn = null;

  ws.on('message', async (data, isBinary) => {
    try {
      if (!isBinary) {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'start') {
          const apiKey = msg.apiKey || process.env.MISTRAL_API_KEY;
          if (!apiKey) {
            ws.send(JSON.stringify({ type: 'error', error: { message: 'Mistral API key not configured' } }));
            return;
          }

          if (mistralConn && !mistralConn.isClosed) {
            await mistralConn.close();
          }

          const client = new RealtimeTranscription({
            apiKey,
          });

          const connectOpts = {
            audioFormat: {
              encoding: AudioEncoding.PcmS16le,
              sampleRate: 16000,
            },
          };
          if (msg.language) {
            connectOpts.language = msg.language;
          }

          mistralConn = await client.connect(
            'voxtral-mini-transcribe-realtime-2602',
            connectOpts,
          );

          // Forward Mistral events to browser
          (async () => {
            try {
              for await (const event of mistralConn) {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify(event));
                }
              }
            } catch (err) {
              console.error('[WS] Mistral event loop error:', err.message);
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'error', error: { message: err.message } }));
              }
            }
          })();

          ws.send(JSON.stringify({ type: 'session.ready' }));

        } else if (msg.type === 'stop') {
          if (mistralConn && !mistralConn.isClosed) {
            await mistralConn.endAudio();
          }
        }
      } else {
        // Binary = raw PCM audio from browser
        if (mistralConn && !mistralConn.isClosed) {
          await mistralConn.sendAudio(new Uint8Array(data));
        }
      }
    } catch (err) {
      console.error('[WS] Message handler error:', err.message);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'error', error: { message: err.message } }));
      }
    }
  });

  ws.on('close', async () => {
    console.log('[WS] Client disconnected');
    if (mistralConn && !mistralConn.isClosed) {
      try { await mistralConn.close(); } catch {}
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] WebSocket error:', err.message);
  });
}
