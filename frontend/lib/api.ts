import { GameView } from './types';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RoomResponse {
  game: GameView;
  accessToken: string;
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? 'The request failed.');
  }
  return data as T;
}

export function tokenStorageKey(id: string): string {
  return `mahjong-room-${id}`;
}

export async function createRoom(name: string): Promise<RoomResponse> {
  const response = await fetch(`${API_URL}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    cache: 'no-store',
  });
  return readResponse<RoomResponse>(response);
}

export async function joinRoom(id: string, name: string): Promise<RoomResponse> {
  const response = await fetch(`${API_URL}/api/games/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    cache: 'no-store',
  });
  return readResponse<RoomResponse>(response);
}

export async function getGame(id: string, token: string): Promise<GameView> {
  const response = await fetch(`${API_URL}/api/games/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await readResponse<{ game: GameView }>(response);
  return data.game;
}
