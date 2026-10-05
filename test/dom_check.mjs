// test/dom_check.mjs — real-browser verification of the modular what-am-i-paying site.
//
// Drives a headless Chromium over CDP (no npm deps; needs node >= 21 for the
// global WebSocket) against a local python http.server. Asserts:
//   1. UK (?c=uk): default item Mars bar -> £1.00 / -£0.17 / £0.83 / £1.39;
//      pint preset -> £8.06 / -£0.50 / £4.34. Every receipt figure is
//      cross-checked against WAIP.compute run in node (tol 0.005).
//   2. NL (?c=nl): page renders, pending-rates note visible, glas pils
//      €3,50 -> -€0,61 / €2,89, default Custom band (49,5%) -> gross €6,93,
//      and all money/percent output uses COMMA decimals.
//   3. Interactions via CDP: country switch uk<->nl (currency/labels/presets/
//      bands), item change re-renders the duty panel, band-tax custom toggles
//      #custom-rate-wrap both ways, duty-panel edits recalc the receipt, and
//      zero console errors / uncaught exceptions on both pages.
//   4. Zero failed subresources: index.html, core.js, countries/nl.js,
//      countries/uk.js all load 200; no Network.loadingFailed except the
//      (waived, documented) favicon.ico noise.
//
// Run:  node test/dom_check.mjs
// Env:  WAIP_CHROME=/path/to/chrome   WAIP_PORT=8174   WAIP_DBG_PORT=9334
// Exits non-zero on any failure.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.WAIP_PORT || 8174);
const DBPORT = Number(process.env.WAIP_DBG_PORT || 9334);
const BASE = `http://127.0.0.1:${PORT}`;
const TOL = 0.005;

// ---------------------------------------------------------------- node engine
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
eval(read('core.js'));
eval(read('countries/uk.js'));
eval(read('countries/nl.js'));
eval(read('countries/ch.js'));
eval(read('countries/bg.js'));
const WAIP = globalThis.WAIP;

