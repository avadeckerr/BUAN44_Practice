// =============================================================
// ui.js — everything the player sees and clicks.
// It READS the game state to draw the screen, and forwards button
// clicks to handlers supplied by main.js. It never changes state itself.
// =============================================================

const UI = (() => {
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const els = {}; // cached DOM elements

  function init(handlers) {
    for (const id of [
      "ticker", "stock-name", "sector", "risk", "day", "price", "price-change", "cash",
      "shares", "holdings", "portfolio", "pnl", "qty", "buy-btn", "sell-btn", "next-btn",
      "message", "chart", "day-total", "news-banner", "news-tag", "news-text", "news-note",
      "news-list", "end-screen", "end-title", "end-reason", "end-stock", "end-mood",
      "end-value", "end-pnl", "end-best", "end-worst", "end-trades", "end-news",
      "play-again-btn",
    ]) {
      els[id] = document.getElementById(id);
    }

    const readQty = () => Number(els.qty.value);
    els["buy-btn"].addEventListener("click", () => handlers.onBuy(readQty()));
    els["sell-btn"].addEventListener("click", () => handlers.onSell(readQty()));
    els["next-btn"].addEventListener("click", () => handlers.onNextDay());
    els["play-again-btn"].addEventListener("click", () => handlers.onPlayAgain());

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

    const c = state.company;
    els.ticker.textContent = c.ticker;
    els["stock-name"].textContent = c.name;
    els.sector.textContent = c.sectorLabel;
    const risk = Companies.riskLabel(c.volatility);
    els.risk.textContent = `${risk} risk`;
    els.risk.className = "risk " + risk.toLowerCase();

    els.day.textContent = state.day;
    els["day-total"].textContent = state.gameLength;
    els.price.textContent = money.format(price);
    els["price-change"].textContent =
      `${change >= 0 ? "▲" : "▼"} ${money.format(Math.abs(change))} (${changePct.toFixed(2)}%)`;
    setTrend(els["price-change"], change);

    els.cash.textContent = money.format(state.cash);
    els.shares.textContent = state.shares.toLocaleString();
    els.holdings.textContent = `worth ${money.format(state.shares * price)}`;
    els.portfolio.textContent = money.format(value);
    els.pnl.textContent = `${signedMoney(pnl)} since start`;
    setTrend(els.pnl, pnl);

    // Lock the controls once the game is over.
    const over = state.status !== "playing";
    for (const id of ["qty", "buy-btn", "sell-btn", "next-btn"]) els[id].disabled = over;

    renderNews(state);
    drawChart(state);
    renderEndScreen(state);
  }

  // --- news ---------------------------------------------------------------

  function renderNews(state) {
    const { headline, reaction } = state.today;
    const banner = els["news-banner"];
    let tag, text, note, mood;

    if (headline) {
      mood = headline.impact >= 0 ? "good" : "bad";
      text = headline.text;
      if (headline.timing === "next") {
        tag = "Developing";
        note = `The market reacts tomorrow. You have today to trade before it hits.`;
      } else {
        tag = "Breaking";
        note = `${state.company.ticker} moved ${pct(headline.impact)} on the news today.`;
      }
      if (reaction) note += ` Yesterday's story also hit today: ${pct(reaction.impact)}.`;
    } else if (reaction) {
      mood = reaction.impact >= 0 ? "good" : "bad";
      tag = "Market reaction";
      text = reaction.text;
      note = `Yesterday's story hit the price this morning: ${pct(reaction.impact)}.`;
    } else {
      mood = "quiet";
      tag = "Quiet day";
      text = state.day === 1 ? "No news yet." : "No major news today.";
      note = state.day === 1 ? "Headlines break about once a week and can move the price a lot." : "";
    }

    banner.className = "news-banner " + mood;
    els["news-tag"].textContent = tag;
    els["news-text"].textContent = text;
    els["news-note"].textContent = note;
    els["news-note"].hidden = !note;

    // Feed: newest first. Pending stories hide their impact until they hit.
    const list = els["news-list"];
    list.replaceChildren();
    if (state.newsLog.length === 0) {
      const li = document.createElement("li");
      li.className = "news-empty";
      li.textContent = "No headlines yet.";
      list.append(li);
      return;
    }
    for (const n of [...state.newsLog].reverse()) {
      const li = document.createElement("li");
      const day = document.createElement("span");
      day.className = "news-day";
      day.textContent = `Day ${n.day}`;
      const body = document.createElement("span");
      body.className = "news-item-text";
      body.textContent = n.text;
      const chip = document.createElement("span");
      chip.className = "news-chip " + (n.pending ? "pending" : n.impact >= 0 ? "good" : "bad");
      chip.textContent = n.pending ? "Reacts tomorrow" : pct(n.impact);
      li.append(day, body, chip);
      list.append(li);
    }
  }

  function pct(impact) {
    return `${impact >= 0 ? "+" : "−"}${Math.round(Math.abs(impact) * 100)}%`;
  }

  // Shows the end screen when the game is over, hides it otherwise.
  function renderEndScreen(state) {
    const screen = els["end-screen"];
    if (state.status === "playing") {
      screen.hidden = true;
      return;
    }
    const s = GameState.summary(state);
    const won = s.status === "won";

    els["end-title"].textContent = won ? "You survived!" : "Game over";
    els["end-title"].className = "end-title " + s.status;
    els["end-reason"].textContent =
      s.endReason === "floor"
        ? `Your portfolio fell below ${money.format(state.loseFloor)} on day ${s.day}.`
        : won
          ? `You made it to day ${s.day} with more than you started with.`
          : `You made it to day ${s.day}, but finished at or below your starting ${money.format(state.startingCash)}.`;

    els["end-value"].textContent = money.format(s.finalValue);
    els["end-pnl"].textContent = signedMoney(s.profit);
    setTrend(els["end-pnl"], s.profit);
    els["end-best"].textContent = s.best ? `Day ${s.best.day}: ${signedMoney(s.best.change)}` : "–";
    els["end-worst"].textContent = s.worst ? `Day ${s.worst.day}: ${signedMoney(s.worst.change)}` : "–";
    els["end-trades"].textContent = s.tradeCount;
    els["end-stock"].textContent = `${s.company.ticker} (${s.company.sectorLabel})`;
    els["end-mood"].textContent = s.mood.name;
    els["end-news"].textContent = s.newsCount;

    const wasHidden = screen.hidden;
    screen.hidden = false;
    if (wasHidden) els["play-again-btn"].focus(); // so Enter/Space starts a new game
  }

  function signedMoney(n) {
    return `${n >= 0 ? "+" : "−"}${money.format(Math.abs(n))}`;
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

    const pad = { top: 34, right: 16, bottom: 28, left: 64 }; // top leaves room for news badges
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

    // News badges: a "!" circle above each news day. Filled green/red once
    // the move has hit; hollow while a "next day" story is still pending.
    for (const n of state.newsLog) {
      const nx = x(n.index);
      const ny = 14;
      const c = n.impact >= 0 ? color("--up") : color("--down");
      // faint guide line from the badge down to that day's price
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(nx, ny + 8);
      ctx.lineTo(nx, y(prices[n.index]));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(nx, ny, 8, 0, Math.PI * 2);
      if (n.pending) {
        ctx.fillStyle = color("--card");
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = c;
        ctx.stroke();
      } else {
        ctx.fillStyle = c;
        ctx.fill();
      }
      ctx.fillStyle = n.pending ? c : color("--card");
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", nx, ny + 0.5);
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
