// test/ch_check.mjs — verify the CH module against the sourced 2026 rates
// (countries/ch-rates-2026.md). All duty anchors are hand-computed; exact to 1e-9.
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
eval(read('../core.js'));
eval(read('../countries/ch.js'));

const WAIP = globalThis.WAIP;
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

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);