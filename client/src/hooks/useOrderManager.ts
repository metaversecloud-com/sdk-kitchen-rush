import { useCallback, useEffect, useRef, useState } from "react";

import { levelConfig } from "@/config/levelConfig";
import { BASE_POINTS, MAX_ANGRY_CUSTOMERS, PENALTY } from "@/data/gameConstants";
import { Feedback, FeedbackType } from "@/types/Feedback";
import { Order, Tray, emptyTray } from "@/types/Order";
import { awardBadge, compareIngredients, getSpeedBonus, getStreakMultiplier, trackEvent } from "@/utils";

export type ActiveBadge = { name: string; icon: string };

export type LevelStart = {
  score: number;
  angry: number;
  streak: number;
  ordersServed: number;
};

const BADGES = {
  FIRST_ORDER: "First Order",
  STREAK: "Speed Chef",
  MASTER: "Master Barista",
} as const;

const STREAK_MILESTONES = [5, 10, 25];
const FEEDBACK_DURATION_MS = 2000;
const BADGE_POPUP_DURATION_MS = 4000;
const FINAL_LEVEL = 4;

const generateRandomOrder = (level: number): Order => {
  const config = levelConfig[level as keyof typeof levelConfig];
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const order: Order = {
    id: Math.floor(1000 + Math.random() * 9000).toString(),
    size: pick(config.ingredients.size),
    temp: pick(config.ingredients.temp),
    milk: pick(config.ingredients.milk),
    timeLimit: config.timer,
  };
  if (config.ingredients.flavor.length > 0) order.flavor = pick(config.ingredients.flavor);
  if (config.ingredients.toppings.length > 0) {
    const shuffled = [...config.ingredients.toppings].sort(() => Math.random() - 0.5);
    order.toppings = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
  }
  return order;
};

interface UseOrderManagerOptions {
  level: number;
  initial: LevelStart;
  onLevelComplete: (next: LevelStart) => void;
  onGameOver: (final: { score: number; ordersServed: number }) => void;
}

