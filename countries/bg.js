/* countries/bg.js — България.
 * Тарифи 2026; източници и цени в countries/bg-rates-2026.md и
 * countries/bg-prices-2026.md (НАП, ЗАДС, държавен бюджет 2026, окт. 2026).
 * От 1.1.2026 България е в еврозоната — фиксиран курс 1.95583 BGN = 1 EUR;
 * всички суми по-долу са в EUR.
 *
 * Механика (BG):
 *  - ДДС се начислява върху цената с акцизи -> първо се вади от пълната цена.
 *  - Бира: € 0,77 на hl на градус Плато (hl × °P × 0,77).
 *  - Вино: без акциз (noDutyLabel на пресета-вино).
 *  - Ракия/спиртни: € 562,42 на hl чист алкохол.
 *  - Цигари: € 77 на 1 000 + 21 % от цената; минимум € 120 на 1 000 (от 1.8.2026).
 *  - Горива: бензин € 0,36302/L; дизел € 0,33029/L.
 *  - Ток за бита: без акциз (noDutyLabel).
 */
(function (g) {
  const WAIP = g.WAIP;
  const num = WAIP.num;

  WAIP.registerCountry({
    code: 'bg',
    name: 'България',
    ratesStatus: 'ok',
    langNative: 'Български',
    currency: { symbol: '€', decimals: 2, decimalComma: true },
    presets: {
      bierBar:   { name: 'Бира в заведение (500 ml, 11°P)', nameEn: 'Beer in a bar (500 ml, 11°P)', price: 4.00, vat: 0.2, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 11 } },
      bierShop:  { name: 'Бира от магазина (500 ml, 11°P)', nameEn: 'Beer from the shop (500 ml, 11°P)', price: 1.00, vat: 0.2, kind: 'alcohol', panel: { cat: 'beer', ml: 500, plato: 11 } },
      vino:      { name: 'Вино (750 ml)', nameEn: 'Wine (750 ml)', price: 5.00, vat: 0.2, kind: 'alcohol', panel: { cat: 'wine', ml: 750, abv: 12.5 }, noDutyLabel: 'Виното не се облага с акциз', noDutyLabelEn: 'Wine is not subject to excise duty' },
      rakiya:    { name: 'Ракия (700 ml, 40 %)', nameEn: 'Rakia (700 ml, 40%)', price: 6.40, vat: 0.2, kind: 'alcohol', panel: { cat: 'spirit', ml: 700, abv: 40 } },
      cigi:      { name: 'Цигари (20 бр.)', nameEn: 'Cigarettes (20)', price: 3.95, vat: 0.2, kind: 'cigs', panel: { sticks: 20 } },
      benzin:    { name: 'Бензин А95 (1 L)', nameEn: 'Petrol A95 (1 L)', price: 1.68, vat: 0.2, kind: 'fuel', panel: { fueltype: 'petrol', litres: 1 } },
      dizel:     { name: 'Дизел (1 L)', nameEn: 'Diesel (1 L)', price: 1.91, vat: 0.2, kind: 'fuel', panel: { fueltype: 'diesel', litres: 1 } },
      tok:       { name: 'Ток (1 kWh)', nameEn: 'Electricity (1 kWh)', price: 0.154, vat: 0.2, kind: 'energy', panel: { kwh: 1, m3: 0 }, noDutyLabel: 'Домакинствата са освободени от акциз върху електроенергията', noDutyLabelEn: 'Households are exempt from excise duty on electricity' },
      hlyab:     { name: 'Хляб (500 g)', nameEn: 'Bread (500 g)', price: 1.00, vat: 0.2, kind: 'none' },
      bigmac:    { name: 'Биг Мак (в ресторанта)', nameEn: 'Big Mac (in the restaurant)', price: 6.10, vat: 0.2, kind: 'none' },
      custom:    { name: 'Друго', nameEn: 'Something else', price: 10.00, vat: 0.2, kind: 'custom', panel: { cfix: 0, cpct: 0 } }
    },
    taxBands: [
      { label: '≈ 22,40 % (до € 2 300/мес — осигуровки + данък)', labelEn: '\u2248 22.40% (up to \u20ac 2,300/month — contributions + tax)', rate: 0.224, selected: true },
      { label: '10 % (над € 2 300/мес — само данък)', labelEn: '10% (above \u20ac 2,300/month — tax only)', rate: 0.1 }
    ],
    panels: {
      alcohol: { cats: [{ v: 'beer', t: 'Бира' }, { v: 'wine', t: 'Вино' }, { v: 'spirit', t: 'Ракия/спиртни' }], draught: false, plato: true },
      fuel: { types: [{ v: 'petrol', t: 'Бензин А95' }, { v: 'diesel', t: 'Дизел' }] }
    },
    computeDuties(state, cfg) {
      const p = state.panel, kind = state.kind, price = state.price;
      const en = state.lang === 'en';
      const out = [];
      if (kind === 'alcohol') {
        const ml = num(p.ml), hl = ml / 100000;
        if (p.cat === 'beer') {
          const plato = num(p.plato);
          out.push({ label: en ? `Beer excise (${plato.toFixed(1)}°P)` : `Акциз бира (${plato.toFixed(1).replace('.', ',')}°P)`, v: hl * plato * 0.77 });
        } else if (p.cat === 'spirit') {
          const hlAlc = ml / 1000 * num(p.abv) / 100 / 100; // hl чист алкохол
          out.push({ label: en ? 'Excise rakia/spirits' : 'Акциз ракия/спиртни напитки', v: hlAlc * 562.42 });
        }
        // вино: без акциз (noDutyLabel)
      } else if (kind === 'cigs') {
        const n = num(p.sticks);
        if (n > 0) {
          const spec = 77 * n / 1000, adv = 0.21 * price, min = 120 * n / 1000;
          if (spec + adv >= min) {
            out.push({ label: en ? 'Cigarette excise (fixed)' : 'Акциз цигари (фиксиран)', v: spec });
            out.push({ label: en ? 'Cigarette excise 21% of price' : 'Акциз цигари 21 % от цената', v: adv });
          } else {
            out.push({ label: en ? `Cigarette excise (minimum € ${min.toFixed(2)})` : `Акциз цигари (минимум € ${min.toFixed(2).replace('.', ',')})`, v: min });
          }
        }
      } else if (kind === 'fuel') {
        const rate = p.fueltype === 'diesel' ? 0.33029 : 0.36302;
        out.push({ label: en ? `Excise ${p.fueltype === 'diesel' ? 'diesel' : 'petrol'}` : `Акциз ${p.fueltype === 'diesel' ? 'дизел' : 'бензин'}`, v: num(p.litres) * rate });
      } else if (kind === 'custom') {
        const f = num(p.cfix), pc = num(p.cpct) / 100;
        if (f) out.push({ label: en ? 'Fixed levy' : 'Фиксирана такса', v: f });
        if (pc) out.push({ label: en ? `Levy ${(pc * 100).toFixed(1)}% of price` : `Такса ${(pc * 100).toFixed(1).replace('.', ',')} % от цената`, v: pc * price });
      }
      return out;
    },
    copy: {
      lang: 'bg',
      langLabel: 'Език',
      docTitle: 'Какво всъщност плащам?',
      title: 'Какво всъщност плащам?',
      lede: 'Това, което наистина плащаш, е брутната заплата, която трябва да изкараш, за да си купиш нещо. Какво би могло да струва — това е цената без акцизи, без ДДС и без данък върху дохода.',
      countryLabel: 'Държава',
      itemLabel: 'Продукт',
      priceLabel: 'Цена в магазина',
      priceHint: 'По подразбиране са типични цени (окт. 2026). Въведи това, което наистина си платил.',
      vatLabel: 'ДДС',
      vatOptions: [
        { v: 0.2, t: '20 % (стандартна)', selected: true },
        { v: 0.09, t: '9 % (намалена: хотели, книги, бебешки стоки)' },
        { v: 0, t: '0 % (износ)' }
      ],
      dutyTitle: 'Акцизи',
      taxTitle: 'Твоите данъци',
      taxLabel: 'Данък и осигуровки на следващото евро',
      taxHint: 'Плосък данък 10 % + осигуровки 13,78 % (таван € 2 300/мес от авг. 2026; над тавана само 10 % данък). Custom за твоята ситуация.',
      customRateLabel: 'Собствена гранична ставка (%)',
      customBandLabel: 'Custom',
      noDuty: 'Без акциз върху този продукт',
      ratesPending: '',
      vatLine: vr => `Минус ДДС (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Плюс данък и осигуровки (${WAIP.pctRate(m).replace('.', ',')}%)`,
      mult: r => `Наистина плащаш <b>${r.toFixed(2).replace('.', ',')}\u00d7</b> от това, което би могло да струва`,
      take: res => `От <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.gross)}</b>, които изкарваш, за да го купиш, <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) отиват за данъци: <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.itax)}</b> данък върху дохода, <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.vat)}</b> ДДС и <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.duty)}</b> акцизи.`,
      warnNeg: 'Акцизите и ДДС заедно надхвърлят цената. Може би цената е твърде ниска за този продукт или магазинът продава на загуба.',
      notesTitle: 'Използвани ставки (България, 2026)',
      notesCaveatsTitle: 'Какво не показва това',
      notesRates: 'ДДС 20 % (стандартна), 9 % (намалена: хотели, книги, бебешки стоки), 0 % (износ). Акцизи: бира € 0,77 на hl на градус Плато; ракия/спиртни напитки € 562,42 на hl чист алкохол; цигари € 77 на 1 000 + 21 % (минимум € 120 на 1 000, от 1.8.2026); бензин € 0,36302/L; дизел € 0,33029/L. Виното и битовият ток са без акциз. Източници: НАП, ЗАДС, държавен бюджет 2026 (окт. 2026).',
      notesCaveats: 'Домашната ракия има дерогация: до 30 л/домакинство годишно, собствена суровина, регистриран казан. Нулевите акцизи за LPG/CNG важат САМО до 31.12.2026. Акцизът на цигарите се промени на 1.8.2026. Ресторантьорските услуги отново са с 20 % ДДС (от 2026). Цените са моментни снимки (окт. 2026).',
      credit: 'Модулен преразказ на британската концепция „What am I actually paying?“',
      panels: {
        alcohol: { cat: 'Вид', ml: 'Обем (ml)', plato: 'Съдържание (°Плато)', abv: 'Алкохол (% об.)', hint: 'Бира: акциз на хектолитър на градус Плато (€ 0,77). Вино: без акциз.' },
        drinks: { ml: 'Обем (ml)', band: 'Вид' },
        cigs: { sticks: 'Брой цигари' },
        fuel: { litres: 'Литри', type: 'Гориво' },
        energy: { kwh: 'Ток (kWh)', m3: 'Газ (m³)' },
        custom: { fix: 'Фиксирана такса (€)', pct: 'Такса в % от цената' },
        vape: { ml: 'Течност (ml)' }
      },
      receipt: {
        sub: 'Реална цена, разбита',
        hReal: 'Какво наистина плащаш', hRealD: 'Брутна заплата, за да го купиш',
        hCould: 'Какво би могло да струва', hCouldD: 'Цена без акцизи, ДДС и данък върху дохода',
        priceLine: 'Цена в магазина',
        dutyLine: 'Минус акцизи',
        underLine: 'Какво би могло да струва',
        underSub: 'Цена минус ДДС и акцизи',
        taxPrefix: 'Данък върху дохода и осигуровки',
        grossLine: 'Какво наистина плащаш',
        legendUnder: 'Продавач', legendDuty: 'Акцизи', legendVat: 'ДДС', legendTax: 'Данъци'
      }
    },
    copyEn: {
      lang: 'en',
      langLabel: 'Language',
      docTitle: 'What am I actually paying?',
      title: 'What am I actually paying?',
      lede: 'What you really pay is the gross wage you earn to buy something. What it could cost is the price without excise duty, without VAT and without income tax on your money.',
      countryLabel: 'Country',
      itemLabel: 'Product',
      priceLabel: 'Price in the shop',
      priceHint: 'Defaults are typical prices (Oct 2026). Enter what you actually paid.',
      vatLabel: 'VAT rate',
      vatOptions: [
        { v: 0.2, t: '20% (standard)', selected: true },
        { v: 0.09, t: '9% (reduced: hotels, books, baby goods)' },
        { v: 0, t: '0% (exports)' }
      ],
      dutyTitle: 'Excise duties',
      taxTitle: 'Your tax',
      taxLabel: 'Tax and contributions on your next euro',
      taxHint: 'Flat 10% tax + 13.78% contributions (capped at \u20ac 2,300/month from Aug 2026; above the cap only 10% tax). Custom for your own situation.',
      customRateLabel: 'Own marginal rate (%)',
      customBandLabel: 'Custom',
      noDuty: 'No excise duty on this item',
      ratesPending: '',
      vatLine: vr => `Minus VAT (${(vr * 100).toFixed(0)}%)`,
      taxLine: m => `Plus income tax and contributions (${WAIP.pctRate(m).replace('.', ',')}%)`,
      mult: r => `You really pay <b>${r.toFixed(2).replace('.', ',')}\u00d7</b> what it could cost`,
      take: res => `Of the <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.gross)}</b> you earn to buy this, <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.govt)}</b> (${(res.govt / res.gross * 100).toFixed(0)}%) goes in tax: <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.itax)}</b> income tax, <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.vat)}</b> VAT and <b>${WAIP.formatMoney({ currency: { symbol: '€', decimalComma: true } }, res.duty)}</b> excise duties.`,
      warnNeg: 'Excise duties and VAT together exceed the price. The price may be too low for this product, or the shop is selling at a loss.',
      notesTitle: 'Rates used (Bulgaria, 2026)',
      notesCaveatsTitle: 'What this does not show',
      notesRates: 'VAT 20% (standard), 9% (reduced: hotels, books, baby goods), 0% (exports). Excise duties: beer \u20ac 0.77 per hl per degree Plato; rakia/spirits \u20ac 562.42 per hl of pure alcohol; cigarettes \u20ac 77 per 1,000 + 21% (minimum \u20ac 120 per 1,000, from 1.8.2026); petrol \u20ac 0.36302/L; diesel \u20ac 0.33029/L. Wine and household electricity are exempt. Sources: NRA, ЗАДС, State Budget Act 2026 (Oct 2026).',
      notesCaveats: 'Domestic rakia has a derogation: up to 30 L/household per year, own fruit, registered still. Zero excise on LPG/CNG applies ONLY until 31.12.2026. The cigarette excise changed on 1.8.2026. Restaurant services are back to 20% VAT (from 2026). Prices are snapshots (Oct 2026).',
      credit: 'Modular rebuild of the UK \u201cWhat am I actually paying?\u201d concept.',
      panels: {
        alcohol: { cat: 'Type', ml: 'Volume (ml)', plato: 'Original wort (°Plato)', abv: 'Alcohol (% vol)', hint: 'Beer: excise per hl per degree Plato (\u20ac 0.77). Wine: no excise.' },
        drinks: { ml: 'Volume (ml)', band: 'Type' },
        cigs: { sticks: 'Number of cigarettes' },
        fuel: { litres: 'Litres', type: 'Fuel' },
        energy: { kwh: 'Electricity (kWh)', m3: 'Gas (m\u00b3)' },
        custom: { fix: 'Fixed levy (\u20ac)', pct: 'Levy as % of price' },
        vape: { ml: 'Liquid (ml)' }
      },
      receipt: {
        sub: 'True cost breakdown',
        hReal: 'What you really pay', hRealD: 'Gross wages earned to buy it',
        hCould: 'What it could cost', hCouldD: 'Price without excise duty, VAT and income tax',
        priceLine: 'Price in the shop',
        dutyLine: 'Minus excise duties',
        underLine: 'What it could cost',
        underSub: 'Price minus VAT and excise duties',
        taxPrefix: 'Income tax and contributions',
        grossLine: 'What you really pay',
        legendUnder: 'Seller', legendDuty: 'Excise', legendVat: 'VAT', legendTax: 'Tax'
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);