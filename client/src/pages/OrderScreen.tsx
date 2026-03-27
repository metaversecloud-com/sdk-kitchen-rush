import { useNavigate } from "react-router-dom";

export default function OrderScreen() {
  const navigate = useNavigate();

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

      {/* Orders + Preview */}
      <div className="flex gap-4">

        {/* Order Queue */}
        <div className="flex flex-col gap-2">
          <div className="w-24 h-32 bg-gray-300 rounded flex items-center justify-center">
            Order
          </div>
          <div className="w-24 h-32 bg-gray-300 rounded"></div>
          <div className="w-24 h-32 bg-gray-300 rounded"></div>
        </div>

        {/* Tray / Preview */}
        <div className="w-40 h-32 bg-gray-200 rounded flex items-center justify-center">
          Your Drink
        </div>
      </div>

      {/* Serve Button */}
      <button className="bg-blue-300 px-6 py-2 rounded">
        Serve
      </button>

      {/* Ingredients */}
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* Size */}
        <div>
          <p className="font-semibold">Size</p>
          <div className="flex gap-2">
            <div className="w-16 h-10 bg-gray-200 rounded"></div>
            <div className="w-16 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Temp */}
        <div>
          <p className="font-semibold">Temp</p>
          <div className="flex gap-2">
            <div className="w-16 h-10 bg-gray-200 rounded"></div>
            <div className="w-16 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Flavor */}
        <div>
          <p className="font-semibold">Flavor</p>
          <div className="flex gap-2">
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Toppings */}
        <div>
          <p className="font-semibold">Topping</p>
          <div className="flex gap-2">
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
            <div className="w-12 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Close Shop */}
      <button className="bg-gray-300 px-4 py-2 rounded">
        Close Shop
      </button>
    </div>
  );
}