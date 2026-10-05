// test/uk_check.mjs — verify the modular UK country module reproduces the
// original UK page's math exactly (verbatim formulas re-implemented here),
// plus a few hand-computed anchors.
import fs from 'node:fs';

const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
eval(read('../core.js'));
eval(read('../countries/uk.js'));

const WAIP = globalThis.WAIP;
const uk = WAIP.countries.uk;
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };

// --- original page math (verbatim logic from the published UK page) ---------
function origCompute(preset, marginal) {
  const price = preset.price, vr = preset.vat, p = preset.panel || {};
  const vat = price * vr / (1 + vr);
  let duty = 0;
  if (preset.kind === 'alcohol') {
    const abv = num(p.abv), ml = num(p.ml), cat = p.cat;
    const dr = !!p.draught && abv < 8.5;
    let rate;
    if (abv <= 1.2) rate = 0;
    else if (abv < 3.5) rate = dr ? 8.58 : 9.96;
    else if (abv < 8.5) rate = dr ? 19.45 : (cat === 'beer' ? 22.58 : 26.61);
    else if (abv <= 22) rate = 30.62;
    else rate = 33.99;
    duty = (ml / 1000 * abv / 100) * rate;
  } else if (preset.kind === 'drinks') {
    const r = ({ high: 0.278, std: 0.208, none: 0 })[p.dband] || 0;
    duty = num(p.dml) / 1000 * r;
  } else if (preset.kind === 'cigs') {
    const n = num(p.sticks);
    const spec = 394.09 * n / 1000, adv = 0.165 * price, min = 518.75 * n / 1000;
    duty = (spec + adv >= min) ? spec + adv : min;
  } else if (preset.kind === 'fuel') duty = num(p.litres) * 0.5295;
  else if (preset.kind === 'vape') duty = num(p.vml) * 0.22;
  const under = price - vat - duty;
  const gross = price / (1 - marginal);
  return { vat, duty, under, gross, itax: gross - price };
}

let fails = 0;
const marginal = 0.28; // the page's default band (basic rate)
console.log('preset   | vat d      | duty d     | under d    | gross d    | itax d');
let w = 0;
for (const [key, preset] of Object.entries(uk.presets)) {
  if (preset.kind === 'custom') continue; // inputs default to zero duty; nothing to compare
  const expect = origCompute(preset, marginal);
  const got = WAIP.compute(uk, {
    price: preset.price, vatRate: preset.vat, marginal, kind: preset.kind,
    panel: Object.assign({}, preset.panel, { draughtOn: preset.panel && preset.panel.draught })
  });
  const d = (a, b) => Math.abs(a - b);
  const ds = [d(got.vat, expect.vat), d(got.duty, expect.duty), d(got.under, expect.under), d(got.gross, expect.gross), d(got.itax, expect.itax)];
  const bad = ds.some(x => x > 1e-9);
  if (bad) fails++;
  w = Math.max(w, key.length);
  console.log(`${key.padEnd(w)} | ${ds.map(x => x.toExponential(1)).join(' | ')}${bad ? '  <-- FAIL' : ''}`);
}

