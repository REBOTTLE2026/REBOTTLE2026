// ============================================================================
// Налаштування
// ============================================================================

// Адреса Cloudflare Worker для прийому замовлень (Telegram) і проксі доставки.
// Поки порожньо — форма замовлення працюватиме, але кнопка "Підтвердити"
// покаже повідомлення, що бекенд ще не підключено. Заповнити після
// налаштування Cloudflare Worker.
const WORKER_URL = "https://rebottle-worker.rdrapak9.workers.dev";

const CURRENCY_KEY = "rebatlleCurrency";
const CART_KEY = "rebatlleCart";

let currentCurrency = localStorage.getItem(CURRENCY_KEY) || "PLN";
let currentCategory = "all";
let allProducts = [];
let CATEGORY_LABELS = {};

// ============================================================================
// Валюта
// ============================================================================

function setCurrency(cur) {
    currentCurrency = cur;
    localStorage.setItem(CURRENCY_KEY, cur);
    document.getElementById("curPLN").classList.toggle("active", cur === "PLN");
    document.getElementById("curUAH").classList.toggle("active", cur === "UAH");
    renderProducts(getFilteredProducts());
    renderCartModalBody();
}

function priceOf(product) {
    return currentCurrency === "PLN" ? (product.pricePLN || 0) : (product.priceUAH || 0);
}

function formatPrice(product) {
    const main = currentCurrency === "PLN" ? product.pricePLN : product.priceUAH;
    const alt = currentCurrency === "PLN" ? product.priceUAH : product.pricePLN;
    const mainUnit = currentCurrency === "PLN" ? "zł" : "грн";
    const altUnit = currentCurrency === "PLN" ? "грн" : "zł";
    return { main: `${main ?? 0} ${mainUnit}`, alt: alt != null ? `≈ ${alt} ${altUnit}` : "" };
}

// ============================================================================
// Кошик (localStorage)
// ============================================================================

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartCount(cart) {
    return Object.values(cart).reduce((s, q) => s + q, 0);
}

function updateCartBadge() {
    document.getElementById("cartCount").textContent = cartCount(loadCart());
}

function addToCart(productId, btn) {
    const cart = loadCart();
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart(cart);
    updateCartBadge();
    if (btn) {
        const original = btn.innerHTML;
        btn.classList.add("added");
        btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
        setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = original; }, 900);
    }
}

function changeQty(productId, delta) {
    const cart = loadCart();
    if (!cart[productId]) return;
    cart[productId] += delta;
    if (cart[productId] <= 0) delete cart[productId];
    saveCart(cart);
    updateCartBadge();
    renderCartModalBody();
}

function removeFromCart(productId) {
    const cart = loadCart();
    delete cart[productId];
    saveCart(cart);
    updateCartBadge();
    renderCartModalBody();
}

// ============================================================================
// Firestore: каталог і категорії
// ============================================================================

