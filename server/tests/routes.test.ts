process.env.INTERACTIVE_KEY = "test-key";
process.env.INTERACTIVE_SECRET = "test-secret";

import express from "express";
import request from "supertest";

import router from "../routes.js";

const baseCreds = {
  assetId: "asset-123",
  displayName: "Alice",
  identityId: "identity-1",
  interactivePublicKey: "test-key",
  interactiveNonce: "nonce-xyz",
  profileId: "profile-1",
  sceneDropId: "scene-1",
  uniqueName: "keyAsset",
  username: "alice",
  urlSlug: "test-world",
  visitorId: 1,
};

const buildDroppedAssetMock = (leaderboard: Record<string, string> = {}) => ({
  id: "dropped-asset-123",
  dataObject: { leaderboard },
  fetchDataObject: jest.fn().mockResolvedValue({ leaderboard }),
  setDataObject: jest.fn().mockResolvedValue(undefined),
  updateDataObject: jest.fn().mockResolvedValue(undefined),
});

const buildVisitorMock = (overrides: Record<string, unknown> = {}) => ({
  isAdmin: false,
  inventoryItems: [],
  fetchInventoryItems: jest.fn().mockResolvedValue(undefined),
  fetchDataObject: jest.fn().mockResolvedValue({ gamesPlayed: 0, lifetimeCorrectOrders: 0 }),
  incrementDataObjectValue: jest.fn().mockResolvedValue(undefined),
  grantInventoryItem: jest.fn().mockResolvedValue(undefined),
  updatePublicKeyAnalytics: jest.fn().mockResolvedValue(undefined),
  fireToast: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

jest.mock("@utils/index.js", () => ({
  errorHandler: jest.fn().mockImplementation(({ res, message }: any) => {
    if (res) return res.status(500).json({ success: false, error: message });
    return { error: message };
  }),
  getCredentials: jest.fn(),
  getDroppedAsset: jest.fn(),
  getVisitor: jest.fn(),
  getBadges: jest.fn().mockResolvedValue({}),
  awardBadge: jest.fn(),
  grantBadges: jest.fn().mockResolvedValue([]),
  parseLeaderboard: jest.fn().mockReturnValue([]),
  updateLeaderboard: jest.fn().mockResolvedValue(undefined),
  findRank: jest.fn().mockReturnValue(null),
  getCachedInventoryItems: jest.fn().mockResolvedValue([]),
  Visitor: { get: jest.fn(), create: jest.fn() },
}));

const mockUtils = jest.mocked(require("@utils/index.js"));

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  return app;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUtils.getCredentials.mockReturnValue(baseCreds);
});

describe("system", () => {
  test("GET /system/health returns OK", async () => {
    const res = await request(makeApp()).get("/api/system/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.envs).toHaveProperty("NODE_ENV");
    expect(res.body.envs).not.toHaveProperty("INTERACTIVE_KEY");
  });
});

describe("game-state", () => {
  test("GET /game-state returns isAdmin, badges, visitorInventory, and visitorStats", async () => {
    const visitor = buildVisitorMock({ isAdmin: true });
    mockUtils.getVisitor.mockResolvedValue({
      visitor,
      visitorInventory: { badges: { "First Order": {} } },
      visitorStats: { gamesPlayed: 7, lifetimeCorrectOrders: 42 },
    });
    mockUtils.getBadges.mockResolvedValue({ "First Order": { id: "x", name: "First Order", icon: "" } });

    const res = await request(makeApp()).get("/api/game-state").query(baseCreds);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isAdmin).toBe(true);
    expect(res.body.badges).toEqual({ "First Order": { id: "x", name: "First Order", icon: "" } });
    expect(res.body.visitorInventory).toEqual({ badges: { "First Order": {} } });
    expect(res.body.visitorStats).toEqual({ gamesPlayed: 7, lifetimeCorrectOrders: 42 });
  });

  test("GET /game-state forwards errors to errorHandler", async () => {
    mockUtils.getVisitor.mockRejectedValue(new Error("boom"));

    const res = await request(makeApp()).get("/api/game-state").query(baseCreds);

    expect(res.status).toBe(500);
    expect(mockUtils.errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "handleGetGameState" }),
    );
  });
});

