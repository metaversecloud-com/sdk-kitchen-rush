// Badges: the end-of-game rules in POST /api/game-end and the in-game grants through POST /api/award-badge.
import { expect, test } from "../../fixtures";

const endGame = (stats: Record<string, number>) => ({ data: { angryCount: 1, finalScore: 0, ...stats } });
const newBadges = async (response: { json(): Promise<any> }) =>
  ((await response.json()).grantedBadges as Array<{ name: string }>).map((b) => b.name).sort();

test.describe("end-of-game badges", () => {
  test("Open for Business on the first game, Back in the Kitchen from the third", async ({ request, world }) => {
    await world.seed();

    const first = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5 }));
    expect(await newBadges(first)).toEqual(["Open for Business"]);
    const second = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5 }));
    expect(await newBadges(second)).toEqual([]);
    const third = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5 }));
    expect(await newBadges(third)).toEqual(["Back in the Kitchen"]);
  });

  test("Sharp Chef needs at least 80 % of orders right", async ({ request, world }) => {
    await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 0 } });

    // 15 of 19 is 78.9 %.
    const below = await request.post(world.api("/game-end"), endGame({ correctOrders: 15, incorrectOrders: 4 }));
    expect(await newBadges(below)).not.toContain("Sharp Chef");
    const exactly = await request.post(world.api("/game-end"), endGame({ correctOrders: 4, incorrectOrders: 1 }));
    expect(await newBadges(exactly)).toContain("Sharp Chef");
  });

  test("No Substitutions needs 10 correct orders and no mistakes", async ({ request, world }) => {
    await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 0 } });

    const oneMistake = await request.post(world.api("/game-end"), endGame({ correctOrders: 12, incorrectOrders: 1 }));
    expect(await newBadges(oneMistake)).not.toContain("No Substitutions");
    const nine = await request.post(world.api("/game-end"), endGame({ correctOrders: 9, incorrectOrders: 0 }));
    expect(await newBadges(nine)).not.toContain("No Substitutions");
    const ten = await request.post(world.api("/game-end"), endGame({ correctOrders: 10, incorrectOrders: 0 }));
    expect(await newBadges(ten)).toContain("No Substitutions");
  });

  test("Clean Service needs no angry customers and at least one correct order", async ({ request, world }) => {
    await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 0 } });

    const nothingServed = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, angryCount: 0 }));
    expect(await newBadges(nothingServed)).not.toContain("Clean Service");
    const oneAngry = await request.post(world.api("/game-end"), endGame({ correctOrders: 3, angryCount: 1 }));
    expect(await newBadges(oneAngry)).not.toContain("Clean Service");
    const clean = await request.post(world.api("/game-end"), endGame({ correctOrders: 3, angryCount: 0 }));
    expect(await newBadges(clean)).toContain("Clean Service");
  });

  test("lifetime badges unlock at 25, 100, 250 and 300 correct orders", async ({ request, world }) => {
    // Back in the Kitchen is owned already (it's due from the third game on).
    await world.seed({ visitorData: { gamesPlayed: 5, lifetimeCorrectOrders: 24 }, badges: ["Back in the Kitchen"] });

    const lineCook = await request.post(world.api("/game-end"), endGame({ correctOrders: 1, incorrectOrders: 5 }));
    expect(await newBadges(lineCook)).toEqual(["Line Cook"]);

    await world.seed({ visitorData: { gamesPlayed: 5, lifetimeCorrectOrders: 290 }, badges: ["Back in the Kitchen", "Line Cook"] });
    const all = await request.post(world.api("/game-end"), endGame({ correctOrders: 10, incorrectOrders: 5 }));
    expect(await newBadges(all)).toEqual(["Head Chef", "Master Chef", "Sous Chef"]);
  });

  test("placement badges: On the Board, Top 10 and Number 1", async ({ request, world }) => {
    const leaderboard: Record<string, string> = {};
    for (let i = 1; i <= 10; i++) leaderboard[`p${i}`] = `Player ${i}|${i * 100}`;
    await world.seed({ visitorData: { gamesPlayed: 1, lifetimeCorrectOrders: 0 }, badges: ["Back in the Kitchen"], leaderboard });

    // 11th.
    const eleventh = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5, finalScore: 50 }));
    expect(await newBadges(eleventh)).toEqual(["On the Board"]);
    // 10th.
    const tenth = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5, finalScore: 150 }));
    expect(await newBadges(tenth)).toEqual(["Top 10"]);
    // 1st.
    const first = await request.post(world.api("/game-end"), endGame({ correctOrders: 0, incorrectOrders: 5, finalScore: 1500 }));
    expect(await newBadges(first)).toEqual(["Number 1"]);
  });

  test("badges the player already owns aren't granted or announced again", async ({ request, world }) => {
    await world.seed({ badges: ["Open for Business", "Sharp Chef"] });

    const response = await request.post(world.api("/game-end"), endGame({ correctOrders: 3, incorrectOrders: 0, finalScore: 45 }));

    // First game, perfect accuracy, rank 1: only the new ones come back.
    expect(await newBadges(response)).toEqual(["Number 1", "On the Board", "Top 10"]);
    expect((await world.grantedBadges()).sort()).toEqual(["Number 1", "On the Board", "Top 10"]);
    const toasts = await world.events("fire-toast");
    expect(toasts.map((t) => t.text).sort()).toEqual([
      "You earned the Number 1 badge!",
      "You earned the On the Board badge!",
      "You earned the Top 10 badge!",
    ]);
  });
});

test.describe("in-game badges (/api/award-badge)", () => {
  test("grants a badge once, with a toast, and says so when it's already owned", async ({ request, world }) => {
    await world.seed();

    const first = await request.post(world.api("/award-badge"), { data: { badgeName: "First Order" } });
    expect(await first.json()).toEqual({
      success: true,
      granted: true,
      badgeName: "First Order",
      icon: expect.stringContaining("https://example.invalid/badges/"),
    });
    const again = await request.post(world.api("/award-badge"), { data: { badgeName: "First Order" } });
    expect(await again.json()).toMatchObject({ success: true, granted: false });

    expect(await world.grantedBadges()).toEqual(["First Order"]);
    expect(await world.events("fire-toast")).toEqual([
      expect.objectContaining({ title: "Badge Awarded", text: "You earned the First Order badge!" }),
    ]);
  });

  test("unknown or inactive badges, and a missing name, grant nothing", async ({ request, world }) => {
    await world.seed();

    for (const badgeName of ["Not A Badge", "Retired Badge", "Coffee Mug"]) {
      const response = await request.post(world.api("/award-badge"), { data: { badgeName } });
      expect(await response.json(), badgeName).toMatchObject({ success: false, granted: false });
    }
    const missing = await request.post(world.api("/award-badge"), { data: {} });
    expect(missing.status()).toBe(400);

    expect(await world.grantedBadges()).toEqual([]);
  });
});
