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
    if (hasInteractiveParams) {
      backendAPI
        .get("/game-state")
        .then((response) => {
          setGameState(dispatch, response.data);
        })
        .catch((error) => setErrorMessage(dispatch, error as ErrorType))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

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
          Serve customers quickly and accurately before they get angry. Build orders,
          maintain streaks, and survive the rush!
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