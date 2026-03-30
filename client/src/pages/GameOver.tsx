import { useNavigate, useLocation } from "react-router-dom";

export default function GameOver() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const score = state?.score ?? 0;
  const ordersServed = state?.ordersServed ?? 0;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-6">
      <h1 className="text-4xl font-bold">Game Over! 😢</h1>
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
      <button
        onClick={() => navigate("/")}
        className="bg-blue-300 px-6 py-3 rounded-xl text-lg"
      >
        Play Again
      </button>
    </div>
  );
}