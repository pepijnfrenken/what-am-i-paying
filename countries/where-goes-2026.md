# Where does my income tax go — 2026 budget data

Source: delegated research 2026-10-05. Purpose: the "Waar gaat mijn geld heen?" tab. Model: your income tax is first compared to **what you cost the government** (per-capita social security spend = the baseline); anything above the baseline is split over the non-social functions of the published budget. Taxes are not earmarked — the view must say so.

All amounts in **millions** of the local currency, as published. `total` = sum of the listed rows (official total in parentheses where rounded).

## NL — Rijksbegroting 2026 (central government incl. social funds; calendar year 2026)

```json
{"country":"nl","currency":"EUR","total":486400,"social":124700,"population":18130208,
 "cats":{"zorg":119500,"gemeenten":56600,"onderwijs":54800,"defensie":34500,"justitie":16800,"buitenland":15500,"infra":14900,"rente":9500,"overig":39600},
 "official_total_note":"Miljoenennota 2026 total €486.3bn net EMU-relevant; rows as published (rounded); MN2027 revised the 2026 total to €481.2bn without restating rows."}
```

Labels (nl / en): zorg = Zorg / Health care · gemeenten = Gemeenten & provincies (via fondsen) / Local government (via funds) · onderwijs = Onderwijs, cultuur & wetenschap / Education, culture & science · defensie = Defensie / Defence · justitie = Justitie & veiligheid / Police & justice · buitenland = Buitenlandse Zaken & ontwikkelingshulp / Foreign affairs & development · infra = Infrastructuur & waterstaat / Infrastructure & water · rente = Rentelasten staatsschuld / Debt interest · overig = Overig (asiel, wonen, landbouw, klimaat, …) / Other (asylum, housing, farming, climate, …)

Baseline: 124700e6 / 18130208 = **€ 6,878 per person**. Population: CBS 1-1-2026, 18,130,208. Source: Miljoenennota 2026 + bijlagen Tabel 1.2 (rijksfinancien.nl/miljoenennota/2026/bijlage); CBS StatLine 85644NED.

## UK — Total Managed Expenditure FY2025-26 (whole public sector; year ended 31-03-2026)

```json
{"country":"uk","currency":"GBP","total":1227900,"social":407300,"population":69483900,
 "cats":{"health":257500,"rente":130300,"onderwijs":125700,"economie":94000,"defensie":65400,"wonen_milieu":56800,"openbare_orde":55700,"bestuur":35200},
 "excluded":{"accounting_adjustments":132300},
 "official_total_note":"TME FY2025-26 £1,360.1bn = service spending (TES £1,227.6bn, quoted here) + £132.3bn accounting adjustments (excluded from the split — not a consumer-recognisable service). FY2026-27 plan £1,419.3bn; no by-function split published yet."}
```

Labels (en / nl): health = Health (NHS) / Zorg (NHS) · rente = Debt interest / Rentelasten · onderwijs = Education / Onderwijs · economie = Transport, economy & science / Vervoer, economie & wetenschap · defensie = Defence / Defensie · wonen_milieu = Housing, environment & culture / Wonen, milieu & cultuur · openbare_orde = Police & justice / Politie & justitie · bestuur = Government administration & foreign affairs / Bestuur & buitenlandse zaken. (UK copy native = English; nl mirror only used if we show UK in Dutch — keep both anyway.)

Baseline: 407300e6 / 69483900 = **£ 5,862 per person**. Population: ONS mid-2025, 69,483,900. Source: PESA 2026 (gov.uk/government/statistics/public-expenditure-statistical-analyses-2026), Chapter 4 Table 4.2 + Chapter 1 Table 1.1; ONS population estimates mid-2025.

## BG — Consolidated Fiscal Programme 2026 (КФП; central + social funds + NHIF + municipalities)

```json
{"country":"bg","currency":"EUR","total":56807.2,"social":19240.7,"population":6423207,
 "cats":{"zdrave":6664.4,"ikonomika":9821.6,"otbrana":6460.3,"obrazovanie":5599.7,"administracia":3000.6,"jilishta":2710.8,"kultura":967.7,"lihvi":1059.2,"es":1282.2},
 "official_total_note":"MoF plan updated by Council of Ministers Decision 597 of 6-8-2026 (КФП total €56,807.2m; deficit €7.19bn). Pensions alone €13,578.7m (~23.9%)."}
```

Labels (bg / en): zdrave = Здравеопазване / Health · ikonomika = Икономически дейности (транспорт, енергетика, земеделие) / Economic affairs (transport, energy, farming) · otbrana = Отбрана и сигурност (полиция, съд, затвори, ГЗ) / Defence & security (police, courts, prisons) · obrazovanie = Образование / Education · administracia = Общи държавни служби / Government administration · jilishta = Жилища, инфраструктура и околна среда / Housing, utilities & environment · kultura = Култура, спорт и религия / Culture, sport & religion · lihvi = Лихви по дълга / Debt interest · es = Вноска в бюджета на ЕС / EU budget contribution.

