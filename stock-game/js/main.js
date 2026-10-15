// =============================================================
// main.js — wires the pieces together and starts the game.
//   button click → GameState rule → UI.showMessage → UI.render
// =============================================================

// A brand-new game: random company (not the same as last time), secret
// market mood, randomized starting price, and fresh price history.
function newGame(previousCompany = null) {
  const company = Companies.pick(previousCompany);
  const mood = CONFIG.moods[Math.floor(Math.random() * CONFIG.moods.length)];
  const market = {
    trend: company.trend + mood.trendShift,
    volatility: company.volatility,
  };

  const jitter = (Math.random() * 2 - 1) * CONFIG.startPriceJitter;
  const startPrice = Math.round(company.startPrice * (1 + jitter) * 100) / 100;

  // The warm-up chart uses the company's normal trend, not the mood,
  // so the history doesn't give away whether this is a bull or bear game.
  const history = Market.generateHistory(startPrice, CONFIG.warmupDays, {
    trend: company.trend,
    volatility: company.volatility,
  });

  return GameState.create(CONFIG, { company, mood, market }, history);
}

function welcome(state) {
  const c = state.company;
  return {
    ok: true,
    message: `You're trading ${c.name} (${c.ticker}), a ${Companies.riskLabel(c.volatility).toLowerCase()} ${c.sectorLabel.toLowerCase()} stock. Watch the news.`,
  };
}

// `let`, not `const`, because Play again replaces the whole game.
let state = newGame();

UI.init({
  onBuy(qty) {
    UI.showMessage(GameState.buy(state, qty));
    UI.render(state);
  },

  onSell(qty) {
    UI.showMessage(GameState.sell(state, qty));
    UI.render(state);
  },

  onNextDay() {
    if (state.status !== "playing") return;

    // 1. Normal random-walk move.
    let price = Market.nextPrice(GameState.currentPrice(state), state.market);

    // 2. Yesterday's "next day" story hits the price this morning.
    if (state.pendingNews) price = News.applyImpact(price, state.pendingNews.impact);

    // 3. Maybe a new headline breaks today. "now" stories move the price
    //    immediately; "next" stories wait until tomorrow.
    const headline = News.roll(CONFIG.newsChance, state.company);
    if (headline && headline.timing === "now") price = News.applyImpact(price, headline.impact);

    GameState.advanceDay(state, price, headline);

    if (state.status === "won") {
      UI.showMessage({ ok: true, message: `Day ${state.day}: you survived the market!` });
    } else if (state.status === "lost") {
      UI.showMessage({ ok: false, message: `Day ${state.day}: game over.` });
    } else {
      UI.showMessage({ ok: true, message: `Day ${state.day}: ${state.company.ticker} closed at $${price.toFixed(2)}.` });
    }
    UI.render(state);
  },

  onPlayAgain() {
    state = newGame(state.company);
    UI.showMessage(welcome(state));
    UI.render(state);
  },

  onResize() {
    UI.render(state);
  },
});

UI.showMessage(welcome(state));
UI.render(state);
