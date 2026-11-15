import { Router } from 'express';
import { addPlayer, createRoom } from '../game/game.factory';
import { toPlayerView } from '../game/game.view';
import { GameState, Player } from '../game/types';

const games = new Map<string, GameState>();
export const gameRouter = Router();

type GameUpdatePublisher = (game: GameState) => void;
let publishGameUpdate: GameUpdatePublisher = () => undefined;

export function setGameUpdatePublisher(publisher: GameUpdatePublisher): void {
  publishGameUpdate = publisher;
}

export function findPlayerByToken(gameId: string, token: string): { game: GameState; player: Player } | undefined {
  const game = games.get(gameId);
  const player = game?.players.find((candidate) => candidate.accessToken === token);
  return game && player ? { game, player } : undefined;
}

function readName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const name = value.trim();
  return name.length > 0 && name.length <= 20 ? name : undefined;
}

gameRouter.post('/', (req, res) => {
  const name = readName(req.body?.name);
  if (!name) return res.status(400).json({ error: 'INVALID_NAME', message: 'Name must be 1 to 20 characters.' });
  const game = createRoom(name);
  games.set(game.id, game);
  const owner = game.players[0];
  return res.status(201).json({
    game: toPlayerView(game, owner.id),
    accessToken: owner.accessToken,
    message: 'Room created. Invite up to three other players.',
  });
});

gameRouter.post('/:gameId/join', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'ROOM_NOT_FOUND', message: 'This room does not exist.' });
  if (game.status !== 'waiting') {
    return res.status(409).json({ error: 'ROOM_FULL', message: 'This room has already started.' });
  }
  const name = readName(req.body?.name);
  if (!name) return res.status(400).json({ error: 'INVALID_NAME', message: 'Name must be 1 to 20 characters.' });

  const player = addPlayer(game, name);
  publishGameUpdate(game);
  return res.status(201).json({
    game: toPlayerView(game, player.id),
    accessToken: player.accessToken,
    message: 'Joined room.',
  });
});

gameRouter.get('/:gameId', (req, res) => {
  const authorization = req.header('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const membership = findPlayerByToken(req.params.gameId, token);
  if (!membership) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'A valid room access token is required.' });
  }
  return res.json({ game: toPlayerView(membership.game, membership.player.id) });
});
