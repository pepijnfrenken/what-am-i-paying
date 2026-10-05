# Contributing

Thanks for looking. The most useful contributions are new countries, corrections
to rates with a source attached, and bug reports with the exact inputs that
produced a wrong number.

## Run it locally

There is no build step and there are no dependencies.

- Open `index.html` in a browser. `file://` works.
- Or serve the folder: `python3 -m http.server` and open
  `http://localhost:8000/`.
- `?c=<code>` picks a country (`?c=ch`), `?lang=en` picks the English copy for
  countries that have one.

## Run the tests

```bash
node test/run_all.mjs            # everything CI runs
node test/run_all.mjs --no-dom   # skip the browser check
node test/nl_check.mjs           # one country's checker
node test/dom_check.mjs          # the browser check on its own
```

You need Node 21 or newer. The browser check starts a local
`python3 -m http.server` and drives headless Chromium or Chrome. It looks for a
Playwright Chromium in `~/.cache/ms-playwright`, then for `google-chrome` or
`chromium` on your `PATH`. Set `WAIP_CHROME=/path/to/chrome` to point it
elsewhere, and `WAIP_PORT` / `WAIP_DBG_PORT` if the default ports are taken.

`test/run_all.mjs` reads the country list from `countries/index.js`. For every
country it checks that the module, the rates doc and the checker exist, that the
module satisfies the contract (`test/lib/contract.mjs`), and that
`test/<code>_check.mjs` passes. Then it runs the browser check once. CI runs the
same command on every push and pull request, and the Pages deploy runs it as a
gate.

### Test rules

- Every suite passes on every commit.
- A refactor changes no number. If an output moves, that is a regression until
  a sourced change says otherwise.
- Anchors are computed by hand from the rates doc, never by calling the
  module's own helpers. Duty anchors use a tolerance of `1e-9`.
- Each income-tax function has at least one external anchor: a value
  published by the tax authority or its official calculator, with the
  tolerance that source's rounding needs. The current ones are NL 44,000 →
  7,966.21 (±1), UK 110,000 → 33,432 (exact), CH 80,000 federal → 1,378.22
  (±0.05) and BG 30,000 → 2,637.84 (±0.5).
- Never edit an expected value to make a test pass. Change the doc and its
  source first, then the module, then the anchor, in the same commit.

## Add a country

```bash
node scripts/new-country.mjs de --name Deutschland --name-en Germany --symbol "€" --locale de
```

That writes four things:

| File | What it is |
|---|---|
| `countries/de.js` | stub module that loads and renders, with `ratesStatus: 'pending'` and zero rates |
| `countries/de-rates-<year>.md` | rates doc skeleton |
| `test/de_check.mjs` | checker that fails until it has hand-computed anchors and the module says `ratesStatus: 'ok'` |
| `countries/index.js` | a registry entry |

The site keeps working with the stub (it shows a "rates pending" note), and CI
stays red until the checker passes. From there:

1. Research the rates and fill in the rates doc first. See the sourcing
   standard below.
2. Implement the module from the doc. The contract is documented at the top of
   `countries/index.js`; `nl.js` and `ch.js` are good models. Keep every duty
   rate in the module's `RATES` block and comment any bracket, credit or
   rounding rule that is not obvious.
3. If the native copy is not English, add a full English mirror as `copyEn` and
   set `langNative` in the registry entry. That turns on the language control.
4. Add the budget split for the "where does my money go" tab to
   `countries/where-goes-<year>.md` and the `budget` field.
5. Add anchors to the checker, set `ratesStatus: 'ok'`, and run
   `node test/run_all.mjs` until it passes.
6. Open `index.html?c=de` and click through every preset, both tabs and both
   languages.

Nothing else needs editing: `index.html`, `core.js`, the browser check and the
workflows all read the registry.

### Kinds

A preset's `kind` picks the duty panel: `alcohol`, `drinks`, `cigs`, `fuel`,
`energy`, `vape`, `custom` or `none`. A country only uses the kinds it needs,
and the duty math for each lives in the country's `computeDuties`. NL taxes beer
on % vol, CH and BG on °Plato, the UK per litre of pure alcohol; all three use
the same `alcohol` panel.

## Sourcing standard

The point of the project is that every number can be checked.

- Every rate, threshold, price, budget figure and population number in a module
  has a row in that country's docs: the value, what it applies to, the date it
  took effect, and a source link (or a precise citation for print sources).
- Prices carry an as-of date and where they were observed.
- Every doc has an **Uncertainties** section: what is approximate, what is left
  out, where sources disagree and which one was used.
- An estimate is labelled as an estimate, with how it was derived.
- No number goes into code without a doc row. If you cannot source it, leave it
  out and say so in the doc.
- `ratesStatus` stays `'pending'` until every rate has been checked against its
  source.

## Code

- Plain browser JavaScript as classic scripts (no modules in the page), so the
  site runs from `file://`. Test and tooling scripts are Node ES modules.
- `core.js` stays country-agnostic. Anything specific to one country goes in its
  module or its registry entry.
- Keep user-visible strings in `copy` / `copyEn`, not in `core.js` or
  `index.html`.
- Match the existing style: two-space indent, single quotes, semicolons.

## Pull requests

One topic per pull request. Say what changed and why, link the sources for any
number you touched, and paste the `node test/run_all.mjs` summary.
