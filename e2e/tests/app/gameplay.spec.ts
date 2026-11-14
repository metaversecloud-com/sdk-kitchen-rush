// A shift in the browser: orders, scoring, timers, levels and the end of the game. Scoring per
// correct order = 10 x streak multiplier (x1 under a streak of 3, x2 from 3) + speed bonus (5 with
// more than half the time left, 2 above 20 %, else 0). A miss costs 5 points (never below 0) and an
// angry customer. The page clock is stopped: game time only moves with page.clock.runFor().
import { expect, test } from "../../fixtures";
import {
  angry,
  fillTray,
  fillWrongTray,
  freezeClock,
  gameOverStat,
  hud,
  openApp,
  pick,
  readOrder,
  serve,
  serveCorrectOrder,
  serveCorrectOrders,
  serveWrongOrder,
  startBrewing,
  startGame,
  toast,
} from "./kitchen";

test.beforeEach(async ({ page }) => {
  await freezeClock(page);
});

test("Start Game shows the level 1 intro, then a size/temp/milk order with a 15 s timer", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);

  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByText("Level 1")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Warm-Up" })).toBeVisible();
  await expect(page.locator(".stats-preview")).toHaveText("Score: 0 | Angry: 0/5");
  await startBrewing(page);

  await expect(hud(page, "Level")).toContainText("Warm-Up");
  await expect(hud(page, "Score")).toContainText("0");
  await expect(angry(page)).toHaveText("😡 0/5");
  await expect(page.locator(".hud-item", { hasText: "⏱️" })).toHaveText("⏱️ 15s");
  expect(Object.keys(await readOrder(page))).toEqual(["Size", "Temp", "Milk"]);
  // Level 1 offers no flavours or toppings.
  await expect(page.locator(".ingredient-row__label")).toHaveText(["Size", "Temperature", "Milk"]);
  await expect.poll(() => world.analytics()).toContain("gamesStarted");
});

test("a correct, fast order scores 15 and starts a streak", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  await serveCorrectOrder(page);

  await expect(toast(page)).toHaveText("Perfect!");
  await expect(hud(page, "Score")).toContainText("15");
  await expect(hud(page, "Streak")).toContainText("1");
  await expect(angry(page)).toHaveText("😡 0/5");
  // A fresh order with an empty tray and a full timer.
  await expect(page.locator(".recipe-row__slot--filled")).toHaveCount(0);
  await expect(page.locator(".hud-item", { hasText: "⏱️" })).toHaveText("⏱️ 15s");
  await expect.poll(() => world.analytics()).toContain("correctOrdersServed");
  await expect.poll(() => world.grantedBadges()).toEqual(["First Order"]);
});

test("a wrong order costs 5 points, the streak and an angry customer", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  // A miss at 0 points doesn't go negative.
  await serveWrongOrder(page);
  await expect(toast(page)).toHaveText("Oops, wrong order!");
  await expect(hud(page, "Score")).toContainText("0");
  await expect(angry(page)).toHaveText("😡 1/5");

  await serveCorrectOrder(page);
  await serveCorrectOrder(page);
  await expect(hud(page, "Score")).toContainText("30");
  await expect(hud(page, "Streak")).toContainText("2");

  await serveWrongOrder(page);
  await expect(hud(page, "Score")).toContainText("25");
  await expect(hud(page, "Streak")).toContainText("0");
  await expect(angry(page)).toHaveText("😡 2/5");
  await expect.poll(() => world.analytics()).toContain("wrongOrdersServed");
});

test("an incomplete tray is a wrong order", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);
  const order = await readOrder(page);

  // Everything but the size.
  await pick(page, "Temp", order.Temp[0]);
  await pick(page, "Milk", order.Milk[0]);
  await serve(page);

  await expect(toast(page)).toHaveText("Oops, wrong order!");
  await expect(angry(page)).toHaveText("😡 1/5");
});

test("a picked ingredient locks its row until the order is served", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  await pick(page, "Size", "small");

  const sizeRow = page.locator(".ingredient-row", { hasText: "Size" });
  await expect(sizeRow).toHaveClass(/ingredient-row--locked/);
  await expect(sizeRow.getByRole("button", { name: "large", exact: true })).toBeDisabled();
  await expect(sizeRow.getByRole("button", { name: "small", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".ingredient-row", { hasText: "Temperature" }).getByRole("button").first()).toBeEnabled();
});

