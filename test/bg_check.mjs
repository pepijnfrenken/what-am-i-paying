// test/bg_check.mjs — verify the BG module against the sourced 2026 rates
// (countries/bg-rates-2026.md). Hand-computed anchors, exact to 1e-9.
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
eval(read('../core.js'));
eval(read('../countries/bg.js'));

const WAIP = globalThis.WAIP;
const bg = WAIP.countries.bg;
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

let fails = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`);
  if (!ok) fails++;
}
const duty = st => WAIP.compute(bg, st).duty;
const lines = st => WAIP.compute(bg, st).dutyLines;
const sum = arr => arr.reduce((a, d) => a + d.v, 0);

check('ratesStatus is ok', bg.ratesStatus === 'ok', bg.ratesStatus);

// --- бира: hl x °P x 0,77 --------------------------------------------------
check('бира 500 ml 11°P -> 0,5/100 x 11 x 0,77 = 0,04235', close(duty({ price: 4.00, vatRate: 0.2, marginal: 0.224, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 11 } }), 0.04235));
check('бира от магазина (500 ml, 11°P) -> също 0,04235', close(duty({ price: 1.00, vatRate: 0.2, marginal: 0.224, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 11 } }), 0.04235));

// --- ракия: € 562,42 на hl чист алкохол ------------------------------------
check('ракия 700 ml 40 % -> 0,0028 hl чист x 562,42 = 1,574776', close(duty({ price: 6.40, vatRate: 0.2, marginal: 0.224, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 40 } }), 1.574776));

// --- вино: без акциз ---------------------------------------------------------
{
  const got = WAIP.compute(bg, { price: 5.00, vatRate: 0.2, marginal: 0.224, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 12.5 } });
  check('вино -> 0 акциз', got.duty === 0 && got.dutyLines.length === 0);
  check('вино preset noDutyLabel', bg.presets.vino.noDutyLabel === 'Виното не се облага с акциз', bg.presets.vino.noDutyLabel);
}

// --- цигари: двете разклонения (минимум / специф.+адвалорен) ---------------
{
  const st = { price: 3.95, vatRate: 0.2, marginal: 0.224, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  // специфичен 77x20/1000 = 1,54; адвалорен 21 % x 3,95 = 0,8295; сбор 2,3695 < мин 2,40
  check('цигари 20 @ 3,95: минимумът 2,40 печели (1,54 + 0,8295 = 2,3695 < 2,40)', L.length === 1 && close(L[0].v, 2.40), L.map(d => d.v).join(' + '));
}
{
  const st = { price: 5.00, vatRate: 0.2, marginal: 0.224, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  check('цигари 20 @ 5,00: 1,54 + 1,05 = 2,59 > 2,40 -> специф.+адвалорен', L.length === 2 && close(sum(L), 2.59), L.map(d => d.v).join(' + '));
}

// --- горива -----------------------------------------------------------------
check('бензин 1 L -> 0,36302', close(duty({ price: 1.68, vatRate: 0.2, marginal: 0.224, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } }), 0.36302));
check('дизел 1 L -> 0,33029', close(duty({ price: 1.91, vatRate: 0.2, marginal: 0.224, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } }), 0.33029));

// --- ток: домакинствата без акциз -------------------------------------------
{
  check('ток -> 0 акциз', duty({ price: 0.154, vatRate: 0.2, marginal: 0.224, kind: 'energy', panel: { kwh: 1, m3: 0 } }) === 0);
  check('ток preset noDutyLabel', bg.presets.tok.noDutyLabel.includes('освободени от акциз'), bg.presets.tok.noDutyLabel);
}

// --- конфигурация -----------------------------------------------------------
check('ДДС опции: 3 (20/9/0), стандарт 20 % selected', bg.copy.vatOptions.length === 3 &&
  bg.copy.vatOptions[0].v === 0.2 && bg.copy.vatOptions[0].selected === true &&
  bg.copy.vatOptions.map(o => o.v).join(',') === '0.2,0.09,0', bg.copy.vatOptions.map(o => o.v).join(','));
check('2 ставки + Custom; default 22,40 %', bg.taxBands.length === 2 && bg.taxBands.find(b => b.selected).rate === 0.224,
  `rows=${bg.taxBands.length} default=${bg.taxBands.find(b => b.selected).rate}`);
check('десетична запетая, символ €', bg.currency.decimalComma === true && bg.currency.symbol === '€');
check('хлябът е 20 % ДДС (без намалено)', bg.presets.hlyab.vat === 0.2, String(bg.presets.hlyab.vat));

// --- генерална математика ---------------------------------------------------
{
  const got = WAIP.compute(bg, { price: 4.00, vatRate: 0.2, marginal: 0.224, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 11 } });
  check('ДДС = цена x 20/120', close(got.vat, 4.00 * 0.2 / 1.2));
  check('бруто = цена / (1 - 0,224)', close(got.gross, 4.00 / 0.776));
  check('under = цена - ДДС - акциз', close(got.under, 4.00 - got.vat - got.duty));
}

// --- Big Mac 2026 (eat-in, 20% ДДС) -----------------------------------------
{
  const got = WAIP.compute(bg, { price: 6.10, vatRate: 0.2, marginal: 0.224, kind: 'none', panel: {} });
  check('Big Mac 6,10 @20%: ДДС = 6,10 x 20/120 = 1,016667, акциз 0', close(got.vat, 6.10 * 20 / 120) && got.duty === 0, `vat=${got.vat} duty=${got.duty}`);
}

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);