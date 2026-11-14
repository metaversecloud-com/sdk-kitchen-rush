// Helpers for driving Kitchen Rush's drawer. Orders are random, so the helpers read the order card
// and click the matching ingredient buttons, the way a player does.
import { Page, expect } from "@playwright/test";
import { TopiaWorld } from "../../fixtures";

// Order card row label -> ingredient grid row label.
const INGREDIENT_ROW: Record<string, string> = {
  Size: "Size",
  Temp: "Temperature",
  Milk: "Milk",
  Flavor: "Flavor",
  Toppings: "Toppings",
};

export type OrderCard = Record<string, string[]>;

export const hud = (page: Page, label: "Level" | "Score" | "Streak") =>
  page.locator(".hud-item", { has: page.locator(".hud-label", { hasText: label }) });

export const angry = (page: Page) => page.locator(".hud-item", { hasText: "😡" });

export const toast = (page: Page) => page.locator(".toast");

/** Opens the drawer as Topia does and waits for the home screen. */
export async function openApp(page: Page, world: TopiaWorld) {
  await page.goto(world.url("/"));
  await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
}

/** Home -> level 1 intermission -> first order on screen. */
export async function startGame(page: Page) {
  await page.getByRole("button", { name: "Start Game" }).click();
  await startBrewing(page);
}

export async function startBrewing(page: Page) {
  await page.getByRole("button", { name: "Start Brewing" }).click();
  await expect(page.locator(".recipe-panel")).toBeVisible();
}

/** Installs a stopped page clock before the app loads: game time only moves with page.clock.runFor(). */
export async function freezeClock(page: Page) {
  const start = new Date("2026-01-01T12:00:00Z").getTime();
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start + 1_000);
}

/** The order on screen, e.g. { Size: ["small"], Temp: ["hot"], Milk: ["No milk"], Toppings: ["Whipped", "cinnamon"] }. */
export async function readOrder(page: Page): Promise<OrderCard> {
  const order: OrderCard = {};
  let category = "";
  for (const row of await page.locator(".recipe-panel .recipe-row").all()) {
    // textContent, not innerText: the labels are text-transform: capitalize on screen.
    const label = (await row.locator(".recipe-row__label").textContent())!.trim();
    if (label) category = label;
    const value = (await row.locator(".recipe-row__text").textContent())!.trim();
    if (category === "Toppings" && value === "None") continue;
    (order[category] ||= []).push(value);
  }
  return order;
}

export async function pick(page: Page, category: string, option: string) {
  const row = page.locator(".ingredient-row", {
    has: page.locator(".ingredient-row__label", { hasText: INGREDIENT_ROW[category] }),
  });
  await row.getByRole("button", { name: option, exact: true }).click();
}

/** Puts exactly what the order asks for on the tray. */
export async function fillTray(page: Page, order?: OrderCard) {
  order ??= await readOrder(page);
  for (const [category, values] of Object.entries(order)) {
    for (const value of values) await pick(page, category, value);
  }
  return order;
}

/** Fills the tray with the wrong size (everything else right). */
export async function fillWrongTray(page: Page) {
  const order = await readOrder(page);
  const wrongSize = ["small", "medium", "large"].find((size) => size !== order.Size[0])!;
  await fillTray(page, { ...order, Size: [wrongSize] });
}

export async function serve(page: Page) {
  await page.getByRole("button", { name: "Serve Order" }).click();
}

/** Serves the current order correctly and waits for the next order (or screen) to replace it. */
export async function serveCorrectOrder(page: Page) {
  await fillTray(page);
  await serve(page);
}

export async function serveWrongOrder(page: Page) {
  await fillWrongTray(page);
  await serve(page);
}

/** Serves `count` correct orders as fast as the test can click (every one earns the top speed bonus). */
export async function serveCorrectOrders(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    await expect(page.locator(".recipe-panel")).toBeVisible();
    // The tray is emptied after every serve; wait for it so the next clicks go to the new order.
    await expect(page.locator(".recipe-row__slot--filled")).toHaveCount(0);
    await serveCorrectOrder(page);
  }
}

/** Value shown next to a label on the Game Over card ("Points Earned", "Orders Served", "Leaderboard"). */
export const gameOverStat = (page: Page, label: string) =>
  page.locator(".info-card .flex", { has: page.getByText(label, { exact: true }) }).locator("span").nth(1);
