// test/lib/contract.mjs — structural check of a registered country config
// against the module contract documented in countries/index.js. Returns a
// list of problems (empty = ok). Catches what the engine would otherwise
// fail on silently or at click time: a missing panel label, a preset VAT
// rate with no matching option, a dead info button.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './waip.mjs';

const KINDS = ['alcohol', 'drinks', 'cigs', 'fuel', 'energy', 'vape', 'custom', 'none'];
// Panel input ids core.js reads (INPUT_IDS) plus the draught checkbox.
const PANEL_IDS = ['ml', 'abv', 'plato', 'cat', 'draught', 'dml', 'dband', 'sticks', 'litres', 'fueltype', 'kwh', 'm3', 'cfix', 'cpct', 'vml'];

const COPY_STRINGS = [
  'docTitle', 'title', 'lede', 'countryLabel', 'itemLabel', 'priceLabel', 'priceHint', 'vatLabel',
  'dutyTitle', 'taxTitle', 'taxLabel', 'taxHint', 'customRateLabel', 'customBandLabel',
  'showAll', 'showAllHide', 'infoAria', 'noDuty', 'warnNeg',
  'notesTitle', 'notesCaveatsTitle', 'notesRates', 'notesCaveats', 'credit'
];
const COPY_FUNCTIONS = ['vatLine', 'taxLine', 'mult', 'take'];
const COPY_GROUPS = {
  tabs: ['receipt', 'where'],
  compare: ['item', 'price', 'could', 'real', 'govt'],
  receipt: ['sub', 'hReal', 'hRealD', 'hCould', 'hCouldD', 'priceLine', 'dutyLine', 'underLine', 'underSub',
    'grossLine', 'legendUnder', 'legendDuty', 'legendVat', 'legendTax'],
  wheregoes: ['input', 'taxLabel', 'directToggle', 'grossName', 'taxName', 'directTag', 'incomeDefaultNote',
    'yourLabel', 'baselineName', 'socialBlock', 'extraBlock', 'belowText', 'legendTitle', 'pctOfExtra',
    'sources', 'scope', 'disclaimer']
};
// Labels each duty panel reads from copy.panels.<kind> (core.js PANELS).
const PANEL_LABELS = {
  alcohol: cfg => ['cat', 'ml'].concat(cfg.panels.alcohol && cfg.panels.alcohol.plato ? [] : ['abv']),
  drinks: () => ['ml', 'band'],
  cigs: () => ['sticks'],
  fuel: cfg => ['litres'].concat(cfg.panels.fuel && cfg.panels.fuel.types ? ['type'] : []),
  energy: () => ['kwh', 'm3'],
  vape: () => ['ml'],
  custom: () => ['fix', 'pct']
};
// Options each duty panel reads from cfg.panels.<kind>.
const PANEL_OPTIONS = { alcohol: 'cats', drinks: 'bands', fuel: 'types' };

