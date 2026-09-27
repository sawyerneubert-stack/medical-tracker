/*
 * Product catalog. To replace a photo, overwrite the file in images/products/
 * (keep the name) or change the paths in `images`. Square images, about
 * 1000×1000, work best.
 *
 * Optional: give a watch a choice customers must pick before adding it to the
 * cart, e.g.  options: { label: "Strap Color", values: ["Black", "Brown"] },
 */
window.CATEGORIES = [
  { id: "classic", name: "Classic", image: "images/products/classic-heritage-1.jpg" },
  { id: "sport", name: "Sport", image: "images/products/sport-apex-diver-1.jpg" },
  { id: "luxury", name: "Luxury", image: "images/products/luxury-sovereign-1.jpg" },
  { id: "minimalist", name: "Minimalist", image: "images/products/minimal-onyx-1.jpg" },
];

const photos = (slug) => [1, 2, 3].map((n) => `images/products/${slug}-${n}.jpg`);

window.PRODUCTS = [
  {
    id: "heritage-classic",
    name: "Heritage Classic",
    category: "classic",
    price: 89,
    compareAt: 119,
    badge: "Bestseller",
    images: photos("classic-heritage"),
    description: "A timeless gold-tone dress watch with a cream dial and rich brown leather strap. The watch that goes with everything.",
    details: ["40 mm gold-tone stainless steel case", "Japanese quartz movement", "Genuine leather strap, 20 mm", "Date window · 3 ATM water resistant"],
  },
  {
    id: "meridian-steel",
    name: "Meridian Steel",
    category: "classic",
    price: 109,
    badge: "New",
    images: photos("classic-meridian"),
    description: "A deep navy sunburst dial set in polished stainless steel. Sharp enough for the office, easy enough for the weekend.",
    details: ["41 mm stainless steel case", "Japanese quartz movement", "Stainless steel link bracelet", "Date window · 5 ATM water resistant"],
  },
  {
    id: "apex-diver",
    name: "Apex Diver",
    category: "sport",
    price: 129,
    compareAt: 169,
    badge: "Bestseller",
    images: photos("sport-apex-diver"),
    description: "A bold dive-style watch with a rotating bezel, high-contrast markers and a comfortable rubber strap. Built for adventure.",
    details: ["42 mm stainless steel case", "Rotating unidirectional bezel", "Rubber strap, 22 mm", "10 ATM water resistant"],
  },
  {
    id: "voyager-chrono",
    name: "Voyager Chronograph",
    category: "sport",
    price: 139,
    images: photos("sport-voyager-chrono"),
    description: "A crisp white chronograph with three sub-dials and a solid steel bracelet. Precision you can see.",
    details: ["43 mm stainless steel case", "Quartz chronograph movement", "Stainless steel link bracelet", "5 ATM water resistant"],
  },
  {
    id: "sovereign-gold",
    name: "Sovereign Gold",
    category: "luxury",
    price: 169,
    compareAt: 229,
    badge: "Bestseller",
    images: photos("luxury-sovereign"),
    description: "Gold from bracelet to dial. A statement piece with a champagne sunburst face that catches every light in the room.",
    details: ["40 mm gold-tone stainless steel case", "Champagne sunburst dial", "Gold-tone link bracelet", "Date window · 5 ATM water resistant"],
  },
  {
    id: "noir-rose-chrono",
    name: "Noir Rose Chronograph",
    category: "luxury",
    price: 149,
    badge: "New",
    images: photos("luxury-noir-rose"),
    description: "Rose-gold tones against a jet-black dial and black leather strap. Dark, refined and impossible to overlook.",
    details: ["42 mm rose-gold-tone case", "Quartz chronograph movement", "Genuine leather strap, 22 mm", "3 ATM water resistant"],
  },
  {
    id: "nordic-mesh",
    name: "Nordic Mesh",
    category: "minimalist",
    price: 79,
    images: photos("minimal-nordic-mesh"),
    description: "An ultra-clean white dial with no numbers and a fine steel mesh strap. Scandinavian simplicity on your wrist.",
    details: ["38 mm ultra-slim steel case", "Japanese quartz movement", "Adjustable stainless steel mesh strap", "3 ATM water resistant"],
  },
  {
    id: "onyx-minimal",
    name: "Onyx Minimal",
    category: "minimalist",
    price: 85,
    compareAt: 110,
    images: photos("minimal-onyx"),
    description: "All black with subtle gold hands. Quietly confident, and just as good with a suit as a t-shirt.",
    details: ["40 mm black stainless steel case", "Japanese quartz movement", "Black leather strap, 20 mm", "3 ATM water resistant"],
  },
];