async function initCatalog() {
    const container = document.getElementById("products-container");
    container.innerHTML = `<div class="no-results"><i class="fa-solid fa-spinner fa-spin"></i> Завантаження каталогу...</div>`;

    if (typeof db === "undefined") {
        container.innerHTML = `<div class="no-results">Каталог тимчасово недоступний.</div>`;
        return;
    }

    try {
        await Promise.all([loadCategories(), loadProducts()]);
        renderCategoryFilters();
        renderProducts(getFilteredProducts());
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="no-results">Не вдалося завантажити каталог: ${escapeHtml(err.message)}</div>`;
    }
}

async function loadProducts() {
    const snap = await db.collection("products").get();
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function loadCategories() {
    const snap = await db.collection("categories").orderBy("order").get();
    CATEGORY_LABELS = {};
    snap.docs.forEach(doc => { CATEGORY_LABELS[doc.id] = doc.data().label || doc.id; });
}

function renderCategoryFilters() {
    const el = document.getElementById("categoryFilterLinks");
    el.innerHTML = Object.keys(CATEGORY_LABELS).map(slug => `
        <button type="button" class="category-filter-btn" data-category="${escapeAttr(slug)}" onclick="filterCategory('${escapeAttr(slug)}')">
            ${escapeHtml(CATEGORY_LABELS[slug])}
        </button>
    `).join("");
}

function filterCategory(slug) {
    currentCategory = slug;
    document.querySelectorAll(".category-filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === slug);
    });
    renderProducts(getFilteredProducts());
}

function getFilteredProducts() {
    if (currentCategory === "all") return allProducts.filter(p => p.inStock !== false);
    return allProducts.filter(p => p.category === currentCategory && p.inStock !== false);
}

// ============================================================================
// Рендер каталогу
// ============================================================================

function renderProducts(products) {
    const container = document.getElementById("products-container");
    if (!products.length) {
        container.innerHTML = `<div class="no-results">У цій категорії поки немає товарів.</div>`;
        return;
    }
    container.innerHTML = products.map(p => {
        const price = formatPrice(p);
        const img = p.imageBase64 || p.imageUrl || "";
        return `
        <div class="product-card" onclick="openProductModal('${p.id}')">
            <div class="product-card-img">
                ${img ? `<img src="${img}" alt="${escapeAttr(p.name)}">` : `<div class="no-results" style="padding:0;height:100%;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-wine-bottle"></i></div>`}
            </div>
            <div class="product-card-body">
                <div class="product-card-category">${escapeHtml(CATEGORY_LABELS[p.category] || p.category || "")}</div>
                <div class="product-card-title">${escapeHtml(p.name)}</div>
                <div class="product-card-footer">
                    <div class="product-card-price"><b>${price.main}</b><span>${price.alt}</span></div>
                    <button type="button" class="product-card-add" title="У кошик" onclick="event.stopPropagation(); addToCart('${p.id}', this)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        </div>`;
    }).join("");
}

// ============================================================================
// Модалка товару
// ============================================================================

function openProductModal(productId) {
    const p = allProducts.find(x => x.id === productId);
    if (!p) return;
    const price = formatPrice(p);
    const img = p.imageBase64 || p.imageUrl || "";
    document.getElementById("productModalBody").innerHTML = `
        <div class="product-modal-grid">
            <div class="product-modal-img">${img ? `<img src="${img}" alt="${escapeAttr(p.name)}">` : ""}</div>
            <div>
                <div class="product-modal-category">${escapeHtml(CATEGORY_LABELS[p.category] || "")}</div>
                <div class="product-modal-title">${escapeHtml(p.name)}</div>
                <div class="product-modal-price">${price.main}<span>${price.alt}</span></div>
                <div class="product-modal-desc">${escapeHtml(p.description || "")}</div>
                <button type="button" class="btn btn-primary" style="width:100%;" onclick="addToCart('${p.id}'); closeModal('productModal');">
                    <i class="fa-solid fa-bag-shopping"></i> Додати в кошик
                </button>
            </div>
        </div>
    `;
    openModal("productModal");
}

// ============================================================================
// Модалки — відкриття/закриття
// ============================================================================

