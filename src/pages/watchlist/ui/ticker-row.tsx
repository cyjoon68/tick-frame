import type { CSSProperties } from "react";
import {
  colorClassFor,
  formatChangePct,
  formatPrice,
  fontVariantFor,
  isChangeColumn,
  isCodeColumn,
  isNameColumn,
  isPriceColumn,
  textOverflowFor,
} from "@/entities/ticker";
import type { ColumnContract, TickerRowState } from "@/entities/ticker";
import {
  CSS_OVERFLOW_HIDDEN,
  CSS_WHITE_SPACE_NOWRAP,
  ROW_STATUS_SKELETON,
} from "@/shared/config";

type TickerRowProps = {
  ticker: TickerRowState;
  columns: ColumnContract[];
  rowHeightPx: number;
};

const renderCell = (columnId: string, ticker: TickerRowState) => {
  if (isCodeColumn(columnId)) {
    return ticker.code;
  }
  if (isNameColumn(columnId)) {
    return ticker.name;
  }
  if (ticker.status === ROW_STATUS_SKELETON) {
    return <span className="skeleton-bar" />;
  }
  if (isPriceColumn(columnId)) {
    return ticker.displayPrice == null ? "" : formatPrice(ticker.displayPrice);
  }
  if (isChangeColumn(columnId)) {
    return ticker.changePct == null ? "" : formatChangePct(ticker.changePct);
  }
  return "";
};

const TickerRow = ({ ticker, columns, rowHeightPx }: TickerRowProps) => {
  return (
    <tr
      className="ticker-row"
      data-row="true"
      data-code={ticker.code}
      style={{ height: `${rowHeightPx}px` }}
    >
      {columns.map((column) => {
        const colorClass = colorClassFor(column.id, ticker);
        return (
          <td
            key={column.id}
            data-column={column.id}
            data-width={column.widthPx}
            data-height={rowHeightPx}
            className={`ticker-cell ticker-cell-${column.id} ${colorClass}`.trim()}
            style={{
              width: `${column.widthPx}px`,
              minWidth: `${column.widthPx}px`,
              maxWidth: `${column.widthPx}px`,
              height: `${rowHeightPx}px`,
              textAlign: column.align as CSSProperties["textAlign"],
              overflow: CSS_OVERFLOW_HIDDEN,
              textOverflow: textOverflowFor(column.overflow),
              whiteSpace: CSS_WHITE_SPACE_NOWRAP,
              fontVariantNumeric: fontVariantFor(column.id),
            }}
          >
            {renderCell(column.id, ticker)}
          </td>
        );
      })}
    </tr>
  );
};

export default TickerRow;
