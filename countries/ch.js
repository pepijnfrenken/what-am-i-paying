/* countries/ch.js — Schweiz.
 * Tarife 2026 (Stand Okt. 2026); Quellen und Annahmen in
 * countries/ch-rates-2026.md (ESTV, BAZG, BAFU, BSV, kantonale Steuerämter).
 *
 * Mechanik (CH):
 *  - MWST wird über den Preis inkl. Bundesabgaben erhoben -> zuerst vom vollen Preis abgezogen.
 *  - Bier: Bundessteuer pauschal pro hl nach Stammwürze (°Plato):
 *    ≤ 10,0°P CHF 16,88; 10,1–14,0°P CHF 25,32; > 14,0°P CHF 33,76.
 *  - Alkoholsteuer: CHF 29 pro Liter reinen Alkohols.
 *  - Tabaksteuer: CHF 118,32 pro 1.000 + 25 % des Verkaufspreises.
 *  - Mineralölsteuer: Benzin 76,82 Rp./l, Diesel 79,57 Rp./l (inkl. NAF).
 *  - Wein und Strom: keine Bundessteuer (Hinweis über Preset-noDutyLabel).
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  WAIP.registerCountry({
    code: 'ch',
    name: 'Schweiz',
    ratesStatus: 'ok',
    langNative: 'Deutsch',
    salaryDefault: 100000,
    currency: { symbol: 'CHF ', decimals: 2 },
    // Bundesvoranschlag 2026 (Mio. CHF; nur Bund), see where-goes-2026.md
    budget: {
      social: 31823, population: 9127100,
      cats: {
        finanzen: { v: 15116, label: 'Finanzen & Steuern (Finanzausgleich, Kantonsanteile, Zinsen)', labelEn: 'Finance & taxes (fiscal equalisation, cantonal shares, interest)' },
        verkehr: { v: 10734, label: 'Verkehr', labelEn: 'Transport' },
        bildung: { v: 9000, label: 'Bildung & Forschung', labelEn: 'Education & research' },
        sicherheit: { v: 7818, label: 'Sicherheit & Verteidigung', labelEn: 'Security & defence' },
        landwirtschaft: { v: 3710, label: 'Landwirtschaft & Ern\u00e4hrung', labelEn: 'Agriculture & food' },
        ausland: { v: 3807, label: 'Beziehungen zum Ausland (IZA)', labelEn: 'Foreign relations & cooperation' },
        uebrige: { v: 9108, label: '\u00dcbrige Aufgabengebiete (Kultur, Gesundheit, Umwelt, Wirtschaft)', labelEn: 'Other task areas (culture, health, environment, economy)' }
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
    // Geschätzte Grenzsteuersätze (Bund + AHV/IV/EO + ALV + Kanton/Gemeinde),
    // siehe ch-rates-2026.md; ohne BVG, NBU, Kirchen- und Vermögenssteuer.
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
      if (kind === 'alcohol') {
        const ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          const plato = num(p.plato);
          const rate = plato <= 10 ? 16.88 : plato <= 14 ? 25.32 : 33.76;
          out.push({ label: en ? `Beer tax (${plato.toFixed(1)} \u00b0Plato, CHF ${rate.toFixed(2)}/hl)` : `Biersteuer (${plato.toFixed(1)} \u00b0Plato, CHF ${rate.toFixed(2)}/hl)`, v: hl * rate });
        } else if (p.cat === 'spirit') {
          const lpa = ml / 1000 * num(p.abv) / 100;
          out.push({ label: en ? `Alcohol tax (${lpa.toFixed(2)} L pure alcohol)` : `Alkoholsteuer (${lpa.toFixed(2)} L reiner Alkohol)`, v: lpa * 29 });
        }
        // Wein: keine Bundessteuer (Hinweis über Preset-noDutyLabel)
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          out.push({ label: en ? 'Tobacco tax (fixed)' : 'Tabaksteuer (fest)', v: 118.32 * n / 1000 });
          out.push({ label: en ? 'Tobacco tax 25% of price' : 'Tabaksteuer 25 % des Preises', v: 0.25 * price });
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? 0.7957 : 0.7682;
        out.push({ label: en ? `Mineral oil tax ${p.fueltype === 'diesel' ? 'diesel' : 'petrol'}` : `Mineral\u00f6lsteuer ${p.fueltype === 'diesel' ? 'Diesel' : 'Benzin'}`, v: num(p.litres) * rate });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: en ? 'Fixed levy' : 'Feste Abgabe', v: f });
        if (pc) out.push({ label: en ? `Levy ${(pc * 100).toFixed(1)}% of price` : `Abgabe ${(pc * 100).toFixed(1)} % des Preises`, v: pc * price });
      }
      return out;
    },
    // Direkte Bundessteuer 2026, Tarif 58c (ledig) — nur Bund, ohne AHV/ALV
    // und ohne Kantone (ch-rates-2026.md): 0% bis 15.200; 0,77/0,88/2,64/
    // 2,97/5,94/6,60/8,80/11,00/13,20% in den Folgeschritten bis 793.900;
    // darüber 11,5% (Quirk: niedriger als die letzte Stufe).
    incomeTax(gross) {
      const I = Math.max(0, num(gross));
      const caps = [15200, 33200, 43500, 58000, 76200, 82100, 108900, 141500, 185100, 793900];
      const m = [0, 0.0077, 0.0088, 0.0264, 0.0297, 0.0594, 0.066, 0.088, 0.11, 0.132];
      let tax = 0;
      for (let i = 0; i < caps.length; i++) {
        tax += Math.max(0, Math.min(I, caps[i]) - (i ? caps[i - 1] : 0)) * m[i];
      }
      if (I > caps[9]) tax += 0.115 * (I - caps[9]);
      return tax;
    },
    copy: {
      lang: 'de-CH',
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
      wheregoes: {
        input: 'Bruttojahreslohn (\u2248 steuerbares Einkommen)',
        taxLabel: 'Deine Einkommenssteuer pro Jahr',
        directToggle: 'oder Steuer direkt eingeben',
        grossName: 'Bruttojahreslohn',
        taxName: 'Direkte Bundessteuer',
        directTag: '(direkt eingegeben)',
        incomeDefaultNote: 'Standard: ca. CHF 100.000 steuerbar \u2014 entspricht der Standardbande Z\u00fcrich.',
        yourLabel: 'Deine Steuer',
        baselineName: 'Was du kostest (pro Person)',
        socialBlock: 'Was du selbst kostest (Sozialversicherungen)',
        extraBlock: 'Was du zus\u00e4tzlich beitr\u00e4gst',
        belowText: 'Du zahlst weniger, als du kostest \u2014 den Rest zahlen andere',
        legendTitle: 'Was dein Zusatzbeitrag finanziert (Budgetaufteilung)',
        pctOfExtra: 'des Zusatzbeitrags',
        sources: 'Quelle: EFV, Voranschlag 2027 mit IAFP 2028\u20132030, Band 1 (Spalte VA 2026); efv.admin.ch budget 2026; BFS Bevölkerung 9.127.100 (31-12-2025).',
        scope: 'Nur der Bundesvoranschlag 2026 \u2014 Kantone und Gemeinden tragen rund zwei Drittel der gesamten Staatsausgaben und sind hier nicht enthalten.',
        disclaimer: 'Steuern sind nicht zweckgebunden; diese Aufteilung folgt dem publizierten Budget.'
      },
      noDuty: 'Keine Bundesabgabe auf dieses Produkt',
      ratesPending: '',
      vatLine: vr => `Minus MWST (${(vr * 100).toFixed(1).replace(/\.0$/, '')}%)`,
      taxLine: m => `Plus Einkommens- und Sozialabgaben (${WAIP.pctRate(m)}%)`,
      mult: r => `Du zahlst wirklich <b>${r.toFixed(2)}\u00d7</b> das, was es kosten k\u00f6nnte`,
      take: res => `Von den <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.gross)}</b>, die du verdienst, um das zu kaufen, gehen <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)} %) an den Staat: <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.itax)}</b> Einkommenssteuer, <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.vat)}</b> MWST und <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.duty)}</b> Bundesabgaben.`,
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
        taxPrefix: 'Einkommens- und Sozialabgaben',
        grossLine: 'Was du wirklich zahlst',
        legendUnder: 'Verk\u00e4ufer', legendDuty: 'Bundesabgaben', legendVat: 'MWST', legendTax: 'Einkommenssteuer'
      }
    },
    copyEn: {
      lang: 'en',
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
      wheregoes: {
        input: 'Gross yearly income (\u2248 taxable income)',
        taxLabel: 'Your income tax per year',
        directToggle: 'or enter the tax directly',
        grossName: 'Gross salary',
        taxName: 'Federal direct tax',
        directTag: '(entered directly)',
        incomeDefaultNote: 'Default: ~CHF 100,000 taxable \u2014 matches the Z\u00fcrich standard band.',
        yourLabel: 'Your tax',
        baselineName: 'What you cost (per person)',
        socialBlock: 'What you cost yourself (social security)',
        extraBlock: 'What you contribute extra',
        belowText: 'You pay less than you cost \u2014 others cover the rest',
        legendTitle: 'What your extra contribution finances (budget split)',
        pctOfExtra: 'of the extra contribution',
        sources: 'Source: EFV Voranschlag 2027 with IAFP 2028\u20132030, Volume 1 (VA 2026 column); efv.admin.ch budget 2026; BFS population 9,127,100 (31-12-2025).',
        scope: 'Federal budget 2026 only \u2014 cantons and communes run about two thirds of total public spending and are not in this split.',
        disclaimer: 'Taxes are not earmarked; this split follows the published budget.'
      },
      noDuty: 'No federal duty on this item',
      ratesPending: '',
      vatLine: vr => `Minus VAT (${(vr * 100).toFixed(1).replace(/\.0$/, '')}%)`,
      taxLine: m => `Plus income and social contributions (${WAIP.pctRate(m)}%)`,
      mult: r => `You really pay <b>${r.toFixed(2)}\u00d7</b> what it could cost`,
      take: res => `Of the <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.gross)}</b> you earn to buy this, <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) goes to the state: <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.itax)}</b> income tax, <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.vat)}</b> VAT and <b>${WAIP.formatMoney({ currency: { symbol: 'CHF ' } }, res.duty)}</b> federal duties.`,
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
        taxPrefix: 'Income and social contributions',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Federal duties', legendVat: 'VAT', legendTax: 'Income tax'
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);