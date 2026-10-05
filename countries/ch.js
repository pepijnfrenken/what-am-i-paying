/* countries/ch.js — Switzerland (Schweiz).
 * 2026 rates (as of Oct 2026). Every number below, with its source and
 * assumptions, is in countries/ch-rates-2026.md (ESTV, BAZG, BAFU, BSV,
 * cantonal tax offices).
 *
 * Duty mechanics (federal levies only):
 *  - Beer: flat per hl by original wort (°Plato): ≤ 10.0 °P CHF 16.88;
 *    10.1–14.0 °P CHF 25.32; > 14.0 °P CHF 33.76.
 *  - Spirits: CHF 29 per litre of pure alcohol.
 *  - Cigarettes: CHF 118.32 per 1,000 + 25 % of retail price.
 *  - Mineral oil tax: petrol 76.82 Rp./l, diesel 79.57 Rp./l (incl. NAF).
 *  - Wine and electricity: no federal levy (preset noDutyLabel).
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  const RATES = {
    beer_per_hl: { light: 16.88, normal: 25.32, strong: 33.76 }, // ≤ 10 / ≤ 14 / > 14 °Plato
    spirit_per_l_alc: 29,
    cig: { spec_per_1000: 118.32, advalorem: 0.25 },
    fuel: { petrol_per_l: 0.7682, diesel_per_l: 0.7957 }
  };

  // Direkte Bundessteuer 2026, tariff 58c (single). caps[i] is the upper edge
  // of step i, rates[i] the marginal rate within it.
  const FEDERAL_58C = {
    caps: [15200, 33200, 43500, 58000, 76200, 82100, 108900, 141500, 185100, 793900],
    rates: [0, 0.0077, 0.0088, 0.0264, 0.0297, 0.0594, 0.066, 0.088, 0.11, 0.132],
    // Above the last cap the law sets a flat 11.5 % of the whole income. The
    // step sum at the cap is within CHF 0.35 of 11.5 % of it, so continuing
    // at a marginal 11.5 % matches the law to the same margin (the apparent
    // drop from 13.2 % is the tariff's own quirk).
    above: 0.115
  };

  // Federal tax on taxable income I. Like the official table (Form 58c),
  // each step's slice is rounded DOWN to CHF 0.05: 33,200 -> 138.60;
  // 43,500 -> 229.20; 58,000 -> 612.00; 76,200 -> 1,152.50. The 1e-9 keeps
  // exact multiples of 0.05 from dropping a step through float noise.
  function federalTax(I) {
    const { caps, rates, above } = FEDERAL_58C;
    let tax = 0;
    for (let i = 0; i < caps.length; i++) {
      const w = Math.max(0, Math.min(I, caps[i]) - (i ? caps[i - 1] : 0));
      tax += Math.floor(w * rates[i] * 20 + 1e-9) / 20;
    }
    const top = caps[caps.length - 1];
    if (I > top) tax += above * (I - top);
    return tax;
  }

  // Kantonale einfache Steuer 2026 (single, no children), tariff arrays with
  // sources in countries/ch-cantonal-2026.md. Each step: [from, to, base,
  // rate]; tax = base + rate x (I - from). ZG rounds taxable income DOWN to
  // the full CHF 100 before the tariff (official handling); ZH/BE use the
  // continuous fit (bounded by one CHF-100 step increment per the doc).
  const CANTON_TARIFFS = {
    zh: { roundDown: false, steps: [[0,7000,0,0],[7000,12000,0,0.02],[12000,16800,100,0.03],[16800,24800,244,0.04],[24800,34500,564,0.05],[34500,45700,1049,0.06],[45700,58800,1721,0.07],[58800,76400,2638,0.08],[76400,110400,4046,0.09],[110400,144100,7106,0.1],[144100,197400,10476,0.11],[197400,266700,16339,0.12],[266700,null,24655,0.13]] },
    be: { roundDown: false, steps: [[0,3300,0,0.0195],[3300,6600,64.35,0.029],[6600,16400,160.05,0.036],[16400,32500,512.85,0.0415],[32500,59400,1181,0.0445],[59400,86300,2378.05,0.05],[86300,113200,3723.05,0.056],[113200,140100,5229.45,0.0575],[140100,167000,6776.2,0.059],[167000,193900,8363.3,0.0605],[193900,231600,9990.75,0.0615],[231600,318500,12309.3,0.063],[318500,470600,17784,0.064],[470600,null,27518.4,0.065]] },
    zg: { roundDown: true, steps: [[0,1100,0,0.005],[1100,3300,5.5,0.01],[3300,6100,27.5,0.02],[6100,10100,83.5,0.03],[10100,15300,203.5,0.0325],[15300,21100,372.5,0.035],[21100,26900,575.5,0.04],[26900,34900,807.5,0.045],[34900,46400,1167.5,0.055],[46400,59700,1800,0.055],[59700,74700,2531.5,0.065],[74700,94800,3506.5,0.08],[94800,120100,5114.5,0.1],[120100,149900,7644.5,0.09],[149900,null,10326.5,0.08]] }
  };

  // Kantonale einfache Steuer (pure). Exposed for the checker via WAIP.chSimpleTax.
  function simpleTax(canton, income) {
    const t = CANTON_TARIFFS[canton];
    let x = Math.max(0, income);
    if (t.roundDown) x = Math.floor(x / 100) * 100;
    for (const [from, to, base, rate] of t.steps) {
      if (x >= from && (to == null || x <= to)) return base + rate * (x - from);
    }
    return 0;
  }

  const PLACES = [
    { key: 'bund', label: 'Nur Bundessteuer', labelEn: 'Federal only' },
    { key: 'zh', canton: 'zh', cantonMul: 0.95, communeMul: 1.19, label: 'Z\u00fcrich (Stadt)', labelEn: 'Z\u00fcrich (city)' },
    { key: 'be', canton: 'be', cantonMul: 2.975, communeMul: 1.54, label: 'Bern (Stadt)', labelEn: 'Bern (city)' },
    { key: 'zg', canton: 'zg', cantonMul: 0.78, communeMul: 0.52, label: 'Zug (Stadt)', labelEn: 'Zug (city)' },
    { key: 'baar', canton: 'zg', cantonMul: 0.78, communeMul: 0.4753, label: 'Baar (ZG)', labelEn: 'Baar (ZG)' }
  ];

  // Pure cantonal einfache-Steuer lookup (exposed for test/ch_check.mjs).
  WAIP.chSimpleTax = simpleTax;

  WAIP.registerCountry({
    code: 'ch',
    ratesStatus: 'ok',
    salaryDefault: 100000,
    places: PLACES,
    // Zürich (Stadt) is the default place — federal-only understated
    // everything (the point of the consolidated scope). 'Bund only' stays
    // first in the list but is not selected.
    placeDefault: 'zh',
    // Konsolidierte Staatsrechnung 2024 (CHF millions; Bund + Kantone +
    // Gemeinden + Sozialversicherungen, transfers eliminated), see
    // where-goes-2026.md; supersedes the former federal-only scope.
    budget: {
      social: 104845, population: 9006600,
      cats: {
        bildung: { v: 47928, label: 'Bildung & Forschung', labelEn: 'Education & research' },
        sicherheit: { v: 20092, label: '\u00d6ffentliche Ordnung, Sicherheit & Verteidigung', labelEn: 'Public order, security & defence' },
        verkehr: { v: 19634, label: 'Verkehr & Telekommunikation', labelEn: 'Transport & telecom' },
        gesundheit: { v: 19138, label: 'Gesundheit', labelEn: 'Health' },
        finanzen: { v: 6006, label: 'Finanzen & Steuern (v.a. Zinsen)', labelEn: 'Finance & taxes (mainly interest)' },
        landwirtschaft: { v: 4381, label: 'Landwirtschaft & Ern\u00e4hrung', labelEn: 'Agriculture & food' },
        uebrige: { v: 40919, label: '\u00dcbrige (Verwaltung, Kultur, Umwelt, Wirtschaft)', labelEn: 'Other (administration, culture, environment, economy)' }
      }
    },
    presets: {
      bier:      { name: 'Bier 5 dl in der Bar, 12\u00b0P', nameEn: 'Beer 5 dl in a bar, 12°P', price: 7.50, vat: 0.081, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 12 } },
      bier6:     { name: '6er-Pack Bier (6 \u00d7 50 cl, 12\u00b0P)', nameEn: '6-pack of beer (6 \u00d7 50 cl, 12°P)', price: 11.50, vat: 0.081, kind: 'alcohol', panel: { cat: 'beer', ml: 3000, plato: 12 } },
      wein:      { name: 'Weinflasche 75 cl', nameEn: 'Bottle of wine (75 cl)', price: 12.95, vat: 0.081, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 }, noDutyLabel: 'Keine Bundessteuer auf Wein \u2014 kantonale Abgaben m\u00f6glich', noDutyLabelEn: 'No federal duty on wine \u2014 cantonal levies possible' },
      schnaps:   { name: 'Schnapsflasche 70 cl 40 %', nameEn: 'Bottle of spirits 70 cl 40%', price: 20.00, vat: 0.081, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 40 } },
      zigaretten:{ name: 'Zigaretten 20 Stk', nameEn: 'Cigarettes, 20', price: 9.40, vat: 0.081, kind: 'cigs', panel: { sticks: 20 } },
      benzin:    { name: 'Benzin 95, 1 L', nameEn: 'Petrol 95, 1 L', price: 2.10, vat: 0.081, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      diesel:    { name: 'Diesel, 1 L', nameEn: 'Diesel, 1 L', price: 2.41, vat: 0.081, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } },
      strom:     { name: 'Strom 1 kWh', nameEn: 'Electricity 1 kWh', price: 0.277, vat: 0.081, kind: 'energy', panel: { kwh: 1, m3: 0 }, noDutyLabel: 'Keine Bundessteuer auf Strom', noDutyLabelEn: 'No federal duty on electricity' },
      brot:      { name: 'Brot 500 g', nameEn: 'Bread 500 g', price: 1.00, vat: 0.026, kind: 'none' },
      bigmac:    { name: 'Big Mac (im Restaurant)', nameEn: 'Big Mac (in the restaurant)', price: 7.20, vat: 0.081, kind: 'none' },
      groceries: { name: 'Wocheneink\u00e4ufe (Durchschnittshaushalt)', nameEn: 'Weekly groceries (average household)', price: 147.00, vat: 0.026, kind: 'none',
        hint: 'CHF 147 pro Woche (CHF 638 pro Monat, BFS HABE 2023, Haushalt von 2,07 Personen). Lebensmittel und alkoholfreie Getr\u00e4nke zum reduzierten Satz von 2,6 %.',
        hintEn: 'CHF 147 per week (CHF 638/month, BFS HABE 2023, 2.07-person household). Food and non-alcoholic drinks at the reduced 2.6 % rate.' },
      hotel:     { name: 'Hotel\u00fcbernachtung', nameEn: 'Hotel night', price: 120.00, vat: 0.038, kind: 'none' },
      custom:    { name: 'Anderes', nameEn: 'Other', price: 10.00, vat: 0.081, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // Estimated marginal rates (federal + AHV/IV/EO + ALV + canton/commune),
    // see ch-rates-2026.md; excludes BVG, NBU, church and wealth tax.
    taxBands: [
      { label: 'Bund + Sozialabgaben, mittleres Einkommen \u2248 13.0 %', labelEn: 'Federal + social contributions, middle income \u2248 13.0%', rate: 0.13 },
      { label: 'Bund + Sozialabgaben, Spitzenverdiener \u2248 16.8 %', labelEn: 'Federal + social contributions, top earner \u2248 16.8%', rate: 0.168 },
      { label: 'Z\u00fcrich Stadt, ~CHF 100k steuerbar \u2248 32.3 %', labelEn: 'Zurich City, ~CHF 100k taxable \u2248 32.3%', rate: 0.323, selected: true },
      { label: 'Gen\u00e8ve Ville, ~CHF 100k \u2248 38.0 %', labelEn: 'Geneva (city), ~CHF 100k \u2248 38.0%', rate: 0.38 },
      { label: 'Lausanne / VD, ~CHF 100k \u2248 40.1 %', labelEn: 'Lausanne / VD, ~CHF 100k \u2248 40.1%', rate: 0.401 },
      { label: 'Spitzenverdiener Z\u00fcrich \u2248 44.6 %', labelEn: 'Top earner Zurich \u2248 44.6%', rate: 0.446 },
      { label: 'Spitzenverdiener Genf (GE) \u2248 48.5 %', labelEn: 'Top earner Geneva (GE) \u2248 48.5%', rate: 0.485 },
      { label: 'Spitzenverdiener Waadt (VD) \u2248 51.8 %', labelEn: 'Top earner Vaud (VD) \u2248 51.8%', rate: 0.518 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Bier' }, { v: 'wine', t: 'Wein' }, { v: 'spirit', t: 'Spirituosen (>15 % vol)' }], draught: false, plato: true },
      fuel: { types: [{ v: 'petrol', t: 'Benzin 95' }, { v: 'diesel', t: 'Diesel' }] }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const en = state.lang === 'en';
      const out = [];
      const R = RATES;
      if (kind === 'alcohol') {
        const ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          // flat CHF per hl, band picked by original wort (°Plato)
          const plato = num(p.plato);
          const rate = plato <= 10 ? R.beer_per_hl.light : plato <= 14 ? R.beer_per_hl.normal : R.beer_per_hl.strong;
          out.push({ label: en ? `Beer tax (${plato.toFixed(1)} \u00b0Plato, CHF ${rate.toFixed(2)}/hl)` : `Biersteuer (${plato.toFixed(1)} \u00b0Plato, CHF ${rate.toFixed(2)}/hl)`, v: hl * rate });
        } else if (p.cat === 'spirit') {
          const lpa = ml / 1000 * num(p.abv) / 100; // litres of pure alcohol
          out.push({ label: en ? `Alcohol tax (${lpa.toFixed(2)} L pure alcohol)` : `Alkoholsteuer (${lpa.toFixed(2)} L reiner Alkohol)`, v: lpa * R.spirit_per_l_alc });
        }
        // wine: no federal duty (the preset's noDutyLabel says so)
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          out.push({ label: en ? 'Tobacco tax (fixed)' : 'Tabaksteuer (fest)', v: R.cig.spec_per_1000 * n / 1000 });
          out.push({ label: en ? 'Tobacco tax 25% of price' : 'Tabaksteuer 25 % des Preises', v: R.cig.advalorem * price });
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? R.fuel.diesel_per_l : R.fuel.petrol_per_l;
        out.push({ label: en ? `Mineral oil tax ${p.fueltype === 'diesel' ? 'diesel' : 'petrol'}` : `Mineral\u00f6lsteuer ${p.fueltype === 'diesel' ? 'Diesel' : 'Benzin'}`, v: num(p.litres) * rate });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: en ? 'Fixed levy' : 'Feste Abgabe', v: f });
        if (pc) out.push({ label: en ? `Levy ${(pc * 100).toFixed(1)}% of price` : `Abgabe ${(pc * 100).toFixed(1)} % des Preises`, v: pc * price });
      }
      return out;
    },
    // Federal + place-dependent cantonal/communal income tax (single, no
    // children). opts.place selects the place (default 'bund' = federal only);
    // cantonal part = einfache Steuer x (Kantonssteuerfuss + Gemeindesteuerfuss).
    incomeTax(gross, opts) {
      const I = Math.max(0, num(gross));
      const fed = federalTax(I);
      const place = opts && opts.place;
      if (!place || place === 'bund') return fed;
      const p = PLACES.find(x => x.key === place);
      if (!p || !p.canton) return fed;
      return fed + simpleTax(p.canton, I) * (p.cantonMul + p.communeMul);
    },
    copy: {
      langLabel: 'Sprache',
      docTitle: 'Was zahle ich wirklich?',
      title: 'Was zahle ich wirklich?',
      lede: 'Was du wirklich zahlst, ist der Bruttolohn, den du verdienen musst, um etwas zu kaufen. Was es kosten k\u00f6nnte, ist der Preis ohne Bundesabgaben, ohne MWST und ohne Einkommenssteuer auf dein Geld.',
      countryLabel: 'Land',
      itemLabel: 'Produkt',
      priceLabel: 'Preis im Gesch\u00e4ft / in der Bar',
      priceHint: 'Voreingestellt sind \u00fcbliche Preise (Stand Herbst 2026). Trag ein, was du wirklich bezahlt hast.',
      vatLabel: 'MWST-Satz',
      vatOptions: [
        { v: 0.081, t: 'Standard, 8.1 %', selected: true },
        { v: 0.026, t: 'Reduziert, 2.6 % (Lebensmittel, B\u00fccher)' },
        { v: 0.038, t: 'Beherbergung, 3.8 % (Hotels)' },
        { v: 0, t: '0 % (Export)' }
      ],
      dutyTitle: 'Bundesabgaben',
      taxTitle: 'Deine Steuern',
      taxLabel: 'Grenzsteuersatz auf deinen n\u00e4chsten Franken',
      taxHint: 'Bundessteuer, AHV/IV/EO, ALV sowie Kantons- und Gemeindesteuern (Sch\u00e4tzungen, Stand 2026). Ohne BVG, NBU, Kirchen- und Verm\u00f6genssteuer. Custom f\u00fcr deine Situation.',
      customRateLabel: 'Eigener Grenzsteuersatz (%)',
      customBandLabel: 'Custom',
      showAll: 'Alle anzeigen',
      showAllHide: 'Ausblenden',
      compare: { item: 'Produkt', price: 'Preis', could: 'Was es kosten k\u00f6nnte', real: 'Was es wirklich kostet', govt: '% an den Staat' },
      tabs: { receipt: 'Kassenbon', where: 'Wohin geht mein Geld?' },
      infoAria: 'Weitere Informationen',
      info: {
        wedge: 'Der Bruttolohn, den du verdienen musst, um das zu kaufen: Preis geteilt durch (1 \u2212 Grenzsatz). Der Satz stammt aus der gew\u00e4hlten Stufe \u2014 eine N\u00e4herung f\u00fcr dein ganzes Einkommen.',
        could: 'Der Reihe nach: zuerst die Bundesabgaben (auf den Preis inkl. MWST), dann die MWST, dann die Einkommenssteuer auf dein Geld. Das ist kein Einkaufspreis.',
        multiplier: 'Wie viel Mal mehr du verdienst als der Preis ohne s\u00e4mtliche Steuern.',
        duty: 'Alle Abgaben neben der MWST: Biersteuer, Tabaksteuer, Mineral\u00f6lsteuer usw. Die MWST steht separat.',
        marginal: 'Der Satz stammt aus der gew\u00e4hlten Stufe und gilt f\u00fcr dein gesamtes Einkommen \u00fcber der Schwelle \u2014 eine N\u00e4herung, keine vollst\u00e4ndige Stufenrechnung.',
        route: 'Steuer auf dieses Einkommen: direkte Bundessteuer 2026 (Tarif 58c) plus Kantons- und Gemeindesteuer \u00fcber die einfache Steuer mit den Steuerf\u00fcssen des gew\u00e4hlten Orts. Die alte Sicht zeigte nur den Bund \u2014 Bundeskantone/-gemeinden machen rund 2/3 der Steuer aus (Baar CHF 9.757 vs Bern CHF 22.958 bei 100k = 2,4\u00d7).',
        baseline: 'Was der Staat (Bund, Kantone, Gemeinden, Sozialversicherungen) im Schnitt pro Person f\u00fcr soziale Sicherheit ausgibt (2024). Zahlst du weniger Steuern, zahlen andere den Rest.',
        split: 'Dein Zusatzbeitrag wird proportional \u00fcber die Aufgabenbereiche der konsolidierten Staatsrechnung verteilt. Steuern sind nicht zweckgebunden.',
        effRate: 'Der effektive Satz ist Steuer geteilt durch Bruttoeinkommen \u2014 nicht der Grenzsatz deiner obersten Stufe.',
        compare: 'Alle Produkte mit ihren Standardwerten beim gew\u00e4hlten Grenzsatz: Preis, was es kosten k\u00f6nnte, was es wirklich kostet und der Anteil an den Staat.'
      },
      wheregoes: {
        input: 'Bruttojahreslohn (\u2248 steuerbares Einkommen)',
        taxLabel: 'Deine Einkommenssteuer pro Jahr',
        directToggle: 'oder Steuer direkt eingeben',
        grossName: 'Bruttojahreslohn',
        taxName: 'Einkommenssteuer',
        placeLabel: 'Ort',
        directTag: '(direkt eingegeben)',
        incomeDefaultNote: 'Standard: ca. CHF 100.000 steuerbar \u2014 entspricht der Standardbande Z\u00fcrich.',
        yourLabel: 'Deine Steuer',
        baselineName: 'Was du kostest (pro Person)',
        socialBlock: 'Was du selbst kostest (Sozialversicherungen)',
        extraBlock: 'Was du zus\u00e4tzlich beitr\u00e4gst',
        belowText: 'Du zahlst weniger, als du kostest \u2014 den Rest zahlen andere',
        legendTitle: 'Was dein Zusatzbeitrag finanziert (Budgetaufteilung)',
        pctOfExtra: 'des Zusatzbeitrags',
        sources: 'Quelle: EFV Finanzstatistik 2024 (Haushalt \u201eStaat\u201c), FIR ART FNK; ESTV Form 58c 2026; ESTV \u201eSteuersatz und Steuerfuss\u201c 3.4.1 (2026); Kantonsbl\u00e4tter ZH/BE, Zug StG \u00a72; BFS Bev\u00f6lkerung 2024.',
        scope: 'Konsolidierte Staatsrechnung 2024 \u2014 Bund + Kantone + Gemeinden + Sozialversicherungen: insgesamt CHF 29.194 pro Person. Steuer nach Wohnort (Bundes-, Kantons- und Gemeindesteuer); \u00e4ltere Ausf\u00fchrung (nur Bund) untersch\u00e4tzte alles.',
        disclaimer: 'Steuern sind nicht zweckgebunden; diese Aufteilung folgt dem publizierten Budget.'
      },
      noDuty: 'Keine Bundesabgabe auf dieses Produkt',
      ratesPending: '',
      vatLine: vr => `Minus MWST (${(vr * 100).toFixed(1).replace(/\.0$/, '')}%)`,
      taxLine: m => `Plus Einkommens- und Sozialabgaben (${WAIP.pctRate(m)}%)`,
      mult: r => `Du zahlst wirklich <b>${r.toFixed(2)}\u00d7</b> das, was es kosten k\u00f6nnte`,
      take: (res, f) => `Von den <b>${f(res.gross)}</b>, die du verdienst, um das zu kaufen, gehen <b>${f(res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)} %) an den Staat: <b>${f(res.itax)}</b> Einkommenssteuer, <b>${f(res.vat)}</b> MWST und <b>${f(res.duty)}</b> Bundesabgaben.`,
      warnNeg: 'Abgaben und MWST \u00fcbersteigen zusammen den Preis. Vielleicht ist der Preis zu tief f\u00fcr dieses Produkt, oder es wird mit Verlust verkauft.',
      notesTitle: 'Verwendete Tarife (CH, 2026)',
      notesCaveatsTitle: 'Was diese Rechnung nicht zeigt',
      notesRates: 'MWST 8,1 % (Standard), 2,6 % (reduziert), 3,8 % (Beherbergung), 0 % (Export). Biersteuer pauschal pro hl nach Stammw\u00fcrze: \u2264 10,0\u00b0P CHF 16,88; 10,1\u201314,0\u00b0P CHF 25,32; > 14,0\u00b0P CHF 33,76 (kleine Brauereien bis \u221240 %). Alkoholsteuer CHF 29 pro Liter reinen Alkohols. Tabaksteuer CHF 118,32 pro 1.000 + 25 % des Verkaufspreises. Mineral\u00f6lsteuer Benzin 76,82 Rp./l, Diesel 79,57 Rp./l (inkl. NAF). Quellen: ESTV, BAZG, BAFU (Stand Oktober 2026).',
      notesCaveats: 'Die MWST-Erh\u00f6hung auf 8,5 % (13. AHV) ist nur eine Referendumsvorlage und nicht in Kraft. Wein unterliegt keiner Bundessteuer (kantonale Abgaben m\u00f6glich). Die CO2-Abgabe (CHF 120/t) betrifft nur Heizstoffe. BVG/2. S\u00e4ule und NBU-Pr\u00e4mien sind nicht enthalten; der ALV-Beitrag ist bei CHF 148.200 gedeckelt. Treibstoffpreise stehen auf Rekordstand (Sept./Okt. 2026); alle Preise sind Momentaufnahmen.',
      credit: 'Modularer Umbau des britischen Konzepts \u201cWhat am I actually paying?\u201d',
      panels: {
        alcohol: { cat: 'Getr\u00e4nk', ml: 'Menge (ml)', plato: 'Stammw\u00fcrze (\u00b0Plato)', abv: 'Alkohol (% vol)', hint: 'Bier: Bundessteuer pauschal pro Hektoliter nach Stammw\u00fcrze (\u00b0Plato). Wein: keine Bundessteuer.' },
        drinks: { ml: 'Menge (ml)', band: 'Art' },
        cigs: { sticks: 'Anzahl Zigaretten' },
        fuel: { litres: 'Liter', type: 'Treibstoff' },
        energy: { kwh: 'Strom (kWh)', m3: 'Gas (m\u00b3)' },
        custom: { fix: 'Feste Abgabe (CHF)', pct: 'Abgabe in % des Preises' },
        vape: { ml: 'Fl\u00fcssigkeit (ml)' }
      },
      receipt: {
        sub: 'Echte Kosten aufgeschl\u00fcsselt',
        hReal: 'Was du wirklich zahlst', hRealD: 'Bruttolohn, um das zu kaufen',
        hCould: 'Was es kosten k\u00f6nnte', hCouldD: 'Preis ohne Bundesabgaben, MWST und Einkommenssteuer',
        priceLine: 'Preis im Gesch\u00e4ft',
        dutyLine: 'Minus Bundesabgaben',
        underLine: 'Was es kosten k\u00f6nnte',
        underSub: 'Preis minus MWST und Bundesabgaben',
        grossLine: 'Was du wirklich zahlst',
        legendUnder: 'Verk\u00e4ufer', legendDuty: 'Bundesabgaben', legendVat: 'MWST', legendTax: 'Einkommenssteuer'
      }
    },
    copyEn: {
      langLabel: 'Language',
      docTitle: 'What am I actually paying?',
      title: 'What am I actually paying?',
      lede: 'What you really pay is the gross wage you earn to buy something. What it could cost is the price without federal duties, without VAT and without income tax on your money.',
      countryLabel: 'Country',
      itemLabel: 'Product',
      priceLabel: 'Price in the shop / bar',
      priceHint: 'Defaults are typical prices (Autumn 2026). Enter what you actually paid.',
      vatLabel: 'VAT rate',
      vatOptions: [
        { v: 0.081, t: 'Standard, 8.1%', selected: true },
        { v: 0.026, t: 'Reduced, 2.6% (food, books)' },
        { v: 0.038, t: 'Accommodation, 3.8% (hotels)' },
        { v: 0, t: '0% (exports)' }
      ],
      dutyTitle: 'Federal duties',
      taxTitle: 'Your tax',
      taxLabel: 'Marginal rate on your next franc',
      taxHint: 'Federal tax, AHV/IV/EO, ALV and cantonal/municipal taxes (estimates, 2026). Excludes BVG, NBU, church and wealth tax. Custom for your own situation.',
      customRateLabel: 'Own marginal rate (%)',
      customBandLabel: 'Custom',
      showAll: 'Show all',
      showAllHide: 'Hide',
      compare: { item: 'Item', price: 'Price', could: 'What it could cost', real: 'What it really costs', govt: '% to the government' },
      tabs: { receipt: 'Receipt', where: 'Where does my money go?' },
      infoAria: 'More information',
      info: {
        wedge: 'The gross wage you need to earn to buy this: ticket price divided by (1 \u2212 marginal rate). The rate is the band you picked \u2014 an approximation for all of your income.',
        could: 'In order: federal duties come off the VAT-inclusive price first, then VAT, then income tax on your pay. This is not the shop\u2019s purchase price.',
        multiplier: 'How many times more you earn than the price with all taxes removed.',
        duty: 'Every levy besides VAT: beer tax, tobacco tax, mineral oil tax and so on. VAT is shown separately.',
        marginal: 'The rate comes from the band you picked and applies to all of your income above the threshold \u2014 an approximation, not a full bracket calculation.',
        route: 'Tax on this income: Swiss federal direct tax 2026 (single-person tariff) plus cantonal and communal tax via the einfache Steuer with the multipliers of the selected place. The old view showed federal only \u2014 cantons/communes make up about two thirds of the tax (Baar CHF 9,757 vs Bern CHF 22,958 at 100k = 2.4\u00d7).',
        baseline: 'What the state (federal, cantons, communes, social insurance) spends per person on social security on average (2024). If you pay less tax than that, others cover the rest.',
        split: 'Your extra contribution is distributed proportionally over the task areas of the consolidated public accounts. Taxes are not earmarked.',
        effRate: 'The effective rate is tax divided by gross income \u2014 not the marginal rate of your top band.',
        compare: 'Every item at its default values with the selected marginal rate: price, what it could cost, what it really costs, and the share that goes to the state.'
      },
      wheregoes: {
        input: 'Gross yearly income (\u2248 taxable income)',
        taxLabel: 'Your income tax per year',
        directToggle: 'or enter the tax directly',
        grossName: 'Gross salary',
        taxName: 'Income tax',
        placeLabel: 'Place',
        directTag: '(entered directly)',
        incomeDefaultNote: 'Default: ~CHF 100,000 taxable \u2014 matches the Z\u00fcrich standard band.',
        yourLabel: 'Your tax',
        baselineName: 'What you cost (per person)',
        socialBlock: 'What you cost yourself (social security)',
        extraBlock: 'What you contribute extra',
        belowText: 'You pay less than you cost \u2014 others cover the rest',
        legendTitle: 'What your extra contribution finances (budget split)',
        pctOfExtra: 'of the extra contribution',
        sources: 'Source: EFV Finanzstatistik 2024 (household \u201cStaat\u201d), FIR ART FNK; ESTV Form 58c 2026; ESTV \u201cSteuersatz und Steuerfuss\u201d 3.4.1 (2026); ZH/BE cantonal gazettes, canton Zug StG \u00a72; BFS 2024 population.',
        scope: 'Consolidated public accounts 2024 \u2014 federal + cantons + communes + social insurance: CHF 29,194 total per person. Tax by place of residence (federal, cantonal and communal); the earlier federal-only scope understated everything.',
        disclaimer: 'Taxes are not earmarked; this split follows the published budget.'
      },
      noDuty: 'No federal duty on this item',
      ratesPending: '',
      vatLine: vr => `Minus VAT (${(vr * 100).toFixed(1).replace(/\.0$/, '')}%)`,
      taxLine: m => `Plus income and social contributions (${WAIP.pctRate(m)}%)`,
      mult: r => `You really pay <b>${r.toFixed(2)}\u00d7</b> what it could cost`,
      take: (res, f) => `Of the <b>${f(res.gross)}</b> you earn to buy this, <b>${f(res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) goes to the state: <b>${f(res.itax)}</b> income tax, <b>${f(res.vat)}</b> VAT and <b>${f(res.duty)}</b> federal duties.`,
      warnNeg: 'Duties and VAT together exceed the price. The price may be too low for this item, or it is sold at a loss.',
      notesTitle: 'Rates used (CH, 2026)',
      notesCaveatsTitle: 'What this does not show',
      notesRates: 'VAT 8.1% (standard), 2.6% (reduced), 3.8% (accommodation), 0% (exports). Beer duty flat per hl by original wort: \u2264 10.0°P CHF 16.88; 10.1\u201314.0°P CHF 25.32; > 14.0°P CHF 33.76 (small breweries up to \u221240%). Alcohol tax CHF 29 per litre of pure alcohol. Tobacco tax CHF 118.32 per 1,000 + 25% of the retail price. Mineral oil tax petrol 76.82 Rp/l, diesel 79.57 Rp/l (incl. NAF). Sources: ESTV, BAZG, BAFU (October 2026).',
      notesCaveats: 'The VAT increase to 8.5% (13th AHV) is only a referendum proposal, not in force. Wine is not subject to a federal duty (cantonal levies possible). The CO2 levy (CHF 120/t) applies to heating fuels only. BVG/2nd pillar and NBU premiums are not included; the ALV contribution is capped at CHF 148,200. Fuel prices are at record levels (Sept/Oct 2026); all prices are snapshots.',
      credit: 'Modular rebuild of the UK \u201cWhat am I actually paying?\u201d concept.',
      panels: {
        alcohol: { cat: 'Drink type', ml: 'Volume (ml)', plato: 'Original wort (\u00b0Plato)', abv: 'Alcohol (% vol)', hint: 'Beer: federal duty flat per hectolitre by original wort (\u00b0Plato). Wine: no federal duty.' },
        drinks: { ml: 'Volume (ml)', band: 'Type' },
        cigs: { sticks: 'Number of cigarettes' },
        fuel: { litres: 'Litres', type: 'Fuel' },
        energy: { kwh: 'Electricity (kWh)', m3: 'Gas (m\u00b3)' },
        custom: { fix: 'Fixed levy (CHF)', pct: 'Levy as % of price' },
        vape: { ml: 'Liquid (ml)' }
      },
      receipt: {
        sub: 'True cost breakdown',
        hReal: 'What you really pay', hRealD: 'Gross wages earned to buy it',
        hCould: 'What it could cost', hCouldD: 'Price without federal duties, VAT and income tax',
        priceLine: 'Price in the shop',
        dutyLine: 'Minus federal duties',
        underLine: 'What it could cost',
        underSub: 'Price minus VAT and federal duties',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Federal duties', legendVat: 'VAT', legendTax: 'Income tax'
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);