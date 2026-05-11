import { VisitorInterface } from "@rtsdk/topia";
import { Credentials } from "../types/index.js";
import { Visitor } from "./topiaInit.js";
import { getCachedInventoryItems } from "./inventoryCache.js";
import { standardizeError } from "./standardizeError.js";

export interface AwardBadgeResult {
  success: boolean;
  granted: boolean;
  badgeName: string;
  icon?: string;
}

const visitorHasBadge = (visitor: VisitorInterface, badgeName: string): boolean =>
  (visitor.inventoryItems || []).some(
    (vi: any) => vi?.status === "ACTIVE" && vi?.item?.type === "BADGE" && vi?.item?.name === badgeName,
  );

export const awardBadge = async ({
  credentials,
  badgeName,
}: {
  credentials: Credentials;
  badgeName: string;
}): Promise<AwardBadgeResult> => {
  try {
    const { visitorId, urlSlug } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, { credentials });
    await visitor.fetchInventoryItems();

    const inventoryItems = await getCachedInventoryItems({ credentials });
    const badge = inventoryItems.find(
      (item: any) => item?.name === badgeName && item?.type === "BADGE" && item?.status === "ACTIVE",
    );
    if (!badge) {
      return { success: false, granted: false, badgeName };
    }

    const icon = (badge as any).image_url || (badge as any).image_path || "";

    if (visitorHasBadge(visitor, badgeName)) {
      return { success: true, granted: false, badgeName, icon };
    }

    await visitor.grantInventoryItem(badge, 1);
    await visitor
      .fireToast({ title: "Badge Awarded", text: `You earned the ${badgeName} badge!` })
      .catch(() => console.error(`Failed to fire toast after awarding "${badgeName}".`));

    return { success: true, granted: true, badgeName, icon };
  } catch (error) {
    throw standardizeError(error);
  }
};
