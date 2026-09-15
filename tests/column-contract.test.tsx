import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { applyPatchToRow } from "@/entities/ticker";
import { TickerRow } from "@/pages/watchlist";
import {
  COLUMN_ID_CHANGE,
  COLUMN_ID_NAME,
  COLUMN_ID_PRICE,
  CSS_OVERFLOW_HIDDEN,
  CSS_WHITE_SPACE_NOWRAP,
  FONT_VARIANT_TABULAR_NUMS,
  LONG_NAME_LENGTH,
  OVERFLOW_ELLIPSIS,
  ROW_STATUS_SKELETON,
  TICK_SIZE_100,
  WATCHLIST_SIZE,
} from "@/shared/config";
import contract from "../contracts/column-contract.json";
import instruments from "../contracts/instruments.json";
import { installContractLayout } from "./layout";

installContractLayout();

const CODE_WIDTH = 92;
const NAME_WIDTH = 176;
const PRICE_X = CODE_WIDTH + NAME_WIDTH;
const ROW_HEIGHT = 36;

const renderBoard = (tickers: ReturnType<typeof primedTicker>[]) => {
  return render(
    <table>
      <tbody>
        {tickers.map((ticker) => (
          <TickerRow
            key={ticker.code}
            ticker={ticker}
            columns={contract.columns}
            rowHeightPx={contract.rowHeightPx}
          />
        ))}
      </tbody>
    </table>,
  );
};

const primedTicker = (
  instrument: (typeof instruments.items)[number],
  price: number,
  changePct: number,
) => {
  return applyPatchToRow(
    { ...instrument, status: ROW_STATUS_SKELETON },
    { code: instrument.code, price, changePct },
    instrument.tickSize,
  );
};

describe("column contract", () => {
  it("keeps price column x within 1px for 8-character and 40-character names", () => {
    const tickers = instruments.items.map((item, index) =>
      primedTicker(item, 70000 + index * 100, 1.2),
    );
    expect(tickers).toHaveLength(WATCHLIST_SIZE);
    expect(
      tickers.filter((row) => row.name.length === LONG_NAME_LENGTH),
    ).toHaveLength(3);

    renderBoard(tickers);

    const priceCells = [
      ...document.querySelectorAll(`[data-column="${COLUMN_ID_PRICE}"]`),
    ];
    expect(priceCells).toHaveLength(WATCHLIST_SIZE);
    const xs = priceCells.map((cell) => cell.getBoundingClientRect().x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    expect(maxX - minX).toBeLessThanOrEqual(1);
    for (const x of xs) {
      expect(Math.abs(x - PRICE_X)).toBeLessThanOrEqual(1);
    }

    const shortRow = tickers.find((row) => row.name === "삼성전자");
    const longRow = tickers.find((row) => row.name.length === LONG_NAME_LENGTH);
    const shortPrice = document.querySelector(
      `[data-code="${shortRow?.code}"] [data-column="${COLUMN_ID_PRICE}"]`,
    );
    const longPrice = document.querySelector(
      `[data-code="${longRow?.code}"] [data-column="${COLUMN_ID_PRICE}"]`,
    );
    expect(
      Math.abs(
        shortPrice!.getBoundingClientRect().x -
          longPrice!.getBoundingClientRect().x,
      ),
    ).toBeLessThanOrEqual(1);
  });

  it("keeps row height variance at 0", () => {
    const tickers = instruments.items.map((item, index) =>
      primedTicker(item, 71000 + index * 100, -0.4),
    );
    renderBoard(tickers);
    const rows = [...document.querySelectorAll("tr.ticker-row")];
    const heights = rows.map((row) => row.getBoundingClientRect().height);
    expect(new Set(heights).size).toBe(1);
    expect(heights[0]).toBe(ROW_HEIGHT);
  });

  it("clips long names with ellipsis and uses tabular lining on number columns", () => {
    const ticker = primedTicker(instruments.items[7], 4215, 0.05);
    renderBoard([ticker]);
    const nameCell = document.querySelector(
      `[data-column="${COLUMN_ID_NAME}"]`,
    );
    const priceCell = document.querySelector(
      `[data-column="${COLUMN_ID_PRICE}"]`,
    );
    const changeCell = document.querySelector(
      `[data-column="${COLUMN_ID_CHANGE}"]`,
    );
    expect(nameCell).toHaveStyle({
      overflow: CSS_OVERFLOW_HIDDEN,
      textOverflow: OVERFLOW_ELLIPSIS,
      whiteSpace: CSS_WHITE_SPACE_NOWRAP,
    });
    expect(priceCell).toHaveStyle({
      fontVariantNumeric: FONT_VARIANT_TABULAR_NUMS,
      textAlign: "right",
    });
    expect(changeCell).toHaveStyle({
      fontVariantNumeric: FONT_VARIANT_TABULAR_NUMS,
      textAlign: "right",
    });
  });

  it("renders tickSize 100 prices on 100 increments and never puts a raw float in the DOM", () => {
    const samsung = instruments.items.find((item) => item.code === "005930");
    const ticker = primedTicker(samsung!, 73450.3333, 1.2);
    renderBoard([ticker]);
    expect(screen.getByText("73,500")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("73450.3333");
    expect(ticker.displayPrice! % TICK_SIZE_100).toBe(0);
  });
});
