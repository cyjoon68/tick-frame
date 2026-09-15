import { selectWatchlistInstruments } from "./column-policy";
import type { TickFeed } from "../port/tick-feed";

export const loadWatchlistCatalog = async (feed: TickFeed) => {
  const [instruments, watchlist] = await Promise.all([
    feed.fetchInstruments(),
    feed.fetchWatchlist(),
  ]);
  return selectWatchlistInstruments(instruments.items, watchlist.codes);
};
