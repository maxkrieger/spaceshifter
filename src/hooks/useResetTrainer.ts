import { useCallback } from "react";
import useTrainer from "./trainer/useTrainer";

/**
 * Resets trainer state. Useful for changes to training data.
 */
export default function useResetTrainer() {
  const trainer = useTrainer();
  return useCallback(() => {
    if (trainer.type !== "uninitialized") {
      trainer.actions.reset();
    }
  }, [trainer]);
}
