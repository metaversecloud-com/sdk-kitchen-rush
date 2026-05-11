import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, updateLeaderboard } from "@utils/index.js";

export const handleUpdateLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { score } = req.body as { score?: number };

    if (typeof score !== "number" || !Number.isFinite(score)) {
      return res.status(400).json({ success: false, error: "score must be a finite number" });
    }

    const droppedAsset = await getDroppedAsset(credentials);
    await updateLeaderboard({ credentials, droppedAsset, score });

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
