import {
  ABORT_ERROR_NAME,
  TICKS_CODES_PARAM,
  TICKS_ERROR_PREFIX,
  TICKS_PATH,
} from "@/shared/config";
import type { FetchImpl } from "./http-tick-feed";

export type ApplyPatch<TRow, TPatch> = (
  row: TRow,
  patch: TPatch,
  tickSize: number,
) => TRow;

export type BindTickerOptions<TRow extends { code: string }, TPatch> = {
  onPatch: (row: TRow) => void;
  onError: (error: Error) => void;
  tickSize: number;
  fetchImpl?: FetchImpl;
  applyPatch: ApplyPatch<TRow, TPatch>;
};

export const bindTicker = <TRow extends { code: string }, TPatch>(
  code: string,
  options: BindTickerOptions<TRow, TPatch>,
) => {
  const {
    onPatch,
    onError,
    tickSize,
    fetchImpl = globalThis.fetch,
    applyPatch,
  } = options;
  let generation = 0;
  let row = { code } as TRow;
  let stopped = false;

  const pull = async () => {
    const gen = ++generation;
    try {
      const url = `${TICKS_PATH}?${TICKS_CODES_PARAM}=${encodeURIComponent(code)}`;
      const response = await fetchImpl(url);
      if (stopped || gen < generation) {
        return;
      }
      if (!response.ok) {
        throw new Error(`${TICKS_ERROR_PREFIX} ${response.status}`);
      }
      const body = (await response.json()) as { items: Array<TPatch & { code: string }> };
      if (stopped || gen < generation) {
        return;
      }
      const patch =
        body.items.find((item) => item.code === code) ?? body.items[0];
      row = applyPatch(row, patch, tickSize);
      onPatch(row);
    } catch (error) {
      if (stopped || (error as Error).name === ABORT_ERROR_NAME) {
        return;
      }
      onError(error as Error);
    }
  };

  const stop = () => {
    stopped = true;
  };

  return {
    pull,
    stop,
    getRow: () => row,
  };
};
