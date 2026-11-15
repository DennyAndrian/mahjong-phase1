'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';
import GameTable from '../../../components/GameTable';
import { ApiError, getGame, joinRoom, SOCKET_URL, tokenStorageKey } from '../../../lib/api';
import { GameView } from '../../../lib/types';

type RoomPhase = 'loading' | 'join' | 'room' | 'error';

export default function OnlineRoomPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [phase, setPhase] = useState<RoomPhase>('loading');
  const [game, setGame] = useState<GameView | null>(null);
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const storedToken = localStorage.getItem(tokenStorageKey(gameId));
    if (!storedToken) {
      setPhase('join');
      return () => { cancelled = true; };
    }

    void getGame(gameId, storedToken).then((room) => {
      if (cancelled) return;
      setToken(storedToken);
      setGame(room);
      setPhase('room');
    }).catch((requestError: unknown) => {
      if (cancelled) return;
      if (requestError instanceof ApiError && requestError.status === 401) {
        localStorage.removeItem(tokenStorageKey(gameId));
        setPhase('join');
        return;
      }
      setError(requestError instanceof Error ? requestError.message : 'Could not load this room.');
      setPhase('error');
    });

    return () => { cancelled = true; };
  }, [gameId]);

  useEffect(() => {
    if (phase !== 'room' || !token) return;
    const socket = io(SOCKET_URL, { auth: { gameId, token } });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('room:update', (updatedGame: GameView) => setGame(updatedGame));
    return () => { socket.disconnect(); };
  }, [gameId, phase, token]);

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setJoining(true);
    try {
      const result = await joinRoom(gameId, name);
      localStorage.setItem(tokenStorageKey(gameId), result.accessToken);
      setGame(result.game);
      setToken(result.accessToken);
      setPhase('room');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not join this room.');
    } finally {
      setJoining(false);
    }
  }

  if (phase === 'loading') return <main className="loading-screen">Opening the invite…</main>;
  if (phase === 'error') {
    return <main className="loading-screen"><p role="alert">{error}</p><a className="start-button" href="/">Back home</a></main>;
  }
  if (phase === 'join') {
    return (
      <main className="landing">
        <form className="landing-card room-form" onSubmit={handleJoin}>
          <div className="eyebrow">YOU ARE INVITED</div>
          <div className="landing-symbol">麻將</div>
          <h1>Join the room</h1>
          <p>Pick a name to take an open seat at this Mahjong table.</p>
          <label htmlFor="player-name">Your name</label>
          <input
            id="player-name"
            className="name-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={20}
            autoComplete="nickname"
            required
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="start-button" type="submit" disabled={joining}>
            {joining ? 'Joining…' : 'Join room'} <span>→</span>
          </button>
        </form>
      </main>
    );
  }

  if (!game) return <main className="loading-screen">Room unavailable.</main>;
  return (
    <GameTable
      game={game}
      inviteLink={origin ? `${origin}/game/${game.id}` : ''}
      connected={connected}
    />
  );
}