test("the speed bonus shrinks as the timer runs down", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  // ~35 % of the time left: 10 + 2.
  await fillTray(page);
  await page.clock.runFor(9_500);
  await serve(page);
  await expect(hud(page, "Score")).toContainText("12");

  // ~15 % left: 10 + 0.
  await fillTray(page);
  await page.clock.runFor(12_700);
  await serve(page);
  await expect(hud(page, "Score")).toContainText("22");
  await expect(angry(page)).toHaveText("😡 0/5");
});

test("a streak of 3 doubles the base points", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  // 15 + 15 + 15, then the 4th order is worth 10 x 2 + 5.
  await serveCorrectOrders(page, 4);

  await expect(hud(page, "Score")).toContainText("70");
  await expect(hud(page, "Streak")).toContainText("4");
});

test("a customer who waits the full 15 s leaves angry and the next one arrives", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  await page.clock.runFor(14_000);
  await expect(angry(page)).toHaveText("😡 0/5");
  await page.clock.runFor(1_100);

  await expect(toast(page)).toHaveText("Customer got tired of waiting!");
  await expect(angry(page)).toHaveText("😡 1/5");
  await expect(page.locator(".hud-item", { hasText: "⏱️" })).toHaveText("⏱️ 15s");
  await expect(page.locator(".recipe-row__slot--filled")).toHaveCount(0);
  await expect.poll(() => world.analytics()).toContain("ordersTimedout");
});

test("serving just before time runs out still counts and earns Last Minute Save", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  await fillTray(page);
  await page.clock.runFor(14_300);
  await serve(page);

  await expect(toast(page)).toHaveText("Perfect!");
  await expect(hud(page, "Score")).toContainText("10");
  await expect.poll(() => world.grantedBadges()).toContain("Last Minute Save");
});

test("five correct orders clear Warm-Up and carry the score into Lunch Rush, which adds flavours", async ({
  page,
  world,
}) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);

  await serveCorrectOrders(page, 5);

  // 15 + 15 + 15 + 25 + 25.
  await expect(page.getByText("Level 2")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lunch Rush" })).toBeVisible();
  await expect(page.locator(".stats-preview")).toHaveText("Score: 95 | Angry: 0/5");
  // The fifth in a row is a streak milestone.
  await expect.poll(() => world.grantedBadges()).toEqual(expect.arrayContaining(["First Order", "Perfect Plate"]));

  await startBrewing(page);
  await expect(hud(page, "Level")).toContainText("Lunch Rush");
  await expect(hud(page, "Score")).toContainText("95");
  await expect(hud(page, "Streak")).toContainText("5");
  await expect(page.locator(".hud-item", { hasText: "⏱️" })).toHaveText("⏱️ 12s");
  expect(Object.keys(await readOrder(page))).toEqual(["Size", "Temp", "Milk", "Flavor"]);
});

test("Dinner Rush adds toppings, which can go on in any order", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);
  await serveCorrectOrders(page, 5);
  await startBrewing(page);
  await serveCorrectOrders(page, 6);

  await expect(page.getByRole("heading", { name: "Dinner Rush" })).toBeVisible();
  await startBrewing(page);
  await expect(page.locator(".hud-item", { hasText: "⏱️" })).toHaveText("⏱️ 10s");
  const order = await readOrder(page);
  expect(order.Toppings.length).toBeGreaterThanOrEqual(1);

  await fillTray(page, { ...order, Toppings: [...order.Toppings].reverse() });
  await serve(page);

  await expect(toast(page)).toHaveText("Perfect!");
  await expect(hud(page, "Streak")).toContainText("12");
});