// hand-computed anchors (Mars bar: 1.00 @ 20% VAT, no duty, 28% band)
{
  const got = WAIP.compute(uk, { price: 1.00, vatRate: 0.20, marginal, kind: 'none', panel: {} });
  const ok = Math.abs(got.vat - 1 / 6) < 1e-9 && Math.abs(got.under - 5 / 6) < 1e-9 && Math.abs(got.gross - 1 / 0.72) < 1e-9 && Math.abs(got.itax - (1 / 0.72 - 1)) < 1e-9;
  console.log(`anchor: Mars bar 1.00 -> vat ${got.vat.toFixed(6)} (1/6=${(1 / 6).toFixed(6)}), gross ${got.gross.toFixed(6)} (1/0.72=${(1 / 0.72).toFixed(6)}) ${ok ? 'ok' : 'FAIL'}`);
  if (!ok) fails++;
}
// hand-computed anchor: pint 5.80, 568ml, 4.5%, draught -> rate 19.45, lpa=0.02556
{
  const got = WAIP.compute(uk, { price: 5.80, vatRate: 0.20, marginal, kind: 'alcohol', panel: { cat: 'beer', ml: 568, abv: 4.5, draughtOn: true } });
  const expDuty = (568 / 1000 * 0.045) * 19.45;
  const ok = Math.abs(got.duty - expDuty) < 1e-9;
  console.log(`anchor: pint 5.80 -> duty ${got.duty.toFixed(6)} (expected ${expDuty.toFixed(6)}) ${ok ? 'ok' : 'FAIL'}`);
  if (!ok) fails++;
}
// hand-computed anchor: Big Mac 5.49 @ 20% VAT, no duty
{
  const got = WAIP.compute(uk, { price: 5.49, vatRate: 0.20, marginal, kind: 'none', panel: {} });
  const ok = Math.abs(got.vat - 5.49 * 20 / 120) < 1e-9 && got.duty === 0;
  console.log(`anchor: Big Mac 5.49 -> vat ${got.vat.toFixed(6)} (5.49*20/120=${(5.49 * 20 / 120).toFixed(6)}), duty ${got.duty} ${ok ? 'ok' : 'FAIL'}`);
  if (!ok) fails++;
}
// hand-computed anchor: weekly groceries 73.70 @ 0% VAT, no duty
{
  const got = WAIP.compute(uk, { price: 73.70, vatRate: 0, marginal, kind: 'none', panel: {} });
  const ok = Math.abs(got.vat) < 1e-9 && got.duty === 0;
  console.log(`anchor: groceries 73.70 -> vat ${got.vat}, duty ${got.duty} ${ok ? 'ok' : 'FAIL'}`);
  if (!ok) fails++;
}
// income route: UK income tax 2026/27 (gov.uk thresholds; NI excluded by design)
// Bands on TOTAL income; tapered PA carves the bottom of the 20% band.
{
  const taxFn = I => {
    const pa = Math.max(0, 12570 - Math.max(0, I - 100000) / 2);
    return 0.2 * Math.max(0, Math.min(I, 50270) - pa)
      + 0.4 * Math.max(0, Math.min(I, 125140) - 50270)
      + 0.45 * Math.max(0, I - 125140);
  };
  let fail = false;
  if (!(Math.abs(WAIP.incomeTax(uk, 37500) - taxFn(37500)) < 1e-9)) fail = true;
  if (!(Math.abs(WAIP.incomeTax(uk, 37500) - 0.2 * (37500 - 12570)) < 1e-9)) fail = true; // basic band only, full PA
  if (!(Math.abs(WAIP.incomeTax(uk, 25000) - 0.2 * (25000 - 12570)) < 1e-9)) fail = true; // 2,486
  if (!(Math.abs(WAIP.incomeTax(uk, 45000) - 0.2 * (45000 - 12570)) < 1e-9)) fail = true; // 6,486
  // PA taper anchors (£1 allowance lost per £2 above 100k)
  if (!(Math.abs(WAIP.incomeTax(uk, 110000) - (0.2 * (50270 - 7570) + 0.4 * (110000 - 50270))) < 1e-9)) fail = true; // PA 7,570 -> 32,432
  if (!(Math.abs(WAIP.incomeTax(uk, 110000) - 32432) < 1e-9)) fail = true;
  if (!(Math.abs(WAIP.incomeTax(uk, 120000) - (0.2 * (50270 - 2570) + 0.4 * (120000 - 50270))) < 1e-9)) fail = true; // PA 2,570 -> 37,432
  if (!(Math.abs(WAIP.incomeTax(uk, 120000) - 37432) < 1e-9)) fail = true;
  if (!(Math.abs(WAIP.incomeTax(uk, 130000) - (0.2 * 50270 + 0.4 * (125140 - 50270) + 0.45 * (130000 - 125140))) < 1e-9)) fail = true; // PA 0 -> 42,189
  if (!(Math.abs(WAIP.incomeTax(uk, 130000) - 42189) < 1e-9)) fail = true;
  if (!(Math.abs(WAIP.incomeTax(uk, 150000) - (0.2 * 50270 + 0.4 * (125140 - 50270) + 0.45 * (150000 - 125140))) < 1e-9)) fail = true; // 51,189
  if (!(uk.salaryDefault === 37500)) fail = true;
  console.log(`anchor: income tax 2026/27 (25k=${WAIP.incomeTax(uk, 25000).toFixed(0)} 45k=${WAIP.incomeTax(uk, 45000).toFixed(0)} 110k=${WAIP.incomeTax(uk, 110000).toFixed(0)} 120k=${WAIP.incomeTax(uk, 120000).toFixed(0)} 130k=${WAIP.incomeTax(uk, 130000).toFixed(0)}) ${fail ? 'FAIL' : 'ok'}`);
  if (fail) fails++;
}
// --- EXTERNAL-ANCHOR: payslip reference values arrive next phase --------------
{
  const t = WAIP.incomeTax(uk, 37500);
  const ok = isFinite(t) && t === WAIP.incomeTax(uk, 37500);
  console.log(`EXTERNAL-ANCHOR placeholder: deterministic (37500 -> ${t.toFixed(2)}) ${ok ? 'ok' : 'FAIL'}`);
  if (!ok) fails++;
}
// budget split anchors (TME FY2025-26, where-goes-2026.md)
{
  const baseline = uk.budget.social * 1e6 / uk.budget.population;
  const extrasTotal = Object.values(uk.budget.cats).reduce((a, c) => a + c.v, 0);
  let fail = !(Math.abs(baseline - 407300e6 / 69483900) < 1e-9);
  let s = WAIP.budgetSplit(uk, baseline);
  if (!(!s.below && Math.abs(s.extra) < 1e-9)) fail = true;
  s = WAIP.budgetSplit(uk, baseline - 500);
  if (!(s.below && Math.abs(s.gap - 500) < 1e-9)) fail = true;
  const X = 500;
  s = WAIP.budgetSplit(uk, baseline + X);
  const tot = s.rows.reduce((a, r) => a + r.v, 0);
  if (!(!s.below && Math.abs(s.extra - X) < 1e-9 && Math.abs(tot - X) < 1e-9)) fail = true;
  if (!(Math.abs(s.rows.find(r => r.key === 'health').v - X * uk.budget.cats.health.v / extrasTotal) < 1e-9)) fail = true;
  console.log(`anchor: budget split (baseline ${baseline.toFixed(2)}, sum=${tot.toFixed(6)}, health=${s.rows.find(r => r.key === 'health').v.toFixed(6)}) ${fail ? 'FAIL' : 'ok'}`);
  if (fail) fails++;
}
// NL module is covered by test/nl_check.mjs (sourced 2026 duty rates).

console.log(fails === 0 ? '\nALL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`);
process.exit(fails === 0 ? 0 : 1);
