#!/usr/bin/env node
// scripts/new-country.mjs — scaffold a new country.
//
//   node scripts/new-country.mjs <code> [--name "Native name"] [--name-en "English name"]
//                                       [--symbol "€"] [--locale "xx"]
//
// Writes four things, all marked with TODO where sourced data goes:
//   countries/<code>.js              stub module that satisfies the contract
//   countries/<code>-rates-<year>.md rates doc skeleton (sources + uncertainties)
//   test/<code>_check.mjs            checker; FAILS until you add sourced anchors
//   countries/index.js               registry entry appended
//
// The stub registers with ratesStatus 'pending' and zero rates, so the site
// keeps working while you fill it in, and CI stays red until the checker has
// hand-computed anchors and ratesStatus is 'ok'. See CONTRIBUTING.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const q = s => JSON.stringify(s).slice(1, -1).replace(/'/g, "\\'"); // safe inside '...'

// Pure: the file contents for a new country. Used by the CLI below and by
// test/run_all.mjs, which checks the stub module against the contract.
export function renderCountry({ code, name, nameEn, symbol, locale, year }) {
  const ratesDoc = `countries/${code}-rates-${year}.md`;
  const entry = { code, name, nameEn, langNative: null, locale, currency: { symbol, decimals: 2, decimalComma: false }, module: `countries/${code}.js`, ratesDoc, docs: [] };

  const registryEntry = `    {
      code: '${code}',
      name: '${q(name)}',
      nameEn: '${q(nameEn)}',
      langNative: null, // set to the native language name once the module has copyEn
      locale: '${q(locale)}',
      currency: { symbol: '${q(symbol)}', decimals: 2, decimalComma: false },
      module: 'countries/${code}.js',
      ratesDoc: '${ratesDoc}',
      docs: []
    }`;

  const moduleSrc = `/* countries/${code}.js — ${nameEn}.
 * TODO: one paragraph: tax year, where every number comes from (${ratesDoc}).
 *
 * Duty mechanics:
 *  - TODO: one line per duty (base, rate, minimums), as in the other modules.
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  // Every rate here must appear in ${ratesDoc} with its source.
  const RATES = {
    // TODO: e.g. beer_per_hl_per_vol: 0, spirit_per_l_alc: 0, cig: { spec_per_1000: 0, advalorem: 0 }
  };

  WAIP.registerCountry({
    code: '${code}',
    ratesStatus: 'pending', // set to 'ok' once every rate is sourced and checked
    salaryDefault: 0, // TODO: documented typical gross yearly salary
    // TODO: budget in millions of local currency (where-goes-${year}.md)
    budget: {
      social: 0, population: 0,
      cats: {
        todo: { v: 0, label: 'TODO: budget category', labelEn: 'TODO: budget category' }
      }
    },
    // TODO: one preset per item, prices sourced in the rates/prices doc.
    // kind: alcohol | drinks | cigs | fuel | energy | vape | custom | none
    presets: {
      custom: { name: 'Something else', price: 10.00, vat: 0, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // TODO: marginal-rate options for the receipt (income tax + contributions)
    taxBands: [
      { label: 'TODO: marginal rate band', rate: 0, selected: true }
    ],
    // Options for the duty panels your presets use, e.g.
    // alcohol: { cats: [{ v: 'beer', t: 'Beer' }], draught: false, plato: false }
    panels: {},
    // -> [{ label, v }] duty lines in money. state.panel holds raw input
    // strings (use num()); state.kind picks the branch.
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const out = [];
      // TODO: one branch per kind your presets use (see nl.js / ch.js)
      if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: 'Fixed levy', v: f });
        if (pc) out.push({ label: \`Levy \${(pc * 100).toFixed(1)}% of price\`, v: pc * price });
      }
      return out;
    },
    // TODO: annual income tax for a gross yearly income, from the sourced
    // rules in ${ratesDoc}. Comment the brackets and credits.
    incomeTax(gross) {
      return 0;
    },
    copy: {
      docTitle: 'What am I actually paying?',
      title: 'What am I actually paying?',
      lede: 'What you really pay is the gross wage you earn to buy something. What it could cost is the price with every tax removed: no duty, no VAT, and no income tax on the money you spend.',
      countryLabel: 'Country',
      itemLabel: 'Item',
      priceLabel: 'Price',
      priceHint: 'Defaults are typical prices. Type in what you actually paid.',
      vatLabel: 'VAT rate',
      vatOptions: [
        { v: 0, t: 'TODO: VAT rates (value must match each preset vat)', selected: true }
      ],
      dutyTitle: 'Duties & levies',
      taxTitle: 'Your tax',
      taxLabel: 'Marginal rate on your next unit of salary',
      taxHint: 'TODO: which rules the bands follow.',
      customRateLabel: 'Custom marginal rate (%)',
      customBandLabel: 'Custom',
      showAll: 'Show all',
      showAllHide: 'Hide',
      compare: { item: 'Item', price: 'Price', could: 'What it could cost', real: 'What it really costs', govt: '% to the government' },
      tabs: { receipt: 'Receipt', where: 'Where does my money go?' },
      infoAria: 'More information',
      info: {
        wedge: 'The gross wage you need to earn to buy this: price divided by (1 \\u2212 marginal rate). The rate is the band you picked \\u2014 an approximation for all of your income.',
        could: 'In order: duties come off the VAT-inclusive price first, then VAT, then income tax on your pay. This is not the shop\\u2019s purchase price.',
        multiplier: 'How many times more you earn than the price with all taxes removed.',
        duty: 'TODO: which levies besides VAT this country has. VAT is shown separately on the receipt.',
        marginal: 'The rate comes from the band you picked and applies to all of your income above the threshold \\u2014 an approximation, not a full bracket calculation.',
        route: 'TODO: which income tax the route computes and what it leaves out.',
        baseline: 'What the government spends per person on social security on average. If you pay less tax than that, others cover the rest.',
        split: 'Your extra tax is distributed proportionally over the budget categories per the published budget. Taxes are not earmarked.',
        effRate: 'The effective percentage is tax divided by gross income \\u2014 not the marginal rate of your top band.',
        compare: 'Every item at its default values with the selected marginal rate: price, what it could cost, what it really costs, and the share that goes to the government.'
      },
      wheregoes: {
        input: 'Gross yearly income',
        taxLabel: 'Your income tax per year',
        directToggle: 'or enter the tax directly',
        grossName: 'Gross salary',
        taxName: 'Income tax',
        directTag: '(entered directly)',
        incomeDefaultNote: 'TODO: where the default salary comes from.',
        yourLabel: 'Your tax',
        baselineName: 'What you cost (per person)',
        socialBlock: 'What you cost yourself (social security)',
        extraBlock: 'What you contribute extra',
        belowText: 'You pay less than you cost \\u2014 others cover the rest',
        legendTitle: 'What your extra contribution finances (budget split)',
        pctOfExtra: 'of the extra contribution',
        sources: 'TODO: budget and population sources.',
        scope: 'TODO: which part of government the budget covers.',
        disclaimer: 'Taxes are not earmarked; this split follows the published budget.'
      },
      noDuty: 'None on this item',
      ratesPending: 'Rates for this country are still being sourced and checked.',
      vatLine: vr => \`Less VAT (\${(vr * 100).toFixed(0)}%)\`,
      taxLine: m => \`Plus income tax (\${WAIP.pctRate(m)}%)\`,
      mult: r => \`You really pay <b>\${r.toFixed(2)}\\u00d7</b> what it could cost\`,
      take: (res, f) => \`Of the <b>\${f(res.gross)}</b> you earn to buy this, <b>\${f(res.govt)}</b> (\${(res.govt / res.gross * 100).toFixed(0)}%) goes to the government: <b>\${f(res.itax)}</b> income tax, <b>\${f(res.vat)}</b> VAT and <b>\${f(res.duty)}</b> duties.\`,
      warnNeg: 'Duties and VAT come to more than this price. The price may be too low for this item, or the shop is selling at a loss.',
      notesTitle: 'Rates used',
      notesCaveatsTitle: 'What this does not show',
      notesRates: 'TODO: every rate with its source and effective date.',
      notesCaveats: 'TODO: what the calculation leaves out.',
      credit: 'Modular rebuild of the UK \\u201cWhat am I actually paying?\\u201d concept.',
      panels: {
        custom: { fix: 'Fixed levy', pct: 'Levy as % of price' }
      },
      receipt: {
        sub: 'True cost breakdown',
        hReal: 'What you really pay', hRealD: 'Gross wages earned to buy it',
        hCould: 'What it could cost', hCouldD: 'Price with no duty, VAT or income tax',
        priceLine: 'Price',
        dutyLine: 'Less duties and levies',
        underLine: 'What it could cost',
        underSub: 'Price less VAT and duties',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Duties', legendVat: 'VAT', legendTax: 'Income tax'
      }
    }
    // copyEn: { ... } — add a full English mirror of copy if the native
    // copy is not English; it turns on the language control.
  });
})(typeof window !== 'undefined' ? window : globalThis);
`;

  const docSrc = `# ${nameEn} rates ${year}: sources for the calculator

TODO: one paragraph: tax year, date researched, main sources.

Every number in \`countries/${code}.js\` must appear here with its source. If a
number is an estimate, say so and say how it was derived.

## Indirect taxes and duties

| Levy | Rate | Applies to | Effective | Source |
|---|---|---|---|---|
| VAT standard | TODO | TODO | TODO | TODO (URL) |
| TODO | TODO | TODO | TODO | TODO (URL) |

## Wage side

### Income tax (where-does-my-money-go route)

TODO: brackets, allowances, credits and the rounding convention, with the
official source. Include at least one published worked example (an official
calculator or table value) that \`test/${code}_check.mjs\` can use as an
external anchor.

### Marginal bands (receipt)

| Band | Rate | Derivation | Source |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

## Presets

| Item | Price | VAT | As of | Source |
|---|---|---|---|---|
| TODO | TODO | TODO | TODO | TODO |

## Budget split

TODO: add a section to \`countries/where-goes-${year}.md\` (social spending,
population, categories, sources), following the existing countries.

## Uncertainties

- TODO: what is approximate, what is left out, what may change.
`;

  const checkerSrc = `// test/${code}_check.mjs — verify the ${nameEn} module against the sourced
// rates (${ratesDoc}). Every anchor is computed by hand from the doc,
// never by calling the module's own helpers.
import { loadWAIP } from './lib/waip.mjs';

const WAIP = loadWAIP(['${code}']);
const cfg = WAIP.countries.${code};
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

let fails = 0;
let anchors = 0;
function check(name, ok, detail = '') {
  console.log(\`\${ok ? 'ok' : 'FAIL'}  \${name}\${detail ? '  [' + detail + ']' : ''}\`);
  if (!ok) fails++;
}
// a hand-computed expectation from the rates doc
function anchor(name, got, expected, tol) {
  anchors++;
  check(name, close(got, expected, tol), \`got \${got}, expected \${expected}\`);
}
const duty = st => WAIP.compute(cfg, st).duty;

// TODO: duty anchors, one per mechanic, e.g.
// anchor('beer 500 ml 5% -> 0.2025', duty({ price: 4, vatRate: 0.2, marginal: 0.3, kind: 'alcohol', panel: { cat: 'beer', ml: 500, abv: 5 } }), 0.2025);

// TODO: income tax anchors, including one EXTERNAL published value, e.g.
// anchor('income tax 40,000 -> 5,432.10 (official calculator)', cfg.incomeTax(40000), 5432.10, 0.5);

check('ratesStatus is ok (every rate sourced and checked)', cfg.ratesStatus === 'ok', cfg.ratesStatus);
check('has hand-computed anchors (TODO: add them above)', anchors > 0, \`\${anchors} anchors\`);

console.log(fails === 0 ? '\\nALL CHECKS PASSED' : \`\\n\${fails} CHECK(S) FAILED\`);
process.exit(fails === 0 ? 0 : 1);
`;

  return { entry, registryEntry, files: { [`countries/${code}.js`]: moduleSrc, [ratesDoc]: docSrc, [`test/${code}_check.mjs`]: checkerSrc } };
}

