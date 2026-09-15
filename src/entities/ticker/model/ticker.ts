import {
  COLOR_DOWN,
  COLOR_EVEN,
  COLOR_UP,
  ROW_STATUS_READY,
  ROW_STATUS_SKELETON,
} from "@/shared/config";

export type TickColor =
  | typeof COLOR_UP
  | typeof COLOR_DOWN
  | typeof COLOR_EVEN;

export type RowStatus =
  | typeof ROW_STATUS_SKELETON
  | typeof ROW_STATUS_READY;

export type Instrument = {
  code: string;
  name: string;
  tickSize: number;
};

export type TickPatch = {
  code: string;
  price?: number | null;
  changePct?: number | null;
  volume?: number | null;
};

export type TickerRowState = Instrument & {
  price?: number | null;
  changePct?: number | null;
  volume?: number | null;
  displayPrice?: number | null;
  color?: TickColor;
  status: RowStatus;
};

export type ColumnContract = {
  id: string;
  widthPx: number;
  align: string;
  overflow: string;
};

export type ColumnContractFile = {
  rowHeightPx: number;
  columns: ColumnContract[];
};
