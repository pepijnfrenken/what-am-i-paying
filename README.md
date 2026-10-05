# What am I actually paying?

A price tag hides most of the tax inside it. This site takes the price of an
everyday item and splits it into what the seller keeps, the duty, the VAT, and
the income tax you paid on the wage you earned to buy it. A second tab starts from your yearly salary and shows where your income tax goes.

**Live:** <https://pepijnfrenken.github.io/what-am-i-paying/>

It covers the Netherlands, the United Kingdom, Switzerland and Bulgaria, with
2026 rates, in each country's own language and in English.

## Example: one litre of petrol

The site's default pump price in each country, at its default marginal tax rate:

| | Netherlands | United Kingdom | Switzerland | Bulgaria |
|---|---:|---:|---:|---:|
| Pump price | €2.45 | £1.45 | CHF 2.10 | €1.68 |
| Fuel duty | €0.85 | £0.53 | CHF 0.77 | €0.36 |
| VAT | €0.43 | £0.24 | CHF 0.16 | €0.28 |
| What it could cost (price without duty or VAT) | €1.17 | £0.68 | CHF 1.17 | €1.04 |
| Income tax on the wage you earned to pay for it | €1.77 | £0.56 | CHF 1.00 | €0.48 |
| **What you really pay (gross wage)** | **€4.22** | **£2.01** | **CHF 3.10** | **€2.16** |
| Share that goes to the state | 72 % | 66 % | 62 % | 52 % |
| Marginal rate used | 42 % | 28 % | 32.3 % (Zürich) | 22.4 % |

In the Netherlands, someone in the 42 % band earns €4.22 before tax to buy
€2.45 of petrol. Of that, €3.05 goes to the government and €1.17 to the
station and its suppliers.

## How it works

**Receipt tab.** Pick an item and adjust the price or the product details.

1. VAT comes off the full price first, because VAT is charged on top of duty:
   `vat = price × r / (1 + r)`.
2. Duties come off next. Each country module computes its own: beer by % vol
   in the Netherlands and by °Plato in Switzerland and Bulgaria, spirits per
   litre of pure alcohol, cigarettes per stick plus a share of the price, fuel
   per litre.
3. What remains is what the item could cost without tax.
4. The wage wedge: to have `price` left after tax at marginal rate `m`, you
   have to earn `gross = price / (1 − m)`. The difference is the income tax
   and contributions on that wage.

The marginal rate comes from a list of documented bands per country (or your
own number) and is applied flat. That is an approximation of your real tax
position, and the info buttons on the page say so.

**Where does my money go?** Enter a gross yearly income. Each country computes
its annual income tax from the sourced rules: Dutch wage tax with the general
and employment credits, UK income tax without National Insurance, Swiss
federal income tax plus a cantonal/communal part via a place selector (Zürich,
Bern, Zug, Baar — default federal only), and Bulgaria's flat 10 % after social
contributions. The result is compared with what the state spends per person on
social security. If you pay more than that, the rest is split over the
published budget categories in proportion to their size (CH uses the
consolidated 2024 public accounts). Taxes are not earmarked; the split shows
proportions, not where your particular money went.

## Run it

Open `index.html` in a browser. There is no build step and nothing to install;
`file://` works. To serve it instead: `python3 -m http.server`.

`?c=nl`, `?c=uk`, `?c=ch` or `?c=bg` picks a country. `?lang=en` shows the
English copy for countries whose native language is not English.

## Layout

```
index.html             page shell; loads core.js and the registry
core.js                engine and UI: VAT, duty, wage wedge, receipt, budget split
countries/index.js     the registry: every country, its currency and files, and
                       the contract a country module must follow
countries/<code>.js    one module per country: rates, presets, duty math,
                       income tax, all user-visible text
countries/*.md         the sources: one rates doc per country, plus shared docs
                       for groceries, Big Mac prices and the budget split
test/run_all.mjs       runs everything below, driven by the registry
test/<code>_check.mjs  per-country checks against hand-computed values
test/dom_check.mjs     real-browser check of the page (headless Chromium)
scripts/new-country.mjs  scaffold for a new country
```

## Add a country

```bash
node scripts/new-country.mjs de --name Deutschland --name-en Germany --symbol "€" --locale de
```

This writes a stub module, a rates-doc skeleton, a checker and the registry
entry. The page keeps working with the stub, and CI stays red until the
checker has hand-computed anchors from the rates doc. Nothing else needs
editing. [CONTRIBUTING.md](CONTRIBUTING.md) has the full path and the
sourcing standard.

## Data and disclaimers

Every rate, threshold, price and budget figure in the code comes from a
document in `countries/` that gives the source and effective date of each
number and lists what is uncertain: `nl-rates-2026.md`, `uk-rates-2026.md` and
`uk-tax-2026.md`, `ch-rates-2026.md`, `bg-rates-2026.md`, plus
`groceries-2026.md`, `bigmac-2026.md` and `where-goes-2026.md`. If a number is
not in a doc, it should not be in the code.

This is an illustration, not tax advice. Things to keep in mind:

- The receipt uses one marginal rate for the whole wage. Real tax depends on
  your full income, credits and situation.
- "What it could cost" still contains taxes the seller pays: employer
  contributions, business rates, corporation tax, import duties. The real
  government share is higher than shown.
- The Swiss income-tax route covers federal + cantonal + communal tax for
  the five selectable places on single taxpayers without children; other
  cantons/communes, married tariffs and wealth tax are not modelled.
- The UK income-tax route leaves out National Insurance, and is labelled that
  way on the page.
- The UK duty rates were taken from the original UK page and have not been
  independently re-checked against gov.uk in this repository. The UK income
  tax rules have.
- Prices are typical defaults with an as-of date. Rates are 2026 values and
  will go out of date.

Corrections with a source are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Tests

```bash
node test/run_all.mjs
```

For every country in the registry this checks that the country's files exist
and its module follows the contract, then runs its checker. After that a
headless browser loads the page in every country and language and compares
what is on screen with the engine. CI runs it on every push and pull request,
and the GitHub Pages deploy runs it as a gate.

The checkers compare the code with values computed by hand from the rates docs,
and each income-tax function with published reference values (tax-authority
tables, or calculators that follow the authority's method): NL wage tax on
€44,000 is €7,966.21, UK income tax on £110,000 is £33,432, the Swiss federal
tax on CHF 80,000 is CHF 1,378.22, and Bulgarian income tax on €30,000 is
€2,637.84.

Node 21 or newer is needed. The browser check needs Chromium or Chrome; see
[CONTRIBUTING.md](CONTRIBUTING.md#run-the-tests).

## Credit

The original concept, and the original UK version, is
**"What am I actually paying?"** (<https://wonderful-faloodeh-c2a85d.netlify.app/>).
This project started as a rebuild of that idea for the Dutch system and grew
into a modular tool for several countries. Full credit for the original idea
to its author.

## License

[MIT](LICENSE)
