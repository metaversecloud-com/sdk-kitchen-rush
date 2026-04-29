import { useEffect, useState, useRef, useContext  } from "react";
import { useLocation } from "react-router-dom";
import { backendAPI, setGameState } from "@/utils";
import Leaderboard from "../components/Leaderboard";
import { PageContainer } from "@/components";
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import {useAppNavigate} from '../hooks/useAppNavigate';


export default function GameOver() {
  const navigate = useAppNavigate();
  const { state } = useLocation();
  const score = state?.score ?? 0;
  const ordersServed = state?.ordersServed ?? 0;

  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const submittedRef = useRef(false);
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/game-state")
        .then((response) => setGameState(dispatch, response.data))
        .catch((error) => console.error("Failed to load game state:", error))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [hasInteractiveParams]);

  // Submit score on mount
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // console.log("backendAPI defaults:", backendAPI.defaults);
    backendAPI
      .post("/leaderboard/update", { score })
      .then(() => setScoreSubmitted(true))
      .catch((err) => {
        console.error("Failed to update leaderboard:", err);
        setScoreSubmitted(true); // still show leaderboard even if update fails
      });
  }, []);

  return (
   <PageContainer isLoading={isLoading} headerText="Game Over">
      <div className="flex flex-col items-center justify-center h-screen text-center gap-6">
        <h1 className="text-4xl font-bold">Game Over! 😢</h1>

        {/* Results */}
        <div className="flex flex-col gap-3 bg-gray-100 rounded-xl p-6 w-64">
          <div className="flex justify-between">
            <span className="font-semibold">Points Earned</span>
            <span>{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Orders Served</span>
            <span>{ordersServed}</span>
          </div>
        </div>

        {/* render leaderboard conditionally to prevent race conditions */}
        {scoreSubmitted ? <Leaderboard /> : <p className="p2">Saving score...</p>}

        <button
          onClick={() => navigate("/")}
          className="bg-blue-300 px-6 py-3 rounded-xl text-lg"
        >
          Play Again
        </button>
      </div>
    </PageContainer>
  );
}