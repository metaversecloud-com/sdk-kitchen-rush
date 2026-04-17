import { Request, Response } from "express";
import { getCredentials } from "../utils/getCredentials.js";
import { awardBadge } from "../utils/awardBadge.js"; // This fixes "Cannot find name awardBadge"
import { Visitor } from "../utils/topiaInit.js"; // This fixes "Cannot find name Visitor"

export const handleAwardBadge = async (req: Request, res: Response) => {
  try {
    // 1. Get credentials from the query string
    const credentials = getCredentials(req.query);
    
    // ERROR FIX: Cast req.body so TS knows it has badgeName
    const { badgeName } = req.body as { badgeName: string };

    // 2. Execute the award utility
    const result = await awardBadge({ credentials, badgeName });

    // 3. Setup Visitor for feedback
    // Factory .get returns the instance we need
    const visitorInstance = await Visitor.get(credentials.visitorId, credentials.urlSlug, { credentials });
    
    // 4. Fire effects (Fire-and-forget pattern)
    visitorInstance.fireToast({
      title: "🎉 Badge Unlocked!",
      text: `Congratulations! You earned: ${badgeName}`,
    }).catch(() => {});

    visitorInstance.triggerParticle({ name: "confetti_1", duration: 3 }).catch(() => {});

    console.log(`✅ ${badgeName} awarded to ${credentials.displayName}`);

    return res.json(result);
  } catch (error) {
    console.error("AWARD ERROR:", error);
    // Cast to any to avoid "Expression is not callable" errors on standard Express responses
    return (res as any).status(500).json({ success: false });
  }
};