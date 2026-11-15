import { Tile } from '../lib/types';

const suitLabel: Record<Tile['suit'], string> = {
  dots: '●', bamboo: '♣', characters: '萬', winds: '風', dragons: '中',
};
const valueLabel: Record<string, string> = {
  east: '東', south: '南', west: '西', north: '北', red: '中', green: '發', white: '白',
};

export function tileName(tile: Tile): string {
  if (typeof tile.value === 'number') return `${tile.value} ${tile.suit}`;
  return `${tile.value} ${tile.suit}`;
}

export default function MahjongTile({ tile, small = false }: { tile: Tile; small?: boolean }) {
  const honor = typeof tile.value !== 'number';
  const label = honor ? valueLabel[String(tile.value)] : String(tile.value);
  const secondary = honor ? suitLabel[tile.suit] : suitLabel[tile.suit];
  const color = tile.suit === 'characters' || tile.suit === 'dragons' ? 'red' : tile.suit === 'bamboo' ? 'green' : 'blue';
  return (
    <div className={`mahjong-tile ${small ? 'mahjong-tile-small' : ''} tile-${color}`} title={tileName(tile)} aria-label={tileName(tile)}>
      <span className="tile-value">{label}</span>
      <span className="tile-suit">{secondary}</span>
    </div>
  );
}
