# Market Survival

A tiny stock market game in plain HTML, CSS, and JavaScript. Start with $10,000, trade one fictional stock, and click **Next Day** to see where the market goes.

**Goal:** survive 100 days and finish with more than $10,000. If your portfolio ever drops below $5,000, you lose immediately.

## Run it
Open `index.html` in any browser. No install or server needed.

## How the code is organized

| File | Role |
|------|------|
| `js/config.js` | All settings: starting cash, stock name, `trend`, `volatility` |
| `js/market.js` | Market engine: generates prices with a geometric random walk |
| `js/state.js`  | Game state (cash, shares, history, trades) and the buy/sell/next-day rules |
| `js/ui.js`     | Draws the stats and the canvas chart; forwards button clicks |
| `js/main.js`   | Connects everything: click → rule → message → redraw |
| `css/style.css`| Layout and colors (light and dark mode) |

Data flows one way: **main** asks **state** to change, then tells **ui** to redraw from **state**. The market engine is pure math and knows nothing about the player.

## Tuning the market
In `js/config.js`:
- `trend`: expected daily return (`0.0005` ≈ +13%/year; negative = bear market)
- `volatility`: typical daily move (`0.02` ≈ ±2%/day)
- `gameLength`: how many days you must survive (default `100`)
- `loseFloor`: portfolio value that ends the game instantly (default `5000`)
