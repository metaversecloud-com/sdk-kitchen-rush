import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { levelConfig } from "../config/levelConfig";
import { generateOrder } from "../config/orderConfig";

type Order = {
  size: string | null;
  temp: string | null;
  milk: string | null;
  flavor: string | null;
  topping: string[];
};

function freshSelection(): Order {
  return { size: null, temp: null, milk: null, flavor: null, topping: [] };
}

export default function OrderScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const level = state?.level ?? 1;
  const config = levelConfig[level];
  const ing = config.ingredients;

  const [orders, setOrders] = useState<ReturnType<typeof generateOrder>[]>(() =>
    [0, 1, 2, 3].map(() => generateOrder(level))
  );
  const [selected, setSelected] = useState<Order>(freshSelection());
  const [locked, setLocked] = useState<Partial<Record<keyof Order, boolean>>>({});
  const [score, setScore] = useState(0);
  const [sadFaces, setSadFaces] = useState(0);
  const [ordersServed, setOrdersServed] = useState(0);

  const targetOrder = orders[0];

  const selectSingle = (key: "size" | "temp" | "milk" | "flavor", value: string) => {
    if (locked[key]) return;
    setSelected((prev) => ({ ...prev, [key]: value }));
    setLocked((prev) => ({ ...prev, [key]: true }));
  };

  const toggleTopping = (value: string) => {
    if (locked.topping) return;
    setSelected((prev) => {
      if (prev.topping.includes(value)) return prev;
      return { ...prev, topping: [...prev.topping, value] };
    });
  };

  const handleServe = () => {
    let correct = true;
    if (selected.size !== targetOrder.size) correct = false;
    if (selected.temp !== targetOrder.temp) correct = false;
    if (selected.milk !== targetOrder.milk) correct = false;
    if (targetOrder.flavor && selected.flavor !== targetOrder.flavor) correct = false;
    if (targetOrder.topping) {
      const sel = selected.topping;
      const hit = targetOrder.topping === sel[0] && sel.length === 1;
      if (!hit) correct = false;
    }

    const newSadFaces = correct ? sadFaces : sadFaces + 1;
    const newScore = correct ? score + 100 : score;
    const newOrdersServed = ordersServed + 1;

    if (newSadFaces >= 5) {
      navigate("/gameover", {
        state: { score: newScore, ordersServed: newOrdersServed },
      });
      return;
    }

    setScore(newScore);
    setSadFaces(newSadFaces);
    setOrdersServed(newOrdersServed);
    setOrders((prev) => [...prev.slice(1), generateOrder(level)]);
    setSelected(freshSelection());
    setLocked({});
  };

  const isServeReady =
    selected.size !== null &&
    selected.temp !== null &&
    selected.milk !== null &&
    (ing.flavor.length === 0 || selected.flavor !== null);

  const activeClass = "bg-blue-400 text-white";
  const inactiveClass = "bg-gray-200 text-black";
  const lockedActiveClass = "bg-blue-300 text-white opacity-70 cursor-not-allowed";
  const lockedInactiveClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

  const btnClass = (key: "size" | "temp" | "milk" | "flavor", val: string) => {
    const isSelected = selected[key] === val;
    if (locked[key]) return isSelected ? lockedActiveClass : lockedInactiveClass;
    return isSelected ? activeClass : inactiveClass;
  };

  const toppingClass = (val: string) => {
    const isSelected = selected.topping.includes(val);
    if (locked.topping) return isSelected ? lockedActiveClass : lockedInactiveClass;
    return isSelected ? activeClass : inactiveClass;
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4">

      {/* Top Bar */}
      <div className="flex justify-between w-full max-w-md">
        <div className="bg-gray-200 px-3 py-1 rounded">Score: {score}</div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 px-3 py-1 rounded">⏱ 00:18</div>
          <div className="bg-gray-200 px-3 py-1 rounded">{sadFaces}/5 😠</div>
          <button
            className="bg-gray-300 px-3 py-1 rounded text-sm"
            onClick={() => navigate("/")}
          >
            Close Shop
          </button>
        </div>
      </div>

      {/* Order Queue + Drink Preview */}
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        <div className="flex items-end gap-2 w-full">
          {orders.map((order, i) => (
            <div
              key={i}
              className={`rounded flex flex-col items-center justify-center text-xs text-center p-1 shrink-0 transition-all duration-300
                ${i === 0 ? "w-28 h-36 bg-gray-300 font-semibold" : "w-20 h-28 bg-gray-200 text-gray-500"}`}
            >
              <div>{order.size}</div>
              <div>{order.temp}</div>
              <div>{order.milk}</div>
              {order.flavor && <div>{order.flavor}</div>}
              {order.topping && <div>{order.topping}</div>}
            </div>
          ))}
        </div>
        <div className="w-full h-44 bg-gray-200 rounded flex items-center justify-center text-sm">
          Your Drink
        </div>
      </div>

      {/* Ingredients */}
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Size */}
        <div>
          <p className="font-semibold">Size</p>
          <div className="flex gap-2">
            {ing.size.map((s) => (
              <button key={s} onClick={() => selectSingle("size", s)} className={`px-3 h-10 rounded capitalize ${btnClass("size", s)}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Temp */}
        <div>
          <p className="font-semibold">Temp</p>
          <div className="flex gap-2">
            {ing.temp.map((t) => (
              <button key={t} onClick={() => selectSingle("temp", t)} className={`px-3 h-10 rounded capitalize ${btnClass("temp", t)}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Milk */}
        <div>
          <p className="font-semibold">Milk</p>
          <div className="flex gap-2 flex-wrap">
            {ing.milk.map((m) => (
              <button key={m} onClick={() => selectSingle("milk", m)} className={`px-3 h-10 rounded capitalize ${btnClass("milk", m)}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Flavor — only level 2+ */}
        {ing.flavor.length > 0 && (
          <div>
            <p className="font-semibold">Flavor Shot</p>
            <div className="flex gap-2 flex-wrap">
              {ing.flavor.map((f) => (
                <button key={f} onClick={() => selectSingle("flavor", f)} className={`px-3 h-10 rounded capitalize ${btnClass("flavor", f)}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toppings — only level 3+ */}
        {ing.topping.length > 0 && (
          <div>
            <p className="font-semibold">Toppings</p>
            <div className="flex gap-2 flex-wrap">
              {ing.topping.map((t) => (
                <button key={t} onClick={() => toggleTopping(t)} className={`px-3 h-10 rounded capitalize ${toppingClass(t)}`}>
                  {t.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Serve Button */}
      <button
        onClick={handleServe}
        disabled={!isServeReady}
        className={`w-full max-w-md py-3 rounded transition-all ${
          isServeReady ? "bg-blue-400 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Serve
      </button>

    </div>
  );
}