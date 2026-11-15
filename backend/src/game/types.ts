export type Suit = 'dots' | 'bamboo' | 'characters' | 'winds' | 'dragons';
export type Wind = 'east' | 'south' | 'west' | 'north';
export type Dragon = 'red' | 'green' | 'white';

export interface Tile {
  id: string;
  suit: Suit;
  value: number | Wind | Dragon;
  copy: number;
}

export type Seat = 0 | 1 | 2 | 3;
export type PlayerKind = 'human' | 'bot';
export interface Player {
  id: string;
  accessToken: string;
  name: string;
  seat: Seat;
  kind: PlayerKind;
  hand: Tile[];
  discards: Tile[];
  melds: unknown[];
}
export interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
  dealerSeat: Seat;
  currentTurn: Seat;
  players: Player[];
  wall: Tile[];
  turnNumber: number;
}
