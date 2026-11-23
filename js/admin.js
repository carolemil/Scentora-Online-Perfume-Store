const defaultCatalog = [
  { id: 1, name: "Vanilla Dream", category: "Women", price: 2500, oldPrice: 3000, discount: 17, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
  { id: 2, name: "Oud Royal", category: "Men", price: 3200, oldPrice: 3800, discount: 16, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600" },
  { id: 3, name: "Rose Elegance", category: "Women", price: 1800, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600" },
  { id: 4, name: "Midnight Noir", category: "Men", price: 2900, oldPrice: 3500, discount: 17, image: "https://cdn.shopify.com/s/files/1/0770/9389/6502/files/black-perfume-bottle-on-a-dark-background_1024x1024.webp?v=1728330852" },
  { id: 5, name: "Golden Amber", category: "Unisex", price: 2700, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600" },
  { id: 6, name: "Blooming Jasmine", category: "Women", price: 1500, oldPrice: 2000, discount: 25, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600" },
  { id: 7, name: "Ocean Breeze", category: "Men", price: 2100, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
  { id: 8, name: "White Musk", category: "Unisex", price: 1900, oldPrice: 2400, discount: 21, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600" }
];

const defaultOffers = [
  { code: "SCENT15", discount: 15, desc: "Welcome 15% Off" },
  { code: "LUXURY25", discount: 25, desc: "Selected Fragrances Special" }
];

// Ensure storage is seeded so admin-shops.html, shops.html, and admin-offers.html share the exact same data
if (!localStorage.getItem("scentora_products")) {
  localStorage.setItem("scentora_products", JSON.stringify(defaultCatalog));
}
if (!localStorage.getItem("scentora_offers")) {
  localStorage.setItem("scentora_offers", JSON.stringify(defaultOffers));
}

function updateStats() {
  const products = JSON.parse(localStorage.getItem("scentora_products")) || [];
  const offers = JSON.parse(localStorage.getItem("scentora_offers")) || [];

  const prodCountEl = document.getElementById("total-products-count");
  const offerCountEl = document.getElementById("active-offers-count");

  if (prodCountEl) prodCountEl.innerText = products.length;
  if (offerCountEl) offerCountEl.innerText = offers.length;
}

// Keep counts synced automatically when returning from admin-shops
// .html or admin-offers.html
window.addEventListener("focus", updateStats);
window.addEventListener("storage", updateStats);

updateStats();