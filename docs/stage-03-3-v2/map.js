/* Al Aliah specimen map: MapLibre GL with OpenStreetMap vector tiles (OpenFreeMap), bundled locally
   under map/ because the artifact host cannot load third-party tiles at runtime.
   Familiar map UX: drag, scroll or pinch to zoom, +/− buttons, price pins, a selected state in crimson.
   Listings have no coordinates yet (open question Q3), so pins sit at community positions. */
(function () {
  'use strict';
  // Community positions, from the OpenStreetMap place labels in the bundled tiles (checked 2026-10-08), so each pin sits
  // on the map's own label. Al Reef Downtown has no place label: its position is the community's OSM points of
  // interest (Al Reef Downtown swimming pools). Pins are by community, never by listing (no listing coordinates, Q3).
  var C = {
    'Yas Island': [54.6091, 24.4864], 'Al Raha': [54.5902, 24.4465], 'Al Reem Island': [54.4052, 24.4954],
    'Saadiyat Island': [54.4437, 24.5460], 'Khalifa City': [54.6213, 24.4267], 'Al Khalidiya': [54.3411, 24.4708],
    'Al Reef Downtown': [54.6725, 24.4556], 'Madinat Al Riyad': [54.7572, 24.3532], 'Mohammed Bin Zayed City': [54.5536, 24.3340]
  };
  // Set to true by tools/map/fetch_tiles.py once map/ holds the bundled tiles, style, glyphs and sprite.
  var BUNDLED = true;
  var ready = null;
  function haveTiles() {
    if (ready) return ready;
    ready = fetch(new URL('map/style.json', location.href).href, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error('no style'); return r.json(); })
      .then(function (style) {
        // Absolute URLs for the worker; keep {z}/{x}/{y}, {fontstack} and {range} unescaped
        var abs = function (u) { return new URL(u, location.href).href.replace(/%7B/g, '{').replace(/%7D/g, '}'); };
        Object.keys(style.sources).forEach(function (k) { var s = style.sources[k]; if (s.tiles) s.tiles = s.tiles.map(abs); });
        if (style.glyphs) style.glyphs = abs(style.glyphs);
        if (style.sprite) style.sprite = abs(style.sprite);
        return style;
      });
    return ready;
  }
  function pending(box, note) {
    box.classList.add('map-pending');
    box.innerHTML = '<div class="mp-in"><svg class="i" aria-hidden="true"><use href="#i-map"/></svg><b>Map loading is unavailable in this specimen</b><span>' + (note || 'OpenStreetMap tiles could not be bundled from this build environment.') + '</span></div>';
  }
  /* opts: { pins: [{area, text, aria, on}], focus: area | null, zoom, interactive, cooperative, note (an overlay at top-start), onPin(area, el), onHover(area, on), flyOnSelect } */
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
        minZoom: 8, maxZoom: 16, maxBounds: [[54.25, 24.15], [54.80, 24.62]] /* the bundled tile area (tools/map/fetch_tiles.py) */, cooperativeGestures: !!opts.cooperative,
        interactive: opts.interactive !== false, fadeDuration: 0
      });
      api.map = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>' }), 'bottom-right');
      // Fit all pins until the visitor moves the map; layouts can still settle after mount, so re-fit on load and resize.
      // Pins hang above their point and are up to ~150px wide: pad so none is clipped at the edge.
      var moved = false;
      map.on('movestart', function (e) { if (e.originalEvent) moved = true; });
      var fit = function () {
        if (moved || opts.focus || pts.length < 2) return;
        var b = new maplibregl.LngLatBounds(pts[0], pts[0]); pts.forEach(function (p) { b.extend(p); });
        var px = Math.min(110, Math.round(box.clientWidth * 0.24));
        map.fitBounds(b, { padding: { top: opts.note ? 110 : 80, bottom: 40, left: px, right: px }, duration: 0, maxZoom: 12 });
      };
      fit(); map.once('load', fit);
      var marks = {};
      (opts.pins || []).forEach(function (p) {
        if (!C[p.area]) return;
        var el = document.createElement('button'); el.type = 'button'; el.className = 'mpin' + (p.on ? ' on' : ''); el.textContent = p.text; el.setAttribute('aria-label', p.aria || p.text); el.dataset.a = p.area;
        el.addEventListener('click', function (e) { e.stopPropagation(); api.select(p.area); if (opts.onPin) opts.onPin(p.area, el); });
        el.addEventListener('mouseenter', function () { if (opts.onHover) opts.onHover(p.area, true); });
        el.addEventListener('mouseleave', function () { if (opts.onHover) opts.onHover(p.area, false); });
        // MapLibre owns the wrapper's position and transform; the pin inside is free to animate.
        // Tip sits just above the community's own map label, so the name stays readable.
        var wrap = document.createElement('div'); wrap.className = 'mpin-m' + (p.on ? ' on' : ''); wrap.appendChild(el);
        new maplibregl.Marker({ element: wrap, anchor: 'bottom', offset: [0, -12] }).setLngLat(C[p.area]).addTo(map);
        marks[p.area] = el;
      });
      if (opts.focus && C[opts.focus] && opts.ring !== false) {
        var el2 = document.createElement('div'); el2.className = 'mring'; el2.setAttribute('aria-hidden', 'true');
        new maplibregl.Marker({ element: el2 }).setLngLat(C[opts.focus]).addTo(map);
      }
      api.select = function (area) { Object.keys(marks).forEach(function (k) { marks[k].classList.toggle('on', k === area); marks[k].parentNode.classList.toggle('on', k === area); }); if (area && C[area] && opts.flyOnSelect) { moved = true; map.easeTo({ center: C[area], duration: 500 }); } };
      api.hot = function (area, v) { Object.keys(marks).forEach(function (k) { marks[k].classList.toggle('hot', !!v && k === area); marks[k].parentNode.classList.toggle('hot', !!v && k === area); }); };
      api.resize = function () { map.resize(); };
      var rs = function () { map.resize(); fit(); }; window.addEventListener('aa-map-resize', rs); map.on('resize', function () { if (!moved) fit(); }); box._aaResize = rs;
      if (opts.onReady) map.once('load', function () { opts.onReady(api); });
    }).catch(function () { pending(box); });
    return api;
  }
  window.AAMap = { mount: mount, C: C };
})();
