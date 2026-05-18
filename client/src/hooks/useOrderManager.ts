import { useCallback, useEffect, useRef, useState } from "react";

import { levelConfig } from "@/config/levelConfig";
import {
  BASE_POINTS,
  IN_GAME_BADGES,
  LAST_MINUTE_TIME_THRESHOLD,
  LIGHTNING_HANDS_STREAK,
  LIGHTNING_HANDS_TIME_THRESHOLD,
  MAX_ANGRY_CUSTOMERS,
  OOPS_STREAK,
  PENALTY,
  PERFECT_PLATE_STREAK,
  RUSH_HOUR_STREAK,
  SLUGGISH_STREAK,
  SLUGGISH_TIME_THRESHOLD,
  UNSTOPPABLE_STREAK,
  WANT_IT_ALL_LEVEL,
} from "@/data/gameConstants";
import { Feedback, FeedbackType } from "@/types/Feedback";
import { Order, Tray, emptyTray } from "@/types/Order";
import { awardBadge, compareIngredients, getSpeedBonus, getStreakMultiplier, trackEvent } from "@/utils";

export type ActiveBadge = { name: string; icon: string };

export type LevelStart = {
  score: number;
  angry: number;
  streak: number;
  ordersServed: number;
  incorrectOrders: number;
};

// Raw end-of-game stats. The /game-end roundtrip (which produces the rank,
// granted badges, and updated visitor stats) is initiated by the GameOver
// screen so the phase transition can happen instantly while the server
// crunches the results.
export type GameOverPayload = {
  score: number;
  ordersServed: number;
  correctOrders: number;
  incorrectOrders: number;
  angryCount: number;
};

const FEEDBACK_DURATION_MS = 2000;
const TIMER_TICK_INTERVAL_MS = 100;
const FINAL_LEVEL = 4;

const generateRandomOrder = (level: number): Order => {
  const config = levelConfig[level as keyof typeof levelConfig];
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const order: Order = {
    id: Math.floor(1000 + Math.random() * 9000).toString(),
    size: pick(config.ingredients.size),
    temp: pick(config.ingredients.temp),
    milk: pick(config.ingredients.milk),
    timeLimit: config.timer,
  };
  if (config.ingredients.flavor.length > 0) order.flavor = pick(config.ingredients.flavor);
  if (config.ingredients.toppings.length > 0) {
    const maxToppings = level === WANT_IT_ALL_LEVEL ? 3 : 2;
    const numToppings = Math.floor(Math.random() * maxToppings) + 1;
    const shuffled = [...config.ingredients.toppings].sort(() => Math.random() - 0.5);
    order.toppings = shuffled.slice(0, numToppings);
  }
  return order;
};

interface UseOrderManagerOptions {
  level: number;
  initial: LevelStart;
  ownedBadgeNames: string[];
  onLevelComplete: (next: LevelStart) => void;
  onGameOver: (final: GameOverPayload) => void;
  onBadgeGranted?: (badge: ActiveBadge) => void;
}

