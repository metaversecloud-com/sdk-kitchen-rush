import express from "express";
import {
  handleAwardBadge,
  handleGetGameState,
  handleGetLeaderboard,
  handleIncrementAnalytics,
  handleResetLeaderboard,
  handleUpdateLeaderboard,
} from "./controllers/index.js";
import { getVersion } from "@utils/getVersion.js";

const router = express.Router();
const SERVER_START_DATE = new Date();

router.get("/system/health", (_req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
    },
  });
});

router.get("/game-state", handleGetGameState);
router.get("/leaderboard", handleGetLeaderboard);
router.post("/leaderboard/update", handleUpdateLeaderboard);
router.post("/leaderboard/reset", handleResetLeaderboard);
router.post("/award-badge", handleAwardBadge);
router.post("/analytics/increment", handleIncrementAnalytics);

export default router;
