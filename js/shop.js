/* =========================================
   SCENTORA - SHOP JAVASCRIPT
   Product catalogue, filters, search, cart & account drawer
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "scentoraCart";
    const OVERRIDES_KEY = "scentora_admin_overrides";
    const FALLBACK_IMAGE = "https://placehold.co/600x750/f0e5d8/6b5140?text=SCENTORA";

    const CATEGORY_MAP = {
        women: "Women",
        men: "Men",
        unisex: "Unisex",
        offers: "Offers"
    };

    // =====================================
    // 1. DOM REFERENCES
    // =====================================
    const el = {
        productsGrid: document.getElementById("productsGrid"),
        searchInput: document.getElementById("searchInput"),
        clearSearch: document.getElementById("clearSearch"),
        sortSelect: document.getElementById("sortSelect"),
        categoryBtns: document.querySelectorAll(".category-btn"),
        productCount: document.getElementById("productCount"),
        noProducts: document.getElementById("noProducts"),
        resetFilters: document.getElementById("resetFilters"),
        cartBtn: document.getElementById("cartButton"),
        cartOverlay: document.getElementById("cartOverlay"),
        closeCartBtn: document.getElementById("closeCart"),
        cartItems: document.getElementById("cartItems"),
        cartCount: document.getElementById("cartCount"),
        cartSubtotal: document.getElementById("cartSubtotal"),
        cartTotal: document.getElementById("cartTotal"),
        checkoutBtn: document.getElementById("checkoutButton"),
        toast: document.getElementById("toast")
    };

    const accountEl = {
        btn: document.getElementById("accountButton"),
        navName: document.getElementById("navUserName"),
        overlay: document.getElementById("accountOverlay"),
        closeBtn: document.getElementById("closeAccount"),
        loggedInBox: document.getElementById("accountLoggedIn"),
        loggedOutBox: document.getElementById("accountLoggedOut"),
        avatar: document.getElementById("accountAvatar"),
        fullName: document.getElementById("accountFullName"),
        emailDisplay: document.getElementById("accountEmailDisplay"),
        detailName: document.getElementById("detailName"),
        detailEmail: document.getElementById("detailEmail"),
        detailPhone: document.getElementById("detailPhone"),
        logoutBtn: document.getElementById("logoutButton"),
        authNav: document.getElementById("auth-nav")
    };

    if (!el.productsGrid || !el.searchInput || !el.sortSelect) {
        console.error("Scentora: Required shop HTML elements are missing.");
        return;
    }

    // =====================================
    // 2. DATA & STATE
    // =====================================
    function getLiveCatalog() {
        const rawProducts =
            (typeof products !== "undefined" && Array.isArray(products)) ? products :
            Array.isArray(window.products) ? window.products :
            Array.isArray(window.perfumes) ? window.perfumes : [];

        const saved = safeParse(localStorage.getItem(OVERRIDES_KEY));
        const edited = saved?.edited || {};
        const added = Array.isArray(saved?.added) ? saved.added : [];
        const deletedIds = Array.isArray(saved?.deletedIds) ? saved.deletedIds.map(String) : [];

        const baseProducts = rawProducts
            .map(normalizeProduct)
            .filter((p) => !deletedIds.includes(String(p.id)))
            .map((p) => edited[p.id] ? normalizeProduct({ ...p, ...edited[p.id] }) : p);

        const addedProducts = added
            .map((p, idx) => normalizeProduct(p, baseProducts.length + idx))
            .filter((p) => !deletedIds.includes(String(p.id)));

        return [...baseProducts, ...addedProducts];
    }

    let productList = getLiveCatalog();

    const urlCategory = (new URLSearchParams(window.location.search).get("category") || "").toLowerCase();

    let state = {
        category: CATEGORY_MAP[urlCategory] || "All",
        cart: loadCart(),
        toastTimer: null
    };

    // =====================================
    // 3. HELPERS
    // =====================================
    function normalizeProduct(product, index) {
        const price = Number(product.price ?? product.currentPrice ?? 0);
        const oldPrice = Number(product.oldPrice ?? product.originalPrice ?? 0);
        const rawDiscount = Number(product.discount ?? product.discountPercent ?? 0);
        const validPrice = Number.isFinite(price) ? price : 0;
        const discount = rawDiscount > 0
            ? rawDiscount
            : (oldPrice > validPrice ? Math.round(((oldPrice - validPrice) / oldPrice) * 100) : 0);

        return {
            id: String(product.id ?? product.productId ?? index + 1),
            name: String(product.name ?? product.title ?? "Perfume"),
            brand: String(product.brand ?? "Scentora"),
            price: validPrice,
            oldPrice: oldPrice > validPrice ? oldPrice : 0,
            discount,
            category: normalizeCategory(product.category ?? product.gender ?? "Unisex"),
            image: String(product.image ?? product.img ?? product.imageUrl ?? ""),
            isOffer: Boolean(product.offer ?? product.onOffer ?? product.isOffer) || discount > 0 || oldPrice > validPrice
        };
    }

    function normalizeCategory(category) {
        const val = String(category).toLowerCase().trim();
        if (["women", "woman", "female", "women's"].includes(val)) return "Women";
        if (["men", "man", "male", "men's"].includes(val)) return "Men";
        if (val === "unisex") return "Unisex";
        return String(category);
    }

    function formatPrice(value) {
        return `${Number(value || 0).toLocaleString("en-EG")} EGP`;
    }

    function escapeHTML(value) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(value).replace(/[&<>"']/g, (char) => map[char]);
    }

    function safeParse(raw) {
        try {
            return JSON.parse(raw || "null");
        } catch {
            return null;
        }
    }

    function showToast(message) {
        if (!el.toast) return;
        el.toast.textContent = message;
        el.toast.classList.add("show");
        clearTimeout(state.toastTimer);
        state.toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2400);
    }

    function syncBodyScrollLock() {
        const isCartOpen = el.cartOverlay?.classList.contains("open");
        const isAccountOpen = accountEl.overlay?.classList.contains("open");
        document.body.classList.toggle("cart-open", Boolean(isCartOpen || isAccountOpen));
    }

    // =====================================
    // 4. CATALOGUE RENDERING & FILTERING
    // =====================================
    function getFilteredProducts() {
        const query = el.searchInput.value.trim().toLowerCase();
        const sortBy = el.sortSelect.value;

        const filtered = productList.filter((product) => {
            const matchesSearch = !query ||
                `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query);

            const matchesCategory =
                state.category === "All" ? true :
                state.category === "Offers" ? product.isOffer :
                product.category === state.category;

            return matchesSearch && matchesCategory;
        });

        const sorters = {
            "low-high": (a, b) => a.price - b.price,
            "high-low": (a, b) => b.price - a.price,
            "name": (a, b) => a.name.localeCompare(b.name)
        };

        return sorters[sortBy] ? filtered.sort(sorters[sortBy]) : filtered;
    }

    function renderProducts() {
        const items = getFilteredProducts();
        const isEmpty = items.length === 0;

        el.productsGrid.innerHTML = items.map((product) => {
            const badge = product.isOffer
                ? `<span class="product-badge">${product.discount ? `${product.discount}% OFF` : "Special Offer"}</span>`
                : "";

            const oldPrice = product.oldPrice
                ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
                : "";

            return `
                <article class="product-card">
                    <div class="product-image-wrap">
                        ${badge}
                        <img
                            class="product-image"
                            src="${escapeHTML(product.image || FALLBACK_IMAGE)}"
                            alt="${escapeHTML(product.name)}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                        >
                    </div>
                    <div class="product-info">
                        <p class="product-brand">${escapeHTML(product.brand)}</p>
                        <h3 class="product-name">${escapeHTML(product.name)}</h3>
                        <p class="product-category">${escapeHTML(product.category)}</p>
                        <div class="product-price-row">
                            <span class="product-price">${formatPrice(product.price)}</span>
                            ${oldPrice}
                        </div>
                        <button type="button" class="add-to-cart-btn" data-product-id="${escapeHTML(product.id)}">
                            Add to Bag
                        </button>
                    </div>
                </article>
            `;
        }).join("");

        if (el.productCount) {
            el.productCount.textContent = `Showing ${items.length} ${items.length === 1 ? "fragrance" : "fragrances"}`;
        }
        if (el.noProducts) el.noProducts.hidden = !isEmpty;
        el.productsGrid.hidden = isEmpty;
        if (el.clearSearch) el.clearSearch.hidden = el.searchInput.value.length === 0;
    }

    function updateCategoryUI() {
        el.categoryBtns.forEach((btn) => {
            const isActive = btn.dataset.category === state.category;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });
    }

    // =====================================
    // 5. CART MANAGEMENT
    // =====================================
    function loadCart() {
        const saved = safeParse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
        } catch (err) {
            console.warn("Scentora: Cart could not be saved.", err);
        }
    }

    function renderCart() {
        const { totalQty, subtotal } = state.cart.reduce(
            (acc, item) => ({
                totalQty: acc.totalQty + item.quantity,
                subtotal: acc.subtotal + item.price * item.quantity
            }),
            { totalQty: 0, subtotal: 0 }
        );

        if (el.cartCount) el.cartCount.textContent = totalQty;
        if (el.cartSubtotal) el.cartSubtotal.textContent = formatPrice(subtotal);
        if (el.cartTotal) el.cartTotal.textContent = formatPrice(subtotal);
        if (el.checkoutBtn) el.checkoutBtn.disabled = state.cart.length === 0;
        if (!el.cartItems) return;

        if (state.cart.length === 0) {
            el.cartItems.innerHTML = `<p class="cart-empty">Your bag is waiting for something beautiful.</p>`;
            return;
        }

        el.cartItems.innerHTML = state.cart.map((item) => `
            <div class="cart-item">
                <img
                    class="cart-item-image"
                    src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                    alt="${escapeHTML(item.name)}"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                >
                <div class="cart-item-details">
                    <p class="cart-item-brand">${escapeHTML(item.brand || "Scentora")}</p>
                    <h3 class="cart-item-name">${escapeHTML(item.name)}</h3>
                    <p class="cart-item-price">${formatPrice(item.price * item.quantity)}</p>
                    <div class="cart-item-actions">
                        <button type="button" class="quantity-btn" data-action="decrease" data-id="${escapeHTML(item.id)}" aria-label="Decrease quantity">−</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button type="button" class="quantity-btn" data-action="increase" data-id="${escapeHTML(item.id)}" aria-label="Increase quantity">+</button>
                        <button type="button" class="remove-item-btn" data-action="remove" data-id="${escapeHTML(item.id)}">Remove</button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    function toggleCart(open) {
        if (!el.cartOverlay) return;
        if (open) toggleAccount(false);
        el.cartOverlay.classList.toggle("open", open);
        el.cartOverlay.setAttribute("aria-hidden", String(!open));
        syncBodyScrollLock();
        (open ? el.closeCartBtn : el.cartBtn)?.focus();
    }

    // =====================================
    // 6. ACCOUNT SIDEBAR (LOGIN DATA)
    // =====================================
    function isUserObject(obj) {
        return obj && typeof obj === "object" && !Array.isArray(obj) && Boolean(obj.email || obj.username);
    }

    function getLoggedInUser() {
        const stores = [localStorage, sessionStorage];
        const priorityKeys = [
            "scentoraCurrentUser", "scentoraUser", "scentora_user", "currentUser",
            "loggedInUser", "activeUser", "user", "authUser"
        ];

        for (const store of stores) {
            for (const key of priorityKeys) {
                const parsed = safeParse(store.getItem(key));
                if (isUserObject(parsed)) return { key, data: parsed };
            }

            for (let i = 0; i < store.length; i++) {
                const key = store.key(i);
                if (!key || key === STORAGE_KEY || key === OVERRIDES_KEY || key.toLowerCase().includes("users")) continue;
                const parsed = safeParse(store.getItem(key));
                if (isUserObject(parsed)) return { key, data: parsed };
            }
        }
        return null;
    }

    function renderAccountDrawer() {
        const session = getLoggedInUser();

        if (!session) {
            if (accountEl.loggedInBox) accountEl.loggedInBox.hidden = true;
            if (accountEl.loggedOutBox) accountEl.loggedOutBox.hidden = false;
            if (accountEl.navName) accountEl.navName.textContent = "Account";
            if (accountEl.authNav) accountEl.authNav.hidden = false;
            return;
        }

        const user = session.data;
        const name = user.name || user.fullName || user.username || "Scentora Member";
        const email = user.email || "No email saved";
        const phone = user.phone || user.phoneNumber || "Not provided";
        const initial = name.trim().charAt(0).toUpperCase() || "S";

        if (accountEl.loggedInBox) accountEl.loggedInBox.hidden = false;
        if (accountEl.loggedOutBox) accountEl.loggedOutBox.hidden = true;
        if (accountEl.authNav) accountEl.authNav.hidden = true;

        if (accountEl.navName) accountEl.navName.textContent = name.split(" ")[0];
        if (accountEl.avatar) accountEl.avatar.textContent = initial;
        if (accountEl.fullName) accountEl.fullName.textContent = name;
        if (accountEl.emailDisplay) accountEl.emailDisplay.textContent = email;
        if (accountEl.detailName) accountEl.detailName.textContent = name;
        if (accountEl.detailEmail) accountEl.detailEmail.textContent = email;
        if (accountEl.detailPhone) accountEl.detailPhone.textContent = phone;
    }

    function toggleAccount(open) {
        if (!accountEl.overlay) return;
        if (open) toggleCart(false);
        accountEl.overlay.classList.toggle("open", open);
        accountEl.overlay.setAttribute("aria-hidden", String(!open));
        syncBodyScrollLock();
        (open ? accountEl.closeBtn : accountEl.btn)?.focus();
    }

    // =====================================
    // 7. EVENT LISTENERS
    // =====================================

    // Live-sync if Admin edits products in another tab
    window.addEventListener("storage", (e) => {
        if (e.key === OVERRIDES_KEY) {
            productList = getLiveCatalog();
            renderProducts();
        }
    });

    // Navbar Women / Men / Unisex links: filter & scroll smoothly to #products
    document.querySelectorAll(".nav-cat-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const chosenCategory = btn.dataset.navCategory;
            if (!chosenCategory) return;

            state.category = chosenCategory;
            updateCategoryUI();
            renderProducts();

            document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    document.querySelector('.hero a[href="#products"]')?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    el.searchInput.addEventListener("input", renderProducts);
    el.sortSelect.addEventListener("change", renderProducts);

    el.clearSearch?.addEventListener("click", () => {
        el.searchInput.value = "";
        renderProducts();
        el.searchInput.focus();
    });

    el.categoryBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            state.category = btn.dataset.category;
            updateCategoryUI();
            renderProducts();
        });
    });

    el.resetFilters?.addEventListener("click", () => {
        el.searchInput.value = "";
        el.sortSelect.value = "default";
        state.category = "All";
        updateCategoryUI();
        renderProducts();
    });

    el.productsGrid.addEventListener("click", (e) => {
        const btn = e.target.closest(".add-to-cart-btn");
        if (!btn) return;

        const product = productList.find((p) => p.id === btn.dataset.productId);
        if (!product) return;

        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity++;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        renderCart();
        showToast(`${product.name} added to your bag`);
    });

    el.cartItems?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const { id, action } = btn.dataset;
        const item = state.cart.find((i) => i.id === id);
        if (!item) return;

        if (action === "increase") item.quantity++;
        if (action === "decrease") item.quantity--;
        if (action === "remove" || item.quantity <= 0) {
            state.cart = state.cart.filter((i) => i.id !== id);
        }

        saveCart();
        renderCart();
    });

    el.cartBtn?.addEventListener("click", () => toggleCart(true));
    el.closeCartBtn?.addEventListener("click", () => toggleCart(false));
    el.cartOverlay?.addEventListener("click", (e) => {
        if (e.target === el.cartOverlay) toggleCart(false);
    });

    accountEl.btn?.addEventListener("click", () => toggleAccount(true));
    accountEl.closeBtn?.addEventListener("click", () => toggleAccount(false));
    accountEl.overlay?.addEventListener("click", (e) => {
        if (e.target === accountEl.overlay) toggleAccount(false);
    });

    accountEl.logoutBtn?.addEventListener("click", () => {
        const session = getLoggedInUser();
        if (session) {
            localStorage.removeItem(session.key);
            sessionStorage.removeItem(session.key);
        }
        [
            "scentoraCurrentUser", "scentoraUser", "scentora_user", "currentUser",
            "loggedInUser", "activeUser", "user", "authUser"
        ].forEach((k) => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });

        renderAccountDrawer();
        toggleAccount(false);
        showToast("You have been signed out.");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (el.cartOverlay?.classList.contains("open")) toggleCart(false);
            if (accountEl.overlay?.classList.contains("open")) toggleAccount(false);
        }
    });

    el.checkoutBtn?.addEventListener("click", () => {
        if (state.cart.length === 0) return;
        window.location.href = "cart.html";
    });

    // =====================================
    // 8. INITIALIZE
    // =====================================
    updateCategoryUI();
    renderProducts();
    renderCart();
    renderAccountDrawer();

    if (CATEGORY_MAP[urlCategory]) {
        setTimeout(() => {
            document.getElementById("products")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 120);
    }

    if (productList.length === 0) {
        console.warn("Scentora: No products found. Check that products.js loads before shop.js.");
    }
});