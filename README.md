# Mahjong — Phase 1

Four-player Chinese Mahjong prototype: Next.js frontend + Node.js/Express backend + Socket.IO powered private rooms.

## Phase 1 scope
- Creates a 136-tile Chinese Mahjong set (three numbered suits + four winds + three dragons; four copies each; no flowers).
- Fisher-Yates shuffles the tile set.
- Creates private rooms with a unique invite link and up to four human seats.
- Updates each connected player's room view in real time as invitees join.
- Deals 13 tiles to each player and one extra tile to the East dealer when the room is full.
- Exposes room creation, joining, and authenticated room-read endpoints.
- Keeps each player's hand private to that player's access token.
- Gameplay actions (draw, discard, Chi, Pong, Kong, Hu) are for a later phase.

## Requirements
- Node.js 20 or newer
- npm

## Install
From this folder:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Run both apps

```bash
npm run dev
```

Frontend: http://localhost:3000  
Backend health: http://localhost:4000/health

Create a room from the home page and share its invite link with up to three other players. The link opens that room directly.

Alternatively, run each service in a separate terminal:

```bash
npm run dev:backend
npm run dev:frontend
```

## API

- `GET /health` — backend health check
- `POST /api/games` — creates a new game and returns the human player's view
- `GET /api/games/:gameId` — returns the human player's view for an existing game

The API intentionally hides bot hands and exposes only their tile counts. The in-memory game store resets when the backend restarts. No gameplay actions (draw, discard, Chi, Pong, Kong, Hu) are implemented in Phase 1.

## Configuration
Optional frontend environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Optional backend environment variables:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
```

For an internet-accessible invite link, deploy the frontend and backend to public URLs, set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to the public backend URL, and set `FRONTEND_ORIGIN` to the public frontend origin. Rooms and access tokens are currently held in backend memory, so restarting the backend clears active rooms.

## Rule note
This is a baseline Chinese-style 136-tile set. It is not a complete tournament rule implementation. Phase 2 will add draw/discard flow and claim windows; Phase 3 will add the claim priority and simple Hu validation (4 melds + 1 pair).
