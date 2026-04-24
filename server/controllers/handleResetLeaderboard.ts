import { Request, Response, NextFunction } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { initializeDroppedAssetDataObject } from "../utils/droppedAssets/initializeDroppedAssetDataObject";

// controller to reset leaderboard data
export const handleResetLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  // define expected structure of leaderboard data
    interface LeaderboardData {
        leaderboard: Record<string, string>;
    }

  try {
    const credentials  = getCredentials(req.query);
    const droppedAsset = await getDroppedAsset(credentials);

    // fetch current data object
    const data = (await droppedAsset.fetchDataObject()) as LeaderboardData;

    const leaderboard = data?.leaderboard;
     // if leaderboard is already empty, return early
    if (!leaderboard || Object.keys(leaderboard).length === 0) {
      return res.status(200).json({ message: "Leaderboard already empty" });
    }
    
    // if data object doesn't exist, initialize it
    if (!data || !data.leaderboard) {
      await droppedAsset.setDataObject(
        {
        leaderboard: []
        }, {}
    );
    // otherwise update existing leaderboard to empty
    } else {
      await droppedAsset.updateDataObject(
        {
        leaderboard: []
        }, {}
    );
    }
    // return success response
    return res.json({ success: true });
  } catch (err) {
    // pass error to express error middleware
    next(err);
  }
};
