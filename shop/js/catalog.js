/*
 * Product catalog. Prices are the 925 sterling silver base price; metal
 * upgrades add on top. Update these to match your supplier's costs + margin.
 *
 * art.type:  ring | studs | hoops | pendant | tennis
 * art.style: solitaire | halo | threestone | eternity | pave  (rings only)
 * art.shape: round | oval | emerald | pear
 */
window.METALS = [
  { id: "s925", label: "925 Sterling Silver", add: 0 },
  { id: "10k", label: "10K Solid Gold", add: 280 },
  { id: "14k", label: "14K Solid Gold", add: 460 },
];

window.TONES = [
  { id: "white", label: "White" },
  { id: "yellow", label: "Yellow" },
  { id: "rose", label: "Rose" },
];

window.RING_SIZES = ["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11"];

window.CATEGORIES = [
  { id: "all", label: "All" },
  { id: "rings", label: "Rings" },
  { id: "earrings", label: "Earrings" },
  { id: "necklaces", label: "Necklaces" },
  { id: "bracelets", label: "Bracelets" },
];

window.PRODUCTS = [
  {
    id: "orbit-solitaire",
    name: "Orbit Solitaire",
    category: "rings",
    price: 289,
    compareAt: 389,
    badge: "Bestseller",
    carat: "1.0 ct",
    art: { type: "ring", style: "solitaire", shape: "round" },
    blurb: "A single round brilliant held high in six claws — the ring that started it all.",
    details: ["1.0 ct round brilliant moissanite, D colour, VVS1", "Six-claw cathedral setting", "1.8 mm comfort-fit band"],
  },
  {
    id: "corona-halo",
    name: "Corona Halo",
    category: "rings",
    price: 349,
    compareAt: 469,
    badge: "New",
    carat: "1.5 ct total",
    art: { type: "ring", style: "halo", shape: "round" },
    blurb: "A round centre stone ringed in micro-pavé, like a sun during eclipse.",
    details: ["1.0 ct centre + 0.5 ct halo", "Micro-pavé halo", "D colour, VVS1 clarity"],
  },
  {
    id: "comet-oval",
    name: "Comet Oval",
    category: "rings",
    price: 319,
    carat: "1.5 ct",
    art: { type: "ring", style: "solitaire", shape: "oval" },
    blurb: "An elongated oval that makes the finger look longer and the fire look bigger.",
    details: ["1.5 ct oval moissanite, D colour, VVS1", "Four-claw basket setting", "Hidden halo under the stone"],
  },
  {
    id: "trinity-emerald",
    name: "Trinity Emerald",
    category: "rings",
    price: 429,
    compareAt: 529,
    carat: "2.2 ct total",
    art: { type: "ring", style: "threestone", shape: "emerald" },
    blurb: "Past, present, future — a step-cut centre flanked by two companion stones.",
    details: ["1.5 ct emerald-cut centre", "Two 0.35 ct side stones", "Art-deco step facets"],
  },
  {
    id: "meteor-pear",
    name: "Meteor Pear",
    category: "rings",
    price: 339,
    carat: "1.2 ct",
    art: { type: "ring", style: "solitaire", shape: "pear" },
    blurb: "A teardrop of light with a streaking tail — our most-asked-about silhouette.",
    details: ["1.2 ct pear moissanite, D colour, VVS1", "V-tip protective prong", "Knife-edge band"],
  },
  {
    id: "milky-way-eternity",
    name: "Milky Way Eternity",
    category: "rings",
    price: 259,
    carat: "2.0 ct total",
    art: { type: "ring", style: "eternity", shape: "round" },
    blurb: "Stones all the way around. Wear it alone or stack it under a solitaire.",
    details: ["Full-circle shared-prong setting", "2.0 ct total weight", "Stacks with every Astraea ring"],
  },
  {
    id: "stardust-pave-band",
    name: "Stardust Pavé Band",
    category: "rings",
    price: 179,
    carat: "0.5 ct total",
    art: { type: "ring", style: "pave", shape: "round" },
    blurb: "A slim band dusted in tiny stones — the perfect wedding or stacking band.",
    details: ["Half-eternity micro-pavé", "0.5 ct total weight", "1.6 mm width"],
  },
  {
    id: "twin-star-studs",
    name: "Twin Star Studs",
    category: "earrings",
    price: 199,
    compareAt: 259,
    badge: "Bestseller",
    carat: "2.0 ct total",
    art: { type: "studs", shape: "round" },
    blurb: "Two 1-carat round brilliants. The everyday earrings you'll never take off.",
    details: ["2 × 1.0 ct round brilliant", "Four-claw martini setting", "Screw-back posts"],
  },
  {
    id: "nebula-hoops",
    name: "Nebula Hoops",
    category: "earrings",
    price: 229,
    carat: "1.4 ct total",
    art: { type: "hoops", shape: "round" },
    blurb: "Inside-out huggie hoops set with stones that catch light from every angle.",
    details: ["18 mm diameter", "Inside-out channel setting", "Hinged snap closure"],
  },
  {
    id: "polaris-pendant",
    name: "Polaris Pendant",
    category: "necklaces",
    price: 219,
    carat: "1.0 ct",
    art: { type: "pendant", shape: "round" },
    blurb: "A single star on a fine cable chain. Your north star, literally.",
    details: ["1.0 ct round brilliant", "Adjustable 16–18\" cable chain", "Sliding bail"],
  },
  {
    id: "teardrop-pendant",
    name: "Falling Star Pendant",
    category: "necklaces",
    price: 249,
    badge: "New",
    carat: "1.5 ct",
    art: { type: "pendant", shape: "pear" },
    blurb: "A pear-cut drop suspended mid-fall. Pairs beautifully with the Meteor Pear ring.",
    details: ["1.5 ct pear moissanite", "Adjustable 16–18\" chain", "Three-claw setting"],
  },
  {
    id: "constellation-tennis",
    name: "Constellation Tennis Bracelet",
    category: "bracelets",
    price: 459,
    compareAt: 599,
    badge: "Limited",
    carat: "7.0 ct total",
    art: { type: "tennis", shape: "round" },
    blurb: "A continuous line of matched 3 mm stones. Seven carats of pure fire.",
    details: ["7.0 ct total weight", "Four-prong box links", "Double-safety box clasp", "7\" length"],
  },
];
