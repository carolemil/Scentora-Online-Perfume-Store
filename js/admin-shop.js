document.addEventListener("DOMContentLoaded", () => {
    // Stores admin changes separately so base products.js stays untouched
    const OVERRIDES_KEY = "scentora_admin_overrides";
    const FALLBACK_IMAGE = "https://placehold.co/600x750/f0e5d8/6b5140?text=SCENTORA";

    const CATEGORY_MAP = {
        women: "Women",
        men: "Men",
        unisex: "Unisex",
        offers: "Offers"
    };

    const el = {
        productsGrid: document.getElementById("productsGrid"),
        searchInput: document.getElementById("searchInput"),
        clearSearch: document.getElementById("clearSearch"),
        sortSelect: document.getElementById("sortSelect"),
        categoryBtns: document.querySelectorAll(".category-btn"),
        productCount: document.getElementById("productCount"),
        noProducts: document.getElementById("noProducts"),
        resetFilters: document.getElementById("resetFilters"),
        editModalOverlay: document.getElementById("editModalOverlay"),
        adminShopForm: document.getElementById("adminShopForm"),
        editImageFile: document.getElementById("editImageFile"),
        imagePreviewWrap: document.getElementById("imagePreviewWrap"),
        editImagePreview: document.getElementById("editImagePreview"),
        toast: document.getElementById("toast")
    };

    if (!el.productsGrid || !el.searchInput || !el.sortSelect) return;

    localStorage.removeItem("scentora_products");

    let uploadedImageData = "";

    function normalizeCategory(category) {
        const val = String(category || "").toLowerCase().trim();
        if (["women", "woman", "female", "women's"].includes(val)) return "Women";
        if (["men", "man", "male", "men's"].includes(val)) return "Men";
        if (val === "unisex") return "Unisex";
        return String(category || "Unisex");
    }

    // Standardizes inconsistent field names and calculates discount percentage
    function normalizeProduct(product, index = 0) {
        const price = Number(product.price ?? product.currentPrice ?? 0);
        const oldPrice = Number(product.oldPrice ?? product.originalPrice ?? 0);
        const rawDiscount = Number(product.discount ?? product.discountPercent ?? 0);
        const validPrice = Number.isFinite(price) ? price : 0;
        const discount = rawDiscount > 0
            ? rawDiscount
            : (oldPrice > validPrice ? Math.round(((oldPrice - validPrice) / oldPrice) * 100) : 0);

        return {
            id: String(product.id ?? product.productId ?? index + 1),
            name: String(product.name ?? product.title ?? "Perfume").trim(),
            brand: String(product.brand ?? "Scentora"),
            price: validPrice,
            oldPrice: oldPrice > validPrice ? oldPrice : 0,
            discount,
            category: normalizeCategory(product.category ?? product.gender ?? "Unisex"),
            image: String(product.image ?? product.img ?? product.imageUrl ?? ""),
            isOffer: Boolean(product.offer ?? product.onOffer ?? product.isOffer) || discount > 0 || oldPrice > validPrice
        };
    }

    function formatPrice(value) {
        return `${Number(value || 0).toLocaleString("en-EG")} EGP`;
    }

    // Prevents XSS when rendering user-submitted strings into innerHTML
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

    function getOverrides() {
        const saved = safeParse(localStorage.getItem(OVERRIDES_KEY));
        return {
            edited: saved?.edited || {},
            added: Array.isArray(saved?.added) ? saved.added : [],
            deletedIds: Array.isArray(saved?.deletedIds) ? saved.deletedIds.map(String) : []
        };
    }

    function saveOverrides(overrides) {
        try {
            localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
        } catch (err) {
            alert("Browser storage limit reached. Try uploading a smaller image file.");
        }
    }

    // Merges static products.js catalog with localStorage edits, additions, and deletions
    function getLiveCatalog() {
        const rawBase =
            (typeof products !== "undefined" && Array.isArray(products)) ? products :
            Array.isArray(window.products) ? window.products :
            Array.isArray(window.perfumes) ? window.perfumes : [];

        const overrides = getOverrides();

        const baseProducts = rawBase
            .map(normalizeProduct)
            .filter((p) => !overrides.deletedIds.includes(String(p.id)))
            .map((p) => overrides.edited[p.id] ? normalizeProduct({ ...p, ...overrides.edited[p.id] }) : p);

        const addedProducts = overrides.added
            .map((p, idx) => normalizeProduct(p, baseProducts.length + idx))
            .filter((p) => !overrides.deletedIds.includes(String(p.id)));

        return [...baseProducts, ...addedProducts];
    }

    let productList = getLiveCatalog();

    const urlCategory = (new URLSearchParams(window.location.search).get("category") || "").toLowerCase();

    let state = {
        category: CATEGORY_MAP[urlCategory] || "All",
        toastTimer: null
    };

    // Resizes and compresses uploaded images via Canvas so base64 strings fit in localStorage
    function readAndCompressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 800;
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.82));
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    el.editImageFile?.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            uploadedImageData = await readAndCompressImage(file);
            if (el.editImagePreview && el.imagePreviewWrap) {
                el.editImagePreview.src = uploadedImageData;
                el.imagePreviewWrap.style.display = "block";
            }
        } catch {
            showToast("Could not read selected image");
        }
    });

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
                        <button type="button" class="delete-card-btn" data-delete-id="${escapeHTML(product.id)}" title="Delete Fragrance" aria-label="Delete ${escapeHTML(product.name)}">✕</button>
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
                        <button type="button" class="add-to-cart-btn" data-edit-id="${escapeHTML(product.id)}">
                            Click to Edit Fragrance
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

    // Reuses one modal for both adding (product = null) and editing
    function openEditModal(product = null) {
        const heading = document.getElementById("modalHeading");
        const idField = document.getElementById("editProductId");

        if (el.editImageFile) el.editImageFile.value = "";

        if (product) {
            heading.textContent = "Edit Fragrance";
            idField.value = product.id;
            document.getElementById("editName").value = product.name;
            document.getElementById("editCategory").value = normalizeCategory(product.category);
            document.getElementById("editPrice").value = product.price;
            document.getElementById("editOldPrice").value = product.oldPrice || "";
            uploadedImageData = product.image || "";

            if (el.editImagePreview && el.imagePreviewWrap) {
                el.editImagePreview.src = uploadedImageData || FALLBACK_IMAGE;
                el.imagePreviewWrap.style.display = "block";
            }
        } else {
            heading.textContent = "Add New Fragrance";
            idField.value = "";
            uploadedImageData = "";
            el.adminShopForm.reset();

            if (el.imagePreviewWrap) {
                el.imagePreviewWrap.style.display = "none";
            }
        }

        el.editModalOverlay.classList.add("show");
    }

    function closeEditModal() {
        el.editModalOverlay.classList.remove("show");
    }

    function deleteFragrance(id) {
        const target = productList.find((p) => String(p.id) === String(id));
        if (!target) return;
        if (!confirm(`Delete "${target.name}" from the store?`)) return;

        const overrides = getOverrides();
        overrides.added = overrides.added.filter((p) => String(p.id) !== String(id));
        delete overrides.edited[String(id)];
        if (!overrides.deletedIds.includes(String(id))) {
            overrides.deletedIds.push(String(id));
        }

        saveOverrides(overrides);
        productList = getLiveCatalog();
        renderProducts();
        showToast(`${target.name} removed from shop`);
    }

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

    // Event delegation for dynamically rendered edit/delete buttons
    el.productsGrid.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest("[data-delete-id]");
        if (deleteBtn) {
            deleteFragrance(deleteBtn.dataset.deleteId);
            return;
        }

        const editBtn = e.target.closest("[data-edit-id]");
        if (editBtn) {
            const product = productList.find((p) => String(p.id) === String(editBtn.dataset.editId));
            if (product) openEditModal(product);
        }
    });

    document.getElementById("addFragranceBtn")?.addEventListener("click", () => openEditModal(null));
    document.getElementById("closeEditModal")?.addEventListener("click", closeEditModal);
    document.getElementById("cancelEditModal")?.addEventListener("click", closeEditModal);

    el.editModalOverlay?.addEventListener("click", (e) => {
        if (e.target === el.editModalOverlay) closeEditModal();
    });

    document.getElementById("resetDefaultBtn")?.addEventListener("click", () => {
        if (!confirm("Reset all admin edits back to products.js?")) return;
        localStorage.removeItem(OVERRIDES_KEY);
        productList = getLiveCatalog();
        renderProducts();
        showToast("Catalog reset to products.js");
    });

    el.adminShopForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const idVal = document.getElementById("editProductId").value;
        const name = document.getElementById("editName").value.trim();
        const category = normalizeCategory(document.getElementById("editCategory").value);
        const price = Number(document.getElementById("editPrice").value);
        const oldPrice = Number(document.getElementById("editOldPrice").value) || 0;
        const image = uploadedImageData || FALLBACK_IMAGE;
        const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

        const overrides = getOverrides();

        if (idVal) {
            const addedIdx = overrides.added.findIndex((p) => String(p.id) === String(idVal));
            if (addedIdx !== -1) {
                overrides.added[addedIdx] = {
                    ...overrides.added[addedIdx],
                    name,
                    category,
                    price,
                    oldPrice,
                    discount,
                    image
                };
            } else {
                overrides.edited[String(idVal)] = {
                    name,
                    category,
                    price,
                    oldPrice,
                    discount,
                    image
                };
            }
            showToast(`${name} updated & synced to shop`);
        } else {
            overrides.added.push({
                id: String(Date.now()),
                name,
                brand: "Scentora",
                category,
                price,
                oldPrice,
                discount,
                image
            });
            showToast(`${name} added & synced to shop`);
        }

        saveOverrides(overrides);
        productList = getLiveCatalog();
        closeEditModal();
        renderProducts();
    });

    updateCategoryUI();
    renderProducts();
});