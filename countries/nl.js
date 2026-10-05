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
    currency: { symbol: '\u20ac', decimals: 2, decimalComma: true },
    rates: RATES,
    presets: {
      pint:    { name: 'Glas pils in de kroeg (25cl, 4,8%)', price: 3.35, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.8 } },
      krat:    { name: 'Krat pils, supermarkt (24 \u00d7 30cl, 4,8%)', price: 19.99, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 7200, abv: 4.8 } },
      wine:    { name: 'Fles wijn (75cl, 13%)', price: 5.99, vat: 0.21, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 } },
      jenever: { name: 'Fles jenever (70cl, 35%)', price: 12.00, vat: 0.21, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 35 } },
      cigs:    { name: 'Pakje sigaretten (20 stuks)', price: 11.50, vat: 0.21, kind: 'cigs', panel: { sticks: 20 } },
      petrol:  { name: 'Benzine, 1 liter (sept 2026, CBS)', price: 2.45, vat: 0.21, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      cola:    { name: 'Blikje cola (330ml)', price: 0.95, vat: 0.21, kind: 'drinks', panel: { dml: 330, dband: 'regular' } },
      bread:   { name: 'Brood (9% btw)', price: 1.30, vat: 0.09, kind: 'none' },
      power:   { name: 'Stroom, 1 kWh', price: 0.26, vat: 0.21, kind: 'energy', panel: { kwh: 1, m3: 0 } },
      custom:  { name: 'Iets anders', price: 10.00, vat: 0.21, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // Effectieve marginale tarieven 2026: loonheffing incl. premies
    // volksverzekeringen, gecorrigeerd voor opbouw/afbouw van de arbeids- en
    // algemene heffingskorting (zie nl-rates-2026.md). Default: 2e schijf.
    taxBands: [
      { label: '\u2248 0% (kortingen > heffing), tot \u2248 € 11.350', rate: 0 },
      { label: '\u2248 27,4% (€ 0 \u2013 € 11.965)', rate: 0.274 },
      { label: '\u2248 4,7% (€ 11.965 \u2013 € 25.845)', rate: 0.047 },
      { label: '\u2248 33,8% (€ 25.845 \u2013 € 29.736)', rate: 0.338 },
      { label: '\u2248 40,2% (€ 29.736 \u2013 € 38.883)', rate: 0.402 },
      { label: '\u2248 42,0% (€ 38.883 \u2013 € 45.592)', rate: 0.42, selected: true },
      { label: '\u2248 50,5% (€ 45.592 \u2013 € 78.426)', rate: 0.505 },
      { label: '\u2248 56,0% (€ 78.426 \u2013 € 132.920)', rate: 0.56 },
      { label: '49,5% (> € 132.920)', rate: 0.495 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Bier' }, { v: 'wine', t: 'Wijn' }, { v: 'spirit', t: 'Sterke drank (>22%)' }], draught: false },
      drinks: { bands: [{ v: 'regular', t: 'Frisdrank / sap (geen alcohol)' }, { v: 'water', t: 'Mineraalwater (ongezoet, ongearomatiseerd)' }] },
      fuel: { types: [{ v: 'petrol', t: 'Benzine (E10)' }, { v: 'diesel', t: 'Diesel' }] }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const out = [];
      const R = RATES;
      if (kind === 'alcohol') {
        const abv = num(p.abv), ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          // %vol naar beneden afgerond op 1 decimaal; minimum € 26,13/hl.
          const vol = Math.floor(abv * 10) / 10;
          const v = Math.max(hl * vol * R.beer.per_hl_per_vol, hl * R.beer.min_per_hl);
          out.push({ label: `Bieraccijns (${vol.toFixed(1).replace('.', ',')}% vol)`, v });
        } else if (p.cat === 'wine') {
          const rate = abv > 8.5 ? R.wine.above_85_per_hl : R.wine.under_85_per_hl;
          out.push({ label: `Wijnaccijns (${rate.toFixed(2).replace('.', ',')}/hl)`, v: hl * rate });
        } else if (p.cat === 'spirit') {
          const lpa = ml / 1000 * abv / 100; // liter pure alcohol
          out.push({ label: `Accijns sterke drank (${lpa.toFixed(2).replace('.', ',')} L puur)`, v: lpa * R.spirit_per_l_alc });
        }
      } else if (kind === 'drinks') {
        const rate = p.dband === 'water' ? R.drinks.water_per_hl : R.drinks.regular_per_hl;
        if (rate) out.push({ label: 'Verbruiksbelasting alcoholvrije dranken', v: num(p.dml) / 100000 * rate });
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          const spec = R.cig.spec_per_1000 * n / 1000, adv = R.cig.advalorem * price;
          const min = R.cig.min_per_1000 * n / 1000;
          if (spec + adv >= min) {
            out.push({ label: 'Tabaksaccijns vast deel (specifiek)', v: spec });
            out.push({ label: `Tabaksaccijns ${(R.cig.advalorem * 100).toFixed(1).replace('.', ',')}% van prijs`, v: adv });
          } else {
            out.push({ label: `Tabaksaccijns (minimum € ${min.toFixed(2).replace('.', ',')})`, v: min });
          }
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? R.fuel.diesel_per_l : R.fuel.petrol_per_l;
        out.push({ label: `Accijns ${p.fueltype === 'diesel' ? 'diesel' : 'benzine'}`, v: num(p.litres) * rate });
        out.push({ label: 'Voorraadheffing', v: num(p.litres) * R.fuel.stock_per_l });
      } else if (kind === 'energy') {
        if (R.energy.kwh != null) out.push({ label: 'Energiebelasting stroom', v: num(p.kwh) * R.energy.kwh });
        if (R.energy.m3 != null) out.push({ label: 'Energiebelasting gas', v: num(p.m3) * R.energy.m3 });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: 'Vaste heffing', v: f });
        if (pc) out.push({ label: `Heffing ${(pc * 100).toFixed(1).replace('.', ',')}% van prijs`, v: pc * price });
      }
      return out;
    },
    copy: {
      lang: 'nl',
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
        { v: 0, t: 'Nultarief, 0% (bijv. export)' }
      ],
      dutyTitle: 'Accijns & heffingen',
      taxTitle: 'Jouw belasting',
      taxLabel: 'Marginaal tarief op je volgende euro loon',
      taxHint: 'Effectieve marginale tarieven 2026: loonheffing inclusief premies volksverzekeringen, gecorrigeerd voor de opbouw/afbouw van arbeids- en algemene heffingskorting. Kies Custom voor je eigen situatie.',
      customRateLabel: 'Eigen marginaal tarief (%)',
      customBandLabel: 'Custom',
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
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);