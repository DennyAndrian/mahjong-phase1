'use client';
import { useState } from 'react';
import { GameView, PlayerView, Tile } from '../lib/types';
import MahjongTile from './MahjongTile';

export default function GameTable({
  game,
  inviteLink,
  connected,
}: {
  game: GameView;
  inviteLink: string;
  connected: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const me = game.players.find((player) => player.hand !== undefined);
  if (!me) return <main className="loading-screen">Your seat could not be found.</main>;

  const playerAtOffset = (offset: number) => {
    const seat = (me.seat + offset) % 4;
    return game.players.find((player) => player.seat === seat);
  };
  const hand = me.hand ?? [];
  const sortKey = (tile: Tile) => `${tile.suit}-${String(tile.value).padStart(2, '0')}`;
  const sortedHand = [...hand].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  function renderSeat(player: PlayerView | undefined, className: string) {
    return (
      <div className={`seat ${className} ${player ? '' : 'seat-empty'}`}>
        <div className="avatar">{player ? player.name.slice(0, 2).toUpperCase() : '+'}</div>
        <b>{player?.name ?? 'Waiting for player'}</b>
        <span>{player ? `${player.handCount} tiles` : 'Open seat'}</span>
        {player && <div className={`back-tiles ${className === 'seat-left' || className === 'seat-right' ? 'vertical' : ''}`}>
          {Array.from({ length: Math.min(className === 'seat-top' ? 8 : 7, player.handCount) }).map((_, index) => <i key={index} />)}
        </div>}
      </div>
    );
  }

  async function copyInvite() {
    setCopied(false);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopyError('Could not copy the link. Copy it from the address bar instead.');
    }
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div><div className="eyebrow">PRIVATE ONLINE ROOM</div><h1>Mahjong</h1></div>
        <div className="topbar-right">
          <span className={`status-pill ${connected ? '' : 'status-offline'}`}>● {connected ? 'Connected' : 'Reconnecting…'}</span>
          <a className="new-game" href="/">Exit room</a>
        </div>
      </header>
      <section className="invite-panel">
        <div>
          <b>{game.status === 'waiting' ? 'Invite your friends' : 'Room is ready'}</b>
          <span>{game.playerCount}/{game.maxPlayers} players · Share this unique link to fill the table</span>
          {copyError && <small className="form-error" role="alert">{copyError}</small>}
        </div>
        <button className="invite-button" onClick={() => void copyInvite()} disabled={!inviteLink}>{copied ? 'Link copied!' : 'Copy invite link'}</button>
      </section>
      <section className="table-wrap">
        <div className="mahjong-table">
          {renderSeat(playerAtOffset(2), 'seat-top')}
          {renderSeat(playerAtOffset(3), 'seat-left')}
          {renderSeat(playerAtOffset(1), 'seat-right')}
          <div className="center-info">
            <div className="round-mark">東</div>
            <strong>{game.status === 'waiting' ? 'ROOM LOBBY' : 'WALL'}</strong>
            <span>{game.status === 'waiting' ? `${game.maxPlayers - game.playerCount} more player${game.maxPlayers - game.playerCount === 1 ? '' : 's'} needed` : `${game.wallCount} tiles remaining`}</span>
            {game.status === 'playing' && <small>Turn {game.turnNumber}</small>}
            <div className="discard-placeholder">
              {game.status === 'waiting' ? 'The game starts when all four seats are filled.' : <>Discard area<br /><small>Gameplay controls arrive in a later phase</small></>}
            </div>
          </div>
          <div className="seat seat-bottom">
            <div className="player-meta">
              <div className="avatar human-avatar">{me.name.slice(0, 2).toUpperCase()}</div>
              <div><b>{me.name} (you)</b><span>{game.status === 'waiting' ? 'Waiting for players' : `${hand.length} tiles · ${me.seat === 0 ? 'East / Dealer' : 'Player'}`}</span></div>
            </div>
            {game.status === 'playing' && <div className="hand-row">{sortedHand.map((tile) => <button key={tile.id} className={`tile-button ${selected === tile.id ? 'is-selected' : ''}`} onClick={() => setSelected(selected === tile.id ? null : tile.id)}><MahjongTile tile={tile} /></button>)}</div>}
            <div className="hint">{game.status === 'waiting' ? 'Your seat is reserved. The room updates as friends join.' : 'Select a tile to inspect it. Draw and discard actions arrive in a later phase.'}</div>
          </div>
        </div>
      </section>
      <footer className="game-footer"><span>Room: {game.id.slice(0, 8)}</span><span>136-tile set · 4 players · No flowers</span><span>{selected ? `Selected: ${selected}` : copied ? 'Invite ready to share' : 'Private invite room'}</span></footer>
    </main>
  );
}
