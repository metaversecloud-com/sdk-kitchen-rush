// The drawer's home screen: Game, Scores and Badges tabs, and what loading it writes to Topia.
import { expect, test } from "../../fixtures";
import { openApp } from "./kitchen";

test("opens on the Game tab with the rules and a Start Game button", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);

  await expect(page.getByRole("heading", { name: "Kitchen Rush" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to Play" })).toBeVisible();
  await expect(page.getByText("5 angry customers = game over")).toBeVisible();
  await expect(page.getByRole("button", { name: "Scores" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Badges" })).toBeVisible();
});

test("asks to open the app inside a Topia world when credentials are missing", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Missing Interactive Parameters" })).toBeVisible();
});

test("first load sets up the visitor's stats and the key asset's leaderboard", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await page.getByRole("button", { name: "Scores" }).click();
  await expect(page.getByText("No scores yet. Be the first!")).toBeVisible();

  expect(await world.visitorData()).toEqual({ gamesPlayed: 0, lifetimeCorrectOrders: 0 });
  expect(await world.assetData()).toEqual({ leaderboard: {} });
});

test("a returning player's stats are left as they are", async ({ page, world }) => {
  const visitorData = { gamesPlayed: 4, lifetimeCorrectOrders: 37 };
  await world.seed({ visitorData, leaderboard: { "someone-else": "Maya|120" } });
  await openApp(page, world);
  await page.getByRole("button", { name: "Scores" }).click();
  await expect(page.getByRole("cell", { name: "Maya" })).toBeVisible();

  expect(await world.visitorData()).toEqual(visitorData);
  expect(await world.leaderboard()).toEqual({ "someone-else": "Maya|120" });
});

test.describe("Scores tab", () => {
  test("ranks the top 25 by score and highlights the player's own row", async ({ page, world }) => {
    const leaderboard: Record<string, string> = { [world.profileId]: "E2E Player|150" };
    // 30 other players scoring 10..300: the player's 150 is 16th.
    for (let i = 1; i <= 30; i++) leaderboard[`p${i}`] = `Player ${i}|${i * 10}`;
    await world.seed({ leaderboard });
    await openApp(page, world);

    await page.getByRole("button", { name: "Scores" }).click();

    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(25);
    await expect(rows.first()).toHaveText(["1", "Player 30", "300"].join(""));
    await expect(rows.nth(15)).toHaveText(["16", "E2E Player", "150"].join(""));
    await expect(rows.nth(15)).toHaveClass(/highlight/);
    await expect(page.locator(".highlight")).toHaveCount(1);
    await expect(page.locator(".warning-card", { hasText: "My Best Score" })).toContainText("150");
    await expect(page.getByRole("cell", { name: "Player 5", exact: true })).toHaveCount(0);
  });

  test("tells a player without a score how to get on the board", async ({ page, world }) => {
    await world.seed({ leaderboard: { "someone-else": "Maya|120" } });
    await openApp(page, world);

    await page.getByRole("button", { name: "Scores" }).click();

    await expect(page.getByText("No score yet — play a game to make the board.")).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(1);
  });

  test("shows an error instead of a board when the key asset is gone", async ({ page, world }) => {
    await world.seed({ withAsset: false });
    await openApp(page, world);

    await page.getByRole("button", { name: "Scores" }).click();

    await expect(page.getByText("Failed to load leaderboard.")).toBeVisible();
  });
});

test.describe("Badges tab", () => {
  test("lists every active badge, in colour when owned and grey when not", async ({ page, world }) => {
    await world.seed({ badges: ["First Order", "Sharp Chef"] });
    await openApp(page, world);

    await page.getByRole("button", { name: "Badges" }).click();

    const badges = page.locator(".tooltip img");
    await expect(badges).toHaveCount(21);
    await expect(page.getByRole("img", { name: "First Order" })).toHaveCSS("filter", "none");
    await expect(page.getByRole("img", { name: "Sharp Chef" })).toHaveCSS("filter", "none");
    await expect(page.getByRole("img", { name: "Number 1" })).toHaveCSS("filter", "grayscale(1)");
    // Inactive badges and non-badge items aren't shown.
    await expect(page.getByRole("img", { name: "Retired Badge" })).toHaveCount(0);
    await expect(page.getByRole("img", { name: "Coffee Mug" })).toHaveCount(0);
    await expect(page.locator(".tooltip", { hasText: "Number 1" }).locator(".tooltip-content")).toHaveText(
      "Number 1 description",
    );
  });
});
