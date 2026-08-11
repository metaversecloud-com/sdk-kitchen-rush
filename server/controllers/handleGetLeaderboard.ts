import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, parseLeaderboard } from "@utils/index.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const droppedAsset = await getDroppedAsset(credentials);
    const leaderboardData = (droppedAsset.dataObject?.leaderboard ?? {}) as Record<string, string>;
    const leaderboard = parseLeaderboard(leaderboardData);

    return res.json({ success: true, leaderboard });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetLeaderboard",
      message: "Error fetching leaderboard",
      req,
      res,
    });
  }
};
