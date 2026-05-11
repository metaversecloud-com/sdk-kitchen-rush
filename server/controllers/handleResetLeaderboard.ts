import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset } from "@utils/index.js";

export const handleResetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const droppedAsset = await getDroppedAsset(credentials);
    const leaderboard = (droppedAsset.dataObject?.leaderboard ?? {}) as Record<string, string>;
    if (Object.keys(leaderboard).length === 0) {
      return res.json({ success: true, alreadyEmpty: true });
    }

    await droppedAsset.updateDataObject(
      { leaderboard: {} },
      { lock: { lockId: `leaderboard-reset-${droppedAsset.id}`, releaseLock: true } },
    );

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleResetLeaderboard",
      message: "Error resetting leaderboard",
      req,
      res,
    });
  }
};
