import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { applyPatchToRow, mergePatch } from "@/entities/ticker";
import type { TickerRowState } from "@/entities/ticker";
import { bindTicker } from "@/features/watchlist-refresh";
import { RefreshBar, TickerRow } from "@/pages/watchlist";
import { installMockServer } from "@/shared/api";
import {
  BUTTON_ADD,
  BUTTON_REFRESH,
  BUTTON_STOP,
  COLUMN_ID_CHANGE,
  LONG_NAME_LENGTH,
  ROW_STATUS_SKELETON,
  SCREEN_ERROR,
  SCREEN_IDLE,
  SCREEN_REFRESHING,
  TICK_SIZE_100,
  WATCHLIST_SIZE,
} from "@/shared/config";
import contract from "../contracts/column-contract.json";
import instruments from "../contracts/instruments.json";
import watchlist from "../contracts/watchlist.json";

const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const renderRow = (ticker: ReturnType<typeof applyPatchToRow>) => {
  return render(
    <table>
      <tbody>
        <TickerRow
          ticker={ticker}
          columns={contract.columns}
          rowHeightPx={contract.rowHeightPx}
        />
      </tbody>
    </table>,
  );
};

describe("GET /instruments", () => {
  it("returns 10 instruments including three 40-character names and tickSize", async () => {
    const restore = installMockServer({ delayMin: 0, delayMax: 0 });
    try {
      const response = await fetch("/instruments");
      const body = await response.json();
      expect(body.items).toHaveLength(WATCHLIST_SIZE);
      expect(body.items.every((item: { tickSize: number }) => Number.isInteger(item.tickSize))).toBe(
        true,
      );
      expect(
        body.items.filter((item: { name: string }) => item.name.length === LONG_NAME_LENGTH),
      ).toHaveLength(3);
      const watch = await fetch("/watchlist").then((res) => res.json());
      expect(watch.codes).toEqual(watchlist.codes);
      expect(watch.codes).toHaveLength(WATCHLIST_SIZE);
    } finally {
      restore();
    }
  });
});

describe("mergePatch", () => {
  it("keeps omitted fields and clears only explicit null", () => {
    const prev = {
      code: "005930",
      price: 74300,
      changePct: 1.2,
      volume: 10,
    };
    expect(mergePatch(prev, { code: "005930", price: 74400 })).toEqual({
      code: "005930",
      price: 74400,
      changePct: 1.2,
      volume: 10,
    });
    expect(
      mergePatch(prev, { code: "005930", changePct: null, volume: 11 }),
    ).toEqual({
      code: "005930",
      price: 74300,
      changePct: null,
      volume: 11,
    });
  });
});

describe("bindTicker", () => {
  it("merges a price-only patch without dropping changePct", async () => {
    const onPatch = vi.fn();
    const onError = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [{ code: "005930", price: 74300, changePct: 1.2, volume: 8 }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ items: [{ code: "005930", price: 74400 }] }),
      );

    const session = bindTicker("005930", {
      onPatch,
      onError,
      tickSize: TICK_SIZE_100,
      fetchImpl,
    });
    await session.pull();
    await session.pull();
    expect(onError).not.toHaveBeenCalled();
    const lastCall = onPatch.mock.calls.at(-1);
    if (!lastCall) {
      throw new Error("onPatch was not called");
    }
    const last = lastCall[0];
    expect(last.price).toBe(74400);
    expect(last.changePct).toBe(1.2);
    expect(last.displayPrice).toBe(74400);
    expect(last.volume).toBe(8);
  });

  it("drops a late packet from an older request", async () => {
    const onPatch = vi.fn();
    const resolvers: Array<(value: ReturnType<typeof jsonResponse>) => void> = [];
    const fetchImpl = () =>
      new Promise<ReturnType<typeof jsonResponse>>((resolve) => {
        resolvers.push(resolve);
      });
    const session = bindTicker("005930", {
      onPatch,
      onError: vi.fn(),
      tickSize: TICK_SIZE_100,
      fetchImpl,
    });
    const first = session.pull();
    const second = session.pull();
    resolvers[1](
      jsonResponse({ items: [{ code: "005930", price: 75000, changePct: 2 }] }),
    );
    await second;
    expect(onPatch).toHaveBeenCalledTimes(1);
    expect(onPatch.mock.calls[0][0].displayPrice).toBe(75000);
    resolvers[0](
      jsonResponse({ items: [{ code: "005930", price: 10000, changePct: -9 }] }),
    );
    await first;
    expect(onPatch).toHaveBeenCalledTimes(1);
    expect(onPatch.mock.calls[0][0].displayPrice).toBe(75000);
  });

  it("computes color from rounded displayPrice, not the raw float", async () => {
    const onPatch = vi.fn();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ items: [{ code: "005930", price: 73420.2 }] }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ items: [{ code: "005930", price: 73480.9 }] }),
      );
    const session = bindTicker("005930", {
      onPatch,
      onError: vi.fn(),
      tickSize: TICK_SIZE_100,
      fetchImpl,
    });
    await session.pull();
    await session.pull();
    expect(onPatch.mock.calls[0][0].displayPrice).toBe(73400);
    expect(onPatch.mock.calls[1][0].displayPrice).toBe(73500);
    expect(onPatch.mock.calls[1][0].color).toBe("up");
  });
});

