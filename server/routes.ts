import express from "express";
import { handleGetGameState, handleGetLeaderboard, handleUpdateLeaderboard, handleResetLeaderboard, handleIncrementAnalytics} from "./controllers/index.js";
import { getVersion } from "@utils/getVersion.js";
import { handleAwardBadge } from "./controllers/badgeController.js";

const router = express.Router();
const SERVER_START_DATE = new Date();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
    },
  });
});

router.get("/game-state", handleGetGameState);
router.get("/leaderboard", handleGetLeaderboard);
router.post("/leaderboard/update", handleUpdateLeaderboard);
router.post("/leaderboard/reset", handleResetLeaderboard)
router.post("/award-badge", handleAwardBadge);
router.post("/analytics/increment", handleIncrementAnalytics)

export default router;
