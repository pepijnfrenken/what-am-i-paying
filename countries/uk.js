/* countries/uk.js — United Kingdom.
 * Rates mirrored from the public "What am I actually paying?" page (UK, Oct 2026):
 *   VAT 20%; fuel duty 52.95p/L; alcohol duty (from 1 Feb 2026, per L pure alcohol):
 *   beer 3.5–8.4% £22.58; wine/spirits 3.5–8.4% £26.61; 8.5–22% £30.62; >22% £33.99;
 *   draught 3.5–8.4% £19.45; under 3.5% £9.96 (draught £8.58); cigarettes £394.09/1,000
 *   + 16.5% of retail, min £518.75/1,000; vaping £2.20/10ml; soft drinks levy 27.8p/L
 *   (8g+ sugar), 20.8p/L (5–8g).
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  const alcRate = (abv, cat, draught) => {
    if (abv <= 1.2) return 0;
    if (abv < 3.5) return draught ? 8.58 : 9.96;
    if (abv < 8.5) return draught ? 19.45 : (cat === 'beer' ? 22.58 : 26.61);
    if (abv <= 22) return 30.62;
    return 33.99;
  };

  const RATES = {
    sdil: { high: 0.278, std: 0.208, none: 0 },
    cig_spec_per_1000: 394.09,
    cig_advalorem: 0.165,
    cig_min_per_1000: 518.75,
    fuel_per_litre: 0.5295,
    vape_per_ml: 0.22
  };

  WAIP.registerCountry({
    code: 'uk',
    name: 'United Kingdom',
    ratesStatus: 'ok',
    currency: { symbol: '\u00a3', decimals: 2 },
    // TME FY2025-26 (€mn → £mn), see where-goes-2026.md
    budget: {
      social: 407300, population: 69483900,
      cats: {
        health: { v: 257500, label: 'Health (NHS)', labelEn: 'Health (NHS)' },
        rente: { v: 130300, label: 'Debt interest', labelEn: 'Debt interest' },
        onderwijs: { v: 125700, label: 'Education', labelEn: 'Education' },
        economie: { v: 94000, label: 'Transport, economy & science', labelEn: 'Transport, economy & science' },
        defensie: { v: 65400, label: 'Defence', labelEn: 'Defence' },
        wonen_milieu: { v: 56800, label: 'Housing, environment & culture', labelEn: 'Housing, environment & culture' },
        openbare_orde: { v: 55700, label: 'Police & justice', labelEn: 'Police & justice' },
        bestuur: { v: 35200, label: 'Government administration & foreign affairs', labelEn: 'Government administration & foreign affairs' }
      }
    },
    presets: {
      mars:    { name: 'Mars bar (51g)', price: 1.00, vat: 0.20, kind: 'none' },
      cola:    { name: 'Can of cola (330ml)', price: 1.50, vat: 0.20, kind: 'drinks', panel: { dml: 330, dband: 'high' } },
      pint:    { name: 'Pint of lager in a pub (4.5%)', price: 5.80, vat: 0.20, kind: 'alcohol', panel: { cat: 'beer', ml: 568, abv: 4.5, draught: true } },
      beer4:   { name: '4 cans of lager, supermarket (4 \u00d7 440ml, 4%)', price: 5.00, vat: 0.20, kind: 'alcohol', panel: { cat: 'beer', ml: 1760, abv: 4, draught: false } },
      wine:    { name: 'Bottle of wine (75cl, 13%)', price: 8.00, vat: 0.20, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13, draught: false } },
      gin:     { name: 'Bottle of gin (70cl, 40%)', price: 22.00, vat: 0.20, kind: 'alcohol', panel: { cat: 'wine', ml: 700, abv: 40, draught: false } },
      cigs:    { name: 'Pack of 20 cigarettes', price: 17.50, vat: 0.20, kind: 'cigs', panel: { sticks: 20 } },
      petrol:  { name: 'Petrol, 1 litre', price: 1.45, vat: 0.20, kind: 'fuel', panel: { litres: 1 } },
      vape:    { name: 'Vape liquid (10ml)', price: 5.00, vat: 0.20, kind: 'vape', panel: { vml: 10 } },
      bread:   { name: 'Loaf of bread (zero-rated)', price: 1.40, vat: 0, kind: 'none' },
      bigmac:  { name: 'Big Mac (eat-in)', price: 5.49, vat: 0.20, kind: 'none' },
      groceries: { name: 'Weekly groceries (average household)', price: 73.70, vat: 0.00, kind: 'none',
        hint: '\u00a3 73.70/week for a 2.36-person household (ONS FYE 2025: \u00a3 67.30 food + \u00a3 6.40 drinks). Most food is zero-rated; soft drinks and sweets are 20 % and carry the Soft Drinks Industry Levy (not included at 0 %).' },
      custom:  { name: 'Something else', price: 10.00, vat: 0.20, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    taxBands: [
      { label: 'Under \u00a312,570: 0%', rate: 0 },
      { label: 'Basic rate: 20% tax + 8% NI = 28%', rate: 0.28, selected: true },
      { label: 'Higher rate: 40% + 2% NI = 42%', rate: 0.42 },
      { label: '\u00a3100k\u2013\u00a3125,140 taper: 60% + 2% NI = 62%', rate: 0.62 },
      { label: 'Additional rate: 45% + 2% NI = 47%', rate: 0.47 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Beer' }, { v: 'wine', t: 'Wine, spirits or other' }], draught: true },
      drinks: { bands: [{ v: 'high', t: '8g or more' }, { v: 'std', t: '5g to under 8g' }, { v: 'none', t: 'Under 5g' }] },
      fuel: { types: null }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const out = [];
      if (kind === 'alcohol') {
        const abv = num(p.abv), ml = num(p.ml);
        const draught = !!p.draughtOn;
        const rate = alcRate(abv, p.cat, draught && abv < 8.5);
        const lpa = ml / 1000 * abv / 100;
        if (rate) out.push({ label: `Alcohol duty (${lpa.toFixed(3)} L pure alcohol \u00d7 \u00a3${rate.toFixed(2)})`, v: lpa * rate });
      } else if (kind === 'drinks') {
        const r = RATES.sdil[p.dband] || 0;
        if (r) out.push({ label: `Soft drinks levy (${(r * 100).toFixed(1)}p per litre)`, v: num(p.dml) / 1000 * r });
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        const spec = RATES.cig_spec_per_1000 * n / 1000, adv = RATES.cig_advalorem * price, min = RATES.cig_min_per_1000 * n / 1000;
        if (n <= 0) return out;
        if (spec + adv >= min) {
          out.push({ label: 'Tobacco duty, fixed per stick', v: spec });
          out.push({ label: 'Tobacco duty, 16.5% of price', v: adv });
        } else out.push({ label: 'Tobacco duty (minimum excise applies)', v: min });
      } else if (kind === 'fuel') {
        out.push({ label: 'Fuel duty (52.95p per litre)', v: num(p.litres) * RATES.fuel_per_litre });
      } else if (kind === 'vape') {
        out.push({ label: 'Vaping duty (\u00a32.20 per 10ml)', v: num(p.vml) * RATES.vape_per_ml });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: 'Fixed duty', v: f });
        if (pc) out.push({ label: `Duty at ${(pc * 100).toFixed(1)}% of price`, v: pc * price });
      }
      return out;
    },
    copy: {
      lang: 'en-GB',
      docTitle: 'What am I actually paying?',
      title: 'What am I actually paying?',
      lede: 'What you really pay is the gross wage you earn to buy something. What it could cost is the price with every tax removed: no duty, no VAT, and no income tax on the money you spend.',
      countryLabel: 'Country',
      itemLabel: 'Item',
      priceLabel: 'Ticket price',
      priceHint: 'Defaults are typical prices. Type in what you actually paid.',
      vatLabel: 'VAT rate',
      vatOptions: [
        { v: 0.20, t: 'Standard, 20%', selected: true },
        { v: 0.05, t: 'Reduced, 5% (e.g. home energy)' },
        { v: 0, t: 'Zero, 0% (most food, books, kids\u2019 clothes)' }
      ],
      dutyTitle: 'Duty details',
      taxTitle: 'Your tax',
      taxLabel: 'Marginal rate on your next \u00a3 of salary',
      taxHint: 'England, Wales and NI bands for 2026/27. Use Custom for Scotland, student loans or pension effects.',
      customRateLabel: 'Custom marginal rate (%)',
      customBandLabel: 'Custom',
      showAll: 'Show all',
      showAllHide: 'Hide',
      compare: { item: 'Item', price: 'Price', could: 'What it could cost', real: 'What it really costs', govt: '% to the government' },
      tabs: { receipt: 'Receipt', where: 'Where does my money go?' },
      wheregoes: {
        input: 'Your income tax per year',
        yourLabel: 'Your tax',
        baselineName: 'What you cost (per person)',
        socialBlock: 'What you cost yourself (social security)',
        extraBlock: 'What you contribute extra',
        belowText: 'You pay less than you cost \u2014 others cover the rest',
        legendTitle: 'What your extra contribution finances (budget split)',
        pctOfExtra: 'of the extra contribution',
        sources: 'Source: PESA 2026, Chapter 4 Table 4.2 + Chapter 1 Table 1.1 (gov.uk/government/statistics/public-expenditure-statistical-analyses-2026); ONS mid-2025 population 69,483,900.',
        scope: 'Whole public sector \u2014 Total Managed Expenditure FY2025-26; service spending TES \u00a31,227.6bn (excludes \u00a3132.3bn accounting adjustments).',
        disclaimer: 'Taxes are not earmarked; this split follows the published budget.'
      },
      noDuty: 'None on this item',
      ratesPending: '',
      vatLine: vr => `Less VAT (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Plus income tax and NI (${WAIP.pctRate(m)}%)`,
      mult: r => `You really pay <b>${r.toFixed(2)}\u00d7</b> what it could cost`,
      take: res => `Of the <b>${WAIP.formatMoney({ currency: { symbol: '\u00a3' } }, res.gross)}</b> you earn to buy this, <b>${WAIP.formatMoney({ currency: { symbol: '\u00a3' } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) goes in tax: <b>${WAIP.formatMoney({ currency: { symbol: '\u00a3' } }, res.itax)}</b> income tax and NI, <b>${WAIP.formatMoney({ currency: { symbol: '\u00a3' } }, res.vat)}</b> VAT and <b>${WAIP.formatMoney({ currency: { symbol: '\u00a3' } }, res.duty)}</b> duty.`,
      warnNeg: 'Duty and VAT come to more than this price. The price may be too low for this item, or the shop is selling at a loss.',
      notesTitle: 'Rates used (UK, October 2026)',
      notesCaveatsTitle: 'What this doesn\u2019t show',
      notesRates: 'VAT 20%. Fuel duty 52.95p per litre (5p cut extended to end of 2026). Alcohol duty from 1 Feb 2026, per litre of pure alcohol: beer 3.5\u20138.4% \u00a322.58; wine/spirits 3.5\u20138.4% \u00a326.61; any drink 8.5\u201322% \u00a330.62; over 22% \u00a333.99; draught 3.5\u20138.4% \u00a319.45; under 3.5% \u00a39.96 (draught \u00a38.58). Cigarettes from 1 Oct 2026: \u00a3394.09 per 1,000 plus 16.5% of retail price, minimum \u00a3518.75 per 1,000. Vaping duty from 1 Oct 2026: \u00a32.20 per 10ml. Soft drinks levy from 1 Apr 2026: 27.8p per litre (8g+ sugar), 20.8p (5\u20138g).',
      notesCaveats: 'The underlying price still contains taxes the seller\u2019s business pays (employer NI, business rates, corporation tax, import tariffs), so the true government share is higher than shown. Small-producer alcohol relief is ignored. VAT is charged on top of duty, which is why it is taken off the full ticket price first.',
      credit: 'Modular rebuild of the UK \u201cWhat am I actually paying?\u201d concept.',
      panels: {
        alcohol: { cat: 'Drink type', ml: 'Volume (ml)', abv: 'Strength (% ABV)', hint: 'Draught relief only applies under 8.5% ABV.', draught: 'Draught (served in a pub or bar)' },
        drinks: { ml: 'Volume (ml)', band: 'Sugar per 100ml' },
        cigs: { sticks: 'Number of cigarettes' },
        fuel: { litres: 'Litres' },
        energy: { kwh: 'Electricity (kWh)', m3: 'Gas (m\u00b3)' },
        custom: { fix: 'Fixed duty (\u00a3)', pct: 'Duty as % of price' }
      },
      receipt: {
        sub: 'True cost breakdown',
        hReal: 'What you really pay', hRealD: 'Gross wages earned to buy it',
        hCould: 'What it could cost', hCouldD: 'Price with no duty, VAT or income tax',
        priceLine: 'Ticket price',
        dutyLine: 'Less duties and levies',
        underLine: 'What it could cost',
        underSub: 'Ticket price less VAT and duties',
        taxPrefix: 'Income tax and NI',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Duty', legendVat: 'VAT', legendTax: 'Income tax/NI'
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
