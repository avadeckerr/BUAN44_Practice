// =============================================================
// state.js — the game state and the rules for changing it.
// This is the "single source of truth": the UI reads from it, and
// the only way to change it is through the functions below.
// =============================================================

const GameState = {
  // Builds a fresh game. `priceHistory` comes from the market engine.
  create(config, priceHistory) {
    return {
      day: 1,
      cash: config.startingCash,
      startingCash: config.startingCash,
      shares: 0,
      priceHistory, // array of daily closing prices; last item = today
      trades: [],   // { type: "buy"|"sell", shares, price, day, index }
    };
  },

  currentPrice(state) {
    return state.priceHistory[state.priceHistory.length - 1];
  },

  // Cash + market value of shares held.
  portfolioValue(state) {
    return state.cash + state.shares * GameState.currentPrice(state);
  },

  buy(state, qty) {
    if (!Number.isInteger(qty) || qty <= 0) {
      return { ok: false, message: "Enter a whole number of shares greater than 0." };
    }
    const price = GameState.currentPrice(state);
    const cost = qty * price;
    if (cost > state.cash + 1e-9) {
      const maxAffordable = Math.floor(state.cash / price);
      return {
        ok: false,
        message: `Not enough cash. You can afford at most ${maxAffordable} share(s).`,
      };
    }
    state.cash = round2(state.cash - cost);
    state.shares += qty;
    recordTrade(state, "buy", qty, price);
    return { ok: true, message: `Bought ${qty} share(s) at $${price.toFixed(2)}.` };
  },

  sell(state, qty) {
    if (!Number.isInteger(qty) || qty <= 0) {
      return { ok: false, message: "Enter a whole number of shares greater than 0." };
    }
    if (qty > state.shares) {
      return { ok: false, message: `You only own ${state.shares} share(s).` };
    }
    const price = GameState.currentPrice(state);
    state.cash = round2(state.cash + qty * price);
    state.shares -= qty;
    recordTrade(state, "sell", qty, price);
    return { ok: true, message: `Sold ${qty} share(s) at $${price.toFixed(2)}.` };
  },

  // Moves the game forward one day with the price the market produced.
  advanceDay(state, newPrice) {
    state.priceHistory.push(newPrice);
    state.day += 1;
  },
};

// --- small private helpers ---------------------------------------------

function round2(n) {
  return Math.round(n * 100) / 100;
}

function recordTrade(state, type, shares, price) {
  state.trades.push({
    type,
    shares,
    price,
    day: state.day,
    index: state.priceHistory.length - 1, // where to mark it on the chart
  });
}
