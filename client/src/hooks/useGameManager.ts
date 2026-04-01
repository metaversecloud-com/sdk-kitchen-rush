import useOrderManager from "../hooks/useOrderManager";
import {useState} from "react"
import { useNavigate } from "react-router-dom"


const useGameManager = () => {
    const [score, setScore] = useState<number>(0);
    const navigate = useNavigate()

    // Call the order manager hook
    const {
        clearTray,
        resetStreak,
        resetAngryCustomer,
        timerId,
        setSourceQueue,
        
        // handleViewOrder,
    } = useOrderManager(
        () => console.log("game over"),
        () => console.log("level complete")
    );  

    // close shop
    const handleCloseShop = () => {
        clearTray()
        resetStreak()
        clearTimeout(timerId)
        resetScore()
        resetAngryCustomer()
        resetQueues()
        navigate('/')

    }

    const resetScore = (): void => {
        setScore(0);
    }

    const resetQueues = (): void => {
        setSourceQueue([])
    }
    
    return {
        handleCloseShop,
        resetScore,
        resetQueues
    }
}

export default useGameManager