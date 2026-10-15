# Market Survival

A tiny stock market game in plain HTML, CSS, and JavaScript. Start with $10,000, trade a fictional stock, and click **Next Day** to see where the market goes.

Every game is different: you get a random company (from a calm utility to a chaotic crypto exchange), a secret market mood (bull, bear, or sideways, revealed at the end), and a randomized starting price. About once a week a news headline breaks. Some move the price right away; others hit the next day, giving you one day to react.

**Goal:** survive 100 days and finish with more than $10,000. If your portfolio ever drops below $5,000, you lose immediately.

## Run it
Open `index.html` in any browser. No install or server needed.

## How the code is organized

| File | Role |
|------|------|
| `js/config.js` | Game rules: starting cash, game length, loss floor, news chance, market moods |
| `js/companies.js` | The fictional companies and their `trend` / `volatility` |
| `js/news.js`   | Headlines (general + per industry), each with an impact and timing |
| `js/market.js` | Market engine: generates prices with a geometric random walk |
| `js/state.js`  | Game state (cash, shares, history, trades) and the buy/sell/next-day rules |
| `js/ui.js`     | Draws the stats and the canvas chart; forwards button clicks |
| `js/main.js`   | Connects everything: click → rule → message → redraw |
| `css/style.css`| Layout and colors (light and dark mode) |

Data flows one way: **main** asks **state** to change, then tells **ui** to redraw from **state**. The market engine is pure math and knows nothing about the player.

## Tuning the game
In `js/companies.js`, each company has:
- `trend`: expected daily return (`0.0005` ≈ +13%/year; negative = drifts down)
- `volatility`: typical daily move (`0.02` ≈ ±2%/day)

In `js/config.js`:
- `newsChance`: chance of a headline each day (default `1 / 6`; `0` turns news off)
- `moods`: the bull/bear/sideways moods and how much each shifts the trend
- `startPriceJitter`: how far the starting price can vary (default `0.3` = ±30%)
- `gameLength`: how many days you must survive (default `100`)
- `loseFloor`: portfolio value that ends the game instantly (default `5000`)
