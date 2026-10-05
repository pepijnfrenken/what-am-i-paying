// test/ch_check.mjs — verify the CH module against the sourced 2026 rates
// (countries/ch-rates-2026.md). All duty anchors are hand-computed; exact to 1e-9.
import { loadWAIP } from './lib/waip.mjs';

const WAIP = loadWAIP(['ch']);
const ch = WAIP.countries.ch;
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

let fails = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`);
  if (!ok) fails++;
}
const duty = st => WAIP.compute(ch, st).duty;
const lines = st => WAIP.compute(ch, st).dutyLines;
const sum = arr => arr.reduce((a, d) => a + d.v, 0);

check('ratesStatus is ok', ch.ratesStatus === 'ok', ch.ratesStatus);

// --- Bier: pauschal pro hl nach °Plato-Band --------------------------------
check('Bier 5 dl 12°P -> 0,005 hl x 25,32 = 0,1266', close(duty({ price: 7.50, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 12 } }), 0.1266));
check('6er-Pack (0,03 hl) 12°P -> 0,7596', close(duty({ price: 11.50, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'beer', ml: 3000, plato: 12 } }), 0.7596));
{
  const st = (plato) => ({ price: 5.00, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'beer', ml: 1000, plato } });
  check('Bier-Band: 10,0°P -> 16,88/hl (0,1688)', close(duty(st(10.0)), 0.1688));
  check('Bier-Band: 14,0°P -> 25,32/hl (0,2532)', close(duty(st(14.0)), 0.2532));
  check('Bier-Band: 14,1°P -> 33,76/hl (0,3376)', close(duty(st(14.1)), 0.3376));
}

// --- Spirituosen / Alkoholsteuer --------------------------------------------
check('Schnaps 70 cl 40 % -> 0,28 l rein x 29 = 8,12', close(duty({ price: 15.00, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 40 } }), 8.12));

// --- Wein und Strom: keine Bundessteuer -------------------------------------
{
  const got = WAIP.compute(ch, { price: 12.95, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 } });
  check('Wein -> 0 Bundessteuer', got.duty === 0 && got.dutyLines.length === 0);
  check('Wein-Preset trägt noDutyLabel', ch.presets.wein.noDutyLabel === 'Keine Bundessteuer auf Wein — kantonale Abgaben möglich', ch.presets.wein.noDutyLabel);
  check('Strom -> 0 Bundessteuer', duty({ price: 0.277, vatRate: 0.081, marginal: 0.323, kind: 'energy', panel: { kwh: 1, m3: 0 } }) === 0);
  check('Strom-Preset trägt noDutyLabel', ch.presets.strom.noDutyLabel === 'Keine Bundessteuer auf Strom', ch.presets.strom.noDutyLabel);
}

// --- Zigaretten -------------------------------------------------------------
{
  const st = { price: 9.40, vatRate: 0.081, marginal: 0.323, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  check('Zigaretten 20 @ 9,40: 2,3664 + 2,35 = 4,7164', L.length === 2 && close(L[0].v, 2.3664) && close(L[1].v, 2.35) && close(sum(L), 4.7164),
    L.map(d => d.v).join(' + '));
}

// --- Mineralölsteuer --------------------------------------------------------
check('Benzin 1 L -> 0,7682', close(duty({ price: 2.10, vatRate: 0.081, marginal: 0.323, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } }), 0.7682));
check('Diesel 1 L -> 0,7957', close(duty({ price: 2.41, vatRate: 0.081, marginal: 0.323, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } }), 0.7957));

// --- Konfiguration ----------------------------------------------------------
check('VAT-Optionen: 4 (8,1 / 2,6 / 3,8 / 0), Standard selected', ch.copy.vatOptions.length === 4 &&
  ch.copy.vatOptions[0].v === 0.081 && ch.copy.vatOptions[0].selected === true &&
  ch.copy.vatOptions.map(o => o.v).join(',') === '0.081,0.026,0.038,0', ch.copy.vatOptions.map(o => o.v).join(','));
check('8 Steuersätze + Custom; Default = Zürich 32,3 %', ch.taxBands.length === 8 && ch.taxBands.find(b => b.selected).rate === 0.323,
  `rows=${ch.taxBands.length} default=${ch.taxBands.find(b => b.selected).rate}`);
check('Dezimalpunkt (kein decimalComma)', ch.currency.decimalComma !== true && ch.currency.symbol === 'CHF ');

// --- generische Lohnkeil-/MWST-Mathematik -----------------------------------
{
  const got = WAIP.compute(ch, { price: 7.50, vatRate: 0.081, marginal: 0.323, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 12 } });
  check('MWST = Preis x 8,1/108,1', close(got.vat, 7.50 * 0.081 / 1.081));
  check('brutto = Preis / (1 - 0,323)', close(got.gross, 7.50 / 0.677));
  check('under = Preis - MWST - Bundesabgaben', close(got.under, 7.50 - got.vat - got.duty));
}

// --- Big Mac 2026 (eat-in, 8.1% MWST) ---------------------------------------
{
  const got = WAIP.compute(ch, { price: 7.20, vatRate: 0.081, marginal: 0.323, kind: 'none', panel: {} });
  check('Big Mac 7.20 @8.1%: MWST = 7.20 x 8.1/108.1 = 0.539500..., duty 0', close(got.vat, 7.20 * 8.1 / 108.1) && got.duty === 0, `vat=${got.vat} duty=${got.duty}`);
}

// --- Budget split (konsolidierte Staatsrechnung 2024, where-goes-2026.md) ----
{
  const baseline = WAIP.budgetBaseline(ch);
  check('wg: baseline = 104.845e6 / 9.006.600 = 11.641 ±1', Math.abs(baseline - 11641) <= 1, `baseline=${baseline.toFixed(2)}`);
  let s = WAIP.budgetSplit(ch, baseline);
  check('wg: amount = baseline -> 100% sozial (extra 0)', !s.below && close(s.extra, 0));
  s = WAIP.budgetSplit(ch, baseline - 3000);
  check('wg: unter baseline -> gap 3.000', s.below && close(s.gap, 3000));
  const zh100 = WAIP.incomeTax(ch, 100000, { place: 'zh' }); // 15.888,15
  s = WAIP.budgetSplit(ch, zh100);
  const sum = s.rows.reduce((a, r) => a + r.v, 0);
  check('wg: Zürich 100k — sozial = baseline, extra = 4.247 ±1, Summe = extra',
    !s.below && close(s.baseline, baseline) && Math.abs(s.extra - 4247) <= 1 && close(sum, s.extra), `extra=${s.extra.toFixed(2)}`);
  check('wg: Zürich 100k — 7 Kategorien, extras_total = 158.098',
    s.rows.length === 7 && close(Object.values(ch.budget.cats).reduce((a, c) => a + c.v, 0), 158098));
  check('wg: Kategorie proportional (bildung)', close(s.rows.find(r => r.key === 'bildung').v, s.extra * ch.budget.cats.bildung.v / 158098));
}

// --- Ort-wahl: Bundes- + Kantons- + Gemeindesteuer (ch-cantonal-2026.md) ------
{
  const total = (I, place) => WAIP.incomeTax(ch, I, { place });
  const cases = [['zh', 80000, 10730], ['zh', 100000, 15888], ['be', 80000, 16766], ['be', 100000, 22958],
    ['zg', 80000, 6488], ['zg', 100000, 10009], ['baar', 80000, 6312], ['baar', 100000, 9757]];
  for (const [place, inc, expect] of cases) {
    check(`Ort ${place} bei ${inc}: ${expect} ±1`, Math.abs(total(inc, place) - expect) <= 1, `engine=${total(inc, place).toFixed(2)}`);
  }
  // einfache Steuer spot checks (1e-6)
  check('einfache Steuer ZH 76.400 -> 4.046', close(WAIP.chSimpleTax('zh', 76400), 4046));
  check('einfache Steuer BE 6.600 -> 160,05', close(WAIP.chSimpleTax('be', 6600), 160.05));
  check('einfache Steuer ZG 94.800 -> 5.114,50', close(WAIP.chSimpleTax('zg', 94800), 5114.50));
  check('ZG rundet auf volle CHF 100 ab (142.688 -> 142.600)', close(WAIP.chSimpleTax('zg', 142688), 9669.50));
  check('Ort default = Zürich (Stadt); Bund bleibt erste Option', ch.placeDefault === 'zh' && ch.places.length === 5 && ch.places[0].key === 'bund');
}

// --- Wocheneinkäufe 2026 (reduced 2.6 %) ------------------------------------
{
  const got = WAIP.compute(ch, { price: 147.00, vatRate: 0.026, marginal: 0.323, kind: 'none', panel: {} });
  // 2,6 % MWST: bw = prijs x 2,6/102,6 (denominator 1.026, NOT 108.1)
  check('Wocheneinkäufe 147 @2.6%: MWST = 147 x 2.6/102.6 = 3,725146..., duty 0', close(got.vat, 147 * 2.6 / 102.6) && got.duty === 0, `vat=${got.vat} duty=${got.duty}`);
}

// --- Einkommensroute: direkte Bundessteuer 2026, Tarif 58c (ledig) -----------
// Unabhängige Schachtel-Integration aus ch-rates-2026.md; jeder Stufenbeitrag
// wird gemäß der offiziellen Tabelle auf 0,05 Franken nach unten gerundet.
{
  const caps = [15200, 33200, 43500, 58000, 76200, 82100, 108900, 141500, 185100, 793900];
  const m = [0, 0.0077, 0.0088, 0.0264, 0.0297, 0.0594, 0.066, 0.088, 0.11, 0.132];
  const bundessteuer = I => {
    let t = 0;
    for (let i = 0; i < caps.length; i++) {
      const w = Math.max(0, Math.min(I, caps[i]) - (i ? caps[i - 1] : 0));
      t += Math.floor(w * m[i] * 20 + 1e-9) / 20;
    }
    if (I > caps[9]) t += 0.115 * (I - caps[9]);
    return t;
  };
  check('Bundessteuer(100.000) = 2.684,35 (hand, Tabelle 0,05-Rundung)', close(WAIP.incomeTax(ch, 100000), bundessteuer(100000)) && close(WAIP.incomeTax(ch, 100000), 2684.35), `engine=${WAIP.incomeTax(ch, 100000).toFixed(4)}`);
  check('Bundessteuer(50.000) mittlere Stufen', close(WAIP.incomeTax(ch, 50000), bundessteuer(50000)));
  check('Bundessteuer(800.000): 13,2%-Stufe aktiv, 11,5% noch nicht', close(WAIP.incomeTax(ch, 800000), bundessteuer(800000)));
  check('Bundessteuer(1.000.000) Quirk: 11,5% über 793.900', close(WAIP.incomeTax(ch, 1000000), bundessteuer(1000000)) && close(WAIP.incomeTax(ch, 1000000), 114999.65));
  check('effektiv = Steuer / Brutto (nicht marginal)', close(WAIP.incomeTax(ch, 100000) / 100000, bundessteuer(100000) / 100000));
  check('salaryDefault = 100.000 (Zürich-Standardbande)', ch.salaryDefault === 100000, String(ch.salaryDefault));
}
// --- EXTERNAL-ANCHOR: ESTV Form 58c 2026 (Grundtarif, ledig) ------------------
// Unabhängige Werte aus der offiziellen Tariftabelle (0,05-Rundung pro Stufe);
// https://www.estv.admin.ch/de/steuertarife-zur-direkten-bundessteuer
{
  check('EXTERNAL: Bundessteuer(40.000) = 198,44 ±0,05', Math.abs(WAIP.incomeTax(ch, 40000) - 198.44) <= 0.05, `engine=${WAIP.incomeTax(ch, 40000).toFixed(4)}`);
  check('EXTERNAL: Bundessteuer(80.000) = 1.378,22 ±0,05', Math.abs(WAIP.incomeTax(ch, 80000) - 1378.22) <= 0.05, `engine=${WAIP.incomeTax(ch, 80000).toFixed(4)}`);
  check('EXTERNAL: Bundessteuer(130.000) = 5.128,55 ±0,05', Math.abs(WAIP.incomeTax(ch, 130000) - 5128.55) <= 0.05, `engine=${WAIP.incomeTax(ch, 130000).toFixed(4)}`);
}

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);