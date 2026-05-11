# Kitchen Rush

A coffee-shop time-pressure game built on the [Topia Javascript SDK](https://metaversecloud-com.github.io/mc-sdk-js/index.html). Customers walk up with a drink order — pick the right size, temperature, milk, flavor, and toppings before the timer runs out. Get five orders wrong and the shop closes.

## Gameplay

The session is split into four progressively harder levels:

| Level | Title            | Threshold | Timer | Recipe length           |
| ----- | ---------------- | --------- | ----- | ----------------------- |
| 1     | Warm-Up          | 5 orders  | 15 s  | Size + temp + milk      |
| 2     | Lunch Rush       | 6 orders  | 12 s  | + flavor shot           |
| 3     | Dinner Rush      | 7 orders  | 10 s  | + 1–2 toppings          |
| 4     | Chef's Challenge | endless   | 8 s   | Full recipes, max speed |

Score combines a base value, a streak multiplier, and a speed bonus (time remaining when the order is served). Streak resets to 0 on any wrong order or timeout. Five angry customers ends the game.

When the game ends (either by completing level 4, hitting 5 angry customers, or clicking "Close Shop"), the player's final score is submitted to the leaderboard if it beats their previous best.

## Badges

Badges are granted server-side via the Topia ecosystem inventory. The server grant is idempotent — re-awarding a badge the visitor already owns returns `{ granted: false }` so the client only shows the toast once.

| Badge name       | Trigger                               |
| ---------------- | ------------------------------------- |
| `First Order`    | First correct order in a game session |
| `Speed Chef`     | First streak of 5+ correct in a row   |
| `Master Barista` | Completed level 4                     |

The names map to active `BADGE` items in your ecosystem inventory. If a badge name is missing from the ecosystem the grant silently no-ops (see `server/utils/awardBadge.ts`).

## Data Objects

### Dropped Asset (key asset)

```ts
{
  leaderboard: {
    // profileId -> "<displayName>|<score>"
    [profileId: string]: string;
  };
}
```

The leaderboard lives on the dropped asset's data object. Entries are parsed and sorted server-side; the top 25 are returned to clients.

### Visitor

No per-visitor server-side state. Score, streak, and angry-customer counts are React state passed between levels via `react-router` navigation state. Badges are persisted by the SDK in the visitor's inventory items.

## API

| Method | Route                      | Body                       | Description                                                                                            |
| ------ | -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/api/system/health`       | —                          | Health probe; returns app version + `NODE_ENV` / `INSTANCE_DOMAIN`. **Never** echoes interactive keys. |
| GET    | `/api/game-state`          | —                          | Returns `{  isAdmin }`.                                                                                |
| GET    | `/api/leaderboard`         | —                          | Returns `{ leaderboard: LeaderboardEntry[] }` (top 25 by score).                                       |
| POST   | `/api/leaderboard/update`  | `{ score: number }`        | Updates the entry if score is better than the visitor's previous best.                                 |
| POST   | `/api/leaderboard/reset`   | —                          | Clears the leaderboard. Returns `{ alreadyEmpty: true }` if nothing to clear.                          |
| POST   | `/api/award-badge`         | `{ badgeName: string }`    | Grants the named badge if the visitor doesn't already own it. Returns `{ granted, badgeName, icon }`.  |
| POST   | `/api/analytics/increment` | `{ analyticName: string }` | Increments a Topia public-key analytic.                                                                |

All requests are signed with interactive credentials in the query string by `client/src/utils/backendAPI.ts`; the server validates them via `getCredentials`.

## Server Conventions

- **Single source of truth for visitor state**: `server/utils/getVisitor.ts` is the only place that constructs `Visitor` and is the single layer for any visitor-side init.
- **Idempotent badge grants**: `server/utils/awardBadge.ts` checks `visitor.inventoryItems` before granting and returns `{ granted: false }` if the visitor already owns the badge. Clients only show the toast when `granted === true`.
- **Leaderboard writes**: `updateLeaderboard` uses dotted-path `updateDataObject({ [`leaderboard.${profileId}`]: ... })` so concurrent writes from different profiles don't clobber each other.
- **Errors**: every controller wraps in try/catch and routes failures through `errorHandler`. Validation errors return 400 with `{ success: false, error }`; SDK/server errors return 500.

## Client Conventions

- **Server-first**: every server interaction goes through `client/src/utils/backendAPI.ts`. The hook never calls Topia directly.
- **No `sessionStorage`**: between-level state (score, streak, angry count, orders served) is carried via `react-router` navigation state. There is no implicit cross-tab state.
- **Cascade layers**: `client/src/index.css` declares `@layer tailwind, sdk;` then imports the SDK CSS into `@layer(sdk)`. Per-page CSS files (e.g. `Home.css`, `Game.css`) are unlayered and therefore beat both SDK and Tailwind without needing `!important`. Tailwind preflight is disabled in `client/tailwind.config.js` because Tailwind v3 hoists it past the layer wrapper.
- **Stable game loop**: `client/src/hooks/useOrderManager.ts` owns timers, order generation, and the badge popup. Score/streak/angry counts are React state; the hook stores a small snapshot in a ref for closure-safe navigation when the game ends.

## Environment Variables

Create a `.env` file in the repo root.

| Variable             | Required    | Description                                                                     |
| -------------------- | ----------- | ------------------------------------------------------------------------------- |
| `INTERACTIVE_KEY`    | yes         | Topia interactive app public key (matches `interactivePublicKey` in URL params) |
| `INTERACTIVE_SECRET` | yes         | Topia interactive app secret used to sign JWTs                                  |
| `INSTANCE_DOMAIN`    | recommended | `api.topia.io` (prod) or `api-stage.topia.io` (staging). Defaults to prod.      |
| `INSTANCE_PROTOCOL`  | optional    | Defaults to `https`.                                                            |
| `PORT`               | optional    | Server port. Defaults to `3000`.                                                |
| `NODE_ENV`           | optional    | `development` enables permissive CORS and skips the static-file serve.          |

Get your keys at [topia.io/dashboard/integrations](https://topia.io/t/dashboard/integrations) (or [dev.topia.io](https://dev.topia.io/t/dashboard/integrations) for staging).

## Getting Started

```bash
# Server (Express)
cd server
npm install
npm run dev        # starts on :3000

# Client (Vite + React)
cd ../client
npm install
npm run dev        # starts on :3001, proxies /api to :3000
```

To run the test suite:

```bash
cd server
npm test
```

## Tech Stack

| Layer       | Technologies                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Client      | React 18, TypeScript, Vite, Tailwind (utilities only, preflight disabled), `react-router-dom`, `canvas-confetti` |
| Server      | Node 20, Express, `@rtsdk/topia`, Jest + Supertest                                                               |
| SDK CSS     | `https://sdk-style.s3.amazonaws.com/styles-3.0.2.css` loaded via `@import layer(sdk)`                            |
| Persistence | Topia data objects (leaderboard on the dropped key asset, badges on the visitor's inventory)                     |

## Helpful Links

- [SDK developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- [Topia dev dashboard](https://dev.topia.io/t/dashboard/integrations)
- [Topia prod dashboard](https://topia.io/t/dashboard/integrations)