describe("leaderboard", () => {
  test("GET /leaderboard returns parsed leaderboard", async () => {
    const droppedAsset = buildDroppedAssetMock({ "p-1": "Alice|100" });
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);
    mockUtils.parseLeaderboard.mockReturnValue([{ profileId: "p-1", displayName: "Alice", score: 100 }]);

    const res = await request(makeApp()).get("/api/leaderboard").query(baseCreds);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.leaderboard).toEqual([{ profileId: "p-1", displayName: "Alice", score: 100 }]);
  });

  test("POST /leaderboard/reset clears the leaderboard", async () => {
    const droppedAsset = buildDroppedAssetMock({ "p-1": "Alice|100" });
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);

    const res = await request(makeApp()).post("/api/leaderboard/reset").query(baseCreds);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(droppedAsset.updateDataObject).toHaveBeenCalledWith(
      { leaderboard: {} },
      expect.objectContaining({ lock: expect.any(Object) }),
    );
  });

  test("POST /leaderboard/reset is a no-op when already empty", async () => {
    const droppedAsset = buildDroppedAssetMock({});
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);

    const res = await request(makeApp()).post("/api/leaderboard/reset").query(baseCreds);

    expect(res.status).toBe(200);
    expect(res.body.alreadyEmpty).toBe(true);
    expect(droppedAsset.updateDataObject).not.toHaveBeenCalled();
  });
});

describe("award-badge", () => {
  test("POST /award-badge delegates to awardBadge", async () => {
    mockUtils.awardBadge.mockResolvedValue({
      success: true,
      granted: true,
      badgeName: "First Order",
      icon: "https://example.com/badge.png",
    });

    const res = await request(makeApp()).post("/api/award-badge").query(baseCreds).send({ badgeName: "First Order" });

    expect(res.status).toBe(200);
    expect(res.body.granted).toBe(true);
    expect(mockUtils.awardBadge).toHaveBeenCalledWith({ credentials: baseCreds, badgeName: "First Order" });
  });

  test("POST /award-badge rejects when badgeName is missing", async () => {
    const res = await request(makeApp()).post("/api/award-badge").query(baseCreds).send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockUtils.awardBadge).not.toHaveBeenCalled();
  });
});

