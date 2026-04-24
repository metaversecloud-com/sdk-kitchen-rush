import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { parseLeaderboard } from "@utils/leaderboardUtils.js";

// controller to fetch leaderboard data
export const handleGetLeaderboard = async (req: Request, res: Response) => {
  // console.log("handleGetLeaderboard called", req.body, req.query);
  try {
    // extract credentials from request query
    const credentials = getCredentials(req.query);

    // get dropped asset associated with this experience
    const droppedAsset = await getDroppedAsset(credentials);

    // fetch latest data object from backend
    await droppedAsset.fetchDataObject();

    // get raw leaderboard data or default to empty object
    const leaderboardData = droppedAsset.dataObject?.leaderboard ?? {};

    // parse leaderboard into usable frontend format
    const leaderboard = parseLeaderboard(leaderboardData);

    // return leaderboard data to client
    return res.json({ success: true, data: { leaderboard } });
  } catch (error) {
      // handle and log error using centralized error handler
    return errorHandler({
      error,
      functionName: "handleGetLeaderboard",
      message: "Error fetching leaderboard",
      req,
      res,
    });
  }
};