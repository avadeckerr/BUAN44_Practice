// =============================================================
// companies.js — the fictional stocks a game can be played with.
// Each new game picks one at random. To add a company, add an entry
// here and a matching list of headlines in news.js (same `sector`).
//
// trend:      expected daily return (0.0005 = +0.05% per day)
// volatility: typical daily move (0.02 = about ±2% per day)
// shortName:  what headlines call the company ("Helix shares jump...")
// =============================================================

const Companies = {
  list: [
    {
      ticker: "ACME", name: "Acme Rocket Co.", shortName: "Acme",
      sector: "aerospace", sectorLabel: "Aerospace",
      startPrice: 100, trend: 0.0005, volatility: 0.02,
    },
    {
      ticker: "HELX", name: "Helix Biotherapeutics", shortName: "Helix",
      sector: "biotech", sectorLabel: "Biotech",
      startPrice: 42, trend: 0.0003, volatility: 0.045,
    },
    {
      ticker: "BRWB", name: "Brewbot Coffee", shortName: "Brewbot",
      sector: "restaurants", sectorLabel: "Restaurants",
      startPrice: 28, trend: 0.0006, volatility: 0.015,
    },
    {
      ticker: "VOLT", name: "Voltline Power & Light", shortName: "Voltline",
      sector: "utility", sectorLabel: "Utility",
      startPrice: 65, trend: 0.0003, volatility: 0.008,
    },
    {
      ticker: "PXLR", name: "Pixelforge Games", shortName: "Pixelforge",
      sector: "games", sectorLabel: "Video games",
      startPrice: 75, trend: 0.0008, volatility: 0.03,
    },
    {
      ticker: "CRUM", name: "Crumble Crypto Exchange", shortName: "Crumble",
      sector: "crypto", sectorLabel: "Crypto",
      startPrice: 12, trend: 0.0002, volatility: 0.06,
    },
  ],

  // Picks a random company, avoiding `exclude` (last game's company)
  // so Play again always gives you something different.
  pick(exclude = null) {
    const choices = Companies.list.filter((c) => c !== exclude);
    return choices[Math.floor(Math.random() * choices.length)];
  },

  // Plain-English risk level from daily volatility.
  riskLabel(volatility) {
    if (volatility < 0.012) return "Calm";
    if (volatility < 0.03) return "Moderate";
    if (volatility < 0.05) return "Wild";
    return "Extreme";
  },
};
