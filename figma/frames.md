# Figma frames

Frame names map to JSON ids. The screen is a watchlist board, not a Figma file checked into git.

| Figma | JSON |
| --- | --- |
| Watchlist | screen |
| Col/Code | column-contract code |
| Col/Name | column-contract name |
| Col/Price | column-contract price |
| Col/Change | column-contract changePct |
| Row/Ticker | TickerRow |
| Bar/Refresh | RefreshBar |

The mock names in Figma are 8 characters. Implementation fixtures include three 40-character names. Column widths stay at the Figma px values in `contracts/column-contract.json`. Long names must not move the price column.
