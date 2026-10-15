// =============================================================
// ui.js — everything the player sees and clicks.
// It READS the game state to draw the screen, and forwards button
// clicks to handlers supplied by main.js. It never changes state itself.
// =============================================================

const UI = (() => {
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const els = {}; // cached DOM elements

  function init(config, handlers) {
    for (const id of [
      "ticker", "stock-name", "day", "price", "price-change", "cash", "shares",
      "holdings", "portfolio", "pnl", "qty", "buy-btn", "sell-btn", "next-btn",
      "message", "chart",
    ]) {
      els[id] = document.getElementById(id);
    }

    els.ticker.textContent = config.stock.ticker;
    els["stock-name"].textContent = config.stock.name;

    const readQty = () => Number(els.qty.value);
    els["buy-btn"].addEventListener("click", () => handlers.onBuy(readQty()));
    els["sell-btn"].addEventListener("click", () => handlers.onSell(readQty()));
    els["next-btn"].addEventListener("click", () => handlers.onNextDay());

    // Redraw the chart when the window size changes.
    window.addEventListener("resize", () => handlers.onResize());
  }

  // Repaint the whole screen from the current state.
  function render(state) {
    const price = GameState.currentPrice(state);
    const prev = state.priceHistory[state.priceHistory.length - 2] ?? price;
    const change = price - prev;
    const changePct = (change / prev) * 100;
    const value = GameState.portfolioValue(state);
    const pnl = value - state.startingCash;

    els.day.textContent = state.day;
    els.price.textContent = money.format(price);
    els["price-change"].textContent =
      `${change >= 0 ? "▲" : "▼"} ${money.format(Math.abs(change))} (${changePct.toFixed(2)}%)`;
    setTrend(els["price-change"], change);

    els.cash.textContent = money.format(state.cash);
    els.shares.textContent = state.shares.toLocaleString();
    els.holdings.textContent = `worth ${money.format(state.shares * price)}`;
    els.portfolio.textContent = money.format(value);
    els.pnl.textContent =
      `${pnl >= 0 ? "+" : "−"}${money.format(Math.abs(pnl))} since start`;
    setTrend(els.pnl, pnl);

    drawChart(state);
  }

  // Shows feedback from a trade. `result` is { ok, message } from GameState.
  function showMessage(result) {
    els.message.textContent = result.message;
    els.message.className = "message " + (result.ok ? "ok" : "error");
  }

  function setTrend(el, n) {
    el.classList.toggle("up", n > 0);
    el.classList.toggle("down", n < 0);
  }

  // --- chart ------------------------------------------------------------

  function drawChart(state) {
    const canvas = els.chart;
    const ctx = canvas.getContext("2d");
    const prices = state.priceHistory;

    // Match the canvas's pixel buffer to its on-screen size (sharp on
    // high-DPI / retina screens).
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Colors come from CSS variables, so styling stays in style.css.
    const css = getComputedStyle(document.documentElement);
    const color = (name) => css.getPropertyValue(name).trim();

    const pad = { top: 16, right: 16, bottom: 28, left: 64 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Y range with a little breathing room above and below.
    let min = Math.min(...prices);
    let max = Math.max(...prices);
    const margin = (max - min) * 0.1 || max * 0.05;
    min -= margin;
    max += margin;

    const x = (i) => pad.left + (prices.length === 1 ? plotW : (i / (prices.length - 1)) * plotW);
    const y = (p) => pad.top + (1 - (p - min) / (max - min)) * plotH;

    // Horizontal grid lines + price labels.
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const gridLines = 4;
    for (let g = 0; g <= gridLines; g++) {
      const p = min + ((max - min) * g) / gridLines;
      const gy = y(p);
      ctx.strokeStyle = color("--grid");
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();
      ctx.fillStyle = color("--muted");
      ctx.fillText(money.format(p), pad.left - 8, gy);
    }

    // X-axis label: where the game started (warmup history is to its left).
    const startIndex = prices.length - state.day;
    if (startIndex > 0) {
      const sx = x(startIndex);
      ctx.strokeStyle = color("--muted");
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, pad.top);
      ctx.lineTo(sx, pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = color("--muted");
      ctx.fillText("Day 1", sx, pad.top + plotH + 8);
    }

    // Line color: green if the stock is up since Day 1, red if down.
    const day1Price = prices[Math.max(0, startIndex)];
    const lineColor = prices[prices.length - 1] >= day1Price ? color("--up") : color("--down");

    // Shaded area under the line.
    ctx.beginPath();
    prices.forEach((p, i) => (i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p))));
    ctx.lineTo(x(prices.length - 1), pad.top + plotH);
    ctx.lineTo(x(0), pad.top + plotH);
    ctx.closePath();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.globalAlpha = 1;

    // The price line itself.
    ctx.beginPath();
    prices.forEach((p, i) => (i === 0 ? ctx.moveTo(x(i), y(p)) : ctx.lineTo(x(i), y(p))));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Trade markers: ▲ for buys (below the line), ▼ for sells (above it).
    for (const t of state.trades) {
      const tx = x(t.index);
      const ty = y(prices[t.index]);
      const isBuy = t.type === "buy";
      ctx.fillStyle = isBuy ? color("--up") : color("--down");
      ctx.beginPath();
      if (isBuy) {
        ctx.moveTo(tx, ty + 6);
        ctx.lineTo(tx - 6, ty + 16);
        ctx.lineTo(tx + 6, ty + 16);
      } else {
        ctx.moveTo(tx, ty - 6);
        ctx.lineTo(tx - 6, ty - 16);
        ctx.lineTo(tx + 6, ty - 16);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Dot on today's price.
    const last = prices.length - 1;
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(x(last), y(prices[last]), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  return { init, render, showMessage };
})();