function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
const money = s => parseFloat(String(s).replace(/[−\s]/g, '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
const fmt = (cfg, v) => WAIP.formatMoney(cfg, v);

// Expected receipt figures from the engine for the SAME inputs the UI holds.
function engineExpect(cfg, snap) {
  const preset = cfg.presets[snap.item];
  const marginal = snap.band === 'custom' ? num(snap.crate) / 100 : num(snap.band);
  const panel = Object.assign({}, snap.panel);
  const res = WAIP.compute(cfg, {
    price: num(snap.price), vatRate: num(snap.vat), marginal, kind: preset.kind, panel
  });
  return { res, state: { item: snap.item, price: snap.price, vat: snap.vat, band: snap.band, crate: snap.crate, marginal, kind: preset.kind } };
}

// ---------------------------------------------------------------- CDP client
const sleep = ms => new Promise(r => setTimeout(r, ms));

function findChrome() {
  if (process.env.WAIP_CHROME) return process.env.WAIP_CHROME;
  const cache = path.join(os.homedir(), '.cache', 'ms-playwright');
  for (const c of [
    path.join(cache, 'chromium-1234', 'chrome-linux64', 'chrome'),
    path.join(cache, 'chromium_headless_shell-1234', 'chrome-headless-shell-linux64', 'chrome-headless-shell')
  ]) if (fs.existsSync(c)) return c;
  return null;
}

let children = [];
function killAll() {
  for (const c of children) { try { c.kill('SIGKILL'); } catch { /* gone */ } }
  children = [];
}
process.on('exit', killAll);

// ---------------------------------------------------------------- checks
const checks = [];
let fails = 0;
function check(name, ok, detail = '') {
  checks.push({ name, ok });
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  [ ' + detail + ' ]' : ''}`);
}
function cross(name, cfg, snap, fields) {
  const { res } = engineExpect(cfg, snap);
  const val = { price: res.price, vat: -res.vat, duty: -res.duty, under: res.under, gross: res.gross, tax: res.itax };
  const bad = [];
  for (const f of fields) {
    const got = money(snap.r[f]);
    const exp = money(fmt(cfg, val[f]));
    if (!(Math.abs(got - exp) <= TOL)) bad.push(`${f}: dom=${snap.r[f]} engine=${fmt(cfg, val[f])}`);
  }
  check(name, bad.length === 0, bad.join(' | '));
}

// ---------------------------------------------------------------- main
async function main() {
  const chromePath = findChrome();
  if (!chromePath) { console.error('FAIL  no cached chromium found (set WAIP_CHROME)'); process.exitCode = 1; return; }

  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
  children.push(server);
  await sleep(800);

  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'waip-chrome-'));
  const chrome = spawn(chromePath, [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${DBPORT}`, `--user-data-dir=${prof}`, 'about:blank'
  ], { stdio: 'ignore' });
  children.push(chrome);

  // wait for the debugger endpoint
  let version = null;
  for (let i = 0; i < 200 && !version; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${DBPORT}/json/version`);
      version = await r.json();
    } catch { await sleep(100); }
  }
  if (!version) { console.error('FAIL  chromium debug port never came up'); process.exitCode = 1; return; }

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let idc = 0;
  const pending = new Map();
  let sessionId = null;
  const history = [];   // every session event (never cleared; drives NET checks)
  const errors = [];    // console/exceptions only (cleared per page)

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id != null) {
      const p = pending.get(m.id);
      if (p) { pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    } else if (m.sessionId === sessionId) {
      history.push(m);
      if (isErrorEvent(m)) errors.push(m);
    }
  };
  // Never hang on a dead browser: fail fast with a clear error.
  const failAll = why => {
    for (const [, p] of pending) p.reject(new Error(why));
    pending.clear();
  };
  ws.onclose = () => failAll('CDP websocket closed (browser died?)');
  ws.onerror = () => failAll('CDP websocket error');
  chrome.on('exit', code => failAll(`chromium exited unexpectedly (code ${code})`));

  // Log.entryAdded "Failed to load resource" entries are network-layer noise
  // (e.g. the favicon 404) — the Network domain below is the authoritative
  // failure channel, so those are waived here and policed there.
  function isErrorEvent(m) {
    if (m.method === 'Runtime.exceptionThrown') return true;
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') return true;
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/Failed to load resource/.test(m.params.entry.text)) return true;
    return false;
  }
  const formatError = ev => {
    if (ev.method === 'Runtime.exceptionThrown') {
      const d = ev.params.exceptionDetails;
      return `exception: ${d.text} ${(d.exception && d.exception.description) || ''}`.trim();
    }
    if (ev.method === 'Runtime.consoleAPICalled') {
      return 'console.error: ' + (ev.params.args || []).map(a => a.value ?? a.description ?? '').join(' ');
    }
    return `log.error: ${ev.params.entry.text}`;
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++idc;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(Object.assign({ id, method, params }, sessionId ? { sessionId } : {})));
  });

  // one page target
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const att = await send('Target.attachToTarget', { targetId, flatten: true });
  sessionId = att.sessionId;

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('page eval threw: ' + JSON.stringify(r.exceptionDetails.exception || {}));
    return r.result.value;
  };

  const snapshot = () => evaluate(`(() => {
    const g = id => document.getElementById(id);
    const txt = id => { const el = g(id); return el ? el.textContent : null; };
    const pan = {};
    for (const id of ['ml', 'abv', 'plato', 'cat', 'dml', 'dband', 'sticks', 'litres', 'fueltype', 'kwh', 'm3', 'cfix', 'cpct', 'vml']) {
      const el = g(id); if (el) pan[id] = el.value;
    }
    const dr = g('draught'); if (dr) pan.draughtOn = dr.checked;
    const bt = g('band-tax');
    return {
      item: g('item').value, price: g('price').value, vat: g('vat').value,
      band: bt.value, crate: g('crate') ? g('crate').value : null,
      panel: pan, dutyFieldsHidden: g('duty-fields').hidden,
      customWrapHidden: g('custom-rate-wrap').hidden,
      prefix: txt('price-prefix'), itemLabel: txt('item-label'),
      title: txt('title'), panelsText: g('panels').textContent,
      countries: Array.from(g('country').options).map(o => o.value + ':' + o.textContent),
      langVisible: !g('lang').hidden,
      langValue: g('lang').value,
      langOptions: Array.from(g('lang').options).map(o => o.textContent),
      showAllLabel: txt('show-all'),
      compareVisible: !g('compare').hidden,
      compareHeaders: Array.from(g('compare').querySelectorAll('th')).map(x => x.textContent),
      compareRows: g('compare').querySelectorAll('tbody tr').length,
      recVisible: !g('view-receipt').hidden,
      wgVisible: !g('view-where').hidden,
      wgIncome: g('wg-income').value,
      wgLabel: txt('wg-label'),
      wgBelowVisible: !g('wg-below').hidden,
      wgAboveVisible: !g('wg-above').hidden,
      wgRows: g('wg-rows').children.length,
      wgRowsText: Array.from(g('wg-rows').querySelectorAll('.wg-row')).map(r => r.textContent),
      wgBelowText: txt('wg-below-text'),
      wgExtraLabel: txt('wg-extra-label'),
      tabReceiptLabel: txt('tab-receipt'),
      tabWhereLabel: txt('tab-where'),
      bandOptions: Array.from(bt.options).map(o => o.value),
      itemOptions: Array.from(g('item').options).map(o => o.textContent),
      vatOptions: Array.from(g('vat').options).map(o => o.textContent),
      vatSelected: g('vat').selectedOptions[0] ? g('vat').selectedOptions[0].textContent : null,
      r: {
        item: txt('r-item'), price: txt('r-price'), vat: txt('r-vat'), duty: txt('r-duty'),
        under: txt('r-under'), gross: txt('r-gross'), could: txt('h-could'), real: txt('h-real'),
        vatL: txt('r-vat-l'), taxL: txt('r-tax-l'), tax: txt('r-tax'), dutySubs: txt('r-duty-subs')
      }
    };
  })()`);

  const act = (code) => evaluate(code).then(() => sleep(60));

  const waitReady = async () => {
    for (let i = 0; i < 150; i++) {
      try {
        if (await evaluate(`document.readyState === 'complete' && !!document.getElementById('r-item') && document.getElementById('r-item').textContent.trim().length > 0`)) return true;
      } catch { /* page mid-navigation */ }
      await sleep(100);
    }
    return false;
  };

  const navigate = async url => {
    await send('Page.navigate', { url });
    if (!await waitReady()) throw new Error('page never became ready: ' + url);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');

  const snapshotErrors = () => errors.splice(0).map(formatError);

  // ================================================================ UK phase
  await navigate(`${BASE}/?c=uk`);
  let snap = await snapshot();
  check('UK: default item is Mars bar', snap.item === 'mars' && snap.r.item === 'Mars bar (51g)', `${snap.item} / ${snap.r.item}`);
  check('UK: Mars receipt exact strings (£1.00 / -£0.17 / £0.83 / £1.39)',
    snap.r.price === '£1.00' && snap.r.vat === '−£0.17' && snap.r.under === '£0.83' && snap.r.gross === '£1.39',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.under} | ${snap.r.gross}`);
  check('UK: VAT line label present', snap.r.vatL === 'Less VAT (20%)', snap.r.vatL);
  check('UK: tax line label present', snap.r.taxL.includes('Plus income tax and NI'), snap.r.taxL);
  cross('UK: Mars receipt matches WAIP.compute', WAIP.countries.uk, snap, ['price', 'vat', 'under', 'gross', 'tax']);
  check('UK: no duty panel for Mars (duty-fields hidden)', snap.dutyFieldsHidden === true);
  check('UK: language control hidden (no copyEn)', snap.langVisible === false);
  check('UK: tabs labelled Receipt / Where does my money go?', snap.tabReceiptLabel === 'Receipt' && snap.tabWhereLabel === 'Where does my money go?',
    `${snap.tabReceiptLabel} | ${snap.tabWhereLabel}`);

  // pint preset
  let ok = await act(`(() => { const s = document.getElementById('item'); s.value = 'pint'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: pint preset figures (£8.06 / -£0.50 / £4.34)',
    snap.r.gross === '£8.06' && snap.r.duty === '−£0.50' && snap.r.under === '£4.34' && snap.r.could === '£4.34',
    `${snap.r.gross} | ${snap.r.duty} | ${snap.r.under} | ${snap.r.could}`);
  cross('UK: pint receipt matches WAIP.compute (draught)', WAIP.countries.uk, snap, ['price', 'vat', 'duty', 'under', 'gross', 'tax']);
  check('UK: duty sub-line rendered (Alcohol duty)', snap.r.dutySubs.includes('Alcohol duty'), snap.r.dutySubs.slice(0, 60));

  // interaction (b): item change re-renders the duty panel
  await act(`(() => { const s = document.getElementById('item'); s.value = 'cigs'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: mars->cigs shows the cigarette duty field', !snap.dutyFieldsHidden && 'sticks' in snap.panel, '');
  check('UK: cigs receipt matches WAIP.compute', (() => { const { res } = engineExpect(WAIP.countries.uk, snap); return Math.abs(money(snap.r.duty) - money(fmt(WAIP.countries.uk, -res.duty))) <= TOL; })(),
    `duty=${snap.r.duty} sticks=${snap.panel.sticks}`);

  // duty-panel edit must recalc the receipt (regression for the delegation fix)
  await act(`(() => { const el = document.getElementById('sticks'); el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  cross('UK: editing sticks (20->25) recalculates the receipt', WAIP.countries.uk, snap, ['duty', 'under', 'gross']);

  // back to Mars: panel disappears again
  await act(`(() => { const s = document.getElementById('item'); s.value = 'mars'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: cigs->mars hides the duty panel again', snap.dutyFieldsHidden === true && !('sticks' in snap.panel), '');

  // interaction (c): band-tax custom toggles the custom-rate wrap
  await act(`(() => { const s = document.getElementById('band-tax'); s.value = 'custom'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: band=Custom shows #custom-rate-wrap', snap.customWrapHidden === false, '');
  await act(`(() => { const s = document.getElementById('band-tax'); s.value = '0.28'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: band=Basic rate hides #custom-rate-wrap', snap.customWrapHidden === true, '');
  await act(`(() => { const s = document.getElementById('band-tax'); s.value = 'custom'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: band=Custom reveals #custom-rate-wrap again', snap.customWrapHidden === false, '');
  await act(`(() => { const s = document.getElementById('band-tax'); s.value = '0.28'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();

  // Big Mac preset (eat-in, 20% VAT, no duty)
  await act(`(() => { const s = document.getElementById('item'); s.value = 'bigmac'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK: Big Mac selectable, £5.49 @ 20% VAT, no duty',
    snap.r.item === 'Big Mac (eat-in)' && snap.r.price === '£5.49' && snap.r.vat === '−£0.92' && snap.r.duty === '£0.00',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty}`);

  // comparison view: toggle reveals one row per preset
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('UK: Show all reveals a table with one row per preset',
    snap.showAllLabel === 'Hide' && snap.compareVisible === true && snap.compareRows === snap.itemOptions.length,
    `rows=${snap.compareRows} presets=${snap.itemOptions.length}`);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('UK: toggling Show all off hides the table', snap.showAllLabel === 'Show all' && snap.compareVisible === false, snap.showAllLabel);

  // interaction (a): country select uk->nl swaps currency/labels/presets/bands
  await act(`(() => { const s = document.getElementById('country'); s.value = 'nl'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('UK->NL: currency prefix becomes €', snap.prefix === '€', snap.prefix);
  check('UK->NL: labels swap (Product)', snap.itemLabel === 'Product', snap.itemLabel);
  check('UK->NL: presets swap (Glas pils present)', snap.itemOptions.some(t => t.includes('Glas pils')), snap.itemOptions.join(', ').slice(0, 80));
  check('UK->NL: tax bands swap (9 sourced bands + Custom)', snap.bandOptions.length === 10 && snap.bandOptions[9] === 'custom' && snap.band === '0.42', snap.bandOptions.join(','));
  check('UK->NL: VAT options swap (Algemeen 21%)', snap.vatOptions.some(t => t.includes('Algemeen, 21%')), snap.vatOptions.join(', ').slice(0, 60));
  check('UK->NL: receipt recalculated (gross €5,78 @ 42% band)', snap.r.gross === '€5,78', snap.r.gross);
  await act(`(() => { const s = document.getElementById('country'); s.value = 'uk'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL->UK: currency/labels/presets restored', snap.prefix === '£' && snap.itemLabel === 'Item' && snap.r.item === 'Mars bar (51g)',
    `${snap.prefix} / ${snap.itemLabel} / ${snap.r.item}`);
  const ukErrs = snapshotErrors();
  check('UK: zero console errors / uncaught exceptions', ukErrs.length === 0, ukErrs.join(' | '));

  // ================================================================ NL phase
  await navigate(`${BASE}/?c=nl`);
  snap = await snapshot();
  check('NL: page renders (title)', snap.title.includes('Wat betaal ik eigenlijk?'), snap.title);
  check('NL: pending-rates note is gone (ratesStatus ok)', !snap.panelsText.includes('Tarieven worden op dit moment geverifieerd'), '');
  check('NL: default band 42,0% selected among 9 + Custom', snap.band === '0.42' && snap.bandOptions.length === 10 && snap.bandOptions[9] === 'custom', snap.bandOptions.join(','));
  check('NL: custom-rate wrap hidden with default band', snap.customWrapHidden === true);
  check('NL: glas pils at default band (€3,35 / -€0,58 / -€0,10 / €2,67 / €5,78 @ 42%)',
    snap.r.price === '€3,35' && snap.r.vat === '−€0,58' && snap.r.duty === '−€0,10' &&
    snap.r.under === '€2,67' && snap.r.gross === '€5,78' && snap.r.taxL === 'Plus inkomstenbelasting (42%)',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty} | ${snap.r.under} | ${snap.r.gross} | ${snap.r.taxL}`);
  check('NL: VAT line label present', snap.r.vatL === 'Min btw (21%)', snap.r.vatL);
  check('NL: duty sub-line rendered (Bieraccijns)', snap.r.dutySubs.includes('Bieraccijns'), snap.r.dutySubs.slice(0, 60));
  // brief's expectations are for the Custom 49,5% band (crate default)
  await act(`(() => { const s = document.getElementById('band-tax'); s.value = 'custom'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: Custom band shows #custom-rate-wrap (crate 49.5)', snap.customWrapHidden === false && snap.crate === '49.5', 'crate=' + snap.crate);
  check('NL: glas pils exact strings (€3,35 / -€0,58 / -€0,10 / €2,67 / €6,63)',
    snap.r.price === '€3,35' && snap.r.vat === '−€0,58' && snap.r.duty === '−€0,10' &&
    snap.r.under === '€2,67' && snap.r.could === '€2,67' && snap.r.gross === '€6,63' && snap.r.real === '€6,63',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty} | ${snap.r.under} | ${snap.r.gross}`);
  check('NL: comma decimals used (no dot money)', /^€\d+,\d{2}$/.test(snap.r.gross) && !snap.r.gross.includes('.'), snap.r.gross);
  check('NL: margin line in comma decimals (49,5%)', snap.r.taxL === 'Plus inkomstenbelasting (49,5%)', snap.r.taxL);
  check('NL: duty panel rendered (bier cat)', snap.panelsText.includes('Bier') && 'abv' in snap.panel, '');
  cross('NL: glas pils matches WAIP.compute (Custom 49,5%)', WAIP.countries.nl, snap, ['price', 'vat', 'duty', 'under', 'gross', 'tax']);
  // autoverzekering preset: vrijgesteld (0% btw), 21% assurantiebelasting
  await act(`(() => { const s = document.getElementById('item'); s.value = 'autoverzekering'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: autoverzekering — duty −€126,00 (comma) + assuredness line',
    snap.r.duty === '−€126,00' && /€126,00/.test(snap.r.duty) && snap.r.dutySubs.includes('Assurantiebelasting'),
    `${snap.r.duty} | ${snap.r.dutySubs.slice(0, 60)}`);
  check('NL: autoverzekering — Min btw (0%) en Vrijgesteld geselecteerd',
    snap.r.vatL === 'Min btw (0%)' && /Vrijgesteld/.test(snap.vatSelected), `${snap.r.vatL} | ${snap.vatSelected}`);
  check('NL: language control visible, native default', snap.langVisible === true && snap.langValue === 'native' && snap.langOptions.join(',') === 'Nederlands,English', snap.langOptions.join(','));
  // toggle to English: receipt re-renders, current item preserved
  await act(`(() => { const s = document.getElementById('lang'); s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: English toggle re-renders receipt in English (item preserved)',
    snap.langValue === 'en' && snap.r.item === 'Car insurance (annual premium, indicative)' &&
    snap.itemLabel === 'Item' && snap.r.vatL === 'Minus VAT (0%)' &&
    snap.r.dutySubs.includes('Assurance duty 21% of the premium') && snap.r.taxL.startsWith('Plus income tax'),
    `${snap.r.item} | ${snap.r.vatL} | ${snap.r.dutySubs.slice(0, 50)}`);
  check('NL: amounts stay comma-formatted in English (€126,00)', snap.r.duty === '−€126,00', snap.r.duty);
  await act(`(() => { const s = document.getElementById('lang'); s.value = 'native'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: switching back to native restores Dutch labels', snap.langValue === 'native' && snap.r.vatL === 'Min btw (0%)', snap.r.vatL);
  // Big Mac preset (eat-in, 9% food service, no duty)
  await act(`(() => { const s = document.getElementById('item'); s.value = 'bigmac'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: Big Mac selectable, €6,10 @ 9% VAT, no duty',
    snap.r.item === 'Big Mac (in het restaurant)' && snap.r.price === '€6,10' && snap.r.vat === '−€0,50' && snap.r.duty === '€0,00' && snap.r.vatL === 'Min btw (9%)',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty} | ${snap.r.vatL}`);
  // comparison view: native labels, row count, row click, collapse
  check('NL: Show all button labelled Toon alles', snap.showAllLabel === 'Toon alles' && snap.compareVisible === false, snap.showAllLabel);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('NL: Show all — native headers, one row per preset (Verberg state)',
    snap.showAllLabel === 'Verberg' && snap.compareVisible === true &&
    snap.compareHeaders.join('|') === 'Product|Prijs|Wat het kon kosten|Wat het écht kost|% naar de overheid' &&
    snap.compareRows === snap.itemOptions.length,
    `${snap.showAllLabel} | ${snap.compareHeaders.join('|')} | rows=${snap.compareRows}`);
  await act(`(() => { document.querySelector('#compare tbody tr[data-key="krat"]').click(); return true; })()`);
  snap = await snapshot();
  check('NL: clicking a comparison row loads that preset into the main view',
    snap.item === 'krat' && snap.r.item === 'Krat pils, supermarkt (24 × 30cl, 4,8%)',
    `${snap.item} | ${snap.r.item}`);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('NL: toggling off collapses the table and restores the label',
    snap.showAllLabel === 'Toon alles' && snap.compareVisible === false, snap.showAllLabel);
  // where-does-it-go tab: labels, default, below/at/above, state retention
  check('NL: tabs labelled Rekening / Waar gaat mijn geld heen?',
    snap.tabReceiptLabel === 'Rekening' && snap.tabWhereLabel === 'Waar gaat mijn geld heen?' && snap.recVisible === true && snap.wgVisible === false,
    `${snap.tabReceiptLabel} | ${snap.tabWhereLabel}`);
  await act(`(() => { document.getElementById('tab-where').click(); return true; })()`);
  snap = await snapshot();
  check('NL: where tab — default = baseline rounded to 100 (€6,900), Dutch label',
    snap.wgVisible === true && snap.recVisible === false && snap.wgIncome === '6900' && snap.wgLabel === 'Jouw inkomstenbelasting per jaar',
    `income=${snap.wgIncome} label=${snap.wgLabel}`);
  await act(`(() => { const el = document.getElementById('wg-income'); el.value = '5000'; el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: below baseline — gap note + amount', snap.wgBelowVisible === true && snap.wgAboveVisible === false && snap.wgBelowText.includes('Je betaalt minder dan je kost') && snap.wgBelowText.includes('€1878,02'),
    snap.wgBelowText);
  await act(`(() => { const el = document.getElementById('wg-income'); el.value = String(WAIP.budgetBaseline(WAIP.countries.nl)); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: at baseline — 100% social, zero extra', snap.wgAboveVisible === true && snap.wgRows === 9 && snap.wgExtraLabel.includes('€0,00'), `${snap.wgRows} | ${snap.wgExtraLabel}`);
  await act(`(() => { const el = document.getElementById('wg-income'); el.value = '9000'; el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('NL: above baseline — stacked bar legend with 9 categories',
    snap.wgAboveVisible === true && snap.wgBelowVisible === false && snap.wgRows === 9 && snap.wgRowsText.some(t => t.includes('Zorg')),
    `rows=${snap.wgRows}`);
  await act(`(() => { document.getElementById('tab-receipt').click(); return true; })()`);
  snap = await snapshot();
  check('NL: back on receipt tab — state kept (item krat, income 9000)',
    snap.recVisible === true && snap.wgVisible === false && snap.item === 'krat' && snap.wgIncome === '9000', `${snap.item} | ${snap.wgIncome}`);
  const nlErrs = snapshotErrors();
  check('NL: zero console errors / uncaught exceptions', nlErrs.length === 0, nlErrs.join(' | '));

  // ================================================================ CH phase
  await navigate(`${BASE}/?c=ch`);
  snap = await snapshot();
  check('CH: page renders (German title)', snap.title.includes('Was zahle ich wirklich?'), snap.title);
  check('CH: tabs labelled Kassenbon / Wohin geht mein Geld?', snap.tabReceiptLabel === 'Kassenbon' && snap.tabWhereLabel === 'Wohin geht mein Geld?',
    `${snap.tabReceiptLabel} | ${snap.tabWhereLabel}`);
  check('CH: country selector lists nl/uk/ch/bg', snap.countries.length === 4 && snap.countries.join(',') === 'nl:Nederland,uk:United Kingdom,ch:Schweiz,bg:България', snap.countries.join(','));
  check('CH: default item Bier 5 dl; gross CHF 11.08 (dot decimals)',
    snap.r.item === 'Bier 5 dl in der Bar, 12°P' && snap.r.gross === 'CHF 11.08' &&
    /^CHF \d+\.\d{2}$/.test(snap.r.gross) && !snap.r.gross.includes(','),
    `${snap.r.item} | ${snap.r.gross}`);
  check('CH: Biersteuer duty line −CHF 0.13', snap.r.duty === '−CHF 0.13', snap.r.duty);
  check('CH: VAT options (8.1 / 2.6 / 3.8 / 0)', snap.vatOptions.length === 4 && snap.vatOptions[0].includes('8.1 %'), snap.vatOptions.join(', ').slice(0, 80));
  check('CH: default band Zürich 32.3 %', snap.band === '0.323', snap.band);
  check('CH: plato field rendered next to ml', 'plato' in snap.panel && snap.panel.plato === '12' && 'ml' in snap.panel, `ml=${snap.panel.ml} plato=${snap.panel.plato}`);
  await act(`(() => { const s = document.getElementById('item'); s.value = 'wein'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('CH: Wein preset shows noDutyLabel text', snap.r.dutySubs.includes('Keine Bundessteuer auf Wein'), snap.r.dutySubs.slice(0, 70));
  check('CH: Wein receipt shows zero duty (formatMoney renders -0 without minus)', snap.r.duty === 'CHF 0.00', snap.r.duty);
  await act(`(() => { const s = document.getElementById('item'); s.value = 'zigaretten'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  cross('CH: Zigaretten matches WAIP.compute', WAIP.countries.ch, snap, ['price', 'vat', 'duty', 'under', 'gross', 'tax']);
  // Big Mac preset (eat-in, 8.1% MWST, no duty)
  await act(`(() => { const s = document.getElementById('item'); s.value = 'bigmac'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('CH: Big Mac selectable, CHF 7.20 @ 8.1% MWST, no duty',
    snap.r.item === 'Big Mac (im Restaurant)' && snap.r.price === 'CHF 7.20' && snap.r.vat === '−CHF 0.54' && snap.r.duty === 'CHF 0.00',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty}`);
  // comparison view: one row per preset, then collapse
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('CH: Show all reveals a table with one row per preset', snap.compareVisible === true && snap.compareRows === snap.itemOptions.length,
    `rows=${snap.compareRows} presets=${snap.itemOptions.length}`);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('CH: toggling off hides the table', snap.compareVisible === false);
  const chErrs = snapshotErrors();
  check('CH: zero console errors / uncaught exceptions', chErrs.length === 0, chErrs.join(' | '));

  // ================================================================ BG phase
  await navigate(`${BASE}/?c=bg`);
  snap = await snapshot();
  check('BG: page renders (Bulgarian title)', snap.title.includes('Какво всъщност плащам?'), snap.title);
  check('BG: tabs labelled Касов бон / Къде отива данъкът ми?', snap.tabReceiptLabel === 'Касов бон' && snap.tabWhereLabel === 'Къде отива данъкът ми?',
    `${snap.tabReceiptLabel} | ${snap.tabWhereLabel}`);
  check('BG: country selector lists nl/uk/ch/bg', snap.countries.length === 4 && snap.countries.join(',') === 'nl:Nederland,uk:United Kingdom,ch:Schweiz,bg:България', snap.countries.join(','));
  check('BG: default item бира; gross €5,15 (comma decimals) @ 22,4 %',
    snap.r.item.includes('Бира') && snap.r.gross === '€5,15' && /^€\d+,\d{2}$/.test(snap.r.gross),
    `${snap.r.item} | ${snap.r.gross}`);
  check('BG: default band 22,40 %', snap.band === '0.224', snap.band);
  check('BG: VAT options (20 / 9 / 0)', snap.vatOptions.length === 3 && snap.vatOptions[0].includes('20 %'), snap.vatOptions.join(', ').slice(0, 60));
  check('BG: plato field rendered (11°P preset)', 'plato' in snap.panel && snap.panel.plato === '11', `plato=${snap.panel.plato}`);
  await act(`(() => { const s = document.getElementById('item'); s.value = 'rakiya'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('BG: ракия duty line −€1,57 (comma)', snap.r.duty === '−€1,57', snap.r.duty);
  cross('BG: ракия matches WAIP.compute', WAIP.countries.bg, snap, ['price', 'vat', 'duty', 'under', 'gross', 'tax']);
  await act(`(() => { const s = document.getElementById('item'); s.value = 'hlyab'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('BG: хляб — 20 % ДДС (no reduced rate), no duty', snap.vatSelected.includes('20 %') && snap.r.vatL === 'Минус ДДС (20%)',
    `${snap.vatSelected} | ${snap.r.vatL}`);
  await act(`(() => { const s = document.getElementById('item'); s.value = 'tok'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('BG: ток preset noDutyLabel shown', snap.r.dutySubs.includes('освободени от акциз'), snap.r.dutySubs.slice(0, 70));
  // Big Mac preset (eat-in, 20% ДДС, no duty)
  await act(`(() => { const s = document.getElementById('item'); s.value = 'bigmac'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('BG: Big Mac selectable, €6,10 @ 20% ДДС, no duty',
    snap.r.item === 'Биг Мак (в ресторанта)' && snap.r.price === '€6,10' && snap.r.vat === '−€1,02' && snap.r.duty === '€0,00',
    `${snap.r.price} | ${snap.r.vat} | ${snap.r.duty}`);
  // comparison view: one row per preset, then collapse
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('BG: Show all reveals a table with one row per preset', snap.compareVisible === true && snap.compareRows === snap.itemOptions.length,
    `rows=${snap.compareRows} presets=${snap.itemOptions.length}`);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('BG: toggling off hides the table', snap.compareVisible === false);
  const bgErrs = snapshotErrors();
  check('BG: zero console errors / uncaught exceptions', bgErrs.length === 0, bgErrs.join(' | '));

  // ================================================================ language
  await navigate(`${BASE}/?c=nl&lang=en`);
  snap = await snapshot();
  check('LANG: ?lang=en loads NL already in English', snap.langValue === 'en' && snap.itemLabel === 'Item' && snap.r.vatL === 'Minus VAT (21%)',
    `${snap.langValue} | ${snap.r.vatL}`);
  // English comparison headers in the EN view
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('LANG: English compare headers on NL (Hide state)',
    snap.showAllLabel === 'Hide' && snap.compareVisible === true &&
    snap.compareHeaders.join('|') === 'Item|Price|What it could cost|What it really costs|% to the government',
    `${snap.showAllLabel} | ${snap.compareHeaders.join('|')}`);
  await act(`(() => { document.getElementById('show-all').click(); return true; })()`);
  snap = await snapshot();
  check('LANG: collapsing in English restores Show all', snap.showAllLabel === 'Show all' && snap.compareVisible === false, snap.showAllLabel);
  // English where view
  await act(`(() => { document.getElementById('tab-where').click(); return true; })()`);
  snap = await snapshot();
  check('LANG: English where view (label + tabs)',
    snap.wgLabel === 'Your income tax per year' && snap.tabReceiptLabel === 'Receipt' && snap.tabWhereLabel === 'Where does my money go?' && snap.wgIncome === '6900',
    `${snap.wgLabel} | ${snap.wgIncome}`);
  await act(`(() => { document.getElementById('tab-receipt').click(); return true; })()`);
  await act(`(() => { const s = document.getElementById('country'); s.value = 'ch'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('LANG: country switch preserves English choice (NL→CH)', snap.langValue === 'en' && snap.r.vatL === 'Minus VAT (8.1%)' && snap.langOptions.join(',') === 'Deutsch,English',
    `${snap.langValue} | ${snap.r.vatL} | ${snap.langOptions.join(',')}`);
  await act(`(() => { const s = document.getElementById('country'); s.value = 'uk'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  snap = await snapshot();
  check('LANG: switching to uk (no copyEn) forces native + hides control',
    snap.langVisible === false && snap.r.vatL === 'Less VAT (20%)', `${snap.langVisible} | ${snap.r.vatL}`);
  await navigate(`${BASE}/?c=bg&lang=en`);
  snap = await snapshot();
  check('LANG: ?lang=en loads BG in English (Cyrillic→English)', snap.langValue === 'en' && snap.r.vatL === 'Minus VAT (20%)' && snap.itemLabel === 'Product',
    `${snap.langValue} | ${snap.r.vatL}`);
  await navigate(`${BASE}/?c=ch&lang=native`);
  snap = await snapshot();
  check('LANG: explicit ?lang=native renders native (Minus MWST 8.1%)', snap.langValue === 'native' && snap.r.vatL === 'Minus MWST (8.1%)', `${snap.langValue} | ${snap.r.vatL}`);

  // ================================================================ network
  const resp = history.filter(ev => ev.method === 'Network.responseReceived').map(ev => ({ url: ev.params.response.url, status: ev.params.response.status }));
  // loadingFailed carries no URL; map requestId -> url from responseReceived
  const byReqId = new Map(history.filter(ev => ev.method === 'Network.responseReceived').map(ev => [ev.params.requestId, ev.params.response.url]));
  const failed = history.filter(ev => ev.method === 'Network.loadingFailed').map(ev => ({
    url: byReqId.get(ev.params.requestId) || '(unknown)',
    err: ev.params.errorText || 'failed',
    canceled: !!ev.params.canceled
  }));

  for (const file of ['index.html', 'core.js', 'countries/nl.js', 'countries/uk.js', 'countries/ch.js', 'countries/bg.js']) {
    const hits = resp.filter(r => file === 'index.html'
      ? (r.url === `${BASE}/?c=uk` || r.url === `${BASE}/?c=nl` || r.url === `${BASE}/?c=ch` || r.url === `${BASE}/?c=bg` || r.url.endsWith('/index.html'))
      : r.url.endsWith('/' + file));
    check(`NET: ${file} loaded 200`, hits.some(h => h.status === 200), hits.map(h => h.status).join(',') || 'not seen');
  }
  const bad404 = [];
  for (const r of resp) {
    if (r.status >= 400) {
      if (r.url.includes('favicon')) console.log('NOTE  waived favicon 404: ' + r.url);
      else bad404.push(`${r.status} ${r.url}`);
    }
  }
  check('NET: no 4xx/5xx subresources besides favicon', bad404.length === 0, bad404.join(' | '));
  const netFail = [];
  for (const f of failed) {
    if (f.url.includes('favicon')) { console.log(`NOTE  waived favicon failure: ${f.url} ${f.err}`); continue; }
    netFail.push(`${f.url} ${f.err}`);
  }
  check('NET: zero failed subresource loads (favicon waived)', netFail.length === 0, netFail.join(' | '));

  killAll();
  console.log(fails === 0 ? `\nDOM CHECK PASSED (${checks.length} assertions)` : `\n${fails} ASSERTION(S) FAILED`);
  process.exitCode = fails === 0 ? 0 : 1;
}

main().catch(err => { console.error('FATAL', err); killAll(); process.exitCode = 1; });