import { 
    SPEED_BONUS_HIGH_THRESHOLD,
    SPEED_BONUS_MID_THRESHOLD,
    SPEED_BONUS_HIGH,
    SPEED_BONUS_MID,   
    SPEED_BONUS_LOW,
  
} from '../data/gameConstants'
// function to calculate speed bonus

export const getSpeedBonus = (timeRemaining: number, timeLimit: number): number => {
    const remainingPercentage = Math.max(0, (timeRemaining/timeLimit )*100)
    if (remainingPercentage > SPEED_BONUS_HIGH_THRESHOLD) return SPEED_BONUS_HIGH
    else if (remainingPercentage > SPEED_BONUS_MID_THRESHOLD)return  SPEED_BONUS_MID
    else return  SPEED_BONUS_LOW
}