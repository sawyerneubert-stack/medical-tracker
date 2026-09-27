/*
 * Product catalog.
 *
 * PHOTOS: each watch's photos live in images/products/ and are named
 * <name>-1.jpg, <name>-2.jpg, <name>-3.jpg ... The line
 *     images: photos("moissanite-iced-sovereign", 3),
 * means "use moissanite-iced-sovereign-1.jpg up to -3.jpg". To add a photo,
 * upload the next number (-4.jpg) and change the 3 to 4. Photo 1 is the main
 * one; photo 2 shows when shoppers hover. Square images (~1000×1000) work best.
 *
 * Optional: give a watch a choice customers must pick before adding it to the
 * cart, e.g.  options: { label: "Strap Color", values: ["Black", "Brown"] },
 */
window.CATEGORIES = [
  {
    id: "moissanite",
    name: "Moissanite Watches",
    blurb: "Hand-set with brilliant moissanite stones for sparkle that turns heads.",
    image: "images/products/moissanite-iced-sovereign-2.jpg",
  },
  {
    id: "classic",
    name: "Classic Watches",
    blurb: "Timeless everyday watches, from dress to dive.",
    image: "images/products/classic-meridian-2.jpg",
  },
];

const photos = (slug, count = 3) => Array.from({ length: count }, (_, i) => `images/products/${slug}-${i + 1}.jpg`);

window.PRODUCTS = [
  {
    id: "iced-sovereign",
    name: "Iced Sovereign",
    category: "moissanite",
    price: 349,
    compareAt: 449,
    badge: "Bestseller",
    images: photos("moissanite-iced-sovereign", 3),
    description: "Fully iced in gold: a moissanite-set bezel, stone hour markers and a stone-set bracelet. Maximum shine, from every angle.",
    details: ["40 mm gold-tone stainless steel case", "Moissanite-set bezel, markers and bracelet", "Japanese quartz movement", "3 ATM water resistant"],
  },
  {
    id: "frost-steel",
    name: "Frost Steel",
    category: "moissanite",
    price: 1500,
    badge: "New",
    images: photos("moissanite-frost-steel", 4),
    description: "An ice-blue dial framed by a ring of moissanite, on a stone-set steel bracelet. Cool, crisp and impossible to miss.",
    details: ["40 mm stainless steel case", "Moissanite-set bezel, markers and bracelet", "Japanese quartz movement", "3 ATM water resistant"],
  },
  {
    id: "rose-halo",
    name: "Rose Halo",
    category: "moissanite",
    price: 279,
    images: photos("moissanite-rose-halo", 3),
    description: "A soft blush dial with a halo of moissanite around the bezel, on a rose-gold-tone bracelet. Elegant sparkle for every day.",
    details: ["38 mm rose-gold-tone stainless steel case", "Moissanite-set bezel", "Japanese quartz movement · date window", "3 ATM water resistant"],
  },
  {
    id: "black-ice",
    name: "Black Ice",
    category: "moissanite",
    price: 299,
    compareAt: 379,
    badge: "Bestseller",
    images: photos("moissanite-black-ice", 3),
    description: "Stealth black case and dial set with bright moissanite, on a comfortable rubber strap. Bold, dark and brilliant.",
    details: ["42 mm black stainless steel case", "Moissanite-set bezel and markers", "Rubber strap, 22 mm", "5 ATM water resistant"],
  },
  {
    id: "heritage-classic",
    name: "Heritage Classic",
    category: "classic",
    price: 89,
    compareAt: 119,
    badge: "Bestseller",
    images: photos("classic-heritage", 3),
    description: "A timeless gold-tone dress watch with a cream dial and rich brown leather strap. The watch that goes with everything.",
    details: ["40 mm gold-tone stainless steel case", "Japanese quartz movement", "Genuine leather strap, 20 mm", "Date window · 3 ATM water resistant"],
  },
  {
    id: "meridian-steel",
    name: "Meridian Steel",
    category: "classic",
    price: 109,
    badge: "New",
    images: photos("classic-meridian", 3),
    description: "A deep navy sunburst dial set in polished stainless steel. Sharp enough for the office, easy enough for the weekend.",
    details: ["41 mm stainless steel case", "Japanese quartz movement", "Stainless steel link bracelet", "Date window · 5 ATM water resistant"],
  },
  {
    id: "apex-diver",
    name: "Apex Diver",
    category: "classic",
    price: 129,
    compareAt: 169,
    badge: "Bestseller",
    images: photos("sport-apex-diver", 3),
    description: "A bold dive-style watch with a rotating bezel, high-contrast markers and a comfortable rubber strap. Built for adventure.",
    details: ["42 mm stainless steel case", "Rotating unidirectional bezel", "Rubber strap, 22 mm", "10 ATM water resistant"],
  },
  {
    id: "voyager-chrono",
    name: "Voyager Chronograph",
    category: "classic",
    price: 139,
    images: photos("sport-voyager-chrono", 3),
    description: "A crisp white chronograph with three sub-dials and a solid steel bracelet. Precision you can see.",
    details: ["43 mm stainless steel case", "Quartz chronograph movement", "Stainless steel link bracelet", "5 ATM water resistant"],
  },
  {
    id: "sovereign-gold",
    name: "Sovereign Gold",
    category: "classic",
    price: 169,
    compareAt: 229,
    badge: "Bestseller",
    images: photos("luxury-sovereign", 3),
    description: "Gold from bracelet to dial. A statement piece with a champagne sunburst face that catches every light in the room.",
    details: ["40 mm gold-tone stainless steel case", "Champagne sunburst dial", "Gold-tone link bracelet", "Date window · 5 ATM water resistant"],
  },
  {
    id: "noir-rose-chrono",
    name: "Noir Rose Chronograph",
    category: "classic",
    price: 149,
    badge: "New",
    images: photos("luxury-noir-rose", 3),
    description: "Rose-gold tones against a jet-black dial and black leather strap. Dark, refined and impossible to overlook.",
    details: ["42 mm rose-gold-tone case", "Quartz chronograph movement", "Genuine leather strap, 22 mm", "3 ATM water resistant"],
  },
  {
    id: "nordic-mesh",
    name: "Nordic Mesh",
    category: "classic",
    price: 79,
    images: photos("minimal-nordic-mesh", 3),
    description: "An ultra-clean white dial with no numbers and a fine steel mesh strap. Scandinavian simplicity on your wrist.",
    details: ["38 mm ultra-slim steel case", "Japanese quartz movement", "Adjustable stainless steel mesh strap", "3 ATM water resistant"],
  },
  {
    id: "onyx-minimal",
    name: "Onyx Minimal",
    category: "classic",
    price: 85,
    compareAt: 110,
    images: photos("minimal-onyx", 3),
    description: "All black with subtle gold hands. Quietly confident, and just as good with a suit as a t-shirt.",
    details: ["40 mm black stainless steel case", "Japanese quartz movement", "Black leather strap, 20 mm", "3 ATM water resistant"],
  },
];
