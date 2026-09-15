import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "@/app/app";
import { installMockServer } from "@/shared/api";
import { WATCHLIST_SIZE } from "@/shared/config";

describe("App", () => {
  let restore = () => {};

  afterEach(() => {
    restore();
  });

  it("renders the watchlist board with ten instrument rows", async () => {
    restore = installMockServer({ delayMin: 0, delayMax: 0, seed: 3 });
    const { unmount } = render(<App />);
    expect(await screen.findByText("삼성전자")).toBeInTheDocument();
    expect(await screen.findByText("코드")).toBeInTheDocument();
    expect(document.querySelectorAll("tr.ticker-row")).toHaveLength(
      WATCHLIST_SIZE,
    );
    unmount();
  });
});
