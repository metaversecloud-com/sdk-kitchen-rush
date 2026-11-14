// Admin-only actions, anti-cheat and data integrity. Tests for bugs that still exist are marked
// test.fail(): they pass while the bug is there and turn red once it's fixed, so the marker goes away
// together with the fix.
import { INTERACTIVE_SECRET } from "../../constants";
import { expect, test } from "../../fixtures";
import { openApp } from "./kitchen";

const BOARD = { "maya-profile": "Maya|300", "leo-profile": "Leo|200" };

test.describe("resetting the leaderboard", () => {
  test("an admin resets it from the Scores tab", async ({ page, world }) => {
    await world.seed({ isAdmin: true, leaderboard: BOARD });
    await openApp(page, world);
    await page.getByRole("button", { name: "Scores" }).click();
    const dialogs: string[] = [];
    page.on("dialog", (dialog) => {
      dialogs.push(dialog.message());
      void dialog.accept();
    });

    await page.getByRole("button", { name: "Reset Leaderboard" }).click();

    await expect.poll(() => dialogs).toEqual(["Are you sure you want to reset the leaderboard?", "Leaderboard reset!"]);
    expect(await world.leaderboard()).toEqual({});

    // Again on the now empty board.
    await page.getByRole("button", { name: "Reset Leaderboard" }).click();
    await expect.poll(() => dialogs.at(-1)).toBe("Leaderboard is already empty.");
  });

  test("cancelling the confirmation keeps the board", async ({ page, world }) => {
    await world.seed({ isAdmin: true, leaderboard: BOARD });
    await openApp(page, world);
    await page.getByRole("button", { name: "Scores" }).click();
    page.on("dialog", (dialog) => void dialog.dismiss());

    await page.getByRole("button", { name: "Reset Leaderboard" }).click();

    await expect(page.locator("table tbody tr")).toHaveCount(2);
    expect(await world.leaderboard()).toEqual(BOARD);
  });

  test("players don't see the reset button", async ({ page, world }) => {
    await world.seed({ isAdmin: false, leaderboard: BOARD });
    await openApp(page, world);

    await page.getByRole("button", { name: "Scores" }).click();

    await expect(page.locator("table tbody tr")).toHaveCount(2);
    await expect(page.getByRole("button", { name: "Reset Leaderboard" })).toHaveCount(0);
  });

  test("a player can't wipe the leaderboard by calling the API", async ({ request, world }) => {
    test.fail(true, "EXP-446: /api/leaderboard/reset has no admin check");
    await world.seed({ isAdmin: false, leaderboard: BOARD });

    const response = await request.post(world.api("/leaderboard/reset"));

    expect(response.status()).toBe(403);
    expect(await world.leaderboard()).toEqual(BOARD);
  });

  test("the board on screen empties after an admin resets it", async ({ page, world }) => {
    test.fail(true, "EXP-446: ScoresTab doesn't pass onReset, so the old rows stay until the drawer is reopened");
    await world.seed({ isAdmin: true, leaderboard: BOARD });
    await openApp(page, world);
    await page.getByRole("button", { name: "Scores" }).click();
    page.on("dialog", (dialog) => void dialog.accept());

    await page.getByRole("button", { name: "Reset Leaderboard" }).click();
    await expect.poll(() => world.leaderboard()).toEqual({});

    await expect(page.getByText("No scores yet. Be the first!")).toBeVisible({ timeout: 2_000 });
  });
});

