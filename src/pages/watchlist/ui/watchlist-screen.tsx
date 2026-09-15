import type { BindTickerFn, LoadCatalogFn } from "@/entities/ticker";
import contract from "../../../../contracts/column-contract.json";
import { useWatchlistBoard } from "../model/use-watchlist-board";
import RefreshBar from "./refresh-bar";
import TickerTable from "./ticker-table";

type WatchlistScreenProps = {
  loadCatalog: LoadCatalogFn;
  bindTicker: BindTickerFn;
};

const WatchlistScreen = ({ loadCatalog, bindTicker }: WatchlistScreenProps) => {
  const { status, error, ordered, refresh, stop } = useWatchlistBoard({
    loadCatalog,
    bindTicker,
  });

  return (
    <div className="watchlist-screen">
      <RefreshBar
        status={status}
        error={error}
        onRefresh={refresh}
        onStop={stop}
      />
      <TickerTable
        tickers={ordered}
        columns={contract.columns}
        rowHeightPx={contract.rowHeightPx}
      />
    </div>
  );
};

export default WatchlistScreen;
