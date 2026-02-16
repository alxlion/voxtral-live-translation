process.env.ASTRO_NODE_AUTOSTART = 'disabled';

import { WebSocketServer } from 'ws';
import { handleTranscriptionSocket } from './ws-handler.mjs';

const { startServer } = await import('./dist/server/entry.mjs');
const { server } = startServer();
const httpServer = server.server;

const wss = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === '/ws/transcribe') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', handleTranscriptionSocket);
