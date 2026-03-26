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
    navigate("/level"); // you'll build this next
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
        <p className="max-w-md">
          Welcome to Kitchen Rush! In this game, you must accurately serve orders to customers before time runs out. 
          There are four levels of difficulty. This is the Warmup round: First, select the corresponding cup size. 
          Next, choose a hot or cold drink base. Then, select the correct type of milk. If you fail to complete an order 
          on time or serve an incorrect order, you receive a frowny face. The game is over when you receive 5 frowny faces. 
          You have the ability to earn streak point multipliers for serving multiple correct orders in a row. You may also 
          end the game early if you wish with the “Close Shop” button.
        </p>

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