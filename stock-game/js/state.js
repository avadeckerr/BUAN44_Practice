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
      gameLength: config.gameLength,
      loseFloor: config.loseFloor,
      shares: 0,
      priceHistory,     // array of daily closing prices; last item = today
      trades: [],       // { type: "buy"|"sell", shares, price, day, index }
      dailyChanges: [], // { day, change }: portfolio gain/loss each day
      status: "playing", // "playing" | "won" | "lost"
      endReason: null,   // "floor" (fell below loseFloor) | "time" (reached the last day)
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
    if (state.status !== "playing") return gameOverResult();
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
    if (state.status !== "playing") return gameOverResult();
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

  // Moves the game forward one day with the price the market produced,
  // records how much the portfolio moved, then checks for game over.
  advanceDay(state, newPrice) {
    if (state.status !== "playing") return;
    const before = GameState.portfolioValue(state);
    state.priceHistory.push(newPrice);
    state.day += 1;
    state.dailyChanges.push({
      day: state.day,
      change: round2(GameState.portfolioValue(state) - before),
    });
    GameState.checkGameOver(state);
  },

  // Decides whether the game has ended. The floor is checked first, so
  // crashing below it on the final day still counts as a loss.
  checkGameOver(state) {
    const value = GameState.portfolioValue(state);
    if (value < state.loseFloor) {
      state.status = "lost";
      state.endReason = "floor";
    } else if (state.day >= state.gameLength) {
      state.status = value > state.startingCash ? "won" : "lost";
      state.endReason = "time";
    }
    return state.status;
  },

  // The numbers the end screen needs, gathered in one place.
  summary(state) {
    const finalValue = GameState.portfolioValue(state);
    let best = null;
    let worst = null;
    for (const d of state.dailyChanges) {
      if (!best || d.change > best.change) best = d;
      if (!worst || d.change < worst.change) worst = d;
    }
    return {
      status: state.status,
      endReason: state.endReason,
      day: state.day,
      finalValue,
      profit: round2(finalValue - state.startingCash),
      best,
      worst,
      tradeCount: state.trades.length,
    };
  },
};

// --- small private helpers ---------------------------------------------

function gameOverResult() {
  return { ok: false, message: "The game is over. Click Play again to start a new one." };
}

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
