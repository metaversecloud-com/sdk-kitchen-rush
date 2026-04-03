// function to calculate speed bonus

export const getSpeedBonus = (timeRemaining: number, timeLimit: number): number => {
    const remainingPercentage = Math.max(0, (timeRemaining/timeLimit )*100)
    if (remainingPercentage > 50) return 5
    else if (remainingPercentage > 20)return 2
    else return 0
}