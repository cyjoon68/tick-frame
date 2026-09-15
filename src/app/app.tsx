import { bindTicker, loadWatchlist } from "@/features/watchlist-refresh";
import WatchlistScreen from "@/pages/watchlist";

const App = () => {
  return (
    <WatchlistScreen loadCatalog={loadWatchlist} bindTicker={bindTicker} />
  );
};

export default App;
