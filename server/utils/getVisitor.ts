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

const buildVisitorInventory = (items: any[] = []): VisitorInventory => {
  const badges: VisitorBadgeRecord = {};
  for (const visitorItem of items) {
    const { id, status, item } = visitorItem || {};
    const { name, type, image_url = "" } = item || {};
    if (status === "ACTIVE" && type === "BADGE" && name) {
      badges[name] = { id, name, icon: image_url };
    }
  }
  return { badges };
};

export const getVisitor = async (
  credentials: Credentials,
  shouldGetVisitorDetails = false,
): Promise<{ visitor: VisitorInterface; visitorInventory: VisitorInventory }> => {
  try {
    const { urlSlug, visitorId } = credentials;

    const visitor: VisitorInterface = shouldGetVisitorDetails
      ? await Visitor.get(visitorId, urlSlug, { credentials })
      : Visitor.create(visitorId, urlSlug, { credentials });

    if (!visitor) throw new Error("Not in world");

    if (shouldGetVisitorDetails) await visitor.fetchInventoryItems();
    const visitorInventory = buildVisitorInventory(visitor.inventoryItems || []);

    return { visitor, visitorInventory };
  } catch (error) {
    throw standardizeError(error);
  }
};
