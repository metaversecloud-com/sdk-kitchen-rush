import { 
  STREAK_MULTIPLIER_LOW,
  STREAK_MULTIPLIER_MID,
  STREAK_MULTIPLIER_HIGH,
  STREAK_MULTIPLIER_HIGHER,
  STREAK_MULTIPLIER_HIGHEST,
  STREAK_MULTIPLIER_MID_THRESHOLD,
  STREAK_MULTIPLIER_HIGH_THRESHOLD,
  STREAK_MULTIPLIER_HIGHER_THRESHOLD,
  STREAK_MULTIPLIER_HIGHEST_THRESHOLD
} from '../data/gameConstants'

// function to calculate streak
export const getStreakMultiplier = (streak: number): number => {
  // if streak less than 3, no multiplier
  if (streak < STREAK_MULTIPLIER_MID_THRESHOLD) return STREAK_MULTIPLIER_LOW
  // if less than 6, 2x
  else if (streak < STREAK_MULTIPLIER_HIGH_THRESHOLD) return STREAK_MULTIPLIER_MID
  // if less than 9, 3x
  else if (streak < STREAK_MULTIPLIER_HIGHER_THRESHOLD) return STREAK_MULTIPLIER_HIGH
  // if less than 12, return 4x
  else if (streak < STREAK_MULTIPLIER_HIGHEST_THRESHOLD) return STREAK_MULTIPLIER_HIGHER
  // if greater than 12, return 5x
  else return STREAK_MULTIPLIER_HIGHEST
}