describe("partial tick sequences", () => {
  const samsung = instruments.items.find((item) => item.code === "005930")!;

  const sequences = {
    "price then changePct then full": [
      { code: "005930", price: 74300 },
      { code: "005930", changePct: 1.2 },
      { code: "005930", price: 74400, changePct: 1.4, volume: 3 },
    ],
    "changePct then price then full": [
      { code: "005930", changePct: -0.4 },
      { code: "005930", price: 62100 },
      { code: "005930", price: 62200, changePct: -0.2, volume: 4 },
    ],
    "full then shuffled partials": [
      { code: "005930", price: 74300, changePct: 1.2, volume: 1 },
      { code: "005930", price: 74500 },
      { code: "005930", changePct: 1.5 },
      { code: "005930", price: 74600 },
      { code: "005930", changePct: 1.7 },
    ],
  };

  for (const [label, patches] of Object.entries(sequences)) {
    it(`keeps a primed change column filled through ${label}`, () => {
      let row: TickerRowState = { ...samsung, status: ROW_STATUS_SKELETON };
      const empties = [];
      for (const patch of patches) {
        row = applyPatchToRow(row, patch, samsung.tickSize);
        const { unmount } = renderRow(row);
        const changeText = document
          .querySelector(`[data-column="${COLUMN_ID_CHANGE}"]`)!
          .textContent!.trim();
        if (row.changePct != null && changeText === "") {
          empties.push(patch);
        }
        unmount();
      }
      expect(empties).toEqual([]);
      expect(row.status).not.toBe(ROW_STATUS_SKELETON);
    });
  }

  it("never empties the change column across 100 partial ticks", () => {
    const restore = installMockServer({
      delayMin: 0,
      delayMax: 0,
      seed: 7,
    });
    let row = applyPatchToRow(
      { ...samsung, status: ROW_STATUS_SKELETON },
      { code: "005930", price: 74300, changePct: 1.2, volume: 9 },
      samsung.tickSize,
    );
    const { rerender } = renderRow(row);
    let emptyTransitions = 0;
    try {
      for (let index = 0; index < 100; index += 1) {
        const patch = restore.nextTick("005930");
        const previous = row.changePct;
        row = applyPatchToRow(row, patch, samsung.tickSize);
        rerender(
          <table>
            <tbody>
              <TickerRow
                ticker={row}
                columns={contract.columns}
                rowHeightPx={contract.rowHeightPx}
              />
            </tbody>
          </table>,
        );
        const changeText = document
          .querySelector(`[data-column="${COLUMN_ID_CHANGE}"]`)!
          .textContent!.trim();
        if (previous != null && changeText === "") {
          emptyTransitions += 1;
        }
      }
      expect(emptyTransitions).toBe(0);
      expect(
        document
          .querySelector(`[data-column="${COLUMN_ID_CHANGE}"]`)!
          .textContent!.trim(),
      ).not.toBe("");
    } finally {
      restore();
    }
  });

  it("does not return a primed row to skeleton on a partial tick", () => {
    let row = applyPatchToRow(
      { ...samsung, status: ROW_STATUS_SKELETON },
      { code: "005930", price: 74300, changePct: 1.2 },
      samsung.tickSize,
    );
    expect(row.status).not.toBe(ROW_STATUS_SKELETON);
    row = applyPatchToRow(
      row,
      { code: "005930", price: 74400 },
      samsung.tickSize,
    );
    expect(row.status).not.toBe(ROW_STATUS_SKELETON);
    const { container } = renderRow(row);
    expect(container.querySelector(".skeleton-bar")).toBeNull();
  });
});

describe("RefreshBar", () => {
  it("disables refresh while refreshing and keeps add disabled", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(
      <RefreshBar
        status={SCREEN_IDLE}
        error={null}
        onRefresh={onRefresh}
        onStop={onStop}
      />,
    );
    expect(screen.getByRole("button", { name: BUTTON_ADD })).toBeDisabled();
    expect(screen.getByRole("button", { name: BUTTON_REFRESH })).toBeEnabled();
    expect(screen.getByRole("button", { name: BUTTON_STOP })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: BUTTON_REFRESH }));
    expect(onRefresh).toHaveBeenCalledTimes(1);

    rerender(
      <RefreshBar
        status={SCREEN_REFRESHING}
        error={null}
        onRefresh={onRefresh}
        onStop={onStop}
      />,
    );
    expect(screen.getByRole("button", { name: BUTTON_ADD })).toBeDisabled();
    expect(screen.getByRole("button", { name: BUTTON_REFRESH })).toBeDisabled();
    expect(screen.getByRole("button", { name: BUTTON_STOP })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: BUTTON_STOP }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("keeps last values visible and shows error text in the header", () => {
    render(
      <RefreshBar
        status={SCREEN_ERROR}
        error="시세를 불러오지 못했습니다"
        onRefresh={() => {}}
        onStop={() => {}}
      />,
    );
    expect(screen.getByText("시세를 불러오지 못했습니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: BUTTON_REFRESH })).toBeEnabled();
  });
});
