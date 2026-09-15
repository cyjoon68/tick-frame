import { describe, expect, it } from "vitest";
import { roundToTick } from "@/entities/ticker";
import { TICK_SIZE_100 } from "@/shared/config";

const TABLE = [
  { price: 73450.3333, tickSize: 100, displayPrice: 73500 },
  { price: 73400, tickSize: 100, displayPrice: 73400 },
  { price: 73500, tickSize: 100, displayPrice: 73500 },
  { price: 12, tickSize: 5, displayPrice: 10 },
  { price: 13, tickSize: 5, displayPrice: 15 },
  { price: 12.5, tickSize: 5, displayPrice: 15 },
  { price: 74, tickSize: 10, displayPrice: 70 },
  { price: 75, tickSize: 10, displayPrice: 80 },
  { price: 73474, tickSize: 50, displayPrice: 73450 },
  { price: 73475, tickSize: 50, displayPrice: 73500 },
  { price: 1.4, tickSize: 1, displayPrice: 1 },
  { price: 1.5, tickSize: 1, displayPrice: 2 },
  { price: 73200, tickSize: 500, displayPrice: 73000 },
  { price: 73750, tickSize: 500, displayPrice: 74000 },
  { price: 73200, tickSize: 1000, displayPrice: 73000 },
  { price: 73500, tickSize: 1000, displayPrice: 74000 },
];

describe("roundToTick", () => {
  it.each(TABLE)(
    "rounds $price to $displayPrice at tickSize $tickSize",
    ({ price, tickSize, displayPrice }) => {
      expect(roundToTick(price, tickSize)).toBe(displayPrice);
    },
  );

  it("keeps tickSize 100 display prices on 100 increments", () => {
    const samples = [1, 49, 50, 99, 100, 149, 150, 73450.3333, 73999.9];
    for (const price of samples) {
      const displayPrice = roundToTick(price, TICK_SIZE_100);
      expect(displayPrice % TICK_SIZE_100).toBe(0);
    }
  });
});
