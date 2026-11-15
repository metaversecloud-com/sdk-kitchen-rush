# Kitchen Rush tests

The game runs in the browser, so `gameplay.spec.ts` plays it: `kitchen.ts` reads the random order card and
clicks the matching ingredients. The page clock is installed stopped (`freezeClock`), so order timers only move
with `page.clock.runFor()` and speed bonuses, time-outs and Last Minute Save are exact. Server rules
(`/api/game-end`, `/api/award-badge`) are tested through the API in `game-end.spec.ts` and `rewards.spec.ts`;
known bugs (EXP-446) are in `security.spec.ts`.

On top of the shared mock and fixtures:

- `mock-topia/catalog.json`: the ecosystem inventory is Kitchen Rush's 21 badges, plus an inactive badge and a
  non-badge item.
- `world.seed({ leaderboard })`, `world.leaderboard()`, `world.grantedBadges()`, `world.analytics()` (fixtures.ts).
