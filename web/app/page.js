import { mtcars } from "./mtcars";

const W = 400, H = 260, PAD = 36;

// mean(mtcars$mpg)
const meanMpg = mtcars.reduce((s, c) => s + c.mpg, 0) / mtcars.length;

// hist(mtcars$mpg) — R picks breaks of 10, 15, ..., 35
const breaks = [10, 15, 20, 25, 30, 35];
const counts = breaks.slice(0, -1).map((lo, i) =>
  mtcars.filter((c) => c.mpg > lo && c.mpg <= breaks[i + 1]).length
);

function Histogram() {
  const max = Math.max(...counts);
  const bw = (W - PAD * 2) / counts.length;
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      {counts.map((n, i) => (
        <g key={i}>
          <rect x={PAD + i * bw + 1} y={y(n)} width={bw - 2} height={H - PAD - y(n)} fill="var(--accent)" rx="2" />
          <text x={PAD + i * bw + bw / 2} y={y(n) - 4} textAnchor="middle">{n}</text>
        </g>
      ))}
      {breaks.map((b, i) => (
        <text key={b} x={PAD + i * bw} y={H - PAD + 16} textAnchor="middle">{b}</text>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle">mpg</text>
    </svg>
  );
}

function Scatter() {
  const x = (wt) => PAD + ((wt - 1) / 5) * (W - PAD * 2);
  const y = (mpg) => H - PAD - ((mpg - 10) / 25) * (H - PAD * 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`}>
      {[1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={PAD} y2={H - PAD} stroke="var(--grid)" />
          <text x={x(t)} y={H - PAD + 16} textAnchor="middle">{t}</text>
        </g>
      ))}
      {[10, 15, 20, 25, 30, 35].map((t) => (
        <g key={t}>
          <line x1={PAD} x2={W - PAD} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
          <text x={PAD - 6} y={y(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      {mtcars.map((c) => (
        <circle key={c.name} cx={x(c.wt)} cy={y(c.mpg)} r="4" fill="var(--accent)" opacity="0.8">
          <title>{`${c.name}: ${c.mpg} mpg, ${c.wt}k lbs`}</title>
        </circle>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle">weight (1000 lbs)</text>
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <h1>BUAN44 Practice</h1>
      <p className="sub">The mtcars analysis from GitPractice.R. Edit app/page.js and this page reloads on save.</p>
      <div className="grid">
        <div className="card">
          <h2>Average mpg <code>mean(mtcars$mpg)</code></h2>
          <div className="stat">{meanMpg.toFixed(2)}</div>
        </div>
        <div className="card">
          <h2>Cars in dataset</h2>
          <div className="stat">{mtcars.length}</div>
        </div>
        <div className="card">
          <h2>Histogram <code>hist(mtcars$mpg)</code></h2>
          <Histogram />
        </div>
        <div className="card">
          <h2>mpg vs weight <code>plot(mpg ~ wt)</code></h2>
          <Scatter />
        </div>
      </div>
    </main>
  );
}
