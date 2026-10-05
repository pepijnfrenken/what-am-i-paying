/* countries/nl.js — Nederland.
 * RATES: TODO-RESEARCH — to be filled from the sourced research run
 * (Belastingdienst/Rijksoverheid/CBS, 2026). While ratesStatus !== 'ok'
 * the UI shows a "tarieven worden geverifieerd" note.
 *
 * Mechanica (NL):
 *  - Btw wordt over de prijs inclusief accijns geheven -> eerst van de volle prijs af.
 *  - Bier: accijns per hectoliter, gedifferentieerd naar stamwortgehalte (°Plato),
 *    omgerekend uit % vol (1 °P ≈ 1,908 × % vol; zie abvToPlato).
 *  - Wijn: per hectoliter. Sterke drank: per hectoliter pure alcohol.
 *  - Tabak: specifiek bedrag per 1000 sigaretten + % van de verkoopprijs (+ minimum).
 *  - Brandstof: accijns per liter (benzine/diesel), inclusief voorraadheffing.
 *  - Energie: energiebelasting per kWh / m³ (btw komt er bovenop).
 *  - Frisdrank/sap: verbruiksbelasting alcoholvrije dranken per hectoliter.
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  // ABV -> °Plato benadering (OG-1 = ABV/131; P = 250*(OG-1))
  const abvToPlato = abv => 250 * (abv / 131);

  // TODO-RESEARCH: replace nulls with sourced 2026 values; then set ratesStatus:'ok'.
  const RATES = {
    beer: { up_to_8_per_hl: null, from_8_to_12_per_hl: null, above_12_per_hl_per_degree: null },
    wine_still_per_hl: null,
    spirit_per_hl_alc: null,
    cig_spec_per_1000: null,
    cig_advalorem: null,
    cig_min_per_1000: null,       // null als er geen minimumregel is
    fuel: { petrol_per_l: null, diesel_per_l: null },
    energy: { kwh: null, m3: null },
    drinks: { regular_per_hl: null, water_per_hl: null }
  };

  WAIP.registerCountry({
    code: 'nl',
    name: 'Nederland',
    ratesStatus: 'pending',
    currency: { symbol: '\u20ac', decimals: 2, decimalComma: true },
    rates: RATES,
    presets: {
      pint:    { name: 'Glas pils in de kroeg (25cl, 4,8%)', price: 3.50, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 250, abv: 4.8 } },
      krat:    { name: 'Krat pils, supermarkt (24 \u00d7 30cl, 4,8%)', price: 16.00, vat: 0.21, kind: 'alcohol', panel: { cat: 'beer', ml: 7200, abv: 4.8 } },
      wine:    { name: 'Fles wijn (75cl, 13%)', price: 6.00, vat: 0.21, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 } },
      jenever: { name: 'Fles jenever (70cl, 35%)', price: 15.00, vat: 0.21, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 35 } },
      cigs:    { name: 'Pakje sigaretten (20 stuks)', price: 9.50, vat: 0.21, kind: 'cigs', panel: { sticks: 20 } },
      petrol:  { name: 'Benzine, 1 liter', price: 1.90, vat: 0.21, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      cola:    { name: 'Blikje cola (330ml)', price: 1.20, vat: 0.21, kind: 'drinks', panel: { dml: 330, dband: 'regular' } },
      bread:   { name: 'Brood (9% btw)', price: 1.60, vat: 0.09, kind: 'none' },
      power:   { name: 'Stroom, 1 kWh', price: 0.30, vat: 0.21, kind: 'energy', panel: { kwh: 1, m3: 0 } },
      custom:  { name: 'Iets anders', price: 10.00, vat: 0.21, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // TODO-RESEARCH: NL marginale tarieven 2026 (loonheffing incl. premies +
    // afbouw heffingskortingen). Vul labels + rates; markeer de default met selected:true.
    taxBands: [
      // { label: '...', rate: 0.3756, selected: true },
      // { label: '...', rate: 0.495 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Bier' }, { v: 'wine', t: 'Wijn' }, { v: 'spirit', t: 'Sterke drank (>22%)' }], draught: false },
      drinks: { bands: [{ v: 'regular', t: 'Frisdrank / sap (geen alcohol)' }, { v: 'water', t: 'Mineraalwater (< 0,5% suiker)' }] },
      fuel: { types: [{ v: 'petrol', t: 'Benzine (E10)' }, { v: 'diesel', t: 'Diesel' }] }
    },
    computeDuties(state) {
      const p = state.panel, kind = state.kind, price = state.price;
      const out = [];
      const R = RATES;
      if (kind === 'alcohol') {
        const abv = num(p.abv), ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer' && R.beer.above_12_per_hl_per_degree != null) {
          const plato = abvToPlato(abv);
          const v = plato <= 8 ? hl * R.beer.up_to_8_per_hl
            : plato <= 12 ? hl * R.beer.from_8_to_12_per_hl
            : hl * plato * R.beer.above_12_per_hl_per_degree;
          out.push({ label: `Bieraccijns (${plato.toFixed(1)} \u00b0P)`, v });
        }
        if (p.cat === 'wine' && R.wine_still_per_hl != null) {
          out.push({ label: 'Wijnaccijns', v: hl * R.wine_still_per_hl });
        }
        if (p.cat === 'spirit' && R.spirit_per_hl_alc != null) {
          const hlAlc = hl * abv / 100;
          out.push({ label: `Accijns sterke drank (${(hlAlc * 100).toFixed(2)} L puur)`, v: hlAlc * R.spirit_per_hl_alc });
        }
      } else if (kind === 'drinks') {
        const rate = p.dband === 'water' ? R.drinks.water_per_hl : R.drinks.regular_per_hl;
        if (rate != null) out.push({ label: 'Verbruiksbelasting', v: num(p.dml) / 100000 * rate });
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0 && R.cig_spec_per_1000 != null) {
          const spec = R.cig_spec_per_1000 * n / 1000, adv = R.cig_advalorem * price;
          const min = R.cig_min_per_1000 != null ? R.cig_min_per_1000 * n / 1000 : 0;
          if (min && spec + adv < min) out.push({ label: 'Tabaksaccijns (minimum)', v: min });
          else {
            out.push({ label: 'Tabaksaccijns vast deel', v: spec });
            out.push({ label: `Tabaksaccijns ${(R.cig_advalorem * 100).toFixed(1)}% van prijs`, v: adv });
          }
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? R.fuel.diesel_per_l : R.fuel.petrol_per_l;
        if (rate != null) out.push({ label: `Accijns ${p.fueltype === 'diesel' ? 'diesel' : 'benzine'}`, v: num(p.litres) * rate });
      } else if (kind === 'energy') {
        if (R.energy.kwh != null) out.push({ label: 'Energiebelasting stroom', v: num(p.kwh) * R.energy.kwh });
        if (R.energy.m3 != null) out.push({ label: 'Energiebelasting gas', v: num(p.m3) * R.energy.m3 });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: 'Vaste heffing', v: f });
        if (pc) out.push({ label: `Heffing ${(pc * 100).toFixed(1)}% van prijs`, v: pc * price });
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
      priceHint: 'Defaults zijn gangbare prijzen. Vul in wat je \u00e9cht hebt betaald.',
      vatLabel: 'Btw-tarief',
      vatOptions: [
        { v: 0.21, t: 'Algemeen, 21%', selected: true },
        { v: 0.09, t: 'Verlaagd, 9% (bijv. eten, boeken)' },
        { v: 0, t: 'Nultarief, 0% (bijv. export)' }
      ],
      dutyTitle: 'Accijns & heffingen',
      taxTitle: 'Jouw belasting',
      taxLabel: 'Marginaal tarief op je volgende euro loon',
      taxHint: 'Loonheffing inclusief premies volksverzekeringen, 2026. Kies Custom voor je eigen situatie.',
      customRateLabel: 'Eigen marginaal tarief (%)',
      customBandLabel: 'Custom',
      noDuty: 'Geen op dit product',
      ratesPending: 'Tarieven worden op dit moment geverifieerd en ingevuld.',
      vatLine: vr => `Min btw (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Plus inkomstenbelasting (${WAIP.pctRate(m).replace('.', ',')}%)`,
      mult: r => `Je betaalt echt <b>${r.toFixed(2).replace('.', ',')}\u00d7</b> wat het zou kunnen kosten`,
      take: res => `Van de <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.gross)}</b> die je verdient om dit te kopen gaat <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) naar de overheid: <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.itax)}</b> inkomstenbelasting, <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.vat)}</b> btw en <b>${WAIP.formatMoney({ currency: { symbol: '\u20ac', decimalComma: true } }, res.duty)}</b> accijns/heffingen.`,
      warnNeg: 'Accijns en btw komen samen hoger uit dan de prijs. Misschien is de prijs te laag voor dit product, of de winkel verkoopt met verlies.',
      notesTitle: 'Gebruikte tarieven (NL, oktober 2026)',
      notesCaveatsTitle: 'Wat dit niet toont',
      // TODO-RESEARCH: rates text with sources (Belastingdienst/Rijksoverheid/CBS) once verified.
      notesRates: 'Tarieven volgen zodra geverifieerd (Belastingdienst/Rijksoverheid, 2026).',
      notesCaveats: 'De prijs bevat ook belastingen die de verkoper zelf betaalt (werkgeverslasten, vennootschapsbelasting, invoerrechten, marges). Het echte aandeel van de overheid is dus hoger dan hier staat. Kortingen voor kleine brouwerijen zijn niet meegenomen. Btw wordt berekend over de prijs inclusief accijns; daarom wordt hij eerst van de volledige prijs afgehaald.',
      credit: 'Gemodulariseerde rebuild van het Britse \u201cWhat am I actually paying?\u201d-concept.',
      panels: {
        alcohol: { cat: 'Soort drank', ml: 'Volume (ml)', abv: 'Alcohol (% vol)', hint: 'Bier: accijns per hectoliter per graad Plato (omgerekend uit % vol).', draught: '' },
        drinks: { ml: 'Volume (ml)', band: 'Soort', hint: 'Verbruiksbelasting alcoholvrije dranken.' },
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
