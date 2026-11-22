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

let products = JSON.parse(localStorage.getItem('scentora_products')) || [...defaultCatalog];

let offers = JSON.parse(localStorage.getItem('scentora_offers')) || [
  { code: 'SCENT15', discount: 15, desc: 'Welcome 15% Off' },
  { code: 'LUXURY25', discount: 25, desc: 'Selected Fragrances Special' }
];

function updateStats() {
  document.getElementById('total-products-count').innerText = products.length;
  document.getElementById('active-offers-count').innerText = offers.length;
}

function renderProducts() {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  products.forEach((prod, index) => {
    const discountBadge = prod.discount > 0 ? `<span class="badge">${prod.discount}% OFF</span>` : '';
    const oldPriceText = prod.oldPrice > 0 ? `<s style="opacity:0.6">${prod.oldPrice.toLocaleString()} EGP</s> → ` : '';

    list.innerHTML += `
      <div class="item-card">
        <div>
          <strong>${prod.name}</strong><span class="badge">${prod.category}</span>${discountBadge}
          <small>${oldPriceText}${prod.price.toLocaleString()} EGP</small>
        </div>
        <div class="actions">
          <button type="button" onclick="editProduct(${index})">Edit</button>
          <button type="button" class="btn-del" onclick="deleteProduct(${index})">Delete</button>
        </div>
      </div>
    `;
  });

  updateStats();
}

document.getElementById('product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('prod-category').value;
  const price = Number(document.getElementById('prod-price').value);
  const oldPrice = Number(document.getElementById('prod-old-price').value) || 0;
  const image = document.getElementById('prod-image').value.trim() || "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600";
  const editIndex = Number(document.getElementById('edit-index').value);

  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  if (editIndex === -1) {
    products.push({ id: Date.now(), name, category, price, oldPrice, discount, image });
  } else {
    products[editIndex] = { ...products[editIndex], name, category, price, oldPrice, discount, image };
    resetProductForm();
  }

  localStorage.setItem('scentora_products', JSON.stringify(products));
  e.target.reset();
  renderProducts();
});

function editProduct(index) {
  const prod = products[index];
  document.getElementById('prod-name').value = prod.name;
  document.getElementById('prod-category').value = prod.category;
  document.getElementById('prod-price').value = prod.price;
  document.getElementById('prod-old-price').value = prod.oldPrice || '';
  document.getElementById('prod-image').value = prod.image || '';
  document.getElementById('edit-index').value = index;
  document.getElementById('form-title').innerText = 'Edit Fragrance';
  document.getElementById('save-prod-btn').innerText = 'Update Fragrance';
  document.getElementById('cancel-edit-btn').style.display = 'inline-block';
}

function resetProductForm() {
  document.getElementById('edit-index').value = -1;
  document.getElementById('form-title').innerText = 'Add New Fragrance';
  document.getElementById('save-prod-btn').innerText = 'Save Fragrance';
  document.getElementById('cancel-edit-btn').style.display = 'none';
  document.getElementById('product-form').reset();
}

document.getElementById('cancel-edit-btn').addEventListener('click', resetProductForm);

document.getElementById('reset-catalog-btn').addEventListener('click', () => {
  products = [...defaultCatalog];
  localStorage.setItem('scentora_products', JSON.stringify(products));
  renderProducts();
});

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem('scentora_products', JSON.stringify(products));
  renderProducts();
}

function renderOffers() {
  const list = document.getElementById('offer-list');
  list.innerHTML = '';

  offers.forEach((offer, index) => {
    list.innerHTML += `
      <div class="item-card">
        <div>
          <strong>${offer.code}</strong><span class="badge">${offer.discount}% OFF</span>
          <small>${offer.desc || 'Storewide Offer'}</small>
        </div>
        <div class="actions">
          <button type="button" class="btn-del" onclick="deleteOffer(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  updateStats();
}

document.getElementById('offer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.getElementById('offer-code').value.trim().toUpperCase();
  const discount = Number(document.getElementById('offer-discount').value);
  const desc = document.getElementById('offer-desc').value.trim();

  offers.push({ code, discount, desc });
  localStorage.setItem('scentora_offers', JSON.stringify(offers));
  e.target.reset();
  renderOffers();
});

function deleteOffer(index) {
  offers.splice(index, 1);
  localStorage.setItem('scentora_offers', JSON.stringify(offers));
  renderOffers();
}

renderProducts();
renderOffers();