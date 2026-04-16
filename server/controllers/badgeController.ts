// server/controllers/badgeController.ts
import { Request, Response } from "express";
import { Visitor } from "../utils/topiaInit.js";
import { getCachedInventoryItems } from "../utils/inventoryCache.js";
import { checkBadgeEligibility } from "../utils/badgeLogic.js";

export const handleBadgeCheck = async (req: Request, res: Response) => {
  try {
    const { stats, wasCorrect } = req.body;
    const { urlSlug, visitorId } = req.query;

    if (!visitorId || !urlSlug) {
      return res.status(400).json({ error: "Missing visitorId or urlSlug" });
    }

    // 1. Prepare the Visitor instance
    const currentVisitor = Visitor.create(Number(visitorId), urlSlug as string);

    // 2. Fetch the Visitor's current inventory so we don't double-grant
    // In your SDK, this is usually .getInventory() or .fetchInventory()
    const visitorInventory = await currentVisitor.getInventory();

    // 3. Determine which badges they qualify for
    // Pass the visitor's current items so logic can filter out existing ones
    const eligibleBadgeNames = checkBadgeEligibility({ ...stats, wasCorrect }, visitorInventory);

    if (eligibleBadgeNames.length === 0) {
      return res.status(200).json({ success: true, awarded: [] });
    }

    // 4. Fetch all available Badge Assets from the Ecosystem cache
    const allItems = await getCachedInventoryItems();
    const awardedThisTurn: string[] = [];

    // 5. Grant the badges
    for (const badgeName of eligibleBadgeNames) {
      const badgeAsset = allItems.find(item => item.name === badgeName);
      
      if (badgeAsset) {
        try {
          /** * FIX: grantInventoryItem usually takes (assetId, count) 
           * or (assetId, { count: 1 }) 
           */
          const assetId = badgeAsset.assetId || badgeAsset.id;
          await currentVisitor.grantInventoryItem(assetId, 1);
          
          awardedThisTurn.push(badgeName);
        } catch (grantError) {
          console.error(`Failed to grant ${badgeName}:`, grantError);
        }
      }
    }

    return res.status(200).json({
      success: true,
      awarded: awardedThisTurn
    });

  } catch (error) {
    console.error("Badge Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};