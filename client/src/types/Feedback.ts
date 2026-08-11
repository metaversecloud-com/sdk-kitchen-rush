export type FeedbackType = "success" | "error" | "timeout" | "milestone"

export type Feedback = {
  message: string
  type: FeedbackType
} | null