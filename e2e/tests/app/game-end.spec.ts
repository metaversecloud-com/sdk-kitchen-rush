// POST /api/game-end and the leaderboard on the key asset, called the way the Game Over screen does.
import { expect, test } from "../../fixtures";

const gameEnd = (stats: Record<string, unknown>) => ({ data: stats });

test("records the game: one more game played, lifetime correct orders, and their analytics", async ({
  request,
  world,
}) => {
  await world.seed({ visitorData: { gamesPlayed: 2, lifetimeCorrectOrders: 20 } });

  const response = await request.post(
    world.api("/game-end"),
    gameEnd({ correctOrders: 7, incorrectOrders: 2, angryCount: 2, finalScore: 120 }),
  );

  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body).toMatchObject({ success: true, rank: 1, visitorStats: { gamesPlayed: 3, lifetimeCorrectOrders: 27 } });
  expect(body.leaderboard).toEqual([{ profileId: world.profileId, displayName: "E2E Player", score: 120 }]);
  expect(await world.visitorData()).toEqual({ gamesPlayed: 3, lifetimeCorrectOrders: 27 });
  const analytics = await world.events("analytics");
  expect(analytics).toContainEqual(expect.objectContaining({ analyticName: "gamesPlayed", uniqueKey: world.profileId }));
  expect(analytics).toContainEqual(expect.objectContaining({ analyticName: "correctOrders", incrementBy: 7 }));
});

test("a game without a correct order doesn't touch lifetime orders", async ({ request, world }) => {
  await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 4 } });

  await request.post(world.api("/game-end"), gameEnd({ correctOrders: 0, incorrectOrders: 5, angryCount: 5, finalScore: 0 }));

  expect(await world.visitorData()).toEqual({ gamesPlayed: 2, lifetimeCorrectOrders: 4 });
  expect(await world.analytics()).toEqual(["gamesPlayed"]);
});

test("only a new personal best replaces the player's score on the board", async ({ request, world }) => {
  await world.seed({ leaderboard: { [world.profileId]: "E2E Player|100", other: "Maya|150" } });

  for (const finalScore of [90, 100]) {
    const response = await request.post(world.api("/game-end"), gameEnd({ correctOrders: 5, finalScore }));
    expect((await response.json()).rank).toBe(2);
    expect((await world.leaderboard())![world.profileId], `after ${finalScore}`).toBe("E2E Player|100");
  }

  const response = await request.post(world.api("/game-end"), gameEnd({ correctOrders: 9, finalScore: 200 }));

  const body = await response.json();
  expect(body.rank).toBe(1);
  expect(body.leaderboard.map((e: { score: number }) => e.score)).toEqual([200, 150]);
  expect(await world.leaderboard()).toEqual({ [world.profileId]: "E2E Player|200", other: "Maya|150" });
});

test("a score of 0 doesn't put the player on the board", async ({ request, world }) => {
  await world.seed({ leaderboard: { other: "Maya|150" } });

  const response = await request.post(world.api("/game-end"), gameEnd({ correctOrders: 0, incorrectOrders: 5, finalScore: 0 }));

  expect((await response.json()).rank).toBeNull();
  expect(await world.leaderboard()).toEqual({ other: "Maya|150" });
});

test("bad stat values count as 0 instead of corrupting stats or the board", async ({ request, world }) => {
  await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 4 } });

  const response = await request.post(
    world.api("/game-end"),
    gameEnd({ correctOrders: "lots", incorrectOrders: -3, angryCount: null, finalScore: -50 }),
  );

  expect(response.ok()).toBe(true);
  expect(await world.visitorData()).toEqual({ gamesPlayed: 2, lifetimeCorrectOrders: 4 });
  expect(await world.leaderboard()).toEqual({});
});

test("players finishing at the same moment all land on the board", async ({ request, world }) => {
  const players = [43, 44, 45, 46, 47].map((visitorId, i) => ({
    visitorId,
    profileId: `profile-${visitorId}`,
    displayName: `Chef ${i + 1}`,
    score: 100 + i * 10,
  }));
  await world.seed({ otherVisitors: Object.fromEntries(players.map((p) => [p.visitorId, p])) });

  await Promise.all(
    players.map((p) =>
      request.post(
        world.api("/game-end", { visitorId: String(p.visitorId), profileId: p.profileId, displayName: p.displayName }),
        gameEnd({ correctOrders: 5, finalScore: p.score }),
      ),
    ),
  );

  expect(await world.leaderboard()).toEqual(
    Object.fromEntries(players.map((p) => [p.profileId, `${p.displayName}|${p.score}`])),
  );
});

test("the board returned with the result lists at most 25 players, best first", async ({ request, world }) => {
  const leaderboard: Record<string, string> = {};
  for (let i = 1; i <= 30; i++) leaderboard[`p${i}`] = `Player ${i}|${i * 10}`;
  await world.seed({ leaderboard });

  // 25 players scored more than 55: the score is stored, but 26th is off the top 25 and has no rank.
  const response = await request.post(world.api("/game-end"), gameEnd({ correctOrders: 5, finalScore: 55 }));

  const body = await response.json();
  expect(body.leaderboard).toHaveLength(25);
  expect(body.leaderboard[0]).toEqual({ profileId: "p30", displayName: "Player 30", score: 300 });
  expect(body.rank).toBeNull();
  expect((await world.leaderboard())![world.profileId]).toBe("E2E Player|55");
});
