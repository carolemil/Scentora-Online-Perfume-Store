const OVERRIDES_KEY = "scentora_admin_overrides";

const defaultOffers = [
  { code: "SCENT15", discount: 15, desc: "Welcome 15% Off" },
  { code: "LUXURY25", discount: 25, desc: "Selected Fragrances Special" }
];

localStorage.removeItem("scentora_products");

// Seed default promo codes on first load
if (!localStorage.getItem("scentora_offers")) {
  localStorage.setItem("scentora_offers", JSON.stringify(defaultOffers));
}

function safeParse(raw) {
  try {
    return JSON.parse(raw || "null");
  } catch {
    return null;
  }
}

// Calculates total active products (base catalog + admin additions - deleted items)
function getLiveFragranceCount() {
  const rawBase =
    (typeof products !== "undefined" && Array.isArray(products)) ? products :
    Array.isArray(window.products) ? window.products :
    Array.isArray(window.perfumes) ? window.perfumes : [];

  const saved = safeParse(localStorage.getItem(OVERRIDES_KEY));
  const added = Array.isArray(saved?.added) ? saved.added : [];
  const deletedIds = Array.isArray(saved?.deletedIds) ? saved.deletedIds.map(String) : [];

  const activeBase = rawBase.filter((p, idx) => !deletedIds.includes(String(p.id ?? idx + 1)));
  const activeAdded = added.filter((p, idx) => !deletedIds.includes(String(p.id ?? idx + 1)));

  return activeBase.length + activeAdded.length;
}

function updateStats() {
  const offers = safeParse(localStorage.getItem("scentora_offers")) || [];

  const prodCountEl = document.getElementById("total-products-count");
  const offerCountEl = document.getElementById("active-offers-count");
  const orderCountEl = document.getElementById("active-orders-count");

  if (prodCountEl) prodCountEl.innerText = getLiveFragranceCount();
  if (offerCountEl) offerCountEl.innerText = offers.length;
  if (orderCountEl) orderCountEl.innerText = localStorage.getItem("scentoraActiveOrders") || "0";
}

// Sync dashboard counts when returning to the tab or when another tab updates localStorage
window.addEventListener("focus", updateStats);
window.addEventListener("storage", updateStats);

updateStats();