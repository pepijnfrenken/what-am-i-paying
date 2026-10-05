# NL tarieven 2026 — bronnen voor de calculator

Onderzocht op 2026-10-05 (Belastingdienst / Rijksoverheid / Douane Tarievenlijst / wetten.overheid.nl).
Alle bedragen zijn 2026-waarden; alcoholaccijnzen en verbruiksbelasting zijn t.o.v. 1-1-2024 onveranderd.

## Accijnzen & heffingen (excl. btw; btw komt eroverheen)

| Categorie | Tarief | Eenheid | Bron |
|---|---|---|---|
| Bier, normaal | **€ 8,12** | per hl per % vol alcohol (20°C) | [wetten.overheid.nl BWBR0005251](https://wetten.overheid.nl/BWBR0005251/2026-01-01) |
| Bier, verlaagd (kleine brouwerijen ≤ 200.000 hl/jr) | € 7,51 | per hl per % vol | [Douane Tarievenlijst](https://www.douane.nl/wp-content/uploads/2026/03/Tarievenlijst-accijns-en-verbruiksbelasting.pdf) |
| Wijn ≤ 8,5% vol | € 47,95 | per hl (mousserend = stil) | wetten.overheid.nl BWBR0005251 |
| Wijn > 8,5% vol | € 95,69 | per hl | wetten.overheid.nl BWBR0005251 |
| Sterke drank | **€ 18,27** | per hl per % vol (= € 18,27 per liter pure alcohol) | wetten.overheid.nl BWBR0005251 |
| Sigaretten | **€ 362,12 per 1.000 + 5%** van de kleinhandelsprijs; minimum € 390,42 per 1.000 | per 1.000 stuks | Douane Tarievenlijst |
| Benzine (ongelood) | € 844,69 per 1.000 L (= € 0,84469/L) + voorraadheffing € 8,00 per 1.000 L | per liter | Douane Tarievenlijst; Rijksoverheid |
| Diesel | € 552,29 per 1.000 L (= € 0,55229/L) + voorraadheffing € 8,00 per 1.000 L | per liter | Douane Tarievenlijst |
| Energiebelasting elektriciteit (schijf 1+2, huishoudens) | € 0,09161 | per kWh excl. btw | Belastingdienst EB |
| Energiebelasting gas (schijf 1+2) | € 0,60066 | per m³ excl. btw | Belastingdienst EB |
| Belastingvermindering EB | € 519,80 per jaar excl. btw (≈ € 628,96 incl.) | per aansluiting | Belastingdienst EB |
| Verbruiksbelasting alcoholvrije dranken | € 26,13 (vlak) | per hl | wetten.overheid.nl BWBR0005802 |
| Assurantiebelasting | 21% | van premie | Belastingdienst |
| Vliegbelasting | € 30,25 | per vertrekkende passagier | Belastingdienst |

Mechanics-gotchas (uit bronnen):
- **Bier: géén °Plato-conversie.** Sinds 1-1-2024 is de basis %vol; het oude Plato-tarief is vervallen. Douane: geen vaste relatie ABV↔°Plato. Formule: hl × %vol × € 8,12. Minimum € 26,13/hl bindt tot ~3,2% vol. %vol wordt naar beneden afgerond op 1 decimaal (administratief).
- Wijn: stil/mousserend maakt niet uit sinds 2017; alleen %vol kiest het tarief.
- Sterke drank: ook "overige alcoholhoudende producten" > 1,2% die geen bier/wijn/tussenproduct zijn.
- Sigaretten: ad valorem = 5% van kleinhandelsprijs; minimum totaal € 390,42/1.000 (≈ € 7,81 per pakje van 20).
- Brandstof: tarieven zijn inclusief de tijdelijke accijnskorting 2026; zonder korting referentie € 1,0021/L (benzine) en € 0,6543/L (diesel). Geen CO2-component in de accijns.
- Energie: btw (21%) wordt geheven over de rekening inclusief EB. ODE zit sinds 2023 in de EB (niet apart).
- Verbruiksbelasting: vlak tarief, geen suikerdifferentiatie (2026); mineraalwater (ongezoet/ongearomatiseerd) en zuivel/soja uitgezonderd.
- Bronartefact: Douane-PDF "1 april 2026" heeft een stale intro-regel; alle tarieven zijn gekruischt met wetten.overheid.nl (in werking 1-1-2026). Rijksoverheid-voorbeelden reproduceren exact (glas bier € 0,123; wijnfles € 0,868 incl. btw).

## Loonheffing 2026 — effectieve marginale tarieven (werknemer, < AOW)

Nominaal: 35,75% t/m € 38.883 (incl. 27,65pp premies volksverzekeringen), 37,56% € 38.883–78.426, 49,50% boven € 78.426.

| Label | Bereik (jaar) | Effectief marginaal |
|---|---|---|
| ≈0% (kortingen > heffing) | tot ≈ € 11.350 | ≈ 0% |
| 35,75% − AK-opbouw 8,324% | € 0 – 11.965 | ≈ 27,4% |
| 35,75% − AK-opbouw 31,009% | € 11.965 – 25.845 | ≈ 4,7% |
| 35,75% − AK-opbouw 1,950% | € 25.845 – 29.736 | ≈ 33,8% |
| 35,75% − AK 1,950% + AHK-afbouw 6,398% | € 29.736 – 38.883 | ≈ 40,2% |
| 37,56% − AK 1,950% + AHK 6,398% | € 38.883 – 45.592 | ≈ 42,0% |
| 37,56% + AHK 6,398% + AK-afbouw 6,510% | € 45.592 – 78.426 | ≈ 50,5% |
| 49,50% + AK-afbouw 6,510% | € 78.426 – 132.920 | ≈ 56,0% |
| 49,50% (geen kortingseffect meer) | > € 132.920 | 49,5% |

(AHK max € 3.115, AK max € 5.685.) Bron: Belastingdienst box-1 + AHK/AK-tabellen 2026.

## Gangbare prijzen (medio 2026, incl. btw)

| Item | Prijs | Bron/opmerking |
|---|---|---|
| Glas pils kroeg (25cl vaasje) | **€ 3,35** | kosteen.nl (jun 2026 gem.); terras/grote stad € 3,50–4,50 |
| Krat pils (24 × 30cl, A-merk) | **€ 19,99** | Jumbo (Heineken € 19,99; A-merk € 16,59–21,32) — excl. statiegeld |
| Fles wijn 75cl (~13%) | **€ 5,99** | Jumbo/Hema huiswijn-segment € 4,99–9,99 |
| Fles jenever 70cl | **≈ € 12,00** | schatting uit 1L-prijzen (€ 13,50–17,99); 70cl zeldzaam |
| Pakje sigaretten (20) | **€ 11,50** | kosteen.nl (jun 2026); ≈75–80% accijns+btw |
| Benzine Euro95, 1 L | **€ 2,45** | CBS pompprijzen (28-09-2026: € 2,465); volatiel — datum vermelden |
| Blikje cola 330ml | **€ 0,95** | pricingscanner (sep 2026); +€ 0,15 statiegeld |
| Brood (heel volkoren) | **€ 1,30** | allesupers (sep 2026, huismerk midden) |
| Stroom 1 kWh (variabel, incl. belastingen) | **€ 0,26** | CBS (jul–aug 2026: levering ~€ 0,148 + EB € 0,11085) |
