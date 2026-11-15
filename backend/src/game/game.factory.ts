import { v4 as uuid } from 'uuid';
import { createTileSet } from './tile.factory';
import { shuffle } from './shuffle';
import { GameState, Player, Seat } from './types';

export function createRoom(ownerName: string): GameState {
  const owner: Player = {
    id: uuid(),
    accessToken: uuid(),
    name: ownerName,
    seat: 0,
    kind: 'human',
    hand: [],
    discards: [],
    melds: [],
  };

  return {
    id: uuid(),
    status: 'waiting',
    createdAt: new Date().toISOString(),
    dealerSeat: 0,
    currentTurn: 0,
    players: [owner],
    wall: [],
    turnNumber: 1,
  };
}

export function addPlayer(game: GameState, name: string): Player {
  const takenSeats = new Set(game.players.map((player) => player.seat));
  const seat = ([0, 1, 2, 3] as Seat[]).find((candidate) => !takenSeats.has(candidate));
  if (seat === undefined) throw new Error('Room is full');

  const player: Player = {
    id: uuid(),
    accessToken: uuid(),
    name,
    seat,
    kind: 'human',
    hand: [],
    discards: [],
    melds: [],
  };
  game.players.push(player);

  if (game.players.length === 4) startGame(game);
  return player;
}

function startGame(game: GameState): void {
  const wall = shuffle(createTileSet());
  for (const player of game.players) {
    player.hand = [];
    player.discards = [];
    player.melds = [];
  }

  for (let round = 0; round < 13; round++) {
    for (const player of game.players) {
      const tile = wall.pop();
      if (!tile) throw new Error('Not enough tiles to deal');
      player.hand.push(tile);
    }
  }
  const dealerExtra = wall.pop();
  if (!dealerExtra) throw new Error('Not enough tiles for dealer extra tile');
  game.players.find((player) => player.seat === game.dealerSeat)!.hand.push(dealerExtra);
  game.wall = wall;
  game.status = 'playing';
}
