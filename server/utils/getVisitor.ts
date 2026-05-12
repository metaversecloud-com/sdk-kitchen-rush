import { VisitorInterface } from "@rtsdk/topia";
import { Credentials } from "../types/index.js";
import { Visitor } from "./topiaInit.js";
import { standardizeError } from "./standardizeError.js";

export type VisitorBadgeRecord = {
  [name: string]: { id: string; name: string; icon: string };
};

export type VisitorInventory = {
  badges: VisitorBadgeRecord;
};

export type VisitorStats = {
  gamesPlayed: number;
  lifetimeCorrectOrders: number;
};

// Matches visitorHasBadge in awardBadge.ts: any inventory item of type BADGE
// with a matching name counts as owned, regardless of the SDK status field.
// We also accept either image_url or image_path since the Topia SDK uses
// different keys on ecosystem items vs visitor inventory items.
const buildVisitorInventory = (items: any[] = []): VisitorInventory => {
  const badges: VisitorBadgeRecord = {};
  for (const visitorItem of items) {
    const { id, item } = visitorItem || {};
    const { name, type, image_url, image_path } = item || {};
    if (type === "BADGE" && name) {
      badges[name] = { id, name, icon: image_url || image_path || "" };
    }
  }
  return { badges };
};

const buildVisitorStats = (dataObject: any): VisitorStats => ({
  gamesPlayed: typeof dataObject?.gamesPlayed === "number" ? dataObject.gamesPlayed : 0,
  lifetimeCorrectOrders: typeof dataObject?.lifetimeCorrectOrders === "number" ? dataObject.lifetimeCorrectOrders : 0,
});

export const getVisitor = async (
  credentials: Credentials,
  shouldGetVisitorDetails = false,
): Promise<{
  visitor: VisitorInterface;
  visitorInventory: VisitorInventory;
  visitorStats: VisitorStats;
}> => {
  try {
    const { urlSlug, visitorId } = credentials;

    const visitor: VisitorInterface = shouldGetVisitorDetails
      ? await Visitor.get(visitorId, urlSlug, { credentials })
      : Visitor.create(visitorId, urlSlug, { credentials });

    if (!visitor) throw new Error("Not in world");

    await visitor.fetchInventoryItems();
    const visitorInventory = buildVisitorInventory(visitor.inventoryItems || []);

    const dataObject = (await visitor.fetchDataObject()) as VisitorStats;
    const visitorStats = buildVisitorStats(dataObject);

    if (!dataObject.gamesPlayed) {
      await visitor.setDataObject(visitorStats, {});
    }

    return { visitor, visitorInventory, visitorStats };
  } catch (error) {
    throw standardizeError(error);
  }
};
