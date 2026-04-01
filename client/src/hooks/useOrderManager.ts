import { Order } from "../types/Order"
import { compareIngredients } from "../utils/compareIngredients"
import { useState, useEffect } from "react"

const MAX_ANGRY_CUSTOMERS = 5;

const useOrderManager = (
    onGameOver: () => void,
  onLevelComplete: () => void) => {

  const [angryCustomerCount, setAngryCustomerCount] = useState<number>(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [sourceQueue, setSourceQueue] = useState<Order[]>([]);
  const [tray, setTray] = useState<Partial<Order>>({})
  const [streak, setStreak] = useState<number>(0);
  const [timerId, setTimerId] = useState<number | undefined>(undefined);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);


  useEffect(() => {
  if (timeRemaining <= 0) return
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeRemaining])

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

  const handleServeOrder = (): void => {
    clearTimeout(timerId);
    if (!activeOrder) return;
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
  if (newCount == MAX_ANGRY_CUSTOMERS) onGameOver()
  resetStreak()
  clearTray()
  // playErrorFeedback()
}

const handleSuccessfulOrder = (): void => {
  incrementStreak()
  // giveRewards()
  clearTray()
  // playSuccessFeedback()
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

const updateTray = (category: keyof Order, value: string): void => {
  // MULTI-SELECT: toppings
  if (category === "toppings") {
    setTray(prev => {
      const current = prev.toppings ?? [];
      return {
        ...prev,
        toppings: current.includes(value)
          ? current.filter(t => t !== value)
          : [...current, value]
      };
    });
    return;
  }

  // SINGLE-SELECT: size, temp, milk, flavor
  setTray(prev => ({
    ...prev,
    [category]: value
  }));
};


// HELPER FUNCTIONS
const increaseAngryCustomer = (): void => {
    setAngryCustomerCount(prev => prev + 1);
}

const resetAngryCustomer = (): void => {
    setAngryCustomerCount(0);
}

const incrementStreak = (): void => {
    setStreak(prev => prev + 1);
}

const resetStreak = (): void => {
   setStreak(0);
}

const clearTray = (): void => {
  setTray({})
}

return {
    activeOrder,
    angryCustomerCount,
    advance,
    tray,
    streak,
    handleServeOrder,
    handleOrderFailure,
    handleSuccessfulOrder,
    setSourceQueue,
    handleViewOrder,
    clearTray,
    resetStreak,
    updateTray,
    resetAngryCustomer,
    timerId,
    sourceQueue,
    timeRemaining,
  }
}

export default useOrderManager
