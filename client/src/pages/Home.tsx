import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import { PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";
import { ErrorType } from "@/context/types";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { droppedAsset, hasInteractiveParams } = useContext(GlobalStateContext);
  const navigate = useNavigate();

  const imgSrc = droppedAsset?.topLayerURL || droppedAsset?.bottomLayerURL;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TEMP: skip backend while building UI
    setIsLoading(false);
  }, []);

  const handleStart = () => {
    navigate("/level");
  };

  return (
    <PageContainer isLoading={isLoading} headerText="Kitchen Rush">
      <div className="flex flex-col items-center justify-center w-full text-center gap-6 mt-6">
        
        {/* Game Image */}
        {imgSrc ? (
          <img
            className="w-60 h-40 object-cover rounded-xl"
            alt="Kitchen Rush"
            src={imgSrc}
          />
        ) : (
          <div className="w-60 h-40 bg-gray-300 rounded-xl flex items-center justify-center">
            Game Image
          </div>
        )}

        {/* Description */}
        <div className="max-w-md text-left space-y-3">
          <p className="mb-3 font-semibold">
              Welcome to Kitchen Rush! 🍽️
            </p>
            
            <p className="mb-4">
              Make coffee for your customers before time runs out!
            </p>

            <p className="font-semibold">How to play:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>👀 Look at the order</li>
              <li>🥤 Pick the right size, temperature, and milk</li>
              <li>✅ Press <strong>Serve</strong> when you're ready</li>
            </ul>

            <p className="font-semibold">Be careful!</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>❌ Wrong order or too slow = 😠 sad face</li>
              <li>😠 5 sad faces = Game Over</li>
            </ul>

            <p className="mb-2">
              🔥 Get streaks for bonus points!
            </p>
            
            <p className="font-bold text-center text-left">
              Ready to play? Let’s go! 🎉
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="bg-blue-300 px-6 py-3 rounded-xl text-lg"
        >
          Start Game
        </button>
      </div>
    </PageContainer>
  );
};

export default Home;