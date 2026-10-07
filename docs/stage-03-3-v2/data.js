/* Stage 03.3 v2 specimen data. Source: Al Aliah staging (read-only), 7 Oct 2026.
   Structured fields only. Where a value exists only in description text it is NOT used as data
   (see `textOnly`, kept for the notes). Nothing here is invented. */
(function () {
  'use strict';

  /* Legacy property_features → proposed amenity map (trigon-alaliah-core Mapping::AMENITY_MAP, not yet approved).
     null = dropped. Group: home | building | general. */
  var AMEN = {
    '24-7-security': ['building', '24/7 security'], 'back-yard': ['home', 'Back yard'], 'balcony': ['home', 'Balcony'],
    'basketball-court': ['building', 'Basketball court'], 'built-in-wardrobes': ['home', 'Built-in wardrobes'],
    'central-air': ['home', 'Central air conditioning'], 'central-air-conditioning': ['home', 'Central air conditioning'],
    'elevator': ['building', 'Lift'], 'equipped-kitchen': ['home', 'Equipped kitchen'], 'front-yard': ['home', 'Front yard'],
    'fully-equipped-gym': ['building', 'Gym'], 'garage-attached': ['home', 'Garage'], 'garden': ['home', 'Garden'],
    'gym': ['building', 'Gym'], 'laundry': ['home', 'Laundry room'], 'media-room': ['home', 'Media room'],
    'meeting-facilities': ['building', 'Meeting rooms'], 'pool': ['general', 'Swimming pool'], 'private-pool': ['home', 'Private pool'],
    'sports-facilities': ['building', 'Sports facilities'], 'swimming-pool': ['general', 'Swimming pool'], 'washer-and-dryer': ['home', 'Washer and dryer']
  };
  var slug = function (s) { return s.toLowerCase().replace(/\//g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  function amenities(raw, drop) {
    var out = { home: [], building: [], general: [] };
    (raw || []).forEach(function (r) {
      var m = AMEN[slug(r)];
      if (!m || (drop || []).indexOf(m[1]) > -1 || out[m[0]].indexOf(m[1]) > -1) return;
      out[m[0]].push(m[1]);
    });
    return out;
  }

  /* Listings. ref: AA-#### from the 03.2 deterministic map (AA-1004 assigned on staging; others planned). */
  var L = [
    { id: 30964, ref: 'AA-1001', pur: 'sale', comp: 'ready', type: 'apartment', area: 'Al Reef Downtown', city: 'Abu Dhabi', addr: 'Building 1, Al Reef Downtown',
      b: 1, ba: 1, s: 480, pr: 699000, img: 'reef-room', alt: 'Empty room with a window and a tiled floor',
      gallery: ['reef-room', 'reef-balcony'],
      feat: ['balcony', 'Central Air', 'Electricity', 'Garden', 'Laundry', 'Pool', 'Washer and dryer', 'WiFi'], drop: ['Garden'],
      flags: ['Title says "Studio"; bedrooms field says 1. Editor to confirm.'] },
    { id: 30967, ref: 'AA-1002', pur: 'rent', comp: 'ready', type: 'apartment', area: 'Al Raha', city: 'Abu Dhabi', addr: 'Al Raha Loft, Al Raha Beach',
      b: 4, ba: 5, s: null, pr: 280000, img: 'raha-apt-living', alt: 'Furnished living room with a large chandelier and full-height windows',
      gallery: ['raha-apt-living', 'raha-apt-water', 'raha-apt-pool', 'raha-apt-balcony'],
      feat: ['Back yard', 'balcony', 'Basketball court', 'Central Air', 'Electricity', 'Elevator', 'Garden', 'Gym', 'Heating', 'Hot Bath', 'Laundry', 'Natural Gas', 'Outdoor Details', 'Pool', 'Utilities', 'Washer and dryer', 'WiFi'],
      drop: ['Back yard', 'Garden'],
      textOnly: { size: '4,473 sq ft', furnishing: 'Fully furnished', privatePool: 'Private swimming pool' },
      flags: ['Size is 0 in the data; the description gives 4,473 sq ft.', 'Typed apartment; possible wrong type (D-037).'] },
    { id: 31002, ref: 'AA-1003', pur: 'rent', comp: 'ready', type: 'apartment', area: 'Al Khalidiya', city: 'Abu Dhabi', addr: 'Al Khalidiya',
      b: 2, ba: 2, s: 1100, pr: 80000, img: 'khalidiya-room', alt: 'Empty room with arched windows and a white tiled floor', featured: true,
      gallery: ['khalidiya-room'],
      feat: ['balcony', 'Central Air', 'Electricity', 'Garden', 'Heating', 'Utilities', 'Washer and dryer', 'Water', 'WiFi'], drop: ['Garden'] },
    { id: 31013, ref: 'AA-1004', refState: 'assigned', pur: 'rent', comp: 'ready', type: 'apartment', area: 'Al Reem Island', city: 'Abu Dhabi', addr: 'Marina Square, Al Reem Island',
      b: 1, ba: 2, s: 915, pr: 105000, img: 'reem-living', alt: 'Living room with a dark corner sofa and a glass door to the balcony',
      gallery: ['reem-living', 'reem-dining', 'reem-bedroom', 'reem-kitchen', 'reem-kitchen-2', 'reem-bath', 'reem-hall', 'reem-bath-2', 'reem-kitchen-3'],
      feat: ['Back yard', 'balcony', 'Electricity', 'Elevator', 'Equipped Kitchen', 'Garden', 'Gym', 'Heating', 'Laundry', 'Washer and dryer', 'Water', 'WiFi'],
      drop: ['Back yard', 'Garden'],
      textOnly: { furnishing: 'Fully furnished', cheques: '2 cheques', building: 'Marina Blue Tower' } },
    { id: 31023, ref: 'AA-1005', pur: 'rent', comp: 'ready', type: 'apartment', area: 'Al Khalidiya', city: 'Abu Dhabi', addr: 'Al Khalidiya',
      b: 5, ba: 5, s: 2400, pr: 180000, img: 'khalidiya-villa', alt: 'Two-storey villa frontage with garage doors, beside a mosque', featured: true,
      gallery: ['khalidiya-villa'],
      feat: ['Back yard', 'balcony', 'Central Air', 'Electricity', 'Equipped Kitchen', 'Front yard', 'Garage Attached', 'Garden', 'Interior Details', 'Laundry', 'Utilities', 'Washer and dryer', 'WiFi'],
      flags: ['Typed apartment; photos and title show a villa. Editor to confirm.'] },
    { id: 31082, ref: 'AA-1006', pur: 'sale', comp: 'ready', type: 'apartment', area: 'Al Reef Downtown', city: 'Abu Dhabi', addr: 'Building 1, Al Reef Downtown',
      b: 2, ba: 2, s: 1354, pr: 1170000, img: 'reef-balcony', alt: 'Balcony view over mid-rise apartment buildings and a lawn',
      gallery: ['reef-balcony', 'reef-room'],
      feat: ['Back yard', 'balcony', 'Central Air', 'Electricity', 'Equipped Kitchen', 'Garden', 'Heating', 'Pool', 'Utilities', 'Washer and dryer', 'WiFi'], drop: ['Back yard', 'Garden'] },
    { id: 31083, ref: 'AA-1007', pur: 'sale', comp: 'offplan', type: 'townhouse', area: 'Khalifa City', city: 'Abu Dhabi', addr: 'Reportage Village, Khalifa City',
      b: 4, ba: 4, s: 4075, pr: 3936708, img: 'khalifa-render-street', render: true, alt: 'Developer render: a street of four-storey townhouses with timber panels',
      gallery: ['khalifa-render-street', 'khalifa-sunset', 'khalifa-court', 'khalifa-pool', 'khalifa-render', 'khalifa-living'], project: 'Reportage Village',
      feat: ['balcony', 'Central Air', 'Electricity', 'Front yard', 'Garage Attached', 'Garden', 'Gym', 'Heating', 'Hot Bath', 'Laundry', 'Pool', 'Smoke detectors', 'Utilities', 'Washer and dryer', 'Water', 'WiFi'],
      textOnly: { handover: 'Q3 2028', plan: '70/30' },
      flags: ['Handover and payment plan exist only in the description; not shown as data.', 'Developer not linked (03.2 report item 6).'] },
    { id: 31094, ref: 'AA-1008', pur: 'sale', comp: 'offplan', type: 'apartment', area: 'Al Raha', city: 'Abu Dhabi', addr: 'Brabus Island, Al Seef, Al Raha Beach',
      b: 2, ba: 3, s: 1157, pr: 3481025, img: 'brabus-aerial', render: true, alt: 'Developer render: aerial view of an island development with towers, villas and a marina',
      gallery: ['brabus-aerial', 'raha-render-aerial', 'brabus-towers', 'brabus-dusk', 'brabus-island', 'brabus-tower', 'brabus-living', 'brabus-lounge'], project: 'Brabus Island',
      handover: 'Q1 2029', plan: { overall: '85/15', booking: 10, construction: 75, handover: 15 },
      feat: ['Back yard', 'balcony', 'Central Air', 'Electricity', 'Elevator', 'Equipped Kitchen', 'Garden', 'Gym', 'Heating', 'Hot Bath', 'Laundry', 'Natural Gas', 'Pool', 'Smoke detector', 'Utilities', 'Washer and dryer', 'WiFi'],
      drop: ['Back yard', 'Garden'],
      flags: ['Developer not linked (03.2 report item 6). Renders showing third-party branding are withheld.'] },
    { id: 31495, ref: 'AA-1009', pur: 'sale', comp: 'ready', type: 'villa', area: 'Madinat Al Riyad', city: 'Abu Dhabi', addr: 'Madinat Al Riyad',
      b: 5, ba: 6, s: 11510, pr: 3800000, img: 'riyad-villa', alt: 'Two-storey villa with a paved forecourt under a bright sky', featured: true,
      gallery: ['riyad-villa'],
      feat: ['Back yard', 'Electricity', 'Elevator', 'Equipped Kitchen', 'Garage Attached', 'Garden', 'Gym', 'Heating', 'Laundry', 'Media Room', 'Pool', 'Utilities'],
      flags: ['11,510 sq ft with no plot area: possibly plot, not built-up (03.2 quality flag).'] },
    { id: 31521, ref: 'AA-1010', pur: 'rent', comp: 'ready', type: 'villa', area: 'Yas Island', city: 'Abu Dhabi', addr: 'West Yas, Yas Island',
      b: 5, ba: 6, s: 5948, pr: 420000, img: 'yas-ext', alt: 'Contemporary two-storey villa with a timber panel, garage and a street tree',
      feat: ['Back yard', 'balcony', 'Equipped Kitchen', 'Garage Attached', 'Garden', 'Gym', 'Interior Details', 'Laundry', 'Pool', 'Utilities'],
      textOnly: { rooms: '5 master bedrooms · Maid\'s room · Driver\'s room · 2 living areas · Majlis · Dining room with outdoor access · Closed kitchen · 3 balconies', furnishing: 'Furnished or unfurnished, by agreement' } },
    { id: 31571, ref: 'AA-1011', pur: 'rent', comp: 'ready', type: 'villa', area: 'Al Raha', city: 'Abu Dhabi', addr: 'Faya at Bloom Gardens, Al Muntazah',
      b: 3, ba: 5, s: 1979, pr: 219999, img: 'raha-row-3', alt: 'Row of two-storey townhouses with covered parking',
      gallery: ['raha-row-3', 'raha-row', 'raha-living', 'raha-kitchen', 'raha-court'],
      feat: [],
      flags: ['Area is Al Raha, but the address is Bloom Gardens, Al Muntazah. Editor to confirm; photos are not used as Al Raha place imagery.'] }
  ];

  /* Yas villa (31521): 16 of the listing's 49 photos, hand-tagged by room for this specimen. */
  var YAS_GALLERY = [
    ['yas-ext', 'Exterior', 'Two-storey villa with a white frame, timber panel, pergola slats and a roller-shutter garage'],
    ['yas-terrace-timber', 'Terraces', 'Upper terrace with a timber-clad wall, pergola slats and a glass balustrade'],
    ['yas-terrace-view', 'Terraces', 'Covered terrace looking over the street and neighbouring villas'],
    ['yas-living', 'Living', 'Living room with a rug, armchairs and a sofa beside full-height windows'],
    ['yas-dining', 'Dining', 'Dining table for six beside full-height glazing onto the garden'],
    ['yas-street', 'Exterior', 'The villa from the street, behind a hedge and two street trees'],
    ['yas-entry', 'Exterior', 'Entrance courtyard with paving set in artificial grass and a timber-clad wall'],
    ['yas-living-2', 'Living', 'Second living area with sliding glass doors to the garden'],
    ['yas-majlis', 'Living', 'Sitting room with red armchairs and a patterned rug'],
    ['yas-kitchen', 'Kitchen', 'Closed kitchen with timber-fronted cabinets and a gas hob'],
    ['yas-bedroom', 'Bedrooms', 'Bedroom with full-height glazing on two sides'],
    ['yas-bedroom-2', 'Bedrooms', 'Bedroom with a dark timber bed and dressing table'],
    ['yas-bath', 'Bathrooms', 'Bathroom with a vessel basin, lit mirror and walk-in shower'],
    ['yas-stair', 'Stair', 'Stair with timber fins and a glass balustrade'],
    ['yas-terrace-glass', 'Terraces', 'Terrace with a glass balustrade and pergola shade'],
    ['yas-balcony', 'Terraces', 'Balcony with a timber wall and a view across the community']
  ];
  L.filter(function (x) { return x.id === 31521; })[0].galleryTagged = YAS_GALLERY;

  var ALT = {
    'reef-room': 'Empty room with a window and a tiled floor', 'reef-balcony': 'Balcony view over mid-rise apartment buildings and a lawn',
    'raha-apt-living': 'Furnished living room with a large chandelier and full-height windows', 'raha-apt-water': 'View from a balcony over a canal and apartment buildings',
    'raha-apt-pool': 'Looking down into a courtyard pool between apartment buildings', 'raha-apt-balcony': 'Balcony with a glass balustrade beside the building facade',
    'khalidiya-room': 'Empty room with arched windows and a white tiled floor', 'khalidiya-villa': 'Two-storey villa frontage with garage doors, beside a mosque',
    'reem-living': 'Living room with a dark corner sofa and a glass door to the balcony', 'reem-dining': 'Dining table with white chairs below a framed print',
    'reem-bedroom': 'Bedroom with a padded headboard and full-height wardrobes', 'reem-kitchen': 'Kitchen with a steel fridge and dark cabinets',
    'reem-kitchen-2': 'Entrance hall with dark doors', 'reem-bath': 'Bathroom with a bathtub and dark wall tiles', 'reem-hall': 'Bathroom vanity with a wide mirror',
    'reem-bath-2': 'Shower room with a basin and toilet', 'reem-kitchen-3': 'Kitchen with a freestanding cooker and extractor hood',
    'khalifa-render-street': 'Developer render: a street of four-storey townhouses with timber panels',
    'khalifa-sunset': 'Developer render: townhouse terraces across a park at sunset', 'khalifa-court': 'Developer render: a landscaped courtyard between townhouse blocks with palms',
    'khalifa-pool': 'Developer render: a private rooftop pool with sun loungers', 'khalifa-render': 'Developer render: aerial view of townhouse rows with private pools',
    'khalifa-living': 'Developer render: a double-height living room with a stair',
    'brabus-aerial': 'Developer render: aerial view of an island development with towers, villas and a marina', 'raha-render-aerial': 'Developer render: aerial view of towers and villas on a landscaped island with a marina',
    'brabus-towers': 'Developer render: two curved towers at dusk beside the water', 'brabus-dusk': 'Developer render: a tower with curved balconies at sunset',
    'brabus-island': 'Developer render: aerial view of villas and towers on an island at dusk', 'brabus-tower': 'Developer render: a curved tower with lit balconies',
    'brabus-living': 'Developer render: a living room with a dark armchair and a city view', 'brabus-lounge': 'Developer render: a living room with a curved window wall',
    'riyad-villa': 'Two-storey villa with a paved forecourt under a bright sky',
    'raha-row-3': 'Row of two-storey townhouses with covered parking', 'raha-row': 'Two-storey townhouses with covered parking',
    'raha-living': 'Empty living room with full-height glazing', 'raha-kitchen': 'Kitchen with white cabinets and a window', 'raha-court': 'Small walled garden with artificial grass',
    'aquarise-render': 'Developer render: a curved residential tower beside a highway', 'aquarise-2': 'Developer render: a curved tower with a pool deck at dusk',
    'aquarise-lobby': 'Developer render: a lobby with timber walls and a sculpted ceiling light',
    'venice-render': 'Developer render: apartment towers reflected in a lagoon', 'venice-2': 'Developer render: a curved apartment building beside a lagoon',
    'venice-3': 'Developer render: apartment towers along a lagoon with a kayak'
  };

  /* Off-plan "projects": two Abu Dhabi unit listings and three Dubai project records. */
  var PROJECTS = [
    { key: 'brabus', name: 'Brabus Island', listing: 31094, city: 'Abu Dhabi', area: 'Al Raha', loc: 'Al Seef, Al Raha Beach', dev: null,
      price: 3481025, priceNote: '2-bed apartment', handover: 'Q1 2029', plan: { overall: '85/15', booking: 10, construction: 75, handover: 15 },
      units: 'Apartments', img: 'brabus-aerial', imgs: ['brabus-aerial', 'brabus-towers', 'brabus-dusk'] },
    { key: 'reportage', name: 'Reportage Village', listing: 31083, city: 'Abu Dhabi', area: 'Khalifa City', loc: 'Khalifa City', dev: null,
      price: 3936708, priceNote: '4-bed townhouse', handover: null, plan: null, units: 'Townhouses', img: 'khalifa-sunset', imgs: ['khalifa-sunset', 'khalifa-render-street', 'khalifa-court'] },
    { key: 'aquarise', name: 'Binghatti Aquarise', record: 32101, city: 'Dubai', area: 'Business Bay', loc: 'Business Bay, Dubai', dev: 'binghatti',
      price: null, handover: 'Q2 2027', plan: { overall: '70/30', booking: 20, construction: 50, handover: 30 }, units: 'Apartments',
      img: 'aquarise-render', imgs: ['aquarise-render', 'aquarise-2', 'aquarise-lobby'], permitUnverified: true },
    { key: 'bayz', name: 'Bayz 102', record: 32078, city: 'Dubai', area: 'Business Bay', loc: 'Business Bay, Dubai', dev: 'danube',
      price: null, handover: 'June 2029', plan: { overall: '70/30', booking: null, construction: 70, handover: 30 }, units: 'Apartments', furnishing: 'Furnished',
      img: null, imgNote: 'The project renders on staging (black-and-gold interiors, a skyline with a flying car) are withheld.' },
    { key: 'venice', name: 'Azizi Venice', record: 32060, city: 'Dubai', area: 'Dubai South', loc: 'Dubai South, Dubai', dev: null,
      price: null, handover: null, plan: null, units: 'Apartments', img: 'venice-render', imgs: ['venice-render', 'venice-2', 'venice-3'],
      devNote: 'Developer link is provisional (T3) and is not shown.' }
  ];

  /* Developer directory: all 17 staging records, logos from staging (made monochrome here).
     Only two developer → project links are verified (T1/T2). */
  var DEVS = [
    ['arada', 'Arada'], ['azizi', 'Azizi Developments'], ['binghatti', 'Binghatti Developers'], ['burtville', 'Burtville Developments'],
    ['damac', 'Damac Properties'], ['danube', 'Danube Properties'], ['dubai-properties', 'Dubai Properties'], ['ellington', 'Ellington Properties'],
    ['emaar', 'Emaar Properties'], ['mag', 'MAG Property Development'], ['meraas', 'Meraas'], ['nakheel', 'Nakheel'],
    ['nine-yards', 'Nine Yards Developments'], ['omniyat', 'Omniyat'], ['reportage', 'Reportage Properties'], ['saas', 'Saas Properties'], ['sobha', 'Sobha Realty']
  ].map(function (d) { return { key: d[0], name: d[1], projects: PROJECTS.filter(function (p) { return p.dev === d[0]; }).map(function (p) { return p.key; }) }; });

  /* Areas. Copy describes only what the photos show or the data says. Arabic names: verify natively (W2). */
  var AREAS = [
    { key: 'yas', n: 'Yas Island', ar: 'جزيرة ياس', city: 'Abu Dhabi', img: 'yas-terrace-view', alt: 'Covered terrace looking over a villa street in West Yas', line: 'Contemporary villas on tree-lined streets in West Yas.' },
    { key: 'raha', n: 'Al Raha', ar: 'الراحة', city: 'Abu Dhabi', img: 'raha-apt-water', alt: 'View from a balcony over a canal and apartment buildings in Al Raha Beach', line: 'Apartments beside the canals of Al Raha Beach, and new off-plan at Al Seef.' },
    { key: 'reem', n: 'Al Reem Island', ar: 'جزيرة الريم', city: 'Abu Dhabi', img: 'reem-living', alt: 'Furnished apartment living room on Al Reem Island', line: 'Apartments in the towers of Marina Square.', weak: true },
    { key: 'khalifa', n: 'Khalifa City', ar: 'مدينة خليفة', city: 'Abu Dhabi', img: 'khalifa-sunset', alt: 'Developer render: townhouse terraces across a park at sunset', line: 'Townhouse communities, including new off-plan.', render: true },
    { key: 'khalidiya', n: 'Al Khalidiya', ar: 'الخالدية', city: 'Abu Dhabi', img: 'khalidiya-villa', alt: 'Villa street beside a mosque in Al Khalidiya', line: 'An established city district of villas and apartments.' },
    { key: 'reef', n: 'Al Reef Downtown', ar: 'الريف', city: 'Abu Dhabi', img: 'reef-balcony', alt: 'Mid-rise apartment buildings around a lawn in Al Reef Downtown', line: 'Mid-rise apartment buildings around shared lawns.', small: true },
    { key: 'riyad', n: 'Madinat Al Riyad', ar: 'مدينة الرياض', city: 'Abu Dhabi', img: 'riyad-villa', alt: 'New villa with a paved forecourt in Madinat Al Riyad', line: 'New family villas on large plots.', small: true },
    { key: 'bb', n: 'Business Bay', ar: 'الخليج التجاري', city: 'Dubai', img: 'aquarise-render', alt: 'Developer render: a curved residential tower in Business Bay', line: 'Two off-plan towers: Binghatti Aquarise and Bayz 102.', render: true },
    { key: 'ds', n: 'Dubai South', ar: 'دبي الجنوب', city: 'Dubai', img: 'venice-render', alt: 'Developer render: apartment towers around a lagoon in Dubai South', line: 'Azizi Venice, an off-plan lagoon community.', render: true }
  ];

  /* Geography: stylised Abu Dhabi from 02.5c (approximate, not for navigation). viewBox 0 0 1040 760. */
  var GEO = {
    land: {
      island: 'M70 318 C95 272 160 252 230 240 C300 228 360 222 410 236 C470 252 520 292 566 338 C602 374 628 410 618 436 C596 452 540 446 470 434 C390 420 300 408 220 392 C150 378 92 360 70 318 Z',
      reem: 'M430 196 C462 180 516 182 548 204 C566 222 556 250 530 260 C496 270 456 262 436 242 C424 228 422 208 430 196 Z',
      saadiyat: 'M552 118 C600 92 680 84 742 100 C770 110 772 140 748 158 C708 182 640 188 590 176 C556 166 538 140 552 118 Z',
      yas: 'M786 158 C812 136 862 134 900 152 C930 170 934 214 914 244 C892 270 846 278 812 262 C786 246 774 206 786 158 Z',
      hud: 'M150 420 C170 408 214 410 230 424 C226 440 190 448 160 440 C148 434 146 426 150 420 Z',
      main: 'M-40 520 C90 506 170 494 250 488 C340 482 420 482 500 476 C570 470 620 456 652 430 C690 400 730 378 780 356 C840 330 920 306 1040 288 L1500 270 L1500 1200 L-500 1200 L-500 530 Z'
    },
    comm: {
      'Al Khalidiya': { c: [150, 316], d: 'M118 300 L176 290 L184 328 L124 338 Z' },
      'Al Reem Island': { c: [492, 226], d: 'M452 206 C478 194 520 196 538 212 C546 232 532 248 506 252 C480 256 458 246 450 230 Z' },
      'Saadiyat Island': { c: [652, 138], d: 'M572 126 C610 106 676 100 728 112 C748 120 746 140 728 152 C694 170 636 174 596 166 C574 158 564 140 572 126 Z' },
      'Yas Island': { c: [856, 206], d: 'M800 168 C822 150 864 148 892 162 C914 178 916 212 902 236 C884 258 848 264 822 252 C800 238 792 200 800 168 Z' },
      'Al Raha': { c: [804, 370], d: 'M738 384 C760 368 800 354 846 342 L866 338 L874 370 C836 382 790 396 750 406 Z' },
      'Khalifa City': { c: [806, 462], d: 'M732 428 C780 420 836 414 872 418 L884 496 C838 506 780 510 742 508 Z' },
      'Masdar City': { c: [918, 452], d: 'M898 434 L940 430 L944 470 L902 474 Z' },
      'Al Reef Downtown': { c: [960, 344], d: 'M936 326 L982 320 L988 362 L942 368 Z' },
      'Mohammed Bin Zayed City': { c: [606, 556], d: 'M540 524 C590 516 640 514 664 520 L672 590 C620 598 572 600 548 594 Z' },
      'Madinat Al Riyad': { c: [612, 656], d: 'M552 630 L672 624 L678 682 L556 688 Z' }
    },
    roads: [
      'M300 238 C390 204 480 166 560 142 C640 120 700 112 744 122 C772 130 790 146 806 168 C840 200 872 226 884 256 C894 284 888 312 876 340 C866 380 860 420 862 470 C864 560 860 640 858 720',
      'M150 330 C270 348 420 374 540 404 C590 416 626 430 660 440 C730 430 810 416 890 400 C940 390 990 382 1040 376',
      'M-40 540 C120 524 300 512 470 506 C600 500 720 490 800 486 C900 482 970 476 1040 470'
    ],
    minor: ['M210 250 C240 300 260 350 280 396', 'M330 232 C350 300 370 360 392 414', 'M450 248 C462 300 480 360 504 426', 'M120 300 C250 290 380 290 520 306', 'M610 434 C612 470 608 510 606 600', 'M736 470 C800 466 860 462 930 456', 'M944 360 C948 400 946 430 940 452'],
    water: [['Arabian Gulf', 120, 120]]
  };

  /* Yas Island, public landmarks on the island (names only; no distances or times). Editorial to verify. */
  var YAS_PLACES = [
    ['Yas Marina Circuit', 'Motorsport'], ['Ferrari World Abu Dhabi', 'Theme park'], ['Yas Waterworld', 'Water park'],
    ['Warner Bros. World Abu Dhabi', 'Theme park'], ['SeaWorld Yas Island', 'Marine park'], ['Yas Mall', 'Shopping'], ['Etihad Arena', 'Events'], ['Yas Links', 'Golf']
  ];

  window.AA = { L: L, ALT: ALT, PROJECTS: PROJECTS, DEVS: DEVS, AREAS: AREAS, GEO: GEO, YAS_PLACES: YAS_PLACES, amenities: amenities };
})();
