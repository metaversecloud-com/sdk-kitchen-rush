// server/utils/inventoryCache.ts
import { Ecosystem } from "./topiaInit.js";

let cachedItems: any[] = [];
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export const getCachedInventoryItems = async () => {
  const now = Date.now();
  if (cachedItems.length > 0 && now - lastFetch < CACHE_TTL) {
    return cachedItems;
  }

  try {
    // In this SDK version, the Ecosystem factory handles fetching items
    // We use the ID of your ecosystem (often found in your .env or query)
    const items = await Ecosystem.getInventoryItems(); 
    
    cachedItems = items;
    lastFetch = now;
    return cachedItems;
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return [];
  }
};