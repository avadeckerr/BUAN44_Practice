// =============================================================
// config.js — every tunable game rule lives here.
// The stocks themselves (and their trend/volatility) are in companies.js.
// =============================================================

const CONFIG = {
  startingCash: 10000,

  // How long the game lasts, in trading days. To win, your portfolio
  // must be worth more than startingCash on the last day.
  gameLength: 100,

  // If your portfolio value drops below this, you lose immediately.
  loseFloor: 5000,

  // Chance that a news headline breaks on any given day.
  // 1 / 6 ≈ one headline per week of trading. Set to 0 to turn news off.
  newsChance: 1 / 6,

  // Each game secretly rolls one market mood. Its trendShift is added to
  // the company's own trend, so the same stock can boom in one game and
  // sink in the next. The mood is revealed on the end screen.
  // 0.0015 per day ≈ ±16% over a 100-day game.
  moods: [
    { name: "Bull market", trendShift: 0.0015 },
    { name: "Bear market", trendShift: -0.0015 },
    { name: "Sideways market", trendShift: 0 },
  ],

  // Each game's starting price is the company's base price, randomly
  // moved up or down by as much as this fraction (0.3 = ±30%).
  startPriceJitter: 0.3,

  // Days of price history generated before the game starts,
  // so the chart isn't empty on day 1.
  warmupDays: 30,
};
