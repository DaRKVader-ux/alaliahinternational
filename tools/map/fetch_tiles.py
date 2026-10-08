"""Bundle OpenStreetMap vector tiles (OpenFreeMap) for the Abu Dhabi specimen map.

The artifact host cannot load third-party tiles at runtime, so the specimen ships a small, bounded
tile set with its own style, glyphs and sprite. Data: (c) OpenStreetMap contributors (ODbL),
tiles and style: OpenFreeMap (MIT/BSD-style). Run from the repo root:

    python3 tools/map/fetch_tiles.py docs/stage-03-3-v2/map
"""
import json, math, os, shutil, sys, urllib.request, urllib.parse, gzip

OUT = sys.argv[1]
SRC = os.path.join(OUT, 'src')  # raw .pbf cache: not published, not committed
BASE = 'https://tiles.openfreemap.org'
# Abu Dhabi island to Yas, Al Reef and Madinat Al Riyad. map.js uses the same box as maxBounds.
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
            p = os.path.join(SRC, 'tiles', str(z), str(x), f'{y}.pbf')
            if not os.path.exists(p):
                save(p, get(tmpl.replace('{z}', str(z)).replace('{x}', str(x)).replace('{y}', str(y)), binary=True))
            count += 1
print('tiles', count)

# Keep vector layers only (drop the shaded-relief raster), English labels first
# Attribution is set once by map.js (OpenStreetMap contributors, OpenFreeMap)
style['sources'] = {'openmaptiles': {'type': 'vector', 'tiles': ['map/tiles/{z}/{x}/{y}.pbf'], 'minzoom': 0, 'maxzoom': 13}}
style['layers'] = [l for l in style['layers'] if l.get('source', 'openmaptiles') == 'openmaptiles' and l.get('type') != 'raster']
fonts = set()
for l in style['layers']:
    lay = l.get('layout', {})
    # Name labels in English, else the Latin transliteration. No fallback to the local-script name: the specimen
    # is English-only and Arabic needs glyph ranges and shaping it does not bundle (a missing range blanks a tile).
    # Road shields keep their 'ref' text.
    if 'text-field' in lay and 'name' in json.dumps(lay['text-field']):
        # (not 'name_en': OpenMapTiles fills it from the local-script name when no English name exists)
        lay['text-field'] = ['coalesce', ['get', 'name:en'], ['get', 'name:latin']]
    for f in lay.get('text-font', []) if isinstance(lay.get('text-font'), list) else []:
        if isinstance(f, str): fonts.add(f)
# Glyphs for the Latin ranges (basic, Latin-1, Extended A/B, combining marks, Extended Additional, punctuation),
# plus the Arabic blocks: some OSM features carry Arabic text in name:en, and one missing range blanks the whole tile.
for f in fonts:
    for rng in ['0-255', '256-511', '512-767', '768-1023', '7680-7935', '8192-8447',
                '1536-1791', '1792-2047', '64256-64511', '64512-64767', '64768-65023', '65024-65279']:
        p = os.path.join(SRC, 'fonts', f, rng + '.pbf')
        if not os.path.exists(p):
            try: save(p, get(BASE + '/fonts/' + urllib.parse.quote(f) + '/' + rng + '.pbf', binary=True))
            except Exception as e: print('font miss', f, rng, e)
sp = style['sprite'] if isinstance(style['sprite'], str) else style['sprite'][0]['url']
for suf in ['.json', '.png', '@2x.json', '@2x.png']:
    save(os.path.join(OUT, 'sprites', 'ofm' + suf), get(sp + suf, binary=True))
# The artifact host serves no generic binary type, so tiles and glyphs ship as base64 JSON packs, read by the
# 'aa-pack' protocol in map.js. Tiles are grouped by zoom and z10 column; glyphs by font and Latin/Arabic blocks.
import base64
packs = {}
for z in ZOOMS:
    xs, ys = tile_range(z)
    for x in xs:
        for y in ys:
            key = f't{z}-{x >> max(0, z - 10)}'
            packs.setdefault(key, {})[f'{x}/{y}'] = base64.b64encode(open(os.path.join(SRC, 'tiles', str(z), str(x), f'{y}.pbf'), 'rb').read()).decode()
ARABIC = {'1536-1791', '1792-2047', '64256-64511', '64512-64767', '64768-65023', '65024-65279'}
for f in fonts:
    for fn in os.listdir(os.path.join(SRC, 'fonts', f)):
        rng = fn[:-4]
        key = 'g-' + f.replace(' ', '-') + ('-ar' if rng in ARABIC else '-la')
        packs.setdefault(key, {})[rng] = base64.b64encode(open(os.path.join(SRC, 'fonts', f, fn), 'rb').read()).decode()
shutil.rmtree(os.path.join(OUT, 'packs'), ignore_errors=True); os.makedirs(os.path.join(OUT, 'packs'))
for k, v in packs.items():
    json.dump(v, open(os.path.join(OUT, 'packs', k + '.json'), 'w'), separators=(',', ':'))
print('packs', len(packs), {k: len(v) for k, v in packs.items()})
style['sources']['openmaptiles']['tiles'] = ['aa-pack://t/{z}/{x}/{y}']
style['sprite'] = 'map/sprites/ofm'
style['glyphs'] = 'aa-pack://g/{fontstack}/{range}'
json.dump(style, open(os.path.join(OUT, 'style.json'), 'w'))
# Switch the specimen map on
mj = os.path.join(os.path.dirname(OUT), "map.js"); t = open(mj).read().replace("var BUNDLED = false;", "var BUNDLED = true;"); open(mj, "w").write(t)
print('fonts', sorted(fonts))