// data-info keys used by index.html; every copy needs a text for each.
const INFO_KEYS = [...new Set([...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .matchAll(/data-info="([^"]+)"/g)].map(m => m[1]))];

const isStr = v => typeof v === 'string' && v.length > 0;
const isNum = v => typeof v === 'number' && Number.isFinite(v);

function checkCopy(cfg, C, where, kinds, out) {
  const bad = msg => out.push(`${where}: ${msg}`);
  for (const k of COPY_STRINGS) if (!isStr(C[k])) bad(`missing string '${k}'`);
  for (const k of COPY_FUNCTIONS) if (typeof C[k] !== 'function') bad(`missing function '${k}'`);
  for (const [g, keys] of Object.entries(COPY_GROUPS)) {
    if (!C[g]) { bad(`missing group '${g}'`); continue; }
    for (const k of keys) if (!isStr(C[g][k])) bad(`missing '${g}.${k}'`);
  }
  for (const k of INFO_KEYS) if (!C.info || !isStr(C.info[k])) bad(`missing 'info.${k}' (index.html has a data-info="${k}" button)`);
  if (cfg.copyEn && !isStr(C.langLabel)) bad(`missing 'langLabel' (needed when copyEn exists)`);
  if (cfg.ratesStatus !== 'ok' && !isStr(C.ratesPending)) bad(`missing 'ratesPending' (shown while ratesStatus is not 'ok')`);

  if (!Array.isArray(C.vatOptions) || C.vatOptions.length === 0) bad(`'vatOptions' must be a non-empty array`);
  else {
    const vals = C.vatOptions.map(o => String(o.v));
    for (const [key, p] of Object.entries(cfg.presets)) {
      if (p.vat != null && !vals.includes(String(p.vat))) bad(`preset '${key}' vat ${p.vat} has no matching vatOptions entry`);
    }
  }
  for (const kind of kinds) {
    if (kind === 'none') continue;
    const L = C.panels && C.panels[kind];
    if (!L) { bad(`missing 'panels.${kind}' (a preset uses kind '${kind}')`); continue; }
    for (const k of PANEL_LABELS[kind](cfg)) if (!isStr(L[k])) bad(`missing 'panels.${kind}.${k}'`);
  }
  try {
    const res = { price: 10, vat: 1, duty: 1, under: 8, gross: 14, itax: 4, govt: 6, vatRate: 0.2, marginal: 0.3, dutyLines: [] };
    for (const [k, arg] of [['vatLine', 0.2], ['taxLine', 0.3], ['mult', 1.5], ['take', res]]) {
      if (typeof C[k] === 'function' && !isStr(C[k](arg))) bad(`'${k}()' must return a string`);
    }
  } catch (e) { bad(`copy function threw: ${e.message}`); }
}

export function checkContract(cfg, entry) {
  const out = [];
  const bad = msg => out.push(msg);
  if (!cfg) return [`module ${entry.module} did not call WAIP.registerCountry({ code: '${entry.code}', ... })`];
  if (!isStr(cfg.ratesStatus)) bad(`'ratesStatus' must be a string ('ok' when sourced)`);
  if (!isNum(cfg.salaryDefault)) bad(`'salaryDefault' must be a number`);
  if (typeof cfg.computeDuties !== 'function') bad(`'computeDuties(state, cfg)' missing`);
  if (typeof cfg.incomeTax !== 'function') bad(`'incomeTax(gross)' missing`);
  else if (!isNum(cfg.incomeTax(cfg.salaryDefault))) bad(`'incomeTax(salaryDefault)' must return a finite number`);

  const b = cfg.budget;
  if (!b || !isNum(b.social) || !isNum(b.population) || !b.cats || !Object.keys(b.cats).length) bad(`'budget' needs social, population and cats`);
  else for (const [k, c] of Object.entries(b.cats)) if (!isNum(c.v) || !isStr(c.label)) bad(`budget.cats.${k} needs v and label`);

  if (!Array.isArray(cfg.taxBands) || !cfg.taxBands.length) bad(`'taxBands' must be a non-empty array`);
  else cfg.taxBands.forEach((t, i) => { if (!isStr(t.label) || !isNum(t.rate)) bad(`taxBands[${i}] needs label and rate`); });

  const presets = cfg.presets || {};
  if (!Object.keys(presets).length) bad(`'presets' must not be empty`);
  const kinds = new Set();
  for (const [key, p] of Object.entries(presets)) {
    if (!isStr(p.name)) bad(`preset '${key}' needs a name`);
    if (!isNum(p.price)) bad(`preset '${key}' needs a numeric price`);
    if (!KINDS.includes(p.kind)) { bad(`preset '${key}' kind '${p.kind}' is not one of ${KINDS.join('|')}`); continue; }
    kinds.add(p.kind);
    for (const id of Object.keys(p.panel || {})) if (!PANEL_IDS.includes(id)) bad(`preset '${key}' panel input '${id}' is unknown`);
  }
  for (const kind of kinds) {
    const opt = PANEL_OPTIONS[kind];
    if (!opt) continue;
    const P = cfg.panels && cfg.panels[kind];
    if (!P) { bad(`missing 'panels.${kind}' (a preset uses kind '${kind}')`); continue; }
    if (kind !== 'fuel' && !Array.isArray(P[opt])) bad(`'panels.${kind}.${opt}' must be an array of {v, t}`);
  }
  if (typeof cfg.computeDuties === 'function') {
    for (const [key, p] of Object.entries(presets)) {
      try {
        const lines = cfg.computeDuties({ price: p.price, vatRate: 0, marginal: 0, kind: p.kind, preset: p, lang: 'native', panel: Object.assign({}, p.panel) }, cfg);
        if (!Array.isArray(lines)) bad(`computeDuties for preset '${key}' must return an array`);
      } catch (e) { bad(`computeDuties threw for preset '${key}': ${e.message}`); }
    }
  }

  if (!cfg.copy) bad(`'copy' missing`);
  else checkCopy(cfg, cfg.copy, 'copy', kinds, out);
  if (cfg.copyEn) checkCopy(cfg, cfg.copyEn, 'copyEn', kinds, out);
  return out;
}
