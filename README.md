# What am I actually paying? — modular multi-country build

A country-agnostic engine for the "what do I actually pay" concept: a product's
ticket price is decomposed into seller revenue, duties/excises, VAT, and the
income tax + social contributions on the wage you earned to buy it. Currently
ships with **Nederland** (`nl`), **United Kingdom** (`uk`),
**Schweiz** (`ch`) and **България** (`bg`).

## Layout

```
index.html            UI shell (static markup; all texts filled by the active country)
core.js               engine + UI: wage wedge, VAT extraction, panels, receipt, formatting
countries/nl.js       Netherlands: rates, presets, Dutch copy + NL duty mechanics
countries/uk.js       United Kingdom: mirrors the original UK page (regression-tested)
countries/ch.js       Switzerland: German copy, °Plato beer bands, no duty on wine
countries/bg.js       Bulgaria: Bulgarian copy, °Plato beer, spirits per hl pure alcohol
test/uk_check.mjs     verifies the UK port reproduces the original page's math exactly
test/nl_check.mjs     verifies the NL module against the sourced 2026 rates
test/ch_check.mjs     verifies the CH module against the sourced 2026 rates
test/bg_check.mjs     verifies the BG module against the sourced 2026 rates
```

The live site is at **https://pepijnfrenken.github.io/what-am-i-paying/**
(`?c=nl` | `?c=uk` | `?c=ch` | `?c=bg` switches country).
No dependencies, no build step — for local development, open `index.html`
directly in a browser (`file://` works).

## UI

Light-only theme (no dark variant). The country bar shows a language control
for countries that ship an English mirror (`copyEn`): `?lang=en` selects
English, `?lang=native` (default) the native copy, and the choice survives
country switches. Countries without `copyEn` (UK, native == English) hide the
control. Duty-line labels follow the language via `state.lang`. A **"Show all"
comparison view** (NL: "Toon alles", EN: "Show all") tables every preset of the
active country — ticket price, what it could cost, what it really costs, % to
the government — with the current marginal rate; clicking a row loads that item.
A second tab, **"Where does my money go?"** (NL: "Waar gaat mijn geld heen?"),
starts from your **gross yearly income** (default: the country's documented
modal salary). The income tax is computed with per-country annual functions
from the sourced rules — NL loonheffing (brackets minus arbeids- and
algemene-heffingskorting), UK income tax **without NI** (labelled, gov.uk
2026/27 thresholds), BG ДОД (10 % over gross minus capped contributions),
CH direkte Bundessteuer (federal tariff only) — shown as a route line with
the **effective rate** (tax/gross), and you can switch to entering the tax
directly. The tax is compared against what you cost in social security
(per-capita baseline) and the surplus is split over the published 2026 budget
categories — data and split rule in `countries/where-goes-2026.md`, disclaimer
that taxes are not earmarked.

## Adding a country (4 steps)

1. **Copy the template:** `cp countries/nl.js countries/<cc>.js`.
2. **Register the config:** `code`, `name`, `currency` (`symbol`, `decimals`,
   `decimalComma`), `presets` (item list: name, default price, VAT level(s),
   `kind`, `panel` input defaults), `taxBands` (marginal-rate dropdown options),
   `panels` (which sub-options each input group offers, e.g. fuel types).
3. **Implement `computeDuties(state, cfg)`:** the country-specific duty math.
   Return `[{label, v}]` lines — labels are display strings, `v` is a money
   amount. `state.panel` carries the raw input values (strings — use `WAIP.num`).
   `state.kind` is the active product kind: `alcohol | drinks | cigs | fuel |
   energy | vape | custom | none`.
4. **Write `copy`:** every user-visible string (title, labels, hints, receipt
   labels, `take(res)` sentence, `notesRates`/`notesCaveats` with sources).
   Then include the file in `index.html` and pick it via `?c=<cc>`.

Kinds are UI shapes; a country only uses the kinds it needs, and a country can
extend the mechanics freely (duty math lives in the country file — see NL's
°Plato beer conversion vs UK's pure-alcohol rates for an example).

## Rules of the road

- **Rates must be sourced.** Each country's `notesRates` must name the source
  and effective date (Belastingdienst/Rijksoverheid/CBS for NL, gov.uk for UK).
  Set `ratesStatus: 'pending'` until an independent check confirms the numbers —
  the UI then shows a warning next to the duty inputs.
- **Money formatting is per-country** (`decimalComma` for NL, dot for UK).
- **The wage wedge is generic:** gross = price / (1 − marginal rate). Countries
  only supply the *band list*; the math lives in `core.js`.
- **Duty is taken off a VAT-inclusive price first** (VAT is charged on top of
  duty), then excluded from "what it could cost" — same convention as the
  original UK page.

## Verification

```bash
node test/uk_check.mjs    # UK math vs the original page's verbatim formulas
node test/nl_check.mjs    # NL 2026 sourced rates: hand-computed duty anchors (1e-9)
node test/ch_check.mjs    # CH 2026 sourced rates: °Plato beer, spirits, fuel anchors (1e-9)
node test/bg_check.mjs    # BG 2026 sourced rates: °Plato beer, rakiya, cigarettes anchors (1e-9)
node test/dom_check.mjs   # real-browser DOM check (headless chromium, node >= 21)
```

`uk_check.mjs` checks the modular UK module against the original page's
verbatim formulas (per-preset deltas must be 0) plus hand-computed anchor
values. `dom_check.mjs` serves the page with `python3 -m http.server` and
drives a headless Chromium over CDP: it asserts the UK/NL receipts (each
figure cross-checked against `WAIP.compute` in node, tol 0.005), country
switching, duty-panel re-rendering and recalculation, the NL comma-decimal
format, zero console errors, and zero failed subresources. Favicon 404s are
waived and reported. Set `WAIP_CHROME`, `WAIP_PORT`, `WAIP_DBG_PORT` to
override the browser binary or ports. When adding a country, add its own
checker next to it (compare `WAIP.compute` against independently computed
values for 3–4 presets).
