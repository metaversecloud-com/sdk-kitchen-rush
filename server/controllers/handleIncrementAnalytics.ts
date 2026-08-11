import { Request, Response } from "express";
import { Visitor, errorHandler, getCredentials } from "@utils/index.js";

export const handleIncrementAnalytics = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug, visitorId, profileId } = credentials;
    const { analyticName } = req.body as { analyticName?: string };

    if (!analyticName) return res.status(400).json({ success: false, error: "Missing analyticName" });

    const visitor = Visitor.create(visitorId, urlSlug, { credentials });
    await visitor.updatePublicKeyAnalytics([{ analyticName, profileId, uniqueKey: profileId, urlSlug }]);

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleIncrementAnalytics",
      message: "Error incrementing analytics",
      req,
      res,
    });
  }
};
