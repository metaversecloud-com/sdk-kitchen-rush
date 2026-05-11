import { useEffect, useRef, useState } from "react";

import { Leaderboard } from "./Leaderboard";
import { PageContainer } from "./PageContainer";
import { backendAPI } from "@/utils";

interface GameOverProps {
  score: number;
  ordersServed: number;
  onPlayAgain: () => void;
}

export const GameOver = ({ score, ordersServed, onPlayAgain }: GameOverProps) => {
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    backendAPI
      .post("/leaderboard/update", { score })
      .catch((err) => console.error("Failed to update leaderboard:", err))
      .finally(() => setScoreSubmitted(true));
  }, [score]);

  return (
    <PageContainer isLoading={false} headerText="Game Over">
      <div className="grid gap-2">
        <div className="card info-card mb-4">
          <div className="flex grid-cols-2 justify-between">
            <span>Points Earned</span>
            <span>{score}</span>
          </div>
          <div className="flex grid-cols-2 justify-between">
            <span>Orders Served</span>
            <span>{ordersServed}</span>
          </div>
        </div>

        {scoreSubmitted ? <Leaderboard /> : <p className="p2">Saving score…</p>}

        <button onClick={onPlayAgain} className="btn btn-primary">
          Play Again
        </button>
      </div>
    </PageContainer>
  );
};

export default GameOver;
