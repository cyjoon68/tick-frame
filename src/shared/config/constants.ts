export const COLUMN_ID_CODE = "code";
export const COLUMN_ID_NAME = "name";
export const COLUMN_ID_PRICE = "price";
export const COLUMN_ID_CHANGE = "changePct";

export const COLUMN_LABELS = {
  [COLUMN_ID_CODE]: "코드",
  [COLUMN_ID_NAME]: "종목명",
  [COLUMN_ID_PRICE]: "현재가",
  [COLUMN_ID_CHANGE]: "등락률",
} as const;

export const OVERFLOW_ELLIPSIS = "ellipsis";
export const OVERFLOW_CLIP = "clip";
export const CSS_OVERFLOW_HIDDEN = "hidden";
export const CSS_WHITE_SPACE_NOWRAP = "nowrap";
export const FONT_VARIANT_TABULAR_NUMS = "tabular-nums";

export const COLOR_UP = "up";
export const COLOR_DOWN = "down";
export const COLOR_EVEN = "even";

export const ROW_STATUS_SKELETON = "skeleton";
export const ROW_STATUS_READY = "ready";

export const SCREEN_IDLE = "idle";
export const SCREEN_REFRESHING = "refreshing";
export const SCREEN_ERROR = "error";

export const POLL_GAP_MS = 250;

export const APP_TITLE = "TickFrame";
export const BUTTON_ADD = "추가";
export const BUTTON_REFRESH = "새로고침";
export const BUTTON_STOP = "중지";

export const INSTRUMENTS_PATH = "/instruments";
export const WATCHLIST_PATH = "/watchlist";
export const TICKS_PATH = "/ticks";
export const TICKS_CODES_PARAM = "codes";
export const MOCK_ORIGIN = "http://tickframe.local";

export const HTTP_NOT_FOUND = 404;
export const HTTP_OK = 200;
export const ERROR_NOT_FOUND = "not found";
export const ABORT_ERROR_NAME = "AbortError";
export const TICKS_ERROR_PREFIX = "ticks";

export const MOCK_DELAY_MIN_MS = 300;
export const MOCK_DELAY_MAX_MS = 2000;
export const MOCK_SEED_DEFAULT = 1;
export const MOCK_PRICE_ONLY_MAX = 0.4;
export const MOCK_CHANGE_ONLY_MAX = 0.6;
export const MOCK_DEFAULT_TICK_SIZE = 100;
export const MOCK_DEFAULT_BASE_PRICE = 10000;
export const MOCK_PRICE_STEP_SPAN = 21;
export const MOCK_PRICE_STEP_OFFSET = 10;
export const MOCK_CHANGE_SPAN = 600;
export const MOCK_CHANGE_OFFSET = 300;
export const MOCK_CHANGE_SCALE = 100;
export const MOCK_VOLUME_SPAN = 10000;

export const RNG_MODULUS = 2147483647;
export const RNG_MULTIPLIER = 16807;
export const RNG_OFFSET = 1;

export const NUMBER_GROUP_PATTERN = /\B(?=(\d{3})+(?!\d))/g;
export const THOUSANDS_SEPARATOR = ",";
export const CHANGE_PCT_DIGITS = 2;
export const CHANGE_PLUS_SIGN = "+";

export const WATCHLIST_SIZE = 10;
export const LONG_NAME_LENGTH = 40;
export const TICK_SIZE_100 = 100;

export const BASE_PRICES: Record<string, number> = {
  "005930": 74300,
  "005935": 62100,
  "035720": 51200,
  "035420": 187640,
  "005380": 241000,
  "000660": 178000,
  "055550": 48950,
  "252670": 2215,
  "122630": 8432,
  "069500": 38500,
};
