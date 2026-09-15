import {
  HTTP_OK,
  INSTRUMENTS_PATH,
  TICKS_CODES_PARAM,
  TICKS_ERROR_PREFIX,
  TICKS_PATH,
  WATCHLIST_PATH,
} from "@/shared/config";

type JsonResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export type FetchImpl = (input: string) => Promise<JsonResponse>;

export const createHttpTickFeed = (fetchImpl: FetchImpl = globalThis.fetch) => {
  const readJson = async (path: string) => {
    const response = await fetchImpl(path);
    if (!response.ok) {
      throw new Error(`${path} ${response.status}`);
    }
    return response.json();
  };

  const fetchTicks = async (code: string) => {
    const url = `${TICKS_PATH}?${TICKS_CODES_PARAM}=${encodeURIComponent(code)}`;
    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(`${TICKS_ERROR_PREFIX} ${response.status}`);
    }
    const body = (await response.json()) as {
      items: Array<{ code: string; price?: number | null; changePct?: number | null; volume?: number | null }>;
    };
    return body.items.find((item) => item.code === code) ?? body.items[0];
  };

  return {
    fetchInstruments: () =>
      readJson(INSTRUMENTS_PATH) as Promise<{
        items: Array<{ code: string; name: string; tickSize: number }>;
      }>,
    fetchWatchlist: () =>
      readJson(WATCHLIST_PATH) as Promise<{ codes: string[] }>,
    fetchTicks,
    okStatus: HTTP_OK,
  };
};
