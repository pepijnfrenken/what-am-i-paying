// test/nl_check.mjs — verify the NL module against the sourced 2026 rates
// (countries/nl-rates-2026.md). All duty anchors are hand-computed from the
// doc's rates; tolerances are exact (1e-9).
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
eval(read('../core.js'));
eval(read('../countries/nl.js'));

const WAIP = globalThis.WAIP;
const nl = WAIP.countries.nl;
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

let fails = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`);
  if (!ok) fails++;
}
// total duty for a state (price/kind/panel as the UI would feed WAIP.compute)
const duty = st => WAIP.compute(nl, st).duty;
const lines = st => WAIP.compute(nl, st).dutyLines;
const sum = arr => arr.reduce((a, d) => a + d.v, 0);

check('ratesStatus is ok', nl.ratesStatus === 'ok', nl.ratesStatus);

// --- bier: hl x %vol x 8,12; %vol afgerond op 1 decimaal; min. 26,13/hl ----
check('glas pils 250ml 4,8% -> 0,09744', close(duty({ price: 3.35, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.8 } }), 0.09744));
check('krat 7200ml 4,8% -> 2,806272', close(duty({ price: 19.99, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'beer', ml: 7200, abv: 4.8 } }), 2.806272));
check('bier minimum bindt: 250ml 2,0% -> hl x 26,13 = 0,065325', close(duty({ price: 2.00, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 2.0 } }), 0.065325));
check('bier %vol naar beneden afgerond: 4,89% -> 4,8% -> 0,09744', close(duty({ price: 3.00, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.89 } }), 0.09744),
  'unfloored would be 0.0992672');

// --- wijn: alleen %vol kiest het tarief ------------------------------------
check('wijn 750ml 13% -> 0,717675 (95,69/hl)', close(duty({ price: 5.99, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 } }), 0.717675));
check('wijn grens = 8,5% -> 0,359625 (47,95/hl)', close(duty({ price: 5.00, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 8.5 } }), 0.359625));
check('wijn net boven 8,5% -> 95,69/hl', close(duty({ price: 5.00, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 8.6 } }), 0.0075 * 95.69));

// --- sterke drank: 18,27 per liter pure alcohol ----------------------------
check('jenever 700ml 35% -> 4,47615', close(duty({ price: 12.00, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 35 } }), 4.47615));

// --- sigaretten: spec + 5% van prijs; minimum 390,42/1.000 -----------------
{
  const st = { price: 11.50, vatRate: 0.21, marginal: 0.42, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  check('sigaretten 20st @11,50: spec 7,2424 + adv 0,575 = 7,8174', L.length === 2 && close(L[0].v, 7.2424) && close(L[1].v, 0.575) && close(sum(L), 7.8174),
    L.map(d => d.v).join(' + '));
}
{
  const st = { price: 15.00, vatRate: 0.21, marginal: 0.42, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  check('sigaretten 20st @15,00 (hoger): spec+adv = 7,9924, ad-valorem wint', L.length === 2 && close(sum(L), 7.9924), L.map(d => d.v).join(' + '));
}
{
  const st = { price: 10.00, vatRate: 0.21, marginal: 0.42, kind: 'cigs', panel: { sticks: 20 } };
  const L = lines(st);
  check('sigaretten 20st @10,00 (lager): minimum 7,8084 bindt, 1 regel', L.length === 1 && close(L[0].v, 7.8084), L.map(d => d.v).join(' + '));
}

// --- brandstof: accijns + voorraadheffing ----------------------------------
{
  const L = lines({ price: 2.45, vatRate: 0.21, marginal: 0.42, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } });
  check('benzine 1L: accijns 0,84469 + voorraadheffing 0,008 = 0,85269', L.length === 2 && close(L[0].v, 0.84469) && close(L[1].v, 0.008) && close(sum(L), 0.85269),
    L.map(d => `${d.label}=${d.v}`).join(' | '));
  check('diesel 1L -> 0,56029', close(duty({ price: 2.45, vatRate: 0.21, marginal: 0.42, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } }), 0.56029));
}

// --- energie: excl. btw bedragen -------------------------------------------
check('stroom 1 kWh -> 0,09161', close(duty({ price: 0.26, vatRate: 0.21, marginal: 0.42, kind: 'energy', panel: { kwh: 1, m3: 0 } }), 0.09161));
check('gas 1 m³ -> 0,60066', close(duty({ price: 1.50, vatRate: 0.21, marginal: 0.42, kind: 'energy', panel: { kwh: 0, m3: 1 } }), 0.60066));

// --- verbruiksbelasting alcoholvrije dranken -------------------------------
check('cola 330ml (regulier) -> 0,086229', close(duty({ price: 0.95, vatRate: 0.21, marginal: 0.42, kind: 'drinks', panel: { dml: 330, dband: 'regular' } }), 0.086229));
check('mineraalwater 330ml -> 0', duty({ price: 0.95, vatRate: 0.21, marginal: 0.42, kind: 'drinks', panel: { dml: 330, dband: 'water' } }) === 0);

// --- generieke loonwig- en btw-wiskunde ------------------------------------
{
  const got = WAIP.compute(nl, { price: 3.35, vatRate: 0.21, marginal: 0.42, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.8 } });
  check('btw = prijs x 21/121', close(got.vat, 3.35 * 0.21 / 1.21));
  check('bruto = prijs / (1 - 0,42)', close(got.gross, 3.35 / 0.58));
  check('under = prijs - btw - accijns', close(got.under, 3.35 - got.vat - got.duty));
  check('standaardband = 42,0%', nl.taxBands.find(b => b.selected).rate === 0.42);
  check('negen banden + Custom optie', nl.taxBands.length === 9);
}

// --- vliegticket / autoverzekering / boek (2026 presets) --------------------
{
  const got = WAIP.compute(nl, { price: 100, vatRate: 0.21, marginal: 0.42, kind: 'custom', panel: { cfix: 30.25, cpct: 0 }, preset: nl.presets.vliegticket });
  check('vliegticket: vliegbelasting 30,25 exact', close(got.duty, 30.25), `duty=${got.duty}`);
  check('vliegticket: regel fiks via fixLabel', got.dutyLines.length === 1 && got.dutyLines[0].label === 'Vliegbelasting (€ 30,25 per vertrekkende passagier)',
    got.dutyLines.map(l => l.label).join(' | '));
}
{
  const got = WAIP.compute(nl, { price: 600, vatRate: 0, marginal: 0.42, kind: 'custom', panel: { cfix: 0, cpct: 21 }, preset: nl.presets.autoverzekering });
  check('autoverzekering 600: assurantiebelasting 126,00, btw 0', close(got.duty, 126.00) && got.vat === 0, `duty=${got.duty} vat=${got.vat}`);
  check('autoverzekering: regel via pctLabel', got.dutyLines.length === 1 && got.dutyLines[0].label === 'Assurantiebelasting 21% van de premie',
    got.dutyLines.map(l => l.label).join(' | '));
}
{
  const got = WAIP.compute(nl, { price: 15, vatRate: 0.09, marginal: 0.42, kind: 'none', panel: {} });
  check('boek 15 @9%: btw = 15 x 9/109 = 1,2385..., accijns 0', close(got.vat, 15 * 0.09 / 1.09) && got.duty === 0, `vat=${got.vat} duty=${got.duty}`);
}
// fallback: custom state zonder preset houdt de generieke labels
{
  const got = WAIP.compute(nl, { price: 100, vatRate: 0.21, marginal: 0.42, kind: 'custom', panel: { cfix: 5, cpct: 10 } });
  check('custom zonder preset: generieke labels vallen terug', got.dutyLines.length === 2 &&
    got.dutyLines[0].label === 'Vaste heffing' && got.dutyLines[1].label === 'Heffing 10,0% van prijs',
    got.dutyLines.map(l => l.label).join(' | '));
}

// --- Big Mac 2026 (in-store, 9% food service) -------------------------------
{
  const got = WAIP.compute(nl, { price: 6.10, vatRate: 0.09, marginal: 0.42, kind: 'none', panel: {} });
  check('Big Mac 6,10 @9%: btw = 6,10 x 9/109 = 0,503670..., accijns 0', close(got.vat, 6.10 * 9 / 109) && got.duty === 0, `vat=${got.vat} duty=${got.duty}`);
}

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);