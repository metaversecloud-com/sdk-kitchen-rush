import { Request, Response, NextFunction } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";
import { initializeDroppedAssetDataObject } from "../utils/droppedAssets/initializeDroppedAssetDataObject";

export const handleResetLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    interface LeaderboardData {
        leaderboard: Record<string, string>;
    }

  try {
    const credentials  = getCredentials(req.query);

    const droppedAsset = await getDroppedAsset(credentials);

    
    // Ensure data object exists with correct shape
    const data = (await droppedAsset.fetchDataObject()) as LeaderboardData;

    const leaderboard = data?.leaderboard;
    // check before resetting
    if (!leaderboard || Object.keys(leaderboard).length === 0) {

      return res.status(200).json({ message: "Leaderboard already empty" });
    }
    if (!data || !data.leaderboard) {
      await droppedAsset.setDataObject(
        {
        leaderboard: []
        }, {}
    );
    } else {
      await droppedAsset.updateDataObject(
        {
        leaderboard: []
        }, {}
    );
    }
    
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
