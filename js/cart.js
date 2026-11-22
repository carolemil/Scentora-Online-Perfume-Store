let cart = JSON.parse(localStorage.getItem('scentora_cart')) || [];
let activeDiscount = 0;
let activePromoCode = '';

function saveAndRender() {
  localStorage.setItem('scentora_cart', JSON.stringify(cart));
  renderCart();
}

function addDemoItem(id, name, price, category = 'Unisex') {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, category, qty: 1 });
  }
  saveAndRender();
}

function updateQty(index, change) {
  cart[index].qty += change;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
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

document.getElementById('checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('error-msg');
  const successEl = document.getElementById('success-msg');

  const name = document.getElementById('cust-name').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();

  errorEl.innerText = '';
  successEl.innerText = '';

  if (cart.length === 0) {
    errorEl.innerText = 'Your bag is empty. Add a perfume before checking out.';
    return;
  }
  if (name.length < 3) {
    errorEl.innerText = 'Please enter your full name.';
    return;
  }
  if (!email.includes('@') || !email.includes('.')) {
    errorEl.innerText = 'Please enter a valid email address.';
    return;
  }
  if (phone.length < 8) {
    errorEl.innerText = 'Please enter a valid phone number.';
    return;
  }
  if (address.length < 5) {
    errorEl.innerText = 'Please enter your full delivery address.';
    return;
  }

  successEl.innerText = `Thank you, ${name}! Your Scentora order has been confirmed.`;
  cart = [];
  activeDiscount = 0;
  activePromoCode = '';
  document.getElementById('promo-msg').innerText = '';
  saveAndRender();
  e.target.reset();
});

renderCart();