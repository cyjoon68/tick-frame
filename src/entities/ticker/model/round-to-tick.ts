export const roundToTick = (price: number, tickSize: number) => {
  return Math.round(price / tickSize) * tickSize;
};