function openModal(id) { document.getElementById(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(id) { document.getElementById(id).classList.remove("open"); document.body.style.overflow = ""; }

document.addEventListener("click", (e) => {
    document.querySelectorAll(".modal.open").forEach(modal => {
        if (e.target === modal) closeModal(modal.id);
    });
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal.open").forEach(m => closeModal(m.id));
});

// ============================================================================
// Кошик — модалка
// ============================================================================

function openCartModal() {
    renderCartModalBody();
    openModal("cartModal");
}

function renderCartModalBody() {
    const cart = loadCart();
    const ids = Object.keys(cart);
    const body = document.getElementById("cartModalBody");

    if (!ids.length) {
        body.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-bag-shopping" style="font-size:28px;display:block;margin-bottom:10px;"></i>Кошик порожній.</div>`;
        return;
    }

    let total = 0;
    const itemsHtml = ids.map(id => {
        const p = allProducts.find(x => x.id === id);
        if (!p) return "";
        const qty = cart[id];
        const unit = priceOf(p);
        total += unit * qty;
        const img = p.imageBase64 || p.imageUrl || "";
        return `
        <div class="cart-item">
            ${img ? `<img src="${img}" alt="">` : ""}
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(p.name)}</div>
                <div class="cart-item-price">${unit} ${currentCurrency === "PLN" ? "zł" : "грн"} / шт.</div>
            </div>
            <div class="qty-controls">
                <button type="button" onclick="changeQty('${id}', -1)">−</button>
                <span>${qty}</span>
                <button type="button" onclick="changeQty('${id}', 1)">+</button>
            </div>
            <button type="button" class="close-btn" style="position:static;font-size:16px;" onclick="removeFromCart('${id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    }).join("");

    body.innerHTML = `
        <div class="cart-items">${itemsHtml}</div>
        <div class="cart-summary">
            <span>Разом</span>
            <span class="cart-summary-total">${total} ${currentCurrency === "PLN" ? "zł" : "грн"}</span>
        </div>
        <button type="button" class="btn btn-primary" style="width:100%;" onclick="openCheckoutModal()">
            <i class="fa-solid fa-arrow-right"></i> Оформити замовлення
        </button>
    `;
}

// ============================================================================
// Чекаут
// ============================================================================

let checkoutCountry = "PL";
let checkoutDelivery = "";
let checkoutPayment = "";

function openCheckoutModal() {
    checkoutCountry = "PL"; checkoutDelivery = ""; checkoutPayment = "";
    document.getElementById("checkoutModalBody").innerHTML = buildCheckoutForm();
    closeModal("cartModal");
    openModal("checkoutModal");
}

function buildCheckoutForm() {
    return `
    <div class="form-group">
        <span class="field-label">Країна доставки</span>
        <div class="radio-group">
            <div class="radio-option active" id="countryPL" onclick="setCheckoutCountry('PL')">🇵🇱 Польща</div>
            <div class="radio-option" id="countryUA" onclick="setCheckoutCountry('UA')">🇺🇦 Україна</div>
        </div>
    </div>

    <div class="form-row">
        <div class="form-group">
            <span class="field-label">Ім'я</span>
            <input type="text" id="custFirstName" placeholder="Ім'я">
        </div>
        <div class="form-group">
            <span class="field-label">Прізвище</span>
            <input type="text" id="custLastName" placeholder="Прізвище">
        </div>
    </div>

    <div class="form-group">
        <span class="field-label">Телефон</span>
        <input type="tel" id="custPhone" placeholder="+48 123 456 789">
    </div>

    <div class="form-group">
        <span class="field-label">Email</span>
        <input type="email" id="custEmail" placeholder="you@example.com">
    </div>

    <div id="deliveryFieldsContainer"></div>

    <div class="form-group">
        <span class="field-label">Спосіб оплати</span>
        <div class="radio-group" id="paymentOptions"></div>
    </div>

    <button type="button" class="btn btn-primary" style="width:100%;" onclick="submitOrder()" id="submitOrderBtn">
        <i class="fa-solid fa-paper-plane"></i> Підтвердити замовлення
    </button>
    ${!WORKER_URL ? `<p style="font-size:12px;color:var(--text-muted);margin-top:10px;text-align:center;">Прийом замовлень ще не підключено до Telegram — це наступний крок налаштування.</p>` : ""}
    `;
}

function setCheckoutCountry(country) {
    checkoutCountry = country;
    document.getElementById("countryPL").classList.toggle("active", country === "PL");
    document.getElementById("countryUA").classList.toggle("active", country === "UA");
    renderDeliveryFields();
    renderPaymentOptions();
}

function renderDeliveryFields() {
    const el = document.getElementById("deliveryFieldsContainer");
    if (checkoutCountry === "PL") {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">Спосіб доставки</span>
            <select id="deliveryMethod">
                <option value="inpost">InPost Paczkomat</option>
                <option value="dpd">DPD — кур'єр</option>
                <option value="poczta">Poczta Polska</option>
            </select>
        </div>
        <div class="form-group">
            <span class="field-label">Номер поштомату / адреса</span>
            <input type="text" id="deliveryDetails" placeholder="напр. WAW45A або повна адреса">
        </div>`;
    } else {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">Спосіб доставки</span>
            <select id="deliveryMethod">
                <option value="novaposhta">Нова Пошта</option>
                <option value="ukrposhta">Укрпошта</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <span class="field-label">Місто</span>
                <input type="text" id="deliveryCity" placeholder="Місто">
            </div>
            <div class="form-group">
                <span class="field-label">Відділення / індекс</span>
                <input type="text" id="deliveryDetails" placeholder="№ відділення або індекс">
            </div>
        </div>`;
    }
    renderDeliveryFields._bound = true;
    setCheckoutDeliveryDefault();
}

function setCheckoutDeliveryDefault() {
    const select = document.getElementById("deliveryMethod");
    if (select) checkoutDelivery = select.value;
}

function renderPaymentOptions() {
    const el = document.getElementById("paymentOptions");
    const options = checkoutCountry === "PL"
        ? [{ id: "blik", label: "BLIK" }, { id: "transfer_pl", label: "Переказ на рахунок" }]
        : [{ id: "card_ua", label: "Картка Monobank/Приват" }];
    el.innerHTML = options.map((o, i) => `
        <div class="radio-option ${i === 0 ? 'active' : ''}" data-payment="${o.id}" onclick="setCheckoutPayment('${o.id}', this)">${o.label}</div>
    `).join("");
    checkoutPayment = options[0].id;
}

function setCheckoutPayment(id, el) {
    checkoutPayment = id;
    document.querySelectorAll('[data-payment]').forEach(n => n.classList.remove("active"));
    el.classList.add("active");
}

// ініціалізація полів доставки/оплати при першому відкритті
document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "checkoutModal") return;
});

async function submitOrder() {
    const firstName = document.getElementById("custFirstName").value.trim();
    const lastName = document.getElementById("custLastName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const deliveryMethodEl = document.getElementById("deliveryMethod");
    const deliveryMethod = deliveryMethodEl ? deliveryMethodEl.value : "";
    const deliveryDetails = document.getElementById("deliveryDetails")?.value.trim() || "";
    const deliveryCity = document.getElementById("deliveryCity")?.value.trim() || "";

    if (!firstName || !phone) {
        alert("Заповніть, будь ласка, ім'я та телефон.");
        return;
    }

    const cart = loadCart();
    const ids = Object.keys(cart);
    if (!ids.length) { alert("Кошик порожній."); return; }

    let total = 0;
    const lines = ids.map(id => {
        const p = allProducts.find(x => x.id === id);
        const qty = cart[id];
        const unit = priceOf(p);
        total += unit * qty;
        return `• ${p.name} (${qty} шт.) — ${unit * qty} ${currentCurrency === "PLN" ? "PLN" : "UAH"}`;
    }).join("\n");

    const message = `📦 НОВЕ ЗАМОВЛЕННЯ\n\n🛍 Товари:\n${lines}\n💰 Разом: ${total} ${currentCurrency === "PLN" ? "PLN" : "UAH"}\n\n👤 Покупець: ${firstName} ${lastName}\n📞 Тел: ${phone}\n📧 Email: ${email || "не вказано"}\n\n🚚 Доставка: ${checkoutCountry === "PL" ? "Польща" : "Україна"} — ${deliveryMethod}${deliveryCity ? ", " + deliveryCity : ""}${deliveryDetails ? ", " + deliveryDetails : ""}\n💳 Оплата: ${checkoutPayment}`;

    if (!WORKER_URL) {
        console.log(message);
        alert("Дякуємо! (Тестовий режим — бекенд для Telegram ще не підключено, замовлення виведено в консоль браузера.)");
        return;
    }

    const btn = document.getElementById("submitOrderBtn");
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Відправка...`;

    try {
        const res = await fetch(`${WORKER_URL}/api/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });
        if (res.ok) {
            localStorage.removeItem(CART_KEY);
            updateCartBadge();
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Замовлення надіслано!`;
            setTimeout(() => closeModal("checkoutModal"), 1200);
        } else {
            throw new Error("bad status");
        }
    } catch (err) {
        alert("Не вдалося надіслати замовлення. Спробуйте ще раз.");
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Підтвердити замовлення`;
    }
}

// патч: після рендеру форми одразу малюємо поля доставки/оплати
const _origBuildCheckoutForm = buildCheckoutForm;

// ============================================================================
// Утиліти
// ============================================================================

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
}
function escapeAttr(str) {
    if (!str) return "";
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================================
// Старт
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    setCurrency(currentCurrency);
    initCatalog();
    updateCartBadge();

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    }
});

// довизначаємо: одразу після відкриття чекаут-форми рендеримо поля доставки/оплати
const _openCheckoutModal = openCheckoutModal;
openCheckoutModal = function () {
    _openCheckoutModal();
    renderDeliveryFields();
    renderPaymentOptions();
};
