
// Get HTML elements
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryButtons = document.querySelectorAll(".category-btn");

const cartButton = document.getElementById("cartButton");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const checkoutButton = document.getElementById("checkoutButton");
const noProducts = document.getElementById("noProducts");
const shopOfferBannerText = document.getElementById("shopOfferBannerText");


// Variables (connected to admin and cart through localStorage)
let selectedCategory = "All";

const savedProducts = JSON.parse(localStorage.getItem("scentora_products"));
let storeProducts = (savedProducts && savedProducts.length > 0) ? savedProducts : products;

let cart = JSON.parse(localStorage.getItem("scentora_cart")) || [];


// Display the best active offer in the banner
function syncShopOfferBanner() {

    if (!shopOfferBannerText) {
        return;
    }

    const offers = JSON.parse(localStorage.getItem("scentora_offers")) || [
        { code: "SCENT15", discount: 15 },
        { code: "LUXURY25", discount: 25 }
    ];

    if (offers.length === 0) {
        shopOfferBannerText.textContent = "Enjoy up to 25% OFF on selected fragrances!";
        return;
    }

    const bestOffer = offers.reduce(function (max, item) {
        return item.discount > max.discount ? item : max;
    }, offers[0]);

    shopOfferBannerText.innerHTML =
        `Enjoy up to <strong>${bestOffer.discount}% OFF</strong> — use promo code <strong>${bestOffer.code}</strong> at checkout!`;

}


// Select a category from the page link (shop.html?category=Men)
const requestedCategory = new URLSearchParams(window.location.search).get("category");

if (requestedCategory) {

    const categoryButton = [...categoryButtons].find(function (button) {
        return button.dataset.category.toLowerCase() === requestedCategory.toLowerCase();
    });

    if (categoryButton) {

        selectedCategory = categoryButton.dataset.category;

        categoryButtons.forEach(function (button) {
            button.classList.remove("active");
        });

        categoryButton.classList.add("active");

    }

}


// Display products
function displayProducts(productList) {

    if (!productsGrid) {
        return;
    }

    productsGrid.innerHTML = "";

    if (noProducts) {
        noProducts.hidden = productList.length !== 0;
    }

    productList.forEach(function (product) {

        const card = document.createElement("div");
        card.className = "product-card";

        const image = document.createElement("img");
        image.className = "product-image";
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        // Show a placeholder if the image fails to load
        image.onerror = function () {
            this.onerror = null;
            this.src = "https://placehold.co/600x600/f3ede3/ad8754?text=Perfume";
        };

        card.appendChild(image);

        if (product.discount > 0) {

            const badge = document.createElement("span");
            badge.className = "discount-badge";
            badge.textContent = `${product.discount}% OFF`;

            card.appendChild(badge);

        }

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.size
            ? `${product.category} · ${product.size}`
            : product.category;

        const notes = document.createElement("p");
        notes.className = "product-notes";

        if (Array.isArray(product.notes) && product.notes.length > 0) {
            notes.textContent = product.notes.join(" · ");
        }

        const price = document.createElement("p");
        price.className = "product-price";

        if (product.oldPrice > product.price) {

            price.innerHTML =
                `<span class="old-price">${product.oldPrice.toLocaleString()} EGP</span>
                ${product.price.toLocaleString()} EGP`;

        } else {

            price.textContent = `${product.price.toLocaleString()} EGP`;

        }

        const button = document.createElement("button");
        button.className = "add-cart-btn";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {

            addToCart(product.id);

            button.textContent = "Added ✓";

            setTimeout(function () {
                button.textContent = "Add to Cart";
            }, 900);

        });

        info.appendChild(name);
        info.appendChild(category);

        if (notes.textContent !== "") {
            info.appendChild(notes);
        }

        info.appendChild(price);
        info.appendChild(button);

        card.appendChild(info);

        productsGrid.appendChild(card);

    });

}


