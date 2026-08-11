import { Request, Response } from "express";
import { awardBadge, errorHandler, getCredentials } from "@utils/index.js";

export const handleAwardBadge = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { badgeName } = req.body as { badgeName?: string };

    if (!badgeName) return res.status(400).json({ success: false, error: "Missing badgeName" });

    const result = await awardBadge({ credentials, badgeName });

    return res.json(result);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAwardBadge",
      message: "Error awarding badge",
      req,
      res,
    });
  }
};
