// function to calculate speed multiplier
export const getStreakMultiplier = (streak: number): number => {
    if (streak <= 2) return 1
    else if (streak <= 5) return 2
    else if (streak <= 8) return 3
    else if (streak <= 11) return 4
    else return 5       
}