const useOrderManager = ({
  level,
  initial,
  ownedBadgeNames,
  onLevelComplete,
  onGameOver,
  onBadgeGranted,
}: UseOrderManagerOptions) => {
  const [score, setScore] = useState<number>(initial.score);
  const [streak, setStreak] = useState<number>(initial.streak);
  const [angryCount, setAngryCount] = useState<number>(initial.angry);
  const [ordersServedGame, setOrdersServedGame] = useState<number>(initial.ordersServed);
  const [ordersServedLevel, setOrdersServedLevel] = useState<number>(0);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [tray, setTray] = useState<Tray>(emptyTray());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const timeoutRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const badgeTimeoutRef = useRef<number | undefined>(undefined);
  const gameEndedRef = useRef(false);
  // Wall-clock start of the current order. Used to compute exact ms-precise
  // time remaining at serve — the rendered `timeRemaining` state ticks at
  // 100ms granularity, which would otherwise float "Last Minute Save" out of
  // reach and leave the visual timer bar above 0 at expiry.
  const orderStartTimeRef = useRef<number>(0);

  // Cross-render snapshot so timer-fired endings and button-fired endings both
  // see the latest score / orders / per-game accumulators. correctOrders and
  // incorrectOrders are seeded from `initial` so they accumulate across levels
  // (Game remounts between levels and would otherwise lose them).
  const statsRef = useRef({
    score: initial.score,
    angryCount: initial.angry,
    ordersServedGame: initial.ordersServed,
    correctOrders: initial.ordersServed,
    incorrectOrders: initial.incorrectOrders,
    fastStreak: 0,
    slowStreak: 0,
    wrongStreak: 0,
  });
  useEffect(() => {
    statsRef.current.score = score;
  }, [score]);
  useEffect(() => {
    statsRef.current.angryCount = angryCount;
  }, [angryCount]);
  useEffect(() => {
    statsRef.current.ordersServedGame = ordersServedGame;
  }, [ordersServedGame]);

  const ownedBadgesRef = useRef<Set<string>>(new Set(ownedBadgeNames));
  // Keep the local set in sync with the parent-supplied list. The parent
  // (Home) updates context on each newly-granted badge, so a subsequent
  // Game remount (next level) starts already-aware of badges earned earlier.
  useEffect(() => {
    ownedBadgesRef.current = new Set(ownedBadgeNames);
  }, [ownedBadgeNames]);

  const onBadgeGrantedRef = useRef(onBadgeGranted);
  useEffect(() => {
    onBadgeGrantedRef.current = onBadgeGranted;
  }, [onBadgeGranted]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, []);

  const triggerFeedback = useCallback((message: string, type: FeedbackType) => {
    if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ message, type });
    feedbackTimeoutRef.current = window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
  }, []);

  // Server dedupes badge grants, but we also short-circuit on the client to
  // avoid a roundtrip when the visitor already owns the badge.
  const tryAwardBadge = useCallback(async (badgeName: string) => {
    if (ownedBadgesRef.current.has(badgeName)) return;
    // Optimistically mark as owned before the network call so concurrent
    // triggers (e.g. two streak milestones reached on the same serve) don't
    // each fire a duplicate request.
    ownedBadgesRef.current.add(badgeName);
    const result = await awardBadge(badgeName);
    if (!result?.success) {
      // Roll back the optimistic mark so the next trigger retries.
      ownedBadgesRef.current.delete(badgeName);
      return;
    }
    // Notify on every successful response — including granted=false (server
    // says the visitor already owns it). The parent's merge is idempotent;
    // syncing here keeps the Badges tab + future Game mounts honest when the
    // initial /game-state snapshot was stale.
    onBadgeGrantedRef.current?.({ name: badgeName, icon: result.icon || "" });
  }, []);

  // Refs break the circular call graph (advance → handleOrderFailure on
  // timeout, handleOrderFailure → advance after a non-fatal miss).
  const advanceRef = useRef<() => void>(() => {});
  const handleOrderFailureRef = useRef<(message: string) => void>(() => {});

  const endGame = () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    clearTimers();
    const stats = statsRef.current;
    onGameOver({
      score: stats.score,
      ordersServed: stats.ordersServedGame,
      correctOrders: stats.correctOrders,
      incorrectOrders: stats.incorrectOrders,
      angryCount: stats.angryCount,
    });
  };

  const handleOrderFailure = (message: string) => {
    setScore((prev) => Math.max(0, prev - PENALTY));
    setStreak(0);
    setTray(emptyTray());
    triggerFeedback(message, "error");

    statsRef.current.incorrectOrders += 1;
    statsRef.current.wrongStreak += 1;
    statsRef.current.fastStreak = 0;
    statsRef.current.slowStreak = 0;
    if (statsRef.current.wrongStreak >= OOPS_STREAK) void tryAwardBadge(IN_GAME_BADGES.OOPS);

    setAngryCount((prev) => {
      const next = prev + 1;
      if (next >= MAX_ANGRY_CUSTOMERS) {
        trackEvent("gamesCompleted");
        statsRef.current.angryCount = next;
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
    orderStartTimeRef.current = Date.now();
    setTimeRemaining(order.timeLimit / 1000);
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - orderStartTimeRef.current;
      setTimeRemaining(Math.max(0, (order.timeLimit - elapsed) / 1000));
    }, TIMER_TICK_INTERVAL_MS);
    timeoutRef.current = window.setTimeout(() => {
      setTimeRemaining(0);
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

    // Use wall-clock elapsed time so the badge thresholds (especially the <5%
    // Last Minute Save) see real ms precision, not the 100ms-granular state.
    const actualRemainingMs = Math.max(0, activeOrder.timeLimit - (Date.now() - orderStartTimeRef.current));
    const speedBonus = getSpeedBonus(actualRemainingMs, activeOrder.timeLimit);
    const points = BASE_POINTS * getStreakMultiplier(streak) + speedBonus;
    const newScore = score + points;
    const newStreak = streak + 1;
    const newOrdersServedLevel = ordersServedLevel + 1;
    const newOrdersServedGame = ordersServedGame + 1;
    const config = levelConfig[level as keyof typeof levelConfig];
    const justHitStreakMilestone =
      newStreak === PERFECT_PLATE_STREAK || newStreak === RUSH_HOUR_STREAK || newStreak === UNSTOPPABLE_STREAK;

    setScore(newScore);
    setStreak(newStreak);
    setOrdersServedLevel(newOrdersServedLevel);
    setOrdersServedGame(newOrdersServedGame);
    setTray(emptyTray());
    triggerFeedback(
      justHitStreakMilestone ? `🔥 ${newStreak} Streak!` : "Perfect!",
      justHitStreakMilestone ? "milestone" : "success",
    );

    statsRef.current.correctOrders += 1;
    statsRef.current.wrongStreak = 0;

    const timePercent = activeOrder.timeLimit > 0 ? (actualRemainingMs / activeOrder.timeLimit) * 100 : 0;
    if (timePercent > LIGHTNING_HANDS_TIME_THRESHOLD) {
      statsRef.current.fastStreak += 1;
      statsRef.current.slowStreak = 0;
      if (statsRef.current.fastStreak >= LIGHTNING_HANDS_STREAK) void tryAwardBadge(IN_GAME_BADGES.LIGHTNING_HANDS);
    } else if (timePercent < SLUGGISH_TIME_THRESHOLD) {
      statsRef.current.slowStreak += 1;
      statsRef.current.fastStreak = 0;
      if (statsRef.current.slowStreak >= SLUGGISH_STREAK) void tryAwardBadge(IN_GAME_BADGES.SLUGGISH);
    } else {
      statsRef.current.fastStreak = 0;
      statsRef.current.slowStreak = 0;
    }
    if (timePercent < LAST_MINUTE_TIME_THRESHOLD) void tryAwardBadge(IN_GAME_BADGES.LAST_MINUTE_SAVE);
    if (level === WANT_IT_ALL_LEVEL && (activeOrder.toppings?.length || 0) === 3) {
      void tryAwardBadge(IN_GAME_BADGES.WANT_IT_ALL);
    }
    if (statsRef.current.correctOrders === 1) void tryAwardBadge(IN_GAME_BADGES.FIRST_ORDER);
    if (newStreak === PERFECT_PLATE_STREAK) void tryAwardBadge(IN_GAME_BADGES.PERFECT_PLATE);
    if (newStreak === RUSH_HOUR_STREAK) void tryAwardBadge(IN_GAME_BADGES.RUSH_HOUR);
    if (newStreak === UNSTOPPABLE_STREAK) void tryAwardBadge(IN_GAME_BADGES.UNSTOPPABLE);

    if (newOrdersServedLevel >= config.threshold) {
      clearTimers();
      if (level >= FINAL_LEVEL) {
        endGame();
      } else {
        onLevelComplete({
          score: newScore,
          angry: angryCount,
          streak: newStreak,
          ordersServed: newOrdersServedGame,
          incorrectOrders: statsRef.current.incorrectOrders,
        });
      }
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

  useEffect(() => {
    return () => {
      clearTimers();
      if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
      if (badgeTimeoutRef.current) window.clearTimeout(badgeTimeoutRef.current);
    };
  }, [clearTimers]);

  return {
    activeOrder,
    angryCount,
    feedback,
    score,
    streak,
    timeRemaining,
    tray,
    advance,
    handleManualCloseShop,
    handleServeOrder,
    updateTray,
  };
};

export default useOrderManager;
