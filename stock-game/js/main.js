// =============================================================
// main.js — wires the pieces together and starts the game.
//   button click → GameState rule → UI.showMessage → UI.render
// =============================================================

// A brand-new game with a fresh random price history.
function newGame() {
  return GameState.create(
    CONFIG,
    Market.generateHistory(CONFIG.stock.startPrice, CONFIG.warmupDays, CONFIG.market)
  );
}

// `let`, not `const`, because Play again replaces the whole game.
let state = newGame();

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
    if (state.status !== "playing") return;
    const newPrice = Market.nextPrice(GameState.currentPrice(state), CONFIG.market);
    GameState.advanceDay(state, newPrice);

    if (state.status === "won") {
      UI.showMessage({ ok: true, message: `Day ${state.day}: you survived the market!` });
    } else if (state.status === "lost") {
      UI.showMessage({ ok: false, message: `Day ${state.day}: game over.` });
    } else {
      UI.showMessage({ ok: true, message: `Day ${state.day}: market closed at $${newPrice.toFixed(2)}.` });
    }
    UI.render(state);
  },

  onPlayAgain() {
    state = newGame();
    UI.showMessage({ ok: true, message: "New game! You have $10,000 again. Good luck." });
    UI.render(state);
  },

  onResize() {
    UI.render(state);
  },
});

UI.render(state);
