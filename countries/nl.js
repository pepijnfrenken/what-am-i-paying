/* countries/nl.js — Nederland.
 * Tarieven 2026 (in werking 1-1-2026); bronnen en afrondingsafspraken
 * gedocumenteerd in countries/nl-rates-2026.md (Belastingdienst /
 * Rijksoverheid / Douane Tarievenlijst / wetten.overheid.nl).
 *
 * Mechanica (NL):
 *  - Btw wordt over de prijs inclusief accijns geheven -> eerst van de volle prijs af.
 *  - Bier: sinds 1-1-2024 is de basis %vol (géén Plato-conversie):
 *    hl × %vol × € 8,12, %vol naar beneden afgerond op 1 decimaal;
 *    minimum € 26,13/hl (bindt beneden ≈ 3,2% vol).
 *  - Wijn: alleen %vol kiest het tarief (≤ 8,5% € 47,95/hl; > 8,5% € 95,69/hl).
 *  - Sterke drank: € 18,27 per liter pure alcohol (= per hl per %vol).
 *  - Tabak: € 362,12 per 1000 sigaretten + 5% van de verkoopprijs
 *    (minimum totaal € 390,42 per 1000).
 *  - Brandstof: accijns per liter (benzine/diesel; tijdelijke accijnskorting
 *    2026 inbegrepen) + voorraadheffing € 0,008/L.
 *  - Energie: energiebelasting per kWh / m³, excl. btw (btw komt eroverheen).
 *  - Frisdrank/sap: verbruiksbelasting alcoholvrije dranken € 26,13/hl;
 *    mineraalwater (ongezoet, ongearomatiseerd) € 0.
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  const RATES = {
    beer: { per_hl_per_vol: 8.12, min_per_hl: 26.13 },
    wine: { under_85_per_hl: 47.95, above_85_per_hl: 95.69 },
    spirit_per_l_alc: 18.27,
    cig: { spec_per_1000: 362.12, advalorem: 0.05, min_per_1000: 390.42 },
    fuel: { petrol_per_l: 0.84469, diesel_per_l: 0.55229, stock_per_l: 0.008 },
    energy: { kwh: 0.09161, m3: 0.60066 },
    drinks: { regular_per_hl: 26.13, water_per_hl: 0 }
  };

  WAIP.registerCountry({
    code: 'nl',
    name: 'Nederland',
    ratesStatus: 'ok',
    langNative: 'Nederlands',
    currency: { symbol: '\u20ac', decimals: 2, decimalComma: true },
    rates: RATES,
    // Rijksbegroting 2026 (miljoenen), zie where-goes-2026.md
    budget: {
      social: 124700, population: 18130208,
      cats: {
        zorg: { v: 119500, label: 'Zorg', labelEn: 'Health care' },
        gemeenten: { v: 56600, label: 'Gemeenten & provincies (via fondsen)', labelEn: 'Local government (via funds)' },
        onderwijs: { v: 54800, label: 'Onderwijs, cultuur & wetenschap', labelEn: 'Education, culture & science' },
        defensie: { v: 34500, label: 'Defensie', labelEn: 'Defence' },
        justitie: { v: 16800, label: 'Justitie & veiligheid', labelEn: 'Police & justice' },
        buitenland: { v: 15500, label: 'Buitenlandse Zaken & ontwikkelingshulp', labelEn: 'Foreign affairs & development' },
        infra: { v: 14900, label: 'Infrastructuur & waterstaat', labelEn: 'Infrastructure & water' },
        rente: { v: 9500, label: 'Rentelasten staatsschuld', labelEn: 'Debt interest' },
        overig: { v: 39600, label: 'Overig (asiel, wonen, landbouw, klimaat, \u2026)', labelEn: 'Other (asylum, housing, farming, climate, \u2026)' }
      }
    },
    presets: {
      pint:    { name: 'Glas pils in de kroeg (25cl, 4,8%)', nameEn: 'Pils in a pub (25 cl, 4.8%)', price: 3.35, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.8 } },
      krat:    { name: 'Krat pils, supermarkt (24 \u00d7 30cl, 4,8%)', nameEn: 'Crate of pils, supermarket (24 \u00d7 30 cl, 4.8%)', price: 19.99, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 7200, abv: 4.8 } },
      wine:    { name: 'Fles wijn (75cl, 13%)', nameEn: 'Bottle of wine (75 cl, 13%)', price: 5.99, vat: 0.21, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 } },
      jenever: { name: 'Fles jenever (70cl, 35%)', nameEn: 'Bottle of jenever (70 cl, 35%)', price: 12.00, vat: 0.21, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 35 } },
      cigs:    { name: 'Pakje sigaretten (20 stuks)', nameEn: 'Pack of cigarettes (20)', price: 11.50, vat: 0.21, kind: 'cigs', panel: { sticks: 20 } },
      petrol:  { name: 'Benzine, 1 liter (sept 2026, CBS)', nameEn: 'Petrol, 1 litre (Sep 2026, CBS)', price: 2.45, vat: 0.21, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      cola:    { name: 'Blikje cola (330ml)', nameEn: 'Can of cola (330 ml)', price: 0.95, vat: 0.21, kind: 'drinks', panel: { dml: 330, dband: 'regular' } },
      bread:   { name: 'Brood (9% btw)', nameEn: 'Bread (9% VAT)', price: 1.30, vat: 0.09, kind: 'none' },
      bigmac:  { name: 'Big Mac (in het restaurant)', nameEn: 'Big Mac (in the restaurant)', price: 6.10, vat: 0.09, kind: 'none' },
      groceries: { name: 'Weekboodschappen (gemiddeld gezin)', nameEn: 'Weekly groceries (average household)', price: 135.00, vat: 0.09, kind: 'none',
        hint: 'Gemiddelde supermarktmand van een huishouden van ~2 personen (\u20ac 135/week). Voedsel 9 %; alcohol in de mand 21 %; frisdrank heeft ook verbruiksbelasting. Nibud-referentie: \u20ac 62,94 (alleen) \u00b7 \u20ac 114,43 (stel) \u00b7 \u20ac 171,68 (stel + 2 kinderen).',
        hintEn: 'Average supermarket basket of a ~2-person household (\u20ac 135/week). Food 9 %; alcohol in the basket 21 %; soft drinks also carry the consumption levy. Nibud reference: \u20ac 62.94 (single) \u00b7 \u20ac 114.43 (couple) \u00b7 \u20ac 171.68 (couple + 2 children).' },
      power:   { name: 'Stroom, 1 kWh', nameEn: 'Electricity, 1 kWh', price: 0.26, vat: 0.21, kind: 'energy', panel: { kwh: 1, m3: 0 } },
      vliegticket: { name: 'Vliegticket (vliegbelasting per vertrek)', nameEn: 'Flight ticket (departure tax per passenger)', price: 100.00, vat: 0.21, kind: 'custom', fixLabel: 'Vliegbelasting (€ 30,25 per vertrekkende passagier)', fixLabelEn: 'Departure tax (\u20ac 30.25 per departing passenger)', panel: { cfix: 30.25, cpct: 0 } },
      autoverzekering: { name: 'Autoverzekering (jaarpremie, indicatief)', nameEn: 'Car insurance (annual premium, indicative)', price: 600.00, vat: 'vrij', kind: 'custom', pctLabel: 'Assurantiebelasting 21% van de premie', pctLabelEn: 'Assurance duty 21% of the premium', panel: { cfix: 0, cpct: 21 } },
      boek:    { name: 'Boek (9% btw)', nameEn: 'Book (9% VAT)', price: 15.00, vat: 0.09, kind: 'none' },
      custom:  { name: 'Iets anders', nameEn: 'Something else', price: 10.00, vat: 0.21, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // Effectieve marginale tarieven 2026: loonheffing incl. premies
    // volksverzekeringen, gecorrigeerd voor opbouw/afbouw van de arbeids- en
    // algemene heffingskorting (zie nl-rates-2026.md). Default: 2e schijf.
    taxBands: [
      { label: '\u2248 0% (kortingen > heffing), tot \u2248 € 11.350', labelEn: '\u2248 0% (credits exceed tax), up to \u2248 \u20ac 11,350', rate: 0 },
      { label: '\u2248 27,4% (€ 0 \u2013 € 11.965)', labelEn: '\u2248 27.4% (\u20ac 0 \u2013 \u20ac 11,965)', rate: 0.274 },
      { label: '\u2248 4,7% (€ 11.965 \u2013 € 25.845)', labelEn: '\u2248 4.7% (\u20ac 11,965 \u2013 \u20ac 25,845)', rate: 0.047 },
      { label: '\u2248 33,8% (€ 25.845 \u2013 € 29.736)', labelEn: '\u2248 33.8% (\u20ac 25,845 \u2013 \u20ac 29,736)', rate: 0.338 },
      { label: '\u2248 40,2% (€ 29.736 \u2013 € 38.883)', labelEn: '\u2248 40.2% (\u20ac 29,736 \u2013 \u20ac 38,883)', rate: 0.402 },
      { label: '\u2248 42,0% (€ 38.883 \u2013 € 45.592)', labelEn: '\u2248 42.0% (\u20ac 38,883 \u2013 \u20ac 45,592)', rate: 0.42, selected: true },
      { label: '\u2248 50,5% (€ 45.592 \u2013 € 78.426)', labelEn: '\u2248 50.5% (\u20ac 45,592 \u2013 \u20ac 78,426)', rate: 0.505 },
      { label: '\u2248 56,0% (€ 78.426 \u2013 € 132.920)', labelEn: '\u2248 56.0% (\u20ac 78,426 \u2013 \u20ac 132,920)', rate: 0.56 },
      { label: '49,5% (> € 132.920)', labelEn: '49.5% (> \u20ac 132,920)', rate: 0.495 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Bier' }, { v: 'wine', t: 'Wijn' }, { v: 'spirit', t: 'Sterke drank (>22%)' }], draught: false },
      drinks: { bands: [{ v: 'regular', t: 'Frisdrank / sap (geen alcohol)' }, { v: 'water', t: 'Mineraalwater (ongezoet, ongearomatiseerd)' }] },
      fuel: { types: [{ v: 'petrol', t: 'Benzine (E10)' }, { v: 'diesel', t: 'Diesel' }] }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const en = state.lang === 'en';
      const out = [];
      const R = RATES;
      if (kind === 'alcohol') {
        const abv = num(p.abv), ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          // %vol naar beneden afgerond op 1 decimaal; minimum € 26,13/hl.
          const vol = Math.floor(abv * 10) / 10;
          const v = Math.max(hl * vol * R.beer.per_hl_per_vol, hl * R.beer.min_per_hl);
          out.push({ label: en ? `Beer excise (${vol.toFixed(1)}% vol)` : `Bieraccijns (${vol.toFixed(1).replace('.', ',')}% vol)`, v });
        } else if (p.cat === 'wine') {
          const rate = abv > 8.5 ? R.wine.above_85_per_hl : R.wine.under_85_per_hl;
          out.push({ label: en ? `Wine excise (\u20ac ${rate.toFixed(2)}/hl)` : `Wijnaccijns (${rate.toFixed(2).replace('.', ',')}/hl)`, v: hl * rate });
        } else if (p.cat === 'spirit') {
          const lpa = ml / 1000 * abv / 100; // liter pure alcohol
          out.push({ label: en ? `Excise spirits (${lpa.toFixed(2)} L pure)` : `Accijns sterke drank (${lpa.toFixed(2).replace('.', ',')} L puur)`, v: lpa * R.spirit_per_l_alc });
        }
      } else if (kind === 'drinks') {
        const rate = p.dband === 'water' ? R.drinks.water_per_hl : R.drinks.regular_per_hl;
        if (rate) out.push({ label: en ? 'Consumption tax on non-alcoholic drinks' : 'Verbruiksbelasting alcoholvrije dranken', v: num(p.dml) / 100000 * rate });
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          const spec = R.cig.spec_per_1000 * n / 1000, adv = R.cig.advalorem * price;
          const min = R.cig.min_per_1000 * n / 1000;
          if (spec + adv >= min) {
            out.push({ label: en ? 'Tobacco excise, fixed part' : 'Tabaksaccijns vast deel (specifiek)', v: spec });
            out.push({ label: en ? `Tobacco excise ${(R.cig.advalorem * 100).toFixed(1)}% of price` : `Tabaksaccijns ${(R.cig.advalorem * 100).toFixed(1).replace('.', ',')}% van prijs`, v: adv });
          } else {
            out.push({ label: en ? `Tobacco excise (minimum \u20ac ${min.toFixed(2)})` : `Tabaksaccijns (minimum € ${min.toFixed(2).replace('.', ',')})`, v: min });
          }
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? R.fuel.diesel_per_l : R.fuel.petrol_per_l;
        out.push({ label: en ? `Excise ${p.fueltype === 'diesel' ? 'diesel' : 'petrol'}` : `Accijns ${p.fueltype === 'diesel' ? 'diesel' : 'benzine'}`, v: num(p.litres) * rate });
        out.push({ label: en ? 'Stock levy' : 'Voorraadheffing', v: num(p.litres) * R.fuel.stock_per_l });
      } else if (kind === 'energy') {
        if (R.energy.kwh != null) out.push({ label: en ? 'Energy tax electricity' : 'Energiebelasting stroom', v: num(p.kwh) * R.energy.kwh });
        if (R.energy.m3 != null) out.push({ label: en ? 'Energy tax gas' : 'Energiebelasting gas', v: num(p.m3) * R.energy.m3 });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        const preset = state.preset;
        if (f) out.push({ label: (preset && (en ? preset.fixLabelEn : preset.fixLabel)) || (en ? 'Fixed levy' : 'Vaste heffing'), v: f });
        if (pc) out.push({ label: (preset && (en ? preset.pctLabelEn : preset.pctLabel)) || (en ? `Levy ${(pc * 100).toFixed(1)}% of price` : `Heffing ${(pc * 100).toFixed(1).replace('.', ',')}% van prijs`), v: pc * price });
      }
      return out;
    },
    copy: {
      lang: 'nl',
      langLabel: 'Taal',
      docTitle: 'Wat betaal ik eigenlijk?',
      title: 'Wat betaal ik eigenlijk?',
      lede: 'Wat je \u00e9cht betaalt is het brutoloon dat je verdient om iets te kopen. Wat het zou kunnen kosten is de prijs zonder accijns, zonder btw en zonder inkomstenbelasting over het geld dat je uitgeeft.',
      countryLabel: 'Land',
      itemLabel: 'Product',
      priceLabel: 'Prijs in de winkel / kroeg',
      priceHint: 'Defaults zijn gangbare prijzen (medio 2026). Vul in wat je \u00e9cht hebt betaald.',
      vatLabel: 'Btw-tarief',
      vatOptions: [
        { v: 0.21, t: 'Algemeen, 21%', selected: true },
        { v: 0.09, t: 'Verlaagd, 9% (bijv. eten, boeken)' },
        { v: 0, t: 'Nultarief, 0% (bijv. export)' },
        { v: 'vrij', t: 'Vrijgesteld, 0% (o.a. verzekeringen)' }
      ],
      dutyTitle: 'Accijns & heffingen',
      taxTitle: 'Jouw belasting',
      taxLabel: 'Marginaal tarief op je volgende euro loon',
      taxHint: 'Effectieve marginale tarieven 2026: loonheffing inclusief premies volksverzekeringen, gecorrigeerd voor de opbouw/afbouw van arbeids- en algemene heffingskorting. Kies Custom voor je eigen situatie.',
      customRateLabel: 'Eigen marginaal tarief (%)',
      customBandLabel: 'Custom',
      showAll: 'Toon alles',
      showAllHide: 'Verberg',
      compare: { item: 'Product', price: 'Prijs', could: 'Wat het kon kosten', real: 'Wat het \u00e9cht kost', govt: '% naar de overheid' },
      tabs: { receipt: 'Rekening', where: 'Waar gaat mijn geld heen?' },
      wheregoes: {
        input: 'Jouw inkomstenbelasting per jaar',
        yourLabel: 'Jouw belasting',
        baselineName: 'Wat je kost (per persoon)',
        socialBlock: 'Wat je zelf kost (sociale zekerheid)',
        extraBlock: 'Wat je extra bijdraagt',
        belowText: 'Je betaalt minder dan je kost \u2014 de rest betalen anderen',
        legendTitle: 'Wat je extra bijdrage financiert (verdeling over de begroting)',
        pctOfExtra: 'van de extra bijdrage',
        sources: 'Bron: Miljoenennota 2026 + bijlagen Tabel 1.2 (rijksfinancien.nl/miljoenennota/2026/bijlage); CBS StatLine 85644NED; bevolking 18.130.208 (1-1-2026).',
        scope: 'Rijksbegroting 2026 \u2014 Rijk inclusief sociale fondsen; per inwoner.',
        disclaimer: 'Belastingen zijn niet geoormerkt; deze verdeling volgt de gepubliceerde begroting.'
      },
      noDuty: 'Geen op dit product',
      ratesPending: 'Tarieven worden op dit moment geverifieerd en ingevuld.',
      vatLine: vr => `Min btw (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Plus inkomstenbelasting (${WAIP.pctRate(m).replace('.', ',')}%)`,
      mult: r => `Je betaalt echt <b>${r.toFixed(2).replace('.', ',')}\u00d7</b> wat het zou kunnen kosten`,
      take: res => `Van de <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.gross)}</b> die je verdient om dit te kopen gaat <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) naar de overheid: <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.itax)}</b> inkomstenbelasting, <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.vat)}</b> btw en <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.duty)}</b> accijns/heffingen.`,
      warnNeg: 'Accijns en btw komen samen hoger uit dan de prijs. Misschien is de prijs te laag voor dit product, of de winkel verkoopt met verlies.',
      notesTitle: 'Gebruikte tarieven (NL, 2026)',
      notesCaveatsTitle: 'Wat dit niet toont',
      notesRates: 'Tarieven 2026, in werking 1-1-2026 (bronnen: Belastingdienst, Douane Tarievenlijst, wetten.overheid.nl): bier € 8,12 per hl per % vol, minimum € 26,13/hl; wijn \u2264 8,5% vol € 47,95/hl en > 8,5% vol € 95,69/hl; sterke drank € 18,27 per liter pure alcohol; sigaretten € 362,12 per 1.000 + 5% van de prijs, minimum € 390,42 per 1.000; benzine € 0,84469/L en diesel € 0,55229/L + voorraadheffing € 0,008/L (tijdelijke accijnskorting 2026 inbegrepen); energiebelasting € 0,09161/kWh en € 0,60066/m\u00b3 (excl. btw); verbruiksbelasting alcoholvrije dranken € 26,13/hl (mineraalwater, ongezoet en ongearomatiseerd: € 0).',
      notesCaveats: 'De prijs bevat ook belastingen die de verkoper zelf betaalt (werkgeverslasten, vennootschapsbelasting, invoerrechten, marges). Het echte aandeel van de overheid is dus hoger dan hier staat. De belastingvermindering energiebelasting (€ 519,80 per aansluiting) is niet meegenomen, evenmin als de kleine-brouwerij-korting. Administratieve afrondingen zijn mogelijk. Brandstofprijzen zijn volatiel (CBS-pompprijs 28-09-2026). Btw wordt berekend over de prijs inclusief accijns; daarom wordt hij eerst van de volledige prijs afgehaald.',
      credit: 'Gemodulariseerde rebuild van het Britse \u201cWhat am I actually paying?\u201d-concept.',
      panels: {
        alcohol: { cat: 'Soort drank', ml: 'Volume (ml)', abv: 'Alcohol (% vol)', hint: 'Bier: accijns per hl per % vol (€ 8,12; minimum € 26,13/hl onder \u2248 3,2% vol, % vol naar beneden afgerond op 1 decimaal). Wijn: alleen het % vol bepaalt het tarief.' },
        drinks: { ml: 'Volume (ml)', band: 'Soort', hint: 'Verbruiksbelasting alcoholvrije dranken: € 26,13 per hl; mineraalwater (ongezoet, ongearomatiseerd) is uitgezonderd.' },
        cigs: { sticks: 'Aantal sigaretten' },
        fuel: { litres: 'Aantal liters', type: 'Brandstof' },
        energy: { kwh: 'Stroom (kWh)', m3: 'Gas (m\u00b3)', hint: 'Energiebelasting; btw komt d\u00e1\u00e1r bovenop.' },
        custom: { fix: 'Vaste accijns/heffing (\u20ac)', pct: 'Heffing als % van prijs' },
        vape: { ml: 'Vloeistof (ml)' }
      },
      receipt: {
        sub: 'Echte kosten, uitgesplitst',
        hReal: 'Wat je \u00e9cht betaalt', hRealD: 'Brutoloon nodig om dit te kopen',
        hCould: 'Wat het zou kunnen kosten', hCouldD: 'Prijs zonder accijns, btw en inkomstenbelasting',
        priceLine: 'Prijs in de winkel',
        dutyLine: 'Min accijns en heffingen',
        underLine: 'Wat het zou kunnen kosten',
        underSub: 'Prijs min btw en accijns',
        taxPrefix: 'Inkomstenbelasting en premies',
        grossLine: 'Wat je \u00e9cht betaalt',
        legendUnder: 'Verkoper', legendDuty: 'Accijns', legendVat: 'Btw', legendTax: 'Inkomstenbelasting'
      }
    },
    copyEn: {
      lang: 'en',
      langLabel: 'Language',
      docTitle: 'What am I actually paying?',
      title: 'What am I actually paying?',
      lede: 'What you really pay is the gross wage you earn to buy something. What it could cost is the price with every tax removed: no excise duty, no VAT, and no income tax on the money you spend.',
      countryLabel: 'Country',
      itemLabel: 'Item',
      priceLabel: 'Price in the shop / bar',
      priceHint: 'Defaults are typical prices (mid-2026). Enter what you actually paid.',
      vatLabel: 'VAT rate',
      vatOptions: [
        { v: 0.21, t: 'Standard, 21%', selected: true },
        { v: 0.09, t: 'Reduced, 9% (e.g. food, books)' },
        { v: 0, t: 'Zero, 0% (e.g. exports)' },
        { v: 'vrij', t: 'Exempt, 0% (e.g. insurance)' }
      ],
      dutyTitle: 'Excise duties & levies',
      taxTitle: 'Your tax',
      taxLabel: 'Marginal rate on your next euro of salary',
      taxHint: 'Effective marginal rates 2026: wage tax including social insurance premiums, corrected for the build-up/phase-out of the employment and general tax credits. Choose Custom for your own situation.',
      customRateLabel: 'Own marginal rate (%)',
      customBandLabel: 'Custom',
      showAll: 'Show all',
      showAllHide: 'Hide',
      compare: { item: 'Item', price: 'Price', could: 'What it could cost', real: 'What it really costs', govt: '% to the government' },
      tabs: { receipt: 'Receipt', where: 'Where does my money go?' },
      wheregoes: {
        input: 'Your income tax per year',
        yourLabel: 'Your tax',
        baselineName: 'What you cost (per person)',
        socialBlock: 'What you cost yourself (social security)',
        extraBlock: 'What you contribute extra',
        belowText: 'You pay less than you cost \u2014 others cover the rest',
        legendTitle: 'What your extra contribution finances (budget split)',
        pctOfExtra: 'of the extra contribution',
        sources: 'Source: Miljoenennota 2026 + annex Table 1.2 (rijksfinancien.nl/miljoenennota/2026/bijlage); CBS StatLine 85644NED; population 18,130,208 (1-1-2026).',
        scope: 'Central government 2026, including social funds; per resident.',
        disclaimer: 'Taxes are not earmarked; this split follows the published budget.'
      },
      noDuty: 'None on this item',
      ratesPending: '',
      vatLine: vr => `Minus VAT (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Plus income tax (${WAIP.pctRate(m)}%)`,
      mult: r => `You really pay <b>${r.toFixed(2)}\u00d7</b> what it could cost`,
      take: res => `Of the <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac' } }, res.gross)}</b> you earn to buy this, <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac' } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) goes to the government: <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac' } }, res.itax)}</b> income tax, <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac' } }, res.vat)}</b> VAT and <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac' } }, res.duty)}</b> excise duties.`,
      warnNeg: 'Excise duties and VAT together exceed the price. The price may be too low for this product, or the shop is selling at a loss.',
      notesTitle: 'Rates used (NL, 2026)',
      notesCaveatsTitle: 'What this does not show',
      notesRates: '2026 rates (in force 1-1-2026; sources: Belastingdienst, Douane Tarievenlijst, wetten.overheid.nl): beer \u20ac 8.12 per hl per % vol, minimum \u20ac 26.13/hl; wine \u2264 8.5% vol \u20ac 47.95/hl and > 8.5% vol \u20ac 95.69/hl; spirits \u20ac 18.27 per litre of pure alcohol; cigarettes \u20ac 362.12 per 1,000 + 5% of the price, minimum \u20ac 390.42 per 1,000; petrol \u20ac 0.84469/L and diesel \u20ac 0.55229/L + stock levy \u20ac 0.008/L (2026 temporary duty cut included); energy tax \u20ac 0.09161/kWh and \u20ac 0.60066/m\u00b3 (excl. VAT); consumption tax on non-alcoholic drinks \u20ac 26.13/hl (mineral water, unsweetened and unflavoured: \u20ac 0).',
      notesCaveats: 'The price also contains taxes the seller pays (employer costs, corporation tax, import duties, margins). The true government share is therefore higher than shown. The energy tax credit (\u20ac 519.80 per connection) is not included, nor is the small-brewery relief. Administrative rounding is possible. Fuel prices are volatile (CBS pump price 28-09-2026). VAT is charged on top of excise duty, which is why it is taken off the full price first.',
      credit: 'Modular rebuild of the UK \u201cWhat am I actually paying?\u201d concept.',
      panels: {
        alcohol: { cat: 'Drink type', ml: 'Volume (ml)', abv: 'Alcohol (% vol)', hint: 'Beer: excise per hl per % vol (\u20ac 8.12; minimum \u20ac 26.13/hl below \u2248 3.2% vol, % vol rounded down to 1 decimal). Wine: only the % vol determines the rate.', draught: '' },
        drinks: { ml: 'Volume (ml)', band: 'Type', hint: 'Consumption tax on non-alcoholic drinks: \u20ac 26.13 per hl; mineral water (unsweetened, unflavoured) is exempt.' },
        cigs: { sticks: 'Number of cigarettes' },
        fuel: { litres: 'Litres', type: 'Fuel' },
        energy: { kwh: 'Electricity (kWh)', m3: 'Gas (m\u00b3)', hint: 'Energy tax; VAT is charged on top of it.' },
        custom: { fix: 'Fixed excise/levy (\u20ac)', pct: 'Levy as % of price' },
        vape: { ml: 'Liquid (ml)' }
      },
      receipt: {
        sub: 'True cost breakdown',
        hReal: 'What you really pay', hRealD: 'Gross wages earned to buy it',
        hCould: 'What it could cost', hCouldD: 'Price with no excise duty, VAT or income tax',
        priceLine: 'Price in the shop',
        dutyLine: 'Less excise duties and levies',
        underLine: 'What it could cost',
        underSub: 'Price less VAT and excise duties',
        taxPrefix: 'Income tax and premiums',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Excise', legendVat: 'VAT', legendTax: 'Income tax'
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);