describe("game-end", () => {
  test("POST /game-end increments stats, updates leaderboard, and grants eligible badges", async () => {
    const visitor = buildVisitorMock();
    const droppedAsset = buildDroppedAssetMock();
    mockUtils.getVisitor.mockResolvedValue({
      visitor,
      visitorInventory: { badges: {} },
      visitorStats: { gamesPlayed: 0, lifetimeCorrectOrders: 23 },
    });
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);
    mockUtils.parseLeaderboard.mockReturnValue([
      { profileId: baseCreds.profileId, displayName: "Alice", score: 250 },
    ]);
    mockUtils.findRank.mockReturnValue(1);
    mockUtils.grantBadges.mockResolvedValue([
      { success: true, granted: true, badgeName: "Open for Business", icon: "open.png" },
      { success: true, granted: true, badgeName: "Line Cook", icon: "line.png" },
      { success: true, granted: true, badgeName: "Number 1", icon: "one.png" },
      // Already-owned should be filtered out.
      { success: true, granted: false, badgeName: "On the Board", icon: "board.png" },
    ]);

    const res = await request(makeApp())
      .post("/api/game-end")
      .query(baseCreds)
      .send({ correctOrders: 10, incorrectOrders: 0, angryCount: 0, finalScore: 250 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rank).toBe(1);
    expect(res.body.visitorStats).toEqual({ gamesPlayed: 1, lifetimeCorrectOrders: 33 });

    // Stats updates fire with the right deltas.
    expect(visitor.incrementDataObjectValue).toHaveBeenCalledWith(
      "gamesPlayed",
      1,
      expect.objectContaining({ analytics: expect.any(Array) }),
    );
    expect(visitor.incrementDataObjectValue).toHaveBeenCalledWith(
      "lifetimeCorrectOrders",
      10,
      expect.objectContaining({ analytics: expect.any(Array) }),
    );
    expect(mockUtils.updateLeaderboard).toHaveBeenCalledWith({ credentials: baseCreds, droppedAsset, score: 250 });

    // Badges eligible for this game: Open for Business (first game), Sharp Chef
    // (100% accuracy), No Substitutions (10 correct, 0 wrong), Clean Service
    // (0 angry, finished), Line Cook (lifetime 33 ≥ 25), On the Board / Top 10 /
    // Number 1 (rank=1).
    const eligibleNames = mockUtils.grantBadges.mock.calls[0][0].badgeNames;
    expect(eligibleNames).toEqual(
      expect.arrayContaining([
        "Open for Business",
        "Sharp Chef",
        "No Substitutions",
        "Clean Service",
        "Line Cook",
        "On the Board",
        "Top 10",
        "Number 1",
      ]),
    );
    expect(eligibleNames).not.toContain("Back in the Kitchen");
    expect(eligibleNames).not.toContain("Sous Chef");

    // Only newly-granted badges flow to the client.
    expect(res.body.grantedBadges).toEqual([
      { name: "Open for Business", icon: "open.png" },
      { name: "Line Cook", icon: "line.png" },
      { name: "Number 1", icon: "one.png" },
    ]);
  });

  test("POST /game-end skips Sharp Chef when accuracy is below 80%", async () => {
    const visitor = buildVisitorMock();
    const droppedAsset = buildDroppedAssetMock();
    mockUtils.getVisitor.mockResolvedValue({
      visitor,
      visitorInventory: { badges: {} },
      visitorStats: { gamesPlayed: 5, lifetimeCorrectOrders: 50 },
    });
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);
    mockUtils.findRank.mockReturnValue(null);

    const res = await request(makeApp())
      .post("/api/game-end")
      .query(baseCreds)
      .send({ correctOrders: 3, incorrectOrders: 2, angryCount: 5, finalScore: 30 });

    expect(res.status).toBe(200);
    const eligibleNames = mockUtils.grantBadges.mock.calls[0]?.[0]?.badgeNames ?? [];
    expect(eligibleNames).not.toContain("Sharp Chef");
    expect(eligibleNames).not.toContain("Clean Service"); // 5 angry, not zero
    expect(eligibleNames).not.toContain("No Substitutions"); // wrong submissions
    expect(eligibleNames).toContain("Back in the Kitchen"); // gamesPlayed becomes 6
  });

  test("POST /game-end skips leaderboard update when finalScore is 0", async () => {
    const visitor = buildVisitorMock();
    const droppedAsset = buildDroppedAssetMock();
    mockUtils.getVisitor.mockResolvedValue({
      visitor,
      visitorInventory: { badges: {} },
      visitorStats: { gamesPlayed: 0, lifetimeCorrectOrders: 0 },
    });
    mockUtils.getDroppedAsset.mockResolvedValue(droppedAsset);

    const res = await request(makeApp())
      .post("/api/game-end")
      .query(baseCreds)
      .send({ correctOrders: 0, incorrectOrders: 0, angryCount: 5, finalScore: 0 });

    expect(res.status).toBe(200);
    expect(mockUtils.updateLeaderboard).not.toHaveBeenCalled();
  });
});

describe("analytics", () => {
  test("POST /analytics/increment increments via Visitor.create", async () => {
    const visitor = buildVisitorMock();
    mockUtils.Visitor.create.mockReturnValue(visitor);

    const res = await request(makeApp())
      .post("/api/analytics/increment")
      .query(baseCreds)
      .send({ analyticName: "gamesStarted" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(visitor.updatePublicKeyAnalytics).toHaveBeenCalledWith([
      {
        analyticName: "gamesStarted",
        profileId: baseCreds.profileId,
        uniqueKey: baseCreds.profileId,
        urlSlug: baseCreds.urlSlug,
      },
    ]);
  });

  test("POST /analytics/increment rejects when analyticName is missing", async () => {
    const res = await request(makeApp()).post("/api/analytics/increment").query(baseCreds).send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockUtils.Visitor.create).not.toHaveBeenCalled();
  });
});
