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
    currency: { symbol: 'CHF ', decimals: 2 },
    presets: {
      bier:      { name: 'Bier 5 dl in der Bar, 12\u00b0P', price: 7.50, vat: 0.081, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 12 } },
      bier6:     { name: '6er-Pack Bier (6 \u00d7 50 cl, 12\u00b0P)', price: 11.50, vat: 0.081, kind: 'alcohol', panel: { cat: 'beer', ml: 3000, plato: 12 } },
      wein:      { name: 'Weinflasche 75 cl', price: 12.95, vat: 0.081, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 13 }, noDutyLabel: 'Keine Bundessteuer auf Wein \u2014 kantonale Abgaben m\u00f6glich' },
      schnaps:   { name: 'Schnapsflasche 70 cl 40 %', price: 20.00, vat: 0.081, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 40 } },
      zigaretten:{ name: 'Zigaretten 20 Stk', price: 9.40, vat: 0.081, kind: 'cigs', panel: { sticks: 20 } },
      benzin:    { name: 'Benzin 95, 1 L', price: 2.10, vat: 0.081, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      diesel:    { name: 'Diesel, 1 L', price: 2.41, vat: 0.081, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } },
      strom:     { name: 'Strom 1 kWh', price: 0.277, vat: 0.081, kind: 'energy', panel: { kwh: 1, m3: 0 }, noDutyLabel: 'Keine Bundessteuer auf Strom' },
      brot:      { name: 'Brot 500 g', price: 1.00, vat: 0.026, kind: 'none' },
      hotel:     { name: 'Hotel\u00fcbernachtung', price: 120.00, vat: 0.038, kind: 'none' },
      custom:    { name: 'Anderes', price: 10.00, vat: 0.081, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    // Geschätzte Grenzsteuersätze (Bund + AHV/IV/EO + ALV + Kanton/Gemeinde),
    // siehe ch-rates-2026.md; ohne BVG, NBU, Kirchen- und Vermögenssteuer.
    taxBands: [
      { label: 'Bund + Sozialabgaben, mittleres Einkommen \u2248 13.0 %', rate: 0.13 },
      { label: 'Bund + Sozialabgaben, Spitzenverdiener \u2248 16.8 %', rate: 0.168 },
      { label: 'Z\u00fcrich Stadt, ~CHF 100k steuerbar \u2248 32.3 %', rate: 0.323, selected: true },
      { label: 'Gen\u00e8ve Ville, ~CHF 100k \u2248 38.0 %', rate: 0.38 },
      { label: 'Lausanne / VD, ~CHF 100k \u2248 40.1 %', rate: 0.401 },
      { label: 'Spitzenverdiener Z\u00fcrich \u2248 44.6 %', rate: 0.446 },
      { label: 'Spitzenverdiener Genf (GE) \u2248 48.5 %', rate: 0.485 },
      { label: 'Spitzenverdiener Waadt (VD) \u2248 51.8 %', rate: 0.518 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Bier' }, { v: 'wine', t: 'Wein' }, { v: 'spirit', t: 'Spirituosen (>15 % vol)' }], draught: false, plato: true },
      fuel: { types: [{ v: 'petrol', t: 'Benzin 95' }, { v: 'diesel', t: 'Diesel' }] }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const out = [];
      if (kind === 'alcohol') {
        const ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          const plato = num(p.plato);
          const rate = plato <= 10 ? 16.88 : plato <= 14 ? 25.32 : 33.76;
          out.push({ label: `Biersteuer (${plato.toFixed(1)} \u00b0Plato, CHF ${rate.toFixed(2)}/hl)`, v: hl * rate });
        } else if (p.cat === 'spirit') {
          const lpa = ml / 1000 * num(p.abv) / 100;
          out.push({ label: `Alkoholsteuer (${lpa.toFixed(2)} L reiner Alkohol)`, v: lpa * 29 });
        }
        // Wein: keine Bundessteuer (Hinweis über Preset-noDutyLabel)
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          out.push({ label: 'Tabaksteuer (fest)', v: 118.32 * n / 1000 });
          out.push({ label: 'Tabaksteuer 25 % des Preises', v: 0.25 * price });
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? 0.7957 : 0.7682;
        out.push({ label: `Mineral\u00f6lsteuer ${p.fueltype === 'diesel' ? 'Diesel' : 'Benzin'}`, v: num(p.litres) * rate });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: 'Feste Abgabe', v: f });
        if (pc) out.push({ label: `Abgabe ${(pc * 100).toFixed(1)} % des Preises`, v: pc * price });
      }
      return out;
    },
    copy: {
      lang: 'de-CH',
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
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);