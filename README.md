<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Kitchen Rush

## Introduction / Summary

Kitchen Rush is a coffee-shop time-pressure game for Topia worlds. Visitors click an interactive asset to open the drawer, then take orders from customers who want a specific size + temperature + milk (plus flavor and toppings in later levels). Each order has a per-level timer; wrong orders, timed-out orders, and Close-Shop clicks all cost angry-customer count. Five angry customers ends the shift.

The game is split into four progressively harder levels (`Warm-Up`, `Lunch Rush`, `Dinner Rush`, `Chef's Challenge`). Score combines base points, a streak multiplier, and a speed bonus based on time remaining at serve. Finishing a shift (by level-4 completion, five angry customers, or a manual "Close Shop") posts the run to a shared leaderboard on the key asset and awards any newly-earned badges from a 21-badge catalog — nine granted mid-run for in-game milestones (streaks, speed, mistakes) and twelve granted at the end of the game for accuracy, lifetime totals, and leaderboard placement.

## Key Features

### Canvas elements & interactions

- **Key asset:** any interactive asset the app is dropped on. It hosts the world-wide leaderboard on its data object; there is no fixed `uniqueName` — the app uses whatever `assetId` the visitor clicked (see `server/utils/droppedAssets/getDroppedAsset.ts`).
- **No world assets are created by the app** — Kitchen Rush is a drawer-only experience. It does not drop, delete, or move any dropped assets aside from writing to the key asset's data object.

### Drawer content

Three tabs on the home screen:

