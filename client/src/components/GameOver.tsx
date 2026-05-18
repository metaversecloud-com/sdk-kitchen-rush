import { useContext, useEffect, useRef, useState } from "react";

import { Leaderboard } from "./Leaderboard";
import { PageContainer } from "./PageContainer";
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { SET_GAME_STATE } from "@/context/types";
import { GameOverPayload } from "@/hooks/useOrderManager";
import { backendAPI } from "@/utils";

type GrantedBadge = { name: string; icon: string };

type GameEndResult = {
  rank: number | null;
  grantedBadges: GrantedBadge[];
  visitorStats?: { gamesPlayed: number; lifetimeCorrectOrders: number };
};

interface GameOverProps {
  stats: GameOverPayload;
  onPlayAgain: () => void;
}

const formatRank = (rank: number) => {
  const lastTwo = rank % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${rank}th`;
  const lastOne = rank % 10;
  if (lastOne === 1) return `${rank}st`;
  if (lastOne === 2) return `${rank}nd`;
  if (lastOne === 3) return `${rank}rd`;
  return `${rank}th`;
};

export const GameOver = ({ stats, onPlayAgain }: GameOverProps) => {
  const dispatch = useContext(GlobalDispatchContext);
  const { visitorInventory, visitorStats } = useContext(GlobalStateContext);
  const [result, setResult] = useState<GameEndResult | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    backendAPI
      .post("/game-end", {
        correctOrders: stats.correctOrders,
        incorrectOrders: stats.incorrectOrders,
        angryCount: stats.angryCount,
        finalScore: stats.score,
      })
      .then(({ data }) => {
        const next: GameEndResult = {
          rank: data?.rank ?? null,
          grantedBadges: data?.grantedBadges || [],
          visitorStats: data?.visitorStats,
        };
        setResult(next);

        // Merge new badges + updated lifetime stats into context so the Badges
        // tab and the next run see the latest values without a refetch.
        if (dispatch) {
          const mergedBadges = { ...(visitorInventory?.badges || {}) };
          for (const granted of next.grantedBadges) {
            mergedBadges[granted.name] = { id: granted.name, name: granted.name, icon: granted.icon };
          }
          dispatch({
            type: SET_GAME_STATE,
            payload: {
              visitorInventory: { badges: mergedBadges },
              visitorStats: next.visitorStats ?? visitorStats,
            },
          });
        }
      })
      .catch((err) => {
        console.error("/game-end failed:", err);
        setResult({ rank: null, grantedBadges: [] });
      });
    // We intentionally fire once on mount; dispatch + context values are read
    // from refs/closures inside the .then().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tallying = result === null;

  return (
    <PageContainer isLoading={false} headerText="Game Over">
      <div className="grid gap-2">
        <div className="card info-card mb-4">
          <div className="flex grid-cols-2 justify-between">
            <span>Points Earned</span>
            <span>{stats.score}</span>
          </div>
          <div className="flex grid-cols-2 justify-between">
            <span>Orders Served</span>
            <span>{stats.ordersServed}</span>
          </div>
          <div className="flex grid-cols-2 justify-between">
            <span>Leaderboard</span>
            <span>{tallying ? "…" : result?.rank !== null ? formatRank(result!.rank!) : "—"}</span>
          </div>
        </div>

        {tallying ? (
          <div className="card mb-4 text-center">
            <p className="p2">Tallying results…</p>
          </div>
        ) : (
          result!.grantedBadges.length > 0 && (
            <div className="card mb-4">
              <h4>New Badges</h4>
              <div className="grid grid-cols-3 gap-2">
                {result!.grantedBadges.map((badge) => (
                  <div key={badge.name} className="text-center">
                    {badge.icon && (
                      <img src={badge.icon} alt={badge.name} style={{ margin: "0 auto", maxWidth: "100%" }} />
                    )}
                    <p className="p3 mt-1">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        <Leaderboard />

        <button onClick={onPlayAgain} className="btn btn-primary">
          Play Again
        </button>
      </div>
    </PageContainer>
  );
};

export default GameOver;
