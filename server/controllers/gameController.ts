import { getCachedInventoryItems } from "../utils/inventoryCache";

export const handleGameResults = async (req, res) => {
  const { visitor, stats } = req; // Assuming your middleware provides 'visitor'
  
  // 1. Get available badges from Ecosystem
  const items = await getCachedInventoryItems();
  
  // 2. Check logic
  const badgesToAward = checkBadgeEligibility(stats, visitor.inventory);

  // 3. Grant badges via SDK
  for (const badgeId of badgesToAward) {
    const badgeItem = items.find(i => i.slug === badgeId);
    if (badgeItem) {
      await visitor.grantInventoryItem(badgeItem, 1);
    }
  }

  res.json({ success: true, newBadges: badgesToAward });
};