// Search, filter and sort products
function filterProducts() {

    let filteredProducts = [...storeProducts];

    if (selectedCategory === "Offers") {

        filteredProducts = filteredProducts.filter(function (product) {
            return product.discount > 0;
        });

    } else if (selectedCategory !== "All") {

        filteredProducts = filteredProducts.filter(function (product) {
            return product.category === selectedCategory;
        });

    }

    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";

    filteredProducts = filteredProducts.filter(function (product) {
        return product.name.toLowerCase().includes(searchText);
    });

    const sortValue = sortSelect ? sortSelect.value : "";

    if (sortValue === "low-high") {
        filteredProducts.sort(function (a, b) {
            return a.price - b.price;
        });
    } else if (sortValue === "high-low") {
        filteredProducts.sort(function (a, b) {
            return b.price - a.price;
        });
    }

    displayProducts(filteredProducts);

}


// Category buttons
categoryButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        categoryButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedCategory = this.dataset.category;

        filterProducts();

    });

});


// Search and sort events
if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

if (sortSelect) {
    sortSelect.addEventListener("change", filterProducts);
}


// Add a product to the cart
function addToCart(productId) {

    const existingItem = cart.find(function (item) {
        return item.id === productId;
    });

    if (existingItem) {

        existingItem.quantity = (existingItem.quantity || existingItem.qty || 1) + 1;
        existingItem.qty = existingItem.quantity;

    } else {

        const product = storeProducts.find(function (item) {
            return item.id === productId;
        });

        if (!product) {
            return;
        }

        cart.push({
            ...product,
            quantity: 1,
            qty: 1
        });

    }

    updateCart();

}


// Update the cart and save it to shared storage
function updateCart() {

    localStorage.setItem("scentora_cart", JSON.stringify(cart));

    if (!cartItems) {
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach(function (item) {

        const itemQty = item.quantity || item.qty || 1;

        total += item.price * itemQty;
        count += itemQty;

        const div = document.createElement("div");
        div.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h4");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = `${item.price.toLocaleString()} EGP each`;

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "-";

        minus.addEventListener("click", function () {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = itemQty;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";

        plus.addEventListener("click", function () {
            changeQuantity(item.id, 1);
        });

        controls.appendChild(minus);
        controls.appendChild(quantity);
        controls.appendChild(plus);

        details.appendChild(name);
        details.appendChild(price);
        details.appendChild(controls);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-btn";
        remove.textContent = "Remove";

        remove.addEventListener("click", function () {
            removeFromCart(item.id);
        });

        div.appendChild(details);
        div.appendChild(remove);

        cartItems.appendChild(div);

    });

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (cartTotal) {
        cartTotal.textContent = total.toLocaleString();
    }

}


// Change the quantity of a cart item
function changeQuantity(productId, amount) {

    const item = cart.find(function (product) {
        return product.id === productId;
    });

    if (!item) {
        return;
    }

    const newQty = (item.quantity || item.qty || 1) + amount;

    if (newQty <= 0) {

        removeFromCart(productId);

    } else {

        item.quantity = newQty;
        item.qty = newQty;

        updateCart();

    }

}


// Remove a product from the cart
function removeFromCart(productId) {

    cart = cart.filter(function (item) {
        return item.id !== productId;
    });

    updateCart();

}


// Open and close the cart
if (cartButton && cartOverlay) {

    cartButton.addEventListener("click", function () {
        cartOverlay.classList.add("show");
    });

}

if (closeCart && cartOverlay) {

    closeCart.addEventListener("click", function () {
        cartOverlay.classList.remove("show");
    });

}

if (cartOverlay) {

    cartOverlay.addEventListener("click", function (event) {

        if (event.target === cartOverlay) {
            cartOverlay.classList.remove("show");
        }

    });

}


// Proceed to checkout (goes to cart.html)
if (checkoutButton) {

    checkoutButton.addEventListener("click", function () {

        localStorage.setItem("scentora_cart", JSON.stringify(cart));

        window.location.href = "cart.html";

    });

}


// Display the current year (same as home.js)
const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// Start the shop page
syncShopOfferBanner();
filterProducts();
updateCart();