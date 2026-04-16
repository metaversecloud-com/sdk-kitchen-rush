import { getCredentials } from "../utils/getCredentials.js";
import { getVisitorBadges } from "../utils/getVisitorBadges.js";
import { awardBadge } from "../utils/awardBadge.js";
import { checkBadgeEligibility } from "../utils/badgeLogic.js"; // The missing import
import { Visitor } from "../utils/topiaInit.js";
import { Request, Response } from "express";

export const handleGameResults = async (req: Request, res: Response) => {
  try {
    // 1. Get credentials from the query (Fixes the 400 error)
    const credentials = getCredentials(req.query);
    const { stats, wasCorrect } = req.body;

    // 2. Initialize the visitor and get their current badges
    const visitor = await Visitor.create(credentials.visitorId, credentials.urlSlug, { credentials });
    await visitor.fetchInventoryItems();
    
    // Using the new util from the example app
    const { badges } = getVisitorBadges(visitor.inventoryItems);
    const existingBadgeNames = Object.keys(badges);

    // 3. Run your eligibility logic
    const badgesToAward = checkBadgeEligibility({ ...stats, wasCorrect }, existingBadgeNames);

    // 4. Award each badge using the robust awardBadge utility
    for (const badgeName of badgesToAward) {
      await awardBadge({
        credentials,
        recipientVisitorId: credentials.visitorId,
        recipientProfileId: credentials.profileId,
        badgeName,
        comment: "Kitchen Rush Achievement!"
      });
    }

    res.json({ success: true, newBadges: badgesToAward });
  } catch (error) {
    console.error("Game Results Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};