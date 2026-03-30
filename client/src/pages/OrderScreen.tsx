import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { levelConfig } from "../config/levelConfig";
import { generateOrder } from "../config/orderConfig";

export default function OrderScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const level = state?.level ?? 1;
  const config = levelConfig[level];
  const ing = config.ingredients;

  const [targetOrder] = useState(() => generateOrder(level)); // ← inside component

  return (
    <div className="flex flex-col items-center p-4 gap-4">

      {/* Top Bar */}
      <div className="flex justify-between w-full max-w-md">
        <div className="bg-gray-200 px-3 py-1 rounded">Score</div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 px-3 py-1 rounded">⏱ 00:18</div>
          <div className="bg-gray-200 px-3 py-1 rounded">2/5 😠</div>
        </div>
      </div>

      {/* Orders (horizontal) + Drink Preview */}
      <div className="flex flex-col items-center gap-3 w-full max-w-md">

        {/* Order Queue — left = current (larger), right = upcoming */}
        <div className="flex items-end gap-2 w-full">
          {/* Current order — larger */}
          <div className="w-28 h-36 bg-gray-300 rounded flex items-center justify-center text-sm font-semibold shrink-0">
            Current
          </div>
          {/* Upcoming orders — smaller */}
          <div className="w-20 h-28 bg-gray-200 rounded shrink-0"></div>
          <div className="w-20 h-28 bg-gray-200 rounded shrink-0"></div>
          <div className="w-20 h-28 bg-gray-200 rounded shrink-0"></div>
        </div>

        {/* Drink Preview */}
        <div className="w-full h-44 bg-gray-200 rounded flex items-center justify-center text-sm">
          Your Drink
        </div>

      </div>

      {/* Serve Button */}
      <button className="bg-blue-300 px-6 py-2 rounded">Serve</button>

      {/* Ingredients */}
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Size — always shown */}
        <div>
          <p className="font-semibold">Size</p>
          <div className="flex gap-2">
            {ing.size.map((s) => (
              <button key={s} className="px-3 h-10 bg-gray-200 rounded capitalize">{s}</button>
            ))}
          </div>
        </div>

        {/* Temp — always shown */}
        <div>
          <p className="font-semibold">Temp</p>
          <div className="flex gap-2">
            {ing.temp.map((t) => (
              <button key={t} className="px-3 h-10 bg-gray-200 rounded capitalize">{t}</button>
            ))}
          </div>
        </div>

        {/* Milk — always shown */}
        <div>
          <p className="font-semibold">Milk</p>
          <div className="flex gap-2">
            {ing.milk.map((m) => (
              <button key={m} className="px-3 h-10 bg-gray-200 rounded capitalize">{m}</button>
            ))}
          </div>
        </div>

        {/* Flavor — only level 2+ */}
        {ing.flavor.length > 0 && (
          <div>
            <p className="font-semibold">Flavor Shot</p>
            <div className="flex gap-2">
              {ing.flavor.map((f) => (
                <button key={f} className="px-3 h-10 bg-gray-200 rounded capitalize">{f}</button>
              ))}
            </div>
          </div>
        )}

        {/* Toppings — only level 3+ */}
        {ing.topping.length > 0 && (
          <div>
            <p className="font-semibold">Toppings</p>
            <div className="flex gap-2">
              {ing.topping.map((t) => (
                <button key={t} className="px-3 h-10 bg-gray-200 rounded capitalize">{t}</button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Close Shop */}
      <button
        className="bg-gray-300 px-4 py-2 rounded"
        onClick={() => navigate("/")}
      >
        Close Shop
      </button>
    </div>
  );
}