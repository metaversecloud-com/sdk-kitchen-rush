import { useNavigate } from "react-router-dom";

const useGameManager = (orderManager: any) => {
  const navigate = useNavigate();

  const {
    clearTray,
    resetStreak,
    resetAngryCustomer,
    timerId,
    setSourceQueue,
  } = orderManager;

  const handleCloseShop = () => {
    clearTray();
    resetStreak();
    clearTimeout(timerId);
    resetAngryCustomer();
    setSourceQueue([]);

    navigate("/");
  };

  return {
    handleCloseShop,
  };
};

export default useGameManager;