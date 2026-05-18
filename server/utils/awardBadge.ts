import { VisitorInterface } from "@rtsdk/topia";
import { Credentials } from "../types/index.js";
import { getCachedInventoryItems } from "./inventoryCache.js";
import { standardizeError } from "./standardizeError.js";
import { getVisitor } from "./getVisitor.js";

export interface AwardBadgeResult {
  success: boolean;
  granted: boolean;
  badgeName: string;
  icon?: string;
}

const visitorHasBadge = (visitor: VisitorInterface, badgeName: string): boolean =>
  (visitor.inventoryItems || []).some((vi: any) => vi?.item?.name === badgeName);

const findEcosystemBadge = (inventoryItems: any[], badgeName: string) =>
  inventoryItems.find((item: any) => item?.name === badgeName && item?.type === "BADGE" && item?.status === "ACTIVE");

export const awardBadge = async ({
  credentials,
  badgeName,
}: {
  credentials: Credentials;
  badgeName: string;
}): Promise<AwardBadgeResult> => {
  try {
    const { visitor } = await getVisitor(credentials, false);
    let inventoryItems = await getCachedInventoryItems({ credentials });
    let badge = findEcosystemBadge(inventoryItems, badgeName);

    // The ecosystem inventory is cached for 6h — if the admin just added the
    // badge it may not be in the cache yet. Retry once with a fresh fetch
    // before giving up so a newly-configured badge becomes available without
    // waiting for the cache to expire.
    if (!badge) {
      inventoryItems = await getCachedInventoryItems({ credentials, forceRefresh: true });
      badge = findEcosystemBadge(inventoryItems, badgeName);
    }

    if (!badge) {
      console.warn(
        `Badge "${badgeName}" not found in ecosystem inventory. ` +
          `Make sure a BADGE item with status ACTIVE and that exact name exists in the Topia ecosystem.`,
      );
      return { success: false, granted: false, badgeName };
    }

    const icon = (badge as any).image_url || (badge as any).image_path || "";

    if (visitorHasBadge(visitor, badgeName)) return { success: true, granted: false, badgeName, icon };

    await visitor.grantInventoryItem(badge, 1);

    await visitor.fireToast({ title: "Badge Awarded", text: `You earned the ${badgeName} badge!` }).catch(() => {
      console.error(`Failed to fire toast after awarding "${badgeName}".`);
    });

    return { success: true, granted: true, badgeName, icon };
  } catch (error) {
    throw standardizeError(error);
  }
};

/**
 * Batch grant multiple badges using a single visitor + inventory fetch.
 * Skips badges the visitor already owns and badges missing from the ecosystem.
 */
export const grantBadges = async ({
  visitor,
  inventoryItems,
  badgeNames,
}: {
  visitor: VisitorInterface;
  inventoryItems: any[];
  badgeNames: string[];
}): Promise<AwardBadgeResult[]> => {
  const unique = Array.from(new Set(badgeNames));

  return Promise.all(
    unique.map(async (badgeName) => {
      const badge = findEcosystemBadge(inventoryItems, badgeName);
      if (!badge) return { success: false, granted: false, badgeName };

      const icon = (badge as any).image_url || (badge as any).image_path || "";
      if (visitorHasBadge(visitor, badgeName)) {
        return { success: true, granted: false, badgeName, icon };
      }

      try {
        await visitor.grantInventoryItem(badge, 1);
      } catch (error) {
        console.error(`Failed to grant badge "${badgeName}":`, error);
        return { success: false, granted: false, badgeName, icon };
      }

      await visitor.fireToast({ title: "Badge Awarded", text: `You earned the ${badgeName} badge!` }).catch(() => {
        console.error(`Failed to fire toast after awarding "${badgeName}".`);
      });

      return { success: true, granted: true, badgeName, icon };
    }),
  );
};
