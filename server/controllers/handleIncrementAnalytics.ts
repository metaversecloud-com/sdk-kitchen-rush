import { Request, Response } from "express";
import { errorHandler, getCredentials } from "@utils/index.js";
import { Visitor } from "@utils/topiaInit.js";

export const handleIncrementAnalytics = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug, visitorId, profileId } = credentials;
    const { analyticName } = req.body as { analyticName: string };

    if (!analyticName) return res.status(400).json({ success: false, error: "Missing analyticName" });

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });

    await visitor
      .updatePublicKeyAnalytics([
        {
          analyticName,
          uniqueKey: profileId,
          profileId,
          urlSlug,
        },
      ])
      .catch((error: any) =>
        errorHandler({
          error,
          functionName: "handleIncrementAnalytics",
          message: "Error updating public key analytics",
        })
      );

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