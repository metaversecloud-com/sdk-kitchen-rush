// server/utils/badgeLogic.ts

export const checkBadgeEligibility = (stats: any, currentInventory: any[]) => {
  const awarded: string[] = [];

  // ID 1: First Order Up
  // We check if this is the very first correct order they've ever submitted
  if (stats.totalCorrect === 1 && stats.wasCorrect) {
    awarded.push("First Order Up");
  }

  // ID 4: Perfect Plate (5 in a row)
  if (stats.currentStreak === 5 && stats.wasCorrect) {
    awarded.push("Perfect Plate");
  }

  // ID 10: Last-Minute Save (Time < 5%)
  if (stats.wasCorrect && stats.lastOrderTimeRemaining < 0.05) {
    awarded.push("Last-Minute Save");
  }

  // ID 20: I Want It All (3 toppings)
  // Only for levels 3+, logic checks if the tray had all toppings
  if (stats.wasCorrect && stats.lastOrderToppingsCount >= 3) {
    awarded.push("I Want It All");
  }

  // --- FILTERING ---
  // We don't want to grant a badge they already have in their inventory.
  // Note: currentInventory usually contains objects, so we check the name.
  return awarded.filter(badgeName => {
    //check if player already has badge
    return !currentInventory.some(item => item.name === badgeName);
  });
};