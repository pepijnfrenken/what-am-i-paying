/* countries/index.js — the country registry. Single source of truth for which
 * countries exist, in which order they appear, and the per-country metadata
 * that core.js, the country selector and the language control read.
 *
 * Adding a country = one entry here + countries/<code>.js + its rates doc +
 * test/<code>_check.mjs. `node scripts/new-country.mjs <code>` writes all four
 * as stubs (see CONTRIBUTING.md). test/run_all.mjs and the DOM check discover
 * countries from this list, so CI never needs editing.
 *
 * ---------------------------------------------------------------------------
 * Registry entry (this file)
 * ---------------------------------------------------------------------------
 *   code        ISO-ish two-letter code; ?c=<code> selects it. Must equal the
 *               module's `code`.
 *   name        native name, shown in the country selector.
 *   nameEn      English name (docs, test output).
 *   langNative  label of the native option in the language control, e.g.
 *               'Nederlands'. null when native copy is English (control hidden).
 *   locale      BCP-47 tag of the native copy; becomes <html lang>. English
 *               copy (copyEn) always renders as 'en'.
 *   currency    { symbol, decimals, decimalComma } — money formatting.
 *               symbol includes any spacing ('CHF '); decimalComma swaps the
 *               decimal point for a comma.
 *   module      path of the country module (loaded by WAIP.boot in order).
 *   ratesDoc    path of the rates document: every rate in the module with its
 *               source, effective date and known uncertainties.
 *   docs        optional extra per-country source docs (prices, follow-ups).
 *               Cross-country docs (groceries-2026.md, bigmac-2026.md,
 *               where-goes-2026.md) are shared and not listed per country.
 *
 * The first entry is the default country when ?c= is absent or unknown.
 *
 * ---------------------------------------------------------------------------
 * Country module contract (countries/<code>.js)
 * ---------------------------------------------------------------------------
 * A classic script (no import/export) that calls WAIP.registerCountry(cfg).
 * The registry entry is merged into cfg, so a module never repeats name,
 * currency, langNative or locale. test/lib/contract.mjs enforces this list.
 *
 *   code            string, must have a registry entry.
 *   ratesStatus     'ok' once every rate is sourced and checked; anything else
 *                   shows copy.ratesPending next to the duty inputs.
 *   salaryDefault   gross yearly income preset on the "where does it go" tab.
 *   presets         { key: preset }. preset = { name, nameEn?, price, vat,
 *                   kind, panel?, hint?, hintEn?, noDutyLabel?,
 *                   noDutyLabelEn? }. `kind` picks the duty panel:
 *                   alcohol | drinks | cigs | fuel | energy | vape | custom |
 *                   none. `panel` holds the panel input defaults by input id
 *                   (ml, abv, plato, cat, draught, dml, dband, sticks,
 *                   litres, fueltype, kwh, m3, cfix, cpct, vml). `vat` is a
 *                   rate (0.21) or a non-numeric option value (treated as 0).
 *   taxBands        [{ label, labelEn?, rate, selected? }] marginal-rate
 *                   options for the receipt's wage wedge.
 *   panels          per-kind options: alcohol { cats: [{v,t}], draught,
 *                   plato }, drinks { bands: [{v,t}] }, fuel { types:
 *                   [{v,t}] | null }. Needed only for kinds the presets use.
 *   computeDuties(state, cfg)
 *                   -> [{ label, v }] duty lines in money. state = { price,
 *                   vatRate, marginal, kind, preset, lang, panel }; panel
 *                   values are raw input strings (use WAIP.num). Lines with
 *                   v <= 0 are dropped by the engine.
 *   incomeTax(gross)
 *                   -> annual income tax for a gross yearly income, from the
 *                   sourced rules in the rates doc. Pure function.
 *   budget          { social, population, cats: { key: { v, label,
 *                   labelEn? } } } in millions of the local currency, from
 *                   where-goes-2026.md.
 *   copy            every user-visible native string (see an existing module
 *                   or the scaffold for the full key list).
 *   copyEn          optional full English mirror of copy; its presence turns
 *                   on the language control.
 */
(function (g) {
  const WAIP = (g.WAIP = g.WAIP || {});

  WAIP.registry = [
    {
      code: 'nl',
      name: 'Nederland',
      nameEn: 'Netherlands',
      langNative: 'Nederlands',
      locale: 'nl',
      currency: { symbol: '€', decimals: 2, decimalComma: true },
      module: 'countries/nl.js',
      ratesDoc: 'countries/nl-rates-2026.md',
      docs: []
    },
    {
      code: 'uk',
      name: 'United Kingdom',
      nameEn: 'United Kingdom',
      langNative: null,
      locale: 'en-GB',
      currency: { symbol: '£', decimals: 2, decimalComma: false },
      module: 'countries/uk.js',
      ratesDoc: 'countries/uk-rates-2026.md',
      docs: ['countries/uk-tax-2026.md']
    },
    {
      code: 'ch',
      name: 'Schweiz',
      nameEn: 'Switzerland',
      langNative: 'Deutsch',
      locale: 'de-CH',
      currency: { symbol: 'CHF ', decimals: 2, decimalComma: false },
      module: 'countries/ch.js',
      ratesDoc: 'countries/ch-rates-2026.md',
      docs: ['countries/ch-prices-followup.md']
    },
    {
      code: 'bg',
      name: 'България',
      nameEn: 'Bulgaria',
      langNative: 'Български',
      locale: 'bg',
      currency: { symbol: '€', decimals: 2, decimalComma: true },
      module: 'countries/bg.js',
      ratesDoc: 'countries/bg-rates-2026.md',
      docs: ['countries/bg-prices-2026.md']
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
