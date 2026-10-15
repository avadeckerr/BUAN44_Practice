// =============================================================
// news.js — fictional headlines that shock the stock price.
// Like market.js, this knows nothing about the player. It only
// decides whether news breaks today and how big the move is.
//
// text:   "{name}" is replaced with the company's shortName
// impact: how much the price moves (0.18 = +18%, -0.25 = -25%)
// timing: "now"  = the price reacts the same day
//         "next" = the price reacts tomorrow, so the player can act first
//
// Each game draws from the general list plus its company's sector list.
// =============================================================

const News = {
  // Headlines that fit any company.
  general: [
    { text: "{name} will report record earnings after the close",   impact: 0.14,  timing: "next" },
    { text: "Rumor: a larger rival is in talks to buy {name}",       impact: 0.20,  timing: "next" },
    { text: "{name} will join a major stock index next week",        impact: 0.08,  timing: "next" },
    { text: "Analysts upgrade {name} to Strong Buy",                 impact: 0.06,  timing: "now" },
    { text: "{name} CEO buys $5M of company stock",                  impact: 0.04,  timing: "now" },
    { text: "{name} expected to miss earnings when it reports tonight", impact: -0.15, timing: "next" },
    { text: "Short seller calls {name} \"a house of cards\"",        impact: -0.12, timing: "now" },
    { text: "{name} CFO resigns unexpectedly",                       impact: -0.10, timing: "now" },
    { text: "Analysts downgrade {name}, citing slowing growth",      impact: -0.06, timing: "now" },
  ],

  // Headlines specific to each industry (keys match `sector` in companies.js).
  bySector: {
    aerospace: [
      { text: "{name} wins $2B NASA launch contract",                 impact: 0.18,  timing: "now" },
      { text: "{name} test rocket reaches orbit on its first try",    impact: 0.12,  timing: "now" },
      { text: "{name} unveils reusable booster, halving launch costs", impact: 0.10, timing: "now" },
      { text: "{name} rocket explodes on the launch pad",             impact: -0.25, timing: "now" },
      { text: "Regulators open probe into {name} safety records",     impact: -0.12, timing: "next" },
      { text: "{name} delays its flagship launch by six months",      impact: -0.08, timing: "next" },
      { text: "Rival SpaceCorp undercuts {name} on launch prices",    impact: -0.07, timing: "now" },
    ],
    biotech: [
      { text: "FDA decides on {name}'s cancer drug tomorrow; insiders upbeat", impact: 0.20, timing: "next" },
      { text: "{name} drug trial shows striking results",             impact: 0.18,  timing: "now" },
      { text: "{name} signs licensing deal with a big pharma partner", impact: 0.10, timing: "now" },
      { text: "{name} trial halted over patient safety concerns",     impact: -0.25, timing: "now" },
      { text: "FDA panel reviews {name} drug tomorrow amid doubts",   impact: -0.20, timing: "next" },
      { text: "Patent ruling goes against {name}",                    impact: -0.12, timing: "now" },
      { text: "{name} raises cash by selling new shares",             impact: -0.08, timing: "now" },
    ],
    restaurants: [
      { text: "{name} holiday drink goes viral on social media",      impact: 0.10,  timing: "now" },
      { text: "{name} to open 500 new cafés, sources say",            impact: 0.08,  timing: "next" },
      { text: "{name} same-store sales jump 12%",                     impact: 0.07,  timing: "now" },
      { text: "{name} subscription plan sells out in hours",          impact: 0.06,  timing: "now" },
      { text: "Food safety scare closes dozens of {name} cafés",      impact: -0.15, timing: "now" },
      { text: "Coffee bean prices hit a 10-year high",                impact: -0.08, timing: "now" },
      { text: "{name} baristas plan a nationwide strike tomorrow",    impact: -0.06, timing: "next" },
    ],
    utility: [
      { text: "{name} wins deal to power a new data center campus",   impact: 0.07,  timing: "next" },
      { text: "Regulators approve {name} rate increase",              impact: 0.05,  timing: "now" },
      { text: "{name} raises its dividend for the 20th straight year", impact: 0.04, timing: "now" },
      { text: "Wildfire lawsuit to be filed against {name} tomorrow", impact: -0.12, timing: "next" },
      { text: "Heat wave causes blackouts across {name}'s service area", impact: -0.07, timing: "now" },
      { text: "Regulators reject {name}'s new power plant",           impact: -0.06, timing: "now" },
      { text: "Rising interest rates weigh on utility stocks",        impact: -0.04, timing: "now" },
    ],
    games: [
      { text: "{name}'s new game sells 10 million copies in a week",  impact: 0.18,  timing: "now" },
      { text: "Trailer for {name}'s next game breaks view records",   impact: 0.08,  timing: "now" },
      { text: "{name} to announce a movie deal for its top franchise", impact: 0.06, timing: "next" },
      { text: "{name} delays its biggest game of the year",           impact: -0.15, timing: "now" },
      { text: "Players review-bomb {name}'s latest release",          impact: -0.10, timing: "now" },
      { text: "Leak suggests {name}'s holiday game is unfinished",    impact: -0.08, timing: "next" },
      { text: "Reports of layoffs and crunch at {name}",              impact: -0.06, timing: "now" },
    ],
    crypto: [
      { text: "Bitcoin surges to an all-time high",                   impact: 0.20,  timing: "now" },
      { text: "{name} expected to win approval to operate in Europe", impact: 0.12,  timing: "next" },
      { text: "Celebrity investor reveals a big stake in {name}",     impact: 0.10,  timing: "now" },
      { text: "Hackers drain $300M from {name} wallets",              impact: -0.25, timing: "now" },
      { text: "SEC set to sue {name} over unregistered securities",   impact: -0.20, timing: "next" },
      { text: "Crypto prices crash overnight",                        impact: -0.18, timing: "now" },
      { text: "{name} pauses withdrawals \"temporarily\"",            impact: -0.15, timing: "now" },
    ],
  },

  // All headlines that can appear for this company.
  poolFor(company) {
    return [...News.general, ...(News.bySector[company.sector] || [])];
  },

  // With probability `chance`, returns a headline for this company
  // (with its name filled in). Otherwise returns null: a quiet day.
  roll(chance, company) {
    if (Math.random() >= chance) return null;
    const pool = News.poolFor(company);
    const h = pool[Math.floor(Math.random() * pool.length)];
    return { ...h, text: h.text.replaceAll("{name}", company.shortName) };
  },

  // Applies a headline's impact to a price, rounded to cents.
  applyImpact(price, impact) {
    return Math.max(0.01, Math.round(price * (1 + impact) * 100) / 100);
  },
};
