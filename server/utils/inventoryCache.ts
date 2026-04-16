// server/utils/inventoryCache.ts
import { Topia } from "./topiaInit.js"; // Use the initialized Topia instance
import { Credentials } from "../types/index.js";

let cachedItems: any[] = [];
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

export const getCachedInventoryItems = async (credentials: Credentials) => {
  const now = Date.now();
  if (cachedItems.length > 0 && now - lastFetch < CACHE_TTL) {
    return cachedItems;
  }

  try {
    // 1. In this version, you typically access the ecosystem 
    // through the topia instance using your project's credentials.
    const topia = new Topia(credentials);
    const ecosystem = await topia.ecosystem();
    
    // 2. Fetch the items from that ecosystem instance
    const items = await ecosystem.fetchInventoryItems(); 
    
    cachedItems = items;
    lastFetch = now;
    return cachedItems;
  } catch (error) {
    console.error("Failed to fetch ecosystem inventory items:", error);
    return [];
  }
};