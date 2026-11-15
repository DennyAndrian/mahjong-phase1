import { GameState, Tile } from './types';

export interface PublicPlayerView {
  id: string; name: string; seat: number; kind: string;
  hand?: Tile[]; handCount: number; discards: Tile[]; melds: unknown[];
}
export function toPlayerView(game: GameState, viewerId: string) {
  const viewer = game.players.find((p) => p.id === viewerId);
  if (!viewer) throw new Error('Player not found in this game');
  const players: PublicPlayerView[] = game.players.map((p) => ({
    id: p.id, name: p.name, seat: p.seat, kind: p.kind,
    ...(p.id === viewerId ? { hand: p.hand } : {}),
    handCount: p.hand.length,
    discards: p.discards,
    melds: p.melds,
  }));
  return {
    id: game.id,
    status: game.status,
    createdAt: game.createdAt,
    dealerSeat: game.dealerSeat,
    currentTurn: game.currentTurn,
    turnNumber: game.turnNumber,
    wallCount: game.wall.length,
    playerCount: game.players.length,
    maxPlayers: 4,
    players,
  };
}
