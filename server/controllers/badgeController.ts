// server/controllers/badgeController.ts
import { Request, Response } from "express";
import { getVisitor } from "../utils/getVisitor.js"; // Import your project's existing helper
import { getCachedInventoryItems } from "../utils/inventoryCache.js";
import { checkBadgeEligibility } from "../utils/badgeLogic.js";

export const handleBadgeCheck = async (req: Request, res: Response) => {
  try {
    const { stats, wasCorrect } = req.body;
    
    // In your project, credentials come from the query
    const credentials = req.query as any;

    if (!credentials.visitorId || !credentials.urlSlug) {
      return res.status(400).json({ error: "Missing visitorId or urlSlug" });
    }

    // 1. Use your project's helper to get the visitor and their inventory
    // This handles the "Property getInventory does not exist" error for you!
    const { visitor, visitorInventory } = await getVisitor(credentials);

    // 2. Convert visitorInventory (object) to an array for your badge logic
    const inventoryArray = Object.values(visitorInventory);

    // 3. Determine which badges they qualify for
    const eligibleBadgeNames = checkBadgeEligibility({ ...stats, wasCorrect }, inventoryArray);

    if (eligibleBadgeNames.length === 0) {
      return res.status(200).json({ success: true, awarded: [] });
    }

    // 4. Fetch Ecosystem Assets to get the assetIds needed for granting
    const allItems = await getCachedInventoryItems();
    const awardedThisTurn: string[] = [];

    // 5. Grant the badges
    for (const badgeName of eligibleBadgeNames) {
      const badgeAsset = allItems.find(item => item.name === badgeName);
      
      if (badgeAsset) {
        try {
          // Use the visitor instance provided by your getVisitor helper
          const assetId = badgeAsset.assetId || badgeAsset.id;
          await visitor.grantInventoryItem(assetId, 1);
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