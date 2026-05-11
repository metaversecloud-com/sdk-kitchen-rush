import { Request, Response } from "express";
import { errorHandler, getBadges, getCredentials, getVisitor } from "@utils/index.js";

export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const forceRefreshInventory = req.query.forceRefreshInventory === "true";

    const [{ visitor, visitorInventory }, badges] = await Promise.all([
      getVisitor(credentials, true),
      getBadges(credentials, forceRefreshInventory),
    ]);

    return res.json({
      success: true,
      isAdmin: !!visitor.isAdmin,
      badges,
      visitorInventory,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetGameState",
      message: "Error getting game state",
      req,
      res,
    });
  }
};