// Insert a registry entry before the closing `];` of WAIP.registry.
export function addRegistryEntry(indexSrc, registryEntry) {
  const start = indexSrc.indexOf('WAIP.registry = [');
  const end = indexSrc.indexOf('\n  ];', start);
  if (start < 0 || end < 0) throw new Error('could not find the WAIP.registry array in countries/index.js');
  return indexSrc.slice(0, end) + ',\n' + registryEntry + indexSrc.slice(end);
}

function parseArgs(argv) {
  const opts = {};
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else rest.push(a);
  }
  return { code: rest[0], opts };
}

function main() {
  const { code, opts } = parseArgs(process.argv.slice(2));
  if (!code || !/^[a-z]{2,3}$/.test(code)) {
    console.error('usage: node scripts/new-country.mjs <code> [--name "Native"] [--name-en "English"] [--symbol "€"] [--locale "xx"]');
    console.error('       <code> is 2-3 lowercase letters, e.g. de');
    process.exit(2);
  }
  const indexPath = path.join(ROOT, 'countries/index.js');
  const indexSrc = fs.readFileSync(indexPath, 'utf8');
  if (new RegExp(`code: '${code}'`).test(indexSrc)) {
    console.error(`country '${code}' is already in countries/index.js`);
    process.exit(1);
  }
  const year = new Date().getFullYear();
  const { registryEntry, files } = renderCountry({
    code,
    name: opts.name || `TODO ${code.toUpperCase()}`,
    nameEn: opts['name-en'] || opts.name || `TODO ${code.toUpperCase()}`,
    symbol: opts.symbol || 'TODO ',
    locale: opts.locale || code,
    year
  });
  for (const rel of Object.keys(files)) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      console.error(`${rel} already exists; not overwriting anything`);
      process.exit(1);
    }
  }
  for (const [rel, src] of Object.entries(files)) {
    fs.writeFileSync(path.join(ROOT, rel), src);
    console.log(`wrote   ${rel}`);
  }
  fs.writeFileSync(indexPath, addRegistryEntry(indexSrc, registryEntry));
  console.log('updated countries/index.js (registry entry)');
  console.log(`
Next:
  1. Fill in ${Object.keys(files)[1]} with every rate, its source and uncertainties.
  2. Implement countries/${code}.js from that doc (RATES, presets, computeDuties,
     incomeTax, copy) and set ratesStatus: 'ok'.
  3. Add hand-computed anchors to test/${code}_check.mjs.
  4. Run node test/run_all.mjs until it passes. Open index.html?c=${code} to look.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
