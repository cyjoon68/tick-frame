import { loadWatchlistCatalog } from "@/entities/ticker";
import { createHttpTickFeed } from "@/shared/api";

export const loadWatchlist = () => {
  return loadWatchlistCatalog(createHttpTickFeed());
};
