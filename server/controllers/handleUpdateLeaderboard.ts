import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { updateLeaderboard } from "@utils/leaderboardUtils.js";

// controller to update leaderboard with a new score
export const handleUpdateLeaderboard = async (req: Request, res: Response) => {
  // console.log("handleUpdateLeaderboard called", req.body, req.query);
  try {
    const credentials = getCredentials(req.query);
    // get score from request body
    const { score } = req.body;

    // validate score input
    if (typeof score !== "number") {
      return res.status(400).json({ success: false, error: "score must be a number" });
    }

    // retrieve dropped asset associated with leaderboard
    const droppedAsset = await getDroppedAsset(credentials);
    // update leaderboard with new score
    const error = await updateLeaderboard({ credentials, droppedAsset, score });
     // if update function returns an error, throw it
    if (error) throw error;

    // return success response
    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      // handle and log error using centralized error handler
      error,
      functionName: "handleUpdateLeaderboard",
      message: "Error updating leaderboard",
      req,
      res,
    });
  }
};