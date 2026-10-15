// =============================================================
// main.js — wires the pieces together and starts the game.
//   button click → GameState rule → UI.showMessage → UI.render
// =============================================================

const state = GameState.create(
  CONFIG,
  Market.generateHistory(CONFIG.stock.startPrice, CONFIG.warmupDays, CONFIG.market)
);

UI.init(CONFIG, {
  onBuy(qty) {
    UI.showMessage(GameState.buy(state, qty));
    UI.render(state);
  },

  onSell(qty) {
    UI.showMessage(GameState.sell(state, qty));
    UI.render(state);
  },

  onNextDay() {
    const newPrice = Market.nextPrice(GameState.currentPrice(state), CONFIG.market);
    GameState.advanceDay(state, newPrice);
    UI.showMessage({ ok: true, message: `Day ${state.day} — market closed at $${newPrice.toFixed(2)}.` });
    UI.render(state);
  },

  onResize() {
    UI.render(state);
  },
});

UI.render(state);
