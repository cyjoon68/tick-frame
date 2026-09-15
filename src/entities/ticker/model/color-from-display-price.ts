import { COLOR_DOWN, COLOR_EVEN, COLOR_UP } from "@/shared/config";
import type { TickColor } from "./ticker";

export const colorFromDisplayPrice = (
  prevDisplay: number | null | undefined,
  nextDisplay: number | null | undefined,
  changePct: number | null | undefined,
): TickColor | null => {
  if (prevDisplay != null && nextDisplay != null) {
    if (nextDisplay > prevDisplay) {
      return COLOR_UP;
    }
    if (nextDisplay < prevDisplay) {
      return COLOR_DOWN;
    }
  }
  if (changePct != null && changePct > 0) {
    return COLOR_UP;
  }
  if (changePct != null && changePct < 0) {
    return COLOR_DOWN;
  }
  if (changePct === 0) {
    return COLOR_EVEN;
  }
  return null;
};
