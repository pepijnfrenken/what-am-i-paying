/* core.js — country-agnostic engine + UI for "What am I actually paying?" / "Wat betaal ik eigenlijk?"
 *
 * Add a country by creating countries/<cc>.js that calls WAIP.registerCountry(cfg).
 * Config shape and a walkthrough: see README.md.
 *
 * Works from file:// (classic scripts, no bundler, no dependencies).
 */
(function (g) {
  const WAIP = (g.WAIP = g.WAIP || { countries: {}, order: [] });

  WAIP.registerCountry = function (cfg) {
    if (!cfg || !cfg.code) throw new Error('country config needs a code');
    WAIP.countries[cfg.code] = cfg;
    WAIP.order.push(cfg.code);
  };
  WAIP.get = code => WAIP.countries[code];

  const $ = id => document.getElementById(id);
  WAIP.num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const pct = v => (v * 100).toFixed(0) + '%';

  // language: 'native' | 'en' (set by mount from ?lang=). Countries that
  // provide cfg.copyEn (full English mirror) get the language control;
  // without copyEn the site always renders native.
  let lang = 'native';
  const labelCopy = cfg => (lang === 'en' && cfg.copyEn) ? cfg.copyEn : cfg.copy;
  const presetLabel = p => (lang === 'en' && p.nameEn) ? p.nameEn : p.name;
  const bandLabel = b => (lang === 'en' && b.labelEn) ? b.labelEn : b.label;
  const presetNoDuty = p => (lang === 'en' && p && p.noDutyLabelEn) ? p.noDutyLabelEn : (p && p.noDutyLabel);

  // marginal rate -> "28" or "37.5"; nukes float noise (0.28*100 is
  // 28.000000000000004, which used to print "28.0"). Country copies apply
  // their own decimal comma if needed.
  WAIP.pctRate = m => (m * 100).toFixed(1).replace(/\.0$/, '');

  WAIP.formatMoney = function (cfg, v) {
    const cur = cfg.currency || { symbol: '', decimals: 2 };
    const d = cur.decimals != null ? cur.decimals : 2;
    let s = Math.abs(v).toFixed(d);
    if (cur.decimalComma) s = s.replace('.', ',');
    return (v < 0 ? '\u2212' : '') + cur.symbol + s;
  };

  // ---------------------------------------------------------------- engine
  // state = { price, vatRate, marginal, kind, panel: { ...raw input values } }
  WAIP.compute = function (cfg, state) {
    const price = Math.max(0, WAIP.num(state.price));
    const vr = WAIP.num(state.vatRate);
    const vat = price * vr / (1 + vr);
    const dutyLines = (cfg.computeDuties ? cfg.computeDuties(state, cfg) : [])
      .filter(d => d && d.v != null && isFinite(d.v) && d.v > 0);
    const duty = dutyLines.reduce((a, d) => a + d.v, 0);
    const under = price - vat - duty;
    const m = WAIP.num(state.marginal);
    const gross = price / (1 - m);
    const itax = gross - price;
    const govt = vat + duty + itax;
    return { price, vatRate: vr, vat, dutyLines, duty, under, marginal: m, gross, itax, govt };
  };

  // ---------------------------------------------------------------- panels
  function inpFull(id, label, attrs) {
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" ${attrs || ''}></div>`;
  }
  function inpCell(id, label, attrs) {
    return `<div><label for="${id}">${label}</label><input id="${id}" type="number" ${attrs || ''}></div>`;
  }
  function selCell(id, label, options) {
    return `<div><label for="${id}">${label}</label><select id="${id}">` +
      options.map(o => `<option value="${o.v}">${o.t}</option>`).join('') + `</select></div>`;
  }

  const PANELS = {
    alcohol(cfg) {
      const L = labelCopy(cfg).panels.alcohol;
      let h = `<div class="field"><label for="cat">${L.cat}</label><select id="cat">` +
        cfg.panels.alcohol.cats.map(o => `<option value="${o.v}">${o.t}</option>`).join('') + `</select></div>`;
      if (cfg.panels.alcohol.plato) {
        // optional °Plato input (CH beer duty is per °Plato band): plato sits
        // next to ml; abv moves to its own row since spirits still tax pure alcohol
        h += `<div class="row field">${inpCell('ml', L.ml, 'min="0" step="1"')}${inpCell('plato', L.plato || '\u00b0Plato', 'min="0" step="0.1"')}</div>`;
        if (L.abv) h += inpFull('abv', L.abv, 'min="0" max="100" step="0.1"');
      } else {
        h += `<div class="row field">${inpCell('ml', L.ml, 'min="0" step="1"')}${inpCell('abv', L.abv, 'min="0" max="100" step="0.1"')}</div>`;
      }
      if (cfg.panels.alcohol.draught && L.draught) {
        h += `<div class="field"><label class="check"><input id="draught" type="checkbox"> ${L.draught}</label></div>`;
      }
      if (L.hint) h += `<div class="hint">${L.hint}</div>`;
      return h;
    },
    drinks(cfg) {
      const L = labelCopy(cfg).panels.drinks;
      let h = `<div class="row field">${inpCell('dml', L.ml, 'min="0" step="1"')}${selCell('dband', L.band, cfg.panels.drinks.bands)}</div>`;
      if (L.hint) h += `<div class="hint">${L.hint}</div>`;
      return h;
    },
    cigs(cfg) {
      return inpFull('sticks', labelCopy(cfg).panels.cigs.sticks, 'min="0" step="1"');
    },
    fuel(cfg) {
      const L = labelCopy(cfg).panels.fuel;
      let h = cfg.panels.fuel.types ? `<div class="field"><label for="fueltype">${L.type}</label><select id="fueltype">` +
        cfg.panels.fuel.types.map(o => `<option value="${o.v}">${o.t}</option>`).join('') + `</select></div>` : '';
      h += inpFull('litres', L.litres, 'min="0" step="0.1"');
      return h;
    },
    energy(cfg) {
      const L = labelCopy(cfg).panels.energy;
      let h = `<div class="row field">${inpCell('kwh', L.kwh, 'min="0" step="1"')}${inpCell('m3', L.m3, 'min="0" step="0.1"')}</div>`;
      if (L.hint) h += `<div class="hint">${L.hint}</div>`;
      return h;
    },
    vape(cfg) {
      return inpFull('vml', labelCopy(cfg).panels.vape.ml, 'min="0" step="1"');
    },
    custom(cfg) {
      const L = labelCopy(cfg).panels.custom;
      return `<div class="row field">${inpCell('cfix', L.fix, 'min="0" step="0.01"')}${inpCell('cpct', L.pct, 'min="0" step="0.1"')}</div>`;
    }
  };

  const INPUT_IDS = ['ml', 'abv', 'plato', 'cat', 'dml', 'dband', 'sticks', 'litres', 'fueltype', 'kwh', 'm3', 'cfix', 'cpct', 'vml'];

  function collectState(cfg) {
    const preset = cfg.presets[$('item').value];
    const marginal = $('band-tax').value === 'custom'
      ? WAIP.num($('crate').value) / 100
      : WAIP.num($('band-tax').value);
    const panel = {};
    for (const id of INPUT_IDS) { const el = $(id); if (el) panel[id] = el.value; }
    const dr = $('draught');
    if (dr) panel.draughtOn = dr.checked;
    return { preset, lang, price: WAIP.num($('price').value), vatRate: WAIP.num($('vat').value), marginal, kind: preset.kind, panel };
  }

  function renderPanels(cfg, kind) {
    const host = $('panels');
    const C = labelCopy(cfg);
    const pending = (cfg.ratesStatus && cfg.ratesStatus !== 'ok') ? `<div class="hint" style="color:#8A5A22">${C.ratesPending}</div>` : '';
    if (kind === 'none' || !PANELS[kind]) { host.innerHTML = ''; $('duty-fields').hidden = true; return; }
    host.innerHTML = PANELS[kind](cfg) + pending;
    $('duty-fields').hidden = false;
  }

  // ---------------------------------------------------------------- receipt
  function render(cfg, state, res) {
    const C = labelCopy(cfg), f = v => WAIP.formatMoney(cfg, v);
    const R = C.receipt;
    $('r-item').textContent = presetLabel(state.preset);
    $('r-sub').textContent = R.sub;
    $('r-price').textContent = f(res.price);
    $('r-vat-l').textContent = C.vatLine(res.vatRate);
    $('r-vat').textContent = f(-res.vat);
    $('r-duty').textContent = f(-res.duty);
    $('r-duty-subs').innerHTML = res.dutyLines.length
      ? res.dutyLines.map(d => `<div class="line sub"><span>${d.label}</span><span>${f(d.v)}</span></div>`).join('')
      : `<div class="line sub"><span>${presetNoDuty(state.preset) || C.noDuty}</span><span></span></div>`;
    $('r-under').textContent = f(res.under);
    $('r-under-sub').textContent = R.underSub;
    $('r-tax-l').textContent = C.taxLine(res.marginal);
    $('r-tax').textContent = f(res.itax);
    $('r-gross').textContent = f(res.gross);
    $('h-real').textContent = f(res.gross);
    $('h-could').textContent = f(Math.max(0, res.under));
    $('h-real-d').textContent = R.hRealD;
    $('h-could-d').textContent = R.hCouldD;
    $('mult').innerHTML = res.under > 0 ? C.mult(res.gross / res.under) : '';
    $('take').innerHTML = res.gross > 0 ? C.take(res) : '';
    const g2 = res.gross || 1;
    const parts = { under: Math.max(0, res.under), duty: res.duty, vat: res.vat, tax: res.itax };
    for (const [n, v] of Object.entries(parts)) {
      $('b-' + n).style.flexBasis = (v / g2 * 100) + '%';
      $('p-' + n).textContent = res.gross ? pct(v / g2) : '\u2013';
    }
    for (const [n, k] of [['under', 'legendUnder'], ['duty', 'legendDuty'], ['vat', 'legendVat'], ['tax', 'legendTax']]) {
      $('l-' + n).textContent = R[k];
    }
    const w = $('warn');
    if (res.under < 0) { w.hidden = false; w.textContent = C.warnNeg; } else w.hidden = true;
    document.querySelectorAll('.notes .rates').forEach(el => el.textContent = C.notesRates || '');
    document.querySelectorAll('.notes .caveats').forEach(el => el.textContent = C.notesCaveats || '');
    document.querySelectorAll('.notes .credit').forEach(el => el.textContent = C.credit || '');
  }

  // ---------------------------------------------------------------- mount
  WAIP.mount = function (defaultCode) {
    const csel = $('country');
    const langSel = $('lang');
    const params = new URLSearchParams(location.search);
    lang = params.get('lang') === 'en' ? 'en' : 'native';
    for (const c of WAIP.order) { const o = document.createElement('option'); o.value = c; o.textContent = WAIP.countries[c].name; csel.appendChild(o); }
    let cfg = WAIP.countries[defaultCode] || WAIP.countries[WAIP.order[0]];

    function loadPresets() {
      const selEl = $('item');
      selEl.innerHTML = '';
      for (const [k, p] of Object.entries(cfg.presets)) { const o = document.createElement('option'); o.value = k; o.textContent = presetLabel(p); selEl.appendChild(o); }
    }
    function loadTaxBands() {
      const el = $('band-tax');
      el.innerHTML = '';
      for (const b of cfg.taxBands) {
        const o = document.createElement('option'); o.value = String(b.rate); o.textContent = bandLabel(b);
        if (b.selected) o.selected = true;
        el.appendChild(o);
      }
      const o = document.createElement('option'); o.value = 'custom'; o.textContent = labelCopy(cfg).customBandLabel;
      el.appendChild(o);
    }
    function loadVat() {
      const el = $('vat');
      el.innerHTML = '';
      for (const v of labelCopy(cfg).vatOptions) {
        const o = document.createElement('option'); o.value = String(v.v); o.textContent = v.t;
        if (v.selected) o.selected = true;
        el.appendChild(o);
      }
    }
    function applyPreset(key) {
      const p = cfg.presets[key];
      $('price').value = p.price.toFixed(2);
      if (p.vat != null) $('vat').value = String(p.vat);
      renderPanels(cfg, p.kind);
      if (p.panel) for (const [id, val] of Object.entries(p.panel)) {
        const el = $(id);
        if (!el) continue;
        if (id === 'draught') el.checked = !!val;
        else el.value = val;
      }
      calc();
    }
    function applyStaticCopy() {
      const C = labelCopy(cfg);
      document.title = C.docTitle || C.title;
      document.documentElement.lang = C.lang || cfg.code;
      $('title').textContent = C.title;
      $('lede').textContent = C.lede;
      $('country-label').textContent = C.countryLabel;
      $('item-label').textContent = C.itemLabel;
      $('price-label').textContent = C.priceLabel;
      $('price-hint').textContent = C.priceHint;
      $('price-prefix').textContent = cfg.currency.symbol;
      $('vat-label').textContent = C.vatLabel;
      $('panels-title').textContent = C.dutyTitle;
      $('tax-title').textContent = C.taxTitle;
      $('tax-label').textContent = C.taxLabel;
      $('tax-hint').textContent = C.taxHint;
      $('crate-label').textContent = C.customRateLabel;
      $('r-head-real-label').textContent = C.receipt.hReal;
      $('r-head-could-label').textContent = C.receipt.hCould;
      $('r-head-price').textContent = C.receipt.priceLine;
      $('r-head-duty').textContent = C.receipt.dutyLine;
      $('r-head-under').textContent = C.receipt.underLine;
      $('r-head-gross').textContent = C.receipt.grossLine;
      $('notes-title').textContent = C.notesTitle;
      $('notes-caveats-title').textContent = C.notesCaveatsTitle;
    }
    function buildLangOptions() {
      langSel.innerHTML = '';
      $('lang-label').textContent = labelCopy(cfg).langLabel || 'Language';
      if (!cfg.copyEn) { langSel.hidden = true; return; }
      langSel.hidden = false;
      for (const [v, t] of [['native', cfg.langNative || 'Native'], ['en', 'English']]) {
        const o = document.createElement('option'); o.value = v; o.textContent = t; langSel.appendChild(o);
      }
      langSel.value = lang;
    }
    function renderCurrent(preserveItem) {
      if (lang === 'en' && !cfg.copyEn) lang = 'native';
      const cur = preserveItem && Object.prototype.hasOwnProperty.call(cfg.presets, $('item').value)
        ? $('item').value : Object.keys(cfg.presets)[0];
      applyStaticCopy(); loadVat(); loadTaxBands(); loadPresets(); buildLangOptions();
      $('item').value = cur;
      applyPreset(cur);
    }
    function calc() {
      const st = collectState(cfg);
      const res = WAIP.compute(cfg, st);
      render(cfg, st, res);
      $('custom-rate-wrap').hidden = $('band-tax').value !== 'custom';
    }
    function switchCountry(code) {
      cfg = WAIP.countries[code];
      renderCurrent(false);
    }

    csel.addEventListener('change', () => switchCountry(csel.value));
    langSel.addEventListener('change', () => { lang = langSel.value; renderCurrent(true); });
    $('item').addEventListener('change', () => applyPreset($('item').value));
    document.querySelectorAll('input,select').forEach(el => {
      if (el === langSel) return;
      el.addEventListener('input', () => { if (el !== csel && el !== $('item')) calc(); });
      el.addEventListener('change', () => { if (el !== csel && el !== $('item')) calc(); });
    });
    $('band-tax').addEventListener('change', calc);
    // The duty-panel fields are re-created on every preset/country change, so
    // they never get the listeners above. Bind once on the static container
    // and delegate: every edit inside the duty panel recalculates the receipt.
    const panelsEl = $('panels');
    ['input', 'change'].forEach(ev => panelsEl.addEventListener(ev, () => calc()));

    csel.value = cfg.code;
    switchCountry(cfg.code);
  };
})(typeof window !== 'undefined' ? window : globalThis);
