import { Order } from "../types/Order"
import { Feedback, FeedbackType } from "../types/Feedback"
import { compareIngredients } from "../utils/compareIngredients"
import { getSpeedBonus } from "../utils/speedMultiplier"
import { getStreakMultiplier } from "../utils/streakMultiplier"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { levelConfig } from "../config/levelConfig";
import { trackEvent } from "../utils/analyticsAPI";

import { 
  MAX_ANGRY_CUSTOMERS,
  PENALTY,
  BASE_POINTS,
} from '../data/gameConstants'

// custom hook to manage all order/game logic
const useOrderManager = (
  onGameOver: () => void,
  onLevelComplete: (finalScore: number, finalAngryCount: number) => void,
  onBadgeUnlocked: (name: string) => void,
  currentLevel: number 
) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // ---- STATE ----

  // player score (carry over from previous level if exists)
  const [score, setScore] = useState<number>(state?.inheritedScore || 0);

  // track number of failed orders (persisted in sessionStorage)
  const [angryCustomerCount, setAngryCustomerCount] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('angryCount') || '0') || state?.inheritedAngry || 0;
  });

   // current active order
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // queue of upcoming orders (not heavily used here yet)
  const [sourceQueue, setSourceQueue] = useState<Order[]>([]);

  // Define which streaks trigger the special feedback and badges
  const STREAK_MILESTONES = [5, 10, 25];
  
  // tray represents user-selected ingredients
  // initialize with empty strings to prevent undefined errors
  const [tray, setTray] = useState<Partial<Order>>({
    size: "",
    temp: "",
    milk: "",
    flavor: "none",
    toppings: []
  });

  // current streak (persisted)
  const [streak, setStreak] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('streak') || '0'|| state?.inheritedStreak || 0);
  });
  
  // totalServed = orders this level
  const [totalServed, setTotalServed] = useState<number>(0);
  //  cumulativeServed = total orders across whole game 
  const [cumulativeServed, setCumulativeServed] = useState<number>(() => {
    return parseInt(sessionStorage.getItem('ordersServed') || '0');
  });

   // time remaining for current order
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // feedback message (success/error)
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  
  // additional stats tracking (optional analytics)
  const [stats, setStats] = useState({
  totalCorrect: 0,
  currentStreak: 0,
  lastOrderToppingsCount: 0,
  lastOrderTimeRemaining: 0, // Store as a decimal (e.g., 0.1 for 10%)
});

  // ---- REFS ----

  // refs to avoid stale state in async callbacks
  const timerRef = useRef<number | undefined>(undefined);
  const timerIntervalRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(score);
  const servedRef = useRef(totalServed);
  const angryRef = useRef(angryCustomerCount);

   // test badge API on mount (debugging)
  useEffect(() => {
  console.log("FORCE TESTING API...");
  awardBadgeRequest("Test Badge");
}, []);

   // keep refs synced with latest state
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { servedRef.current = totalServed; }, [totalServed]);
  useEffect(() => { angryRef.current = angryCustomerCount; }, [angryCustomerCount]);
  
  // ---- FEEDBACK ----

  // show temporary feedback message
  const triggerFeedback = (message: string, type: FeedbackType): void => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 2000);
  };

  // --- TIMER ----

  // start countdown timer for an order
  const startOrderTimer = (durationMs: number) => {
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);
    
    // convert ms to seconds for display
    setTimeRemaining(durationMs / 1000);

    // decrease time every second
    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    // trigger timeout when time runs out
    timerRef.current = window.setTimeout(() => {
      handleTimeout();
    }, durationMs);
  };

  // --- ORDER GENERATION ---

  const generateRandomOrder = (level: number): Order => {

    // generate a random order based on level config
    const config = levelConfig[level as keyof typeof levelConfig];
    const order: any = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      size: config.ingredients.size[Math.floor(Math.random() * config.ingredients.size.length)],
      temp: config.ingredients.temp[Math.floor(Math.random() * config.ingredients.temp.length)],
      milk: config.ingredients.milk[Math.floor(Math.random() * config.ingredients.milk.length)],
      timeLimit: config.timer,
    };

    // optional flavor
    if (config.ingredients.flavor?.length > 0) {
      order.flavor = config.ingredients.flavor[Math.floor(Math.random() * config.ingredients.flavor.length)];
    }

    // optional toppings (1–2 random toppings)
    if (config.ingredients.toppings?.length > 0) {
      const numToppings = Math.floor(Math.random() * 2) + 1;
      const shuffled = [...config.ingredients.toppings].sort(() => 0.5 - Math.random());
      order.toppings = shuffled.slice(0, numToppings);
    }
    return order as Order;
  };

  // move to next order
  const advance = (): void => {
     // track game start event
    if (totalServed === 0 && angryCustomerCount === 0) {
      trackEvent("gamesStarted");
    }
    const nextOrder = generateRandomOrder(currentLevel);
    setActiveOrder(nextOrder);
    const config = levelConfig[currentLevel as keyof typeof levelConfig];
    startOrderTimer(config.timer);
  };

  // ---- FAILURE HANDLING ----

  // handle incorrect order or failure
  const handleOrderFailure = (message: string = "Oops, wrong order!"): void => {
    // increment angry customer count
    const newCount = angryCustomerCount + 1;
    angryRef.current = newCount;
    setAngryCustomerCount(newCount);
    sessionStorage.setItem("angryCount", newCount.toString());

    // apply score penalty
    setScore(prev => Math.max(0, prev - PENALTY));

    // reset streak
    setStreak(0);
    sessionStorage.setItem('streak', '0');
    clearTray();
    triggerFeedback(message, "error");

    // check if game over
    if (newCount >= MAX_ANGRY_CUSTOMERS) {
      trackEvent("gamesCompleted");
      handleCloseShop();
    } else {
      advance();
    }
  };

  // handle timer running out
  const handleTimeout = (): void => {
    trackEvent("ordersTimedout");
    handleOrderFailure("Customer got tired of waiting!");
  };

  // handler to manually close shop
  const handleManualCloseShop = (): void => {
    trackEvent("gamesEndedEarly");
    handleCloseShop();
  };

  // ---- SERVE ORDER ----
  const handleServeOrder = () => {
    // check if tray matches order
    const isCorrect = compareIngredients(tray, activeOrder);
    const config = levelConfig[currentLevel as keyof typeof levelConfig];

    if (isCorrect) {
      trackEvent("correctOrdersServed");
      
      // --- BADGE LOGIC START ---
      // This will now use the REAL credentials from the Topia URL when pushed
      console.log("Awarding badge for correct order...");
      awardBadgeRequest("First Order"); 
      // --- BADGE LOGIC END ---

       // update counts
      const newTotal = totalServed + 1;
      setTotalServed(newTotal);

      const newCumulative = cumulativeServed + 1;
      setCumulativeServed(newCumulative);
      sessionStorage.setItem("ordersServed", newCumulative.toString());
      servedRef.current = newCumulative; 

       // update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      sessionStorage.setItem('streak', newStreak.toString());

      // check for streak milestone badge
      if (STREAK_MILESTONES.includes(newStreak)) {
        trackEvent("streakMilestonesReached");
        awardBadgeRequest("Speed Chef"); // Award another badge for streaks!
      }

      // calculate score (base + streak + speed bonus)
      const speedBonus = getSpeedBonus(timeRemaining * 1000, activeOrder?.timeLimit || 10000);
      const points = (BASE_POINTS * getStreakMultiplier(streak)) + speedBonus;
      const updatedScore = score + points;
      setScore(updatedScore);
      
      clearTray();

      // display feedback message
      triggerFeedback(STREAK_MILESTONES.includes(newStreak) ? `🔥 ${newStreak} Streak!` : "Perfect!", "success");

      // check level completion
      if (newTotal >= config.threshold) {
        clearTimeout(timerRef.current);
        clearInterval(timerIntervalRef.current);
        sessionStorage.removeItem('streak');
        onLevelComplete(updatedScore, angryCustomerCount);
      } else {
        advance();
      }
    } else {
      trackEvent("wrongOrdersServed");
      handleOrderFailure();
    }
  };

  // ---- CLOSE SHOP ----
  // handle closing the shop (game over or manual exit)
  const handleCloseShop = (): void => {
    // stop any active timers
    clearTimeout(timerRef.current);
    clearInterval(timerIntervalRef.current);

    // get total orders served from sessionStorage
    const ordersServed = parseInt(sessionStorage.getItem('ordersServed') || '0');
    // use ref to get latest score (avoids stale state issues)
    const score = scoreRef.current;

    // clear stored game data
    sessionStorage.removeItem('ordersServed');
    sessionStorage.removeItem('angryCount');
    sessionStorage.removeItem('streak')

    // navigate to game over screen with final results
    navigate('/game-over', { 
      state: { 
        score,
        ordersServed // pass value before it was removed
      } 
    });
  };

  // --- TRAY ---
  const updateTray = (category: keyof Order, value: string): void => {
    // update tray when user selects ingredient
    setTray(prev => {
      // toppings allow multiple selections (max 3)
      if (category === "toppings") {
        const currentToppings = prev.toppings || [];
        if (currentToppings.includes(value)) return prev;
        if (currentToppings.length < 3) {
          return { ...prev, toppings: [...currentToppings, value] };
        }
        return prev;
      }
      // lock-in mechanic: cannot change once selected
      if (prev[category] && prev[category] !== "") return prev; 
      return { ...prev, [category]: value };
    });
  };

   // reset tray after order is served
  const clearTray = (): void => setTray({
    size: "",
    temp: "",
    milk: "",
    flavor: "",
    toppings: []
  });