const useOrderManager = ({ level, initial, onLevelComplete, onGameOver }: UseOrderManagerOptions) => {
  const [score, setScore] = useState<number>(initial.score);
  const [streak, setStreak] = useState<number>(initial.streak);
  const [angryCount, setAngryCount] = useState<number>(initial.angry);
  const [ordersServedGame, setOrdersServedGame] = useState<number>(initial.ordersServed);
  const [ordersServedLevel, setOrdersServedLevel] = useState<number>(0);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [tray, setTray] = useState<Tray>(emptyTray());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeBadge, setActiveBadge] = useState<ActiveBadge | null>(null);

  const timeoutRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const badgeTimeoutRef = useRef<number | undefined>(undefined);

  // Latest values for use inside timer callbacks (avoids stale closures
  // when the game ends via timeout rather than a button click).
  const stateRef = useRef({ score, ordersServedGame });
  useEffect(() => {
    stateRef.current = { score, ordersServedGame };
  }, [score, ordersServedGame]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, []);

  const triggerFeedback = useCallback((message: string, type: FeedbackType) => {
    if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ message, type });
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
  }, []);

  const showBadgePopup = useCallback((badge: ActiveBadge) => {
    if (badgeTimeoutRef.current) window.clearTimeout(badgeTimeoutRef.current);
    setActiveBadge(badge);
    badgeTimeoutRef.current = window.setTimeout(() => setActiveBadge(null), BADGE_POPUP_DURATION_MS);
  }, []);

  const dismissBadge = useCallback(() => {
    if (badgeTimeoutRef.current) window.clearTimeout(badgeTimeoutRef.current);
    setActiveBadge(null);
  }, []);

  const tryAwardBadge = useCallback(
    async (badgeName: string) => {
      const result = await awardBadge(badgeName);
      if (result?.granted) showBadgePopup({ name: badgeName, icon: result.icon || "" });
    },
    [showBadgePopup],
  );

  // Refs break the circular call graph (advance → handleOrderFailure on
  // timeout, handleOrderFailure → advance after a non-fatal miss).
  const advanceRef = useRef<() => void>(() => {});
  const handleOrderFailureRef = useRef<(message: string) => void>(() => {});

  const endGame = () => {
    clearTimers();
    onGameOver({ score: stateRef.current.score, ordersServed: stateRef.current.ordersServedGame });
  };

  const handleOrderFailure = (message: string) => {
    setScore((prev) => Math.max(0, prev - PENALTY));
    setStreak(0);
    setTray(emptyTray());
    triggerFeedback(message, "error");
    setAngryCount((prev) => {
      const next = prev + 1;
      if (next >= MAX_ANGRY_CUSTOMERS) {
        trackEvent("gamesCompleted");
        endGame();
      } else {
        advanceRef.current();
      }
      return next;
    });
  };

  const advance = () => {
    if (ordersServedGame === 0 && angryCount === 0) trackEvent("gamesStarted");
    const order = generateRandomOrder(level);
    setActiveOrder(order);
    clearTimers();
    setTimeRemaining(Math.ceil(order.timeLimit / 1000));
    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    timeoutRef.current = window.setTimeout(() => {
      trackEvent("ordersTimedout");
      handleOrderFailureRef.current("Customer got tired of waiting!");
    }, order.timeLimit);
  };

  advanceRef.current = advance;
  handleOrderFailureRef.current = handleOrderFailure;

  const handleServeOrder = () => {
    if (!activeOrder) return;

    if (!compareIngredients(tray, activeOrder)) {
      trackEvent("wrongOrdersServed");
      handleOrderFailure("Oops, wrong order!");
      return;
    }

    trackEvent("correctOrdersServed");

    const speedBonus = getSpeedBonus(timeRemaining * 1000, activeOrder.timeLimit);
    const points = BASE_POINTS * getStreakMultiplier(streak) + speedBonus;
    const newScore = score + points;
    const newStreak = streak + 1;
    const newOrdersServedLevel = ordersServedLevel + 1;
    const newOrdersServedGame = ordersServedGame + 1;
    const config = levelConfig[level as keyof typeof levelConfig];
    const justHitMilestone = STREAK_MILESTONES.includes(newStreak);

    setScore(newScore);
    setStreak(newStreak);
    setOrdersServedLevel(newOrdersServedLevel);
    setOrdersServedGame(newOrdersServedGame);
    setTray(emptyTray());
    triggerFeedback(
      justHitMilestone ? `🔥 ${newStreak} Streak!` : "Perfect!",
      justHitMilestone ? "milestone" : "success",
    );

    if (newOrdersServedGame === 1) void tryAwardBadge(BADGES.FIRST_ORDER);
    if (justHitMilestone) {
      trackEvent("streakMilestonesReached");
      void tryAwardBadge(BADGES.STREAK);
    }

    if (newOrdersServedLevel >= config.threshold) {
      clearTimers();
      if (level >= FINAL_LEVEL) void tryAwardBadge(BADGES.MASTER);
      onLevelComplete({
        score: newScore,
        angry: angryCount,
        streak: newStreak,
        ordersServed: newOrdersServedGame,
      });
    } else {
      advance();
    }
  };

  const handleManualCloseShop = () => {
    trackEvent("gamesEndedEarly");
    endGame();
  };

  const updateTray = useCallback((category: keyof Order, value: string) => {
    setTray((prev) => {
      if (category === "toppings") {
        const current = prev.toppings || [];
        if (current.includes(value) || current.length >= 3) return prev;
        return { ...prev, toppings: [...current, value] };
      }
      const existing = prev[category];
      if (typeof existing === "string" && existing !== "") return prev;
      return { ...prev, [category]: value };
    });
  }, []);

  // Cleanup all timers on unmount.
  useEffect(() => {
    return () => {
      clearTimers();
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
      if (badgeTimeoutRef.current) window.clearTimeout(badgeTimeoutRef.current);
    };
  }, [clearTimers]);

  return {
    activeOrder,
    activeBadge,
    angryCount,
    feedback,
    score,
    streak,
    timeRemaining,
    tray,
    advance,
    dismissBadge,
    handleManualCloseShop,
    handleServeOrder,
    updateTray,
  };
};

export default useOrderManager;