test.describe("score integrity", () => {
  test("a score no real shift could reach is rejected", async ({ request, world }) => {
    test.fail(true, "EXP-446: /api/game-end stores whatever finalScore the client sends");
    await world.seed({ leaderboard: BOARD });

    // No orders served, yet a million points.
    const response = await request.post(world.api("/game-end"), {
      data: { correctOrders: 0, incorrectOrders: 0, angryCount: 0, finalScore: 1_000_000 },
    });

    expect((await response.json()).rank).not.toBe(1);
    expect(await world.leaderboard()).toEqual(BOARD);
  });

  test("lifetime badges can't be claimed by reporting hundreds of orders in one game", async ({ request, world }) => {
    test.fail(true, "EXP-446: /api/game-end adds the client's correctOrders to the lifetime total unchecked");
    await world.seed();

    // One request; a real level-4 order takes seconds, so 300 orders is a long shift.
    await request.post(world.api("/game-end"), {
      data: { correctOrders: 300, incorrectOrders: 0, angryCount: 0, finalScore: 0 },
    });

    expect(await world.grantedBadges()).not.toContain("Master Chef");
    expect((await world.visitorData()).lifetimeCorrectOrders).toBeLessThan(300);
  });

  test("/api/award-badge can't hand out end-of-game badges", async ({ request, world }) => {
    test.fail(true, "EXP-446: /api/award-badge grants any badge by name, with no check that it was earned");
    await world.seed();

    for (const badgeName of ["Number 1", "Master Chef", "No Substitutions"]) {
      await request.post(world.api("/award-badge"), { data: { badgeName } });
    }

    expect(await world.grantedBadges()).toEqual([]);
  });

  test("/api/analytics/increment only records Kitchen Rush's own analytics", async ({ request, world }) => {
    test.fail(true, "EXP-446: /api/analytics/increment forwards any analyticName to Topia");
    await world.seed();

    const response = await request.post(world.api("/analytics/increment"), { data: { analyticName: "gamesPlayed" } });
    await request.post(world.api("/analytics/increment"), { data: { analyticName: "anything-i-like" } });

    // gamesPlayed is the server's own per-game analytic; a client call must not inflate it.
    expect(response.ok()).toBe(false);
    expect(await world.analytics()).toEqual([]);
  });
});

test.describe("player identity on the leaderboard", () => {
  test("the name on the board is the player's Topia name, not one sent with the request", async ({
    request,
    world,
  }) => {
    test.fail(true, "EXP-446: the board uses displayName from the query string");
    await world.seed();

    await request.post(world.api("/game-end", { displayName: "Maya" }), { data: { correctOrders: 5, finalScore: 95 } });

    expect(await world.leaderboard()).toEqual({ [world.profileId]: "E2E Player|95" });
  });

  test('a "|" in a display name can\'t change the score on the board', async ({ request, world }) => {
    test.fail(true, 'EXP-446: entries are stored as "name|score" and parsed with split("|")');
    await world.seed({ leaderboard: BOARD });

    const response = await request.post(world.api("/game-end", { displayName: "Eve|99999" }), {
      data: { correctOrders: 1, finalScore: 15 },
    });

    const { leaderboard } = await response.json();
    expect(leaderboard[0]).toMatchObject({ displayName: "Maya", score: 300 });
    expect(leaderboard.find((e: { profileId: string }) => e.profileId === world.profileId).score).toBe(15);
  });
});

test.describe("data integrity", () => {
  test("a badge granted while the first game ends doesn't wipe that game's stats", async ({ request, world }) => {
    test.fail(true, "EXP-446: getVisitor re-sets the visitor data object to zeros while gamesPlayed is 0");
    // Visitor writes take 400 ms, so the two requests overlap the way they do when an in-game badge
    // (e.g. Oops on the last miss) is granted as the shift ends.
    await world.seed({ delays: { "/visitors/42/set-data-object": 400 } });

    const gameEnd = request.post(world.api("/game-end"), { data: { correctOrders: 6, incorrectOrders: 5, angryCount: 5 } });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const badge = request.post(world.api("/award-badge"), { data: { badgeName: "Oops" } });
    await Promise.all([gameEnd, badge]);

    expect(await world.visitorData()).toEqual({ gamesPlayed: 1, lifetimeCorrectOrders: 6 });
  });

  test("error responses never carry the interactive secret", async ({ request, world }) => {
    // The key asset is gone, so every asset call fails inside the SDK.
    await world.seed({ withAsset: false });

    const responses = [
      await request.get(world.api("/leaderboard")),
      await request.post(world.api("/leaderboard/reset")),
      await request.post(world.api("/game-end"), { data: { correctOrders: 1, finalScore: 10 } }),
    ];

    for (const response of responses) {
      expect(response.ok()).toBe(false);
      const body = await response.text();
      for (const marker of [INTERACTIVE_SECRET, "interactiveSecret", "InteractiveJWT"]) expect(body).not.toContain(marker);
    }
  });
});
