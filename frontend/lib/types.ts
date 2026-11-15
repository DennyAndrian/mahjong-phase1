export type Suit = 'dots' | 'bamboo' | 'characters' | 'winds' | 'dragons';
export type TileValue = number | 'east' | 'south' | 'west' | 'north' | 'red' | 'green' | 'white';
export interface Tile { id: string; suit: Suit; value: TileValue; copy: number; }
export interface PlayerView {
  id: string; name: string; seat: number; kind: string; hand?: Tile[];
  handCount: number; discards: Tile[]; melds: unknown[];
}
export interface GameView {
  id: string; status: 'waiting' | 'playing' | 'finished'; createdAt: string; dealerSeat: number;
  currentTurn: number; turnNumber: number; wallCount: number;
  playerCount: number; maxPlayers: number; players: PlayerView[];
}
