# Weekly groceries 2026 — preset data

Researched 2026-10-05. Preset = average weekly supermarket basket of an average household (food for home + non-alcoholic drinks; no restaurant). Default VAT = the dominant rate for the basket; the note flags the exceptions. All prices VAT-inclusive.

| Country | Weekly basket | Household size | Survey | Dominant VAT | Source |
|---|---|---|---|---|---|
| Netherlands | **€ 135** | ~2.1 | card transactions Sep-2024 – Aug-2025 (ABN AMRO, ~150k salaried households) | **9 %** | abnamro.com research (median €585/mo ÷ 4.333) |
| United Kingdom | **£ 73.70** | 2.36 | ONS Family Spending FYE 2025 | **0 %** | ons.gov.uk family-spending bulletin April 2024 – March 2025 (£67.30 food + £6.40 drinks) |
| Bulgaria | **€ 69** (≈136 лв) | ~1.9 | НСИ HBS 2025 (full year) | **20 %** | nsi.bg (3,713 лв/year per person food & non-alc × ~1.9 ÷ 52) |
| Switzerland | **CHF 147** | 2.07 | BFS HABE 2023 | **2.6 %** | bfs.admin.ch Haushaltsbudget (CHF 638/mo: food 582.54 + drinks 55.21) |

## Preset names + notes (native / English)

**nl** — `Weekboodschappen (gemiddeld gezin)` / `Weekly groceries (average household)`
Note (nl): Gemiddelde supermarktmand van een huishouden van ~2 personen (€ 135 per week). Voedsel en frisdrank vallen onder 9 %; alcohol in de mand onder 21 %; frisdrank heeft ook verbruiksbelasting (€ 26,13 per hl). Nibud-referentie: € 62,94 (alleen) · € 114,43 (stel) · € 171,68 (stel + 2 kinderen) per week.
Note (en): Average supermarket basket of a ~2-person household (€ 135/week). Food and soft drinks 9 %; alcohol in the basket 21 %; soft drinks also carry the consumption levy (€ 26.13/hl). Nibud reference: € 62.94 (single) · € 114.43 (couple) · € 171.68 (couple + 2 children) per week.

**uk** — `Weekly groceries (average household)`
Note: £ 73.70/week for a 2.36-person household (ONS FYE 2025: £ 67.30 food + £ 6.40 soft drinks). Most food is zero-rated — the UK story; soft drinks and sweets are 20 % and carry the Soft Drinks Industry Levy (£ 2.08–2.78 per 10 L), which is not included at 0 %. Range: £ 41–85 (no children, by income) to £ 61–107 (with children).

**bg** — `Седмични покупки (средно домакинство)` / `Weekly groceries (average household)`
Note (bg): ~136 лв (€ 69) на седмица за домакинство от ~1,9 души (НСИ 2025: 3713 лв/човек храна и безалкохолни). Храната и безалкохолните напитки са с 20 % ДДС; България няма данък върху захарта.
Note (en): ~136 лв (€ 69) per week for a ~1.9-person household (NSI 2025: 3,713 лв per person on food & non-alcoholic drinks). Food and soft drinks carry 20 % VAT; Bulgaria has no sugar tax.

**ch** — `Wocheneinkäufe (Durchschnittshaushalt)` / `Weekly groceries (average household)`
Note (de): CHF 147 pro Woche (CHF 638 pro Monat, BFS HABE 2023, Haushalt von 2,07 Personen): Nahrungsmittel 582,54 + alkoholfreie Getränke 55,21. Beide zum reduzierten Satz von 2,6 %. Keine Zuckersteuer.
Note (en): CHF 147 per week (CHF 638/month, BFS HABE 2023, 2.07-person household): food 582.54 + non-alcoholic drinks 55.21. Both at the reduced 2.6 % rate. No sugar tax.

## Uncertainties (carry a short version in the note/hint if space)

- NL: basket is a card-transaction median of salaried households (includes some liquor-store items); household size is the national average, not from that study.
- UK: survey mean, no significance testing at this detail; SDIL and standard-rated drinks/sweets are not in the 0 % figure.
- BG: NSI publishes per-person only; household figure is derived (×1.9). 2026 methodology switch limits comparability.
- CH: survey year 2023 (latest); quality rating 'b'.
- Cross-country: baskets, periods and currencies differ; not a like-for-like comparison.