Baseline: 19240.7e6 / 6423207 = **€ 2,995 per person** (pensions alone €2,114). Population: НСИ 31-12-2025, 6,423,207. Source: minfin.bg (АСБП 2026–2028, Решение №597 от 6.08.2026, tables II-2 + III-1); ЗДБ 2026; НСИ.

## CH — CONSOLIDATED 2024 (Bund + Kantone + Gemeinden + Sozialversicherungen; EFV Finanzstatistik, Haushalt "Staat", transfers eliminated)

```json
{"country":"ch","currency":"CHF","total":262943,"social":104845,"population":9006600,
 "cats":{"bildung":47928,"sicherheit":20092,"verkehr":19634,"gesundheit":19138,"finanzen":6006,"landwirtschaft":4381,"uebrige":40919},
 "total_per_capita":29194,
 "vintage_note":"2024 is the latest year with function-level detail (FS 'Rechnung'). 2025 exists only as aggregate: total ~CHF 273.4bn (~CHF 30,080 per capita).",
 "supersedes":"the earlier federal-only CH scope (CHF 3,487 baseline) — it covered only ~1/3 of Swiss public money"}
```

Labels (de / en): bildung = Bildung & Forschung / Education & research · sicherheit = Öffentliche Ordnung, Sicherheit & Verteidigung / Public order, security & defence · verkehr = Verkehr & Telekommunikation / Transport & telecom · gesundheit = Gesundheit / Health · finanzen = Finanzen & Steuern (v.a. Zinsen) / Finance & taxes (mainly interest) · landwirtschaft = Landwirtschaft & Ernährung / Agriculture & food · uebrige = Übrige (Verwaltung, Kultur, Umwelt, Wirtschaft) / Other (administration, culture, environment, economy)

Baseline: 104845e6 / 9006600 = **CHF 11,641 per person** (consolidated social protection). Context line: total public spending **CHF 29,194 per person**. Population: BFS mean 2024 = 9,006,600 (end-2023 8,962,200, end-2024 9,051,000). Source: EFV FS-model OGD dataset fir_art_funk.csv (public household 'staat', 2024); cross-check 2023 shares vs EFV main publication Figure 4; BFS population releases.

CH route — tax side = federal direct tax (ESTV Form 58c 2026, already implemented) **+ cantonal/communal = einfache Steuer × (Kantonssteuerfuss + Gemeindesteuerfuss)**. Place options and verified anchors (single, no children, taxable CHF 80,000 / 100,000, tax period 2026):

| Place | Multipliers | Cantonal+communal 80k / 100k | Total with federal 80k / 100k |
|---|---|---|---|
| Zürich (city) | canton 95% + city 119% | 9,352 / 13,204 | **10,730 / 15,888** |
| Bern (city) | canton 297.5% + city 154% | 15,387 / 20,273 | **16,766 / 22,958** |
| Zug (city) | canton 78% + city 52% | 5,110 / 7,325 | **6,488 / 10,009** |
| Baar (ZG) | canton 78% + commune 47.53% | 4,934 / 7,073 | **6,312 / 9,757** |

Federal component alone: 1,378 at 80k / 2,684 at 100k. Implied spread at 100k: Baar 9,757 vs Bern 22,958 (2.4x). Sources: ESTV Form 58c 2026; ESTV 'Steuersatz und Steuerfuss' 3.4.1 (2026); Kantonsblätter ZH §35 / BE Art. 42; canton Zug Grundtarif 2026; ZH Steuerfuss 95% (Kantonsrat 15-12-2025); Stadt Bern 1.54; Zug commune 52% and Baar 47.53%; canton Zug StG §2 (78%, 2026-2029).

CH uncertainties: consolidated scope excludes BVG/pension funds and private health insurers (BSV Grossrechnung differs); 2024 vintage vs 2025/26 for other countries; the 8 task-area groups were built from official function codes (0-9, 81) and validated against 2023 published shares; COFOG variant differs slightly (total 269,924, social 105,374); Stadt Zug's own site still lists the cantonal multiplier at 82% while StG §2 and ESTV say 78% (we use 78%); pure income tax only (no wealth tax, no social contributions); church tax would add ~10% of cantonal/communal in ZH/ZG examples.

## Split rule (implement exactly)

- `baseline = social × 1e6 / population` (local currency, per person per year).
- amount ≤ baseline → state `below`: bar = your amount vs baseline marker; gap = baseline − amount.
- amount > baseline → `social_part = baseline`; `extra = amount − baseline`; each non-social category gets `extra × cat[amount] / extras_total`, where `extras_total = sum(all listed cats)`.
- Default input value per country = baseline rounded to the nearest 100.
- Disclaimer (every country): taxes are not earmarked; this splits your income tax according to the published budget. Scope note per country as above (NL central incl. social funds; UK whole public sector FY2025-26; BG consolidated КФП; CH federal only).
