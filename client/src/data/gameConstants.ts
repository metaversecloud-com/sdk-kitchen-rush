export const MAX_ANGRY_CUSTOMERS = 5;
export const BASE_POINTS = 10;
export const PENALTY = 5;

// Speed bonus tiers (percent of order time remaining when served).
export const SPEED_BONUS_HIGH = 5; // >50% remaining
export const SPEED_BONUS_MID = 2; // 20-50% remaining
export const SPEED_BONUS_LOW = 0; // <20% remaining
export const SPEED_BONUS_HIGH_THRESHOLD = 50;
export const SPEED_BONUS_MID_THRESHOLD = 20;

// Streak multipliers.
export const STREAK_MULTIPLIER_LOW = 1;
export const STREAK_MULTIPLIER_MID = 2;
export const STREAK_MULTIPLIER_HIGH = 3;
export const STREAK_MULTIPLIER_HIGHER = 4;
export const STREAK_MULTIPLIER_HIGHEST = 5;
export const STREAK_MULTIPLIER_MID_THRESHOLD = 3;
export const STREAK_MULTIPLIER_HIGH_THRESHOLD = 6;
export const STREAK_MULTIPLIER_HIGHER_THRESHOLD = 9;
export const STREAK_MULTIPLIER_HIGHEST_THRESHOLD = 12;

// Badge thresholds (strict — see README).
export const LIGHTNING_HANDS_TIME_THRESHOLD = 70; // % time remaining counted as "fast"
export const SLUGGISH_TIME_THRESHOLD = 30; // % time remaining counted as "slow"
export const LAST_MINUTE_TIME_THRESHOLD = 5; // % time remaining counted as "last second"
export const LIGHTNING_HANDS_STREAK = 5; // consecutive fast serves needed
export const SLUGGISH_STREAK = 3; // consecutive slow serves needed
export const OOPS_STREAK = 3; // consecutive wrong/timed-out orders needed
export const PERFECT_PLATE_STREAK = 5;
export const RUSH_HOUR_STREAK = 10;
export const UNSTOPPABLE_STREAK = 25;
export const WANT_IT_ALL_LEVEL = 4; // only level 4 generates 3-topping orders

// In-game badge names. End-of-game badges live server-side in handleGameEnd.
export const IN_GAME_BADGES = {
  FIRST_ORDER: "First Order",
  PERFECT_PLATE: "Perfect Plate",
  RUSH_HOUR: "Rush Hour",
  UNSTOPPABLE: "Unstoppable",
  LIGHTNING_HANDS: "Lightning Hands",
  LAST_MINUTE_SAVE: "Last Minute Save",
  WANT_IT_ALL: "Want It All",
  SLUGGISH: "Sluggish",
  OOPS: "Oops",
} as const;
