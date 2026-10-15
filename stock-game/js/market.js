// =============================================================
// market.js — the market engine.
// Pure math: given today's price, produce tomorrow's price.
// It knows nothing about the player, cash, or the screen.
// =============================================================

const Market = {
  // A random number from a standard normal distribution (mean 0, sd 1),
  // using the Box–Muller transform. Math.random() is uniform, but real
  // daily returns look roughly bell-shaped, so we convert.
  randomNormal() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); // avoid log(0)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },

  // One step of a geometric random walk:
  //   nextPrice = price * e^(trend - volatility²/2 + volatility * Z)
  // The "- volatility²/2" term keeps the *average* daily return equal to
  // `trend`. Without it, high volatility would quietly drag prices down.
  nextPrice(price, { trend, volatility }) {
    const shock = volatility * Market.randomNormal();
    const next = price * Math.exp(trend - (volatility * volatility) / 2 + shock);
    // Round to cents, and never let the price hit zero.
    return Math.max(0.01, Math.round(next * 100) / 100);
  },

  // Builds a price series of `days` steps that ends at startPrice, so the
  // chart has some history before the player's first day.
  generateHistory(startPrice, days, params) {
    const history = [startPrice];
    for (let i = 0; i < days; i++) {
      history.push(Market.nextPrice(history[history.length - 1], params));
    }
    // Rescale so the final (current) price is exactly startPrice.
    const scale = startPrice / history[history.length - 1];
    return history.map((p) => Math.max(0.01, Math.round(p * scale * 100) / 100));
  },
};
