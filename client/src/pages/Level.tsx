import { useNavigate } from "react-router-dom";
import { levelConfig } from "../config/levelConfig";

export default function Level() {
  const level = 1; // temp hardcode until Selena's logic is done
  const navigate = useNavigate();
  const config = levelConfig[level];

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-6">
      <h1 className="text-2xl font-bold">{config.title}</h1>
      <p className="text-gray-600 max-w-sm">{config.description}</p>
      <button
        onClick={() => navigate("/order", { state: { level: 1 } })}
        className="bg-blue-300 px-6 py-3 rounded-xl"
      >
        Continue
      </button>
    </div>
  );
}