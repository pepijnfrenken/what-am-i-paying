# UK rates 2026: sources for the calculator (United Kingdom)

Every duty rate in `countries/uk.js` was **re-verified against gov.uk on
2026-10-05** and matches the statutory tables in force today. The income-tax
rules have their own doc (`uk-tax-2026.md`). The original "What am I actually
paying?" page is John Willis's; the UK idea and the page design are reused
with his permission (README, Credit). No number here depends on that page as
a source.

## Indirect taxes and duties (verified 2026-10-05)

| Levy | Rate in `uk.js` | In force | Source (gov.uk) |
|---|---|---|---|
| VAT standard / reduced / zero | 20 % / 5 % / 0 % | current | gov.uk VAT rates |
| Fuel duty (petrol, diesel) | 52.95p per litre | temporary 5p cut, now runs to **31 Dec 2026** | hydrocarbon oils rates + TIIN "Amended Fuel Duty rates: 2026 to 2027" |
| Alcohol duty, 0–1.2 % ABV | 0 | 1 Feb 2026 | alcohol-duty-rates |
| Alcohol duty, 1.2 % to under 3.5 % | £ 9.96 per litre of pure alcohol (draught £ 8.58) | 1 Feb 2026 | alcohol-duty-rates |
| Alcohol duty, beer 3.5 % to under 8.5 % | £ 22.58 per litre of pure alcohol (draught £ 19.45) | 1 Feb 2026 | alcohol-duty-rates |
| Alcohol duty, wine/spirits/other 3.5 % to under 8.5 % | £ 26.61 per litre of pure alcohol (draught £ 19.45) | 1 Feb 2026 | alcohol-duty-rates |
| Alcohol duty, any drink 8.5 % to 22 % | £ 30.62 per litre of pure alcohol | 1 Feb 2026 | alcohol-duty-rates |
| Alcohol duty, over 22 % | £ 33.99 per litre of pure alcohol | 1 Feb 2026 | alcohol-duty-rates |
| Tobacco duty, cigarettes | £ 394.09 per 1,000 + 16.5 % of retail price, minimum £ 518.75 per 1,000 | **1 Oct 2026** (FA 2026 s.91) | tobacco-duty rates |
| Vaping products duty | £ 2.20 per 10 ml (£ 0.22/ml; VAT 20 % still applies on the duty-inclusive price) | **1 Oct 2026** (FA 2026) | how-to-pay-vaping-products-duty |
| Soft Drinks Industry Levy | 27.8p per litre (8 g+ sugar/100 ml, "higher"), 20.8p (5 g to under 8 g, "lower"), 0 below 5 g | 1 Apr 2026 | SDIL guidance + uprating framework |

The 1 Feb 2026 alcohol table is the RPI uprating of +3.66 % (superseded
values: £ 9.61 / £ 21.78 / £ 25.67 / £ 29.54 / £ 32.79; draught £ 8.28 /
£ 18.76). The tobacco table before 1 Oct 2026 was £ 353.50 + 16.5 %, minimum
£ 471.93. Draught relief applies only below 8.5 % ABV (`alcRate` in `uk.js`).

**Wine** is charged per litre of pure alcohol (since 1 Aug 2023), not per
bottle: 8.5–22 % = £ 30.62/LPA, so a 13 % 75cl bottle = 0.0975 LPA × £ 30.62 =
£ 2.98545. The old fixed per-bottle duties and the 11.5–14.5 % easement are
abolished (easement ended 31 Jan 2025). Do not use third-party per-bottle band
tables; they are stale.

**Rounding:** HMRC rounds each alcohol-duty liability down to the penny
("round down to the nearest penny" rule, work-out-how-much-alcohol-duty).
`uk.js` applies that round-down to the alcohol duty it computes; other levies
are computed exactly as their formulas define. Penny-level differences from
third-party calculators are expected.

## Diary (rates that change next)

- **Fuel duty**: freeze to 31 Dec 2026, then **55.95p from 1 Jan 2027** and
  **57.95p from 1 Mar 2027** (announced 20 May 2026; final rates confirmed at
  Budget 2026). The Sep-2026 +1p step was cancelled. RPI uprating resumes
  April 2027. Revisit `fuel_per_l` before 1 Jan 2027.
- **Alcohol**: next uprating 1 Feb 2027 (amount at Budget 2026).
- **Tobacco**: next uprating at Budget 2026 (RPI+2pp escalator).
- **SDIL**: next uprating 1 Apr 2027 (CPI-based framework).
- Stale-source warning: gov.uk's consumer page "Tax on shopping and services —
  Alcohol, tobacco and vaping duties" still shows Feb-2025 alcohol rates. Use
  the guidance pages above, not that page.

## Not modelled (documented for completeness)

- Cider: still cider 3.5–8.4 % and sparkling ≤ 5.5 % = £ 10.39/LPA; draught
  variants £ 8.95/LPA. No cider preset exists.
- Small-producer alcohol relief; Scotland's bands; student loans and pension
  effects in the receipt's marginal bands (England/Wales/NI flat bands only).

## Presets

Prices for the Mars bar, cola, pint, supermarket lager, wine, gin, cigarettes,
petrol, vape liquid and bread are typical prices. The Big Mac price comes from
`bigmac-2026.md`, the weekly groceries basket from `groceries-2026.md`, the
budget split from `where-goes-2026.md`.

## Uncertainties

- Fuel: 55.95p / 57.95p are the legislative default; Budget 2026 confirms.
- Wine per-bottle figures derived from the per-LPA rate; ±1p differences
  between rounding conventions.
- Preset prices are typical prices, not measured averages.
- The receipt's marginal bands are flat approximations; Custom rate covers the
  rest.
