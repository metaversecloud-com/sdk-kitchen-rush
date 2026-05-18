import { Credentials } from "../types";
import { Ecosystem } from "./topiaInit.js";
import { standardizeError } from "./standardizeError.js";
import { InventoryItemInterface } from "@rtsdk/topia";

interface InventoryItemMetadata {
  sortOrder?: number;
  [key: string]: unknown;
}

interface CachedInventory {
  items: InventoryItemInterface[];
  timestamp: number;
}

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

let inventoryCache: CachedInventory | null = null;

const getMetadata = (item: InventoryItemInterface): InventoryItemMetadata => {
  return (item.metadata ?? {}) as InventoryItemMetadata;
};

const getSortOrder = (item: InventoryItemInterface): number => {
  const sortOrder = getMetadata(item).sortOrder;
  return typeof sortOrder === "number" ? sortOrder : 0;
};

export const getCachedInventoryItems = async ({
  credentials,
  forceRefresh = false,
}: {
  credentials: Credentials;
  forceRefresh?: boolean;
}): Promise<InventoryItemInterface[]> => {
  try {
    const now = Date.now();

    const isCacheValid = inventoryCache !== null && !forceRefresh && now - inventoryCache.timestamp < CACHE_DURATION_MS;

    if (isCacheValid) {
      return inventoryCache!.items;
    }

    console.log("Fetching fresh inventory items from ecosystem");
    const ecosystem = Ecosystem.create({ credentials });
    await ecosystem.fetchInventoryItems();

    inventoryCache = {
      items: (ecosystem.inventoryItems as InventoryItemInterface[])
        .map((item) => ({
          ...item,
          metadata: {
            ...getMetadata(item),
            sortOrder: getSortOrder(item),
          },
        }))
        .sort((a, b) => getSortOrder(a) - getSortOrder(b)),
      timestamp: now,
    };

    return inventoryCache.items;
  } catch (error) {
    if (inventoryCache !== null) {
      console.warn("Failed to fetch fresh inventory, using stale cache", error);
      return inventoryCache.items;
    }

    throw standardizeError(error);
  }
};
