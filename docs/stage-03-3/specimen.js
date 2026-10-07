/* Stage 03.3 page-experience specimen. Data: Al Aliah staging, 7 Oct 2026.
   Plain JS on purpose: the production build decides the stack (D-004). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  var IMG = function (n) { return 'img/' + n + '.jpg'; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var site = $('#site'), stage = $('#stage');
  var isMobile = function () { return site.clientWidth <= 760; };

  /* ---------- Name-fit rule (server-side in production) ---------- */
  var bind = function (n) { return n.replace(/\b(Al|Bin|Abu|Bani)\s/g, '$1 '); };
  var nmCls = function (en, ar) { return (en.length >= 19 ? 'n3' : en.length >= 13 ? 'n2' : 'n1') + ((ar || '').length > 14 ? ' ar-long' : ''); };
  function lockup(en, ar, extra) {
    return '<div class="nm ' + nmCls(en, ar) + (extra ? ' ' + extra : '') + '"><span class="en">' + esc(bind(en)) + '</span>' + (ar ? '<span class="ar" lang="ar" dir="rtl">' + ar + '</span>' : '') + '</div>';
  }

  /* ============================================================
     Geography: stylised Abu Dhabi from 02.5c (approximate, not for navigation)
     ============================================================ */
  var ISL = {
    island: 'M70 318 C95 272 160 252 230 240 C300 228 360 222 410 236 C470 252 520 292 566 338 C602 374 628 410 618 436 C596 452 540 446 470 434 C390 420 300 408 220 392 C150 378 92 360 70 318 Z',
    reem: 'M430 196 C462 180 516 182 548 204 C566 222 556 250 530 260 C496 270 456 262 436 242 C424 228 422 208 430 196 Z',
    saadiyat: 'M552 118 C600 92 680 84 742 100 C770 110 772 140 748 158 C708 182 640 188 590 176 C556 166 538 140 552 118 Z',
    yas: 'M786 158 C812 136 862 134 900 152 C930 170 934 214 914 244 C892 270 846 278 812 262 C786 246 774 206 786 158 Z',
    hud: 'M150 420 C170 408 214 410 230 424 C226 440 190 448 160 440 C148 434 146 426 150 420 Z',
    main: 'M-40 520 C90 506 170 494 250 488 C340 482 420 482 500 476 C570 470 620 456 652 430 C690 400 730 378 780 356 C840 330 920 306 1040 288 L1040 760 L-40 760 Z'
  };
  var OPEN = ['M470 330 C492 320 520 330 540 350 C546 366 530 376 512 372 C490 366 472 350 470 330 Z', 'M826 200 C846 190 872 196 884 214 C880 230 858 236 840 228 C828 222 822 210 826 200 Z', 'M610 640 C650 630 700 632 740 646 L742 700 L606 700 Z', 'M268 300 C290 292 312 300 318 316 C304 326 280 326 268 314 Z'];
  var COMM = {
    'Al Khalidiya':            { c: [150, 316], d: 'M118 300 L176 290 L184 328 L124 338 Z', lp: [152, 356, 'middle'], ar: 'الخالدية' },
    'Al Reem Island':          { c: [492, 226], d: 'M452 206 C478 194 520 196 538 212 C546 232 532 248 506 252 C480 256 458 246 450 230 Z', lp: [492, 178, 'middle'], ar: 'جزيرة الريم' },
    'Saadiyat Island':         { c: [652, 138], d: 'M572 126 C610 106 676 100 728 112 C748 120 746 140 728 152 C694 170 636 174 596 166 C574 158 564 140 572 126 Z', lp: [652, 74, 'middle'], ar: 'جزيرة السعديات' },
    'Yas Island':              { c: [856, 206], d: 'M800 168 C822 150 864 148 892 162 C914 178 916 212 902 236 C884 258 848 264 822 252 C800 238 792 200 800 168 Z', lp: [858, 126, 'middle'], ar: 'جزيرة ياس' },
    'Al Raha':                 { c: [804, 370], d: 'M738 384 C760 368 800 354 846 342 L866 338 L874 370 C836 382 790 396 750 406 Z', lp: [790, 334, 'middle'], ar: 'الراحة' },
    'Khalifa City':            { c: [806, 462], d: 'M732 428 C780 420 836 414 872 418 L884 496 C838 506 780 510 742 508 Z', lp: [808, 530, 'middle'], ar: 'مدينة خليفة' },
    'Masdar City':             { c: [918, 452], d: 'M898 434 L940 430 L944 470 L902 474 Z', lp: [920, 494, 'middle'], ar: 'مدينة مصدر' },
    'Al Reef Downtown':        { c: [960, 344], d: 'M936 326 L982 320 L988 362 L942 368 Z', lp: [990, 392, 'end'], ar: 'الريف' },
    'Mohammed Bin Zayed City': { c: [606, 556], d: 'M540 524 C590 516 640 514 664 520 L672 590 C620 598 572 600 548 594 Z', lp: [606, 614, 'middle'], ar: 'مدينة محمد بن زايد' },
    'Madinat Al Riyad':        { c: [612, 656], d: 'M552 630 L672 624 L678 682 L556 688 Z', lp: [690, 660, 'start'], ar: 'مدينة الرياض' }
  };
  var ROADS = {
    mw: ['M300 238 C390 204 480 166 560 142 C640 120 700 112 744 122 C772 130 790 146 806 168 C840 200 872 226 884 256 C894 284 888 312 876 340 C866 380 860 420 862 470 C864 560 860 640 858 720',
         'M150 330 C270 348 420 374 540 404 C590 416 626 430 660 440 C730 430 810 416 890 400 C940 390 990 382 1040 376',
         'M-40 540 C120 524 300 512 470 506 C600 500 720 490 800 486 C900 482 970 476 1040 470'],
    ar: ['M210 250 C240 300 260 350 280 396', 'M330 232 C350 300 370 360 392 414', 'M450 248 C462 300 480 360 504 426', 'M120 300 C250 290 380 290 520 306', 'M610 434 C612 470 608 510 606 600', 'M736 470 C800 466 860 462 930 456', 'M944 360 C948 400 946 430 940 452']
  };
  var DUBAI = [
    { n: 'Business Bay', ar: 'الخليج التجاري', projects: 2, img: 'aquarise-render', imgAlt: 'Developer render: a curved residential tower beside a highway' },
    { n: 'Dubai South', ar: 'دبي الجنوب', projects: 1, img: 'venice-render', imgAlt: 'Developer render: apartment towers around a lagoon' },
    { n: 'Jumeirah Beach Residence', ar: 'جميرا بيتش ريزيدنس', projects: 0 },
    { n: 'Dubai Creek', ar: 'خور دبي', projects: 0 },
    { n: 'Dubai Investment Park', ar: 'مجمع دبي للاستثمار', projects: 0 }
  ];

  /* ============================================================
     Data: the 11 staging listings (legacy IDs), structured fields only
     ============================================================ */
  var L = [
    { id: 30964, ref: 'AA-1001', pur: 'sale', comp: 'ready', type: 'apartment', a: 'Al Reef Downtown', b: 1, ba: 1, s: 480, pr: 699000, img: 'reef-room', alt: 'Empty room with a window and a tiled floor', xy: [952, 340] },
    { id: 30967, ref: 'AA-1002', pur: 'rent', comp: 'ready', type: 'apartment', a: 'Al Raha', b: 4, ba: 5, s: null, pr: 280000, img: 'raha-apt-living', alt: 'Furnished living room with a large chandelier and full-height windows', xy: [812, 362] },
    { id: 31002, ref: 'AA-1003', pur: 'rent', comp: 'ready', type: 'apartment', a: 'Al Khalidiya', b: 2, ba: 2, s: 1100, pr: 80000, img: 'khalidiya-room', feat: true, alt: 'Empty room with arched windows and a white tiled floor', xy: [144, 310] },
    { id: 31013, ref: 'AA-1004', pur: 'rent', comp: 'ready', type: 'apartment', a: 'Al Reem Island', b: 1, ba: 2, s: 915, pr: 105000, img: 'reem-living', alt: 'Furnished living room with a dark sofa and a glass door to the balcony', xy: [492, 226] },
    { id: 31023, ref: 'AA-1005', pur: 'rent', comp: 'ready', type: 'apartment', a: 'Al Khalidiya', b: 5, ba: 5, s: 2400, pr: 180000, img: 'khalidiya-villa', feat: true, alt: 'Two-storey villa frontage with garage doors, beside a mosque', xy: [160, 322] },
    { id: 31082, ref: 'AA-1006', pur: 'sale', comp: 'ready', type: 'apartment', a: 'Al Reef Downtown', b: 2, ba: 2, s: 1354, pr: 1170000, img: 'reef-balcony', alt: 'Balcony view over mid-rise apartment buildings and a lawn', xy: [966, 350] },
    { id: 31083, ref: 'AA-1007', pur: 'sale', comp: 'offplan', type: 'townhouse', a: 'Khalifa City', b: 4, ba: 4, s: 4075, pr: 3936708, img: 'khalifa-render', render: true, alt: 'Developer render: aerial view of townhouse rows with private pools', xy: [806, 462] },
    { id: 31094, ref: 'AA-1008', pur: 'sale', comp: 'offplan', type: 'apartment', a: 'Al Raha', b: 2, ba: 3, s: 1157, pr: 3481025, img: 'raha-render-aerial', render: true, alt: 'Developer render: aerial view of towers on a landscaped waterfront', xy: [842, 354], handover: 'Q1 2029', plan: [10, 75, 15] },
    { id: 31495, ref: 'AA-1009', pur: 'sale', comp: 'ready', type: 'villa', a: 'Madinat Al Riyad', b: 5, ba: 6, s: 11510, pr: 3800000, img: 'riyad-villa', feat: true, alt: 'Two-storey villa with a paved forecourt under a bright sky', xy: [612, 656] },
    { id: 31521, ref: 'AA-1010', pur: 'rent', comp: 'ready', type: 'villa', a: 'Yas Island', b: 5, ba: 6, s: 5948, pr: 420000, img: 'yas-ext', alt: 'Contemporary two-storey villa with a timber panel, garage and a street tree', xy: [856, 206] },
    { id: 31571, ref: 'AA-1011', pur: 'rent', comp: 'ready', type: 'villa', a: 'Al Raha', b: 3, ba: 5, s: 1979, pr: 219999, img: 'raha-row-3', alt: 'Row of two-storey townhouses with covered parking', xy: [776, 382] }
  ];
  var byId = function (id) { return L.filter(function (x) { return String(x.id) === String(id); })[0]; };
  var DETAIL = { 31521: 'rich', 31013: 'sparse' };
  var NUMW = ['Studio', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  var title = function (x) { return (x.b === 0 ? 'Studio' : NUMW[x.b] + '-bedroom') + ' ' + x.type; };
  var PUR = { rent: 'For rent', ready: 'Ready to buy', offplan: 'Off-plan' };
  var purLbl = function (x) { return x.pur === 'rent' ? PUR.rent : PUR[x.comp]; };
  var DEV = ['Arada', 'Azizi Developments', 'Binghatti Developers', 'Burtville Developments', 'Damac Properties', 'Danube Properties', 'Dubai Properties', 'Ellington Properties', 'Emaar Properties', 'MAG Property Development', 'Meraas', 'Nakheel', 'Nine Yards Developments', 'Omniyat', 'Reportage Properties', 'Saas Properties', 'Sobha Realty'];
  var DEV_PROJ = { 'Binghatti Developers': 'Binghatti Aquarise', 'Danube Properties': 'Bayz 102' };

  function stats(list) {
    var o = {};
    list.forEach(function (x) { o[x.a] = (o[x.a] || 0) + 1; });
    return o;
  }

  /* ============================================================
     Shared: map
     ============================================================ */
  var maps = [];
  function mapSVG(o) {
    var land = Object.keys(ISL).map(function (k) { return ISL[k]; });
    var counts = o.counts || {};
    var s = '<svg viewBox="' + o.vb + '" preserveAspectRatio="' + (o.par || 'xMidYMid slice') + '" role="' + (o.interactive ? 'group' : 'img') + '" aria-label="' + esc(o.label) + '">';
    s += land.map(function (d) { return '<path class="m-shelf2" d="' + d + '"/>'; }).join('') + land.map(function (d) { return '<path class="m-shelf" d="' + d + '"/>'; }).join('');
    s += land.map(function (d) { return '<path class="m-land" d="' + d + '"/>'; }).join('');
    s += OPEN.map(function (d) { return '<path class="m-open" d="' + d + '"/>'; }).join('');
    ['ar', 'mw'].forEach(function (c) { s += ROADS[c].map(function (d) { return '<path class="m-road-c ' + c + '" d="' + d + '"/><path class="m-road ' + c + '" d="' + d + '"/>'; }).join(''); });
    Object.keys(COMM).forEach(function (k) { s += '<path class="m-comm' + (o.interactive ? ' link' : '') + '" data-a="' + k + '" d="' + COMM[k].d + '"/>'; });
    Object.keys(COMM).forEach(function (k) { s += '<path class="m-red" data-a="' + k + '" pathLength="1" d="' + COMM[k].d + '"/>'; });
    if (o.water !== false) s += '<text class="m-t water" x="250" y="150" data-ax="250" data-ay="150">Arabian Gulf</text><text class="m-t ctx" x="330" y="352" data-ax="330" data-ay="352" text-anchor="middle">Abu Dhabi Island</text>';
    Object.keys(COMM).forEach(function (k) {
      var lp = COMM[k].lp;
      s += '<g data-ax="' + lp[0] + '" data-ay="' + lp[1] + '"><text class="m-t comm" text-anchor="' + lp[2] + '" x="' + lp[0] + '" y="' + lp[1] + '">' + k + '</text>' +
        '<text class="m-t comm-ar" text-anchor="' + lp[2] + '" x="' + lp[0] + '" y="' + (lp[1] + 14) + '" lang="ar" direction="rtl">' + COMM[k].ar + '</text></g>';
    });
    Object.keys(COMM).forEach(function (a) {
      var c = COMM[a].c, n = counts[a] || 0, r = n <= 1 ? 10 : n <= 5 ? 13 : 16;
      s += '<g class="cl' + (n ? '' : ' zero') + '" data-a="' + a + '" data-ax="' + c[0] + '" data-ay="' + c[1] + '"' + (o.interactive && n ? ' tabindex="0" role="button" aria-label="' + esc(a + ': ' + n + (n === 1 ? ' home' : ' homes')) + '"' : '') + '><circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + r + '"/><text x="' + c[0] + '" y="' + c[1] + '">' + n + '</text></g>';
    });
    if (o.plots) {
      o.plots.forEach(function (x) {
        s += '<g class="plot" data-id="' + x.id + '" data-ax="' + x.xy[0] + '" data-ay="' + x.xy[1] + '"><rect x="' + (x.xy[0] - 5) + '" y="' + (x.xy[1] - 5) + '" width="10" height="10"/></g>';
      });
    }
    return s + '</svg>';
  }
  function fitSymbols(svg) {
    var r = svg.getBoundingClientRect(); if (!r.width) return;
    var vb = svg.viewBox.baseVal, slice = (svg.getAttribute('preserveAspectRatio') || '').indexOf('slice') >= 0;
    var sx = vb.width / r.width, sy = vb.height / r.height, k = slice ? Math.min(sx, sy) : Math.max(sx, sy);
    svg.style.setProperty('--k', k);
    $$('[data-ax]', svg).forEach(function (el) {
      var x = el.getAttribute('data-ax'), y = el.getAttribute('data-ay');
      el.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + k + ') translate(' + -x + ' ' + -y + ')');
    });
  }
  function mountMap(el, o) {
    el.innerHTML = mapSVG(o) + '<div class="callout" aria-hidden="true"><img alt=""><div><b></b><span></span></div></div><span class="attr">Stylised geography</span>';
    if (o.zoom === 'city') el.classList.add('z-city');
    var svg = el.querySelector('svg');
    var m = { el: el, svg: svg, o: o };
    maps.push(m);
    fitSymbols(svg);
    return m;
  }
  function setCounts(m, counts) {
    $$('.cl', m.svg).forEach(function (g) {
      var a = g.getAttribute('data-a'), n = counts[a] || 0, c = g.querySelector('circle');
      g.classList.toggle('zero', !n);
      g.querySelector('text').textContent = n;
      c.setAttribute('r', n <= 1 ? 10 : n <= 5 ? 13 : 16);
      if (m.o.interactive) { if (n) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', a + ': ' + n + (n === 1 ? ' home' : ' homes')); } else { g.removeAttribute('tabindex'); g.removeAttribute('role'); g.removeAttribute('aria-label'); } }
    });
  }
  function redline(m, a, cls) {
    $$('.m-red', m.svg).forEach(function (p) { p.classList.toggle(cls || 'on', !!a && p.getAttribute('data-a') === a); });
    $$('.cl', m.svg).forEach(function (g) { g.classList.toggle('hot', !!a && g.getAttribute('data-a') === a && (cls || 'on') === 'on'); });
  }
  function callout(m, a, img, big, small) {
    var co = m.el.querySelector('.callout');
    if (!a) { co.classList.remove('on'); return; }
    var c = COMM[a].c, pt = m.svg.createSVGPoint(); pt.x = c[0]; pt.y = c[1];
    var ctm = m.svg.getScreenCTM(); if (!ctm) return;
    var sp = pt.matrixTransform(ctm), r = m.el.getBoundingClientRect();
    var lx = sp.x - r.left, ly = sp.y - r.top;
    co.style.left = lx + 'px'; co.style.top = Math.min(r.height - 90, Math.max(90, ly)) + 'px';
    co.classList.toggle('flip', lx > r.width * .55);
    var im = co.querySelector('img'); if (img) { im.src = IMG(img); im.hidden = false; } else { im.hidden = true; }
    co.querySelector('b').textContent = big; co.querySelector('span').textContent = small;
    co.classList.add('on');
  }
  var ro = ('ResizeObserver' in window) ? new ResizeObserver(function () { refit(); }) : null;
  function refit() {
    maps.forEach(function (m) { if (m.el.offsetParent) fitSymbols(m.svg); });
    frameStrips(document);
  }

  /* ============================================================
     Shared: Site select card
     ============================================================ */
  function strip(x) {
    var land = Object.keys(ISL).map(function (k) { return ISL[k]; });
    return '<svg viewBox="0 0 10 10" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      land.map(function (d) { return '<path class="m-shelf" d="' + d + '"/>'; }).join('') + land.map(function (d) { return '<path class="m-land" d="' + d + '"/>'; }).join('') +
      ROADS.mw.map(function (d) { return '<path class="m-road-c mw" d="' + d + '"/><path class="m-road mw" d="' + d + '"/>'; }).join('') +
      '<path class="m-comm" d="' + COMM[x.a].d + '"/><path class="m-red" pathLength="1" d="' + COMM[x.a].d + '"/>' +
      '<rect class="pm" data-ax="' + x.xy[0] + '" data-ay="' + x.xy[1] + '" x="' + (x.xy[0] - 5) + '" y="' + (x.xy[1] - 5) + '" width="10" height="10" fill="#14191E" stroke="#fff" stroke-width="2"/></svg>';
  }
  function frameStrips(root) {
    $$('.sc .strip svg', root).forEach(function (svg) {
      var r = svg.getBoundingClientRect(); if (!r.width) return;
      var bb = svg.querySelector('.m-comm').getBBox(), h = Math.max(bb.height * 1.9, 46), w = h * r.width / r.height;
      svg.setAttribute('viewBox', [bb.x + bb.width / 2 - w * .5, bb.y + bb.height / 2 - h * .42, w, h].map(function (v) { return v.toFixed(1); }).join(' '));
      var k = h / r.height; svg.style.setProperty('--k', k);
      $$('[data-ax]', svg).forEach(function (el) { var X = el.getAttribute('data-ax'), Y = el.getAttribute('data-ay'); el.setAttribute('transform', 'translate(' + X + ' ' + Y + ') scale(' + k + ') translate(' + -X + ' ' + -Y + ')'); });
    });
  }
  function card(x, o) {
    o = o || {};
    var rent = x.pur === 'rent';
    var psf = (!rent && x.s) ? 'AED ' + fmt(Math.round(x.pr / x.s)) + ' per sq ft' : (rent ? 'Annual rent' : '');
    var facts = [[x.b, x.b === 1 ? 'bedroom' : 'bedrooms'], [x.ba, x.ba === 1 ? 'bathroom' : 'bathrooms']];
    var href = DETAIL[x.id] ? '#property/' + DETAIL[x.id] : '#property/' + x.id;
    var on = shortlist.indexOf(x.id) >= 0;
    var ttl = title(x);
    return '<article class="sc' + (o.lg ? ' lg' : '') + (on ? ' is-short' : '') + '" data-id="' + x.id + '" data-a="' + esc(x.a) + '">' +
      '<div class="ph"><div class="cut"><img src="' + IMG(x.img) + '" alt="' + esc(x.alt) + '" width="800" height="600" loading="lazy"></div>' +
      '<span class="purpose">' + purLbl(x) + '</span><span class="mark" aria-hidden="true"></span>' + (x.render ? '<span class="ph-tag">Developer render</span>' : '') +
      '<div class="plate"><b class="num">' + fmt(x.pr) + '</b><span class="lbl">AED' + (rent ? ' per year' : '') + '</span></div></div>' +
      '<div class="bd"><h3><a href="' + href + '" data-detail="' + x.id + '">' + esc(ttl[0].toUpperCase() + ttl.slice(1)) + '</a></h3></div>' +
      '<div><div class="strip">' + strip(x) + '<div class="lk"><span class="en">' + esc(bind(x.a)) + '</span><span class="ar" lang="ar" dir="rtl">' + COMM[x.a].ar + '</span></div></div>' +
      '<dl class="facts">' + facts.map(function (f) { return '<div><dd class="num">' + f[0] + '</dd><dt class="lbl">' + f[1] + '</dt></div>'; }).join('') +
        (x.s ? '<div><dd class="num">' + fmt(x.s) + '</dd><dt class="lbl">sq ft</dt></div>' : '<div class="na"><dd>Area not listed</dd></div>') + '</dl>' +
      '<div class="cf"><p class="sec2" data-sec="' + esc(psf) + '">' + (on ? 'On your shortlist' : esc(psf)) + '</p><button type="button" class="sl" aria-pressed="' + on + '" aria-label="Shortlist: ' + esc(ttl + ', ' + x.a) + '">Shortlist</button></div></div></article>';
  }

  /* ---------- Shortlist (shared across pages) ---------- */
  var shortlist = [31571];
  function renderShort() {
    $$('.sc').forEach(function (c) {
      var id = +c.getAttribute('data-id'), on = shortlist.indexOf(id) >= 0;
      c.classList.toggle('is-short', on);
      var b = c.querySelector('.sl'); if (b) b.setAttribute('aria-pressed', on);
      var r = c.querySelector('.strip .m-red'); if (r) r.classList.toggle('keep', on);
      var pm = c.querySelector('.strip .pm'); if (pm) pm.setAttribute('fill', on ? '#B0122C' : '#14191E');
      var sec = c.querySelector('.sec2'); if (sec) sec.textContent = on ? 'On your shortlist' : sec.getAttribute('data-sec');
    });
    $$('.slc').forEach(function (b) { b.classList.toggle('has', shortlist.length > 0); var n = b.querySelector('.n'); if (n) n.textContent = shortlist.length; b.setAttribute('aria-label', 'Shortlist, ' + shortlist.length + (shortlist.length === 1 ? ' home' : ' homes')); });
    $$('.tray').forEach(function (t) {
      t.classList.toggle('on', shortlist.length > 0);
      t.querySelector('.n').textContent = shortlist.length;
      t.querySelector('.l').textContent = shortlist.length === 1 ? 'home on your shortlist' : 'homes on your shortlist';
      t.querySelector('.t').innerHTML = shortlist.map(function (id) { var x = byId(id); return '<img src="' + IMG(x.img) + '" alt="' + esc(title(x) + ', ' + x.a) + '">'; }).join('');
    });
    var pb = $('#p-short'); if (pb) pb.setAttribute('aria-pressed', shortlist.indexOf(curProp().id) >= 0);
  }
  function toggleShort(id) {
    var i = shortlist.indexOf(id);
    if (i >= 0) shortlist.splice(i, 1); else shortlist.push(id);
    renderShort();
    say(i >= 0 ? 'Removed from your shortlist.' : 'Added to your shortlist.');
  }
  var tray = function () { return '<div class="tray" role="status"><span class="n">0</span><span class="l">homes on your shortlist</span><span class="t"></span><button type="button" class="tray-clear">Clear</button></div>'; };
  function say(t) { var l = $('#live'); l.textContent = ''; setTimeout(function () { l.textContent = t; }, 30); }
  var toastT;
  function toast(t) {
    var el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); el.style.cssText = 'position:fixed;z-index:140;inset-block-end:18px;inset-inline-start:50%;transform:translateX(-50%);background:#20282D;color:#E9EEF0;padding:10px 16px;font:500 .9rem var(--ft);max-width:min(90vw,520px);box-shadow:0 14px 30px -18px rgba(0,0,0,.6)'; document.body.appendChild(el); }
    el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, 3600);
  }

  /* ============================================================
     Header, menu, footer
     ============================================================ */
  var NAV = [['buy', 'Buy', '#search'], ['rent', 'Rent', '#search/rent'], ['offplan', 'Off-plan', '#home/offplan'], ['areas', 'Areas'], ['dev', 'Developers', '#home/developers'], ['about', 'About Us', '#home/advice']];
  function header(cur) {
    var nav = NAV.map(function (n) {
      if (n[0] === 'areas') return '<li><button type="button" class="dd" aria-expanded="false" aria-controls="m-areas"' + (cur === 'areas' ? ' aria-current="page"' : '') + '>Areas</button>' +
        '<div class="menu" id="m-areas" hidden><a href="#home/communities"><span>Abu Dhabi</span><span lang="ar" dir="rtl">أبوظبي</span></a><a href="#home/dubai"><span>Dubai</span><span lang="ar" dir="rtl">دبي</span></a><a href="#area"><span>Al Raha</span><span lang="ar" dir="rtl">الراحة</span></a></div></li>';
      return '<li><a href="' + n[2] + '"' + (cur === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a></li>';
    }).join('');
    $('#sh').innerHTML = '<div class="wrap"><a class="wm" href="#home" aria-label="Al Aliah International, home"><b>Al Aliah</b><span>INTERNATIONAL</span></a>' +
      '<nav aria-label="Main"><ul class="nav">' + nav + '</ul></nav>' +
      '<div class="tools"><a class="slc" href="#search" aria-label="Shortlist"><span class="n">0</span></a><a class="lang" href="#" lang="ar" data-rtl>العربية</a><a class="btn ink sm" href="#property/rich" data-contact>Contact</a><button type="button" class="burger" aria-haspopup="dialog" aria-controls="mnav">Menu</button></div></div>';
    var mn = $('#mnav');
    mn.innerHTML = '<div class="in"><div class="top"><span class="wm"><b style="color:var(--on-shade)">Al Aliah</b><span style="color:var(--on-shade-2)">INTERNATIONAL</span></span><button type="button" class="close" data-close>Close</button></div>' +
      '<ul>' + [['Buy', 'شراء', '#search'], ['Rent', 'إيجار', '#search/rent'], ['Off-plan', 'على الخارطة', '#home/offplan'], ['Areas', 'المناطق', '#home/communities'], ['Developers', 'المطورون', '#home/developers'], ['About Us', 'من نحن', '#home/advice']].map(function (n) {
        return '<li><a href="' + n[2] + '" data-close><span class="d">' + n[0] + '</span><span lang="ar" dir="rtl">' + n[1] + '</span></a></li>'; }).join('') + '</ul>' +
      '<div style="display:grid;gap:10px"><a class="btn on-shade" href="#property/rich" data-close>Contact an adviser</a><a class="btn line-shade" href="#" data-rtl data-close lang="ar">العربية</a></div>' +
      '<p style="font-size:.8rem;color:var(--on-shade-2)">Arabic navigation labels are placeholders for a native reviewer (W2).</p></div>';
    renderShort();
  }
  function footer() {
    $('#ft').innerHTML = '<div class="wrap"><div class="cols"><div style="display:grid;gap:14px;align-content:start"><span class="wm"><b>Al Aliah</b><span>INTERNATIONAL</span></span><p style="max-width:30ch">Abu Dhabi property, clearly understood.</p><p><a href="#" data-rtl lang="ar">العربية</a></p></div>' +
      '<div><h2>Discover</h2><ul><li><a href="#search">Buy</a></li><li><a href="#search/rent">Rent</a></li><li><a href="#home/offplan">Off-plan</a></li><li><a href="#home/developers">Developers</a></li></ul></div>' +
      '<div><h2>Areas</h2><ul><li><a href="#area">Al Raha</a></li><li><a href="#home/communities">Abu Dhabi</a></li><li><a href="#home/dubai">Dubai</a></li></ul></div>' +
      '<div><h2>Al Aliah</h2><ul><li><a href="#home/advice">About Us</a></li><li><a href="#home/advice">Services</a></li><li><a href="#home/advice">Property management</a></li><li><a href="#property/rich">Contact</a></li></ul></div>' +
      '<div><h2>Owners</h2><ul><li><a href="#home/advice">List your property</a></li><li><a href="#home/advice">Property management</a></li></ul></div></div>' +
      '<div class="legal"><span>© 2026 Al Aliah International</span><span>Licence and registration numbers: shown once confirmed <span class="spec-tag">Specimen: pending decision</span></span><span><a href="#">Privacy</a> · <a href="#">Terms</a> · <a href="#">Cookie settings</a></span></div></div>';
  }

  /* ============================================================
     HOMEPAGE
     ============================================================ */
  var homeQ = { pur: 'sale', loc: '', type: '', beds: 0, max: 0 };
  var MAXP = { sale: [[0, 'Any price'], [1000000, 'Up to 1m AED'], [2000000, 'Up to 2m AED'], [4000000, 'Up to 4m AED']], rent: [[0, 'Any rent'], [100000, 'Up to 100k AED'], [200000, 'Up to 200k AED'], [300000, 'Up to 300k AED']] };
  function homeMatch(x, q) {
    if (q.pur === 'rent' && x.pur !== 'rent') return false;
    if (q.pur === 'sale' && x.pur !== 'sale') return false;
    if (q.pur === 'offplan' && x.comp !== 'offplan') return false;
    if (q.loc && x.a !== q.loc) return false;
    if (q.type && x.type !== q.type) return false;
    if (q.beds && x.b < q.beds) return false;
    if (q.max && x.pr > q.max) return false;
    return true;
  }
  var homeMap, plateMap;
  function renderHome() {
    var pg = $('#pg-home');
    var tabsH = [['sale', 'Buy'], ['rent', 'Rent'], ['offplan', 'Off-plan']];
    pg.innerHTML =
      '<section class="h-open" aria-labelledby="h-home">' +
        '<div class="lead">' +
          '<p class="kick">Abu Dhabi property advisory</p>' +
          '<h1 class="d" id="h-home">Abu Dhabi property, clearly understood.</h1>' +
          '<p class="sub">Search homes to buy, rent and off-plan across Abu Dhabi, then talk it through with an adviser.</p>' +
          '<form class="qs" id="qs" role="search" aria-label="Property search">' +
            '<div class="seg" role="radiogroup" aria-label="Looking to">' + tabsH.map(function (t, i) { return '<label><input type="radio" name="pur" value="' + t[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + t[1] + '</span></label>'; }).join('') + '</div>' +
            '<div class="fields">' +
              '<div class="fld"><label for="q-loc">Community</label><input id="q-loc" role="combobox" aria-expanded="false" aria-controls="q-sugg" aria-autocomplete="list" autocomplete="off" placeholder="All of Abu Dhabi"><div class="sugg" id="q-sugg" role="listbox" aria-label="Communities" hidden></div></div>' +
              '<div class="fld"><label for="q-type">Type</label><select id="q-type"><option value="">Any type</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="townhouse">Townhouse</option></select></div>' +
              '<div class="fld"><label for="q-beds">Bedrooms</label><select id="q-beds"><option value="0">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></div>' +
              '<div class="fld"><label for="q-max">Price</label><select id="q-max"></select></div>' +
            '</div>' +
            '<div class="row"><a class="lnk" href="#search" id="q-map">Search on the map</a><button class="btn go" type="submit" id="q-go">Show homes</button></div>' +
          '</form>' +
        '</div>' +
        '<div class="mapside"><div class="map" id="home-map"></div>' +
          '<div class="legend"><b>Homes listed with Al Aliah</b><span id="home-legend">By community, for sale</span></div>' +
          '<a class="anchor" href="#property/rich"><img src="' + IMG('yas-terrace-timber') + '" alt="Upper terrace with a timber-clad wall, pergola slats and a glass balustrade" width="640" height="480"><div><b class="num">420,000</b><span>AED per year · Five-bedroom villa, Yas Island</span></div></a>' +
        '</div>' +
      '</section>' +

      '<section class="sec h-homes" aria-labelledby="h-homes"><div class="wrap">' +
        '<div class="hd"><h2 class="d" id="h-homes">Homes, by what you need</h2>' +
          '<div class="tabs" role="tablist" aria-label="Homes by purpose" id="hh-tabs">' + [['sale', 'Buy'], ['rent', 'Rent'], ['offplan', 'Off-plan']].map(function (t, i) {
            var n = L.filter(function (x) { return homeMatch(x, { pur: t[0] }); }).length;
            return '<button type="button" role="tab" id="hh-t-' + t[0] + '" aria-controls="hh-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-t="' + t[0] + '">' + t[1] + '<small>' + n + '</small></button>'; }).join('') + '</div></div>' +
        '<div id="hh-panel" role="tabpanel" aria-labelledby="hh-t-sale"></div>' +
      '</div></section>' +

      '<section class="sec h-comm" id="home-communities" aria-labelledby="h-comm"><div class="wrap"><div class="grid">' +
        '<div class="intro"><p class="kick">Areas</p><h2 class="d" id="h-comm">Abu Dhabi, community by community</h2><p>Every community on one map, with what is listed there now. Hover a name to find it.</p>' +
          '<div class="tabs" role="tablist" aria-label="Emirate" id="hc-tabs"><button type="button" role="tab" aria-selected="true" tabindex="0" data-t="ad" aria-controls="hc-panel" id="hc-t-ad">Abu Dhabi</button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-t="dxb" aria-controls="hc-panel" id="hc-t-dxb">Dubai</button></div>' +
          '<div role="tabpanel" id="hc-panel" aria-labelledby="hc-t-ad"><ul class="cidx" id="hc-list"></ul></div></div>' +
        '<div class="plate-map" id="hc-plate"><div class="map" id="plate-map"></div><p>Stylised geography. Listings are shown at community level until they carry verified coordinates.</p></div>' +
      '</div></div></section>' +

      '<section class="sec h-off" id="home-offplan" aria-labelledby="h-off"><div class="wrap">' +
        '<div class="hd"><h2 class="d" id="h-off">Off-plan, read properly</h2><p>Price, handover and payment plan, set out the same way for every project, so you can compare what each one asks of you and when.</p></div>' +
        '<div id="off-rows"></div>' +
      '</div></section>' +

      '<section class="sec h-dev" id="home-developers" aria-labelledby="h-dev"><div class="wrap"><div class="grid">' +
        '<div class="intro"><p class="kick">Developers</p><h2 class="d" id="h-dev">Who builds it</h2><p>Each developer page shows only what is verified: their projects, homes and areas on Al Aliah. No ratings we cannot source.</p><a class="lnk arrow" href="#" data-todo="Developer index is a later page.">All 17 developers</a></div>' +
        '<div><div class="dwall" id="dwall"></div><p class="key">Numbers show projects currently listed. Names in grey have no current listings.</p></div>' +
      '</div></div></section>' +

      '<section class="sec h-adv shade" id="home-advice" aria-labelledby="h-adv"><div class="wrap">' +
        '<p class="kick">Al Aliah International</p>' +
        '<h2 class="d statement" id="h-adv">Local expertise for better property decisions.</h2>' +
        '<div class="qs4">' +
          '<div class="q"><h3>Buying</h3><p>Which community suits how you live, and what will it cost to own there? Compare homes and prices with an adviser before you view.</p><a class="lnk arrow" href="#property/rich">Talk to an adviser</a></div>' +
          '<div class="q"><h3>Renting</h3><p>Shortlist the homes you like. An adviser arranges the viewings and talks you through the contract.</p><a class="lnk arrow" href="#search/rent">Homes to rent</a></div>' +
          '<div class="q"><h3>Off-plan</h3><p>Read the payment plan, handover date and developer side by side before you commit to anything.</p><a class="lnk arrow" href="#home/offplan">Off-plan homes</a></div>' +
          '<div class="q"><h3>Owners</h3><p>Letting or selling a home in Abu Dhabi? List it with us, or ask about property management.</p><a class="lnk arrow" href="#" data-todo="Owner journey is a later page.">List your property</a></div>' +
        '</div>' +
        '<div class="cta"><a class="btn on-shade" href="#property/rich">Talk to an adviser</a><a class="btn line-shade" href="#" data-todo="Owner journey is a later page.">List your property</a></div>' +
      '</div></section>';

    /* opening */
    var maxSel = $('#q-max');
    function fillMax() { var opts = MAXP[homeQ.pur === 'rent' ? 'rent' : 'sale']; maxSel.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join(''); homeQ.max = 0; }
    fillMax();
    homeMap = mountMap($('#home-map'), { vb: '60 30 980 760', par: 'xMidYMid meet', label: 'Map of Abu Dhabi communities with the number of listed homes', counts: {}, interactive: true, zoom: 'city' });
    function homeUpdate() {
      var res = L.filter(function (x) { return homeMatch(x, homeQ); });
      var all = L.filter(function (x) { return homeMatch(x, { pur: homeQ.pur }); });
      setCounts(homeMap, stats(all));
      redline(homeMap, homeQ.loc || null);
      $('#q-go').textContent = res.length ? 'Show ' + res.length + (res.length === 1 ? ' home' : ' homes') : 'No homes yet: see options';
      $('#home-legend').textContent = 'By community, ' + { sale: 'for sale', rent: 'to rent', offplan: 'off-plan' }[homeQ.pur] + ' (' + all.length + ')';
    }
    $$('input[name="pur"]', pg).forEach(function (r) { r.addEventListener('change', function () { homeQ.pur = r.value; fillMax(); homeUpdate(); }); });
    $('#q-type').addEventListener('change', function (e) { homeQ.type = e.target.value; homeUpdate(); });
    $('#q-beds').addEventListener('change', function (e) { homeQ.beds = +e.target.value; homeUpdate(); });
    maxSel.addEventListener('change', function (e) { homeQ.max = +e.target.value; homeUpdate(); });
    combobox($('#q-loc'), $('#q-sugg'), function (a) { homeQ.loc = a; homeUpdate(); });
    $('#qs').addEventListener('submit', function (e) {
      e.preventDefault();
      sQ = freshQ();
      sQ.pur = homeQ.pur === 'rent' ? 'rent' : 'sale';
      sQ.comp = homeQ.pur === 'offplan' ? 'offplan' : 'any';
      if (homeQ.loc) sQ.locs = [homeQ.loc];
      if (homeQ.type) sQ.types = [homeQ.type];
      sQ.beds = homeQ.beds; sQ.max = homeQ.max;
      go('search', true);
    });
    homeMap.svg.addEventListener('click', function (e) { var g = e.target.closest('.cl,.m-comm'); if (!g) return; var a = g.getAttribute('data-a'); $('#q-loc').value = a; homeQ.loc = a; homeUpdate(); });
    homeMap.svg.addEventListener('keydown', function (e) { var g = e.target.closest('.cl'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var a = g.getAttribute('data-a'); $('#q-loc').value = a; homeQ.loc = a; homeUpdate(); } });
    homeMap.svg.addEventListener('mouseover', function (e) {
      var g = e.target.closest('.cl,.m-comm'); var a = g && g.getAttribute('data-a');
      if (!a) return;
      var hits = L.filter(function (x) { return x.a === a && homeMatch(x, { pur: homeQ.pur }); });
      redline(homeMap, a);
      if (hits.length) callout(homeMap, a, hits[0].img, hits.length + (hits.length === 1 ? ' home' : ' homes'), a); else callout(homeMap, null);
    });
    homeMap.svg.addEventListener('mouseleave', function () { redline(homeMap, homeQ.loc || null); callout(homeMap, null); });
    homeUpdate();

    /* homes by need */
    function homesPanel(t) {
      var picks = { sale: [31495, 31082, 30964], rent: [31521, 31023, 31002], offplan: [31083, 31094] }[t].map(byId);
      var n = L.filter(function (x) { return homeMatch(x, { pur: t }); }).length;
      var lbl = { sale: 'to buy', rent: 'to rent', offplan: 'off-plan' }[t];
      $('#hh-panel').setAttribute('aria-labelledby', 'hh-t-' + t);
      $('#hh-panel').innerHTML = '<div class="homes-grid">' + card(picks[0], { lg: true }) + '<div class="stack">' + picks.slice(1).map(function (x) { return card(x); }).join('') + '</div></div>' +
        '<div class="more"><a class="btn" href="#search' + (t === 'rent' ? '/rent' : t === 'offplan' ? '/offplan' : '') + '">See all ' + n + ' homes ' + lbl + '</a>' + (t === 'offplan' ? '<a class="lnk arrow" href="#home/offplan">Compare payment plans</a>' : '') + '</div>';
      requestAnimationFrame(function () { frameStrips($('#hh-panel')); });
    }
    tabs($('#hh-tabs'), function (t) { homesPanel(t); });
    homesPanel('sale');

    /* community index */
    plateMap = mountMap($('#plate-map'), { vb: '60 60 960 680', par: 'xMidYMid meet', label: 'Abu Dhabi communities', counts: stats(L), zoom: 'city' });
    function commList(t) {
      var ul = $('#hc-list');
      $('#hc-panel').setAttribute('aria-labelledby', 'hc-t-' + t);
      if (t === 'ad') {
        var st = stats(L);
        var names = ['Al Raha', 'Al Khalidiya', 'Al Reef Downtown', 'Al Reem Island', 'Yas Island', 'Khalifa City', 'Madinat Al Riyad', 'Saadiyat Island'];
        ul.innerHTML = names.map(function (a) {
          var hs = L.filter(function (x) { return x.a === a; }), n = hs.length;
          var rent = hs.filter(function (x) { return x.pur === 'rent'; }), sale = hs.filter(function (x) { return x.pur === 'sale'; });
          var bits = [];
          if (rent.length) bits.push('<span><b>' + rent.length + '</b> to rent from ' + fmt(Math.min.apply(null, rent.map(function (x) { return x.pr; }))) + ' AED a year</span>');
          if (sale.length) bits.push('<span><b>' + sale.length + '</b> for sale from ' + fmt(Math.min.apply(null, sale.map(function (x) { return x.pr; }))) + ' AED</span>');
          if (!n) bits.push('<span>No homes listed right now</span>');
          return '<li' + (n ? '' : ' class="zero"') + '><a href="' + (a === 'Al Raha' ? '#area' : '#search') + '" data-a="' + a + '"' + (a === 'Al Raha' ? '' : ' data-loc="' + a + '"') + '>' + lockup(a, COMM[a].ar) + '<span class="meta">' + bits.join('') + '</span><span class="go">' + (a === 'Al Raha' ? 'Area guide' : n ? 'See homes' : '') + '</span></a></li>';
        }).join('');
        $('#hc-plate').innerHTML = '<div class="map" id="plate-map"></div><p>Stylised geography. Listings are shown at community level until they carry verified coordinates.</p>';
        maps = maps.filter(function (m) { return m !== plateMap; });
        plateMap = mountMap($('#plate-map'), { vb: '60 60 960 680', par: 'xMidYMid meet', label: 'Abu Dhabi communities', counts: st, zoom: 'city' });
      } else {
        ul.innerHTML = DUBAI.map(function (d) {
          return '<li' + (d.projects ? '' : ' class="zero"') + '><a href="#home/offplan" data-dxb="' + esc(d.n) + '">' + lockup(d.n, d.ar) + '<span class="meta">' + (d.projects ? '<span><b>' + d.projects + '</b> off-plan ' + (d.projects === 1 ? 'project' : 'projects') + '</span>' : '<span>No homes or projects listed right now</span>') + '</span><span class="go">' + (d.projects ? 'See projects' : '') + '</span></a></li>';
        }).join('');
        $('#hc-plate').innerHTML = '<div class="dubai-pan" id="dxb-pan"><p>Dubai communities use the same map system in production. Hover a community with projects to see its developer render.</p></div><p>Dubai content stays contextual: Dubai listings, projects and areas only (D-032).</p>';
      }
    }
    tabs($('#hc-tabs'), commList);
    commList('ad');
    var hcl = $('#hc-list');
    function hcHot(a) {
      $$('a', hcl).forEach(function (x) { x.classList.toggle('hot', x.getAttribute('data-a') === a); });
      if (!$('#plate-map')) return;
      redline(plateMap, a || null);
      var hs = a ? L.filter(function (x) { return x.a === a; }) : [];
      if (a && hs.length) callout(plateMap, a, hs[0].img, hs.length + (hs.length === 1 ? ' home' : ' homes'), a); else callout(plateMap, null);
    }
    hcl.addEventListener('mouseover', function (e) { var a = e.target.closest('a'); if (!a) return; if (a.getAttribute('data-a')) hcHot(a.getAttribute('data-a')); var d = a.getAttribute('data-dxb'); if (d) { var dd = DUBAI.filter(function (x) { return x.n === d; })[0]; $('#dxb-pan').innerHTML = dd.img ? '<figure style="width:100%;position:relative"><img src="' + IMG(dd.img) + '" alt="' + esc(dd.imgAlt) + '"><span class="ph-tag">Developer render</span></figure>' : '<p>No image: nothing is listed in ' + esc(d) + ' right now.</p>'; } });
    hcl.addEventListener('focusin', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('data-a')) hcHot(a.getAttribute('data-a')); });
    hcl.addEventListener('mouseleave', function () { hcHot(null); });
    hcl.addEventListener('click', function (e) { var a = e.target.closest('a[data-loc]'); if (!a) return; e.preventDefault(); sQ = freshQ(); var hs = L.filter(function (x) { return x.a === a.getAttribute('data-loc'); }); sQ.pur = hs.length && hs.every(function (x) { return x.pur === 'rent'; }) ? 'rent' : 'sale'; sQ.locs = [a.getAttribute('data-loc')]; go('search', true); });

    /* off-plan rows */
    var rows = [
      { kind: 'home', x: byId(31094), name: 'Two-bedroom apartment', a: 'Al Raha', ar: COMM['Al Raha'].ar, img: 'raha-render-aerial', alt: byId(31094).alt, pr: 3481025, handover: 'Q1 2029', plan: [10, 75, 15], dev: null },
      { kind: 'home', x: byId(31083), name: 'Four-bedroom townhouse', a: 'Khalifa City', ar: COMM['Khalifa City'].ar, img: 'khalifa-render-street', alt: 'Developer render: a street of townhouses with balconies and young trees', pr: 3936708, handover: null, plan: null, dev: null },
      { div: 'Dubai projects' },
      { kind: 'project', name: 'Binghatti Aquarise', a: 'Business Bay', ar: 'الخليج التجاري', img: 'aquarise-render', alt: 'Developer render: a curved residential tower beside a highway', pr: null, handover: 'Q2, 2027', plan: [20, 50, 30], dev: 'Binghatti Developers' },
      { kind: 'project', name: 'Bayz 102', a: 'Business Bay', ar: 'الخليج التجاري', img: null, pr: null, handover: 'June 2029', plan: [null, 70, 30], dev: 'Danube Properties' }
    ];
    $('#off-rows').innerHTML = rows.map(function (r) {
      if (r.div) return '<div class="odiv"><b>' + r.div + '</b><span class="kick">Shown where relevant to Abu Dhabi buyers (D-032)</span></div>';
      var pic = r.img ? '<div class="pic"><img src="' + IMG(r.img) + '" alt="' + esc(r.alt) + '" loading="lazy"><span class="ph-tag">Developer render</span></div>' : '<div class="pic type" aria-hidden="true"><b>' + esc(r.name) + '</b><span>No image shown</span></div>';
      var plan = r.plan ? '<div class="pbar" role="img" aria-label="Payment plan: ' + (r.plan[0] ? r.plan[0] + '% on booking, ' : '') + r.plan[1] + '% during construction, ' + r.plan[2] + '% on handover">' +
          (r.plan[0] ? '<span style="flex:' + r.plan[0] + '">' + r.plan[0] + '%</span>' : '') + '<span style="flex:' + r.plan[1] + '">' + r.plan[1] + '%</span><span style="flex:' + r.plan[2] + '">' + r.plan[2] + '%</span></div>' +
          '<div class="pkey">' + (r.plan[0] ? '<span><i></i>On booking</span>' : '') + '<span><i style="background:' + (r.plan[0] ? '#3E4A53' : '#14191E') + '"></i>During construction</span><span><i style="background:' + (r.plan[0] ? '#5F6A72' : '#3E4A53') + '"></i>On handover</span>' + (r.plan[0] ? '' : '<span>Booking amount not stated</span>') + '</div>'
        : '<p class="na">No payment plan is listed yet. <a class="lnk" href="#property/rich">Ask for the payment plan</a></p>';
      return '<article class="orow">' + pic +
        '<div class="who">' + lockup(r.kind === 'project' ? r.name : r.a, r.kind === 'project' ? null : r.ar, 'small') +
          '<p class="by">' + (r.kind === 'project' ? esc(r.a) + ', Dubai · by <a href="#" data-todo="Developer pages come later.">' + esc(r.dev) + '</a>' : esc(r.name) + ', off-plan') + '</p>' +
          (r.pr ? '<div class="pr"><b class="num">' + fmt(r.pr) + '</b><span class="lbl">AED</span></div>' : '<p class="by">Prices from the developer on request</p>') + '</div>' +
        '<div class="plan"><dl><dt>Handover</dt><dd>' + (r.handover || 'Not confirmed') + '</dd><dt>Developer</dt><dd>' + (r.dev ? esc(r.dev) : 'Not yet confirmed') + '</dd></dl>' + plan + '</div></article>';
    }).join('');

    /* developers */
    $('#dwall').innerHTML = DEV.map(function (d) { var p = DEV_PROJ[d]; return '<a href="#" data-todo="Developer pages come later." class="' + (p ? 'has' : '') + '"' + (p ? ' aria-label="' + esc(d) + ', 1 project"' : '') + '>' + esc(d) + (p ? '<sup>1</sup>' : '') + '</a>'; }).join('');
  }

  /* ---------- Combobox (community) ---------- */
  function combobox(input, list, onPick) {
    var idx = -1, items = [];
    function open(q) {
      q = (q || '').toLowerCase();
      items = Object.keys(COMM).filter(function (a) { return !q || a.toLowerCase().indexOf(q) >= 0 || COMM[a].ar.indexOf(q) >= 0; });
      var pur = homeQ.pur;
      list.innerHTML = '<div role="option" id="opt-all" data-a="" aria-selected="false"><span class="en" style="font-family:var(--ft);font-weight:600;font-size:1rem">All of Abu Dhabi</span><span></span><span class="c">' + L.filter(function (x) { return homeMatch(x, { pur: pur }); }).length + '</span></div>' +
        items.map(function (a, i) { var n = L.filter(function (x) { return x.a === a && homeMatch(x, { pur: pur }); }).length; return '<div role="option" id="opt-' + i + '" data-a="' + a + '" aria-selected="false"><span class="en">' + esc(bind(a)) + '</span><span lang="ar" dir="rtl">' + COMM[a].ar + '</span><span class="c">' + (n ? n + (n === 1 ? ' home' : ' homes') : 'None now') + '</span></div>'; }).join('');
      list.hidden = false; input.setAttribute('aria-expanded', 'true'); idx = -1;
    }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function pick(el) { var a = el.getAttribute('data-a'); input.value = a; onPick(a); close(); }
    function move(d) {
      var opts = $$('[role="option"]', list); if (!opts.length) return;
      idx = (idx + d + opts.length) % opts.length;
      opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === idx); });
      input.setAttribute('aria-activedescendant', opts[idx].id);
      opts[idx].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('focus', function () { open(input.value); });
    input.addEventListener('input', function () { open(input.value); if (!input.value) onPick(''); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(input.value); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && !list.hidden && idx >= 0) { e.preventDefault(); pick($$('[role="option"]', list)[idx]); }
      else if (e.key === 'Escape') { close(); }
    });
    list.addEventListener('mousedown', function (e) { var o = e.target.closest('[role="option"]'); if (o) { e.preventDefault(); pick(o); } });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
  }
  /* ---------- Tabs (roving tabindex) ---------- */
  function tabs(el, onSel) {
    var bs = $$('[role="tab"]', el);
    function sel(b, focus) { bs.forEach(function (x) { x.setAttribute('aria-selected', x === b); x.tabIndex = x === b ? 0 : -1; }); if (focus) b.focus(); onSel(b.getAttribute('data-t')); }
    el.addEventListener('click', function (e) { var b = e.target.closest('[role="tab"]'); if (b) sel(b); });
    el.addEventListener('keydown', function (e) {
      var i = bs.indexOf(document.activeElement); if (i < 0) return;
      var rtl = site.dir === 'rtl';
      if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) { e.preventDefault(); sel(bs[(i + 1) % bs.length], true); }
      if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) { e.preventDefault(); sel(bs[(i - 1 + bs.length) % bs.length], true); }
    });
  }

  /* ============================================================
     SEARCH (Functional)
     ============================================================ */
  function freshQ() { return { pur: 'sale', comp: 'any', locs: [], types: [], beds: 0, max: 0, sort: 'new', view: 'split' }; }
  var sQ = freshQ();
  var sMap;
  function sMatch(x, q, skip) {
    skip = skip || '';
    if (x.pur !== q.pur) return false;
    if (skip !== 'comp' && q.pur === 'sale' && q.comp !== 'any' && x.comp !== q.comp) return false;
    if (skip !== 'locs' && q.locs.length && q.locs.indexOf(x.a) < 0) return false;
    if (skip !== 'types' && q.types.length && q.types.indexOf(x.type) < 0) return false;
    if (skip !== 'beds' && q.beds && x.b < q.beds) return false;
    if (skip !== 'max' && q.max && x.pr > q.max) return false;
    return true;
  }
  function sResults() {
    var r = L.filter(function (x) { return sMatch(x, sQ); });
    if (sQ.sort === 'asc') r.sort(function (a, b) { return a.pr - b.pr; });
    else if (sQ.sort === 'desc') r.sort(function (a, b) { return b.pr - a.pr; });
    else r.sort(function (a, b) { return b.id - a.id; });
    return r;
  }
  var bedsLbl = function (n) { return n ? n + '+ bedrooms' : 'Bedrooms'; };
  var maxLbl = function (n) { return n ? 'Up to ' + (n >= 1e6 ? n / 1e6 + 'm' : n / 1000 + 'k') + ' AED' : 'Price'; };
  function renderSearch() {
    var pg = $('#pg-search');
    pg.innerHTML =
      '<div class="wrap"><div class="s-head"><div><ol class="crumb" aria-label="Breadcrumb"><li><a href="#home">Home</a></li><li id="crumb-p">Buy</li><li>Abu Dhabi</li></ol><h1 class="d" id="s-h1">Homes to buy in Abu Dhabi</h1><p class="count" id="s-count" aria-live="polite"></p></div>' +
        '<button type="button" class="btn ghost save" data-todo="Saved searches need an account decision (Stage 03 IA).">Save this search</button></div></div>' +
      '<div class="fbar" role="region" aria-label="Filters"><div class="wrap">' +
        '<button type="button" class="chip m-only" id="m-filters" aria-haspopup="dialog">Filters <span id="m-fn"></span></button>' +
        '<div class="seg2 d-only" role="group" aria-label="Purpose" id="f-pur"><button type="button" data-v="sale">Buy</button><button type="button" data-v="rent">Rent</button></div>' +
        '<div class="pill" data-pop="comp"><button type="button" aria-expanded="false">Completion</button></div>' +
        '<div class="pill" data-pop="locs"><button type="button" aria-expanded="false">Community</button></div>' +
        '<div class="pill" data-pop="types"><button type="button" aria-expanded="false">Type</button></div>' +
        '<div class="pill" data-pop="beds"><button type="button" aria-expanded="false">Bedrooms</button></div>' +
        '<div class="pill" data-pop="max"><button type="button" aria-expanded="false">Price</button></div>' +
        '<div class="r"><label class="vh" for="f-sort">Sort</label><select id="f-sort"><option value="new">Newest first</option><option value="asc">Price, low to high</option><option value="desc">Price, high to low</option></select>' +
          '<div class="seg2" role="group" aria-label="View" id="f-view"><button type="button" data-v="split">List and map</button><button type="button" data-v="list">List</button></div></div>' +
      '</div></div>' +
      '<div class="wrap"><div class="active" id="f-active" role="group" aria-label="Active filters"></div><h2 class="vh">Results</h2>' +
        '<div class="res" id="res"><div class="rlist" id="rlist"></div><div class="rmap"><div class="map" id="s-map"></div><p>Homes are placed at community level. Exact positions follow once listings carry verified coordinates.</p></div></div></div>' +
      '<div class="mbar"><div class="seg2" role="group" aria-label="View" id="m-view"><button type="button" data-v="split">List</button><button type="button" data-v="map">Map</button></div><a class="slc" href="#search" aria-label="Shortlist"><span class="n">0</span></a></div>' + tray();
    sMap = mountMap($('#s-map'), { vb: '60 60 960 680', par: 'xMidYMid meet', label: 'Results by community', counts: {}, interactive: true, zoom: 'city' });
    wireSearch();
    searchUpdate();
  }
  function popHTML(k) {
    var opts;
    if (k === 'comp') return '<div class="pop" role="group" aria-label="Completion"><div class="chips">' + [['any', 'Any'], ['ready', 'Ready'], ['offplan', 'Off-plan']].map(function (o) { return '<button type="button" class="chip" data-comp="' + o[0] + '" aria-pressed="' + (sQ.comp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
    if (k === 'locs') {
      opts = Object.keys(COMM).map(function (a) { var n = L.filter(function (x) { return x.a === a && sMatch(x, sQ, 'locs'); }).length; return '<label class="opt' + (n ? '' : ' zero') + '"><span><input type="checkbox" data-loc="' + a + '"' + (sQ.locs.indexOf(a) >= 0 ? ' checked' : '') + '>' + esc(a) + ' <span lang="ar" dir="rtl" style="color:var(--ink-3);font-size:.84rem">' + COMM[a].ar + '</span></span><small>' + n + '</small></label>'; }).join('');
      return '<div class="pop" role="group" aria-label="Community" style="min-width:340px">' + opts + '</div>';
    }
    if (k === 'types') return '<div class="pop" role="group" aria-label="Type">' + ['apartment', 'villa', 'townhouse'].map(function (t) { var n = L.filter(function (x) { return x.type === t && sMatch(x, sQ, 'types'); }).length; return '<label class="opt' + (n ? '' : ' zero') + '"><span><input type="checkbox" data-type="' + t + '"' + (sQ.types.indexOf(t) >= 0 ? ' checked' : '') + '>' + t[0].toUpperCase() + t.slice(1) + '</span><small>' + n + '</small></label>'; }).join('') + '</div>';
    if (k === 'beds') return '<div class="pop" role="group" aria-label="Minimum bedrooms"><div class="chips">' + [0, 1, 2, 3, 4, 5].map(function (b) { return '<button type="button" class="chip" data-beds="' + b + '" aria-pressed="' + (sQ.beds === b) + '">' + (b ? b + '+' : 'Any') + '</button>'; }).join('') + '</div></div>';
    if (k === 'max') return '<div class="pop" role="group" aria-label="Maximum price"><div class="chips" style="display:grid">' + MAXP[sQ.pur].map(function (o) { return '<button type="button" class="chip" data-max="' + o[0] + '" aria-pressed="' + (sQ.max === o[0]) + '" style="justify-content:flex-start">' + o[1] + '</button>'; }).join('') + '</div></div>';
  }
  var openPop = null;
  function closePop() { if (!openPop) return; var p = openPop.querySelector('.pop'); if (p) p.remove(); openPop.querySelector('button').setAttribute('aria-expanded', 'false'); openPop = null; }
  function wireSearch() {
    var pg = $('#pg-search');
    $$('.pill > button', pg).forEach(function (b) {
      b.addEventListener('click', function () {
        var pill = b.parentNode, was = openPop === pill; closePop(); if (was) return;
        pill.insertAdjacentHTML('beforeend', popHTML(pill.getAttribute('data-pop')));
        b.setAttribute('aria-expanded', 'true'); openPop = pill;
        var f = pill.querySelector('.pop input, .pop button'); if (f) f.focus();
      });
    });
    pg.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-comp]')) { sQ.comp = t.closest('[data-comp]').getAttribute('data-comp'); closePop(); searchUpdate(); }
      else if (t.closest('[data-beds]')) { sQ.beds = +t.closest('[data-beds]').getAttribute('data-beds'); closePop(); searchUpdate(); }
      else if (t.closest('[data-max]')) { sQ.max = +t.closest('[data-max]').getAttribute('data-max'); closePop(); searchUpdate(); }
      else if (t.closest('[data-unset]')) { var u = t.closest('[data-unset]').getAttribute('data-unset').split(':'); unset(u[0], u[1]); searchUpdate(); }
      else if (t.closest('[data-relax]')) { var k = t.closest('[data-relax]').getAttribute('data-relax'); unset(k); searchUpdate(); }
    });
    pg.addEventListener('change', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-loc')) { var a = t.getAttribute('data-loc'); sQ.locs = t.checked ? sQ.locs.concat(a) : sQ.locs.filter(function (x) { return x !== a; }); searchUpdate(true); }
      if (t.hasAttribute('data-type')) { var y = t.getAttribute('data-type'); sQ.types = t.checked ? sQ.types.concat(y) : sQ.types.filter(function (x) { return x !== y; }); searchUpdate(true); }
    });
    document.addEventListener('click', function (e) { if (openPop && !openPop.contains(e.target)) closePop(); });
    pg.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openPop) { var b = openPop.querySelector('button'); closePop(); b.focus(); } });
    $('#f-pur').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sQ.pur = b.getAttribute('data-v'); sQ.max = 0; if (sQ.pur === 'rent') sQ.comp = 'any'; searchUpdate(); });
    $('#f-sort').addEventListener('change', function (e) { sQ.sort = e.target.value; searchUpdate(); });
    $('#f-view').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sQ.view = b.getAttribute('data-v'); searchUpdate(); });
    $('#m-view').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sQ.view = b.getAttribute('data-v'); searchUpdate(); });
    $('#m-filters').addEventListener('click', openSheet);
    var rl = $('#rlist');
    rl.addEventListener('mouseover', function (e) { var c = e.target.closest('.sc'); if (c) sHot(byId(c.getAttribute('data-id'))); });
    rl.addEventListener('focusin', function (e) { var c = e.target.closest('.sc'); if (c) sHot(byId(c.getAttribute('data-id'))); });
    rl.addEventListener('mouseleave', function () { sHot(null); });
    sMap.svg.addEventListener('mouseover', function (e) {
      var g = e.target.closest('.cl,.m-comm'), a = g && g.getAttribute('data-a');
      redline(sMap, a || null);
      $$('.sc', rl).forEach(function (c) { var m = !!a && c.getAttribute('data-a') === a; c.classList.toggle('hot', m); var r = c.querySelector('.strip .m-red'); if (r) r.classList.toggle('on', m); });
    });
    sMap.svg.addEventListener('mouseleave', function () { sHot(null); $$('.sc.hot', rl).forEach(function (c) { c.classList.remove('hot'); }); });
    function mapPick(g) { var a = g.getAttribute('data-a'); if (sQ.locs.indexOf(a) < 0) { sQ.locs = sQ.locs.concat(a); searchUpdate(); say('Filtered to ' + a + '.'); } }
    sMap.svg.addEventListener('click', function (e) { var g = e.target.closest('.cl'); if (g) mapPick(g); });
    sMap.svg.addEventListener('keydown', function (e) { var g = e.target.closest('.cl'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); mapPick(g); } });
  }
  function sHot(x) {
    redline(sMap, x ? x.a : null);
    $$('#rlist .sc').forEach(function (c) { var r = c.querySelector('.strip .m-red'); if (r) r.classList.toggle('on', !!x && c.getAttribute('data-id') === String(x.id)); });
    if (x) callout(sMap, x.a, x.img, fmt(x.pr) + ' AED', title(x) + ', ' + x.a); else callout(sMap, null);
  }
  function unset(k, v) {
    if (k === 'locs') sQ.locs = v ? sQ.locs.filter(function (x) { return x !== v; }) : [];
    if (k === 'types') sQ.types = v ? sQ.types.filter(function (x) { return x !== v; }) : [];
    if (k === 'beds') sQ.beds = 0;
    if (k === 'max') sQ.max = 0;
    if (k === 'comp') sQ.comp = 'any';
    if (k === 'all') { var p = sQ.pur, s = sQ.sort, v2 = sQ.view; sQ = freshQ(); sQ.pur = p; sQ.sort = s; sQ.view = v2; }
  }
  function searchUpdate(keepPop) {
    var res = sResults(), rent = sQ.pur === 'rent';
    $('#s-h1').textContent = rent ? 'Homes to rent in Abu Dhabi' : sQ.comp === 'offplan' ? 'Off-plan homes in Abu Dhabi' : 'Homes to buy in Abu Dhabi';
    $('#crumb-p').textContent = rent ? 'Rent' : sQ.comp === 'offplan' ? 'Off-plan' : 'Buy';
    $('#s-count').innerHTML = '<b>' + res.length + '</b> ' + (res.length === 1 ? 'home' : 'homes') + (sQ.locs.length === 1 ? ' in ' + esc(sQ.locs[0]) : '');
    $$('#f-pur button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === sQ.pur); });
    $$('#f-view button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === (sQ.view === 'map' ? 'split' : sQ.view)); });
    $$('#m-view button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === (sQ.view === 'map' ? 'map' : 'split')); });
    $('#f-sort').value = sQ.sort;
    var pc = $('[data-pop="comp"]'); pc.hidden = rent;
    var lb = { comp: sQ.comp === 'any' ? 'Completion' : sQ.comp === 'ready' ? 'Ready' : 'Off-plan', locs: sQ.locs.length ? (sQ.locs.length === 1 ? sQ.locs[0] : sQ.locs.length + ' communities') : 'Community', types: sQ.types.length ? sQ.types.map(function (t) { return t[0].toUpperCase() + t.slice(1); }).join(', ') : 'Type', beds: bedsLbl(sQ.beds), max: maxLbl(sQ.max) };
    $$('.pill').forEach(function (p) { var k = p.getAttribute('data-pop'), b = p.querySelector('button'); b.textContent = lb[k]; var set = { comp: sQ.comp !== 'any', locs: sQ.locs.length > 0, types: sQ.types.length > 0, beds: sQ.beds > 0, max: sQ.max > 0 }[k]; b.classList.toggle('set', set); });
    if (keepPop && openPop) { var k2 = openPop.getAttribute('data-pop'); var old = openPop.querySelector('.pop'); var f = document.activeElement && document.activeElement.getAttribute('data-loc'); var ft = document.activeElement && document.activeElement.getAttribute('data-type'); old.outerHTML = popHTML(k2); var nf = f ? openPop.querySelector('[data-loc="' + f + '"]') : ft ? openPop.querySelector('[data-type="' + ft + '"]') : null; if (nf) nf.focus(); }
    var chips = [];
    if (!rent && sQ.comp !== 'any') chips.push(['comp', '', sQ.comp === 'ready' ? 'Ready' : 'Off-plan']);
    sQ.locs.forEach(function (a) { chips.push(['locs', a, a]); });
    sQ.types.forEach(function (t) { chips.push(['types', t, t[0].toUpperCase() + t.slice(1)]); });
    if (sQ.beds) chips.push(['beds', '', bedsLbl(sQ.beds)]);
    if (sQ.max) chips.push(['max', '', maxLbl(sQ.max)]);
    $('#f-active').innerHTML = chips.map(function (c) { return '<button type="button" data-unset="' + c[0] + ':' + esc(c[1]) + '" aria-label="Remove filter: ' + esc(c[2]) + '">' + esc(c[2]) + '</button>'; }).join('') + (chips.length ? '<button type="button" class="clr" data-unset="all">Clear all</button>' : '');
    var mfn = $('#m-fn'); if (mfn) mfn.textContent = chips.length ? '(' + chips.length + ')' : '';
    var resEl = $('#res'); resEl.setAttribute('data-view', sQ.view);
    var rl = $('#rlist');
    if (!res.length) {
      var relax = [];
      ['locs', 'types', 'beds', 'max', 'comp'].forEach(function (k) {
        var active = { locs: sQ.locs.length, types: sQ.types.length, beds: sQ.beds, max: sQ.max, comp: sQ.comp !== 'any' }[k];
        if (!active) return;
        var n = L.filter(function (x) { return sMatch(x, sQ, k); }).length;
        if (n) relax.push('<li><button type="button" data-relax="' + k + '">Remove "' + esc({ locs: lb.locs, types: lb.types, beds: lb.beds, max: lb.max, comp: lb.comp }[k]) + '"<span>' + n + (n === 1 ? ' home' : ' homes') + '</span></button></li>');
      });
      rl.innerHTML = '<div class="empty" role="status"><h2>No homes match all of these filters</h2><p>' + (sQ.locs.length ? 'Nothing is listed in ' + esc(sQ.locs.join(', ')) + ' with these filters right now. ' : '') + 'Loosen one filter, or ask to hear when a home like this is listed.</p>' + (relax.length ? '<ul>' + relax.join('') + '</ul>' : '') + '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn ink" data-todo="Alerts need the account decision.">Tell me when one is listed</button><button type="button" class="btn ghost" data-unset="all">Clear all filters</button></div></div>';
    } else {
      rl.innerHTML = res.map(function (x) { return card(x); }).join('') + '<div class="rfoot"><span>Showing ' + res.length + ' of ' + res.length + '</span><span>At scale: 24 per page with a "Show more" button; the count and the map always describe the whole result.</span></div>';
    }
    setCounts(sMap, stats(res));
    renderShort();
    requestAnimationFrame(function () { frameStrips(rl); fitSymbols(sMap.svg); });
  }
  /* Mobile filter sheet */
  function openSheet() {
    var d = $('#fsheet');
    var cnt = function () { return L.filter(function (x) { return sMatch(x, sQ); }).length; };
    function body() {
      var rent = sQ.pur === 'rent';
      return '<div class="in"><header><h2 id="fsheet-h">Filters</h2><button type="button" class="btn sm ghost" data-x>Close</button></header><div class="body">' +
        '<fieldset><legend>Looking to</legend><div class="seg2" role="group" aria-label="Purpose"><button type="button" data-spur="sale" aria-pressed="' + !rent + '">Buy</button><button type="button" data-spur="rent" aria-pressed="' + rent + '">Rent</button></div></fieldset>' +
        (rent ? '' : '<fieldset><legend>Completion</legend><div class="chips">' + [['any', 'Any'], ['ready', 'Ready'], ['offplan', 'Off-plan']].map(function (o) { return '<button type="button" class="chip" data-comp="' + o[0] + '" aria-pressed="' + (sQ.comp === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></fieldset>') +
        '<fieldset><legend>Community</legend>' + Object.keys(COMM).map(function (a) { var n = L.filter(function (x) { return x.a === a && sMatch(x, sQ, 'locs'); }).length; return '<label class="opt" style="display:flex;justify-content:space-between;min-height:44px;align-items:center"><span style="display:flex;gap:10px;align-items:center"><input type="checkbox" style="width:20px;height:20px;accent-color:var(--crimson)" data-loc="' + a + '"' + (sQ.locs.indexOf(a) >= 0 ? ' checked' : '') + '>' + esc(a) + '</span><small style="color:var(--ink-3)">' + n + '</small></label>'; }).join('') + '</fieldset>' +
        '<fieldset><legend>Bedrooms</legend><div class="chips">' + [0, 1, 2, 3, 4, 5].map(function (b) { return '<button type="button" class="chip" data-beds="' + b + '" aria-pressed="' + (sQ.beds === b) + '">' + (b ? b + '+' : 'Any') + '</button>'; }).join('') + '</div></fieldset>' +
        '<fieldset><legend>Price</legend><div class="chips">' + MAXP[sQ.pur].map(function (o) { return '<button type="button" class="chip" data-max="' + o[0] + '" aria-pressed="' + (sQ.max === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div></fieldset>' +
        '</div><footer><button type="button" class="btn ghost" data-unset="all">Clear</button><button type="button" class="btn go" data-x>Show ' + cnt() + (cnt() === 1 ? ' home' : ' homes') + '</button></footer></div>';
    }
    d.innerHTML = body();
    d.onclick = function (e) {
      var t = e.target, b;
      if (t === d || t.closest('[data-x]')) { d.close(); return; }
      if ((b = t.closest('[data-spur]'))) { sQ.pur = b.getAttribute('data-spur'); sQ.max = 0; if (sQ.pur === 'rent') sQ.comp = 'any'; }
      else if ((b = t.closest('[data-comp]'))) sQ.comp = b.getAttribute('data-comp');
      else if ((b = t.closest('[data-beds]'))) sQ.beds = +b.getAttribute('data-beds');
      else if ((b = t.closest('[data-max]'))) sQ.max = +b.getAttribute('data-max');
      else if ((b = t.closest('[data-unset]'))) unset('all');
      else return;
      var sc = d.querySelector('.body').scrollTop; d.innerHTML = body(); d.querySelector('.body').scrollTop = sc; searchUpdate();
    };
    d.onchange = function (e) { var t = e.target; if (t.hasAttribute('data-loc')) { var a = t.getAttribute('data-loc'); sQ.locs = t.checked ? sQ.locs.concat(a) : sQ.locs.filter(function (x) { return x !== a; }); var sc = d.querySelector('.body').scrollTop; d.innerHTML = body(); d.querySelector('.body').scrollTop = sc; searchUpdate(); var f = d.querySelector('[data-loc="' + a + '"]'); if (f) f.focus(); } };
    d.onclose = function () { $('#m-filters').focus(); };
    d.showModal();
  }

  /* ============================================================
     PROPERTY DETAIL (Editorial)
     ============================================================ */
  var PROP = {
    rich: {
      id: 31521, title: 'Five-bedroom villa', sub: 'with maid\'s room', pur: 'Villa for rent', pr: 420000, unit: 'AED per year', a: 'Yas Island', ref: 'AA-1010', refNote: 'planned',
      facts: [['bed', 5, 'Bedrooms'], ['bath', 6, 'Bathrooms'], ['area', '5,948', 'Built-up area', 'sq ft']],
      gallery: [
        ['yas-ext', 'exterior', 'Two-storey villa with a white frame, timber panel, pergola slats and a roller-shutter garage', [[74, 24, 'Pergola slats'], [70, 37, 'Timber-clad panel'], [64, 66, 'Garage, roller shutter']]],
        ['yas-terrace-timber', 'terrace', 'Upper terrace with a timber-clad wall, pergola slats and a glass balustrade', [[52, 9, 'Pergola slats'], [86, 44, 'Timber-clad wall'], [66, 62, 'Glass balustrade']]],
        ['yas-street', 'exterior', 'The villa from the street, behind a hedge and two street trees'],
        ['yas-entry', 'exterior', 'Entrance courtyard with paving set in artificial grass and a timber-clad wall'],
        ['yas-living', 'living', 'Living room with a rug, armchairs and a sofa beside full-height windows'],
        ['yas-living-2', 'living', 'Second living area with sliding glass doors to the garden'],
        ['yas-majlis', 'living', 'Sitting room with red armchairs and a patterned rug'],
        ['yas-dining', 'dining', 'Dining table for six beside full-height glazing onto the garden'],
        ['yas-kitchen', 'kitchen', 'Closed kitchen with timber-fronted cabinets and a gas hob'],
        ['yas-bedroom', 'bedrooms', 'Bedroom with full-height glazing on two sides'],
        ['yas-bedroom-2', 'bedrooms', 'Bedroom with a dark timber bed and dressing table'],
        ['yas-bath', 'bathrooms', 'Bathroom with a vessel basin, lit mirror and walk-in shower'],
        ['yas-stair', 'stair', 'Stair with timber fins and a glass balustrade'],
        ['yas-terrace-view', 'terrace', 'Covered terrace looking over the street and neighbouring villas'],
        ['yas-terrace-glass', 'terrace', 'Terrace with a glass balustrade and pergola shade'],
        ['yas-balcony', 'terrace', 'Balcony with a timber wall and a view across the community']
      ],
      rooms: [['all', 'All'], ['exterior', 'Exterior'], ['living', 'Living'], ['dining', 'Dining'], ['kitchen', 'Kitchen'], ['bedrooms', 'Bedrooms', 'bed'], ['bathrooms', 'Bathrooms', 'bath'], ['terrace', 'Terraces'], ['stair', 'Stair']],
      desc: ['Discover luxury living in this beautiful villa located in the prestigious West Yas community on Yas Island. This modern villa offers spacious interiors, high-quality finishes, and a family-friendly environment, making it the perfect home for comfortable living.', 'The villa features generously sized bedrooms, a bright living and dining area, a modern kitchen with ample storage, and large windows that allow plenty of natural light. The outdoor space includes a private garden, ideal for relaxing or entertaining guests.'],
      descSrc: 'Agent\'s description, with the company boilerplate and licence lines removed. The voice guide would also edit "luxury" and "prestigious".',
      listed: ['5 master bedrooms', 'Maid\'s room', 'Driver\'s room', '2 living areas', 'Majlis', 'Dining room with outdoor access', 'Closed kitchen', 'Laundry space', '3 balconies', 'Backyard', 'Furnished or unfurnished, by agreement', 'Rent in up to 4 payments'],
      amen: { 'In the home': ['Back yard', 'Balcony', 'Equipped kitchen', 'Garage', 'Garden', 'Laundry room'], 'Building and community': ['Gym'], 'General': ['Swimming pool'] },
      floorplans: true, project: true, similar: [31571, 31023, 30967]
    },
    sparse: {
      id: 31013, title: 'One-bedroom apartment', sub: '', pur: 'Apartment for rent', pr: 105000, unit: 'AED per year', a: 'Al Reem Island', ref: 'AA-1004', refNote: 'assigned on staging',
      facts: [['bed', 1, 'Bedroom'], ['bath', 2, 'Bathrooms'], ['area', '915', 'Built-up area', 'sq ft']],
      gallery: [
        ['reem-living', null, 'Living room with a dark corner sofa and a glass door to the balcony'],
        ['reem-dining', null, 'Dining table with white chairs below a framed print'],
        ['reem-bedroom', null, 'Bedroom with a padded headboard and full-height wardrobes'],
        ['reem-kitchen', null, 'Kitchen with a steel fridge and dark cabinets'],
        ['reem-kitchen-2', null, 'Entrance hall with dark doors'],
        ['reem-bath', null, 'Bathroom with a bathtub and dark wall tiles'],
        ['reem-hall', null, 'Bathroom vanity with a wide mirror'],
        ['reem-bath-2', null, 'Shower room with a basin and toilet'],
        ['reem-kitchen-3', null, 'Kitchen with a freestanding cooker and extractor hood']
      ],
      rooms: null,
      desc: ['Spacious and well-maintained 1 Bedroom Furnished Apartment available for rent in Marina Blue Tower, located in the heart of Marina Square.', 'This apartment offers a generous area of 915 sq-ft, featuring a comfortable layout with quality furnishings, making it ready for immediate move-in.'],
      descSrc: 'Agent\'s description, boilerplate removed. The building name appears only in this text; it is not yet a confirmed location level, so the map stays at community level.',
      listed: ['Fully furnished', 'Living and dining area', 'Kitchen', 'Built-in wardrobes', 'Rent in 2 cheques'],
      amen: { 'In the home': ['Back yard', 'Balcony', 'Equipped kitchen', 'Garden', 'Laundry room', 'Washer and dryer'], 'Building and community': ['Gym', 'Lift'] },
      amenWarn: true, floorplans: false, project: false, similar: [31002, 30967, 31571]
    }
  };
  var propState = 'rich';
  var curProp = function () { return PROP[propState]; };
  var gIdx = 0, gList = [], pMap, arrived = {};
  function renderProperty() {
    var P = curProp(), x = byId(P.id), pg = $('#pg-property'), rich = propState === 'rich';
    gList = P.gallery.slice(); gIdx = 0;
    var facts = '<dl class="pf">' + P.facts.map(function (f) { return '<div data-f="' + f[0] + '"><dt>' + f[2] + '</dt><dd>' + f[1] + (f[3] ? '<small>' + f[3] + '</small>' : '') + '</dd></div>'; }).join('') + '</dl>';
    var amen = Object.keys(P.amen).map(function (g) { return '<div><h3>' + g + '</h3><ul>' + P.amen[g].map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul></div>'; }).join('');
    pg.innerHTML =
      '<div class="wrap"><ol class="crumb" aria-label="Breadcrumb" style="padding-block-start:18px"><li><a href="#home">Home</a></li><li><a href="#search/rent">Rent</a></li><li><a href="#search/rent">Abu Dhabi</a></li><li>' + esc(P.a) + '</li></ol>' +
      '<div class="p-top"><div class="p-gal">' +
        '<div class="p-frame" id="p-frame"><img id="p-img" alt=""><span class="count" id="p-count" aria-live="polite"></span><button type="button" class="nav-b prev" aria-label="Previous photo"></button><button type="button" class="nav-b next" aria-label="Next photo"></button><div id="p-hs"></div></div>' +
        (P.rooms ? '<div class="rooms" role="group" aria-label="Room index"><span class="t">Room index</span>' + P.rooms.map(function (r) { var n = r[0] === 'all' ? gList.length : gList.filter(function (g) { return g[1] === r[0]; }).length; return '<button type="button" data-room="' + r[0] + '" aria-pressed="' + (r[0] === 'all') + '"' + (r[2] ? ' data-fact="' + r[2] + '"' : '') + '>' + r[1] + '<small>' + n + '</small></button>'; }).join('') + '</div>' : '') +
        '<div class="rail" id="p-rail" role="group" aria-label="All photos"></div>' +
      '</div>' +
      '<aside class="p-sheet" aria-labelledby="p-h1">' +
        '<span class="pur">' + P.pur + '</span>' +
        '<div class="pr"><b class="num">' + fmt(P.pr) + '</b><span class="lbl">' + P.unit + '</span></div>' +
        '<h1 id="p-h1">' + P.title + (P.sub ? ' <span style="font-weight:400;color:var(--ink-2)">' + P.sub + '</span>' : '') + '</h1>' +
        lockup(P.a, COMM[P.a].ar, 'small') + facts +
        '<div class="acts"><a class="btn go" href="#p-enquire">Request a viewing</a><div class="acts2"><a class="btn ghost" href="#p-enquire">WhatsApp</a><a class="btn ghost" href="#p-enquire">Call the office</a></div></div>' +
        '<div class="ref"><span>Reference <b>' + P.ref + '</b> <span class="spec-tag" title="' + P.refNote + '">' + P.refNote + '</span></span><button type="button" class="sl" id="p-short" aria-pressed="false">Shortlist</button></div>' +
      '</aside></div></div>' +

      '<div class="wrap"><div class="p-body"><div>' +
        '<section class="p-mod" aria-labelledby="pm-home"><h2 id="pm-home">The home</h2><div class="desc clip" id="p-desc">' + P.desc.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div><button type="button" class="lnk" style="border:0;background:none;padding:0;justify-self:start;cursor:pointer" id="p-more" aria-expanded="false" aria-controls="p-desc">Read the full description</button><p class="src">' + P.descSrc + '</p>' +
          '<h3 style="font-size:.95rem;margin-block-start:10px">As listed by the agent</h3><ul class="rlist2">' + P.listed.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="p-mod" aria-labelledby="pm-am"><h2 id="pm-am">Amenities</h2><div class="am">' + amen + '</div><p class="src">From the listing\'s legacy features, through the proposed amenity map (not yet approved, implementation plan §8.7).' + (P.amenWarn ? ' "Back yard" and "Garden" on a tower apartment show why each listing needs an editorial check before the map runs.' : '') + '</p></section>' +
        (P.floorplans ? '<section class="p-mod" aria-labelledby="pm-fp"><h2 id="pm-fp">Floor plans</h2><div class="fp"><figure><span><span class="spec-tag">Specimen placeholder</span><br><br>No listing has a floor plan in staging yet. The module is image-first: an uploaded plan alone is enough; level, unit type and area labels show only when entered.</span></figure><figure><span>Second plan slot, e.g. upper floor</span></figure></div><p class="src">When a listing has no floor plans, this section does not render at all (see the sparse listing).</p></section>' : '') +
        '<section class="p-mod" aria-labelledby="pm-loc"><h2 id="pm-loc">Location</h2><div class="loc"><div class="map" id="p-map"></div>' + lockup(P.a, COMM[P.a].ar, 'small') + '<p class="note">Shown at community level. The exact address is shared when a viewing is arranged.</p><a class="lnk arrow" href="' + (P.a === 'Al Raha' ? '#area' : '#search') + '">More homes in ' + esc(P.a) + '</a></div></section>' +
        (P.project ? '<section class="p-mod" aria-labelledby="pm-proj"><h2 id="pm-proj">Project and developer</h2><div class="pmod-demo"><span class="spec-tag">Module state: shown only when a listing is linked to a project</span><div class="pj"><img src="' + IMG('aquarise-render') + '" alt="Developer render: Binghatti Aquarise"><div><h3>Binghatti Aquarise</h3><p>Business Bay, Dubai · by <b>Binghatti Developers</b> · Handover Q2, 2027 · Payment plan 20 / 50 / 30</p></div></div><p class="src">Data from the Binghatti Aquarise project record (T2, verified). This villa has no project; the module is shown here only to judge its design.</p></div></section>' : '') +
      '</div>' +
      '<div class="side"><section class="adv" id="p-enquire" aria-labelledby="adv-h"><div class="who"><span class="mono" aria-hidden="true">AA</span><div><h2 id="adv-h">Al Aliah International</h2><p>Abu Dhabi office · replies during office hours</p></div></div>' +
        '<form onsubmit="return false"><label>Name<input autocomplete="name"></label><div class="row2"><label>Phone<input type="tel" autocomplete="tel"></label><label>Email<input type="email" autocomplete="email"></label></div><label>Preferred time<select><option>Weekday morning</option><option>Weekday evening</option><option>Weekend</option></select></label><button type="button" class="btn ink" data-todo="Form handling is Stage 05.">Request a viewing</button></form>' +
        '<p>Phone and WhatsApp numbers appear once the public office contacts are decided. <span class="spec-tag">Pending decision</span></p></section></div>' +
      '</div></div>' +
      '<section class="wrap p-rel" aria-labelledby="pm-rel"><h2 id="pm-rel">Similar homes to rent</h2><div class="grid3">' + P.similar.map(function (id) { return card(byId(id)); }).join('') + '</div></section>' +
      '<div class="pbar-m"><div><b class="num">' + fmt(P.pr) + '</b><span>' + P.unit + '</span></div><a class="btn go" href="#p-enquire">Request a viewing</a></div>';

    var rail = $('#p-rail');
    function drawRail() {
      rail.innerHTML = gList.map(function (g, i) { return '<button type="button" data-i="' + i + '" aria-label="Photo ' + (i + 1) + ': ' + esc(g[2]) + '"' + (i === gIdx ? ' aria-current="true"' : '') + '><img src="' + IMG(g[0]) + '" alt="" loading="lazy"></button>'; }).join('');
    }
    function show(i, instant) {
      gIdx = (i + gList.length) % gList.length;
      var g = gList[gIdx], img = $('#p-img');
      var apply = function () {
        img.src = IMG(g[0]); img.alt = g[2];
        img.classList.toggle('contain', /reem-(kitchen-2|bath|hall|bath-2|kitchen-3)/.test(g[0]));
        img.classList.remove('out');
      };
      if (instant || reduce) apply(); else { img.classList.add('out'); setTimeout(apply, 180); }
      $('#p-count').textContent = (gIdx + 1) + ' / ' + gList.length;
      $$('button', rail).forEach(function (b) { if (+b.getAttribute('data-i') === gIdx) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      hotspots(g[3], instant);
    }
    function hotspots(hs, instant) {
      var h = $('#p-hs'); h.innerHTML = '';
      if (!hs) return;
      h.innerHTML = hs.map(function (s) { return '<span class="hs" style="inset-inline-start:' + s[0] + '%;inset-block-start:' + s[1] + '%"><i aria-hidden="true"></i><span>' + esc(s[2]) + '</span></span>'; }).join('');
      $$('.hs', h).forEach(function (el, i) { setTimeout(function () { el.classList.add('on'); }, (instant || reduce) ? 0 : 500 + i * 220); });
    }
    drawRail();
    var first = !arrived[propState];
    if (first && !reduce) { $('#p-frame').animate([{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, easing: 'cubic-bezier(.22,.7,.2,1)' }); }
    arrived[propState] = true;
    show(0, true);
    $('#p-frame .prev').addEventListener('click', function () { show(gIdx - 1); });
    $('#p-frame .next').addEventListener('click', function () { show(gIdx + 1); });
    rail.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.getAttribute('data-i')); });
    var tx = null; $('#p-frame').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    $('#p-frame').addEventListener('touchend', function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) show(gIdx + ((dx < 0) !== (site.dir === 'rtl') ? 1 : -1)); tx = null; });
    var rooms = $('.rooms', pg);
    if (rooms) rooms.addEventListener('click', function (e) {
      var b = e.target.closest('[data-room]'); if (!b) return;
      var r = b.getAttribute('data-room');
      $$('[data-room]', rooms).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      gList = r === 'all' ? P.gallery.slice() : P.gallery.filter(function (g) { return g[1] === r; });
      gIdx = 0; drawRail(); show(0);
      $$('.pf div').forEach(function (d) { d.classList.toggle('mark', d.getAttribute('data-f') === b.getAttribute('data-fact')); });
      say(b.textContent.replace(/\d+$/, '') + ': ' + gList.length + (gList.length === 1 ? ' photo' : ' photos'));
    });
    $('#p-more').addEventListener('click', function () { var d = $('#p-desc'), open = d.classList.toggle('clip') === false; this.setAttribute('aria-expanded', open); this.textContent = open ? 'Show less' : 'Read the full description'; });
    $('#p-short').addEventListener('click', function () { toggleShort(P.id); });
    var c = COMM[P.a].c;
    pMap = mountMap($('#p-map'), { vb: (c[0] - 260) + ' ' + (c[1] - 146) + ' 520 292', label: P.a + ' on the map', counts: {}, zoom: 'community' });
    redline(pMap, P.a, 'keep');
    requestAnimationFrame(function () { redline(pMap, P.a); frameStrips(pg); });
    renderShort();
  }

  /* ============================================================
     AREA DETAIL: Al Raha (Immersive)
     ============================================================ */
  var storyMap, cityMap;
  function renderArea() {
    var pg = $('#pg-area'), hs = L.filter(function (x) { return x.a === 'Al Raha'; });
    var rent = hs.filter(function (x) { return x.pur === 'rent'; }), off = hs.filter(function (x) { return x.comp === 'offplan'; });
    var minR = Math.min.apply(null, rent.map(function (x) { return x.pr; })), maxR = Math.max.apply(null, rent.map(function (x) { return x.pr; }));
    pg.innerHTML =
      '<section class="story" id="story" aria-label="Al Raha, a short story in four chapters">' +
        '<div class="stage2">' +
          '<div class="st-nav"><ol aria-label="Chapters"><li data-c="0">Approach</li><li data-c="1">Arrive</li><li data-c="2">Live</li><li data-c="3">Homes</li></ol><a href="#after-story" id="skip-story">Skip the story</a></div>' +
          '<div class="chap on" data-c="0"><div class="ch-approach">' +
            '<div class="name"><p class="kick">Abu Dhabi · Community</p><h1 class="nm n1"><span class="en">Al Raha</span><span class="ar" lang="ar" dir="rtl">الراحة</span></h1><p>Townhouse streets and apartment buildings by the water.</p></div>' +
            '<div class="pic"><img src="' + IMG('raha-row') + '" alt="A row of two-storey townhouses under a shared carport, on a paved street"></div></div></div>' +
          '<div class="chap" data-c="1"><div class="ch-split"><div class="pic"><img src="' + IMG('raha-street') + '" alt="Paved internal street lined with townhouses and palm trees" loading="lazy"></div>' +
            '<div class="txt"><span class="k">Arrive</span><h2>Townhouse rows under shared carports</h2><p>Two-storey townhouses along paved internal streets, with covered parking at the front.</p></div></div></div>' +
          '<div class="chap" data-c="2"><div class="ch-split ch-live"><div class="pics"><div><img src="' + IMG('raha-court') + '" alt="A private paved courtyard with artificial grass behind a townhouse" loading="lazy"></div><div><img src="' + IMG('raha-apt-water') + '" alt="Apartment buildings on both sides of a canal, seen from an upper floor" loading="lazy"></div></div>' +
            '<div class="txt"><span class="k">Live</span><h2>Courtyards behind, water in view</h2><p>Private courtyards behind the townhouses; apartment buildings line the canal.</p></div></div></div>' +
          '<div class="chap" data-c="3"><div class="ch-split ch-homes"><div class="smap"><div class="map" id="story-map"></div></div>' +
            '<div class="txt"><span class="k">Homes</span><div class="count"><b class="num">' + hs.length + '</b></div><h2 style="font-size:clamp(1.8rem,3.4cqi,2.6rem)">homes listed with Al Aliah in Al Raha</h2>' +
              '<div class="split3"><span><b>' + rent.length + '</b>to rent</span><span><b>' + off.length + '</b>off-plan</span></div><a class="btn on-shade" href="#after-story" style="justify-self:start">See the homes</a></div></div></div>' +
        '</div>' +
      '</section>' +
      '<div class="wrap"><p class="kick" id="after-story" tabindex="-1" style="padding-block:14px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><span>Photos: Al Aliah listing photography (Tier C). Commissioned place photography would lift the Approach chapter most.</span><span id="story-mode"></span></p></div>' +

      '<section class="sec" aria-labelledby="a-glance-h"><div class="wrap a-glance"><div><h2 id="a-glance-h">Al Raha at a glance</h2><p class="draft">Figures come from Al Aliah\'s own listings, 7 Oct 2026. Area copy, schools, transport and services need sourced editorial content before launch. <span class="spec-tag">Draft</span></p></div>' +
        '<div class="figs">' +
          '<div><b class="num">' + hs.length + '</b><span>homes listed</span><small>Apartments ' + hs.filter(function (x) { return x.type === 'apartment'; }).length + ' · Villas ' + hs.filter(function (x) { return x.type === 'villa'; }).length + '</small></div>' +
          '<div><b class="num">' + fmt(Math.round(minR / 1000)) + 'k to ' + fmt(Math.round(maxR / 1000)) + 'k</b><span>AED a year to rent</span><small>' + rent.length + ' homes</small></div>' +
          '<div><b class="num">' + fmt(off[0].pr) + '</b><span>AED, off-plan</span><small>1 home · handover ' + off[0].handover + '</small></div>' +
          '<div><b class="num">2 to 4</b><span>bedrooms</span><small>Across all listings</small></div>' +
        '</div></div></section>' +

      '<section class="sec a-homes" style="padding-block-start:0" aria-labelledby="a-homes-h"><div class="wrap"><div class="hd"><h2 id="a-homes-h">Homes in Al Raha</h2><a class="btn" href="#search" data-area-search>All homes in Al Raha</a></div><div class="grid3">' + hs.map(function (x) { return card(x); }).join('') + '</div>' +
        '<div class="quiet" style="margin-block-start:28px"><b>Projects</b>No off-plan projects are listed in Al Raha right now. One off-plan home is listed above.</div></div></section>' +

      '<section class="sec a-map" style="padding-block-start:0" aria-labelledby="a-map-h"><div class="wrap grid"><div><div class="map" id="a-city"></div></div>' +
        '<div><h2 id="a-map-h">Around Al Raha</h2><p style="margin-block:12px 16px">Neighbouring communities with homes listed now. Distances and travel times appear only once they are sourced.</p><ul class="near">' +
        ['Yas Island', 'Khalifa City', 'Al Reef Downtown', 'Al Reem Island'].map(function (a) { var n = L.filter(function (x) { return x.a === a; }).length; return '<li><a href="' + (DETAIL[31521] && a === 'Yas Island' ? '#search' : '#search') + '" data-near="' + a + '">' + lockup(a, COMM[a].ar, 'small') + '<span class="meta">' + n + (n === 1 ? ' home' : ' homes') + ' listed</span></a></li>'; }).join('') + '</ul></div></div></section>' +

      '<section class="sec" style="padding-block-start:0" aria-labelledby="a-cta-h"><div class="wrap a-cta"><h2 id="a-cta-h">Thinking about Al Raha?</h2><div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn go" href="#property/rich">Talk to an adviser</a><button type="button" class="btn ghost" data-todo="Alerts need the account decision.">New Al Raha homes by email</button></div></div></section>';

    storyMap = mountMap($('#story-map'), { vb: '680 270 260 220', par: 'xMidYMid meet', label: 'Al Raha on the map', counts: { 'Al Raha': hs.length }, zoom: 'community' });
    cityMap = mountMap($('#a-city'), { vb: '380 100 640 440', label: 'Al Raha and neighbouring communities', counts: stats(L), zoom: 'city' });
    redline(cityMap, 'Al Raha', 'keep');
    $$('[data-area-search]', pg).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); sQ = freshQ(); sQ.pur = 'rent'; sQ.locs = ['Al Raha']; go('search', true); }); });
    $$('[data-near]', pg).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); sQ = freshQ(); var n = a.getAttribute('data-near'); var h = L.filter(function (x) { return x.a === n; }); sQ.pur = h.every(function (x) { return x.pur === 'rent'; }) ? 'rent' : 'sale'; sQ.locs = [n]; go('search', true); }); });
    $('#skip-story').addEventListener('click', function (e) { e.preventDefault(); var t = $('#after-story'); t.focus({ preventScroll: true }); t.scrollIntoView({ block: 'start' }); });
    storySetup();
  }
  var storyOn = false;
  function storySetup() {
    var st = $('#story');
    var stat = reduce || isMobile();
    st.classList.toggle('static', stat);
    $('#story-mode').textContent = stat ? (reduce ? 'Reduced motion: chapters shown as a static sequence.' : 'Mobile: chapters stack in normal scroll.') : 'Pinned chapters in normal page scroll: no inner scroll area, so the wheel never gets trapped.';
    if (stat) { $$('.chap', st).forEach(function (c) { c.classList.add('on'); }); if (storyMap) { var rr = storyMap.svg.querySelector('.m-red[data-a="Al Raha"]'); rr.style.cssText = ''; redline(storyMap, 'Al Raha'); } return; }
    storyOn = true; storyTick();
  }
  function storyTick() {
    var st = $('#story'); if (!st || !storyOn || !st.offsetParent || st.classList.contains('static')) return;
    var r = st.getBoundingClientRect(), vh = window.innerHeight, top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')) + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr'));
    var span = r.height - (vh - top), p = Math.min(1, Math.max(0, (top - r.top) / span));
    var c = Math.min(3, Math.floor(p * 4.0001));
    $$('.chap', st).forEach(function (el) { el.classList.toggle('on', +el.getAttribute('data-c') === c); });
    $$('.st-nav li', st).forEach(function (li) { li.classList.toggle('cur', +li.getAttribute('data-c') === c); li.setAttribute('aria-current', +li.getAttribute('data-c') === c ? 'step' : 'false'); });
    if (storyMap) { var lp = Math.min(1, Math.max(0, (p - .75) * 4 * 1.4)); var red = storyMap.svg.querySelector('.m-red[data-a="Al Raha"]'); red.style.transition = 'none'; red.style.strokeDashoffset = String(1 - lp); red.style.fillOpacity = String(lp * .75); }
  }
  window.addEventListener('scroll', function () { if (storyOn) requestAnimationFrame(storyTick); }, { passive: true });

  /* ============================================================
     Notes (composition logic, responsive, motion, open questions)
     ============================================================ */
  var NOTES = {
    home: '<h2>Homepage</h2><p>Immersive. The opening is a map of Abu Dhabi you can search, not a photo with a search box on it. Al Aliah\'s own photos are Tier C (phone and WhatsApp, 1280–1600 px), which the system forbids full bleed, so the place is carried by the Redline map and one contained, anchored photo.</p>' +
      '<h3>Sequence (not hero → cards → stats → testimonials → CTA)</h3><ul><li><b>Search the map.</b> Statement, then the search sheet anchored across the map edge (the one crimson fill). Purpose, community and filters update the live count and the clusters; choosing a community draws its redline.</li><li><b>Homes, by what you need.</b> Buy / Rent / Off-plan as tabs over Site select cards, offset 7/5. Mobile: a swipe row.</li><li><b>Abu Dhabi, community by community.</b> Inversion. A type-led index (mirror lockups, live counts, "from" prices) beside a sticky map plate; hovering a name draws its redline. Dubai is a second tab, contextual only.</li><li><b>Off-plan, read properly.</b> Price, handover and payment plan as one comparable row; the payment plan is a proportional bar. Missing data says so plainly ("Not confirmed", "Ask for the payment plan").</li><li><b>Who builds it.</b> All 17 developers as a type wall; only the two with verified projects carry a count. No logos: 12 of 17 are flagged for quality.</li><li><b>Local expertise.</b> A statement moment and four advisory paths (buying, renting, off-plan, owners). No statistics or testimonials: none are sourced.</li></ul>' +
      '<h3>Real data choices</h3><ul><li>Counts, prices and communities are the 11 staging listings. "Featured" picks use the legacy featured flag where it exists.</li><li>Bayz 102 shows no image: its renders are black-and-gold interiors and a Burj Khalifa skyline with a flying car. The tile is type-only by design.</li><li>Azizi Venice is left off the homepage: its developer link is provisional (T3).</li><li>The staging area hero images (aerial renders, stock-like and possibly AI imagery) are not used anywhere.</li></ul>' +
      '<h3>Motion opportunities (Stage 04)</h3><ul><li>Map settle on load (900–1200 ms, once); redline draw on community choice (420 ms).</li><li>Community index: row hover ↔ map redline, Sync timing 150–200 ms.</li><li>Statement reveal in the advice section; nothing loops.</li></ul>' +
      '<h3>Open visual questions</h3><ul><li>Statement size: 116 px at 1440 reads confident; is it too large next to the search sheet?</li><li>Live counts are honest but small (5 to buy). Show them on the homepage, or only on the map?</li><li>Developer wall vs. a short list: does showing 15 names without listings help or dilute?</li><li>The wordmark is typeset; the real mark arrives with Q1.</li></ul>',
    search: '<h2>Search / Buy</h2><p>Functional. Native scroll, CSS-only motion, no immersive moments. Distinctiveness comes from the Site select card (price plate, site strip, redline) and the list–map sync, not from effects.</p>' +
      '<h3>Behaviour</h3><ul><li>Filters show counts that respect the other filters; zero options stay visible but quiet.</li><li>Every active filter becomes a removable chip; "Clear all".</li><li>Hover or focus a card: the community draws on the map and a callout shows. Hover a community: its cards lift. Click a cluster: filter to it.</li><li>Empty state: names the blocking filter and how many homes each removal would return; offers an alert. Try Community → Saadiyat Island.</li><li>Missing data: "Area not listed" (never 0); off-plan renders labelled; all positions at community level.</li><li>Mobile: one-line chip rail, a full filter sheet with a live "Show N homes" action, and a sticky List / Map switch.</li></ul>' +
      '<h3>At scale</h3><ul><li>24 results per page with "Show more"; the count and map always describe the whole result. Clusters, not pins, until street zoom.</li></ul>' +
      '<h3>Open questions</h3><ul><li>Two-column cards beside the map at 1440, or three without? (Toggle "List".)</li><li>Should Off-plan be its own purpose tab, or stay a completion filter under Buy (current)?</li></ul>',
    property: '<h2>Property detail</h2><p>Editorial. One signature interaction at the top, then quiet modules. The data sheet overlaps the contained photo by about a column, the system\'s one permitted overlap.</p>' +
      '<h3>Signature: the room index (approved optional mode)</h3><ul><li>The photo arrives once (clip reveal, 1.1 s), up to three hotspots name only what is visible, then room chips with counts filter the gallery and mark the related fact (Bedrooms, Bathrooms).</li><li>It needs every photo tagged by room. The rich listing\'s 16 photos were tagged by hand for this specimen; the sparse listing has no tags, so it falls back to the standard gallery automatically.</li></ul>' +
      '<h3>Rich vs. sparse</h3><ul><li><b>Rich (Yas Island villa, 31521):</b> 16 photos, room index, agent\'s room list, amenities, floor-plan module (placeholder: no plans exist), location, project module (demo), similar homes.</li><li><b>Sparse (AA-1004, migrated):</b> no room tags, mixed portrait/landscape photos (portraits are shown whole, not cropped), no floor plans (section absent), no coordinates (community map), no project or developer (modules absent). Nothing is replaced by a fake placeholder.</li></ul>' +
      '<h3>Data notes</h3><ul><li>Titles are structured from fields ("One-bedroom apartment"), not the legacy slogans.</li><li>Descriptions carry a trade licence and ADM permit numbers in free text; they are not shown until verified into the permit model.</li><li>Agent contacts stay private by default (03.2 closing correction), so the page shows form, WhatsApp and Call actions without numbers.</li><li>The listing references are AA-1004 (assigned) and AA-1010 (planned).</li></ul>' +
      '<h3>Mobile</h3><ul><li>Full-width photo with swipe and a chip rail; the price sheet follows; a sticky bar keeps price and "Request a viewing" in reach.</li></ul>',
    area: '<h2>Area: Al Raha</h2><p>Immersive, the most cinematic page. Al Raha has the richest real material: three listings, townhouse street photography and waterfront apartment views.</p>' +
      '<h3>The story</h3><ul><li>Four chapters (Approach, Arrive, Live, Homes) pinned in normal document scroll: there is no inner scroll area, so nothing traps the wheel or touch. "Skip the story" jumps past it.</li><li>The last chapter draws the community redline as you scroll and states the live count.</li><li>Copy describes only what the photos show or the data says. Reduced motion and mobile get a static stacked sequence.</li><li>Production: a ScrollTrigger-pinned section with scrub; images lazy after the first.</li></ul>' +
      '<h3>After the story</h3><ul><li>At a glance: four figures, all derived from listings. Schools, transport and travel times need sourced editorial content.</li><li>Homes as Site select cards; projects and developers say plainly that none are listed.</li><li>Around Al Raha: neighbours with live counts, on a city-zoom map.</li></ul>' +
      '<h3>Photography</h3><ul><li>All Tier C. Commissioned Tier A would change the Approach chapter most (time-of-day street and waterfront).</li><li>Number plates and a third-party sign\'s phone number were pixelated in this specimen\'s copies.</li></ul>' +
      '<h3>Open questions</h3><ul><li>Is four chapters right for a community with three listings, or should small communities get a shorter story (Approach + Homes)?</li><li>English and Arabic names are set as a mirror lockup; Arabic place names need native verification (W2).</li></ul>'
  };

  /* ============================================================
     Router and specimen controls
     ============================================================ */
  var cur = 'home';
  var rendered = {};
  function go(page, keep, sub) {
    cur = page;
    $$('.page').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-page') === page); });
    $$('#sp-pages button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-p') === page); });
    $('#sp-state').hidden = page !== 'property';
    maps = maps.filter(function (m) { return document.body.contains(m.el); });
    storyOn = false;
    if (page === 'home' && !rendered.home) { renderHome(); rendered.home = true; }
    if (page === 'search') { if (!rendered.search) { renderSearch(); rendered.search = true; } else searchUpdate(); }
    if (page === 'property') renderProperty();
    if (page === 'area') renderArea();
    header(page === 'search' ? (sQ.pur === 'rent' ? 'rent' : 'buy') : page === 'property' ? 'rent' : page === 'area' ? 'areas' : '');
    $('#notes-body').innerHTML = NOTES[page];
    document.title = { home: 'Al Aliah Page Experience', search: 'Search · Al Aliah Page Experience', property: 'Property · Al Aliah Page Experience', area: 'Al Raha · Al Aliah Page Experience' }[page];
    if (!sub) window.scrollTo(0, 0);
    requestAnimationFrame(function () { requestAnimationFrame(function () { refit(); if (sub) { var t = document.getElementById(sub); if (t) t.scrollIntoView({ block: 'start' }); } }); });
  }
  function route() {
    var h = (location.hash || '#home').slice(1).split('/');
    var page = h[0], arg = h[1];
    if (['home', 'search', 'property', 'area'].indexOf(page) < 0) { if (document.getElementById(page) && $('.page.on') && $('.page.on').contains(document.getElementById(page))) return; page = 'home'; }
    if (page === 'property') {
      if (arg === 'rich' || arg === 'sparse') propState = arg;
      else if (arg && byId(arg)) { toast('In this specimen, two listings have detail pages: the Yas Island villa (rich) and AA-1004 (sparse).'); history.replaceState(null, '', '#' + cur); return; }
      $$('#sp-state button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-s') === propState); });
    }
    if (page === 'search' && arg) { sQ = freshQ(); if (arg === 'rent') sQ.pur = 'rent'; if (arg === 'offplan') sQ.comp = 'offplan'; }
    var sub = null;
    if (page === 'home' && arg) { if (!rendered.home) { renderHome(); rendered.home = true; } sub = { offplan: 'home-offplan', developers: 'home-developers', advice: 'home-advice', communities: 'home-communities', dubai: 'home-communities' }[arg];
      if (arg === 'dubai') setTimeout(function () { var t = $('#hc-t-dxb'); if (t) t.click(); }, 0); }
    go(page, false, sub);
  }
  window.addEventListener('hashchange', route);
  $('#sp-pages').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) location.hash = b.getAttribute('data-p') === 'property' ? 'property/' + propState : b.getAttribute('data-p'); });
  $('#sp-state').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) location.hash = 'property/' + b.getAttribute('data-s'); });
  $('#sp-view').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var v = b.getAttribute('data-v');
    stage.setAttribute('data-view', v); document.body.classList.toggle('mframe', v === 'mobile');
    $$('#sp-view button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { refit(); if (cur === 'area') storySetup(); }); });
  });
  $('#sp-rtl').addEventListener('click', function () { var on = site.dir !== 'rtl'; site.dir = on ? 'rtl' : 'ltr'; this.setAttribute('aria-pressed', on); requestAnimationFrame(refit); toast(on ? 'RTL check: layout mirrored with logical properties. Content stays English; maps never mirror.' : 'Layout back to LTR.'); });
  var notes = $('#notes');
  $('#sp-notes').addEventListener('click', function () { var on = !notes.classList.contains('on'); notes.classList.toggle('on', on); this.setAttribute('aria-expanded', on); if (on) notes.focus(); });
  $('#notes-close').addEventListener('click', function () { notes.classList.remove('on'); $('#sp-notes').setAttribute('aria-expanded', 'false'); $('#sp-notes').focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && notes.classList.contains('on')) { $('#notes-close').click(); } });

  /* Global delegation: shortlist, menus, placeholders */
  document.addEventListener('click', function (e) {
    var t = e.target, b;
    if ((b = t.closest('.sl')) && b.closest('.sc')) { e.preventDefault(); toggleShort(+b.closest('.sc').getAttribute('data-id')); return; }
    if (t.closest('.tray-clear')) { shortlist = []; renderShort(); return; }
    if ((b = t.closest('[data-todo]'))) { e.preventDefault(); toast(b.getAttribute('data-todo')); return; }
    if ((b = t.closest('[data-rtl]'))) { e.preventDefault(); $('#sp-rtl').click(); if ($('#mnav').open) $('#mnav').close(); return; }
    if ((b = t.closest('.burger'))) { $('#mnav').showModal(); return; }
    if (t.closest('#mnav [data-close]')) { $('#mnav').close(); }
    if ((b = t.closest('.nav .dd'))) { var m = $('#m-areas'), open = m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', open); return; }
    var mm = $('#m-areas'); if (mm && !mm.hidden && !t.closest('#m-areas')) { mm.hidden = true; $('.nav .dd').setAttribute('aria-expanded', 'false'); }
  });
  $('#mnav').addEventListener('click', function (e) { if (e.target === this) this.close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var m = $('#m-areas'); if (m && !m.hidden) { m.hidden = true; var d = $('.nav .dd'); d.setAttribute('aria-expanded', 'false'); d.focus(); } } });
  if (ro) ro.observe(site);
  window.addEventListener('resize', function () { clearTimeout(refit.t); refit.t = setTimeout(function () { refit(); if (cur === 'area') storySetup(); }, 120); });
  document.fonts && document.fonts.ready.then(refit);

  footer();
  route();
})();
