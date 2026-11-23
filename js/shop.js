// GET HTML ELEMENTS

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


// VARIABLES (Connected to Admin & Cart via localStorage!)

let selectedCategory = "All";
const savedProducts = JSON.parse(localStorage.getItem("scentora_products"));
let storeProducts = (savedProducts && savedProducts.length > 0) ? savedProducts : products;
let cart = JSON.parse(localStorage.getItem("scentora_cart")) || [];


// SYNC ACTIVE OFFERS BANNER FROM ADMIN

function syncShopOfferBanner() {
    if (!shopOfferBannerText) return;
    const offers = JSON.parse(localStorage.getItem("scentora_offers")) || [
        { code: "SCENT15", discount: 15 },
        { code: "LUXURY25", discount: 25 }
    ];

    if (offers.length === 0) {
        shopOfferBannerText.textContent = "Enjoy up to 25% OFF on selected fragrances!";
        return;
    }

    const bestOffer = offers.reduce((max, item) => item.discount > max.discount ? item : max, offers[0]);
    shopOfferBannerText.innerHTML = `Enjoy up to <strong>${bestOffer.discount}% OFF</strong> — use promo code <strong>${bestOffer.code}</strong> at checkout!`;
}

const requestedCategory = new URLSearchParams(window.location.search).get("category");

if (requestedCategory) {
    const categoryButton = [...categoryButtons].find(
        button => button.dataset.category.toLowerCase() === requestedCategory.toLowerCase()
    );

    if (categoryButton) {
        selectedCategory = categoryButton.dataset.category;
        categoryButtons.forEach(button => button.classList.remove("active"));
        categoryButton.classList.add("active");
    }
}


// DISPLAY PRODUCTS

function displayProducts(productList) {

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

        const button = document.createElement("button");
        button.className = "add-cart-btn";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {
            addToCart(product.id);
            button.textContent = "Added ✓";
            setTimeout(() => {
                button.textContent = "Add to Cart";
            }, 900);
        });

        info.appendChild(name);
        info.appendChild(category);
        info.appendChild(price);
        info.appendChild(button);

        card.appendChild(info);

        productsGrid.appendChild(card);

    });

}


// SEARCH AND FILTER PRODUCTS

function filterProducts() {

    let filteredProducts = [...storeProducts];

    if (selectedCategory === "Offers") {
        filteredProducts = filteredProducts.filter(
            product => product.discount > 0
        );
    } else if (selectedCategory !== "All") {
        filteredProducts = filteredProducts.filter(
            product => product.category === selectedCategory
        );
    }

    const searchText = searchInput.value.toLowerCase().trim();

    filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchText)
    );

    const sortValue = sortSelect.value;

    if (sortValue === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    displayProducts(filteredProducts);

}


// CATEGORY BUTTONS

categoryButtons.forEach(button => {

    button.addEventListener("click", function () {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        selectedCategory = this.dataset.category;

        filterProducts();

    });

});


// SEARCH & SORT EVENTS

searchInput.addEventListener("input", filterProducts);
sortSelect.addEventListener("change", filterProducts);


// ADD TO CART

function addToCart(productId) {

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity = (existingItem.quantity || existingItem.qty || 1) + 1;
        existingItem.qty = existingItem.quantity;

    } else {

        const product = storeProducts.find(
            item => item.id === productId
        );

        if (!product) return;

        cart.push({
            ...product,
            quantity: 1,
            qty: 1
        });

    }

    updateCart();

}


// UPDATE CART & SAVE TO SHARED STORAGE

function updateCart() {

    localStorage.setItem("scentora_cart", JSON.stringify(cart));

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach(item => {

        const itemQty = item.quantity || item.qty || 1;
        const itemTotal = item.price * itemQty;

        total += itemTotal;
        count += itemQty;

        const div = document.createElement("div");
        div.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h4");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent =
            `${item.price.toLocaleString()} EGP each`;

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "-";
        minus.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        const quantity = document.createElement("span");
        quantity.textContent = itemQty;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.addEventListener("click", () => {
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
        remove.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        div.appendChild(details);
        div.appendChild(remove);

        cartItems.appendChild(div);

    });

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString();

}


// CHANGE QUANTITY

function changeQuantity(productId, amount) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    const currentQty = item.quantity || item.qty || 1;
    const newQty = currentQty + amount;

    if (newQty <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = newQty;
        item.qty = newQty;
        updateCart();
    }

}


// REMOVE PRODUCT FROM CART

function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCart();

}


// OPEN & CLOSE CART OVERLAY

cartButton.addEventListener("click", function () {
    cartOverlay.classList.add("show");
});

closeCart.addEventListener("click", function () {
    cartOverlay.classList.remove("show");
});

cartOverlay.addEventListener("click", function (event) {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("show");
    }
});


// PROCEED TO CHECKOUT -> LINKS DIRECTLY TO cart.html

checkoutButton.addEventListener("click", function () {
    localStorage.setItem("scentora_cart", JSON.stringify(cart));
    window.location.href = "cart.html";
});


// INITIALIZE STORE

syncShopOfferBanner();
filterProducts();
updateCart();