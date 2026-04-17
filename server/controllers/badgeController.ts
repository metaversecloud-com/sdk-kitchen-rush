import { Request, Response } from "express";
import { getCredentials } from "../utils/getCredentials.js";
import { awardBadge } from "../utils/awardBadge.js"; // This fixes "Cannot find name awardBadge"
import { Visitor, World } from "../utils/topiaInit.js"; // This fixes "Cannot find name Visitor"
import { getVisitor } from "../utils/getVisitor.js";
import { errorHandler } from "../utils/errorHandler.js";

export const handleAwardBadge = async (req: Request, res: Response) => {
  try {
    // 1. Get credentials exactly like Lina
    const credentials = getCredentials(req.query);
    const { badgeName } = req.body as { badgeName: string };

    // 2. Award the badge
    const result = await awardBadge({ credentials, badgeName });

    // 3. Helper to get the visitor and the "world" object
    // getVisitor likely returns { visitor } where visitor is the instance
    const { visitor } = await getVisitor(credentials);
    
    // Lina's example also shows creating a 'world' instance for global effects
    const world = World.create(credentials.urlSlug, { credentials });

    // 4. Fire effects using the verified instances
    await world.fireToast({ 
      title: "🎉 Badge Unlocked!", 
      text: `Congratulations! You earned: ${badgeName}` 
    }).catch(error => errorHandler({ 
      error, 
      functionName: "handleAwardBadge", 
      message: "Error triggering effects or awarding badge" 
    }));

    visitor.triggerParticle({ name: "confetti_1", duration: 3 }).catch(() => {});

    console.log(`✅ ${badgeName} awarded!`);
    return res.json(result);

  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleAwardBadge",
      message: "Failed to award badge or fire effects",
      req, res
    });
  }
};