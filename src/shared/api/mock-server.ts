import instruments from "../../../contracts/instruments.json";
import watchlist from "../../../contracts/watchlist.json";
import {
  BASE_PRICES,
  ERROR_NOT_FOUND,
  HTTP_NOT_FOUND,
  HTTP_OK,
  INSTRUMENTS_PATH,
  MOCK_CHANGE_OFFSET,
  MOCK_CHANGE_ONLY_MAX,
  MOCK_CHANGE_SCALE,
  MOCK_CHANGE_SPAN,
  MOCK_DEFAULT_BASE_PRICE,
  MOCK_DEFAULT_TICK_SIZE,
  MOCK_DELAY_MAX_MS,
  MOCK_DELAY_MIN_MS,
  MOCK_ORIGIN,
  MOCK_PRICE_ONLY_MAX,
  MOCK_PRICE_STEP_OFFSET,
  MOCK_PRICE_STEP_SPAN,
  MOCK_SEED_DEFAULT,
  MOCK_VOLUME_SPAN,
  RNG_MODULUS,
  RNG_MULTIPLIER,
  RNG_OFFSET,
  TICKS_CODES_PARAM,
  TICKS_PATH,
  WATCHLIST_PATH,
} from "@/shared/config";

export const createRng = (seed: number) => {
  let state = seed % RNG_MODULUS;
  if (state <= 0) {
    state += RNG_MODULUS - RNG_OFFSET;
  }
  return () => {
    state = (state * RNG_MULTIPLIER) % RNG_MODULUS;
    return (state - RNG_OFFSET) / (RNG_MODULUS - RNG_OFFSET);
  };
};

export const buildTickPatch = (code: string, rng: () => number) => {
  const instrument = instruments.items.find((item) => item.code === code);
  const tickSize = instrument?.tickSize ?? MOCK_DEFAULT_TICK_SIZE;
  const base = BASE_PRICES[code] ?? MOCK_DEFAULT_BASE_PRICE;
  const steps = Math.floor(rng() * MOCK_PRICE_STEP_SPAN) - MOCK_PRICE_STEP_OFFSET;
  const price = base + steps * tickSize;
  const changePct =
    Math.round(rng() * MOCK_CHANGE_SPAN - MOCK_CHANGE_OFFSET) / MOCK_CHANGE_SCALE;
  const volume = Math.floor(rng() * MOCK_VOLUME_SPAN);
  const roll = rng();
  if (roll < MOCK_PRICE_ONLY_MAX) {
    return { code, price };
  }
  if (roll < MOCK_CHANGE_ONLY_MAX) {
    return { code, changePct };
  }
  return { code, price, changePct, volume };
};

type MockOptions = {
  delayMin?: number;
  delayMax?: number;
  seed?: number;
};

export const installMockServer = (options: MockOptions = {}) => {
  const {
    delayMin = MOCK_DELAY_MIN_MS,
    delayMax = MOCK_DELAY_MAX_MS,
    seed = MOCK_SEED_DEFAULT,
  } = options;
  const rng = createRng(seed);
  const originalFetch = globalThis.fetch;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        timers.delete(id);
        resolve();
      }, ms);
      timers.add(id);
    });

  const nextTick = (code: string) => buildTickPatch(code, rng);

  const jsonResponse = (body: unknown, status = HTTP_OK) => ({
    ok: status >= HTTP_OK && status < HTTP_NOT_FOUND,
    status,
    json: async () => body,
  });

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const delay = delayMin + rng() * (delayMax - delayMin);
    if (delay > 0) {
      await sleep(delay);
    }
    if (url.includes(INSTRUMENTS_PATH)) {
      return jsonResponse(instruments) as Response;
    }
    if (url.includes(WATCHLIST_PATH)) {
      return jsonResponse(watchlist) as Response;
    }
    if (url.includes(TICKS_PATH)) {
      const parsed = new URL(url, MOCK_ORIGIN);
      const codes = (parsed.searchParams.get(TICKS_CODES_PARAM) || "")
        .split(",")
        .filter(Boolean);
      return jsonResponse({ items: codes.map((code) => nextTick(code)) }) as Response;
    }
    return jsonResponse({ error: ERROR_NOT_FOUND }, HTTP_NOT_FOUND) as Response;
  }) as typeof fetch;

  const restore = () => {
    globalThis.fetch = originalFetch;
    for (const id of timers) {
      clearTimeout(id);
    }
    timers.clear();
  };
  restore.nextTick = nextTick;
  return restore;
};
