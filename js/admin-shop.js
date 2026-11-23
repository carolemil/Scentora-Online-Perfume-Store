const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll(".category-btn");
const noProducts = document.getElementById("noProducts");

const editModalOverlay = document.getElementById("editModalOverlay");
const adminShopForm = document.getElementById("adminShopForm");

const defaultCatalog = typeof products !== "undefined" ? products : [
  { id: 1, name: "Vanilla Dream", category: "Women", price: 2500, oldPrice: 3000, discount: 17, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
  { id: 2, name: "Oud Royal", category: "Men", price: 3200, oldPrice: 3800, discount: 16, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600" },
  { id: 3, name: "Rose Elegance", category: "Women", price: 1800, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600" },
  { id: 4, name: "Midnight Noir", category: "Men", price: 2900, oldPrice: 3500, discount: 17, image: "https://cdn.shopify.com/s/files/1/0770/9389/6502/files/black-perfume-bottle-on-a-dark-background_1024x1024.webp?v=1728330852" },
  { id: 5, name: "Golden Amber", category: "Unisex", price: 2700, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600" },
  { id: 6, name: "Blooming Jasmine", category: "Women", price: 1500, oldPrice: 2000, discount: 25, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600" },
  { id: 7, name: "Ocean Breeze", category: "Men", price: 2100, oldPrice: 0, discount: 0, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
  { id: 8, name: "White Musk", category: "Unisex", price: 1900, oldPrice: 2400, discount: 21, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600" }
];

let selectedCategory = "All";
let storeProducts = JSON.parse(localStorage.getItem("scentora_products")) || [...defaultCatalog];

if (!localStorage.getItem("scentora_products")) {
    localStorage.setItem("scentora_products", JSON.stringify(storeProducts));
}

// Render product cards with "Click to Edit Fragrance" button
function displayAdminProducts(productList) {
    productsGrid.innerHTML = "";
    noProducts.hidden = productList.length !== 0;

    productList.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const image = document.createElement("img");
        image.className = "product-image";
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";
        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/600x600/f4ede2/75563f?text=Perfume";
        };
        card.appendChild(image);

        if (product.discount > 0) {
            const badge = document.createElement("span");
            badge.className = "discount-badge";
            badge.textContent = `${product.discount}% OFF`;
            card.appendChild(badge);
        }

        // Delete icon button on top right
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-card-btn";
        deleteBtn.title = "Delete Fragrance";
        deleteBtn.innerHTML = "✕";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteFragrance(product.id, product.name);
        });
        card.appendChild(deleteBtn);

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        const price = document.createElement("p");
        price.className = "product-price";

        if (product.oldPrice > product.price) {
            price.innerHTML =
                `<span class="old-price">${product.oldPrice.toLocaleString()} EGP</span>
                ${product.price.toLocaleString()} EGP`;
        } else {
            price.textContent = `${product.price.toLocaleString()} EGP`;
        }

        // Replaces "Add to Cart" with "Click to Edit Fragrance"
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "add-cart-btn";
        editButton.textContent = "Click to Edit Fragrance";
        editButton.addEventListener("click", () => openEditModal(product));

        info.appendChild(name);
        info.appendChild(category);
        info.appendChild(price);
        info.appendChild(editButton);

        card.appendChild(info);
        productsGrid.appendChild(card);
    });
}

// Filter & Sort
function filterProducts() {
    let filtered = [...storeProducts];

    if (selectedCategory === "Offers") {
        filtered = filtered.filter(p => p.discount > 0);
    } else if (selectedCategory !== "All") {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }

    const searchText = searchInput.value.toLowerCase().trim();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText));

    const sortValue = sortSelect.value;
    if (sortValue === "low-high") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    }

    displayAdminProducts(filtered);
}

categoryButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        categoryButtons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        selectedCategory = this.dataset.category;
        filterProducts();
    });
});

searchInput.addEventListener("input", filterProducts);
sortSelect.addEventListener("change", filterProducts);

// Open Modal (for Editing or Adding)
function openEditModal(product = null) {
    const heading = document.getElementById("modalHeading");
    const idField = document.getElementById("editProductId");

    if (product) {
        heading.textContent = "Edit Fragrance";
        idField.value = product.id;
        document.getElementById("editName").value = product.name;
        document.getElementById("editCategory").value = product.category;
        document.getElementById("editPrice").value = product.price;
        document.getElementById("editOldPrice").value = product.oldPrice || "";
        document.getElementById("editImage").value = product.image || "";
    } else {
        heading.textContent = "Add New Fragrance";
        idField.value = "";
        adminShopForm.reset();
    }

    editModalOverlay.classList.add("show");
}

function closeEditModal() {
    editModalOverlay.classList.remove("show");
}

function deleteFragrance(id, name) {
    if (!confirm(`Delete "${name}" from the store?`)) return;
    storeProducts = storeProducts.filter(p => p.id !== id);
    localStorage.setItem("scentora_products", JSON.stringify(storeProducts));
    filterProducts();
}

// Modal Event Listeners
document.getElementById("addFragranceBtn").addEventListener("click", () => openEditModal(null));
document.getElementById("closeEditModal").addEventListener("click", closeEditModal);
document.getElementById("cancelEditModal").addEventListener("click", closeEditModal);

editModalOverlay.addEventListener("click", (e) => {
    if (e.target === editModalOverlay) closeEditModal();
});

document.getElementById("resetDefaultBtn").addEventListener("click", () => {
    if (!confirm("Reset catalog back to the default 8 fragrances?")) return;
    storeProducts = [...defaultCatalog];
    localStorage.setItem("scentora_products", JSON.stringify(storeProducts));
    filterProducts();
});

// Save Edits & Sync to localStorage
adminShopForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const idVal = document.getElementById("editProductId").value;
    const name = document.getElementById("editName").value.trim();
    const category = document.getElementById("editCategory").value;
    const price = Number(document.getElementById("editPrice").value);
    const oldPrice = Number(document.getElementById("editOldPrice").value) || 0;
    const image = document.getElementById("editImage").value.trim() || "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600";
    const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    if (idVal) {
        const index = storeProducts.findIndex(p => String(p.id) === String(idVal));
        if (index !== -1) {
            storeProducts[index] = {
                ...storeProducts[index],
                name,
                category,
                price,
                oldPrice,
                discount,
                image
            };
        }
    } else {
        storeProducts.push({
            id: Date.now(),
            name,
            category,
            price,
            oldPrice,
            discount,
            image
        });
    }

    localStorage.setItem("scentora_products", JSON.stringify(storeProducts));
    closeEditModal();
    filterProducts();
});

// Initialize
filterProducts();