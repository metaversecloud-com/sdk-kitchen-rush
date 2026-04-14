import { Order } from "../types/Order"
import { Feedback,  FeedbackType } from "../types/Feedback"
import { compareIngredients } from "../utils/compareIngredients"
import { getSpeedBonus } from "../utils/speedMultiplier"
import { getStreakMultiplier } from "../utils/streakMultiplier"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { levelConfig } from "../config/levelConfig";
  
import { 
  MAX_ANGRY_CUSTOMERS,
  PENALTY,
  BASE_POINTS
} from '../data/gameConstants'
  
const useOrderManager = (
  onGameOver: () => void,
  // Expects both the score AND the current angry count
  onLevelComplete: (finalScore: number, finalAngryCount: number) => void, 
  currentLevel: number 
) => {
  const location = useLocation();
  const navigate = useNavigate()

  // STATE
  const [score, setScore] = useState<number>(0);
  const [angryCustomerCount, setAngryCustomerCount] = useState<number>(0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [sourceQueue, setSourceQueue] = useState<Order[]>([]);
  const [tray, setTray] = useState<Partial<Order>>({})
  const [streak, setStreak] = useState<number>(0);
  const timerRef = useRef<number | undefined>(undefined);
  const [totalServed, setTotalServed] = useState(0);

  const scoreRef = useRef(0);
  const servedRef = useRef(0);

  const { state } = useLocation();
  const inheritedScore = state?.inheritedScore || 0;

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

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { servedRef.current = totalServed; }, [totalServed]);

  // QUEUE
  const dequeue = (): Order | null => {
    if (sourceQueue.length === 0) return null
    const next = sourceQueue[0]
    setSourceQueue(prev => prev.slice(1))
    return next
  }

  const startOrderTimer = (durationMs: number) => {
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);
    
    setTimeRemaining(durationMs / 1000);

    timerIntervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    timerRef.current = window.setTimeout(() => {
        handleTimeoutRef.current();
    }, durationMs);
};

  const advance = (): Order | null => {
    // We pass currentLevel to make sure it uses the right config
    const nextOrder = generateRandomOrder(currentLevel);
    
    // LOGGING: Check your browser console (F12) to see if this changes
    console.log("New Order Generated:", nextOrder);

    setActiveOrder(nextOrder);
    
    // Reset the timer for the new order
    const config = levelConfig[currentLevel as keyof typeof levelConfig];
    startOrderTimer(config.timer); 
    
    return nextOrder;
  };

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
  const handleServeOrder = () => {
    if (compareIngredients(tray, activeOrder)) {
      // 1. SUCCESS LOGIC
      handleSuccessfulOrder();
      
      const newTotal = totalServed + 1;
      setTotalServed(newTotal);
      
      const config = levelConfig[currentLevel as keyof typeof levelConfig];
      
      if (newTotal >= config.threshold) {
        // pass score AND angryCustCount
        if (newTotal >= config.threshold) {
          onLevelComplete(score, angryCustomerCount); 
        }
      } else {
        advance(); 
      }
    } else {
      // 2. FAILURE LOGIC
      // This now calls handleOrderFailure, which we updated to call advance()
      handleOrderFailure();
    }
  };

  const handleOrderFailure = (): void => {
    const newCount = angryCustomerCount + 1;
    setAngryCustomerCount(newCount);
    
    applyPenalty();
    resetStreak();
    clearTray();
    triggerFeedback("Oops, wrong order!", "error")
    
    if (newCount >= MAX_ANGRY_CUSTOMERS) {
      handleCloseShop(); // Game over if too many mistakes
    } else {
      advance(); // <--- THIS is the key. Move to next order immediately.
    }
  };

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
    // Now that levelConfig is imported, this line won't crash!
    const config = levelConfig[currentLevel as keyof typeof levelConfig];
    const levelTimer = config.timer; 
    
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);
    
    setTimeRemaining(levelTimer / 1000);

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000) as unknown as number;

    timerRef.current = setTimeout(() => {
      handleTimeoutRef.current();
    }, levelTimer) as unknown as number;
  };

  const handleTimeout = (): void => {
    handleOrderFailure()
    const nextOrder = advance()
    if (nextOrder === null) onLevelComplete()
    triggerFeedback("Order expired!", "timeout")
  }

  // CLOSE SHOP
  const handleCloseShop = (): void => {
      clearTimeout(timerRef.current);
      clearInterval(timerIntervalRef.current);
      clearTray()
      resetStreak()
      resetScore()
      resetAngryCustomer()
      setSourceQueue([])
      setActiveOrder(null)
      
      // Use .current to get the absolute latest values!
      navigate('/game-over', { 
          state: { 
              score: scoreRef.current,           
              ordersServed: servedRef.current 
          } 
      });
  };

  // TRAY
  const updateTray = (category: keyof Order, value: string): void => {
    setTray(prev => {
      // For toppings, we allow adding multiple, but NOT removing
      if (category === "toppings") {
        const currentToppings = prev.toppings || [];
        
        // If topping already exists, do nothing (prevents deselection)
        if (currentToppings.includes(value)) return prev;
        
        // If we have room (max 3), add the new topping
        if (currentToppings.length < 3) {
          return { ...prev, toppings: [...currentToppings, value] };
        }
        return prev;
      }

      // For everything else (size, milk, etc.), once it's set, we don't allow "none"
      // Unless the tray is empty or they are changing to a DIFFERENT choice.
      // If you want to lock it so they can't even CHANGE their mind:
      if (prev[category]) return prev; 

      return { ...prev, [category]: value };
    });
  };

  // This builds a random order using the rules from your config
const generateRandomOrder = (level: number): Order => {
    const config = levelConfig[level as keyof typeof levelConfig];
    
    const order: any = {
        // Use a better random ID to force React to re-render the Order card
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        size: config.ingredients.size[Math.floor(Math.random() * config.ingredients.size.length)],
        temp: config.ingredients.temp[Math.floor(Math.random() * config.ingredients.temp.length)],
        milk: config.ingredients.milk[Math.floor(Math.random() * config.ingredients.milk.length)],
        timeLimit: config.timer,
    };

    // Ensure flavor exists in config before picking
    if (config.ingredients.flavor && config.ingredients.flavor.length > 0) {
        const flavor = config.ingredients.flavor[Math.floor(Math.random() * config.ingredients.flavor.length)];
        order.flavor = flavor; // Keep "none" if it picks "none"
    }

    if (config.ingredients.toppings && config.ingredients.toppings.length > 0) {
        const numToppings = Math.floor(Math.random() * 2) + 1; // 1 or 2 toppings
        const shuffled = [...config.ingredients.toppings].sort(() => 0.5 - Math.random());
        order.toppings = shuffled.slice(0, numToppings);
    }

    return order as Order;
};

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
    generateRandomOrder,
    setOrdersServed,
    ordersServed,
    resetStreak,
    resetAngryCustomer,
    clearTray,
  }
}

export default useOrderManager