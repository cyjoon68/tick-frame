import type { Instrument, TickerRowState } from "../model/ticker";

export type TickerBinding = {
  pull: () => Promise<void>;
  stop: () => void;
};

export type BindTickerFn = (
  code: string,
  options: {
    onPatch: (row: TickerRowState) => void;
    onError: (error: Error) => void;
    tickSize: number;
  },
) => TickerBinding;

export type LoadCatalogFn = () => Promise<Instrument[]>;
