import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { findPlayerByToken, gameRouter, setGameUpdatePublisher } from './http/game.routes';
import { toPlayerView } from './game/game.view';

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT ?? 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

const frontendOrigins = FRONTEND_ORIGIN.split(',').map((origin) => origin.trim());
app.use(cors({ origin: frontendOrigins }));
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mahjong-backend' }));
app.use('/api/games', gameRouter);

const io = new Server(httpServer, { cors: { origin: frontendOrigins, methods: ['GET', 'POST'] } });
setGameUpdatePublisher((game) => {
  const sockets = io.sockets.adapter.rooms.get(game.id);
  if (!sockets) return;
  for (const socketId of sockets) {
    const playerId = io.sockets.sockets.get(socketId)?.data.playerId as string | undefined;
    if (playerId) io.to(socketId).emit('room:update', toPlayerView(game, playerId));
  }
});

io.use((socket, next) => {
  const { gameId, token } = socket.handshake.auth as { gameId?: string; token?: string };
  const membership = gameId && token ? findPlayerByToken(gameId, token) : undefined;
  if (!membership) return next(new Error('Invalid room credentials.'));
  socket.data.gameId = gameId;
  socket.data.playerId = membership.player.id;
  return next();
});

io.on('connection', (socket) => {
  const gameId = socket.data.gameId as string;
  const playerId = socket.data.playerId as string;
  socket.join(gameId);
  const membership = findPlayerByToken(gameId, socket.handshake.auth.token as string);
  if (membership) socket.emit('room:update', toPlayerView(membership.game, playerId));
});

httpServer.listen(PORT, () => console.log(`Mahjong backend listening on http://localhost:${PORT}`));
