let cart = JSON.parse(localStorage.getItem('scentora_cart')) || [];
let activeDiscount = 0;
let activePromoCode = '';

// Pull live inventory from Admin changes first, falling back to your team's products.js
function getCatalog() {
  const saved = JSON.parse(localStorage.getItem('scentora_products'));
  if (saved && saved.length > 0) return saved;
  return typeof products !== 'undefined' ? products : [];
}

function saveAndRender() {
  localStorage.setItem('scentora_cart', JSON.stringify(cart));
  renderCart();
  renderRecommendations();
}

function addSuggestedItem(productId) {
  const catalog = getCatalog();
  const product = catalog.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId || item.name === product.name);
  if (existing) {
    const updated = (existing.qty || existing.quantity || 1) + 1;
    existing.qty = updated;
    existing.quantity = updated;
  } else {
    cart.push({
      ...product,
      qty: 1,
      quantity: 1
    });
  }
  saveAndRender();
}

function updateQty(index, change) {
  const current = cart[index].qty || cart[index].quantity || 1;
  const updated = current + change;
  if (updated <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty = updated;
    cart[index].quantity = updated;
  }
  saveAndRender();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveAndRender();
}

document.getElementById('clear-cart-btn').addEventListener('click', () => {
  cart = [];
  activeDiscount = 0;
  activePromoCode = '';
  document.getElementById('promo-msg').innerText = '';
  saveAndRender();
});

document.getElementById('apply-promo-btn').addEventListener('click', () => {
  const codeInput = document.getElementById('promo-input').value.trim().toUpperCase();
  const promoMsg = document.getElementById('promo-msg');
  const offers = JSON.parse(localStorage.getItem('scentora_offers')) || [
    { code: 'SCENT15', discount: 15 },
    { code: 'LUXURY25', discount: 25 }
  ];

  const matched = offers.find(o => o.code === codeInput);
  if (matched) {
    activeDiscount = matched.discount;
    activePromoCode = matched.code;
    promoMsg.innerText = `Code "${matched.code}" applied (${matched.discount}% OFF)!`;
    promoMsg.style.color = '#2e7d32';
  } else {
    activeDiscount = 0;
    activePromoCode = '';
    promoMsg.innerText = 'Invalid promo code. Check active offers in Admin.';
    promoMsg.style.color = '#a93226';
  }
  renderCart();
});

// Press Enter inside any Delivery Details box to move to the next field (or submit on the last one)
const checkoutInputs = Array.from(document.querySelectorAll('#checkout-form input'));
checkoutInputs.forEach((input, idx) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (idx < checkoutInputs.length - 1) {
        checkoutInputs[idx + 1].focus();
      } else {
        document.getElementById('checkout-form').requestSubmit();
      }
    }
  });
});

function renderCart() {
  const list = document.getElementById('cart-items-list');
  const countEl = document.getElementById('item-count');
  list.innerHTML = '';

  let subtotal = 0;
  let totalItems = 0;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty-bag">
        <p>Your Scentora shopping bag is currently empty.</p>
      </div>
    `;
  }

  cart.forEach((item, index) => {
    const qty = item.qty || item.quantity || 1;
    const itemTotal = item.price * qty;
    subtotal += itemTotal;
    totalItems += qty;

    list.innerHTML += `
      <div class="cart-item">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p class="item-meta">${item.category || 'Signature Fragrance'} · ${item.price.toLocaleString()} EGP each</p>
        </div>

        <div class="qty-controls">
          <button type="button" onclick="updateQty(${index}, -1)">−</button>
          <span>${qty}</span>
          <button type="button" onclick="updateQty(${index}, 1)">+</button>
        </div>

        <div class="item-price-block">
          <div class="item-subtotal">${itemTotal.toLocaleString()} EGP</div>
          <button type="button" class="btn-remove" onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  const discountVal = Math.round(subtotal * (activeDiscount / 100));
  const shipping = subtotal > 0 ? 75 : 0;
  const total = Math.max(0, subtotal - discountVal + shipping);

  countEl.innerText = totalItems;
  document.getElementById('subtotal').innerText = `${subtotal.toLocaleString()} EGP`;
  document.getElementById('shipping').innerText = `${shipping.toLocaleString()} EGP`;
  document.getElementById('total').innerText = `${total.toLocaleString()} EGP`;

  const discountRow = document.getElementById('discount-row');
  if (activeDiscount > 0 && subtotal > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('discount-label').innerText = activePromoCode;
    document.getElementById('discount-amount').innerText = `-${discountVal.toLocaleString()} EGP`;
  } else {
    discountRow.style.display = 'none';
  }
}

function renderRecommendations() {
  const grid = document.getElementById('recommendations-grid');
  const wrapper = document.getElementById('recommendations-wrapper');
  const catalog = getCatalog();

  const suggestions = catalog
    .filter(prod => !cart.some(item => item.id === prod.id || item.name === prod.name))
    .slice(0, 3);

  if (suggestions.length === 0) {
    wrapper.style.display = 'none';
    return;
  }

  wrapper.style.display = 'block';
  grid.innerHTML = '';

  suggestions.forEach(prod => {
    grid.innerHTML += `
      <div class="rec-card">
        <img src="${prod.image}" alt="${prod.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x300/f4ede2/75563f?text=Scentora';">
        <div class="rec-info">
          <span class="rec-cat">${prod.category}</span>
          <h4>${prod.name}</h4>
          <p class="rec-price">${prod.price.toLocaleString()} EGP</p>
        </div>
        <button type="button" class="rec-add-btn" onclick="addSuggestedItem(${prod.id})">+ Add to Bag</button>
      </div>
    `;
  });
}

document.getElementById('checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('error-msg');

  const nameInput = document.getElementById('cust-name');
  const emailInput = document.getElementById('cust-email');
  const phoneInput = document.getElementById('cust-phone');
  const addressInput = document.getElementById('cust-address');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  errorEl.innerText = '';

  if (cart.length === 0) {
    errorEl.innerText = 'Your bag is empty. Add a perfume before checking out.';
    return;
  }
  if (name.length < 3) {
    errorEl.innerText = 'Please enter your full name.';
    nameInput.focus();
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    errorEl.innerText = 'Please enter a valid email address.';
    emailInput.focus();
    return;
  }
  if (phone.length < 8) {
    errorEl.innerText = 'Please enter a valid phone number.';
    phoneInput.focus();
    return;
  }
  if (address.length < 5) {
    errorEl.innerText = 'Please enter your full delivery address.';
    addressInput.focus();
    return;
  }

  const orderSummary = {
    orderNumber: '#SCN-' + Math.floor(1000 + Math.random() * 9000),
    name,
    email,
    address,
    itemsSummary: cart.map(i => `${i.name} (x${i.qty || i.quantity || 1})`).join(', '),
    total: document.getElementById('total').innerText
  };
  localStorage.setItem('scentora_last_order', JSON.stringify(orderSummary));

  cart = [];
  localStorage.setItem('scentora_cart', JSON.stringify(cart));
  window.location.href = 'order-confirmation.html';
});

renderCart();
renderRecommendations();