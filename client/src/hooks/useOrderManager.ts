import { Order } from "../types/Order"
import { compareIngredients } from "../utils/compareIngredients"
import { getSpeedBonus } from "../utils/speedMultiplier"
import { getStreakMultiplier } from "../utils/streakMultiplier"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const MAX_ANGRY_CUSTOMERS = 5;

const useOrderManager = (
  onGameOver: () => void,
  onLevelComplete: () => void
) => {
  const navigate = useNavigate()

  // STATE
  const [score, setScore] = useState<number>(0);
  const [angryCustomerCount, setAngryCustomerCount] = useState<number>(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [sourceQueue, setSourceQueue] = useState<Order[]>([]);
  const [tray, setTray] = useState<Partial<Order>>({})
  const [streak, setStreak] = useState<number>(0);
  const [timerId, setTimerId] = useState<number | undefined>(undefined);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // TIMER COUNTDOWN
  useEffect(() => {
    if (timeRemaining <= 0) return
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeRemaining])

  // QUEUE
  const dequeue = (): Order | null => {
    if (sourceQueue.length === 0) return null
    const next = sourceQueue[0]
    setSourceQueue(prev => prev.slice(1))
    return next
  }

  const advance = (): Order | null => {
    const nextOrder = dequeue()
    if (nextOrder === null) return null
    setActiveOrder(nextOrder)
    return nextOrder
  }

  // SCORING
  const addPoints = (basePoints: number, speedBonus: number, streakMultiplier: number): void => {
    setScore(prev => prev + (streakMultiplier * basePoints + speedBonus))
  }

  const applyPenalty = (): void => {
    setScore(prev => Math.max(0, prev - 5))
  }

  const resetScore = (): void => {
    setScore(0)
  }

  // ORDER HANDLERS
  const handleServeOrder = (): void => {
    clearTimeout(timerId)
    if (!activeOrder) return
    const isCorrect = compareIngredients(tray, activeOrder)
    if (isCorrect) {
      handleSuccessfulOrder()
    } else {
      handleOrderFailure()
    }
    const nextOrder = advance()
    if (nextOrder === null) onLevelComplete()
  }

  const handleOrderFailure = (): void => {
    const newCount = angryCustomerCount + 1
    setAngryCustomerCount(newCount)
    if (newCount >= MAX_ANGRY_CUSTOMERS) onGameOver()
    applyPenalty()
    resetStreak()
    clearTray()
  }

  const handleSuccessfulOrder = (): void => {
    if (!activeOrder) return
    incrementStreak()
    addPoints(10, getSpeedBonus(timeRemaining, activeOrder.timeLimit), getStreakMultiplier(streak))
    clearTray()
  }

  const handleViewOrder = (order: Order): void => {
    clearTimeout(timerId)
    setTimeRemaining(order.timeLimit / 1000)
    const id = setTimeout(() => handleTimeout(), order.timeLimit) as unknown as number
    setTimerId(id)
  }

  const handleTimeout = (): void => {
    handleOrderFailure()
    const nextOrder = advance()
    if (nextOrder === null) onLevelComplete()
  }

  // CLOSE SHOP
  const handleCloseShop = (): void => {
    clearTimeout(timerId)
    clearTray()
    resetStreak()
    resetScore()
    resetAngryCustomer()
    setSourceQueue([])
    setActiveOrder(null)
    navigate('/')
  }

  // TRAY
  const updateTray = (category: keyof Order, value: string): void => {
    if (category === "toppings") {
      setTray(prev => {
        const current = prev.toppings ?? []
        return {
          ...prev,
          toppings: current.includes(value)
            ? current.filter(t => t !== value)
            : [...current, value]
        }
      })
      return
    }
    setTray(prev => ({ ...prev, [category]: value }))
  }

  // HELPERS
  const resetAngryCustomer = (): void => setAngryCustomerCount(0)
  const incrementStreak = (): void => setStreak(prev => prev + 1)
  const resetStreak = (): void => setStreak(0)
  const clearTray = (): void => setTray({})

  return {
    score,
    activeOrder,
    angryCustomerCount,
    tray,
    streak,
    timeRemaining,
    sourceQueue,
    timerId,
    advance,
    setSourceQueue,
    handleServeOrder,
    handleOrderFailure,
    handleSuccessfulOrder,
    handleViewOrder,
    handleCloseShop,
    updateTray,
    resetStreak,
    resetAngryCustomer,
    clearTray,
  }
}

export default useOrderManager