const awardBadgeRequest = async (badgeName: string) => {
    try {
      // 1. Try to get search params from the current window safely
      let search = window.location.search;

      // 2. Only try to look at the parent if we are actually in an iframe 
      // AND it's on the same domain (to avoid the SecurityError)
      // if (!search && window.self !== window.top) {
      //   try {
      //     search = window.parent.location.search;
      //   } catch (e) {
      //     console.warn("Could not read parent URL due to cross-origin restrictions.");
      //   }
      // }
      if (!search || search === "") {
      console.warn("Using local dev credentials...");
      // Replace these with actual values from a real Topia URL once, 
      // or just dummy strings to stop the server from crashing.
      search = "?interactiveNonce=test&interactivePublicKey=J6MYijmfrAjGX0A389P8&urlSlug=blank3t-demo-3m2tc4fqj&visitorId=test";
    }

      const urlParams = new URLSearchParams(search);

      // 3. Debug: See if we actually have params now
      if (!urlParams.has("interactiveNonce")) {
        console.error("❌ No credentials found in URL. Topia won't authorize this request.");
      }

      console.log("Full API URL:", `/api/award-badge?${urlParams.toString()}`);

      const response = await fetch(`/api/award-badge?${urlParams.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeName }),
      });

      if (!response.ok) throw new Error("Server error awarding badge");
      
      const data = await response.json();
      if (data.success) {
        onBadgeUnlocked(badgeName);
      }
    } catch (error) {
      console.error(`Failed to award ${badgeName}:`, error);
    }
  };

  // --- CLEANUP ----
  // clear timers on component unmount
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ---- RETURN ----

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
    clearTray,
    awardBadgeRequest,
    ordersServed: totalServed, // Adding alias
    handleManualCloseShop,
    trackEvent
  };
};

export default useOrderManager;