import { Request, Response } from "express";
import { getCredentials } from "../utils/getCredentials.js";
import { awardBadge } from "../utils/awardBadge.js";
import { Visitor } from "../utils/topiaInit.js";
import { getVisitorBadges } from "../utils/getVisitorBadges.js";
import { checkBadgeEligibility } from "../utils/badgeLogic.js";
import { getCachedInventoryItems } from "../utils/inventoryCache.js";

export const handleBadgeCheck = async (req: Request, res: Response) => {
  try {
    // 1. Validate Credentials (hopefully fixes 400 error)
    const credentials = getCredentials(req.query);
    const { stats, wasCorrect } = req.body;

    // 2. Setup the visitor and fetch their current badges
    const visitor = await Visitor.create(credentials.visitorId, credentials.urlSlug, { credentials });
    await visitor.fetchInventoryItems();
    const { badges } = getVisitorBadges(visitor.inventoryItems);

    const allItems = await getCachedInventoryItems(credentials);

    // 3. Check logic (Convert badges object to array for your logic)
    const currentBadgeNames = Object.keys(badges);
    const eligibleBadgeNames = checkBadgeEligibility({ ...stats, wasCorrect }, currentBadgeNames);

    const awardedThisTurn: string[] = [];

    // 4. Award each new badge using the new utility
    for (const name of eligibleBadgeNames) {
      await awardBadge({
        credentials,
        recipientVisitorId: credentials.visitorId,
        recipientProfileId: credentials.profileId,
        badgeName: name,
        comment: "Great cooking!"
      });
      awardedThisTurn.push(name);
    }

    return res.status(200).json({ success: true, awarded: awardedThisTurn });
  } catch (error) {
    console.error("Badge Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};