test("the fifth angry customer ends the shift and the result is sent once", async ({ page, world }) => {
  await world.seed();
  await openApp(page, world);
  await startGame(page);
  const gameEnds: unknown[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/game-end")) gameEnds.push(request.postDataJSON());
  });

  await serveCorrectOrder(page);
  for (let i = 0; i < 5; i++) {
    await expect(page.locator(".recipe-row__slot--filled")).toHaveCount(0);
    await serveWrongOrder(page);
  }

  await expect(page.getByRole("heading", { name: "Game Over" })).toBeVisible();
  // 15, then five misses of 5 (floored at 0).
  await expect(gameOverStat(page, "Points Earned")).toHaveText("0");
  await expect(gameOverStat(page, "Orders Served")).toHaveText("1");
  await expect(gameOverStat(page, "Leaderboard")).toHaveText("—");
  expect(gameEnds).toEqual([{ correctOrders: 1, incorrectOrders: 5, angryCount: 5, finalScore: 0 }]);
  // Three misses in a row.
  await expect.poll(() => world.grantedBadges()).toContain("Oops");
  await expect.poll(() => world.analytics()).toContain("gamesCompleted");
  expect(await world.visitorData()).toEqual({ gamesPlayed: 1, lifetimeCorrectOrders: 1 });
});

test("Close Shop ends the shift, posts the score and shows rank and new badges", async ({ page, world }) => {
  await world.seed({ leaderboard: { "someone-else": "Maya|30" } });
  await openApp(page, world);
  await startGame(page);
  await serveCorrectOrders(page, 3);

  await page.getByRole("button", { name: "Close Shop" }).click();

  await expect(page.getByRole("heading", { name: "Game Over" })).toBeVisible();
  await expect(gameOverStat(page, "Points Earned")).toHaveText("45");
  await expect(gameOverStat(page, "Orders Served")).toHaveText("3");
  await expect(gameOverStat(page, "Leaderboard")).toHaveText("1st");
  const newBadges = page.locator(".card", { has: page.getByRole("heading", { name: "New Badges" }) });
  for (const badge of ["Open for Business", "Sharp Chef", "Clean Service", "On the Board", "Top 10", "Number 1"]) {
    await expect(newBadges.getByText(badge, { exact: true })).toBeVisible();
  }
  await expect(page.locator("table tbody tr")).toHaveText(["1E2E Player45", "2Maya30"]);
  await expect(page.locator("tr.highlight")).toHaveText("1E2E Player45");

  expect(await world.leaderboard()).toEqual({ "someone-else": "Maya|30", [world.profileId]: "E2E Player|45" });
  expect(await world.visitorData()).toEqual({ gamesPlayed: 1, lifetimeCorrectOrders: 3 });
  await expect.poll(() => world.analytics()).toContain("gamesEndedEarly");
});

test("Play Again starts over from zero and a lower score keeps the best one", async ({ page, world }) => {
  await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 3 }, leaderboard: {} });
  await openApp(page, world);
  await startGame(page);
  await serveCorrectOrders(page, 2);
  await page.getByRole("button", { name: "Close Shop" }).click();
  await expect(gameOverStat(page, "Leaderboard")).toHaveText("1st");

  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  await startGame(page);
  await expect(hud(page, "Score")).toContainText("0");
  await expect(angry(page)).toHaveText("😡 0/5");
  await serveCorrectOrders(page, 1);
  await page.getByRole("button", { name: "Close Shop" }).click();

  await expect(gameOverStat(page, "Points Earned")).toHaveText("15");
  await expect(page.locator("table tbody tr")).toHaveText(["1E2E Player30"]);
  expect(await world.leaderboard()).toEqual({ [world.profileId]: "E2E Player|30" });
  expect(await world.visitorData()).toEqual({ gamesPlayed: 3, lifetimeCorrectOrders: 6 });
  // Third game played.
  await expect.poll(() => world.grantedBadges()).toContain("Back in the Kitchen");
});

test("each level's intro states the timer the level really uses", async ({ page, world }) => {
  test.fail(true, "EXP-446: level intros say 12/10/8/7 s, the timers are 15/12/10/8 s");
  await world.seed();
  await openApp(page, world);

  await page.getByRole("button", { name: "Start Game" }).click();
  const intro = await page.locator(".card li", { hasText: "Timer" }).innerText();
  await startBrewing(page);

  const timer = await page.locator(".hud-item", { hasText: "⏱️" }).innerText();
  expect(intro).toContain(`${timer.replace("⏱️ ", "").replace("s", "")} seconds`);
});
