import { COLOR_EVEN, ROW_STATUS_READY } from "@/shared/config";
import { colorFromDisplayPrice } from "./color-from-display-price";
import { mergePatch } from "./merge-patch";
import { roundToTick } from "./round-to-tick";
import type { TickPatch, TickerRowState } from "./ticker";

export const applyPatchToRow = (
  row: TickerRowState,
  patch: TickPatch,
  tickSize: number,
): TickerRowState => {
  const merged = mergePatch(
    row as unknown as Record<string, unknown>,
    patch as unknown as Record<string, unknown>,
  ) as TickerRowState;
  let displayPrice = row.displayPrice;
  if (Object.prototype.hasOwnProperty.call(patch, "price")) {
    displayPrice =
      patch.price == null ? null : roundToTick(patch.price, tickSize);
  } else if (merged.price != null && displayPrice == null) {
    displayPrice = roundToTick(merged.price, tickSize);
  }
  const color =
    colorFromDisplayPrice(row.displayPrice, displayPrice, merged.changePct) ??
    row.color ??
    COLOR_EVEN;
  return {
    ...merged,
    displayPrice,
    color,
    status: ROW_STATUS_READY,
  };
};