- **Game tab.** Coffee-shop image, how-to-play + watch-out cards, "Start Game" button. Starts the four-level run.
- **Scores tab.** Leaderboard (top 25, with the current visitor's row highlighted and their best score called out). Admins additionally see the "Reset Leaderboard" button here.
- **Badges tab.** Every ecosystem `BADGE` (fetched via `Ecosystem.fetchInventoryItems`), colored if the visitor owns it and grayscale if not. Hover for description.

During a run the drawer swaps between three phases: `LevelIntermission` (level intro card + carry-over stats), `Game` (HUD, order card, ingredient grid, serve/close controls, floating feedback toast), and `GameOver` (final stats, new badges, leaderboard, "Play Again").

### Admin features

- **Reset Leaderboard.** `Visitor.get(...).isAdmin` gates the button on the client (rendered in `ScoresTab`) and `POST /api/leaderboard/reset` is available to any authenticated visitor at the route layer — the client-side gate is the only enforcement.

### Themes

None. Single visual style; no runtime theme switch.

## Required Assets with Unique Names

Kitchen Rush does not require any pre-placed dropped assets with fixed unique names. The visitor's clicked asset (`credentials.assetId`) is used as the key asset — that's the single dropped asset the app touches.

| Unique Name       | Placed by | Description                                                                                                                  |
| ----------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| _(none required)_ | —         | The app targets whatever interactive asset the visitor clicked; that asset holds the world's leaderboard on its data object. |

## Technical Architecture

### Data Objects

#### Visitor

Persisted per-visitor between sessions.

```ts
{
  gamesPlayed: number; // Incremented once per completed run
  lifetimeCorrectOrders: number; // Sum of every correct order the visitor has served
}
```

Written via `visitor.incrementDataObjectValue` on `POST /game-end`. `getVisitor` seeds the shape via `setDataObject` on first load when `gamesPlayed` is missing.

**No per-run session state is written to the visitor data object.** Score, streak, angry count, per-level orders, and correct/incorrect counts live in React state (`useOrderManager`) and are carried between levels via `LevelStart` props — not persisted anywhere.

#### Key Asset (the clicked dropped asset)

```ts
{
  leaderboard: {
    // profileId -> "<displayName>|<score>"
    [profileId: string]: string;
  };
}
```

Initialized on first `getDroppedAsset` call. `parseLeaderboard` splits each pipe-delimited value, sorts by score desc, and returns the top 25. `updateLeaderboard` writes via dotted-path `updateDataObject({ [`leaderboard.${profileId}`]: … })` so concurrent writes from different profiles don't clobber each other, and skips the write entirely when the incoming score isn't strictly better than the visitor's existing entry.

#### World

Not used. Kitchen Rush never reads from or writes to `World.dataObject`.

### Badge catalog

Badges are Topia ecosystem `BADGE` items resolved by exact name. `awardBadge` / `grantBadges` skip badges the visitor already owns (idempotent), and if a badge name isn't present in the ecosystem inventory the grant silently no-ops after a fresh-cache retry — so a badge missing from your ecosystem doesn't break the run, it just never gets awarded. On grant, the SDK fires a `Badge Awarded` toast.

The nine in-game names live in [`client/src/data/gameConstants.ts`](client/src/data/gameConstants.ts) (`IN_GAME_BADGES`); the twelve end-of-game names live in [`server/controllers/handleGameEnd.ts`](server/controllers/handleGameEnd.ts) (`END_OF_GAME_BADGES`). All 21 must exist as `BADGE` items with `status: ACTIVE` in your ecosystem to be grantable.

#### In-game badges (client-driven, awarded during a run)

Awarded from `client/src/hooks/useOrderManager.ts` via `POST /api/award-badge`.

| Badge name         | Trigger                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `First Order`      | First correct order in a session (`statsRef.correctOrders === 1`).                                                  |
| `Perfect Plate`    | Streak reaches 5.                                                                                                   |
| `Rush Hour`        | Streak reaches 10.                                                                                                  |
| `Unstoppable`      | Streak reaches 25.                                                                                                  |
| `Lightning Hands`  | 5 consecutive correct orders each served with >70% of the timer remaining.                                          |
| `Last Minute Save` | Correct order served with <5% of the timer remaining (uses ms-precise wall-clock, not the 100 ms-granular UI tick). |
| `Want it All`      | Level 4 order with all three toppings, served correctly.                                                            |
| `Sluggish`         | 3 consecutive correct orders each served with <30% of the timer remaining.                                          |
| `Oops`             | 3 consecutive wrong or timed-out orders.                                                                            |

#### End-of-game badges (server-driven, awarded on `/game-end`)

Awarded server-side in `handleGameEnd` using the just-finalized run stats and `visitor.dataObject`.

| Badge name            | Trigger                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `Open for Business`   | First-ever completed run (`gamesPlayed` becomes 1).                              |
| `Back in the Kitchen` | 3 or more completed runs (`gamesPlayed >= 3`).                                   |
| `Sharp Chef`          | Accuracy at run end ≥ 80% (`correctOrders / (correctOrders + incorrectOrders)`). |
| `No Substitutions`    | 10 or more correct orders in the run with zero incorrect.                        |
| `Clean Service`       | Run ended with zero angry customers **and** at least one correct order.          |
| `Line Cook`           | Lifetime correct orders ≥ 25 after this run.                                     |
| `Sous Chef`           | Lifetime correct orders ≥ 100.                                                   |
| `Head Chef`           | Lifetime correct orders ≥ 250.                                                   |
| `Master Chef`         | Lifetime correct orders ≥ 300.                                                   |
| `On the Board`        | Run's final score placed the visitor anywhere in the top 25 leaderboard.         |
| `Top 10`              | Leaderboard rank ≤ 10.                                                           |
| `Number 1`            | Leaderboard rank = 1.                                                            |

## Levels

All four levels defined in [`client/src/config/levelConfig.tsx`](client/src/config/levelConfig.tsx). Each level ships with a per-order timer (`timer`, in ms), a per-level order count (`threshold`), and the ingredient categories in play. When `ordersServedLevel >= threshold` and the level isn't the final level, the run advances to the next `LevelIntermission`.

| #   | Title              | Timer | Threshold     | Ingredient categories in play                                        | Distinguishing feature                                                                                                    |
| --- | ------------------ | ----- | ------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `Warm-Up`          | 15 s  | 5 orders      | size, temp, milk                                                     | Baseline recipe — 2–3 ingredients per order.                                                                              |
| 2   | `Lunch Rush`       | 12 s  | 6 orders      | + flavor (`vanilla`, `caramel`, `mocha`, `none`)                     | Adds flavor shots.                                                                                                        |
| 3   | `Dinner Rush`      | 10 s  | 7 orders      | + toppings (`whipped_cream`, `cinnamon`, `sprinkles`), 1–2 per order | Adds toppings.                                                                                                            |
| 4   | `Chef's Challenge` | 8 s   | 999 (endless) | full recipe                                                          | Up to 3 toppings per order (drives the `Want it All` badge). Runs until 5 angry customers or the visitor closes the shop. |

Scoring per correct order: `BASE_POINTS(10) * streakMultiplier(streak) + speedBonus(msRemaining, timeLimit)`. Streak multiplier steps up at streaks of 3 / 6 / 9 / 12 (final tier ×5). Speed bonus is +5 above 50% time remaining, +2 above 20%, 0 otherwise. Wrong or timed-out orders subtract `PENALTY(5)`, reset the streak to 0, and increment angry-customer count. See [`client/src/data/gameConstants.ts`](client/src/data/gameConstants.ts) for the full table.

## API Endpoints

All routes mount under `/api`. Every route reads `credentials` from the query string and verifies `interactivePublicKey === process.env.INTERACTIVE_KEY`.

| Method | Route                  | Auth               | Description                                                                                                                                                                                                                                                                                                         |
| ------ | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/system/health`       | —                  | Version + `NODE_ENV` / `INSTANCE_DOMAIN`. Never echoes interactive keys.                                                                                                                                                                                                                                            |
| `GET`  | `/game-state`          | Visitor            | Boot payload: `{ success, isAdmin, badges, visitorInventory, visitorStats }`. `?forceRefreshInventory=true` busts the 6h ecosystem badge cache.                                                                                                                                                                     |
| `GET`  | `/leaderboard`         | Visitor            | `{ success, leaderboard }` — top 25 by score.                                                                                                                                                                                                                                                                       |
| `POST` | `/leaderboard/reset`   | Client-gated admin | Clears the key asset's `leaderboard` map. Returns `{ alreadyEmpty: true }` if nothing to clear. Route itself has no server-side admin check.                                                                                                                                                                        |
| `POST` | `/game-end`            | Visitor            | Body: `{ correctOrders, incorrectOrders, angryCount, finalScore }`. Increments visitor stats (`gamesPlayed`, `lifetimeCorrectOrders`), updates leaderboard if `finalScore > 0`, and grants every eligible end-of-game badge in a single batched call. Returns `{ rank, leaderboard, visitorStats, grantedBadges }`. |
| `POST` | `/award-badge`         | Visitor            | Body: `{ badgeName }`. Grants the badge idempotently. Returns `{ granted, badgeName, icon }`.                                                                                                                                                                                                                       |
| `POST` | `/analytics/increment` | Visitor            | Body: `{ analyticName }`. Increments a Topia public-key analytic with `uniqueKey = profileId`.                                                                                                                                                                                                                      |

## Analytics

Analytics dual-write through two paths:

1. **Client-initiated:** `client/src/utils/analyticsAPI.ts` posts `{ analyticName }` to `POST /api/analytics/increment`, which calls `visitor.updatePublicKeyAnalytics([{ analyticName, profileId, uniqueKey: profileId, urlSlug }])`.
2. **Server-initiated on `/game-end`:** the two lifetime counters (`gamesPlayed`, `lifetimeCorrectOrders`) are incremented via `visitor.incrementDataObjectValue(..., { analytics: [...] })`, which increments both the data-object counter and the public-key analytic in one call.

| Event                 | Trigger                                                                                                   | Source                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gamesStarted`        | First order of a fresh run (first `advance()` when both `ordersServedGame === 0` and `angryCount === 0`). | `useOrderManager.advance` → `trackEvent`.                                                                                                           |
| `gamesCompleted`      | Session ends because the visitor hit 5 angry customers.                                                   | `useOrderManager.handleOrderFailure` → `trackEvent`.                                                                                                |
| `gamesEndedEarly`     | Visitor clicks "Close Shop" mid-run.                                                                      | `useOrderManager.handleManualCloseShop` → `trackEvent`.                                                                                             |
| `correctOrdersServed` | Correct order submitted.                                                                                  | `useOrderManager.handleServeOrder` → `trackEvent`.                                                                                                  |
| `wrongOrdersServed`   | Wrong order submitted.                                                                                    | `useOrderManager.handleServeOrder` → `trackEvent`.                                                                                                  |
| `ordersTimedout`      | Order timer expires.                                                                                      | `useOrderManager.advance` timeout callback → `trackEvent`.                                                                                          |
| `gamesPlayed`         | Any `POST /game-end` — one increment per completed run, regardless of outcome.                            | `handleGameEnd` → `visitor.incrementDataObjectValue("gamesPlayed", 1, { analytics })`.                                                              |
| `correctOrders`       | Any `POST /game-end` with `correctOrders > 0`; increment amount equals the run's correct-order count.     | `handleGameEnd` → `visitor.incrementDataObjectValue("lifetimeCorrectOrders", correctOrders, { analytics: [{ ..., incrementBy: correctOrders }] })`. |

There is no `gameCompleted` analytic for finishing level 4 cleanly. Successful level-4 completion (score becomes final via `endGame` inside `handleServeOrder`) does not currently emit an event — only the two failure modes (angry limit → `gamesCompleted`, manual close → `gamesEndedEarly`) do. `/game-end` fires afterwards regardless of exit mode.

## Environment Variables

Create a `.env` at the app root.

| Variable             | Required | Description                                                                                 |
| -------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `INTERACTIVE_KEY`    | Yes      | Topia interactive app public key. Verified against `interactivePublicKey` on every request. |
| `INTERACTIVE_SECRET` | Yes      | Topia interactive app secret used to sign SDK JWTs.                                         |
| `INSTANCE_DOMAIN`    | No       | Topia API domain. Defaults to `api.topia.io`. Use `api-stage.topia.io` for staging.         |
| `INSTANCE_PROTOCOL`  | No       | Defaults to `https`.                                                                        |
| `PORT`               | No       | Server port. Defaults to `3000`.                                                            |
| `NODE_ENV`           | No       | When `development`, permissive CORS is enabled and the static-file serve is skipped.        |

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Production Dashboard](https://topia.io/t/dashboard/integrations)
- [Topia Staging Dashboard](https://dev.topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the app root
npm install                # installs root, client, and server workspaces

# create a .env at the app root (see Environment Variables above)
cp .env-example .env

# run client + server together (concurrently)
npm run dev                # client on :3001 (Vite), server on :3000 (tsx watch)
```

To run the server test suite:

```bash
npm test --workspace=server
```

To build for production:

```bash
npm run build              # builds both workspaces
npm start                  # serves the built client from the server on :3000
```

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

### App-specific notes

- **Single source of truth for visitor state:** `server/utils/getVisitor.ts` is the only place that constructs a `Visitor`, fetches its inventory, and seeds `gamesPlayed` / `lifetimeCorrectOrders` on first use. Every controller that needs the visitor goes through it.
- **Batched end-of-game grant.** `handleGameEnd` collects every eligible badge for the run — accuracy, no-sub, clean-service, lifetime-threshold, and rank-based — then feeds them to `grantBadges` in one pass with a single ecosystem-inventory fetch. Only newly-granted badges flow back to the client so the `GameOver` screen only celebrates real new drops.
- **Idempotent badge grants.** Both `awardBadge` and `grantBadges` check `visitor.inventoryItems` before granting; a re-award returns `{ granted: false }` and the client suppresses the toast. Missing ecosystem badges warn once and no-op after a forced cache refresh.
- **Ecosystem inventory cache.** `server/utils/inventoryCache.ts` caches `Ecosystem.fetchInventoryItems()` in-memory for 6 hours with stale-fallback on error. Bust it with `?forceRefreshInventory=true` on `GET /game-state`.
- **Leaderboard writes.** `updateLeaderboard` uses dotted-path updates keyed by `profileId` so concurrent submits from different visitors don't stomp each other. It also short-circuits when the incoming score isn't strictly better than the visitor's existing entry.
- **Client owns the game loop.** `client/src/hooks/useOrderManager.ts` runs the timers, generates orders, computes points, and enforces every in-game badge trigger. Score, streak, angry count, and per-run counters are React state — nothing is written back to the server until `/game-end` fires from the `GameOver` screen.
- **Wall-clock timing for badges.** The rendered `timeRemaining` state ticks at 100 ms; badge thresholds (particularly the <5% `Last Minute Save`) use `Date.now() - orderStartTimeRef.current` so a serve on the last frame still qualifies.
- **Game-over transition is instant.** The `Game` phase hands `GameOverPayload` up to `Home`, which flips the phase immediately; the `/game-end` roundtrip is initiated by `GameOver` itself so the player sees the summary card while the server tallies rank + badges. `submittedRef` prevents the effect from double-firing on remount.
- **No admin gating on `/leaderboard/reset`.** The reset button is hidden from non-admins client-side (`ScoresTab` reads `isAdmin` from `/game-state`) but the route itself accepts any authenticated visitor. If admin-only reset matters for your deployment, add an `isAdmin` check to `handleResetLeaderboard`.
- **`cleanReturnPayload` middleware** strips protected fields from every JSON response before it goes out.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/kitchen-rush-dev), [Prod](https://topia.io/kitchen-rush-prod)
- [Notion One Pager](https://app.notion.com/p/topiaio/Grow-Together-28740e35bdb980fb9c8deedc5084a2d2?v=71f6c3828d3b4f33960326f9bde24781)
