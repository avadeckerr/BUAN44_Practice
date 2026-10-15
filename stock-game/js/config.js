// =============================================================
// config.js — every tunable number in the game lives here.
// Change these to make the market calmer, wilder, bullish, or bearish.
// =============================================================

const CONFIG = {
  startingCash: 10000,

  // How long the game lasts, in trading days. To win, your portfolio
  // must be worth more than startingCash on the last day.
  gameLength: 100,

  // If your portfolio value drops below this, you lose immediately.
  loseFloor: 5000,

  stock: {
    ticker: "ACME",
    name: "Acme Rocket Co.",
    startPrice: 100,
  },

  market: {
    // Expected daily return. 0.0005 = +0.05% per day (~13% per year).
    // Use a negative number for a bear market.
    trend: 0.0005,

    // Daily volatility (standard deviation of daily returns).
    // 0.02 = a typical day moves about ±2%. Try 0.05 for chaos.
    volatility: 0.02,
  },

  // Days of price history generated before the game starts,
  // so the chart isn't empty on day 1.
  warmupDays: 30,
};
