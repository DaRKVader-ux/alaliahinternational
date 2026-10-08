/* Al Aliah · Stage 03.3 v2 specimen. Plain JS + GSAP/ScrollTrigger (+ Lenis on the Area page only).
   Production stack is decided at Stage 05 (D-004). Data: data.js (staging, read-only). */
(function () {
  'use strict';
  var A = window.AA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  var IMG = function (n) { return 'img/' + n + '.jpg'; };
  var ico = function (id, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };
  var site = $('#site'), main = $('#main'), stage = $('#stage'), hdr = $('#hdr');
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = !!window.gsap;
  if (G) { gsap.registerPlugin(ScrollTrigger); }
  var mob = function () { return site.clientWidth <= 760; };
  var store = { get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
  var sess = { get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

  /* ============================================================
     Data helpers
     ============================================================ */
  var L = A.L;
  var byId = function (id) { return L.filter(function (x) { return String(x.id) === String(id); })[0]; };
  var NUMW = ['Studio', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  var T = function (x) { return (x.b ? NUMW[x.b] + '-bedroom ' : 'Studio ') + x.type; };
  var TP = function (x) { return T(x) + (x.pur === 'rent' ? ' for rent' : ' for sale'); };
  var PURL = function (x) { return x.pur === 'rent' ? 'For rent' : x.comp === 'offplan' ? 'Off-plan' : 'Ready to buy'; };
  var AED = function (n) { return 'AED ' + fmt(n); };
  var short = function (n) { return n >= 1e6 ? (Math.round(n / 1e4) / 100).toString().replace(/\.?0+$/, '') + 'M' : Math.round(n / 1000) + 'K'; };
  var pinTxt = function (x) { return 'AED ' + short(x.pr) + (x.pur === 'rent' ? '/yr' : ''); };
  var gal = function (x) { return x.galleryTagged ? x.galleryTagged.map(function (g) { return g[0]; }) : (x.gallery || [x.img]); };
  var alt = function (n, x) { return A.ALT[n] || (x && x.alt) || ''; };
  var inArea = function (a, list) { return (list || L).filter(function (x) { return x.area === a; }); };
  var PROJ = function (k) { return A.PROJECTS.filter(function (p) { return p.key === k; })[0]; };
  var DEV = function (k) { return A.DEVS.filter(function (d) { return d.key === k; })[0]; };
  var AREA = function (k) { return A.AREAS.filter(function (a) { return a.key === k || a.n === k; })[0]; };
  var minBy = function (list) { return list.length ? Math.min.apply(null, list.map(function (x) { return x.pr; })) : null; };

  /* Word spans for the clip reveal (observed on 11 Tanjung: each word rises out of its own mask) */
  function words(text, cls) {
    return '<span class="' + cls + '" aria-hidden="true">' + text.split(' ').map(function (w, i) { return '<span class="w"><span style="--i:' + i + '">' + esc(w) + '</span></span>'; }).join(' ') + '</span>';
  }
  function splitHeads(root) {
    $$('.h2, .adv-st, .a-intro .big', root).forEach(function (h) {
      if (h.dataset.split) return; h.dataset.split = '1';
      var t = h.textContent.trim().replace(/\s+/g, ' ');
      h.innerHTML = '<span class="vh">' + esc(t) + '</span><span aria-hidden="true">' + t.split(' ').map(function (w, i) { return '<span class="w"><span style="--i:' + i + '">' + esc(w) + '</span></span>'; }).join(' ') + '</span>';
      h.classList.add('cw');
    });
    if (RM || !('IntersectionObserver' in window)) { $$('.cw', root).forEach(function (h) { h.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .3 });
    $$('.cw:not(.in)', root).forEach(function (h) { io.observe(h); });
    cleanup.push(function () { io.disconnect(); });
  }

  var DESC = {
    31521: ['Discover luxury living in this beautiful villa located in the prestigious West Yas community on Yas Island. This modern villa offers spacious interiors, high-quality finishes, and a family-friendly environment, making it the perfect home for comfortable living.', 'The villa features generously sized bedrooms, a bright living and dining area, a modern kitchen with ample storage, and large windows that allow plenty of natural light. The outdoor space includes a private garden, ideal for relaxing or entertaining guests.', 'West Yas is one of the most sought-after communities in Yas Island, offering residents a peaceful lifestyle with excellent facilities and easy access to major attractions.'],
    31094: ['An exclusive project that speaks the language of elegance, precision, and lifestyle. Fully finished, with built-in kitchen appliances. Handover: Q1 2029.', 'Private balconies or terraces as per unit plan, en-suite bedrooms as per plan, double-glazed windows, built-in wardrobes, central air conditioning and a fibre-optic connection.', 'The agent\'s description also lists alternative payment options (investor and down-payment variants). They are not shown as data until the developer\'s current plan is confirmed.'],
    31013: ['Spacious and well-maintained one-bedroom furnished apartment available for rent in Marina Blue Tower, in Marina Square.', 'The apartment offers 915 sq ft with a comfortable layout and quality furnishings, ready for immediate move-in. Rent is paid in two cheques.'],
    31083: ['A townhouse community in Khalifa City of 312 four-bedroom townhouses, with landscaping, community facilities and access to schools, parks and retail.', 'The description states a 70/30 payment plan and handover in Q3 2028. Those values are not yet structured fields, so they are not shown as data.'],
    31495: ['Five master bedrooms with en-suite bathrooms, a separate men\'s majlis, a women\'s lounge, a main kitchen and a preparatory kitchen.', 'A maid\'s room with bathroom, a laundry room and an external driver\'s room. Ready to move in.'],
    30967: ['A fully furnished four-bedroom residence with en-suite bedrooms, large living and dining areas and a private swimming pool.', 'The description gives a total size of 4,473 sq ft; the size field is empty, so the size is shown as not listed.'],
    31002: ['Two-bedroom apartment of 1,100 sq ft with a living room and balcony, a modern kitchen and double-glazed windows.', 'Building: security staff, CCTV, maintenance staff and central air conditioning.'],
    31023: ['Two-floor villa with a roof, five bedrooms, five washrooms, a majlis, a large living hall, a garden and parking, in Al Khalidiya near the Corniche.'],
    30964: ['A home in Al Reef Downtown with a bright living and dining area, a semi-open kitchen, a balcony with a community view and built-in wardrobes.'],
    31082: ['A two-bedroom apartment in Al Reef Downtown with a bright living and dining area, a semi-open kitchen, a balcony with a community view and built-in wardrobes.'],
    31571: ['Three bedrooms, five washrooms, a maid\'s room, a balcony, a living room and a kitchen with built-in cabinets.']
  };

  /* ============================================================
     State
     ============================================================ */
  var shortlist = (function () { var s = store.get('aa2-sl'); try { return s ? JSON.parse(s) : [31571]; } catch (e) { return [31571]; } })();
  var compare = [];
  var propId = 31521, permitMode = 'ph';
  var route = { page: 'home', arg: null };
  var cleanup = [];
  var lenis = null;

  /* ============================================================
     Feedback and conversion actions
     ============================================================ */
  var toastT;
  function toast(html, ms) {
    var t = $('#toast'); t.innerHTML = html; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, ms || 5200);
  }
  function waText(id) {
    if (id === 'general') return 'Hello Al Aliah, I would like to speak to an adviser.';
    var x = byId(id);
    if (x) return 'Hello Al Aliah, I\'m interested in ' + x.ref + ': ' + TP(x).toLowerCase() + ' in ' + x.area + ' (' + AED(x.pr) + (x.pur === 'rent' ? ' a year' : '') + ').';
    var p = PROJ(id);
    if (p) return 'Hello Al Aliah, please send me the payment plan and brochure for ' + p.name + ', ' + p.loc + '.';
    var a = AREA(id);
    if (a) return 'Hello Al Aliah, I\'m looking for a home in ' + a.n + '.';
    return 'Hello Al Aliah, ' + id;
  }
  function wa(id) { toast('<b>WhatsApp</b> opens a chat with Al Aliah, pre-filled:<br>"' + esc(waText(id)) + '"<br><small>Specimen: the office number comes from site settings and is not shown here.</small>'); }
  function call(id) { var x = byId(id); toast('<b>Call</b> dials the Al Aliah office' + (x ? ' about ' + x.ref : '') + '. On mobile this is a tel: link; on desktop the number is shown to copy.<br><small>Specimen: number not shown (agent contacts stay private by default, D-038).</small>'); }

  /* ============================================================
     Shortlist + compare
     ============================================================ */
  function isSL(id) { return shortlist.indexOf(Number(id)) > -1; }
  function setSLCount() {
    var n = shortlist.length, b = $('#hdr-sl'), c = $('#sl-n');
    c.textContent = n; c.classList.toggle('zero', !n);
    var mt = $('#mt-n'); if (mt) { mt.textContent = n; mt.classList.toggle('zero', !n); } b.setAttribute('aria-label', 'Shortlist, ' + n + (n === 1 ? ' home' : ' homes'));
  }
  function toggleSL(id, btn) {
    id = Number(id); var i = shortlist.indexOf(id);
    if (i > -1) shortlist.splice(i, 1); else shortlist.push(id);
    store.set('aa2-sl', JSON.stringify(shortlist));
    $$('.pc-sl[data-sl="' + id + '"]').forEach(function (b) {
      var on = isSL(id); b.setAttribute('aria-pressed', on); b.innerHTML = ico(on ? 'heart-f' : 'heart');
    });
    setSLCount(); var h = $('#hdr-sl'); h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump');
    var x = byId(id);
    toast(isSL(id) ? '<b>Shortlisted.</b> ' + esc(T(x)) + ', ' + esc(x.area) + '. Your shortlist is kept on this device.' : 'Removed from your shortlist.', 2800);
  }

  /* ============================================================
     Components
     ============================================================ */
  function priceHTML(x) { return '<b>' + AED(x.pr) + '</b>' + (x.pur === 'rent' ? '<span>a year</span>' : ''); }
  function facts(x) {
    return '<ul class="pc-facts">' +
      '<li>' + ico('bed') + (x.b || 'Studio') + '<span class="vh"> bedrooms</span></li>' +
      '<li>' + ico('bath') + x.ba + '<span class="vh"> bathrooms</span></li>' +
      (x.s ? '<li>' + ico('area') + fmt(x.s) + ' sq ft</li>' : '<li class="na">' + ico('area') + 'Size not listed</li>') + '</ul>';
  }
  function card(x, o) {
    o = o || {};
    var n = gal(x).length, on = isSL(x.id), portrait = /^reem-(bath|hall|kitchen-2|kitchen-3)/.test(x.img);
    return '<article class="pc' + (o.cls ? ' ' + o.cls : '') + '" data-id="' + x.id + '" data-area="' + esc(x.area) + '">' +
      '<div class="pc-media' + (portrait ? ' contain' : '') + '"><img src="' + IMG(x.img) + '" alt="' + esc(x.alt) + '" loading="lazy" width="640" height="480">' +
      '<span class="pc-tag' + (x.comp === 'offplan' ? ' off' : '') + '">' + PURL(x) + '</span>' + (x.featured ? '<span class="pc-feat">Featured</span>' : '') +
      (x.render ? '<span class="pc-rd">Developer render</span>' : '') +
      '<span class="pc-n" data-pcn>' + ico('grid') + '<span>' + n + '</span><span class="vh"> photos</span></span>' +
      (n > 1 ? '<button type="button" class="pc-nav prev" data-pcnav="-1" aria-label="Previous photo of ' + esc(T(x)) + '">' + ico('arrow') + '</button><button type="button" class="pc-nav next" data-pcnav="1" aria-label="Next photo of ' + esc(T(x)) + '">' + ico('arrow') + '</button>' +
        '<span class="pc-dots" aria-hidden="true">' + gal(x).slice(0, 5).map(function (g, i) { return '<i' + (i === 0 ? ' class="on"' : '') + '></i>'; }).join('') + '</span>' : '') + '</div>' +
      '<button type="button" class="pc-sl" data-sl="' + x.id + '" aria-pressed="' + on + '" aria-label="Shortlist ' + esc(T(x)) + ', ' + esc(x.area) + '">' + ico(on ? 'heart-f' : 'heart') + '</button>' +
      '<div class="pc-body"><p class="pc-price">' + priceHTML(x) + '</p>' +
      '<h3 class="pc-t"><a class="pc-link" href="#property/' + x.id + '">' + esc(T(x)) + '</a></h3>' +
      '<p class="pc-loc">' + ico('pin') + esc(x.area) + ', ' + esc(x.city) + '</p>' + facts(x) +
      '<div class="pc-foot"><span>Ref ' + x.ref + '</span>' +
      (o.compare ? '<label class="pc-cmp"><input type="checkbox" data-cmp="' + x.id + '"' + (compare.indexOf(x.id) > -1 ? ' checked' : '') + '>Compare</label>' : '') + '</div>' +
      '<span class="pc-view" aria-hidden="true">View property' + ico('arrow') + '</span></div>' +
      '<div class="pc-act cpair"><button type="button" class="btn-c" data-wa="' + x.id + '">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="' + x.id + '">' + ico('call') + 'Call</button></div></article>';
  }
  function pcStep(btn) {
    var c = btn.closest('.pc'), x = byId(c.dataset.id), g = gal(x), im = $('.pc-media img', c);
    var i = ((Number(c.dataset.pi) || 0) + Number(btn.dataset.pcnav) + g.length) % g.length;
    c.dataset.pi = i; im.style.opacity = .25;
    var nx = new Image(); nx.onload = nx.onerror = function () { im.src = nx.src; im.alt = alt(g[i], x); im.style.opacity = 1; }; nx.src = IMG(g[i]);
    $('[data-pcn] span', c).textContent = (i + 1) + ' / ' + g.length;
    $$('.pc-dots i', c).forEach(function (d, k) { d.classList.toggle('on', k === Math.min(i, 4)); });
  }
  // Touch: swipe the card photo
  var tx0 = null;
  document.addEventListener('touchstart', function (e) { var m = e.target.closest('.pc-media'); tx0 = m ? [e.touches[0].clientX, e.touches[0].clientY, m] : null; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!tx0) return; var dx = e.changedTouches[0].clientX - tx0[0], dy = e.changedTouches[0].clientY - tx0[1];
    var row = tx0[2].closest('.cards'), rowScrolls = row && getComputedStyle(row).overflowX === 'auto';
    if (!rowScrolls && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { var b = $('[data-pcnav="' + (dx < 0 ? 1 : -1) + '"]', tx0[2]); if (b) pcStep(b); }
    tx0 = null;
  }, { passive: true });
  function ppBar(p, pre) {
    if (!p) return '';
    var seg = [['s1', p.booking, 'On booking'], ['s2', p.construction, 'During construction'], ['s3', p.handover, 'On handover']];
    return '<div class="pp' + (pre ? ' pre' : '') + '"><div class="pp-bar" role="img" aria-label="Payment plan ' + esc(p.overall) + ': ' + seg.filter(function (s) { return s[1]; }).map(function (s) { return s[1] + '% ' + s[2].toLowerCase(); }).join(', ') + '">' +
      seg.filter(function (s) { return s[1]; }).map(function (s) { return '<span class="' + s[0] + '" style="width:' + s[1] + '%"></span>'; }).join('') +
      (p.booking == null ? '' : '') + '</div><div class="pp-legend">' +
      seg.map(function (s, i) { return s[1] ? '<span><i class="k' + (i + 1) + '"></i>' + s[2] + ' <b>' + s[1] + '%</b></span>' : '<span><i style="background:#ddd"></i>' + s[2] + ' <b>not stated</b></span>'; }).join('') + '</div></div>';
  }
  function projCard(p) {
    var d = p.dev ? DEV(p.dev) : null;
    var media = p.img ? '<img src="' + IMG(p.img) + '" alt="' + esc(alt(p.img)) + '" loading="lazy" width="800" height="500"><span class="tag-r">Developer render</span>' :
      '<div class="noimg">' + (d ? '<img src="logo/' + d.key + '.png" alt="">' : '') + '<span>No approved project imagery yet</span></div>';
    var link = p.listing ? '#property/' + p.listing : '#offplan/' + p.key;
    return '<article class="pj" data-key="' + p.key + '" data-city="' + p.city + '"><a class="pj-media" href="' + link + '"' + (p.listing ? '' : ' data-todo="Project pages are outside this specimen\'s four pages."') + ' aria-label="' + esc(p.name) + '">' + media + '</a>' +
      '<div class="pj-body"><div class="pj-top"><div><h3>' + esc(p.name) + '</h3><p class="loc">' + ico('pin') + esc(p.loc) + '</p></div>' +
      (d ? '<img class="pj-logo" src="logo/' + d.key + '.png" alt="' + esc(d.name) + '">' : '') + '</div>' +
      '<dl class="pj-facts"><div><dt>' + (p.price ? 'Listed from' : 'Price') + '</dt><dd' + (p.price ? '' : ' class="ask"') + '>' + (p.price ? AED(p.price) : 'On request') + '</dd></div>' +
      '<div><dt>Handover</dt><dd' + (p.handover ? '' : ' class="ask"') + '>' + (p.handover || 'Ask us') + '</dd></div>' +
      '<div><dt>Payment plan</dt><dd' + (p.plan ? '' : ' class="ask"') + '>' + (p.plan ? esc(p.plan.overall) : 'Ask us') + '</dd></div></dl>' +
      (p.plan ? ppBar(p.plan, true) : '') +
      '<p class="pj-units">' + esc(p.units) + (p.priceNote ? ' · listed unit: ' + esc(p.priceNote) : '') + (p.furnishing ? ' · ' + p.furnishing : '') + '</p>' +
      '<div class="pj-act"><button type="button" class="btn sm" data-enquire="' + p.key + '">Payment plan &amp; brochure</button><button type="button" class="btn-c" data-wa="' + p.key + '">' + ico('wa') + 'WhatsApp</button></div></div></article>';
  }

  /* ============================================================
     Map (stylised geography; approximate, community level only)
     ============================================================ */
  function refitMaps() { $$('.map-gl').forEach(function (m) { if (m._aaResize) m._aaResize(); }); window.dispatchEvent(new Event('aa-map-resize')); }

  /* ============================================================
     Header: mega menus (desktop), menu dialog (mobile), scroll states
     ============================================================ */
  var cnt = function (f) { return L.filter(f).length; };
  var sale = function (x) { return x.pur === 'sale'; }, rent = function (x) { return x.pur === 'rent'; };
  function megaLink(href, label, n, data) { return '<li><a href="' + href + '"' + (data || '') + '><span>' + label + '</span>' + (n != null ? '<span class="c">' + n + '</span>' : '') + '</a></li>'; }
  function megaFeat(x, kicker) {
    return '<a class="mega-feat" href="#property/' + x.id + '"><div class="ph"><img src="' + IMG(x.img) + '" alt="' + esc(x.alt) + '"></div><div class="tx"><span>' + esc(kicker) + '</span><b>' + AED(x.pr) + (x.pur === 'rent' ? ' a year' : '') + '</b><span>' + esc(T(x)) + ', ' + esc(x.area) + '</span><span class="btn sm mf-cta">View property' + ico('arrow', 'go') + '</span></div></a>';
  }
  function megaLatest(list) {
    return '<h3 style="margin-top:22px">Latest listings</h3><ul class="mega-latest">' + list.slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 2).map(function (x) {
      return '<li><a href="#property/' + x.id + '"' + hov(x) + '><img src="' + IMG(x.img) + '" alt=""><span><b>' + AED(x.pr) + (x.pur === 'rent' ? ' a year' : '') + '</b>' + esc(T(x)) + ', ' + esc(x.area) + '</span></a></li>';
    }).join('') + '</ul>';
  }
  var ownerLink = '<a class="link-arrow" href="#home" data-scroll="advice">List your property with us' + ico('arrow') + '</a>';
  var hov = function (x) { return ' data-img="' + x.img + '" data-cap="' + esc(T(x) + ', ' + x.area) + '"'; };
  var MEGA = {
    buy: function () {
      var S = L.filter(sale);
      return '<div class="mega-col"><h3>Property type</h3><ul>' +
        megaLink('#search/sale/apartment', 'Apartments', cnt(function (x) { return sale(x) && x.type === 'apartment'; }), hov(byId(31082))) +
        megaLink('#search/sale/villa', 'Villas', cnt(function (x) { return sale(x) && x.type === 'villa'; }), hov(byId(31495))) +
        megaLink('#search/sale/townhouse', 'Townhouses', cnt(function (x) { return sale(x) && x.type === 'townhouse'; }), hov(byId(31083))) + '</ul>' +
        megaLatest(S.filter(function (x) { return x.comp === 'ready'; })) + '</div>' +
        '<div class="mega-col"><h3>Location</h3><ul>' + megaLink('#search/sale', 'Abu Dhabi', S.length) + megaLink('#search/offplan', 'Dubai (off-plan projects)', 3) + '</ul>' +
        '<h3 style="margin-top:22px">Completion</h3><ul>' + megaLink('#search/sale', 'Ready to move in', cnt(function (x) { return sale(x) && x.comp === 'ready'; })) + megaLink('#search/offplan', 'Off-plan', cnt(function (x) { return x.comp === 'offplan'; })) + '</ul></div>' +
        '<div class="mega-col"><h3>Budget</h3><ul>' + megaLink('#search/sale', 'Under AED 1M', cnt(function (x) { return sale(x) && x.pr < 1e6; })) + megaLink('#search/sale', 'AED 1M to 3M', cnt(function (x) { return sale(x) && x.pr >= 1e6 && x.pr <= 3e6; })) + megaLink('#search/sale', 'Over AED 3M', cnt(function (x) { return sale(x) && x.pr > 3e6; })) + '</ul></div>' +
        megaFeat(byId(31495), 'Featured · ready to buy') +
        '<div class="mega-foot"><span>Penthouses: none listed now.</span><a class="link-arrow" href="#search/sale">All ' + S.length + ' homes for sale' + ico('arrow') + '</a>' + ownerLink + '</div>';
    },
    rent: function () {
      var R = L.filter(rent);
      return '<div class="mega-col"><h3>Property type</h3><ul>' +
        megaLink('#search/rent/apartment', 'Apartments', cnt(function (x) { return rent(x) && x.type === 'apartment'; }), hov(byId(31013))) +
        megaLink('#search/rent/villa', 'Villas', cnt(function (x) { return rent(x) && x.type === 'villa'; }), hov(byId(31521))) + '</ul>' + megaLatest(R) + '</div>' +
        '<div class="mega-col"><h3>Popular areas</h3><ul>' + ['Yas Island', 'Al Raha', 'Al Reem Island', 'Al Khalidiya'].map(function (a) { var f = inArea(a, R); return megaLink('#search/rent', a, f.length, f[0] ? hov(f[0]) : ''); }).join('') + '</ul></div>' +
        '<div class="mega-col"><h3>Budget a year</h3><ul>' + megaLink('#search/rent', 'Under AED 100K', cnt(function (x) { return rent(x) && x.pr < 1e5; })) + megaLink('#search/rent', 'AED 100K to 200K', cnt(function (x) { return rent(x) && x.pr >= 1e5 && x.pr <= 2e5; })) + megaLink('#search/rent', 'Over AED 200K', cnt(function (x) { return rent(x) && x.pr > 2e5; })) + '</ul></div>' +
        megaFeat(byId(31521), 'Featured · for rent') +
        '<div class="mega-foot"><span>All rents in Abu Dhabi. Dubai rentals: none listed now.</span><a class="link-arrow" href="#search/rent">All ' + R.length + ' homes for rent' + ico('arrow') + '</a>' + ownerLink + '</div>';
    },
    offplan: function () {
      var P = A.PROJECTS;
      var pl = function (p) { return '<li><a href="' + (p.listing ? '#property/' + p.listing : '#search/offplan') + '" data-img="' + (p.img || 'aquarise-render') + '" data-cap="' + esc(p.name + ', ' + p.loc) + '"><span>' + esc(p.name) + '</span><span class="c">' + (p.handover || '') + '</span></a></li>'; };
      return '<div class="mega-col"><h3>Abu Dhabi off-plan</h3><ul>' + P.filter(function (p) { return p.city === 'Abu Dhabi'; }).map(pl).join('') + '</ul>' +
        '<h3 style="margin-top:22px">Dubai off-plan</h3><ul>' + P.filter(function (p) { return p.city === 'Dubai'; }).map(pl).join('') + '</ul></div>' +
        '<div class="mega-col" style="grid-column:span 2"><h3>By developer</h3><div class="mega-chips">' + A.DEVS.filter(function (d) { return d.projects.length; }).map(function (d) { return '<a class="chip" href="#search/offplan">' + esc(d.name) + ' <span class="c">' + d.projects.length + '</span></a>'; }).join('') + '</div>' +
        '<h3 style="margin-top:22px">By handover</h3><div class="mega-chips"><a class="chip" href="#search/offplan">2027 <span class="c">1</span></a><a class="chip" href="#search/offplan">2029 <span class="c">2</span></a><a class="chip" href="#search/offplan">Ask us <span class="c">2</span></a></div>' +
        '<h3 style="margin-top:22px">By payment plan</h3><div class="mega-chips"><a class="chip" href="#search/offplan">70/30 <span class="c">2</span></a><a class="chip" href="#search/offplan">85/15 <span class="c">1</span></a><a class="chip" href="#search/offplan">From 10% on booking <span class="c">1</span></a></div></div>' +
        '<a class="mega-feat" href="#property/31094"><div class="ph"><img src="' + IMG('brabus-aerial') + '" alt="' + esc(alt('brabus-aerial')) + '"><span class="tag-r">Developer render</span></div><div class="tx"><span>Featured project · Al Raha Beach</span><b>Brabus Island</b><span>Handover Q1 2029 · 85/15 plan · from 10% on booking</span><span class="btn sm mf-cta">View project' + ico('arrow', 'go') + '</span></div></a>' +
        '<div class="mega-foot"><a class="link-arrow" href="#search/offplan">All off-plan projects' + ico('arrow') + '</a></div>';
    },
    areas: function () {
      var ad = A.AREAS.filter(function (a) { return a.city === 'Abu Dhabi'; }), du = A.AREAS.filter(function (a) { return a.city === 'Dubai'; });
      return '<div class="mega-col"><h3>Abu Dhabi</h3><ul>' + ad.map(function (a) { return megaLink(a.key === 'yas' ? '#area' : '#search/rent', a.n, inArea(a.n).length + ' homes', ' data-img="' + a.img + '" data-cap="' + esc(a.n + ' · ' + a.line) + '"' + (a.key === 'yas' ? '' : ' data-todo="Only Yas Island has an area page in this specimen; this opens search in the live site."')); }).join('') + '</ul></div>' +
        '<div class="mega-col"><h3>Dubai</h3><ul>' + du.map(function (a) { var n = A.PROJECTS.filter(function (p) { return p.area === a.n; }).length; return megaLink('#search/offplan', a.n, n + (n === 1 ? ' project' : ' projects'), ' data-img="' + a.img + '" data-cap="' + esc(a.n + ' · ' + a.line) + '"'); }).join('') + '</ul>' +
        '<p class="fine" style="margin-top:16px">Saadiyat Island: no listings and no approved photography yet.</p></div>' +
        '<div class="mega-col"><h3>Guides</h3><ul>' + megaLink('#area', 'Yas Island area guide', null) + megaLink('#home', 'All areas on the homepage', null, ' data-scroll="areas"') + '</ul></div>' +
        '<a class="mega-feat" href="#area"><div class="ph"><img src="' + IMG('yas-terrace-view') + '" alt="' + esc('Covered terrace looking over a villa street in West Yas') + '"></div><div class="tx"><span>Area guide</span><b>Yas Island</b><span>Contemporary villas on tree-lined streets in West Yas.</span><span class="btn sm mf-cta">View area' + ico('arrow', 'go') + '</span></div></a>';
    },
    developers: function () {
      var feat = A.DEVS.filter(function (d) { return d.projects.length; });
      var dir = ['emaar', 'sobha', 'damac', 'meraas'].map(DEV);
      return '<div class="mega-devs">' + feat.map(function (d) { var p = PROJ(d.projects[0]); return '<a class="mega-dev" href="#search/offplan"><img src="logo/' + d.key + '.png" alt="' + esc(d.name) + '"><span><b>' + esc(p.name) + '</b><br>' + esc(p.loc) + ' · ' + esc(p.handover) + '</span></a>'; }).join('') +
        dir.map(function (d) { return '<a class="mega-dev" href="#home" data-scroll="developers"><img src="logo/' + d.key + '.png" alt="' + esc(d.name) + '"><span>In our directory · no listed projects yet</span></a>'; }).join('') + '</div>' +
        '<div class="mega-col"><h3>Developer directory</h3><ul>' + megaLink('#home', 'All 17 developers', 17, ' data-scroll="developers"') + megaLink('#search/offplan', 'With listed projects', feat.length) + '</ul><p class="fine" style="margin-top:14px">Only verified developer–project links are shown (2 of 17 so far).</p></div>' +
        '<div class="mega-foot"><a class="link-arrow" href="#home" data-scroll="developers">View all developers' + ico('arrow') + '</a></div>';
    }
  };
  var megaKey = null, megaT;
  function openMega(k, viaKey) {
    var m = $('#mega');
    if (megaKey === k) return;
    megaKey = k;
    m.innerHTML = '<div class="mega-in">' + MEGA[k]() + '</div>';
    m.hidden = false; m.classList.remove('enter'); void m.offsetWidth; if (!RM) m.classList.add('enter');
    $$('.nav-b[data-mega]').forEach(function (b) { b.setAttribute('aria-expanded', b.dataset.mega === k); });
    hdr.classList.add('mega-open'); $('#scrim').hidden = false;
    // React + Move: hovering a list item swaps the featured image
    var feat = $('.mega-feat', m);
    if (feat) $$('a[data-img]', m).forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        var im = $('img', feat), cap = $('.tx span:last-child', feat);
        if (im.getAttribute('src') === IMG(a.dataset.img)) return;
        if (G && !RM) gsap.fromTo(im, { opacity: .2, scale: 1.04 }, { opacity: 1, scale: 1, duration: .5, ease: 'power2.out' });
        im.src = IMG(a.dataset.img); im.alt = ''; if (cap) cap.textContent = a.dataset.cap;
      });
    });
    if (viaKey) { var f = $('a', m); if (f) f.focus(); }
  }
  function closeMega() {
    if (!megaKey) return; megaKey = null;
    $('#mega').hidden = true; $('#scrim').hidden = true; hdr.classList.remove('mega-open');
    $$('.nav-b[data-mega]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  $$('.nav-b[data-mega]').forEach(function (b) {
    b.addEventListener('click', function () { if (megaKey === b.dataset.mega) closeMega(); else openMega(b.dataset.mega); });
    b.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); openMega(b.dataset.mega, true); } });
    b.addEventListener('mouseenter', function () { clearTimeout(megaT); megaT = setTimeout(function () { openMega(b.dataset.mega); }, megaKey ? 0 : 140); });
    b.addEventListener('mouseleave', function () { clearTimeout(megaT); });
  });
  hdr.addEventListener('mouseleave', function () { clearTimeout(megaT); megaT = setTimeout(closeMega, 260); });
  hdr.addEventListener('mouseenter', function () { if (megaKey) clearTimeout(megaT); });
  $('#scrim').addEventListener('click', closeMega);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && megaKey) { var k = megaKey; closeMega(); var b = $('.nav-b[data-mega="' + k + '"]'); if (b) b.focus(); } });

  /* Header over the hero: transparent, then solid; hides on scroll down, returns on scroll up */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY, over = (route.page === 'home' || route.page === 'area') && y < (window.innerHeight * .72);
    hdr.classList.toggle('over', over);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (!megaKey && y > 400 && down) hdr.classList.add('hide');
    else if (up || y < 200) hdr.classList.remove('hide');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  function mnavHTML() {
    var sec = function (k, label, body) { return '<div class="mn-sec"><button type="button" aria-expanded="false" aria-controls="mn-' + k + '">' + label + ico('chev') + '</button><div class="mn-in" id="mn-' + k + '" hidden>' + body + '</div></div>'; };
    var ln = function (href, t, n) { return '<a href="' + href + '">' + t + (n != null ? '<span class="c">' + n + '</span>' : '') + '</a>'; };
    var fc = function (x) { return '<a href="#property/' + x.id + '"><img src="' + IMG(x.img) + '" alt="" loading="lazy"><b>' + AED(x.pr) + (x.pur === 'rent' ? ' a year' : '') + '</b><span>' + esc(T(x)) + ', ' + esc(x.area) + '</span></a>'; };
    return '<div class="mn-hd"><img src="logo/alaliah-h-crimson.png" alt="Al Aliah International"><button type="button" class="d-x" data-close>' + ico('close') + '<span class="vh">Close menu</span></button></div>' +
      '<div class="mn-bd">' +
      sec('buy', 'Buy', '<div class="mn-links">' + ln('#search/sale', 'Apartments', 3) + ln('#search/sale', 'Villas', 1) + ln('#search/sale', 'Townhouses', 1) + ln('#search/offplan', 'Off-plan', 2) + '</div><h3>Featured</h3><div class="mn-feat">' + fc(byId(31495)) + fc(byId(31082)) + '</div>') +
      sec('rent', 'Rent', '<div class="mn-links">' + ln('#search/rent', 'Apartments', 4) + ln('#search/rent', 'Villas', 2) + ln('#search/rent', 'Yas Island', 1) + ln('#search/rent', 'Al Raha', 2) + '</div><h3>Featured</h3><div class="mn-feat">' + fc(byId(31521)) + fc(byId(31013)) + '</div>') +
      sec('off', 'Off-Plan', '<div class="mn-links">' + ln('#search/offplan', 'Abu Dhabi', 2) + ln('#search/offplan', 'Dubai', 3) + ln('#search/offplan', 'Handover 2027', 1) + ln('#search/offplan', '70/30 plans', 2) + '</div>') +
      sec('areas', 'Areas', '<h3>Abu Dhabi</h3><div class="mn-links">' + A.AREAS.filter(function (a) { return a.city === 'Abu Dhabi'; }).map(function (a) { return ln(a.key === 'yas' ? '#area' : '#search/rent', a.n, inArea(a.n).length); }).join('') + '</div><h3>Dubai</h3><div class="mn-links">' + ln('#search/offplan', 'Business Bay', 2) + ln('#search/offplan', 'Dubai South', 1) + '</div>') +
      sec('dev', 'Developers', '<div class="mn-links">' + A.DEVS.filter(function (d) { return d.projects.length; }).map(function (d) { return ln('#search/offplan', d.name, d.projects.length); }).join('') + ln('#home', 'All 17 developers') + '</div>') +
      '<a class="mn-plain" href="#about" data-todo="About Us is outside this specimen\'s four pages.">About Us</a><a class="mn-plain" href="#home" data-scroll="advice">List your property</a></div>' +
      '<div class="mn-ft"><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="general">' + ico('call') + 'Call</button><button type="button" class="btn" data-enquire="general">Contact</button></div>';
  }
  $('#hdr-menu').addEventListener('click', function () {
    var d = $('#mnav'); d.innerHTML = mnavHTML(); d.showModal();
    $$('.mn-sec > button', d).forEach(function (b) { b.addEventListener('click', function () { var on = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', on); $('#' + b.getAttribute('aria-controls')).hidden = !on; }); });
  });

  /* ============================================================
     Footer
     ============================================================ */
  function footer() {
    var band = route.page === 'home' ? '' : '<div class="cb dark"><div class="wrap cb-in"><div><p class="eyebrow">Need guidance?</p><h2 class="cb-h">Request a call back</h2><p>An adviser calls you within working hours. Or message us now on WhatsApp.</p></div>' +
      '<form class="cb-f" id="cb-f" novalidate><div class="inp"><label for="cb-n">Name</label><input id="cb-n" autocomplete="name"></div><div class="inp"><label for="cb-p">Mobile number</label><input id="cb-p" type="tel" autocomplete="tel" inputmode="tel"></div><button type="submit" class="btn light">Request a call back</button><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'WhatsApp</button></form></div></div>';
    var keyAreas = A.AREAS.filter(function (a) { return a.city === 'Abu Dhabi'; }).map(function (a) { var n2 = inArea(a.n).length; return '<li><a href="' + (a.key === 'yas' ? '#area' : '#search/' + (inArea(a.n).some(rent) ? 'rent' : 'sale')) + '">' + esc(a.n) + ' <span class="c">(' + n2 + (n2 === 1 ? ' listing' : ' listings') + ')</span></a></li>'; }).join('');
    $('#ft').innerHTML = band + '<div class="wrap"><div class="ft-top"><div class="ft-brand"><img src="logo/alaliah-white.png" alt="Al Aliah International" width="120" height="134"><p>Property advice and brokerage in Abu Dhabi, with off-plan projects across the UAE.</p><div class="cpair dark" style="background:none"><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="general">' + ico('call') + 'Call</button></div></div>' +
      '<div><h3>Buy</h3><ul><li><a href="#search/sale">Apartments</a></li><li><a href="#search/sale">Villas</a></li><li><a href="#search/sale">Townhouses</a></li><li><a href="#search/offplan">Off-plan</a></li></ul></div>' +
      '<div><h3>Rent</h3><ul><li><a href="#search/rent">Apartments</a></li><li><a href="#search/rent">Villas</a></li><li><a href="#area">Yas Island</a></li><li><a href="#search/rent">Al Raha</a></li></ul></div>' +
      '<div><h3>Key areas</h3><ul>' + keyAreas + '</ul></div>' +
      '<div><h3>Explore</h3><ul><li><a href="#home" data-scroll="areas">Areas</a></li><li><a href="#home" data-scroll="developers">Developers</a></li><li><a href="#home" data-scroll="invest">Investing</a></li></ul></div>' +
      '<div><h3>Company</h3><ul><li><a href="#about" data-todo="About Us is outside this specimen.">About Us</a></li><li><a href="#home" data-scroll="advice">List your property</a></li><li><a href="#home" data-scroll="advice">Contact</a></li></ul></div></div>' +
      '<div class="ft-bot"><span>© 2026 Al Aliah International. Abu Dhabi, United Arab Emirates.</span><span>Licence and permit details are shown here once verified (open question Q9).</span></div></div>';
    $$('#ft .cpair').forEach(function (c) { c.classList.add('dark'); });
    var cbf = $('#cb-f'); if (cbf) cbf.addEventListener('submit', function (e) { e.preventDefault(); toast('<b>Specimen:</b> nothing was sent. Live: the request reaches an adviser (lead routing: open question W7).'); });
  }

  /* ============================================================
     HOMEPAGE
     ============================================================ */
  var homeQ = { pur: 'sale', loc: '', type: '', beds: '', price: '' };
  var PRICES = { sale: [['', 'Any price'], ['0-1000000', 'Under AED 1M'], ['1000000-3000000', 'AED 1M to 3M'], ['3000000-', 'Over AED 3M']], rent: [['', 'Any rent'], ['0-100000', 'Under AED 100K a year'], ['100000-200000', 'AED 100K to 200K'], ['200000-', 'Over AED 200K']], offplan: [['', 'Any price'], ['0-3500000', 'Under AED 3.5M'], ['3500000-', 'Over AED 3.5M']] };
  function poolFor(pur) { return L.filter(function (x) { return pur === 'offplan' ? x.comp === 'offplan' : x.pur === pur; }); }
  function match(x, q) {
    if (q.loc && x.area !== q.loc) return false;
    if (q.type && x.type !== q.type) return false;
    if (q.beds && x.b < Number(q.beds)) return false;
    if (q.price) { var r = q.price.split('-'); if (r[0] && x.pr < Number(r[0])) return false; if (r[1] && x.pr > Number(r[1])) return false; }
    return true;
  }
  function homeCount() {
    var n = poolFor(homeQ.pur).filter(function (x) { return match(x, homeQ); }).length;
    if (homeQ.pur === 'offplan' && !homeQ.loc && !homeQ.type && !homeQ.beds && !homeQ.price) n += 3;
    return n;
  }
  function qsHTML() {
    var opt = function (arr, v) { return arr.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join(''); };
    return '<div class="qs-tabs" role="tablist" aria-label="Search for">' + [['sale', 'Buy'], ['rent', 'Rent'], ['offplan', 'Off-Plan']].map(function (t) { return '<button type="button" role="tab" class="qs-tab" data-pur="' + t[0] + '" aria-selected="' + (homeQ.pur === t[0]) + '" id="qs-t-' + t[0] + '" aria-controls="qs-p">' + t[1] + '</button>'; }).join('') +
      '<span class="qs-note">Abu Dhabi listings · Dubai off-plan</span></div>' +
      '<div class="qs-row" id="qs-p" role="tabpanel" aria-labelledby="qs-t-' + homeQ.pur + '">' +
      '<div class="fld"><label for="q-loc">Location</label><input id="q-loc" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="q-sugg" autocomplete="off" placeholder="Community or area" value="' + esc(homeQ.loc) + '"><div class="sugg" id="q-sugg" role="listbox" aria-label="Locations" hidden></div></div>' +
      '<div class="fld"><label for="q-type">Property type</label><select id="q-type">' + opt([['', 'Any type'], ['apartment', 'Apartment'], ['villa', 'Villa'], ['townhouse', 'Townhouse']], homeQ.type) + '</select></div>' +
      '<div class="fld"><label for="q-beds">Bedrooms</label><select id="q-beds">' + opt([['', 'Any'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+'], ['5', '5+']], homeQ.beds) + '</select></div>' +
      '<div class="fld"><label for="q-price">Price</label><select id="q-price">' + opt(PRICES[homeQ.pur], homeQ.price) + '</select></div>' +
      '<button type="submit" class="btn primary qs-go">' + ico('search') + '<span>Search <span class="n" id="q-n">' + homeCount() + '</span> <span id="q-u">' + (homeQ.pur === 'offplan' ? 'options' : 'homes') + '</span></span></button></div>' +
      '<div class="qs-mf"><button type="button" id="q-more">' + ico('filter') + 'Filters</button><button type="submit" class="btn primary qs-go">' + ico('search') + '<span>Search <span class="n">' + homeCount() + '</span></span></button></div>' +
      '<div class="qs-pop"><span>Popular:</span><a href="#search/rent/villa">Villas for rent</a><a href="#search/offplan">Off-plan with payment plans</a><a href="#area">Yas Island</a><a href="#search/sale">Under AED 1M</a></div>';
  }
  function wireQS() {
    var f = $('#qs');
    $$('.qs-tab', f).forEach(function (b) {
      b.addEventListener('click', function () { homeQ.pur = b.dataset.pur; homeQ.price = ''; f.innerHTML = qsHTML(); wireQS(); $('#qs-t-' + homeQ.pur).focus(); });
      b.addEventListener('keydown', function (e) { var t = $$('.qs-tab', f), i = t.indexOf(b); if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); t[(i + (e.key === 'ArrowRight' ? 1 : t.length - 1)) % t.length].click(); } });
    });
    ['type', 'beds', 'price'].forEach(function (k) { $('#q-' + k).addEventListener('change', function (e) { homeQ[k] = e.target.value; upd(); }); });
    function upd() { $$('.qs-go .n', f).forEach(function (n) { n.textContent = homeCount(); }); }
    combobox($('#q-loc'), $('#q-sugg'), function (v) { homeQ.loc = v; upd(); });
    $('#q-more').addEventListener('click', function () { sQ = fromHome(); openSheet(true); });
  }
  function combobox(input, list, onPick) {
    var idx = -1;
    var opts = function (q) {
      q = q.trim().toLowerCase();
      var ad = A.AREAS.filter(function (a) { return a.city === 'Abu Dhabi' && (!q || a.n.toLowerCase().indexOf(q) > -1); });
      var du = A.AREAS.filter(function (a) { return a.city === 'Dubai' && (!q || a.n.toLowerCase().indexOf(q) > -1); });
      var h = '';
      if (ad.length) h += '<div class="grp">Abu Dhabi</div>' + ad.map(function (a) { return '<div role="option" id="o-' + a.key + '" data-v="' + esc(a.n) + '" aria-selected="false">' + esc(a.n) + '<span>' + inArea(a.n).length + ' homes</span></div>'; }).join('');
      if (du.length) h += '<div class="grp">Dubai</div>' + du.map(function (a) { return '<div role="option" id="o-' + a.key + '" data-v="' + esc(a.n) + '" aria-selected="false">' + esc(a.n) + '<span>off-plan</span></div>'; }).join('');
      return h || '<div class="grp">No matching area. Try "Yas" or "Raha".</div>';
    };
    var open = function () { list.innerHTML = opts(input.value); list.hidden = false; input.setAttribute('aria-expanded', 'true'); idx = -1; };
    var close = function () { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); };
    var pick = function (o) { input.value = o.dataset.v; onPick(o.dataset.v); close(); };
    input.addEventListener('focus', open);
    input.addEventListener('input', function () { if (!input.value) onPick(''); open(); });
    input.addEventListener('blur', function () { setTimeout(close, 150); });
    input.addEventListener('keydown', function (e) {
      var o = $$('[role="option"]', list);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (list.hidden) open(); o = $$('[role="option"]', list); if (!o.length) return; idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + o.length) % o.length; o.forEach(function (x, i) { x.setAttribute('aria-selected', i === idx); }); input.setAttribute('aria-activedescendant', o[idx].id); o[idx].scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter' && !list.hidden && idx > -1) { e.preventDefault(); pick(o[idx]); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('mousedown', function (e) { var o = e.target.closest('[role="option"]'); if (o) { e.preventDefault(); pick(o); } });
  }
  function fromHome() { return { pur: homeQ.pur, locs: homeQ.loc ? [homeQ.loc] : [], types: homeQ.type ? [homeQ.type] : [], beds: homeQ.beds, price: homeQ.price, comp: '', sort: 'new', sl: false }; }

  function renderHome() {
    var sales = L.filter(sale), rents = L.filter(rent), offs = A.PROJECTS;
    var salePr = sales.map(function (x) { return x.pr; }), rentPr = rents.map(function (x) { return x.pr; });
    var tiles = [
      { k: 'Buy', href: '#search/sale', img: 'riyad-villa', alt: 'Two-storey villa for sale in Madinat Al Riyad', s: sales.length + ' homes for sale in Abu Dhabi', r: 'AED ' + short(Math.min.apply(null, salePr)) + ' to ' + short(Math.max.apply(null, salePr)), go: 'Browse homes to buy' },
      { k: 'Rent', href: '#search/rent', img: 'yas-terrace-glass', alt: 'Terrace of a villa for rent in West Yas', s: rents.length + ' homes for rent', r: 'AED ' + short(Math.min.apply(null, rentPr)) + ' to ' + short(Math.max.apply(null, rentPr)) + ' a year', go: 'Browse homes to rent' },
      { k: 'Off-Plan', href: '#search/offplan', img: 'khalifa-sunset', alt: 'Developer render of off-plan townhouses in Khalifa City', s: offs.length + ' projects in Abu Dhabi and Dubai', r: 'Payment plans from 10% on booking', go: 'Compare off-plan projects', render: true }
    ];
    var homesSale = [31495, 31082, 30964, 31094].map(byId), homesRent = [31521, 30967, 31013, 31571].map(byId);
    var selIds = [31521, 31495, 30967];

    main.innerHTML =
      /* Hero */
      '<div class="hero-stack" id="hero-stack"><section class="hero on-img" id="hero" aria-label="Search Abu Dhabi property">' +
      '<div class="hero-media" id="hero-media"><img src="' + IMG('yas-terrace-timber') + '" alt="Upper terrace of a villa in West Yas: timber-clad wall, pergola slats and a glass balustrade" fetchpriority="high" width="1280" height="960"></div>' +
      '<div class="hero-shade" id="hero-shade" aria-hidden="true"></div>' +
      '<div class="plate" id="plate" aria-hidden="true"><div class="plate-h t"></div><div class="plate-h b"></div><span class="plate-line"></span>' +
      '<span class="plate-n"><i></i><b id="plate-n">0</b>%</span><img class="plate-logo" src="logo/alaliah-crimson.png" alt=""><span class="plate-r">Abu Dhabi · Dubai</span></div>' +
      '<a class="hero-anchor" id="hero-anchor" href="#property/31521"><span>In this photo: <b>five-bedroom villa for rent</b>, West Yas</span><span class="go">' + ico('arrow') + '</span></a>' +
      '<div class="hero-in wrap"><div class="hero-copy"><h1 aria-label="Abu Dhabi property, clearly understood.">' + words('Abu Dhabi property,', 'ln') + words('clearly understood.', 'ln') + '</h1><p class="hero-sub">Homes to buy and rent, and off-plan projects, with advisers who know each community.</p></div>' +
      '<form class="qs" id="qs" role="search" aria-label="Property search">' + qsHTML() + '</form></div></section>' +
      /* Discover: slides over the pinned hero */
      '<section class="sec tight cover" aria-labelledby="disc-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Start here</p><h2 class="h2" id="disc-h">What are you looking for?</h2></div></div>' +
      '<div class="disc">' + tiles.map(function (t) { return '<a class="tile" href="' + t.href + '"><img src="' + IMG(t.img) + '" alt="' + esc(t.alt) + '" loading="lazy" width="800" height="1000">' + (t.render ? '<span class="tag-r">Developer render</span>' : '') + '<span class="tx"><span class="k">' + t.k + '</span><span class="s">' + t.s + '<br>' + t.r + '</span><span class="go">' + t.go + ico('arrow') + '</span></span></a>'; }).join('') + '</div></div></section></div>' +
      /* Homes */
      '<section class="sec homes" aria-labelledby="homes-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Available now</p><h2 class="h2" id="homes-h">Homes you can view this week</h2><p class="lede">Every card opens the full listing. WhatsApp and Call reach an adviser about that exact home.</p></div><a class="link-arrow" href="#search/sale" id="homes-all">All homes' + ico('arrow') + '</a></div>' +
      '<div class="tabs" role="tablist" aria-label="Purpose"><button class="tab" role="tab" id="ht-sale" aria-selected="true" aria-controls="homes-p">For sale <span class="c">' + sales.length + '</span></button><button class="tab" role="tab" id="ht-rent" aria-selected="false" aria-controls="homes-p">For rent <span class="c">' + rents.length + '</span></button></div>' +
      '<div id="homes-p" role="tabpanel" aria-labelledby="ht-sale"><div class="cards">' + homesSale.map(function (x) { return card(x); }).join('') + '</div></div></div></section>' +
      /* Selection */
      '<section class="sec sel-sec" aria-labelledby="sel-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Selected by our advisers</p><h2 class="h2" id="sel-h">Homes with room to live</h2><p class="lede">Large homes from our current listings, chosen for space and layout. Ask for others before they reach the site.</p></div></div>' +
      '<div class="sel-grid"><div class="sel-stage" id="sel-stage"><img src="' + IMG(byId(31521).img) + '" alt="' + esc(byId(31521).alt) + '"><div class="sel-thumbs" id="sel-thumbs"></div></div>' +
      '<div><div class="sel-list" role="group" aria-label="Selected homes">' + selIds.map(function (id, i) { var x = byId(id); return '<button type="button" class="sel-item" data-id="' + id + '" aria-pressed="' + (i === 0) + '"><img src="' + IMG(x.img) + '" alt=""><span><span class="p">' + AED(x.pr) + (x.pur === 'rent' ? '<small style="font:500 13px var(--ft)"> a year</small>' : '') + '</span><span class="t">' + esc(T(x)) + ' · ' + esc(x.area) + '</span><span class="m">' + x.b + ' bedrooms · ' + x.ba + ' bathrooms · ' + (x.s ? fmt(x.s) + ' sq ft' : 'size not listed') + '</span></span></button>'; }).join('') + '</div>' +
      '<div class="sel-detail" id="sel-detail"></div></div></div></div></section>' +
      /* Areas */
      '<section class="sec dark areas-sec" id="areas" aria-labelledby="ar-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Areas</p><h2 class="h2" id="ar-h">Choose the place first</h2><p class="lede">See each community through the homes we list there: what is available, from what price, and what it looks like.</p></div>' +
      '<div class="city-sw" role="group" aria-label="City"><button type="button" data-city="Abu Dhabi" aria-pressed="true">Abu Dhabi</button><button type="button" data-city="Dubai" aria-pressed="false">Dubai</button></div></div>' +
      '<div class="ap" id="ap"></div><div class="ap-dots" id="ap-dots" aria-label="Areas"></div></div></section>' +
      /* Off-plan */
      '<section class="sec" id="offplan" aria-labelledby="op-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Off-Plan</p><h2 class="h2" id="op-h">Off-plan, compared on the numbers</h2><p class="lede">Price, handover and payment plan side by side. Where a developer has not confirmed a figure, we say so.</p></div><a class="link-arrow" href="#search/offplan">All off-plan' + ico('arrow') + '</a></div>' +
      opfHTML() +
      '<div class="op-sub"><h3>Compare all projects</h3><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div class="seg" role="group" aria-label="Show projects in"><button type="button" data-oc="" aria-pressed="true">All</button><button type="button" data-oc="Abu Dhabi" aria-pressed="false">Abu Dhabi</button><button type="button" data-oc="Dubai" aria-pressed="false">Dubai</button></div><div class="rail-nav"><button type="button" class="prev" aria-label="Previous projects">' + ico('arrow') + '</button><button type="button" class="next" aria-label="Next projects">' + ico('arrow') + '</button></div></div></div>' +
      '<div class="rail" id="op-rail">' + offs.map(projCard).join('') + '</div></div></section>' +
      /* Invest */
      '<section class="sec dark inv-sec" id="invest" aria-labelledby="iv-h"><div class="inv-bg" id="inv-bg" aria-hidden="true"></div><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Investing</p><h2 class="h2" id="iv-h">Investing, but not sure where?</h2><p class="lede">Start from how you want to invest. We show what matches today, and an adviser builds the shortlist with you.</p></div></div>' +
      '<div class="inv"><div class="inv-goals" id="inv-goals" role="group" aria-label="Investment goal"></div><div class="inv-res" id="inv-res" aria-live="polite"></div></div></div></section>' +
      /* Developers */
      '<section class="sec" id="developers" aria-labelledby="dv-h"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Developers</p><h2 class="h2" id="dv-h">Developers, through their projects</h2><p class="lede">Choose a developer to see the project we can take you to, where it is, when it hands over and how you pay.</p></div><a class="link-arrow" href="#home" data-todo="The developer index is outside this specimen\'s four pages.">All 17 developers' + ico('arrow') + '</a></div>' +
      '<div class="dvs" id="dvs"></div>' +
      '<h3 class="dv-dir-h">In our developer directory</h3>' +
      '<div class="dv-wall" aria-label="Developer directory">' + A.DEVS.map(function (d) { return '<a href="#search/offplan"' + (d.projects.length ? '' : ' data-todo="' + esc(d.name) + ': developer pages are outside this specimen."') + '><img src="logo/' + d.key + '.png" alt="' + esc(d.name) + '" loading="lazy"><span class="nm" aria-hidden="true">' + esc(d.name) + '</span>' + (d.projects.length ? '<span class="p">' + d.projects.length + ' project</span>' : '') + '</a>'; }).join('') + '<a class="all" href="#home" data-todo="The developer index is outside this specimen\'s four pages.">All developers' + ico('arrow') + '</a></div></div></section>' +
      /* Advice + contact */
      '<section class="sec red" id="advice" aria-labelledby="ad-h"><div class="wrap adv"><div><p class="eyebrow">Al Aliah International</p><h2 class="adv-st" id="ad-h">Advice first. Then the right listing.</h2><p class="lede">An Abu Dhabi brokerage for buying, renting and off-plan, with a view of Dubai projects. Tell us what you need; an adviser replies with options and the facts behind them.</p>' +
      '<div class="adv-list"><a href="#search/sale"><b>Buying a home</b><span>Ready homes, prices and what each community offers</span>' + ico('arrow') + '</a><a href="#search/rent"><b>Renting</b><span>Annual rents, cheques and move-in dates</span>' + ico('arrow') + '</a><a href="#search/offplan"><b>Off-plan guidance</b><span>Payment plans, handover dates and developer track record</span>' + ico('arrow') + '</a><a href="#home" data-todo="List your property is outside this specimen\'s four pages."><b>Selling or letting your property</b><span>A valuation conversation and a listing plan</span>' + ico('arrow') + '</a></div></div>' +
      '<form class="cform" id="cform" novalidate><h3>Talk to an adviser</h3><p>Fastest on WhatsApp. Or leave your details and we will call you.</p><div class="cpair"><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="general">' + ico('call') + 'Call</button></div><p class="or">or</p>' +
      '<div class="inp"><label for="c-name">Name</label><input id="c-name" autocomplete="name"></div><div class="inp"><label for="c-ph">Mobile number</label><input id="c-ph" type="tel" autocomplete="tel" inputmode="tel"></div><div class="inp"><label for="c-int">I\'m interested in</label><select id="c-int"><option>Buying</option><option>Renting</option><option>Off-plan</option><option>Selling or letting</option></select></div>' +
      '<button type="submit" class="btn">Request a call back' + ico('arrow', 'go') + '</button><p class="fine">We use your details only to reply to this request.</p></form></div></section>';

    footer();
    wireQS();
    $('#qs').addEventListener('submit', function (e) { e.preventDefault(); goSearch(fromHome()); });
    // Homes tabs
    var tabs = $$('.homes .tab');
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', t === b); });
        var list = i ? homesRent : homesSale, p = $('#homes-p');
        p.setAttribute('aria-labelledby', b.id); $('#homes-all').href = i ? '#search/rent' : '#search/sale';
        p.innerHTML = '<div class="cards">' + list.map(function (x) { return card(x); }).join('') + '</div>';
        if (G && !RM) gsap.from($$('.pc', p), { y: 24, opacity: 0, duration: .5, stagger: .06, ease: 'power2.out' });
      });
      b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + 1) % 2]; n.focus(); n.click(); } });
    });
    wireSelection(selIds);
    wireAreas('Abu Dhabi');
    $$('.city-sw button').forEach(function (b) { b.addEventListener('click', function () { $$('.city-sw button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); wireAreas(b.dataset.city); }); });
    wireOffplan();
    wireInvest();
    wireDevs();
    $('#cform').addEventListener('submit', function (e) { e.preventDefault(); toast('<b>Specimen:</b> nothing was sent. Live: the request goes to Al Aliah\'s lead inbox (open question W7).'); });
    heroMotion();
    homeReveals();
  }

  /* Selection: the list drives the large image (Hide → Reveal → React → Move) */
  function wireSelection(ids) {
    var stageEl = $('#sel-stage'), thumbs = $('#sel-thumbs'), det = $('#sel-detail');
    var WHY = {
      31521: 'The largest home we list for rent: 5,948 sq ft, five bedrooms, a maid\'s room and three balconies in West Yas.',
      31495: 'Five master bedrooms on 11,510 sq ft in Madinat Al Riyad, with a majlis, a women\'s lounge and a driver\'s room. Ready to move in.',
      30967: 'A furnished four-bedroom home with a private pool in Al Raha Beach. The size is not in the listing yet; ask us for the floor area.'
    };
    function show(id, first) {
      var x = byId(id), g = gal(x).slice(0, 4);
      $$('.sel-item').forEach(function (b) { b.setAttribute('aria-pressed', Number(b.dataset.id) === id); });
      thumbs.innerHTML = g.map(function (n, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-n="' + n + '" aria-label="Photo ' + (i + 1) + ' of ' + g.length + '"><img src="' + IMG(n) + '" alt=""></button>'; }).join('');
      setImg(g[0], alt(g[0], x), first);
      det.innerHTML = '<p class="sel-why">' + ico('check') + '<span>' + esc(WHY[id]) + '</span></p><div class="sel-act"><a class="btn primary" href="#property/' + id + '">View property' + ico('arrow', 'go') + '</a><button type="button" class="btn-c" data-wa="' + id + '">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="' + id + '">' + ico('call') + 'Call</button></div>';
      $$('button', thumbs).forEach(function (b) { b.addEventListener('click', function () { $$('button', thumbs).forEach(function (t) { t.setAttribute('aria-pressed', t === b); }); setImg(b.dataset.n, alt(b.dataset.n, x)); }); });
    }
    function setImg(n, a, instant) {
      var old = $('img', stageEl), im = new Image(); im.src = IMG(n); im.alt = a;
      stageEl.insertBefore(im, thumbs);
      if (instant || !G || RM) { if (old) old.remove(); return; }
      gsap.fromTo(im, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'expo.inOut', onComplete: function () { if (old && old.parentNode) old.remove(); } });
      gsap.fromTo(im, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
    }
    $$('.sel-item').forEach(function (b) { b.addEventListener('click', function () { show(Number(b.dataset.id)); }); });
    show(ids[0], true);
  }

  /* Areas: image panels; one expands, the others compress. Mobile: a swipe deck. */
  function areaStats(a) {
    var h = inArea(a.n), ps = A.PROJECTS.filter(function (p) { return p.area === a.n; }), r = h.filter(rent), s = h.filter(sale);
    var types = {}; h.forEach(function (x) { types[x.type] = (types[x.type] || 0) + 1; });
    var dom = Object.keys(types).sort(function (p, q) { return types[q] - types[p]; })[0];
    var off = ps.length;
    var cells = [];
    cells.push(['Homes listed', h.length ? String(h.length) : 'None now']);
    cells.push(['Off-plan projects', off ? String(off) : 'None now']);
    if (dom) cells.push(['Mostly', dom.charAt(0).toUpperCase() + dom.slice(1) + 's']);
    if (s.length) cells.push(['Buy from', AED(minBy(s))]); else if (r.length) cells.push(['Rent from', AED(minBy(r)) + '/yr']);
    else { var hp = ps.filter(function (p) { return p.handover; }).map(function (p) { return p.handover; }); if (hp.length) cells.push(['Handover', hp.join(', ')]); }
    return { html: cells.map(function (c) { return '<div><span>' + c[0] + '</span><b>' + esc(c[1]) + '</b></div>'; }).join(''), n: h.length ? h.length + (h.length === 1 ? ' home' : ' homes') : off + (off === 1 ? ' project' : ' projects') };
  }
  function wireAreas(city) {
    var list = A.AREAS.filter(function (a) { return a.city === city && !a.small; }), box = $('#ap'), dots = $('#ap-dots');
    box.innerHTML = list.map(function (a, i) {
      var st = areaStats(a);
      return '<div class="ap-p' + (i === 0 ? ' on' : '') + '" data-k="' + a.key + '"><img src="' + IMG(a.img) + '" alt="' + esc(a.alt) + '" loading="lazy">' + (a.render ? '<span class="tag-r">Developer render</span>' : '') +
        '<button type="button" class="ap-hit" aria-expanded="' + (i === 0) + '" aria-label="' + esc(a.n) + ', ' + st.n + '"></button>' +
        '<div class="ap-min" aria-hidden="true"><span class="ap-n">' + st.n + '</span><b>' + esc(a.n) + '</b></div>' +
        '<div class="ap-full"><h3>' + esc(a.n) + '<span class="ar" lang="ar" dir="rtl">' + a.ar + '</span></h3><p>' + esc(a.line) + '</p><div class="ap-stats">' + st.html + '</div>' +
        '<div class="ap-cta">' + (a.key === 'yas' ? '<a class="btn primary" href="#area">Explore Yas Island' + ico('arrow', 'go') + '</a>' : '<a class="btn primary" href="' + (city === 'Dubai' ? '#search/offplan' : '#search/' + (inArea(a.n).some(rent) ? 'rent' : 'sale')) + '" data-todo="Only Yas Island has an area page in this specimen; this button opens the ' + esc(a.n) + ' guide in the live site.">Explore ' + esc(a.n) + ico('arrow', 'go') + '</a>') +
        '<button type="button" class="btn ghost-l" data-wa="' + a.key + '">' + ico('wa') + 'Ask about ' + esc(a.n) + '</button></div></div></div>';
    }).join('');
    dots.innerHTML = list.map(function (a, i) { return '<button type="button" aria-label="' + esc(a.n) + '"' + (i === 0 ? ' aria-current="true"' : '') + '></button>'; }).join('');
    $$('.ap-p', box).forEach(function (p, i) { p.style.setProperty('--i', i); });
    if (!RM && 'IntersectionObserver' in window && !box.dataset.seen) {
      box.classList.add('pre');
      var aio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { box.classList.remove('pre'); box.dataset.seen = '1'; aio.disconnect(); } }, { threshold: .25 });
      aio.observe(box); cleanup.push(function () { aio.disconnect(); });
    }
    var panels = $$('.ap-p', box), t;
    function activate(p) {
      if (p.classList.contains('on')) return;
      panels.forEach(function (x) { var on = x === p; x.classList.toggle('on', on); $('.ap-hit', x).setAttribute('aria-expanded', on); });
      $$('button', dots).forEach(function (d, i) { if (panels[i] === p) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    panels.forEach(function (p, i) {
      var hit = $('.ap-hit', p);
      hit.addEventListener('click', function () { activate(p); var b = $('.ap-full .btn', p); if (b) setTimeout(function () { b.focus({ preventScroll: true }); }, 450); });
      hit.addEventListener('focus', function () { activate(p); });
      p.addEventListener('mouseenter', function () { if (mob()) return; clearTimeout(t); t = setTimeout(function () { activate(p); }, 120); });
      $$('button', dots)[i].addEventListener('click', function () { p.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); });
    });
    // Mobile: the card nearest the centre becomes active
    var raf;
    box.addEventListener('scroll', function () {
      if (!mob()) return; cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var c = box.getBoundingClientRect(), mid = c.left + c.width / 2, best = null, d = 1e9;
        panels.forEach(function (p) { var r = p.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < d) { d = dd; best = p; } });
        if (best) activate(best);
      });
    }, { passive: true });
  }

  var OPF = ['brabus', 'reportage', 'aquarise', 'venice'];
  function opfSheet(p) {
    var d = p.dev ? DEV(p.dev) : null, i = OPF.indexOf(p.key);
    return '<p class="opf-k">Featured project ' + (i + 1) + ' of ' + OPF.length + ' · ' + esc(p.city) + '</p><h3>' + esc(p.name) + '</h3><p class="opf-loc">' + ico('pin') + esc(p.loc) + (d ? ' · <img src="logo/' + d.key + '.png" alt="' + esc(d.name) + '">' : '') + '</p>' +
      '<dl class="opf-f"><div><dt>' + (p.price ? 'Listed from' : 'Price') + '</dt><dd>' + (p.price ? AED(p.price) : 'On request') + '</dd></div><div><dt>Handover</dt><dd>' + (p.handover || 'Ask us') + '</dd></div><div><dt>Payment plan</dt><dd>' + (p.plan ? esc(p.plan.overall) : 'Ask us') + '</dd></div></dl>' +
      (p.plan ? ppBar(p.plan) : '<p class="fine">The developer has not confirmed a payment plan in our listing yet.</p>') +
      '<div class="sel-act"><button type="button" class="btn primary" data-enquire="' + p.key + '">Payment plan &amp; brochure</button>' + (p.listing ? '<a class="btn ghost" href="#property/' + p.listing + '">View listing' + ico('arrow', 'go') + '</a>' : '') + '<button type="button" class="btn-c" data-wa="' + p.key + '">' + ico('wa') + 'WhatsApp</button></div>';
  }
  function opfHTML() {
    var ps = OPF.map(PROJ);
    return '<div class="opf" id="opf"><div class="opf-stage" id="opf-stage"><img src="' + IMG(ps[0].img) + '" alt="' + esc(alt(ps[0].img)) + '"><span class="tag-r">Developer render</span></div>' +
      '<div class="opf-sheet" id="opf-sheet" aria-live="polite">' + opfSheet(ps[0]) + '</div>' +
      '<div class="opf-list" role="group" aria-label="Featured projects">' + ps.map(function (p, i) { return '<button type="button" data-opf="' + p.key + '" aria-pressed="' + (i === 0) + '"><span class="n">0' + (i + 1) + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.loc) + '</small></span></button>'; }).join('') + '</div></div>';
  }
  function wireOpf() {
    var stg = $('#opf-stage'), sh = $('#opf-sheet');
    $$('[data-opf]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        var p = PROJ(b.dataset.opf);
        $$('[data-opf]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var old = $('img', stg), im = new Image(); im.src = IMG(p.img); im.alt = alt(p.img); stg.insertBefore(im, $('.tag-r', stg));
        sh.innerHTML = opfSheet(p);
        if (!G || RM) { old.remove(); return; }
        // Hide: the previous image stays under. Reveal: the new one wipes in. Move: it settles from 1.1x. React: the sheet lines rise.
        gsap.fromTo(im, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'expo.inOut', onComplete: function () { if (old.parentNode) old.remove(); } });
        gsap.fromTo(im, { scale: 1.1 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
        gsap.from(sh.children, { y: 16, opacity: 0, filter: 'blur(6px)', duration: .5, stagger: .05, ease: 'power2.out', delay: .25 });
      });
    });
  }
  function dvsStage(d) {
    var p = PROJ(d.projects[0]);
    var media = p.img ? '<img src="' + IMG(p.img) + '" alt="' + esc(alt(p.img)) + '"><span class="tag-r">Developer render</span>' :
      '<div class="dvs-noimg"><img src="logo/' + d.key + '.png" alt=""><p>' + esc(p.name) + ': the renders on file are not approved for use, so the project is shown by its numbers.</p></div>';
    return '<div class="dvs-media">' + media + '</div><div class="dvs-info"><img class="dvs-logo" src="logo/' + d.key + '.png" alt="' + esc(d.name) + '">' +
      '<p class="dvs-k">Featured project</p><h3>' + esc(p.name) + '</h3><p class="dvs-loc">' + ico('pin') + esc(p.loc) + '</p>' +
      '<dl class="dvs-f"><div><dt>Projects with us</dt><dd>' + d.projects.length + '</dd></div><div><dt>Handover</dt><dd>' + esc(p.handover || 'Ask us') + '</dd></div><div><dt>Payment plan</dt><dd>' + (p.plan ? esc(p.plan.overall) : 'Ask us') + '</dd></div><div><dt>Area</dt><dd>' + esc(p.area) + '</dd></div></dl>' +
      (p.plan ? ppBar(p.plan) : '') +
      '<div class="sel-act"><button type="button" class="btn primary" data-enquire="' + p.key + '">Payment plan &amp; brochure</button><button type="button" class="btn-c" data-wa="' + p.key + '">' + ico('wa') + 'WhatsApp</button></div></div>';
  }
  function wireDevs() {
    var box = $('#dvs'); if (!box) return;
    var ds = A.DEVS.filter(function (d) { return d.projects.length; });
    box.innerHTML = '<div class="dvs-pick" role="group" aria-label="Developers with projects">' + ds.map(function (d, i) { var p = PROJ(d.projects[0]); return '<button type="button" data-dv="' + d.key + '" aria-pressed="' + (i === 0) + '"><img src="logo/' + d.key + '.png" alt=""><span><b>' + esc(d.name) + '</b><small>' + d.projects.length + ' project · ' + esc(p.area) + '</small></span>' + ico('arrow') + '</button>'; }).join('') +
      '<p class="fine">Shown only where the developer–project link is verified. More are added as links are confirmed.</p></div><div class="dvs-stage" id="dvs-stage" aria-live="polite">' + dvsStage(ds[0]) + '</div>';
    $$('[data-dv]', box).forEach(function (b) {
      var go2 = function () {
        if (b.getAttribute('aria-pressed') === 'true') return;
        $$('[data-dv]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var st = $('#dvs-stage'); st.innerHTML = dvsStage(DEV(b.dataset.dv)); growBars(st); $$('.pp', st).forEach(function (p) { p.classList.remove('pre'); });
        if (!G || RM) return;
        // Hide: the previous developer. Reveal: the project image wipes in. React: the picked row turns crimson. Move: facts rise.
        gsap.fromTo($('.dvs-media', st), { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: .9, ease: 'expo.inOut' });
        gsap.fromTo($('.dvs-media img', st), { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'power3.out' });
        gsap.from($('.dvs-info', st).children, { y: 14, opacity: 0, duration: .45, stagger: .04, ease: 'power2.out', delay: .2 });
      };
      b.addEventListener('click', go2); b.addEventListener('mouseenter', function () { if (!mob()) go2(); });
    });
  }
  function wireOffplan() {
    wireOpf();
    var rail = $('#op-rail');
    $$('[data-oc]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-oc]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var c = b.dataset.oc;
        $$('.pj', rail).forEach(function (p) { p.hidden = !!c && p.dataset.city !== c; });
        rail.scrollLeft = 0; navState();
      });
    });
    var prev = $('#offplan .prev'), next = $('#offplan .next');
    function step(d) { var c = $('.pj:not([hidden])', rail); rail.scrollBy({ left: d * (c ? c.offsetWidth + 24 : 400), behavior: RM ? 'auto' : 'smooth' }); }
    function navState() { prev.disabled = rail.scrollLeft < 8; next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8; }
    prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
    rail.addEventListener('scroll', navState, { passive: true }); navState();
    // Payment bars grow when the rail enters view (Reveal)
    growBars(rail);
  }
  function growBars(root) {
    var bars = $$('.pp.pre', root); if (!bars.length) return;
    if (RM || !('IntersectionObserver' in window)) { bars.forEach(function (b) { b.classList.remove('pre'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }); }, { threshold: .4 });
    bars.forEach(function (b) { io.observe(b); }); cleanup.push(function () { io.disconnect(); });
  }

  function wireInvest() {
    var P = A.PROJECTS;
    var goals = [
      { k: 'plan', t: 'Pay as it is built', s: 'Off-plan with a stated payment plan', items: P.filter(function (p) { return p.plan; }), why: 'Booking deposits from 10% (Brabus Island) to 20% (Binghatti Aquarise). Handover from Q2 2027 to June 2029.' },
      { k: 'ready', t: 'Own it now', s: 'Completed homes for sale', items: L.filter(function (x) { return sale(x) && x.comp === 'ready'; }), why: 'Three ready homes for sale, from AED 699,000 in Al Reef Downtown to AED 3,800,000 in Madinat Al Riyad.' },
      { k: 'entry', t: 'Lower entry price', s: 'Homes for sale under AED 1.2M', items: L.filter(function (x) { return sale(x) && x.pr < 1.2e6; }), why: 'Both are apartments in Al Reef Downtown: AED 699,000 and AED 1,170,000.' },
      { k: 'space', t: 'Villas and townhouses', s: 'Homes with their own front door', items: L.filter(function (x) { return sale(x) && (x.type === 'villa' || x.type === 'townhouse'); }), why: 'One ready villa in Madinat Al Riyad and one off-plan townhouse in Khalifa City.' }
    ];
    var gEl = $('#inv-goals'), rEl = $('#inv-res');
    gEl.innerHTML = goals.map(function (g, i) { return '<button type="button" class="goal" data-k="' + g.k + '" aria-pressed="' + (i === 0) + '"><b>' + g.t + '</b><span>' + g.s + '</span><span class="n">' + g.items.length + '</span></button>'; }).join('');
    function show(g, anim) {
      $$('.goal', gEl).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === g.k); });
      var it = g.items.map(function (o) {
        if (o.key) return { href: o.listing ? '#property/' + o.listing : '#search/offplan', img: o.img, logo: !o.img && o.dev ? o.dev : null, a: o.img ? alt(o.img) : '', b: o.name, s: o.loc + ' · ' + (o.handover ? 'handover ' + o.handover : 'handover on request') + (o.plan ? ' · ' + o.plan.overall : ''), big: o.price ? 'From ' + AED(o.price) : o.name };
        return { href: '#property/' + o.id, img: o.img, a: o.alt, b: AED(o.pr), s: T(o) + ' · ' + o.area, big: AED(o.pr) };
      });
      var f = it.filter(function (x) { return x.img; })[0] || it[0];
      var bg = $('#inv-bg'); if (bg) { var nb = new Image(); nb.src = IMG(f.img); nb.alt = ''; bg.appendChild(nb); var olds = $$('img', bg).slice(0, -1); if (anim && G && !RM) gsap.fromTo(nb, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', onComplete: function () { olds.forEach(function (o) { o.remove(); }); } }); else olds.forEach(function (o) { o.remove(); }); }
      rEl.innerHTML = '<a class="inv-big" href="' + f.href + '"><img src="' + IMG(f.img) + '" alt="' + esc(f.a) + '"><span class="tx"><span>' + esc(g.t) + '</span><b>' + esc(f.big) + '</b><span>' + esc(f.s) + '</span></span></a>' +
        '<div class="inv-list">' + it.map(function (x) { return '<a class="inv-row" href="' + x.href + '">' + (x.img ? '<img src="' + IMG(x.img) + '" alt="" loading="lazy">' : '<span class="ni">' + (x.logo ? '<img src="logo/' + x.logo + '.png" alt="">' : '') + '</span>') + '<span><b>' + esc(x.b) + '</b><span>' + esc(x.s) + '</span></span></a>'; }).join('') +
        '<div style="display:grid;gap:8px;margin-top:16px"><button type="button" class="btn primary" data-wa="' + esc('investment shortlist: ' + g.t) + '">' + ico('wa') + 'Get an investment shortlist</button><button type="button" class="btn ghost" data-call="general">' + ico('call') + 'Call an adviser</button></div></div>' +
        '<p class="inv-why"><span><b>What the data shows:</b> ' + esc(g.why) + '</span><span>Rental yields and price history need sourced market data; an adviser walks you through them.</span></p>';
      if (anim && G && !RM) { gsap.fromTo($('.inv-big img', rEl), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .9, ease: 'expo.out' }); gsap.from($$('.inv-row', rEl), { x: 16, opacity: 0, duration: .45, stagger: .05, ease: 'power2.out' }); }
    }
    $$('.goal', gEl).forEach(function (b) { b.addEventListener('click', function () { show(goals.filter(function (g) { return g.k === b.dataset.k; })[0], true); }); });
    show(goals[0]);
  }

  /* Hero, re-expressed from 11 Tanjung's observed sequence (plate loader -> line -> reveal -> type -> search):
     Hide: the white plate with a real load counter. Reveal: the photo, opened outward from a crimson redline.
     React: headline words rise out of their masks (50 ms stagger), then the search settles from blur.
     Move: the photo settles from 1.12x scale. Once per session; any input skips it. */
  function heroMotion() {
    var media = $('#hero-media'), img = $('img', media), plate = $('#plate'), n = $('#plate-n');
    var ws = $$('.hero h1 .w > span'), sub = $('.hero-sub'), qs = $('#qs'), anchor = $('#hero-anchor');
    var skip = RM || !G || (sess.get('aa2-intro') && !window.__replay);
    window.__replay = false;
    if (skip) { plate.style.display = 'none'; return; }
    sess.set('aa2-intro', '1');
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onComplete: done });
    gsap.set(hdr, { autoAlpha: 0, y: -16 }); gsap.set(ws, { yPercent: 110 }); gsap.set([sub, anchor], { autoAlpha: 0 });
    gsap.set(qs, { autoAlpha: 0, y: 40, filter: 'blur(12px)' }); gsap.set(img, { scale: 1.12 });
    gsap.set('.plate-logo', { autoAlpha: 0, yPercent: 25 });
    var ease = 'cubic-bezier(.5,0,0,1)';
    tl.to('.plate-logo', { autoAlpha: 1, yPercent: 0, duration: .5 }, 0)
      .to('.plate-line', { scaleX: 1, duration: .6, ease: 'power2.inOut' }, .35)
      .to(['.plate-logo', '.plate-n', '.plate-r'], { autoAlpha: 0, duration: .25, ease: 'power1.in' }, .8)
      .to('.plate-h.t', { yPercent: -100, duration: 1.1, ease: ease }, .95)
      .to('.plate-h.b', { yPercent: 100, duration: 1.1, ease: ease }, .95)
      .to('.plate-line', { autoAlpha: 0, duration: .4 }, 1.15)
      .to(img, { scale: 1, duration: 2.2, ease: 'power2.out' }, .95)
      .to(ws, { yPercent: 0, duration: 1, stagger: .05, ease: 'expo.out' }, 1.55)
      .to(sub, { autoAlpha: 1, duration: .6 }, 1.95)
      .to(qs, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: .8 }, 2.05)
      .from($$('.qs-tab, .fld, .qs-go', qs), { autoAlpha: 0, y: 8, duration: .35, stagger: .04 }, 2.25)
      .to(hdr, { autoAlpha: 1, y: 0, duration: .5 }, 2.2)
      .to(anchor, { autoAlpha: 1, duration: .5 }, 2.5);
    // Real progress: the hero photo and the fonts. Minimum 600 ms so the counter is legible.
    var t0 = performance.now(), shown = 0, target = 12, raf;
    var tick = function () { shown += (target - shown) * .18; n.textContent = Math.round(shown); if (target >= 100 && shown > 99.4) { n.textContent = 100; setTimeout(function () { tl.play(); }, Math.max(0, 600 - (performance.now() - t0))); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    var parts = [img.decode ? img.decode().catch(function () {}) : Promise.resolve(), document.fonts ? document.fonts.ready : Promise.resolve()], got = 0;
    parts.forEach(function (pr) { pr.then(function () { got++; target = got === parts.length ? 100 : 60; }); });
    var skipFn = function () { cancelAnimationFrame(raf); tl.progress(1); };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, skipFn, { once: true, passive: true }); });
    cleanup.push(function () { cancelAnimationFrame(raf); tl.kill(); ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, skipFn); }); gsap.set(hdr, { clearProps: 'all' }); });
    function done() { plate.style.display = 'none'; gsap.set([hdr, qs], { clearProps: 'opacity,visibility,transform,filter' }); }
  }
  /* Scroll: the hero image compresses into a frame as the page moves on (architecture moves slowly) */
  function homeScroll() {
    if (!G || RM || mob()) return;
    // The next section slides over the pinned hero (CSS sticky); the hero recedes under it.
    var st = gsap.timeline({ scrollTrigger: { trigger: '.cover', start: 'top bottom', end: 'top top', scrub: .5 } });
    st.to('#hero-media img', { scale: 1.06, ease: 'none' }, 0).to('#hero-shade', { opacity: .7, ease: 'none' }, 0).to('.hero-copy, #qs, .hero-anchor', { y: -40, ease: 'none' }, 0);
  }
  function homeReveals() {
    homeScroll();
    if (!G || RM) return;
    $$('.sec-head .eyebrow, .sec-head .lede', main).forEach(function (h) {
      gsap.from(h, { y: 18, opacity: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    gsap.from('.tile', { y: 40, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.disc', start: 'top 85%', once: true } });
  }

  /* ============================================================
     SEARCH / RESULTS (Functional: native scroll, CSS-speed feedback)
     ============================================================ */
  var sQ = { pur: 'sale', locs: [], types: [], beds: '', price: '', comp: '', sort: 'new', sl: false };
  var sView = 'split', sMob = 'list', sSel = null, pendingQ = null;
  function goSearch(q) { pendingQ = JSON.parse(JSON.stringify(q)); go('search/' + q.pur); }
  var TYPES = [['apartment', 'Apartments'], ['villa', 'Villas'], ['townhouse', 'Townhouses']];
  function sMatch(x, q, skip) {
    if (q.pur === 'offplan' ? x.comp !== 'offplan' : x.pur !== q.pur) return false;
    if (skip !== 'locs' && q.locs.length && q.locs.indexOf(x.area) < 0) return false;
    if (skip !== 'types' && q.types.length && q.types.indexOf(x.type) < 0) return false;
    if (skip !== 'beds' && q.beds && x.b < Number(q.beds)) return false;
    if (skip !== 'price' && q.price) { var r = q.price.split('-'); if (r[0] && x.pr < Number(r[0])) return false; if (r[1] && x.pr > Number(r[1])) return false; }
    if (skip !== 'comp' && q.comp && x.comp !== q.comp) return false;
    if (q.sl && !isSL(x.id)) return false;
    return true;
  }
  function results() {
    var r = L.filter(function (x) { return sMatch(x, sQ); });
    var s = { new: function (a, b) { return b.id - a.id; }, lo: function (a, b) { return a.pr - b.pr; }, hi: function (a, b) { return b.pr - a.pr; }, size: function (a, b) { return (b.s || 0) - (a.s || 0); } }[sQ.sort];
    return r.sort(s);
  }
  function dubaiProjects() { return sQ.pur === 'offplan' && (!sQ.locs.length) && !sQ.types.length && !sQ.beds && !sQ.price ? A.PROJECTS.filter(function (p) { return p.city === 'Dubai'; }) : []; }
  var PURN = { sale: 'for sale', rent: 'for rent', offplan: 'off-plan' };
  function renderSearch(arg) {
    if (pendingQ) { sQ = pendingQ; pendingQ = null; }
    else if (arg) { var a = arg.split('/'); if (PURN[a[0]]) { sQ = { pur: a[0], locs: [], types: a[1] ? [a[1]] : [], beds: '', price: '', comp: '', sort: 'new', sl: false }; } }
    main.innerHTML = '<div class="wrap s-head"><ol class="crumbs"><li><a href="#home">Home</a></li><li><a href="#search/' + sQ.pur + '">' + { sale: 'Buy', rent: 'Rent', offplan: 'Off-Plan' }[sQ.pur] + '</a></li><li aria-current="page">Abu Dhabi</li></ol>' +
      '<div class="s-title"><div><h1 id="s-h1"></h1><p class="s-count" id="s-count" aria-live="polite"></p></div><div class="seg" role="group" aria-label="Purpose">' + [['sale', 'Buy'], ['rent', 'Rent'], ['offplan', 'Off-Plan']].map(function (p) { return '<button type="button" data-p="' + p[0] + '" aria-pressed="' + (sQ.pur === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="fbar" id="fbar"><div class="wrap fbar-in"><button type="button" class="btn sm ghost" id="f-all">' + ico('filter') + 'Filters <span id="f-n"></span></button>' +
      ['locs', 'types', 'beds', 'price'].map(function (k) { return '<div class="fb" data-k="' + k + '"><button type="button" aria-expanded="false" aria-controls="pop-' + k + '"><span></span>' + ico('chev') + '</button><div class="fb-pop" id="pop-' + k + '" hidden></div></div>'; }).join('') +
      (sQ.pur === 'sale' ? '<div class="seg sm" id="f-comp" role="group" aria-label="Completion">' + [['', 'Any'], ['ready', 'Ready'], ['offplan', 'Off-plan']].map(function (c) { return '<button type="button" data-c="' + c[0] + '" aria-pressed="' + (sQ.comp === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div>' : '') +
      '<button type="button" class="pill" id="f-sl" aria-pressed="' + sQ.sl + '">' + ico('heart') + ' Shortlist</button>' +
      '<span class="fbar-sp"></span><label class="sort"><span class="vh">Sort by</span><select id="f-sort"><option value="new">Newest</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option><option value="size">Largest first</option></select></label>' +
      '<div class="seg" id="f-view" role="group" aria-label="Layout"><button type="button" data-v="list" aria-pressed="' + (sView === 'list') + '">' + ico('list') + 'List</button><button type="button" data-v="split" aria-pressed="' + (sView === 'split') + '">' + ico('map') + 'List and map</button></div>' +
      '<button type="button" class="btn sm ghost" id="f-save">Save search</button></div><div class="wrap chips-row" id="f-chips"></div></div>' +
      '<div class="wrap res mode-' + sMob + (sView === 'list' ? ' list-only' : '') + '" id="res"><div class="rlist" id="rlist"></div><div class="rmap"><div class="map" id="smap"></div></div></div>' +
      '<div class="mbar"><div class="seg" role="group" aria-label="Show results as"><button type="button" data-m="list" aria-pressed="' + (sMob === 'list') + '">' + ico('list') + 'List</button><button type="button" data-m="map" aria-pressed="' + (sMob === 'map') + '">' + ico('map') + 'Map</button></div></div><div id="cmp-tray-slot"></div>';
    footer();
    $('#f-sort').value = sQ.sort;
    wireSearch(); searchUpdate();
  }
  function fbLabel(k) {
    if (k === 'locs') return sQ.locs.length ? (sQ.locs.length === 1 ? sQ.locs[0] : sQ.locs.length + ' areas') : 'Location';
    if (k === 'types') return sQ.types.length ? sQ.types.map(function (t) { return TYPES.filter(function (x) { return x[0] === t; })[0][1]; }).join(', ') : 'Property type';
    if (k === 'beds') return sQ.beds ? sQ.beds + '+ bedrooms' : 'Bedrooms';
    if (k === 'price') return sQ.price ? PRICES[sQ.pur].filter(function (p) { return p[0] === sQ.price; })[0][1] : (sQ.pur === 'rent' ? 'Rent' : 'Price');
    if (k === 'comp') return sQ.comp ? (sQ.comp === 'ready' ? 'Ready' : 'Off-plan') : 'Completion';
  }
  function popHTML(k, hg) {
    hg = hg || 'h2';
    var base = function (f) { return L.filter(function (x) { return sMatch(x, sQ, k) && f(x); }).length; };
    var h = '';
    if (k === 'locs') { var areas = A.AREAS.filter(function (a) { return a.city === 'Abu Dhabi'; }); h = '<' + hg + '>Abu Dhabi areas</' + hg + '>' + areas.map(function (a) { var n = base(function (x) { return x.area === a.n; }); return '<label class="opt' + (n ? '' : ' zero') + '"><input type="checkbox" value="' + esc(a.n) + '"' + (sQ.locs.indexOf(a.n) > -1 ? ' checked' : '') + '>' + esc(a.n) + '<span class="c">' + n + '</span></label>'; }).join('') + '<label class="opt zero"><input type="checkbox" disabled>Saadiyat Island<span class="c">0</span></label>'; }
    if (k === 'types') h = '<' + hg + '>Property type</' + hg + '>' + TYPES.map(function (t) { var n = base(function (x) { return x.type === t[0]; }); return '<label class="opt' + (n ? '' : ' zero') + '"><input type="checkbox" value="' + t[0] + '"' + (sQ.types.indexOf(t[0]) > -1 ? ' checked' : '') + '>' + t[1] + '<span class="c">' + n + '</span></label>'; }).join('') + '<p class="fine">Penthouses: none listed now.</p>';
    if (k === 'beds') h = '<' + hg + '>Bedrooms, at least</' + hg + '><div class="pills">' + [['', 'Any'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+'], ['5', '5+']].map(function (b) { return '<button type="button" class="pill" data-v="' + b[0] + '" aria-pressed="' + (sQ.beds === b[0]) + '">' + b[1] + '</button>'; }).join('') + '</div>';
    if (k === 'price') h = '<' + hg + '>' + (sQ.pur === 'rent' ? 'Annual rent' : 'Price') + '</' + hg + '>' + PRICES[sQ.pur].map(function (p) { var n = p[0] ? base(function (x) { var r = p[0].split('-'); return (!r[0] || x.pr >= Number(r[0])) && (!r[1] || x.pr <= Number(r[1])); }) : base(function () { return true; }); return '<label class="opt' + (n ? '' : ' zero') + '"><input type="radio" name="pr" value="' + p[0] + '"' + (sQ.price === p[0] ? ' checked' : '') + '>' + p[1] + '<span class="c">' + n + '</span></label>'; }).join('');
    if (k === 'comp') h = '<' + hg + '>Completion</' + hg + '>' + [['', 'Any'], ['ready', 'Ready to move in'], ['offplan', 'Off-plan']].map(function (c) { var n = c[0] ? base(function (x) { return x.comp === c[0]; }) : base(function () { return true; }); return '<label class="opt"><input type="radio" name="cp" value="' + c[0] + '"' + (sQ.comp === c[0] ? ' checked' : '') + '>' + c[1] + '<span class="c">' + n + '</span></label>'; }).join('');
    return h + '<footer><button type="button" class="clear" data-reset="' + k + '">Reset</button><button type="button" class="btn sm" data-done>Show ' + results().length + '</button></footer>';
  }
  function readPop(k, pop) {
    if (k === 'locs' || k === 'types') sQ[k] = $$('input:checked', pop).map(function (i) { return i.value; });
    if (k === 'price') { var r = $('input:checked', pop); sQ.price = r ? r.value : ''; }
    if (k === 'comp') { var c = $('input:checked', pop); sQ.comp = c ? c.value : ''; }
  }
  var openPop = null;
  function closePop() { if (!openPop) return; var fb = openPop; openPop = null; $('.fb-pop', fb).hidden = true; $('button', fb).setAttribute('aria-expanded', 'false'); }
  function wireSearch() {
    $$('.s-title .seg button').forEach(function (b) { b.addEventListener('click', function () { go('search/' + b.dataset.p); }); });
    $$('.fb').forEach(function (fb) {
      var k = fb.dataset.k, btn = $('button', fb), pop = $('.fb-pop', fb);
      btn.addEventListener('click', function () {
        if (openPop === fb) { closePop(); return; }
        closePop(); openPop = fb; pop.innerHTML = popHTML(k); pop.hidden = false; btn.setAttribute('aria-expanded', 'true');
        var f = $('input, button', pop); if (f) f.focus();
      });
      pop.addEventListener('change', function () { readPop(k, pop); searchUpdate(true); var d = $('[data-done]', pop); if (d) d.textContent = 'Show ' + results().length; });
      pop.addEventListener('click', function (e) {
        var p = e.target.closest('.pill'); if (p) { sQ.beds = p.dataset.v; $$('.pill', pop).forEach(function (x) { x.setAttribute('aria-pressed', x === p); }); searchUpdate(true); $('[data-done]', pop).textContent = 'Show ' + results().length; }
        if (e.target.closest('[data-reset]')) { sQ[k] = (k === 'locs' || k === 'types') ? [] : ''; pop.innerHTML = popHTML(k); searchUpdate(true); }
        if (e.target.closest('[data-done]')) { closePop(); btn.focus(); }
      });
    });
    document.addEventListener('click', docClose); cleanup.push(function () { document.removeEventListener('click', docClose); });
    $('#f-sort').addEventListener('change', function (e) { sQ.sort = e.target.value; searchUpdate(); });
    $$('#f-comp button').forEach(function (b) { b.addEventListener('click', function () { sQ.comp = b.dataset.c; searchUpdate(); }); });
    $('#f-sl').addEventListener('click', function () { sQ.sl = !sQ.sl; this.setAttribute('aria-pressed', sQ.sl); searchUpdate(); });
    $$('#f-view button').forEach(function (b) { b.addEventListener('click', function () { sView = b.dataset.v; $$('#f-view button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); $('#res').classList.toggle('list-only', sView === 'list'); refitMaps(); }); });
    $$('.mbar button').forEach(function (b) { b.addEventListener('click', function () { sMob = b.dataset.m; $$('.mbar button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); var r = $('#res'); r.classList.remove('mode-list', 'mode-map'); r.classList.add('mode-' + sMob); refitMaps(); window.scrollTo(0, $('#res').offsetTop - 120); }); });
    $('#f-save').addEventListener('click', function () { toast('<b>Search saved.</b> Live: alerts by email or WhatsApp when a new home matches (needs an account or a contact opt-in).'); });
    $('#f-all').addEventListener('click', function () { openSheet(false); });
    $('#rlist').addEventListener('change', function (e) {
      var c = e.target.closest('[data-cmp]'); if (!c) return;
      var id = Number(c.dataset.cmp), i = compare.indexOf(id);
      if (c.checked && i < 0) { if (compare.length >= 3) { c.checked = false; toast('Compare up to three homes at a time.'); return; } compare.push(id); }
      if (!c.checked && i > -1) compare.splice(i, 1);
      tray();
    });
  }
  function docClose(e) { if (openPop && !openPop.contains(e.target)) closePop(); }
  function chipsHTML() {
    var c = [];
    sQ.locs.forEach(function (l) { c.push(['locs', l, l]); });
    sQ.types.forEach(function (t) { c.push(['types', t, TYPES.filter(function (x) { return x[0] === t; })[0][1]]); });
    if (sQ.beds) c.push(['beds', '', sQ.beds + '+ bedrooms']);
    if (sQ.price) c.push(['price', '', fbLabel('price')]);
    if (sQ.comp) c.push(['comp', '', fbLabel('comp')]);
    if (sQ.sl) c.push(['sl', '', 'Shortlisted']);
    return c.map(function (x) { return '<button type="button" class="chip-x" data-k="' + x[0] + '" data-v="' + esc(x[1]) + '">' + esc(x[2]) + ico('close') + '<span class="vh"> remove filter</span></button>'; }).join('') + (c.length ? '<button type="button" class="clear" id="f-clear">Clear all</button>' : '');
  }
  function searchUpdate(fromPop) {
    var r = results(), du = dubaiProjects();
    var n = r.length + du.length;
    $('#s-h1').textContent = sQ.pur === 'offplan' ? 'Off-plan projects and homes' : (sQ.types.length === 1 ? fbLabel('types') : 'Homes') + ' ' + PURN[sQ.pur] + ' in Abu Dhabi';
    $('#s-count').innerHTML = '<b>' + n + '</b> ' + (sQ.pur === 'offplan' ? (n === 1 ? 'result' : 'results') : (n === 1 ? 'home' : 'homes')) + (sQ.pur === 'offplan' && du.length ? ' · ' + du.length + ' Dubai projects included' : '') + ' · positions shown by community';
    $$('#f-comp button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.c === sQ.comp); });
    $$('.fb').forEach(function (fb) { var k = fb.dataset.k, b = $('button', fb), on = k === 'locs' || k === 'types' ? sQ[k].length : sQ[k]; $('span', b).textContent = fbLabel(k); b.classList.toggle('on', !!on); });
    var fc = sQ.locs.length + sQ.types.length + (sQ.beds ? 1 : 0) + (sQ.price ? 1 : 0) + (sQ.comp ? 1 : 0); $('#f-n').textContent = fc ? '(' + fc + ')' : '';
    $('#f-chips').innerHTML = chipsHTML();
    $$('#f-chips .chip-x').forEach(function (c) { c.addEventListener('click', function () { var k = c.dataset.k; if (k === 'locs' || k === 'types') sQ[k] = sQ[k].filter(function (v) { return v !== c.dataset.v; }); else if (k === 'sl') { sQ.sl = false; $('#f-sl').setAttribute('aria-pressed', 'false'); } else sQ[k] = ''; searchUpdate(); }); });
    var cl = $('#f-clear'); if (cl) cl.addEventListener('click', function () { sQ.locs = []; sQ.types = []; sQ.beds = ''; sQ.price = ''; sQ.comp = ''; sQ.sl = false; $('#f-sl').setAttribute('aria-pressed', 'false'); searchUpdate(); });
    var list = $('#rlist');
    if (!n) list.innerHTML = emptyHTML();
    else {
      var items = r.map(function (x) { return card(x, { compare: true, cls: sSel === x.id ? 'sel' : '' }); }).concat(du.map(projCard));
      // Owner capture inside the results, after the fourth item (OIA puts it in a sidebar; here it sits in the reading path)
      items.splice(Math.min(4, items.length), 0, '<aside class="own dark"><p class="eyebrow">Owners</p><h3>Selling or letting in Abu Dhabi?</h3><p>Tell us about your property. An adviser comes back with a valuation conversation and a listing plan.</p><div class="sel-act"><button type="button" class="btn light" data-enquire="general">List your property</button><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'WhatsApp</button></div></aside>');
      list.innerHTML = '<h2 class="vh">Results</h2><div class="cards">' + items.join('') + '</div>' +
        '<div class="rmore"><span>Showing ' + n + ' of ' + n + '</span>' + (n > 24 ? '<button class="btn ghost">Show 24 more</button>' : '') + '</div>' + popular();
    }
    growBars(list);
    $$('.empty [data-relax]', list).forEach(function (b) { b.addEventListener('click', function () { var k = b.dataset.relax; sQ[k] = (k === 'locs' || k === 'types') ? [] : ''; if (k === 'sl') sQ.sl = false; searchUpdate(); }); });
    var al = $('.empty [data-alert]', list); if (al) al.addEventListener('click', function () { toast('<b>Alert set.</b> Live: we message you when a home matches this search.'); });
    drawSearchMap(r);
    wireCardMapSync(list);
    tray();
  }
  function popular() {
    var q = function (label, href, n2) { return n2 ? '<li><a href="' + href + '">' + label + ' <span class="c">' + n2 + '</span></a></li>' : ''; };
    return '<nav class="pop-s" aria-label="Popular searches"><h3>Popular searches</h3><ul>' +
      q('Villas for rent in Abu Dhabi', '#search/rent/villa', cnt(function (x) { return rent(x) && x.type === 'villa'; })) +
      q('Apartments for rent in Abu Dhabi', '#search/rent/apartment', cnt(function (x) { return rent(x) && x.type === 'apartment'; })) +
      q('Apartments for sale in Abu Dhabi', '#search/sale/apartment', cnt(function (x) { return sale(x) && x.type === 'apartment'; })) +
      q('Off-plan with payment plans', '#search/offplan', A.PROJECTS.filter(function (p) { return p.plan; }).length) +
      q('Homes in Al Raha', '#search/rent', inArea('Al Raha').length) +
      q('Homes on Yas Island', '#area', inArea('Yas Island').length) + '</ul></nav>';
  }
  function emptyHTML() {
    var keys = [['locs', 'Location'], ['types', 'Property type'], ['beds', 'Bedrooms'], ['price', 'Price'], ['comp', 'Completion'], ['sl', 'Shortlist only']];
    var opts = keys.filter(function (k) { return k[0] === 'sl' ? sQ.sl : (k[0] === 'locs' || k[0] === 'types' ? sQ[k[0]].length : sQ[k[0]]); }).map(function (k) {
      var q = JSON.parse(JSON.stringify(sQ)); if (k[0] === 'locs' || k[0] === 'types') q[k[0]] = []; else if (k[0] === 'sl') q.sl = false; else q[k[0]] = '';
      var n = L.filter(function (x) { return sMatch(x, q); }).length; return [k, n];
    });
    return '<div class="empty"><h2>No homes match all of these filters</h2><p>Remove one filter to see more:</p><ul>' + opts.map(function (o) { return '<li><button type="button" data-relax="' + o[0][0] + '">Remove "' + o[0][1] + '"<span>' + o[1] + ' ' + (o[1] === 1 ? 'home' : 'homes') + '</span></button></li>'; }).join('') + '</ul>' +
      '<div class="cpair" style="width:100%"><button type="button" class="btn-c" data-alert>' + ico('check') + 'Alert me</button><button type="button" class="btn-c" data-wa="general">' + ico('wa') + 'Ask an adviser</button></div></div>';
  }
  function drawSearchMap(r) {
    var box = $('#smap'); if (!box) return;
    var byA = {}; r.forEach(function (x) { (byA[x.area] = byA[x.area] || []).push(x); });
    var pins = Object.keys(byA).map(function (a) { var h = byA[a]; return { area: a, text: h.length > 1 ? h.length + ' homes' : pinTxt(h[0]), aria: a + ': ' + (h.length > 1 ? h.length + ' homes' : T(h[0]) + ', ' + AED(h[0].pr)), on: sSel && h.some(function (x) { return x.id === sSel; }) }; });
    var mapEl = document.createElement('div'); mapEl.className = 'map-gl'; mapEl.setAttribute('role', 'region'); mapEl.setAttribute('aria-label', 'Map of Abu Dhabi with ' + r.length + ' homes by community');
    box.innerHTML = ''; box.appendChild(mapEl);
    var note = document.createElement('p'); note.className = 'map-note'; note.textContent = 'Homes are shown at their community: exact locations are shared when you book a viewing.' + (sQ.pur === 'offplan' ? ' Dubai projects are listed without a map.' : ''); box.appendChild(note);
    smapApi = AAMap.mount(mapEl, { pins: pins, cooperative: false,
      onPin: function (area, el) {
        var hs = byA[area]; sSel = hs[0].id;
        $$('#rlist .pc').forEach(function (c) { c.classList.toggle('sel', c.dataset.area === area); });
        var c = $('#rlist .pc.sel'); if (c && !mob()) c.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' });
        mapPop(box, el, hs);
      },
      onHover: function (area, v) { $$('#rlist .pc').forEach(function (c) { c.classList.toggle('hot', v && c.dataset.area === area); }); }
    });
  }
  var smapApi = null;
  function mapPop(box, g, hs) {
    var old = $('.map-pop', box); if (old) old.remove();
    var x = hs[0], r = g.getBoundingClientRect(), b = box.getBoundingClientRect();
    var d = document.createElement('div'); d.className = 'map-pop';
    d.innerHTML = '<img src="' + IMG(x.img) + '" alt=""><div><b>' + (hs.length > 1 ? hs.length + ' homes' : AED(x.pr)) + '</b><span>' + esc(hs.length > 1 ? x.area : T(x) + ', ' + x.area) + '</span><br><a href="' + (hs.length > 1 ? '#search/' + sQ.pur : '#property/' + x.id) + '"' + (hs.length > 1 ? ' data-filter-area="' + esc(x.area) + '"' : '') + '>' + (hs.length > 1 ? 'Show these homes' : 'View property') + '</a></div>';
    var left = Math.min(Math.max(8, r.left - b.left - 140), b.width - 290), top = r.top - b.top + 26;
    if (top > b.height - 110) top = r.top - b.top - 110;
    d.style.left = left + 'px'; d.style.top = top + 'px';
    box.appendChild(d);
    var f = $('[data-filter-area]', d); if (f) f.addEventListener('click', function (e) { e.preventDefault(); sQ.locs = [f.dataset.filterArea]; searchUpdate(); });
    if (G && !RM) gsap.from(d, { y: 8, opacity: 0, duration: .25, ease: 'power2.out' });
  }
  function wireCardMapSync(list) {
    var box = $('#smap');
    $$('.pc', list).forEach(function (c) {
      var on = function (v) { if (smapApi) smapApi.hot(c.dataset.area, v); };
      c.addEventListener('mouseenter', function () { on(true); }); c.addEventListener('mouseleave', function () { on(false); });
      c.addEventListener('focusin', function () { on(true); }); c.addEventListener('focusout', function () { on(false); });
    });
  }
  function tray() {
    var slot = $('#cmp-tray-slot'); if (!slot) return;
    if (!compare.length) { slot.innerHTML = ''; return; }
    slot.innerHTML = '<div class="cmp-tray" role="region" aria-label="Compare"><div class="th">' + compare.map(function (id) { return '<img src="' + IMG(byId(id).img) + '" alt="">'; }).join('') + '</div><span>' + compare.length + ' of 3 selected</span><button type="button" class="btn sm light" id="cmp-go"' + (compare.length < 2 ? ' disabled' : '') + '>' + ico('compare') + 'Compare</button><button type="button" class="clear" style="color:#fff" id="cmp-clr">Clear</button></div>';
    $('#cmp-go').addEventListener('click', openCompare);
    $('#cmp-clr').addEventListener('click', function () { compare = []; $$('[data-cmp]').forEach(function (c) { c.checked = false; }); tray(); });
  }
  function openCompare() {
    var xs = compare.map(byId), d = $('#cmp');
    var ppsf = function (x) { return x.pur === 'sale' && x.s ? Math.round(x.pr / x.s) : null; };
    var rows = [
      ['Price', function (x) { return '<b>' + AED(x.pr) + '</b>' + (x.pur === 'rent' ? ' a year' : ''); }, 'pr', 'min'],
      ['Price per sq ft', function (x) { var p = ppsf(x); return p ? 'AED ' + fmt(p) : (x.pur === 'rent' ? 'Rent: not applicable' : 'Size not listed'); }, ppsf, 'min'],
      ['Bedrooms', function (x) { return x.b; }, 'b', 'max'], ['Bathrooms', function (x) { return x.ba; }, 'ba', 'max'],
      ['Built-up area', function (x) { return x.s ? fmt(x.s) + ' sq ft' : 'Not listed'; }, 's', 'max'],
      ['Type', function (x) { return x.type.charAt(0).toUpperCase() + x.type.slice(1); }], ['Location', function (x) { return x.area; }],
      ['Status', function (x) { return x.comp === 'offplan' ? 'Off-plan' + (x.handover ? ', handover ' + x.handover : '') : 'Ready'; }],
      ['Payment plan', function (x) { return x.plan ? x.plan.overall + ' (' + x.plan.booking + '% on booking)' : (x.comp === 'offplan' ? 'Ask us' : 'Not applicable'); }],
      ['Reference', function (x) { return x.ref; }]
    ];
    var best = function (key, dir) {
      if (!key) return null; var vals = xs.map(function (x) { return typeof key === 'function' ? key(x) : x[key]; }).filter(function (v) { return v != null && v !== 0; });
      if (vals.length < 2) return null; return dir === 'min' ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
    };
    d.innerHTML = '<div class="d-hd"><h2 id="cmp-h">Compare ' + xs.length + ' homes</h2><button type="button" class="d-x" data-close>' + ico('close') + '<span class="vh">Close</span></button></div><div class="cmp-tb"><table><thead><tr><th scope="col"><span class="vh">Field</span></th>' + xs.map(function (x) { return '<td><img src="' + IMG(x.img) + '" alt=""><b style="font:700 18px/1.2 var(--ft)">' + esc(T(x)) + '</b><br><a href="#property/' + x.id + '" data-close>View property</a></td>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { var bv = best(r[2], r[3]); return '<tr><th scope="row">' + r[0] + '</th>' + xs.map(function (x) { var v = r[2] ? (typeof r[2] === 'function' ? r[2](x) : x[r[2]]) : null; return '<td' + (bv != null && v === bv ? ' class="best"' : '') + '>' + r[1](x) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '<tr><th scope="row">Contact</th>' + xs.map(function (x) { return '<td><div class="cpair"><button type="button" class="btn-c" data-wa="' + x.id + '">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="' + x.id + '">' + ico('call') + 'Call</button></div></td>'; }).join('') + '</tr></tbody></table><p class="fine">Highlighted: the lowest price, lowest price per sq ft and the most space among these homes.</p></div>';
    d.showModal();
  }
  /* Mobile filter sheet (also used from the homepage "Filters" button) */
  function openSheet(fromHomeFlag) {
    var d = $('#fsheet');
    var draw = function () {
      var n = L.filter(function (x) { return sMatch(x, sQ); }).length + (fromHomeFlag || route.page !== 'search' ? 0 : dubaiProjects().length);
      d.innerHTML = '<div class="d-hd"><h2 id="fsheet-h">Filters</h2><button type="button" class="d-x" data-close>' + ico('close') + '<span class="vh">Close filters</span></button></div><div class="d-bd">' +
        '<div><h3>Looking to</h3><div class="pills">' + [['sale', 'Buy'], ['rent', 'Rent'], ['offplan', 'Off-Plan']].map(function (p) { return '<button type="button" class="pill" data-pur="' + p[0] + '" aria-pressed="' + (sQ.pur === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
        '<div class="sh-sec" data-k="locs">' + popHTML('locs', 'h3').replace(/<footer>[\s\S]*<\/footer>/, '') + '</div><div class="sh-sec" data-k="types">' + popHTML('types', 'h3').replace(/<footer>[\s\S]*<\/footer>/, '') + '</div>' +
        '<div class="sh-sec" data-k="beds">' + popHTML('beds', 'h3').replace(/<footer>[\s\S]*<\/footer>/, '') + '</div><div class="sh-sec" data-k="price">' + popHTML('price', 'h3').replace(/<footer>[\s\S]*<\/footer>/, '') + '</div>' +
        (sQ.pur === 'sale' ? '<div><h3>Completion</h3><div class="pills">' + [['', 'Any'], ['ready', 'Ready'], ['offplan', 'Off-plan']].map(function (c) { return '<button type="button" class="pill" data-comp="' + c[0] + '" aria-pressed="' + (sQ.comp === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div></div>' : '') +
        '<div><h3>Sort</h3><div class="pills">' + [['new', 'Newest'], ['lo', 'Lowest price'], ['hi', 'Highest price'], ['size', 'Largest']].map(function (s) { return '<button type="button" class="pill" data-sort="' + s[0] + '" aria-pressed="' + (sQ.sort === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div></div></div>' +
        '<div class="d-ft"><button type="button" class="btn ghost" id="sh-clear">Clear</button><button type="button" class="btn primary" id="sh-go">Show ' + n + (n === 1 ? ' home' : ' homes') + '</button></div>';
    };
    draw(); if (!d.open) d.showModal();
    d.onchange = function (e) { var s = e.target.closest('.sh-sec'); if (s) { readPop(s.dataset.k, s); var y = $('.d-bd', d).scrollTop; draw(); $('.d-bd', d).scrollTop = y; } };
    d.onclick = function (e) {
      var t = e.target, y = $('.d-bd', d) ? $('.d-bd', d).scrollTop : 0;
      if (t.closest('[data-pur]')) { sQ.pur = t.closest('[data-pur]').dataset.pur; sQ.price = ''; if (sQ.pur !== 'sale') sQ.comp = ''; draw(); }
      else if (t.closest('[data-comp]')) { sQ.comp = t.closest('[data-comp]').dataset.comp; draw(); }
      else if (t.closest('.sh-sec[data-k="beds"] .pill')) { sQ.beds = t.closest('.pill').dataset.v; draw(); }
      else if (t.closest('[data-sort]')) { sQ.sort = t.closest('[data-sort]').dataset.sort; draw(); }
      else if (t.closest('#sh-clear')) { sQ.locs = []; sQ.types = []; sQ.beds = ''; sQ.price = ''; sQ.comp = ''; draw(); }
      else if (t.closest('#sh-go')) { d.close(); goSearch(sQ); return; }
      else return;
      var b = $('.d-bd', d); if (b) b.scrollTop = y;
    };
  }

  /* ============================================================
     PROPERTY DETAIL (Editorial)
     ============================================================ */
  function renderProperty(id) {
    var x = byId(id) || byId(31521); propId = x.id;
    var g = x.galleryTagged ? x.galleryTagged.map(function (t) { return { n: t[0], room: t[1], alt: t[2] }; }) : gal(x).map(function (n) { return { n: n, room: null, alt: alt(n, x) }; });
    var off = x.comp === 'offplan', rent2 = x.pur === 'rent';
    var portrait = function (n) { return /^reem-(bath|hall|kitchen-2|kitchen-3)$/.test(n); };
    var tiles = g.slice(0, 5), nT = tiles.length;
    var proj = A.PROJECTS.filter(function (p) { return p.listing === x.id; })[0];
    var am = A.amenities(x.feat, x.drop);
    var dropped = (x.drop || []).filter(function (d) { return x.feat.some(function (f) { return f.toLowerCase().replace(/ /g, '-') === d.toLowerCase().replace(/ /g, '-'); }); });
    var rooms = {}; g.forEach(function (t) { if (t.room) rooms[t.room] = (rooms[t.room] || 0) + 1; });
    var ppsf = !rent2 && x.s ? Math.round(x.pr / x.s) : null;
    var kf = [
      [rent2 ? 'Annual rent' : 'Price', AED(x.pr), null, 'tx'],
      ['Reference', x.ref + (x.refState === 'assigned' ? '' : ''), null, 'tx'],
      ['Bedrooms', x.b || 'Studio', 'bed'], ['Bathrooms', x.ba, 'bath'],
      x.s ? ['Built-up area', fmt(x.s) + '<small>sq ft</small>', 'area'] : null,
      x.plot ? ['Plot area', fmt(x.plot) + '<small>sq ft</small>', 'plan'] : null,
      ['Property type', x.type.charAt(0).toUpperCase() + x.type.slice(1), null, 'tx'],
      x.furnishing ? ['Furnishing', x.furnishing, null, 'tx'] : null,
      ['Status', off ? 'Off-plan' : 'Ready', null, 'tx'],
      ppsf ? ['Price per sq ft', 'AED ' + fmt(ppsf), null, 'tx'] : null
    ].filter(Boolean);
    var showPermit = permitMode === 'ph';
    var waBtn = '<button type="button" class="btn-c" data-wa="' + x.id + '">' + ico('wa') + 'WhatsApp</button>', callBtn = '<button type="button" class="btn-c" data-call="' + x.id + '">' + ico('call') + 'Call</button>';

    main.innerHTML = '<div class="wrap pd-top"><ol class="crumbs"><li><a href="#home">Home</a></li><li><a href="#search/' + (off ? 'offplan' : x.pur) + '">' + (off ? 'Off-Plan' : rent2 ? 'Rent' : 'Buy') + '</a></li><li><a href="#search/' + (off ? 'offplan' : x.pur) + '">' + esc(x.area) + '</a></li><li aria-current="page">' + esc(T(x)) + '</li></ol>' +
      '<div class="pd-gal n' + Math.min(nT, 5) + '" id="pd-gal">' + tiles.map(function (t, i) { return '<button type="button" class="g g' + i + (portrait(t.n) ? ' contain' : '') + '" data-i="' + i + '" aria-label="Open photo ' + (i + 1) + ' of ' + g.length + (t.room ? ', ' + t.room : '') + '"><img src="' + IMG(t.n) + '" alt="' + esc(t.alt) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' + (i === 0 && x.render ? '<span class="g-tag">Developer render</span>' : '') + '</button>'; }).join('') +
      '<div class="pd-gal-act"><button type="button" class="btn sm" data-lb="0">' + ico('grid') + 'All ' + g.length + ' photos</button>' + (rooms && Object.keys(rooms).length ? '' : '') + '</div></div>' +
      (Object.keys(rooms).length ? '<div class="pd-rooms" aria-label="Photos by room">' + Object.keys(rooms).map(function (r) { return '<button type="button" data-room="' + r + '">' + r + '<span>' + rooms[r] + '</span></button>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="wrap pd-main"><div>' +
      '<div class="pd-hd"><div class="tags"><span class="badge' + (off ? ' off' : '') + '">' + PURL(x) + '</span>' + (off && x.handover ? '<span class="badge">Handover ' + x.handover + '</span>' : '') + (showPermit ? '<span class="badge ok">' + ico('shield') + 'Madhmoun permit</span>' : '') + '</div>' +
      '<h1>' + esc(T(x)) + (rent2 ? ' for rent' : ' for sale') + '</h1><p class="loc">' + ico('pin') + esc(x.addr) + (x.addr.indexOf(x.area) > -1 ? '' : ' · ' + esc(x.area)) + ', ' + esc(x.city) + '</p></div>' +
      '<dl class="kf">' + kf.map(function (f) { return '<div><dt>' + (f[2] ? ico(f[2]) : '') + f[0] + '</dt><dd' + (f[3] ? ' class="' + f[3] + '"' : '') + '>' + f[1] + '</dd></div>'; }).join('') + '</dl>' +
      (off ? opeHTML(x) : '') +
      (showPermit ? '<div class="permit"><span class="ph">Design placeholder · no verified permit in the staging data</span><span class="ic">' + ico('shield') + '</span><div><b>Madhmoun permit</b><span class="num">0000000000</span><p>Advertising permit for this listing. Shown only when verified and approved for display.</p></div><span class="permit-qr" aria-hidden="true"></span></div>' : '') +
      '<section class="pd-sec pd-desc" aria-labelledby="pd-d"><h2 id="pd-d">About this home</h2><div id="pd-dx">' + (DESC[x.id] || [x.alt]).slice(0, 2).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' + ((DESC[x.id] || []).length > 2 ? '<button type="button" class="more" id="pd-more" aria-expanded="false">Read more</button>' : '') +
      (x.textOnly && x.textOnly.rooms ? '<h3 style="margin-top:22px;font-size:15px">Rooms, from the agent\'s description</h3><ul class="rooms-list">' + x.textOnly.rooms.split(' · ').map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' : '') + '</section>' +
      '<section class="pd-sec" aria-labelledby="pd-a"><h2 id="pd-a">Amenities and facilities</h2><div class="am">' +
      [['home', 'In the home'], ['building', 'Building and community'], ['general', 'Shared or private, to confirm']].filter(function (k) { return am[k[0]].length; }).map(function (k) { return '<div><h3>' + k[1] + ' <span class="n">' + am[k[0]].length + '</span></h3><ul>' + am[k[0]].map(function (a) { return '<li>' + ico('check') + esc(a) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</div>' +
      (!am.home.length && !am.building.length && !am.general.length ? '<p class="fine">No amenities are recorded for this listing yet. Ask us for the building facilities.</p>' : '') +
      (dropped.length ? '<p class="am-drop">Specimen note: ' + esc(dropped.join(' and ')) + ' removed in editorial review (legacy tags that do not fit this home). Amenities are not migrated until the map is approved.</p>' : '') + '</section>' +
      (x.pur === 'sale' && !off ? mortHTML(x) : '') +
      '<section class="pd-sec" aria-labelledby="pd-f"><h2 id="pd-f">Floor plan</h2><div class="fp-ask"><div><b>The floor plan is not published for this listing</b><p>We send it on request, with room sizes where the ' + (off ? 'developer' : 'owner') + ' provides them.</p></div><button type="button" class="btn" data-enquire="' + x.id + '" data-kind="plan">Request the floor plan</button></div></section>' +
      '<section class="pd-sec" aria-labelledby="pd-l"><h2 id="pd-l">Location</h2><div class="map loc-map" id="pd-map"></div><p class="loc-note">' + ico('pin') + '<span>' + esc(x.addr) + '. Shown at community level: the exact location is shared when you book a viewing.</span></p></section>' +
      (proj ? '<section class="pd-sec" aria-labelledby="pd-p"><h2 id="pd-p">The project</h2><div class="proj"><div class="ph"><img src="' + IMG(proj.imgs[1] || proj.img) + '" alt="' + esc(alt(proj.imgs[1] || proj.img)) + '" loading="lazy"><span class="tag-r">Developer render</span></div><div class="tx"><h3>' + esc(proj.name) + '</h3><p>' + esc(proj.loc) + '</p><p>' + (proj.handover ? 'Handover ' + proj.handover + '. ' : 'Handover not confirmed in our listing. ') + (proj.plan ? 'Payment plan ' + proj.plan.overall + '.' : 'Payment plan on request.') + '</p><p class="fine">Developer not yet linked: shown once confirmed.</p><button type="button" class="btn ghost sm" data-enquire="' + proj.key + '" style="justify-self:start">Brochure and unit availability</button></div></div></section>' : '') +
      '</div>' +
      '<aside class="rail-c" aria-label="Enquire"><div class="enq-card"><div class="pr"><span>' + (rent2 ? 'Annual rent' : off ? 'Price' : 'Asking price') + '</span><b>' + AED(x.pr) + '</b>' + (rent2 ? '<small>a year' + (x.textOnly && x.textOnly.cheques ? ', ' + x.textOnly.cheques : '') + '</small>' : ppsf ? '<small>AED ' + fmt(ppsf) + ' per sq ft</small>' : '') + '</div>' +
      (off && x.plan ? '<p class="per">' + x.plan.booking + '% on booking: about ' + AED(Math.round(x.pr * x.plan.booking / 100)) + '</p>' : '') +
      '<button type="button" class="btn primary block" data-enquire="' + x.id + '" data-kind="viewing">' + ico('cal') + (off ? 'Book a consultation' : 'Request a viewing') + '</button><div class="cpair">' + waBtn + callBtn + '</div>' +
      '<form class="enq-mini" id="enq-mini" novalidate><p>Or we call you</p><div class="inp"><label for="em-n">Name</label><input id="em-n" autocomplete="name"></div><div class="inp"><label for="em-p">Mobile number</label><input id="em-p" type="tel" autocomplete="tel" inputmode="tel"></div><button type="submit" class="btn ghost block">Request a call back</button></form>' +
      '<p class="ref"><span>Reference</span><b>' + x.ref + '</b></p></div>' +
      '<div class="office"><img src="logo/alaliah-crimson.png" alt=""><div><b>Al Aliah International</b><span>Adviser details on request</span></div></div></aside></div>' +
      '<section class="sec rel" aria-labelledby="pd-r"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Keep looking</p><h2 class="h2" id="pd-r">Similar homes</h2></div><a class="link-arrow" href="#search/' + (off ? 'offplan' : x.pur) + '">All ' + (rent2 ? 'rentals' : 'homes for sale') + ico('arrow') + '</a></div><div class="cards">' + related(x).map(function (y) { return card(y); }).join('') + '</div></div></section>' +
      '<div class="pbar-m"><p class="pr"><span>' + esc(x.ref) + '</span><span><b>' + AED(x.pr) + '</b>' + (rent2 ? ' a year' : '') + '</span></p>' + waBtn + callBtn + '<button type="button" class="btn primary" data-enquire="' + x.id + '" data-kind="viewing">Enquire</button></div>';
    footer();
    var pm = $('#pd-map'); pm.innerHTML = '<div class="map-gl" role="region" aria-label="Map: ' + esc(x.area) + ', Abu Dhabi"></div>';
    AAMap.mount($('.map-gl', pm), { focus: x.area, zoom: 13, cooperative: true, pins: [{ area: x.area, text: pinTxt(x), aria: T(x) + ', ' + x.area, on: true }] });
    wireMort();
    var emf = $('#enq-mini'); if (emf) emf.addEventListener('submit', function (e) { e.preventDefault(); toast('<b>Specimen:</b> nothing was sent. Live: an adviser calls about ' + x.ref + '.'); });
    var mr = $('#pd-more'); if (mr) mr.addEventListener('click', function () { var on = mr.getAttribute('aria-expanded') !== 'true'; mr.setAttribute('aria-expanded', on); mr.textContent = on ? 'Show less' : 'Read more'; $('#pd-dx').innerHTML = (on ? DESC[x.id] : DESC[x.id].slice(0, 2)).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''); });
    $$('#pd-gal .g').forEach(function (b) { b.addEventListener('click', function () { openLB(g, Number(b.dataset.i), null, b); }); });
    $$('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { openLB(g, 0, null); }); });
    $$('.pd-rooms button').forEach(function (b) { b.addEventListener('click', function () { openLB(g, 0, b.dataset.room); }); });
    growBars(main);
    // Opening: the first photo settles, facts follow (Reveal), then quiet
    if (G && !RM) {
      gsap.from('#pd-gal .g0 img', { scale: 1.12, duration: 1.4, ease: 'power3.out' });
      gsap.from('#pd-gal .g:not(.g0)', { clipPath: 'inset(0 0 100% 0)', duration: .9, stagger: .07, ease: 'expo.out', delay: .15 });
      gsap.from('.pd-hd > *, .kf > div', { y: 18, opacity: 0, duration: .55, stagger: .04, ease: 'power2.out', delay: .25 });
    }
  }
  /* Mortgage estimate. Minimum down payments: UAE Central Bank limits for a first home (nationals 15% up to AED 5M, 25% above;
     residents 20% up to AED 5M, 30% above). The rate is the visitor's own input; the prefilled figure is labelled as an example. */
  function mortHTML(x) {
    return '<section class="pd-sec" aria-labelledby="pd-mo"><h2 id="pd-mo">Estimate your mortgage</h2><div class="mort" id="mort" data-price="' + x.pr + '">' +
      '<div class="seg" role="group" aria-label="Buyer status"><button type="button" data-res="nat" aria-pressed="false">UAE national</button><button type="button" data-res="res" aria-pressed="true">UAE resident</button><button type="button" data-res="non" aria-pressed="false">Non-resident</button></div>' +
      '<div class="mort-g"><div class="mort-in"><div class="inp"><label for="mo-p">Property price (AED)</label><input id="mo-p" inputmode="numeric" value="' + fmt(x.pr) + '"></div>' +
      '<div class="inp"><label for="mo-d">Down payment (%)</label><input id="mo-d" type="number" min="0" max="100" step="1" value="20"><small id="mo-dn"></small></div>' +
      '<div class="inp"><label for="mo-r">Interest rate (% a year)</label><input id="mo-r" type="number" min="0" max="20" step="0.01" value="4.5"><small>Example rate, not a quote. Use your bank\'s figure.</small></div>' +
      '<div class="inp"><label for="mo-t">Term (years)</label><input id="mo-t" type="number" min="1" max="25" step="1" value="25"><small>UAE maximum: 25 years.</small></div></div>' +
      '<div class="mort-out" aria-live="polite"><p>Monthly payment</p><b id="mo-m"></b><dl><div><dt>Loan amount</dt><dd id="mo-l"></dd></div><div><dt>Down payment</dt><dd id="mo-dp"></dd></div></dl>' +
      '<button type="button" class="btn light block" data-wa="' + esc('mortgage advice for ' + x.ref) + '">' + ico('wa') + 'Get mortgage advice</button><p class="fine">Indicative only, before fees. Not a mortgage offer.</p></div></div></div></section>';
  }
  function wireMort() {
    var m = $('#mort'); if (!m) return;
    var res = 'res', num = function (id) { return Number(String($(id).value).replace(/[^0-9.]/g, '')) || 0; };
    var minDown = function (pr) { return res === 'nat' ? (pr > 5e6 ? 25 : 15) : res === 'res' ? (pr > 5e6 ? 30 : 20) : null; };
    function calc() {
      var pr = num('#mo-p'), md = minDown(pr), d = Math.max(num('#mo-d'), md || 0), r = num('#mo-r') / 1200, n = Math.min(25, Math.max(1, num('#mo-t'))) * 12, loan = pr * (1 - d / 100);
      var pay = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      $('#mo-dn').textContent = md != null ? 'Minimum for a first home: ' + md + '% (UAE Central Bank).' : 'Set by each bank for non-residents; ask us.';
      $('#mo-m').textContent = pr ? AED(Math.round(pay)) : '—'; $('#mo-l').textContent = AED(Math.round(loan)); $('#mo-dp').textContent = AED(Math.round(pr * d / 100)) + ' (' + d + '%)';
    }
    $$('[data-res]', m).forEach(function (b) { b.addEventListener('click', function () { res = b.dataset.res; $$('[data-res]', m).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); var md = minDown(num('#mo-p')); if (md != null) $('#mo-d').value = md; calc(); }); });
    $$('input', m).forEach(function (i) { i.addEventListener('input', calc); });
    $('#mo-d').addEventListener('change', function () { var md = minDown(num('#mo-p')); if (md != null && num('#mo-d') < md) $('#mo-d').value = md; calc(); });
    calc();
  }
  function related(x) {
    var same = L.filter(function (y) { return y.id !== x.id && y.pur === x.pur; });
    same.sort(function (a, b) { return (a.area === x.area ? -1 : 0) - (b.area === x.area ? -1 : 0) || Math.abs(a.pr - x.pr) - Math.abs(b.pr - x.pr); });
    return same.slice(0, 4);
  }
  function opeHTML(x) {
    if (!x.plan) return '<div class="ope"><div class="ope-top"><div><h2>Handover and payment plan</h2><p class="fine" style="margin-top:8px">Not confirmed in our listing yet. We send the developer\'s current plan and handover date on request.</p></div></div><div class="sel-act dark"><button type="button" class="btn light" data-enquire="' + x.id + '" data-kind="plan">Get the payment plan</button><button type="button" class="btn-c" data-wa="' + x.id + '">' + ico('wa') + 'WhatsApp</button></div></div>';
    var p = x.plan, amt = function (pc) { return AED(Math.round(x.pr * pc / 100)); };
    return '<div class="ope" aria-labelledby="ope-h"><div class="ope-top"><div><h2 id="ope-h">Off-plan essentials</h2><p class="fine" style="margin-top:8px">Payment plan ' + p.overall + ' · amounts are approximate, from the listed price.</p></div><div class="ho"><span>Handover</span><b>' + x.handover + '</b></div></div>' +
      '<div class="pp pre"><div class="pp-bar" role="img" aria-label="' + p.booking + '% on booking, ' + p.construction + '% during construction, ' + p.handover + '% on handover"><span class="s1" style="width:' + p.booking + '%"></span><span class="s2" style="width:' + p.construction + '%"></span><span class="s3" style="width:' + p.handover + '%"></span></div></div>' +
      '<dl class="ope-steps"><div><dt><i style="background:var(--crimson)"></i>Down payment, on booking</dt><dd>' + p.booking + '%<small>about ' + amt(p.booking) + '</small></dd></div><div><dt><i style="background:#fff"></i>During construction</dt><dd>' + p.construction + '%<small>about ' + amt(p.construction) + '</small></dd></div><div><dt><i style="background:var(--orange)"></i>On handover, ' + x.handover + '</dt><dd>' + p.handover + '%<small>about ' + amt(p.handover) + '</small></dd></div></dl>' +
      '<p class="fine">Instalment dates during construction come from the developer\'s schedule; we send it with the brochure.</p></div>';
  }
  /* Gallery: the clicked photo grows into the viewer (Move), the strip follows (Reveal) */
  function openLB(g, start, room, fromEl) {
    var d = $('#lb'), list = room ? g.filter(function (t) { return t.room === room; }) : g, i = room ? 0 : start;
    var rooms = []; g.forEach(function (t) { if (t.room && rooms.indexOf(t.room) < 0) rooms.push(t.room); });
    function draw(anim) {
      var t = list[i];
      d.innerHTML = '<div class="d-hd"><h2>' + (i + 1) + ' / ' + list.length + (t.room ? ' · ' + t.room : '') + '</h2>' + (rooms.length ? '<div class="lb-rooms">' + ['All'].concat(rooms).map(function (r) { return '<button type="button" data-r="' + r + '" aria-pressed="' + ((room || 'All') === r) + '">' + r + '</button>'; }).join('') + '</div>' : '') + '<button type="button" class="d-x" data-close>' + ico('close') + '<span class="vh">Close gallery</span></button></div>' +
        '<div class="lb-stage"><img src="' + IMG(t.n) + '" alt="' + esc(t.alt) + '"><button type="button" class="lb-nav prev" aria-label="Previous photo">' + ico('arrow') + '</button><button type="button" class="lb-nav next" aria-label="Next photo">' + ico('arrow') + '</button></div>' +
        '<div><p class="lb-cap"><span>' + esc(t.alt) + '</span><span>' + (byId(propId).render ? 'Developer render' : 'Listing photo') + '</span></p><div class="lb-strip">' + list.map(function (s, k) { return '<button type="button" data-k="' + k + '" aria-label="Photo ' + (k + 1) + '"' + (k === i ? ' aria-current="true"' : '') + '><img src="' + IMG(s.n) + '" alt=""></button>'; }).join('') + '</div></div>';
      $('.prev', d).addEventListener('click', function () { i = (i - 1 + list.length) % list.length; draw(); });
      $('.next', d).addEventListener('click', function () { i = (i + 1) % list.length; draw(); });
      $$('.lb-strip button', d).forEach(function (b) { b.addEventListener('click', function () { i = Number(b.dataset.k); draw(); }); });
      $$('.lb-rooms button', d).forEach(function (b) { b.addEventListener('click', function () { room = b.dataset.r === 'All' ? null : b.dataset.r; list = room ? g.filter(function (t2) { return t2.room === room; }) : g; i = 0; draw(true); }); });
      var cur = $('.lb-strip [aria-current]', d); if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
      if (anim && G && !RM) gsap.from($$('.lb-strip button', d), { y: 16, opacity: 0, duration: .4, stagger: .03, ease: 'power2.out' });
    }
    d.onkeydown = function (e) { if (e.key === 'ArrowRight') { i = (i + 1) % list.length; draw(); } if (e.key === 'ArrowLeft') { i = (i - 1 + list.length) % list.length; draw(); } };
    draw(true); d.showModal();
    if (fromEl && G && !RM) {
      var im = $('.lb-stage img', d), a = fromEl.getBoundingClientRect();
      var run = function () { var b = im.getBoundingClientRect(); if (!b.width) return; gsap.fromTo(im, { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, transformOrigin: '0 0' }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .6, ease: 'expo.out' }); };
      if (im.complete) run(); else im.addEventListener('load', run, { once: true });
    }
  }

  /* ============================================================
     AREA DETAIL: Yas Island (Immersive)
     ============================================================ */
  function renderArea() {
    var a = AREA('yas'), h = inArea(a.n), x = byId(31521);
    var chapters = [
      ['01 · The street', 'Villas behind hedges and street trees', 'Two-storey villas set back from the road, with hedges, street trees and covered garages. This is West Yas, where our current listing sits.', 'yas-street', 'West Yas street, from the listing photos'],
      ['02 · The terraces', 'Shade built into the architecture', 'Upper terraces under pergola slats, with timber-clad walls and glass balustrades facing the street.', 'yas-terrace-timber', 'Upper terrace with pergola and timber wall'],
      ['03 · The view', 'Across the neighbourhood', 'From the terrace: neighbouring villas, palms and young trees along the street below.', 'yas-balcony', 'Balcony view across West Yas']
    ];
    var raha = inArea('Al Raha');
    main.innerHTML = '<section class="a-hero on-img" aria-labelledby="a-h"><img src="' + IMG('yas-terrace-view') + '" alt="Covered terrace looking over a villa street in West Yas" fetchpriority="high"><div class="wrap a-hero-in"><ol class="crumbs"><li><a href="#home">Home</a></li><li><a href="#home" data-scroll="areas">Areas</a></li><li><a href="#home" data-scroll="areas">Abu Dhabi</a></li><li aria-current="page">Yas Island</li></ol>' +
      '<div class="a-name"><h1 id="a-h">Yas Island</h1><span class="ar" lang="ar" dir="rtl">' + a.ar + '</span></div>' +
      '<div class="a-bar"><dl><div><dt>Homes listed now</dt><dd>' + h.length + '</dd></div><div><dt>Property types</dt><dd>Villas</dd></div><div><dt>Rent from</dt><dd>' + AED(x.pr) + '</dd></div><div><dt>Largest home listed</dt><dd>' + fmt(x.s) + ' sq ft</dd></div></dl><div class="cta"><a class="btn primary" href="#a-homes">See homes' + ico('arrow', 'go') + '</a><button type="button" class="btn-c" data-wa="yas">' + ico('wa') + 'WhatsApp</button></div></div></div></section>' +
      '<section class="sec" aria-labelledby="a-i"><div class="wrap a-intro"><p class="big" id="a-i">Villa streets in West Yas, on the island beside Al Raha and Saadiyat.</p><div class="tx"><p>Yas Island sits on Abu Dhabi\'s north-eastern edge, next to Al Raha and Saadiyat Island. The homes we list here are contemporary villas in West Yas.</p><p>Below: the place through our listing photos, the homes available now, the island on the map and what is on it.</p><div class="toc"><a class="chip" href="#a-homes">Homes</a><a class="chip" href="#a-map">Map</a><a class="chip" href="#a-places">On the island</a></div></div></div></section>' +
      '<section class="story" id="story" aria-label="West Yas in three photographs"><a class="story-skip link-arrow" href="#a-homes">Skip the story' + ico('arrow') + '</a><div class="story-pin"><div class="story-tx">' +
      chapters.map(function (c, i) { return '<div class="chap-tx' + (i === 0 ? ' on' : '') + '" data-i="' + i + '"><p class="k">' + c[0] + '</p><h2>' + c[1] + '</h2><p>' + c[2] + '</p><figure class="chap-img"><img src="' + IMG(c[3]) + '" alt="' + esc(c[4]) + '" loading="lazy"></figure></div>'; }).join('') +
      '<div class="story-prog" aria-hidden="true">' + chapters.map(function (c, i) { return '<span' + (i === 0 ? ' class="on"' : '') + '></span>'; }).join('') + '</div></div>' +
      '<div class="story-panels" aria-hidden="true">' + chapters.map(function (c, i) { return '<figure class="sp-p" data-i="' + i + '" style="flex-grow:' + (i === 0 ? 5 : 1) + '"><img src="' + IMG(c[3]) + '" alt=""><figcaption style="opacity:' + (i === 0 ? 1 : 0) + '">' + esc(c[4]) + '</figcaption></figure>'; }).join('') + '</div></div></section>' +
      '<section class="sec" id="a-homes" aria-labelledby="a-hh"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Available now</p><h2 class="h2" id="a-hh">Homes in Yas Island</h2><p class="lede">One home listed today. Tell us your budget and timing, and an adviser replies with what is available as new instructions come in.</p></div></div>' +
      '<div class="cards c3">' + h.map(function (y) { return card(y); }).join('') +
      '<form class="cform" id="a-form" style="border:1.5px solid var(--ink)"><h3>Looking in Yas Island?</h3><p>Share what you need. We reply on WhatsApp or by phone.</p><div class="inp"><label for="a-b">Budget</label><select id="a-b"><option>Rent: up to AED 300K a year</option><option>Rent: over AED 300K a year</option><option>Buy: up to AED 3M</option><option>Buy: over AED 3M</option></select></div><div class="inp"><label for="a-p">Mobile number</label><input id="a-p" type="tel" autocomplete="tel"></div><button type="submit" class="btn">Ask an adviser' + ico('arrow', 'go') + '</button></form></div>' +
      '<h3 style="margin:56px 0 20px;font:700 26px/1 var(--fd)">Nearby: homes in Al Raha</h3><div class="cards">' + raha.map(function (y) { return card(y); }).join('') + '</div></div></section>' +
      '<section class="sec" id="a-map" aria-labelledby="a-m"><div class="wrap a-split"><div class="map a-map" id="amap"></div><div><p class="eyebrow">On the map</p><h2 class="h2" id="a-m">Yas Island and its neighbours</h2><p class="lede">Communities around the island, with what we list in each today.</p><div class="near" style="margin-top:28px">' +
      [['Yas Island', 'West Yas villas'], ['Al Raha', 'Apartments, villas and off-plan'], ['Saadiyat Island', 'None listed now'], ['Al Reef Downtown', 'Apartments'], ['Khalifa City', 'Off-plan townhouses']].map(function (r) { var n = inArea(r[0]).length; return '<button type="button" data-a="' + esc(r[0]) + '"' + (r[0] === 'Yas Island' ? ' class="hot"' : '') + '><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span><span class="n">' + n + '</span></button>'; }).join('') + '</div></div></div></section>' +
      '<section class="sec dark" aria-labelledby="a-f"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Real estate facts</p><h2 class="h2" id="a-f">Yas Island in our listings</h2></div></div><dl class="facts-a"><div><dt>Homes listed</dt><dd>' + h.length + '<small>1 villa for rent</small></dd></div><div><dt>Rent</dt><dd>' + AED(x.pr) + '<small>a year, five bedrooms</small></dd></div><div><dt>Built-up area</dt><dd>' + fmt(x.s) + '<small>sq ft</small></dd></div><div><dt>Off-plan</dt><dd>None<small>no Yas projects listed now</small></dd></div></dl><p class="fine" style="margin-top:14px">From Al Aliah\'s current listings only. Market-wide prices and yields need a sourced data feed.</p></div></section>' +
      '<section class="sec" id="a-places" aria-labelledby="a-pl"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Living here</p><h2 class="h2" id="a-pl">On the island</h2><p class="lede">Public landmarks on Yas Island. Travel times depend on where you live; ask us for a specific home.</p></div></div><ul class="places">' + A.YAS_PLACES.map(function (p) { return '<li><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>'; }).join('') + '</ul></div></section>' +
      '<section class="a-cta dark" aria-labelledby="a-c"><img src="' + IMG('yas-ext') + '" alt=""><div class="wrap"><h2 id="a-c">Thinking about Yas Island?</h2><div class="sel-act"><button type="button" class="btn primary" data-enquire="yas">Talk to an adviser</button><button type="button" class="btn-c" data-wa="yas">' + ico('wa') + 'WhatsApp</button><button type="button" class="btn-c" data-call="general">' + ico('call') + 'Call</button></div></div></section>' +
      '<section class="sec" aria-labelledby="a-o"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Other areas</p><h2 class="h2" id="a-o">Keep exploring</h2></div></div><div class="oth">' + ['raha', 'reem', 'khalifa', 'khalidiya'].map(function (k) { var o = AREA(k); return '<a href="#home" data-scroll="areas"><img src="' + IMG(o.img) + '" alt="' + esc(o.alt) + '" loading="lazy">' + (o.render ? '<span class="tag-r">Developer render</span>' : '') + '<span class="tx"><b>' + esc(o.n) + '</b><span>' + inArea(o.n).length + ' homes</span></span></a>'; }).join('') + '</div></div></section>';
    footer();
    var am = $('#amap');
    var pins = ['Yas Island', 'Al Raha', 'Al Reef Downtown', 'Khalifa City'].map(function (n) { var hh = inArea(n); return { area: n, text: hh.length + (hh.length === 1 ? ' home' : ' homes'), aria: n + ': ' + hh.length + ' homes', on: n === 'Yas Island' }; });
    am.innerHTML = '<div class="map-gl" role="region" aria-label="Map: Yas Island and neighbouring communities"></div>';
    var amApi = AAMap.mount($('.map-gl', am), { pins: pins, cooperative: true, flyOnSelect: true, onPin: function (a) { $$('.near button').forEach(function (x2) { x2.classList.toggle('hot', x2.dataset.a === a); }); } });
    $$('.near button').forEach(function (b) { var f = function (v) { if (amApi) amApi.hot(b.dataset.a, v); $$('.near button').forEach(function (x) { x.classList.toggle('hot', v ? x === b : x.dataset.a === 'Yas Island'); }); }; b.addEventListener('mouseenter', function () { f(true); }); b.addEventListener('focus', function () { f(true); }); b.addEventListener('mouseleave', function () { f(false); }); b.addEventListener('click', function () { if (b.dataset.a !== 'Yas Island') { goSearch({ pur: inArea(b.dataset.a).some(rent) ? 'rent' : 'sale', locs: inArea(b.dataset.a).length ? [b.dataset.a] : [], types: [], beds: '', price: '', comp: '', sort: 'new', sl: false }); } }); });
    $('#a-form').addEventListener('submit', function (e) { e.preventDefault(); toast('<b>Specimen:</b> nothing was sent.'); });
    areaMotion();
  }
  /* Pinned story in normal document scroll: the active photo widens, the others compress.
     Lenis smooths scrolling on this page only; no inner scroll area, so nothing traps the wheel. */
  function areaMotion() {
    var story = $('#story');
    if (RM || !G || mob()) { story.classList.add('static'); return; }
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      var raf = function (t) { lenis.raf(t * 1000); }; gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
      cleanup.push(function () { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; });
    }
    var panels = $$('.sp-p', story), txt = $$('.chap-tx', story), prog = $$('.story-prog span', story), cur = 0;
    gsap.from('.a-name h1, .a-name .ar', { yPercent: 40, opacity: 0, duration: 1.1, stagger: .12, ease: 'power4.out', delay: .1 });
    gsap.from('.a-hero > img', { scale: 1.15, duration: 2.4, ease: 'power2.out' });
    gsap.from('.a-bar dl > div, .a-bar .cta', { y: 20, opacity: 0, duration: .6, stagger: .06, ease: 'power2.out', delay: .5 });
    ScrollTrigger.create({
      trigger: story, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: function (s) {
        // seg runs 0 → 2 across the pinned distance; panel i hands over to panel i + 1 between 35% and 85% of each step
        var seg = s.progress * (panels.length - 1), i = Math.min(Math.floor(seg), panels.length - 2), t = seg - i;
        var e = Math.min(1, Math.max(0, (t - .35) / .5)); e = e * e * (3 - 2 * e);
        panels.forEach(function (el, k) {
          var w = k === i ? 5 - 4 * e : k === i + 1 ? 1 + 4 * e : 1;
          el.style.flexGrow = w.toFixed(3);
          $('img', el).style.filter = 'grayscale(' + (w > 3 ? 0 : .6) + ')';
          $('figcaption', el).style.opacity = w > 3 ? 1 : 0;
        });
        var n = Math.round(seg);
        if (n !== cur) { cur = n; txt.forEach(function (tx, k) { tx.classList.toggle('on', k === n); }); prog.forEach(function (pg, k) { pg.classList.toggle('on', k <= n); }); }
      }
    });
    gsap.from('.facts-a > div', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.facts-a', start: 'top 85%', once: true } });
    gsap.from('.places li', { y: 16, opacity: 0, duration: .5, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: '.places', start: 'top 85%', once: true } });
  }

  /* ============================================================
     Enquiry dialog
     ============================================================ */
  function openEnquiry(key, kind) {
    var d = $('#enq'), x = byId(key), p = PROJ(key), a = AREA(key);
    var head = kind === 'viewing' ? (x && x.comp === 'offplan' ? 'Book a consultation' : 'Request a viewing') : kind === 'plan' ? 'Request the details' : p ? 'Payment plan and brochure' : 'Talk to an adviser';
    var sum = x ? '<div class="enq-sum"><img src="' + IMG(x.img) + '" alt=""><div><b>' + esc(T(x)) + ', ' + esc(x.area) + '</b><span>' + AED(x.pr) + (x.pur === 'rent' ? ' a year' : '') + ' · Ref ' + x.ref + '</span></div></div>' :
      p ? '<div class="enq-sum">' + (p.img ? '<img src="' + IMG(p.img) + '" alt="">' : '<span></span>') + '<div><b>' + esc(p.name) + '</b><span>' + esc(p.loc) + (p.handover ? ' · handover ' + p.handover : '') + '</span></div></div>' :
      a ? '<div class="enq-sum"><img src="' + IMG(a.img) + '" alt=""><div><b>' + esc(a.n) + '</b><span>Area enquiry</span></div></div>' : '';
    d.innerHTML = '<div class="d-hd"><h2 id="enq-h">' + head + '</h2><button type="button" class="d-x" data-close>' + ico('close') + '<span class="vh">Close</span></button></div><form class="d-bd" id="enq-f">' + sum +
      '<div class="inp"><label for="e-n">Name</label><input id="e-n" autocomplete="name" required></div><div class="inp"><label for="e-p">Mobile number</label><input id="e-p" type="tel" autocomplete="tel" inputmode="tel" required></div>' +
      (kind === 'viewing' ? '<div class="inp"><label for="e-w">When suits you?</label><select id="e-w"><option>This week</option><option>Next week</option><option>I\'m flexible</option></select></div>' : '') +
      '<div class="inp"><label for="e-c">Reply by</label><select id="e-c"><option>WhatsApp</option><option>Phone call</option><option>Email</option></select></div>' +
      '<div class="inp"><label for="e-m">Message (optional)</label><textarea id="e-m">' + esc(x ? waText(x.id) : p ? waText(p.key) : a ? waText(a.key) : '') + '</textarea></div>' +
      '<button type="submit" class="btn primary block">Send request</button><p class="fine">Sent to Al Aliah only, to reply to this request.</p></form>';
    d.showModal();
    $('#enq-f').addEventListener('submit', function (e) { e.preventDefault(); d.close(); toast('<b>Specimen:</b> nothing was sent. Live: the request reaches an adviser with the listing reference attached (lead routing: open question W7).'); });
  }

  /* ============================================================
     Global delegation
     ============================================================ */
  document.addEventListener('click', function (e) {
    var t = e.target, b;
    if ((b = t.closest('[data-pcnav]'))) { e.preventDefault(); pcStep(b); return; }
    if ((b = t.closest('#mt-menu'))) { $('#hdr-menu').click(); return; }
    if ((b = t.closest('#mt-sl'))) { $('#hdr-sl').click(); return; }
    if ((b = t.closest('[data-sl]'))) { e.preventDefault(); toggleSL(b.dataset.sl, b); return; }
    if ((b = t.closest('[data-wa]'))) { e.preventDefault(); wa(b.dataset.wa); return; }
    if ((b = t.closest('[data-call]'))) { e.preventDefault(); call(b.dataset.call); return; }
    if ((b = t.closest('[data-enquire]'))) { e.preventDefault(); var dlg = b.closest('dialog'); if (dlg) dlg.close(); openEnquiry(b.dataset.enquire, b.dataset.kind); return; }
    if ((b = t.closest('[data-todo]'))) { e.preventDefault(); closeMega(); var dl = b.closest('dialog'); if (dl) dl.close(); toast(esc(b.dataset.todo)); return; }
    if ((b = t.closest('[data-close]'))) { var dd = b.closest('dialog'); if (dd) dd.close(); if (!b.getAttribute('href')) return; }
    if ((b = t.closest('[data-scroll]'))) { e.preventDefault(); closeMega(); var md = $('#mnav'); if (md.open) md.close(); var id = b.dataset.scroll; var jump = function () { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }; if (route.page !== 'home') { go('home'); setTimeout(jump, 150); } else jump(); return; }
    if ((b = t.closest('a[href^="#"]'))) {
      var href = b.getAttribute('href');
      if (/^#(home|search|property|area|offplan)/.test(href)) { closeMega(); var m = $('#mnav'); if (m.open) m.close(); var dg = b.closest('dialog'); if (dg) dg.close(); }
      if (/^#offplan\//.test(href)) { e.preventDefault(); toast('Project pages are outside this specimen\'s four pages.'); }
    }
  });
  $('#hdr-sl').addEventListener('click', function () { sQ = { pur: 'rent', locs: [], types: [], beds: '', price: '', comp: '', sort: 'new', sl: true }; var all = L.filter(function (x) { return isSL(x.id); }); if (all.length && all.every(sale)) sQ.pur = 'sale'; goSearch(sQ); });
  $$('dialog').forEach(function (d) { d.addEventListener('click', function (e) { if (e.target === d) d.close(); }); });

  /* ============================================================
     Router
     ============================================================ */
  function teardown() {
    cleanup.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } }); cleanup = [];
    if (G) { ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.kill(); }); gsap.set(hdr, { clearProps: 'all' }); }
    closeMega(); closePop(); compare = [];
  }
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
  function render() {
    var h = (location.hash || '#home').slice(1), parts = h.split('/'), page = parts[0];
    if (['home', 'search', 'property', 'area'].indexOf(page) < 0) page = 'home';
    teardown();
    route = { page: page, arg: parts.slice(1).join('/') || null };
    site.dataset.page = page;
    $$('#sp-pages button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.go === page); });
    $('#sp-state').hidden = page !== 'property'; $('#sp-permit').hidden = page !== 'property'; $('#sp-replay').hidden = page !== 'home';
    $$('.nav-b[data-mega]').forEach(function (b) { b.removeAttribute('aria-current'); });
    if (page === 'search') { var nb = $('.nav-b[data-mega="' + ({ sale: 'buy', rent: 'rent', offplan: 'offplan' }[(route.arg || sQ.pur).split('/')[0]] || 'buy') + '"]'); if (nb) nb.setAttribute('aria-current', 'page'); }
    if (page === 'area') $('.nav-b[data-mega="areas"]').setAttribute('aria-current', 'page');
    window.scrollTo(0, 0); lastY = 0; hdr.classList.remove('hide');
    if (page === 'home') renderHome();
    else if (page === 'search') renderSearch(route.arg);
    else if (page === 'property') { renderProperty(route.arg || propId); $$('#sp-state button').forEach(function (b) { b.setAttribute('aria-pressed', Number(b.dataset.prop) === propId); }); }
    else renderArea();
    $$('#sp-permit button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.permit === permitMode); });
    splitHeads(main); splitHeads($('#ft'));
    onScroll(); setSLCount(); notes(page);
    requestAnimationFrame(function () { refitMaps(); if (G) ScrollTrigger.refresh(); });
    document.title = { home: 'Al Aliah International · Abu Dhabi property', search: 'Search · Al Aliah', property: T(byId(propId)) + ' · Al Aliah', area: 'Yas Island · Al Aliah' }[page] + ' (specimen)';
  }
  window.addEventListener('hashchange', render);

  /* ============================================================
     Specimen controls + notes
     ============================================================ */
  $$('#sp-pages button').forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.go === 'property' ? 'property/' + propId : b.dataset.go); }); });
  $$('#sp-state button').forEach(function (b) { b.addEventListener('click', function () { go('property/' + b.dataset.prop); }); });
  $$('#sp-permit button').forEach(function (b) { b.addEventListener('click', function () { permitMode = b.dataset.permit; render(); }); });
  $('#sp-replay').addEventListener('click', function () { window.__replay = true; render(); });
  function setView(v) {
    stage.dataset.view = v; document.body.classList.toggle('mframe', v === 'mobile');
    $$('#sp-view button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === v); });
    render();
  }
  $$('#sp-view button').forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
  var nb2 = $('#sp-notes'), np = $('#notes');
  nb2.addEventListener('click', function () { var on = np.hidden; np.hidden = !on; nb2.setAttribute('aria-expanded', on); if (on) $('#notes-x').focus(); });
  $('#notes-x').addEventListener('click', function () { np.hidden = true; nb2.setAttribute('aria-expanded', 'false'); nb2.focus(); });

  var NOTES = {
    home: '<h2>Homepage</h2><p>Immersive. The page moves the visitor from discover to compare to understand to contact: hero search, purpose tiles, homes with contact on every card, a curated selection, areas, off-plan compared on numbers, investment goals, developers through projects, then advice and contact.</p>' +
      '<h3>Revised from the live references (8 Oct)</h3><p>See docs/stage-03-3-v2-reference-study.md for what was observed directly.</p>' +
      '<h3>4-motion rule, where it applies</h3><ul><li><b>Hero</b> (from 11 Tanjung\'s plate loader, re-expressed): hide: a white plate with a real load counter (photo + fonts) · reveal: the photo, as the plate opens outward from a crimson redline (1.1 s, cubic-bezier(.5,0,0,1)) · react: headline words rise out of their own masks (1 s, 50 ms stagger), then the search settles from blur · move: the photo settles from 1.12×. Once per session; any key, tap or wheel skips it. The search never waits for scroll.</li><li><b>Hero on scroll:</b> the hero stays pinned and the next section slides over it while the photo darkens (the 11 Tanjung handoff, square-edged).</li><li><b>Section headings:</b> word-by-word mask reveal on entry, CSS only.</li><li><b>Areas</b> (11 Tanjung facilities logic): entrance from the right, blurred 16 px, 100 ms stagger · active panel takes about a third (750 ms) · its caption un-blurs and rises (500 ms after 300 ms). One panel stays open at rest so information shows without hover. Mobile: swipe deck (11 Tanjung\'s mobile stack hides captions, which fails a property site).</li><li><b>Off-plan featured band</b> (OIA\'s Featured Projects, with numbers): the chosen project wipes in (1 s) and its sheet lines rise.</li><li><b>Cards:</b> browse photos in place (buttons on hover/focus, swipe in vertical lists).</li></ul>' +
      '<h3>Real data choices</h3><ul><li>The hero photo is our own listing (Yas villa), credited and linked: the hero is a property.</li><li>All photos are agent photos up to 1,600 px wide (most 1,280). Full-bleed use softens at 1,920 px and on retina screens; commissioned photography (Q2) fixes this, not the layout.</li><li>Developer renders are always labelled. The Bayz 102 renders and the BRABUS-branded Brabus Island renders are withheld.</li><li>Developers: all 17 staging logos, made monochrome. Only two developer-project links are verified (Binghatti → Aquarise, Danube → Bayz 102); both are Dubai. No Abu Dhabi developer link exists yet.</li><li>Investment goals use real listings and plans. No yields or growth figures: none are sourced.</li></ul>' +
      '<h3>Open questions</h3><ul><li>Intro length: 3.4 s once per session. Shorter?</li><li>Homepage repetition: with 11 Abu Dhabi listings, the same homes appear in several sections.</li><li>Dubai prominence: featured developers are both Dubai, while Abu Dhabi leads the brand.</li></ul>',
    search: '<h2>Search / Buy</h2><p>Functional: native scroll, CSS-speed feedback (≤ 250 ms), no cinematic motion.</p><ul><li>Filters show counts that respect the other filters; zero options stay visible but quiet.</li><li>Active filters become removable chips. The empty state names each filter and what removing it would return. Try 5+ bedrooms with Under AED 1M.</li><li>List and map: hover or focus a card and its community lights on the map; hover a price pin and its cards light; click a pin to select and see a preview.</li><li>Shortlist (heart) on every card, kept on this device; the header heart opens the shortlist as a search.</li><li>Compare up to three homes: price, price per sq ft, space, status and payment plan side by side.</li><li>WhatsApp and Call on every card, never hidden behind hover.</li><li>Mobile: a sticky bar with Filters, a full filter sheet with a live "Show N homes" button, and a floating List / Map switch.</li></ul><h3>Data limits</h3><ul><li>No listing has coordinates: pins sit at community level (Q3). Production uses MapLibre (D-006).</li><li>Dubai projects appear under Off-Plan as project cards, without a map.</li></ul>',
    property: '<h2>Property detail</h2><p>Editorial. Everything structured sits in the overview; missing fields are omitted and the grid rebalances. Three states: a ready villa for rent, an off-plan apartment, and a sparse listing.</p><ul><li><b>Signature interaction:</b> the gallery mosaic; the clicked photo grows into the full-screen viewer. Photos tagged by room (the Yas villa) filter by room.</li><li><b>Off-plan essentials:</b> handover and the 10 / 75 / 15 plan, with approximate amounts from the listed price, directly under the facts.</li><li><b>Madhmoun permit:</b> a compliance block beside the buying facts. No verified permit exists in the data (the only stored value is unverified and on a Dubai record), so the specimen shows a marked placeholder. Switch to "Permit: none" for the real-data state.</li><li><b>Amenities:</b> In the home / Building and community, from the proposed amenity map. "Swimming pool" stays neutral unless the listing says private.</li><li><b>Contact:</b> a sticky enquiry card on desktop; a bottom bar (WhatsApp, Call, Enquire) on mobile.</li></ul><h3>Data notes</h3><ul><li>No listing has a plot area or a structured furnishing value: both are omitted.</li><li>31083: handover and plan exist only in the description, so the page asks instead of guessing.</li><li>Descriptions are shown without the company boilerplate and licence lines.</li></ul>',
    area: '<h2>Area: Yas Island</h2><p>Immersive. Yas Island is chosen for its photography: the West Yas listing has the strongest real exterior photos in the library. It has one listing, which tests how an area page holds up with thin inventory.</p><ul><li><b>Pinned story:</b> three photo panels in normal document scroll. As you scroll, the active panel widens and the others compress (the facilities logic, driven by scroll). Lenis smooths scrolling on this page only; there is no inner scroll area and a "Skip the story" link.</li><li>Mobile and reduced motion: a static sequence of chapters with photos.</li><li>The page shows only Al Aliah\'s data (one home, its price and size), then nearby Al Raha homes, the map, landmarks and contact.</li><li>Off-plan and developer sections are omitted: none exist for Yas.</li></ul><h3>Data notes</h3><ul><li>Landmarks are public places named without distances; editorial to verify.</li><li>Al Raha\'s 31571 has a Bloom Gardens address, so its townhouse photos are not used as Al Raha imagery.</li><li>The Arabic name is the only Arabic on the page (RTL is deferred). It needs native verification.</li></ul>'
  };
  function notes(p) { $('#notes-body').innerHTML = NOTES[p] + '<h3>Not in this specimen</h3><ul><li>Arabic and RTL (deferred until the English design is approved).</li><li>Production theme code, the Stage 04 motion system and other pages.</li></ul>'; }

  /* Boot */
  setSLCount();
  $$('#sp-view button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === 'desktop'); });
  render();
})();
