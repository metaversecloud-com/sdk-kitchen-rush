import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Feedback } from '../types/Feedback'

interface FeedbackProps {
  feedback: Feedback | null
}

const FeedbackToast = ({ feedback }: FeedbackProps) => {
  useEffect(() => {
    if (feedback?.type === 'milestone') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.4 }
      })
    }
  }, [feedback])

  if (!feedback) return null

  const colors = {
    success: "#4caf50",
    error: "#f44336",
    timeout: "#ff9800",
    milestone: "#9c27b0"
  }

  return (
    <div style={{
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: colors[feedback.type],
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "1.2rem",
      zIndex: 1000,
      animation: "fadeInOut 2s ease forwards"
    }}>
      {feedback.message}
    </div>
  )
}

export default FeedbackToast