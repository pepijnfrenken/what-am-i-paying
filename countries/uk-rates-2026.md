# UK rates 2026: sources for the calculator (United Kingdom)

The UK module is a port of the original "What am I actually paying?" page
(https://wonderful-faloodeh-c2a85d.netlify.app/, as published October 2026).
Its duty rates, marginal bands and most preset prices were mirrored from that
page, and `test/uk_check.mjs` proves the port reproduces the page's formulas
exactly. This file collects those numbers in one place, with the source each
one was taken from. No number here is new; every value is the one in
`countries/uk.js`.

The income-tax route on the "where does my money go" tab has its own,
independently verified source: `uk-tax-2026.md` (gov.uk, checked 2026-10-01).

## Indirect taxes and duties

| Levy | Rate in `uk.js` | Effective | Source |
|---|---|---|---|
| VAT standard / reduced / zero | 20 % / 5 % / 0 % | 2026 | original page |
| Fuel duty (petrol, diesel) | 52.95p per litre | 5p cut extended to end of 2026 | original page |
| Alcohol duty, under 1.2 % ABV | 0 | 1 Feb 2026 | original page |
| Alcohol duty, 1.2 % to under 3.5 % | £ 9.96 per litre of pure alcohol (draught £ 8.58) | 1 Feb 2026 | original page |
| Alcohol duty, beer 3.5 % to under 8.5 % | £ 22.58 per litre of pure alcohol (draught £ 19.45) | 1 Feb 2026 | original page |
| Alcohol duty, wine/spirits/other 3.5 % to under 8.5 % | £ 26.61 per litre of pure alcohol (draught £ 19.45) | 1 Feb 2026 | original page |
| Alcohol duty, any drink 8.5 % to 22 % | £ 30.62 per litre of pure alcohol | 1 Feb 2026 | original page |
| Alcohol duty, over 22 % | £ 33.99 per litre of pure alcohol | 1 Feb 2026 | original page |
| Tobacco duty, cigarettes | £ 394.09 per 1,000 + 16.5 % of retail price, minimum £ 518.75 per 1,000 | 1 Oct 2026 | original page |
| Vaping products duty | £ 2.20 per 10 ml | 1 Oct 2026 | original page |
| Soft Drinks Industry Levy | 27.8p per litre (8 g+ sugar per 100 ml), 20.8p (5 g to under 8 g), 0 below 5 g | 1 Apr 2026 | original page |

Draught relief applies only below 8.5 % ABV (`alcRate` in `uk.js`).

## Wage side

| Item | Value in `uk.js` | Source |
|---|---|---|
| Marginal bands for the receipt (income tax + employee NI) | 0 %, 28 % (20 + 8), 42 % (40 + 2), 62 % (60 + 2, PA taper), 47 % (45 + 2) | original page; NI rates in `uk-tax-2026.md` |
| Income tax 2026/27 (where-does-it-go route, NI excluded) | PA £ 12,570 tapered above £ 100,000; 20 / 40 / 45 % on taxable income | `uk-tax-2026.md` |
| Default salary | £ 37,500 | ASHE 2024/25 median full-time, rounded (copy note) |

## Presets

Prices for the Mars bar, cola, pint, supermarket lager, wine, gin, cigarettes,
petrol, vape liquid and bread are the original page's typical prices. The Big
Mac price comes from `bigmac-2026.md`, the weekly groceries basket from
`groceries-2026.md`. The budget split comes from `where-goes-2026.md`.

## Uncertainties

- The duty rates above were taken from the original page and have not been
  re-verified against gov.uk in this repository. The income-tax rules have
  (`uk-tax-2026.md`). Re-check the duty table against gov.uk before relying on
  it for anything beyond illustration.
- The receipt's marginal bands are flat approximations (England, Wales and NI);
  Scotland, student loans and pension effects need the Custom rate.
- Small-producer alcohol relief is ignored.
- Preset prices are typical prices, not measured averages.
