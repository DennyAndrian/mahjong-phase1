import { Tile } from './types';

/** Chinese Mahjong base set: 3 numbered suits (9 x 4 each), 4 winds and 3 dragons (4 each) = 136 tiles. */
export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  const numberedSuits = ['dots', 'bamboo', 'characters'] as const;
  for (const suit of numberedSuits) {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({ id: `${suit}-${value}-${copy}`, suit, value, copy });
      }
    }
  }
  const honors = [
    { suit: 'winds' as const, values: ['east', 'south', 'west', 'north'] as const },
    { suit: 'dragons' as const, values: ['red', 'green', 'white'] as const },
  ];
  for (const group of honors) {
    for (const value of group.values) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({ id: `${group.suit}-${value}-${copy}`, suit: group.suit, value, copy });
      }
    }
  }
  return tiles;
}
