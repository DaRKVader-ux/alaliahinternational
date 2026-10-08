"""Bundle OpenStreetMap vector tiles (OpenFreeMap) for the Abu Dhabi specimen map.

The artifact host cannot load third-party tiles at runtime, so the specimen ships a small, bounded
tile set with its own style, glyphs and sprite. Data: (c) OpenStreetMap contributors (ODbL),
tiles and style: OpenFreeMap (MIT/BSD-style). Run from the repo root:

    python3 tools/map/fetch_tiles.py docs/stage-03-3-v2/map
"""
import json, math, os, sys, urllib.request, urllib.parse, gzip

OUT = sys.argv[1]
BASE = 'https://tiles.openfreemap.org'
# Abu Dhabi island to Yas, Al Reef and Madinat Al Riyad
W, S, E, N = 54.25, 24.15, 54.80, 24.62
ZOOMS = range(8, 14)  # 8–13; MapLibre over-zooms to 16

def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': 'AlAliah-design-specimen/1.0 (one-off bounded fetch)', 'Accept-Encoding': 'gzip'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
        if r.headers.get('Content-Encoding') == 'gzip' or data[:2] == b'\x1f\x8b':
            data = gzip.decompress(data)
        return data if binary else json.loads(data)

def tile_range(z):
    n = 2 ** z
    x0 = int((W + 180) / 360 * n); x1 = int((E + 180) / 360 * n)
    def ty(lat):
        r = math.radians(lat); return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n)
    return range(x0, x1 + 1), range(ty(N), ty(S) + 1)

def save(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f: f.write(data)

style = get(BASE + '/styles/liberty')
tj = get(style['sources']['openmaptiles']['url'])
tmpl = tj['tiles'][0]
count = 0
for z in ZOOMS:
    xs, ys = tile_range(z)
    for x in xs:
        for y in ys:
            p = os.path.join(OUT, 'tiles', str(z), str(x), f'{y}.pbf')
            if not os.path.exists(p):
                save(p, get(tmpl.replace('{z}', str(z)).replace('{x}', str(x)).replace('{y}', str(y)), binary=True))
            count += 1
print('tiles', count)

# Keep vector layers only (drop the shaded-relief raster), English labels first
style['sources'] = {'openmaptiles': {'type': 'vector', 'tiles': ['map/tiles/{z}/{x}/{y}.pbf'], 'minzoom': 0, 'maxzoom': 13,
                                     'attribution': '© OpenStreetMap contributors'}}
style['layers'] = [l for l in style['layers'] if l.get('source', 'openmaptiles') == 'openmaptiles' and l.get('type') != 'raster']
fonts = set()
for l in style['layers']:
    lay = l.get('layout', {})
    if 'text-field' in lay:
        lay['text-field'] = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']]
    for f in lay.get('text-font', []) if isinstance(lay.get('text-font'), list) else []:
        if isinstance(f, str): fonts.add(f)
# Glyphs for Latin ranges (labels are English); sprite at 1x and 2x
for f in fonts:
    for rng in ['0-255', '256-511', '8192-8447']:
        p = os.path.join(OUT, 'fonts', f, rng + '.pbf')
        if not os.path.exists(p):
            try: save(p, get(BASE + '/fonts/' + urllib.parse.quote(f) + '/' + rng + '.pbf', binary=True))
            except Exception as e: print('font miss', f, rng, e)
sp = style['sprite'] if isinstance(style['sprite'], str) else style['sprite'][0]['url']
for suf in ['.json', '.png', '@2x.json', '@2x.png']:
    save(os.path.join(OUT, 'sprites', 'ofm' + suf), get(sp + suf, binary=True))
style['sprite'] = 'map/sprites/ofm'
style['glyphs'] = 'map/fonts/{fontstack}/{range}.pbf'
json.dump(style, open(os.path.join(OUT, 'style.json'), 'w'))
# Switch the specimen map on
mj = os.path.join(os.path.dirname(OUT), "map.js"); t = open(mj).read().replace("var BUNDLED = false;", "var BUNDLED = true;"); open(mj, "w").write(t)
print('fonts', sorted(fonts))
