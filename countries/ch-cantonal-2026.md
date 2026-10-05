# CH cantonal income tax 2026 — tariff arrays for the money tab

Research 2026-10-05. All three arrays: **pure cantonal tariff** (einfache Steuer), **single person without children**, tax period 2026. `simple_tax(x) = base + rate × (x − from)` inside each bracket. Income basis = taxable income (steuerbares Einkommen).

## Zürich — §35 Abs. 1 StG (Grundtarif GT, valid from tax period 2026)

Source: ESTV Kantonsblatt ZH, Feb 2026 (estv2.admin.ch/stp/kb/zh-de.pdf) + ZStB Nr. 48.1. Official table granularity CHF 100, linear inside stages. Exact at CHF-100 multiples; between steps bounded by one increment (≤ CHF 13; 9 in the 76,400–110,400 stage). Married / single parents (Verheiratetentarif §35 Abs. 2) NOT covered.

```json
[[0,7000,0,0],[7000,12000,0,0.02],[12000,16800,100,0.03],[16800,24800,244,0.04],[24800,34500,564,0.05],[34500,45700,1049,0.06],[45700,58800,1721,0.07],[58800,76400,2638,0.08],[76400,110400,4046,0.09],[110400,144100,7106,0.1],[144100,197400,10476,0.11],[197400,266700,16339,0.12],[266700,null,24655,0.13]]
```
Verified: 80,000 → 4,370.00 (official 4,370); 100,000 → 6,170.00 (6,170); 76,400 → 4,046; 110,400 → 7,106; 266,700 → 24,655.

## Bern — Art. 42 Abs. 2 StG (Tarif für Alleinstehende, tax period 2026)

Source: ESTV Kantonsblatt BE, Feb 2026 (estv2.admin.ch/stp/kb/be-de.pdf) + TaxInfo official step table 16-10-2025. Official rows per CHF 100, tax to CHF 0.05, linear fit exact. Between steps bounded by ≤ CHF 6.50. Married / single parents (Art. 42 Abs. 1) NOT covered.

```json
[[0,3300,0,0.0195],[3300,6600,64.35,0.029],[6600,16400,160.05,0.036],[16400,32500,512.85,0.0415],[32500,59400,1181,0.0445],[59400,86300,2378.05,0.05],[86300,113200,3723.05,0.056],[113200,140100,5229.45,0.0575],[140100,167000,6776.2,0.059],[167000,193900,8363.3,0.0605],[193900,231600,9990.75,0.0615],[231600,318500,12309.3,0.063],[318500,470600,17784,0.064],[470600,null,27518.4,0.065]]
```
Verified: 80,000 → 3,408.05; 100,000 → 4,490.25; 6,600 → 160.05; 16,400 → 512.85; 32,500 → 1,181.00; 59,400 → 2,378.05; 86,300 → 3,723.05.

## Zug — §35 StG (Grundtarif GT, Steuerperiode 2026, cold-progression indexed)

Source: Kanton Zug 'Kantonssteuer Grundtarif gültig Steuerperiode 2026' + BGS 632.1 §35. Official handling: **taxable income rounded to full CHF 100 before the tariff** (e.g. 142,688 → 142,600); amounts to CHF 0.05; linear inside stages (including the falling top stages). Married / single parents (Mehrpersonentarif §35 Abs. 2) NOT covered.

```json
[[0,1100,0,0.005],[1100,3300,5.5,0.01],[3300,6100,27.5,0.02],[6100,10100,83.5,0.03],[10100,15300,203.5,0.0325],[15300,21100,372.5,0.035],[21100,26900,575.5,0.04],[26900,34900,807.5,0.045],[34900,46400,1167.5,0.055],[46400,59700,1800,0.055],[59700,74700,2531.5,0.065],[74700,94800,3506.5,0.08],[94800,120100,5114.5,0.1],[120100,149900,7644.5,0.09],[149900,null,10326.5,0.08]]
```
Verified: 80,000 → 3,930.50; 100,000 → 5,634.50; 74,700 → 3,506.50; 94,800 → 5,114.50; 120,100 → 7,644.50; 149,900 → 10,326.50.

## Multipliers + place totals (target the site must reproduce)

| Place | Canton + commune multipliers | simple → cantonal+communal (80k / 100k) | total with federal (80k / 100k) |
|---|---|---|---|
| Zürich Stadt | 95% + 119% = ×2.14 | 9,351.8 / 13,203.8 | **10,730 / 15,888** |
| Bern Stadt | 297.5% + 154% = ×4.515 | 15,387.3 / 20,273.5 | **16,766 / 22,958** |
| Zug Stadt | 78% + 52% = ×1.30 | 5,109.7 / 7,324.9 | **6,488 / 10,009** |
| Baar (ZG) | 78% + 47.53% = ×1.2553 | 4,934.0 / 7,073.0 | **6,312 / 9,757** |

Federal component (Form 58c 2026): 1,378.22 at 80k; 2,684.35 at 100k. Sources: ESTV Form 58c 2026; ESTV 'Steuersatz und Steuerfuss' 3.4.1 (2026); ZH Steuerfuss 95% (Kantonsrat 15-12-2025); Stadt Zürich 119%; Kanton BE 2.975 / Stadt Bern 1.54; ZG 78% (§2 StG 2026-2029) + Stadt Zug 52% + Baar 47.53%.

## Caveats (carry into the UI notes)

- Tariffs are on TAXABLE income; the route input is labelled '(≈ belastbaar inkomen)' — same simplification as the federal layer.
- Between CHF-100 steps the fit differs from a table lookup by at most one increment (ZH ≤ 13, BE ≤ 6.5, ZG ≤ 10); exact at CHF-100 multiples. ZG additionally rounds income down to full CHF 100 (implement that before the tariff).
- Singles without children only; married/registered and single parents use other tariffs (not implemented).
- Priorities: ZH tariff revised for 2026 (cold progression); ZG stages inflation-indexed for 2026 only.
- City multipliers, not commune-agnostic rates: other communes swing widely (the point of the selector).
