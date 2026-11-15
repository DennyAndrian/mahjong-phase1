'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, tokenStorageKey } from '../../lib/api';

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { game, accessToken } = await createRoom(name);
      localStorage.setItem(tokenStorageKey(game.id), accessToken);
      router.push(`/game/${game.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create the room.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing">
      <form className="landing-card room-form" onSubmit={handleSubmit}>
        <div className="eyebrow">YOUR PRIVATE TABLE</div>
        <div className="landing-symbol">麻將</div>
        <h1>Create a room</h1>
        <p>Choose your name, then share the unique invite link with up to three friends.</p>
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
        <button className="start-button" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create room'} <span>→</span>
        </button>
        <a className="back-link" href="/">Back</a>
      </form>
    </main>
  );
}
