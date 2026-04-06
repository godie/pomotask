import { useTimerStore } from "@/stores/timerStore";

export function useTimer() {
  return useTimerStore();
}
