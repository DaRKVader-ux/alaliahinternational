/* Al Aliah specimen map: MapLibre GL with OpenStreetMap vector tiles (OpenFreeMap), bundled locally
   under map/ because the artifact host cannot load third-party tiles at runtime.
   Familiar map UX: drag, scroll or pinch to zoom, +/− buttons, price pins, a selected state in crimson.
   Listings have no coordinates yet (open question Q3), so pins sit at community centres. */
(function () {
  'use strict';
  // Community centres (public geography, approximate). Positions are by community, never by listing.
  var C = {
    'Yas Island': [54.598, 24.490], 'Al Raha': [54.6045, 24.4505], 'Al Reem Island': [54.403, 24.499],
    'Saadiyat Island': [54.433, 24.544], 'Khalifa City': [54.578, 24.419], 'Al Khalidiya': [54.347, 24.472],
    'Al Reef Downtown': [54.684, 24.456], 'Madinat Al Riyad': [54.675, 24.225], 'Masdar City': [54.615, 24.427],
    'Mohammed Bin Zayed City': [54.548, 24.341]
  };
  // Set to true by tools/map/fetch_tiles.py once map/ holds the bundled tiles, style, glyphs and sprite.
  var BUNDLED = false;
  var ready = null;
  function haveTiles() {
    if (ready) return ready;
    ready = fetch(new URL('map/style.json', location.href).href, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error('no style'); return r.json(); })
      .then(function (style) {
        var abs = function (u) { return new URL(u, location.href).href; };
        Object.keys(style.sources).forEach(function (k) { var s = style.sources[k]; if (s.tiles) s.tiles = s.tiles.map(abs); });
        if (style.glyphs) style.glyphs = abs(style.glyphs).replace('%7Bfontstack%7D', '{fontstack}').replace('%7Brange%7D', '{range}');
        if (style.sprite) style.sprite = abs(style.sprite);
        return style;
      });
    return ready;
  }
  function pending(box, note) {
    box.classList.add('map-pending');
    box.innerHTML = '<div class="mp-in"><svg class="i" aria-hidden="true"><use href="#i-map"/></svg><b>Map loading is unavailable in this specimen</b><span>' + (note || 'OpenStreetMap tiles could not be bundled from this build environment.') + '</span></div>';
  }
  /* opts: { pins: [{area, text, aria, on}], focus: area | null, zoom, interactive, onPin(area), labelled } */
  function mount(box, opts) {
    opts = opts || {};
    if (!window.maplibregl || !BUNDLED) { pending(box, BUNDLED ? null : 'OpenStreetMap tiles are not bundled yet: the build environment cannot reach the tile server.'); return null; }
    var api = { map: null, select: function () {}, hot: function () {} };
    haveTiles().then(function (style) {
      box.innerHTML = '';
      var pts = (opts.pins || []).map(function (p) { return C[p.area]; }).filter(Boolean);
      var map = new maplibregl.Map({
        container: box, style: style, attributionControl: false,
        center: opts.focus && C[opts.focus] ? C[opts.focus] : [54.5, 24.43], zoom: opts.zoom || 10.4,
        minZoom: 8, maxZoom: 16, maxBounds: [[53.9, 23.95], [55.2, 24.9]], cooperativeGestures: !!opts.cooperative,
        interactive: opts.interactive !== false, fadeDuration: 0
      });
      api.map = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · OpenFreeMap' }), 'bottom-right');
      if (!opts.focus && pts.length > 1) {
        var b = new maplibregl.LngLatBounds(pts[0], pts[0]); pts.forEach(function (p) { b.extend(p); });
        map.fitBounds(b, { padding: { top: 70, bottom: 70, left: 60, right: 60 }, duration: 0, maxZoom: 12 });
      }
      var marks = {};
      (opts.pins || []).forEach(function (p) {
        if (!C[p.area]) return;
        var el = document.createElement('button'); el.type = 'button'; el.className = 'mpin' + (p.on ? ' on' : ''); el.textContent = p.text; el.setAttribute('aria-label', p.aria || p.text); el.dataset.a = p.area;
        el.addEventListener('click', function (e) { e.stopPropagation(); api.select(p.area); if (opts.onPin) opts.onPin(p.area, el); });
        el.addEventListener('mouseenter', function () { if (opts.onHover) opts.onHover(p.area, true); });
        el.addEventListener('mouseleave', function () { if (opts.onHover) opts.onHover(p.area, false); });
        marks[p.area] = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(C[p.area]).addTo(map);
      });
      if (opts.focus && C[opts.focus] && opts.ring !== false) {
        var el2 = document.createElement('div'); el2.className = 'mring'; el2.setAttribute('aria-hidden', 'true');
        new maplibregl.Marker({ element: el2 }).setLngLat(C[opts.focus]).addTo(map);
      }
      api.select = function (area) { Object.keys(marks).forEach(function (k) { marks[k].getElement().classList.toggle('on', k === area); }); if (area && C[area] && opts.flyOnSelect) map.easeTo({ center: C[area], duration: 500 }); };
      api.hot = function (area, v) { Object.keys(marks).forEach(function (k) { marks[k].getElement().classList.toggle('hot', !!v && k === area); }); };
      api.resize = function () { map.resize(); };
      var rs = function () { map.resize(); }; window.addEventListener('aa-map-resize', rs); box._aaResize = rs;
      if (opts.onReady) map.once('load', function () { opts.onReady(api); });
    }).catch(function () { pending(box); });
    return api;
  }
  window.AAMap = { mount: mount, C: C };
})();
