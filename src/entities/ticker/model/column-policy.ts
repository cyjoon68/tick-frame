import {
  COLUMN_ID_CHANGE,
  COLUMN_ID_CODE,
  COLUMN_ID_NAME,
  COLUMN_ID_PRICE,
  CSS_OVERFLOW_HIDDEN,
  FONT_VARIANT_TABULAR_NUMS,
  OVERFLOW_CLIP,
  OVERFLOW_ELLIPSIS,
  ROW_STATUS_SKELETON,
} from "@/shared/config";
import type { Instrument, TickerRowState } from "./ticker";

export const isNumberColumn = (columnId: string) => {
  return columnId === COLUMN_ID_PRICE || columnId === COLUMN_ID_CHANGE;
};

export const textOverflowFor = (overflow: string) => {
  return overflow === OVERFLOW_ELLIPSIS ? OVERFLOW_ELLIPSIS : OVERFLOW_CLIP;
};

export const fontVariantFor = (columnId: string) => {
  return isNumberColumn(columnId) ? FONT_VARIANT_TABULAR_NUMS : undefined;
};

export const colorClassFor = (columnId: string, ticker: TickerRowState) => {
  if (!isNumberColumn(columnId)) {
    return "";
  }
  if (!ticker.color || ticker.status === ROW_STATUS_SKELETON) {
    return "";
  }
  return `is-${ticker.color}`;
};

export const selectWatchlistInstruments = (
  items: Instrument[],
  codes: string[],
) => {
  return codes
    .map((code) => items.find((item) => item.code === code))
    .filter((item): item is Instrument => Boolean(item));
};

export const createSkeletonRow = (instrument: Instrument): TickerRowState => {
  return {
    ...instrument,
    status: ROW_STATUS_SKELETON,
  };
};

export const isCodeColumn = (columnId: string) => columnId === COLUMN_ID_CODE;
export const isNameColumn = (columnId: string) => columnId === COLUMN_ID_NAME;
export const isPriceColumn = (columnId: string) => columnId === COLUMN_ID_PRICE;
export const isChangeColumn = (columnId: string) =>
  columnId === COLUMN_ID_CHANGE;

export { CSS_OVERFLOW_HIDDEN };
