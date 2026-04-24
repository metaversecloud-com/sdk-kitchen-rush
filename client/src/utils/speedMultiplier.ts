import { 
    SPEED_BONUS_HIGH_THRESHOLD,
    SPEED_BONUS_MID_THRESHOLD,
    SPEED_BONUS_HIGH,
    SPEED_BONUS_MID,   
    SPEED_BONUS_LOW,
  
} from '../data/gameConstants'
// function to calculate speed bonus
export const getSpeedBonus = (timeRemaining: number, timeLimit: number): number => {
    // calculate time remaining
    const remainingPercentage = Math.max(0, (timeRemaining/timeLimit )*100)
    // if more than 50% time remaining return 5x points
    if (remainingPercentage > SPEED_BONUS_HIGH_THRESHOLD) return SPEED_BONUS_HIGH
    // if more than 20% time remaining return 2x points
    else if (remainingPercentage > SPEED_BONUS_MID_THRESHOLD)return  SPEED_BONUS_MID
    // if less than 20% do not multiply points
    else return  SPEED_BONUS_LOW
}