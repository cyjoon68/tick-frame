import type { CSSProperties } from "react";
import type { ColumnContract, TickerRowState } from "@/entities/ticker";
import { COLUMN_LABELS } from "@/shared/config";
import TickerRow from "./ticker-row";

type TickerTableProps = {
  tickers: TickerRowState[];
  columns: ColumnContract[];
  rowHeightPx: number;
};

const TickerTable = ({ tickers, columns, rowHeightPx }: TickerTableProps) => {
  return (
    <div className="watchlist-board">
      <table className="watchlist-table">
        <colgroup>
          {columns.map((column) => (
            <col key={column.id} style={{ width: `${column.widthPx}px` }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ height: `${rowHeightPx}px` }}>
            {columns.map((column) => (
              <th
                key={column.id}
                data-column={column.id}
                style={{
                  width: `${column.widthPx}px`,
                  minWidth: `${column.widthPx}px`,
                  maxWidth: `${column.widthPx}px`,
                  height: `${rowHeightPx}px`,
                  textAlign: column.align as CSSProperties["textAlign"],
                }}
              >
                {COLUMN_LABELS[column.id as keyof typeof COLUMN_LABELS]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker) => (
            <TickerRow
              key={ticker.code}
              ticker={ticker}
              columns={columns}
              rowHeightPx={rowHeightPx}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TickerTable;
