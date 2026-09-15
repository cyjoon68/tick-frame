import type { Instrument, TickPatch } from "../model/ticker";

export type TickFeed = {
  fetchInstruments: () => Promise<{ items: Instrument[] }>;
  fetchWatchlist: () => Promise<{ codes: string[] }>;
  fetchTicks: (code: string) => Promise<TickPatch>;
};

export type FetchImpl = (input: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;
