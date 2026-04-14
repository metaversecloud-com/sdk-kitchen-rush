import { Order } from "../types/Order"
import { Feedback, FeedbackType } from "../types/Feedback"
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
  onLevelComplete: (finalScore: number, finalAngryCount: number) => void, 
  currentLevel: number 
) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // STATE
  const [score, setScore] = useState<number>(state?.inheritedScore || 0);
  const [angryCustomerCount, setAngryCustomerCount] = useState<number>(state?.inheritedAngry || 0);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [sourceQueue, setSourceQueue] = useState<Order[]>([]);
  
  // FIX: Initialize with empty strings so Ingredients.tsx doesn't crash on undefined
  const [tray, setTray] = useState<Partial<Order>>({
    size: "",
    temp: "",
    milk: "",
    flavor: "none",
    toppings: []
  });

  const [streak, setStreak] = useState<number>(0);
  const [totalServed, setTotalServed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // REFS for timers and stale state prevention
  const timerRef = useRef<number | undefined>(undefined);
  const timerIntervalRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(score);
  const servedRef = useRef(totalServed);
  const angryRef = useRef(angryCustomerCount);

  // Sync refs so callbacks always have the fresh value
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { servedRef.current = totalServed; }, [totalServed]);
  useEffect(() => { angryRef.current = angryCustomerCount; }, [angryCustomerCount]);

  const triggerFeedback = (message: string, type: FeedbackType): void => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2000);
  };

  const startOrderTimer = (durationMs: number) => {
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);
    
    setTimeRemaining(durationMs / 1000);

    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    timerRef.current = window.setTimeout(() => {
      handleTimeout();
    }, durationMs);
  };

  const generateRandomOrder = (level: number): Order => {
    const config = levelConfig[level as keyof typeof levelConfig];
    const order: any = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      size: config.ingredients.size[Math.floor(Math.random() * config.ingredients.size.length)],
      temp: config.ingredients.temp[Math.floor(Math.random() * config.ingredients.temp.length)],
      milk: config.ingredients.milk[Math.floor(Math.random() * config.ingredients.milk.length)],
      timeLimit: config.timer,
    };

    if (config.ingredients.flavor?.length > 0) {
      order.flavor = config.ingredients.flavor[Math.floor(Math.random() * config.ingredients.flavor.length)];
    }
    if (config.ingredients.toppings?.length > 0) {
      const numToppings = Math.floor(Math.random() * 2) + 1;
      const shuffled = [...config.ingredients.toppings].sort(() => 0.5 - Math.random());
      order.toppings = shuffled.slice(0, numToppings);
    }
    return order as Order;
  };

  const advance = (): void => {
    const nextOrder = generateRandomOrder(currentLevel);
    setActiveOrder(nextOrder);
    const config = levelConfig[currentLevel as keyof typeof levelConfig];
    startOrderTimer(config.timer);
  };

  const handleOrderFailure = (message: string = "Oops, wrong order!"): void => {
    const newCount = angryCustomerCount + 1;
    setAngryCustomerCount(newCount);
    setScore(prev => Math.max(0, prev - PENALTY));
    setStreak(0);
    clearTray();
    triggerFeedback(message, "error");

    if (newCount >= MAX_ANGRY_CUSTOMERS) {
      handleCloseShop();
    } else {
      advance();
    }
  };

  const handleTimeout = (): void => {
    triggerFeedback("Order expired!", "timeout");
    handleOrderFailure("Customer got tired of waiting!");
  };

  const handleServeOrder = () => {
    if (compareIngredients(tray, activeOrder)) {
      // Success
      const newTotal = totalServed + 1;
      setTotalServed(newTotal);
      setStreak(prev => prev + 1);
      
      const speedBonus = getSpeedBonus(timeRemaining, activeOrder?.timeLimit || 10000);
      const points = (BASE_POINTS * getStreakMultiplier(streak)) + speedBonus;
      setScore(prev => prev + points);
      
      clearTray();
      triggerFeedback(streak + 1 >= 5 ? `🔥 ${streak + 1} Streak!` : "Perfect!", "success");

      const config = levelConfig[currentLevel as keyof typeof levelConfig];
      if (newTotal >= config.threshold) {
        // Stop timers before navigating
        clearTimeout(timerRef.current);
        clearInterval(timerIntervalRef.current);
        onLevelComplete(score + points, angryCustomerCount);
      } else {
        advance();
      }
    } else {
      handleOrderFailure();
    }
  };

  const handleCloseShop = (): void => {
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);
    navigate('/game-over', { 
      state: { 
        score: scoreRef.current, 
        ordersServed: servedRef.current 
      } 
    });
  };

  const updateTray = (category: keyof Order, value: string): void => {
    setTray(prev => {
      if (category === "toppings") {
        const currentToppings = prev.toppings || [];
        if (currentToppings.includes(value)) return prev;
        if (currentToppings.length < 3) {
          return { ...prev, toppings: [...currentToppings, value] };
        }
        return prev;
      }
      // If they already picked this category, don't let them change (lock-in mechanic)
      if (prev[category] && prev[category] !== "") return prev; 
      return { ...prev, [category]: value };
    });
  };

  const clearTray = (): void => setTray({
    size: "",
    temp: "",
    milk: "",
    flavor: "none",
    toppings: []
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  return {
    score,
    activeOrder,
    angryCustomerCount,
    tray,
    streak,
    timeRemaining,
    feedback,
    handleServeOrder,
    handleCloseShop,
    updateTray,
    advance,
    clearTray
  };
};

export default useOrderManager;