import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { parseLeaderboard } from "@utils/leaderboardUtils.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  console.log("handleGetLeaderboard called", req.body, req.query);
  try {
    const credentials = getCredentials(req.query);

    const droppedAsset = await getDroppedAsset(credentials);
    await droppedAsset.fetchDataObject();

    const leaderboardData = droppedAsset.dataObject?.leaderboard ?? {};

    const leaderboard = parseLeaderboard(leaderboardData);

    return res.json({ success: true, data: { leaderboard } });
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