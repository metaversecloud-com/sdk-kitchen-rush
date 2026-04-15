import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { updateLeaderboard } from "@utils/leaderboardUtils.js";

export const handleUpdateLeaderboard = async (req: Request, res: Response) => {
  // console.log("handleUpdateLeaderboard called", req.body, req.query);
  try {
    const credentials = getCredentials(req.query);
    const { score } = req.body;

    if (typeof score !== "number") {
      return res.status(400).json({ success: false, error: "score must be a number" });
    }

    const droppedAsset = await getDroppedAsset(credentials);
    const error = await updateLeaderboard({ credentials, droppedAsset, score });
    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleUpdateLeaderboard",
      message: "Error updating leaderboard",
      req,
      res,
    });
  }
};