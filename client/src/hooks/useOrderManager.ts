import { Order } from "../types/Order"
import { Feedback,  FeedbackType } from "../types/Feedback"
import { compareIngredients } from "../utils/compareIngredients"
import { getSpeedBonus } from "../utils/speedMultiplier"
import { getStreakMultiplier } from "../utils/streakMultiplier"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
  
import { 
  MAX_ANGRY_CUSTOMERS,
  PENALTY,
  BASE_POINTS
} from '../data/gameConstants'
  
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
  const timerRef = useRef<number | undefined>(undefined);

  // to increment orders served
  const [ordersServed, setOrdersServed] = useState<number>(0);

  // handles time logic
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerIntervalRef = useRef<number | undefined>(undefined);

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const triggerFeedback = (message: string, type: FeedbackType): void => {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 2000)
  }

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
    setScore(prev => Math.max(0, prev - PENALTY))
  }

  const resetScore = (): void => {
    setScore(0)
  }

  // ORDER HANDLERS
  const handleServeOrder = (): void => {
    clearTimeout(timerRef.current)
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
    triggerFeedback("Oops, wrong order!", "error")
  }

  const handleSuccessfulOrder = (): void => {
    if (!activeOrder) return
    setOrdersServed(prev => prev + 1);
    incrementStreak()
    addPoints(BASE_POINTS, getSpeedBonus(timeRemaining, activeOrder.timeLimit), getStreakMultiplier(streak))
    clearTray()
    
    // player feedback
    const newStreak = streak + 1
    if (newStreak === 5 || newStreak === 10 || newStreak === 15) {
      triggerFeedback(`🔥 ${newStreak} Streak!`, "milestone")
    } else {
      triggerFeedback("Order successfully completed!", "success")
    }
  }

  const handleTimeoutRef = useRef<() => void>(() => {});

  // Keeps the ref always pointing to the latest version
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  });

  const handleViewOrder = (order: Order): void => {
    clearTimeout(timerRef.current)
    setTimeRemaining(order.timeLimit / 1000)
    clearInterval(timerIntervalRef.current)
    setTimeRemaining(order.timeLimit / 1000)
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000) as unknown as number
    timerRef.current = setTimeout(() => {
      handleTimeoutRef.current()  // always calls latest version
    }, order.timeLimit) as unknown as number
  }

  const handleTimeout = (): void => {
    handleOrderFailure()
    const nextOrder = advance()
    if (nextOrder === null) onLevelComplete()
    triggerFeedback("Order expired!", "timeout")
  }

  // CLOSE SHOP
  const handleCloseShop = (): void => {
    clearTimeout(timerRef.current)
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
    advance,
    setSourceQueue,
    handleServeOrder,
    handleOrderFailure,
    handleSuccessfulOrder,
    feedback, 
    handleViewOrder,
    handleCloseShop,
    updateTray,
    setOrdersServed,
    ordersServed,
    resetStreak,
    resetAngryCustomer,
    clearTray,
  }
}

export default useOrderManager