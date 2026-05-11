import { useEffect } from "react";
import confetti from "canvas-confetti";

import { Feedback } from "@/types/Feedback";

interface FeedbackProps {
  feedback: Feedback;
}

export const FeedbackToast = ({ feedback }: FeedbackProps) => {
  useEffect(() => {
    if (feedback?.type === "milestone") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 } });
    }
  }, [feedback]);

  if (!feedback) return null;

  return <div className={`toast toast--${feedback.type}`}>{feedback.message}</div>;
};

export default FeedbackToast;
