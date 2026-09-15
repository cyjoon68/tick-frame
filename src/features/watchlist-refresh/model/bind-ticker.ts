import { applyPatchToRow } from "@/entities/ticker";
import type { TickPatch, TickerRowState } from "@/entities/ticker";
import { bindTicker as bindTickerHttp } from "@/shared/api";
import type { FetchImpl } from "@/shared/api";

type BindOptions = {
  onPatch: (row: TickerRowState) => void;
  onError: (error: Error) => void;
  tickSize: number;
  fetchImpl?: FetchImpl;
};

export const bindTicker = (code: string, options: BindOptions) => {
  return bindTickerHttp<TickerRowState, TickPatch>(code, {
    ...options,
    applyPatch: applyPatchToRow,
  });
};
