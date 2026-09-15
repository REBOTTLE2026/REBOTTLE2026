// ============================================================================
// Налаштування
// ============================================================================

const WORKER_URL = "https://rebottle-worker.rdrapak9.workers.dev";
const ADMIN_KEY_STORAGE = "rebottleAdminUploadKey";
const MAX_IMAGES = 4;

let allCategories = [];
let allProducts = [];
let editingId = null;
let pendingImages = [null, null, null, null];  // Blob або null
let existingImages = ["", "", "", ""];          // URL або ""

function getAdminKey() {
    let key = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!key) {
        key = prompt("Ключ доступу для завантаження фото (ADMIN_KEY з Cloudflare Worker):");
        if (key) localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
    }
    return (key || "").trim();
}
function resetAdminKey() { localStorage.removeItem(ADMIN_KEY_STORAGE); }

// ============================================================================
// Автентифікація
// ============================================================================

auth.onAuthStateChanged(async (user) => {
    const loginScreen = document.getElementById("loginScreen");
    const dashboard = document.getElementById("dashboard");
    if (user) {
        loginScreen.style.display = "none";
        dashboard.style.display = "block";
        await loadCategories();
        await loadProducts();
    } else {
        loginScreen.style.display = "flex";
        dashboard.style.display = "none";
    }
});

const AUTH_ERRORS = {
    "auth/invalid-email": "Некоректний email.",
    "auth/user-not-found": "Користувача не знайдено.",
    "auth/wrong-password": "Невірний пароль.",
    "auth/invalid-credential": "Невірний email або пароль.",
    "auth/too-many-requests": "Забагато спроб. Спробуйте пізніше."
};

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");
    errorEl.textContent = "";
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Вхід...`;
    try {
        await auth.signInWithEmailAndPassword(
            document.getElementById("loginEmail").value.trim(),
            document.getElementById("loginPassword").value
        );
    } catch (err) {
        errorEl.textContent = AUTH_ERRORS[err.code] || "Не вдалося увійти.";
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Увійти`;
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

// ============================================================================
// Категорії (двомовні)
// ============================================================================

async function loadCategories() {
    const snap = await db.collection("categories").orderBy("order").get();
    allCategories = snap.docs.map(d => ({ slug: d.id, ...d.data() }));
    renderCategories();
}

function catLabel(c, lang) {
    if (!c) return "";
    if (typeof c.label === "string") return c.label;
    return (c.label && (c.label[lang] || c.label.ua)) || c.slug;
}

function renderCategories() {
    const el = document.getElementById("adminCategoriesList");
    el.innerHTML = allCategories.length === 0
        ? `<span class="admin-category-empty">Категорій ще немає — додай першу.</span>`
        : allCategories.map(c => `
            <span class="admin-category-chip">
                ${escapeHtml(catLabel(c, "ua"))}
                <small>/ ${escapeHtml(catLabel(c, "pl"))}</small>
                <button type="button" onclick="deleteCategory('${escapeAttr(c.slug)}')" title="Видалити"><i class="fa-solid fa-xmark"></i></button>
            </span>`).join("");

    const select = document.getElementById("fCategory");
    if (select) select.innerHTML = buildCategoryOptions(select.value);
}

function buildCategoryOptions(selected) {
    if (!allCategories.length) return `<option value="">Спершу додай категорію</option>`;
    return allCategories.map(c =>
        `<option value="${escapeAttr(c.slug)}" ${c.slug === selected ? "selected" : ""}>${escapeHtml(catLabel(c, "ua"))}</option>`
    ).join("");
}

async function addCategoryPrompt() {
    const ua = prompt("Назва категорії українською (напр. «Стакани та бокали»):");
    if (!ua || !ua.trim()) return;
    const pl = prompt("Ta sama kategoria po polsku (np. «Szklanki i kieliszki»):", "");
    const slug = slugify(ua);
    if (allCategories.some(c => c.slug === slug)) { showToast("Така категорія вже існує", true); return; }

    await db.collection("categories").doc(slug).set({
        label: { ua: ua.trim(), pl: (pl || ua).trim() },
        order: allCategories.length
    });
    await loadCategories();
    showToast("Категорію додано");
}

async function deleteCategory(slug) {
    const inUse = allProducts.filter(p => p.category === slug).length;
    const warn = inUse > 0
        ? `У цій категорії ${inUse} товар(и) — вони лишаться без категорії. Видалити?`
        : "Видалити цю категорію?";
    if (!confirm(warn)) return;
    await db.collection("categories").doc(slug).delete();
    await loadCategories();
}

function slugify(str) {
    const map = { а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia' };
    return str.toLowerCase().split('').map(ch => map[ch] !== undefined ? map[ch] : ch).join('')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'category';
}

// ============================================================================
// Список товарів
// ============================================================================

async function loadProducts() {
    const listEl = document.getElementById("adminProductsList");
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById("productsCountTitle").textContent = `Товари (${allProducts.length})`;

    if (!allProducts.length) {
        listEl.innerHTML = `<div class="admin-loading">Товарів ще немає — додай перший.</div>`;
        return;
    }

    listEl.innerHTML = allProducts.map(p => {
        const imgs = (p.images || []).filter(Boolean);
        const name = typeof p.name === "string" ? p.name : (p.name?.ua || p.name?.pl || "");
        const cat = allCategories.find(c => c.slug === p.category);
        return `
        <div class="admin-product-row">
            ${imgs.length ? `<img src="${escapeAttr(imgs[0])}" alt="">` : `<div style="width:54px;height:54px;border-radius:10px;background:var(--bg-well);flex-shrink:0;"></div>`}
            <div class="admin-product-row-info">
                <div class="admin-product-row-title">${escapeHtml(name)}</div>
                <div class="admin-product-row-meta">
                    ${p.article ? escapeHtml(p.article) + " · " : ""}${escapeHtml(cat ? catLabel(cat, "ua") : "без категорії")}
                    · ${imgs.length} фото · ${p.inStock === false ? "❌ немає" : "✅ в наявності"}
                </div>
            </div>
            <div class="admin-product-row-price">
                ${p.priceUAH ?? 0} грн
                <small>${p.pricePLN ?? 0} zł</small>
            </div>
            <div class="admin-product-row-actions">
                <button type="button" class="admin-row-btn" onclick="openProductForm('${p.id}')" title="Редагувати"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="admin-row-btn" onclick="toggleStock('${p.id}')" title="Наявність"><i class="fa-solid fa-toggle-on"></i></button>
                <button type="button" class="admin-row-btn danger" onclick="removeProduct('${p.id}')" title="Видалити"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>`;
    }).join("");
}

async function toggleStock(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    await db.collection("products").doc(id).update({ inStock: p.inStock === false });
    await loadProducts();
    showToast("Наявність оновлено");
}

async function removeProduct(id) {
    if (!confirm("Видалити товар остаточно?")) return;
    await db.collection("products").doc(id).delete();
    await loadProducts();
    showToast("Товар видалено");
}

// ============================================================================
// Форма товару
// ============================================================================

function openProductForm(id) {
    editingId = id || null;
    pendingImages = [null, null, null, null];
    const p = id ? allProducts.find(x => x.id === id) : null;

    existingImages = ["", "", "", ""];
    if (p) {
        const imgs = (p.images || (p.imageUrl ? [p.imageUrl] : [])).filter(Boolean);
        imgs.slice(0, MAX_IMAGES).forEach((url, i) => { existingImages[i] = url; });
    }

    const nameUA = typeof p?.name === "string" ? p.name : (p?.name?.ua || "");
    const namePL = typeof p?.name === "string" ? "" : (p?.name?.pl || "");
    const descUA = typeof p?.description === "string" ? p.description : (p?.description?.ua || "");
    const descPL = typeof p?.description === "string" ? "" : (p?.description?.pl || "");
    const charUA = p?.characteristics?.ua || (typeof p?.characteristics === "string" ? p.characteristics : "");
    const charPL = p?.characteristics?.pl || "";

    document.getElementById("productFormBody").innerHTML = `
        <div class="admin-form-title">${p ? "Редагувати товар" : "Новий товар"}</div>
        <form id="productForm">
            <span class="field-label" style="margin-bottom:8px;display:block;">Фото (1-е — головне, показується на картці)</span>
            <div class="admin-image-uploads">
                ${[0,1,2,3].map(i => `
                    <div class="admin-image-slot ${i === 0 ? "main-slot" : ""}" id="slot${i}">
                        ${existingImages[i]
                            ? `<img src="${escapeAttr(existingImages[i])}" alt="">
                               <button type="button" class="slot-remove" onclick="clearSlot(${i}, event)"><i class="fa-solid fa-xmark"></i></button>`
                            : `<div class="slot-placeholder"><i class="fa-solid fa-camera"></i>${i === 0 ? "Головне" : "Фото " + (i + 1)}</div>`}
                        <input type="file" accept="image/*" onchange="handleImageSelect(event, ${i})">
                    </div>`).join("")}
            </div>

            <div class="form-group" style="margin-top:16px;">
                <span class="field-label">Артикул</span>
                <input type="text" id="fArticle" value="${escapeAttr(p?.article || "")}" placeholder="напр. RB-001">
            </div>

            <div class="form-group">
                <span class="field-label">Категорія</span>
                <select id="fCategory">${buildCategoryOptions(p?.category || "")}</select>
            </div>

            <div class="lang-tabs">
                <button type="button" class="lang-tab active" onclick="switchLangPane('ua', this)">🇺🇦 Українська</button>
                <button type="button" class="lang-tab" onclick="switchLangPane('pl', this)">🇵🇱 Polski</button>
            </div>

            <div class="lang-pane active" id="pane-ua">
                <div class="form-group">
                    <span class="field-label">Назва (UA)</span>
                    <input type="text" id="fNameUA" value="${escapeAttr(nameUA)}" placeholder="Стакан з пляшки Jameson">
                </div>
                <div class="form-group">
                    <span class="field-label">Опис (UA)</span>
                    <textarea id="fDescUA" rows="4" placeholder="Історія виробу, як зроблено, для чого підходить">${escapeHtml(descUA)}</textarea>
                </div>
                <div class="form-group">
                    <span class="field-label">Характеристики (UA) — кожна з нового рядка</span>
                    <textarea id="fCharUA" rows="5" placeholder="Матеріал: скло\nВисота: 9 см\nОб'єм: 200 мл\nДоставка: за рахунок покупця">${escapeHtml(charUA)}</textarea>
                </div>
            </div>

            <div class="lang-pane" id="pane-pl">
                <div class="form-group">
                    <span class="field-label">Nazwa (PL)</span>
                    <input type="text" id="fNamePL" value="${escapeAttr(namePL)}" placeholder="Szklanka z butelki Jameson">
                </div>
                <div class="form-group">
                    <span class="field-label">Opis (PL)</span>
                    <textarea id="fDescPL" rows="4" placeholder="Historia wyrobu, jak zrobiony, do czego pasuje">${escapeHtml(descPL)}</textarea>
                </div>
                <div class="form-group">
                    <span class="field-label">Specyfikacja (PL) — każda w nowej linii</span>
                    <textarea id="fCharPL" rows="5" placeholder="Materiał: szkło\nWysokość: 9 cm\nPojemność: 200 ml">${escapeHtml(charPL)}</textarea>
                </div>
            </div>

            <div class="admin-form-row">
                <div class="form-group">
                    <span class="field-label">Ціна, UAH</span>
                    <input type="number" id="fPriceUAH" value="${p?.priceUAH ?? ""}" placeholder="477">
                </div>
                <div class="form-group">
                    <span class="field-label">Ціна, PLN</span>
                    <input type="number" id="fPricePLN" value="${p?.pricePLN ?? ""}" placeholder="40">
                </div>
            </div>

            <div class="admin-form-row">
                <div class="form-group">
                    <span class="field-label">Стара ціна, UAH (необов'язково)</span>
                    <input type="number" id="fOldPriceUAH" value="${p?.oldPriceUAH ?? ""}" placeholder="600">
                </div>
                <div class="form-group">
                    <span class="field-label">Стара ціна, PLN (необов'язково)</span>
                    <input type="number" id="fOldPricePLN" value="${p?.oldPricePLN ?? ""}" placeholder="52">
                </div>
            </div>

            <div class="form-group">
                <span class="field-label">Наявність</span>
                <div class="stock-toggle-group" id="stockToggle" data-value="${p ? p.inStock !== false : true}">
                    <button type="button" class="stock-toggle-option in-stock ${!p || p.inStock !== false ? "active" : ""}" onclick="setStockToggle(true)">
                        <i class="fa-solid fa-check"></i> В наявності</button>
                    <button type="button" class="stock-toggle-option out-of-stock ${p && p.inStock === false ? "active" : ""}" onclick="setStockToggle(false)">
                        <i class="fa-solid fa-xmark"></i> Немає</button>
                </div>
            </div>

            <div class="admin-form-error" id="productFormError"></div>
            <div class="admin-save-status" id="productSaveStatus"></div>

            <button type="submit" class="btn btn-primary btn-block" id="productSaveBtn">
                <i class="fa-solid fa-floppy-disk"></i> Зберегти товар
            </button>
        </form>`;

    document.getElementById("productForm").addEventListener("submit", saveProduct);
    openModal("productModal");
}

function switchLangPane(lang, btn) {
    document.querySelectorAll(".lang-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".lang-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("pane-" + lang).classList.add("active");
}

function setStockToggle(value) {
    const group = document.getElementById("stockToggle");
    group.dataset.value = value;
    group.querySelector(".in-stock").classList.toggle("active", value);
    group.querySelector(".out-of-stock").classList.toggle("active", !value);
}

function closeProductForm() {
    closeModal("productModal");
    editingId = null;
    pendingImages = [null, null, null, null];
}

// ---- фото ----

function compressImageToBlob(file, maxSize = 1400, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > height && width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; }
            else if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
            const canvas = document.createElement("canvas");
            canvas.width = width; canvas.height = height;
            canvas.getContext("2d").drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(objectUrl);
            canvas.toBlob(b => b ? resolve(b) : reject(new Error("Не вдалося обробити фото")), "image/jpeg", quality);
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Не вдалося обробити фото")); };
        img.src = objectUrl;
    });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function uploadImageToWorker(blob, slug) {
    const adminKey = getAdminKey();
    if (!adminKey) throw new Error("Потрібен ключ доступу для завантаження фото.");

    const fileBase64 = await blobToBase64(blob);
    const res = await fetch(`${WORKER_URL}/api/admin/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ fileBase64, fileName: "photo.jpg", mime: "image/jpeg", path: `products/${slug}` })
    });

    if (res.status === 401) { resetAdminKey(); throw new Error("Невірний ADMIN_KEY — спробуй ще раз."); }
    if (!res.ok) throw new Error("Помилка завантаження фото.");
    return (await res.json()).url;
}

async function handleImageSelect(e, index) {
    const file = e.target.files[0];
    if (!file) return;
    const slot = document.getElementById("slot" + index);
    slot.classList.add("compressing");
    try {
        pendingImages[index] = await compressImageToBlob(file);
        const previewUrl = URL.createObjectURL(pendingImages[index]);
        slot.querySelector(".slot-placeholder")?.remove();
        let img = slot.querySelector("img");
        if (img) img.src = previewUrl;
        else {
            img = document.createElement("img");
            img.src = previewUrl;
            slot.insertBefore(img, slot.firstChild);
        }
        if (!slot.querySelector(".slot-remove")) {
            const rm = document.createElement("button");
            rm.type = "button";
            rm.className = "slot-remove";
            rm.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
            rm.onclick = (ev) => clearSlot(index, ev);
            slot.appendChild(rm);
        }
    } catch (err) {
        showToast(err.message, true);
    } finally {
        slot.classList.remove("compressing");
    }
}

function clearSlot(index, event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    pendingImages[index] = null;
    existingImages[index] = "";
    const slot = document.getElementById("slot" + index);
    slot.querySelector("img")?.remove();
    slot.querySelector(".slot-remove")?.remove();
    const ph = document.createElement("div");
    ph.className = "slot-placeholder";
    ph.innerHTML = `<i class="fa-solid fa-camera"></i>${index === 0 ? "Головне" : "Фото " + (index + 1)}`;
    slot.insertBefore(ph, slot.firstChild);
    const input = slot.querySelector('input[type="file"]');
    if (input) input.value = "";
}

// ---- збереження ----

async function saveProduct(e) {
    e.preventDefault();
    const errorEl = document.getElementById("productFormError");
    const statusEl = document.getElementById("productSaveStatus");
    const btn = document.getElementById("productSaveBtn");
    errorEl.classList.remove("visible");

    const article = val("fArticle");
    const category = val("fCategory");
    const nameUA = val("fNameUA"), namePL = val("fNamePL");
    const descUA = val("fDescUA"), descPL = val("fDescPL");
    const charUA = val("fCharUA"), charPL = val("fCharPL");
    const priceUAH = parseFloat(val("fPriceUAH")) || 0;
    const pricePLN = parseFloat(val("fPricePLN")) || 0;
    const oldPriceUAH = parseFloat(val("fOldPriceUAH")) || 0;
    const oldPricePLN = parseFloat(val("fOldPricePLN")) || 0;
    const inStock = document.getElementById("stockToggle").dataset.value !== "false";

    if (!nameUA || !category || (!priceUAH && !pricePLN)) {
        errorEl.textContent = "Заповніть назву (UA), категорію і хоча б одну ціну.";
        errorEl.classList.add("visible");
        return;
    }

    const hasAnyImage = pendingImages.some(Boolean) || existingImages.some(Boolean);
    if (!hasAnyImage) {
        errorEl.textContent = "Додайте хоча б одне фото.";
        errorEl.classList.add("visible");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Збереження...`;

    const images = [];
    try {
        for (let i = 0; i < MAX_IMAGES; i++) {
            if (pendingImages[i]) {
                statusEl.textContent = `Завантажуємо фото ${i + 1}...`;
                images.push(await uploadImageToWorker(pendingImages[i], slugify(nameUA)));
            } else if (existingImages[i]) {
                images.push(existingImages[i]);
            }
        }
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add("visible");
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Зберегти товар`;
        statusEl.textContent = "";
        return;
    }

    statusEl.textContent = "Зберігаємо картку...";

    const data = {
        article,
        category,
        name: { ua: nameUA, pl: namePL || nameUA },
        description: { ua: descUA, pl: descPL || descUA },
        characteristics: { ua: charUA, pl: charPL || charUA },
        priceUAH, pricePLN, oldPriceUAH, oldPricePLN,
        images,
        inStock,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (editingId) {
            await db.collection("products").doc(editingId).update(data);
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection("products").add(data);
        }
        closeProductForm();
        await loadProducts();
        showToast("Товар збережено");
    } catch (err) {
        errorEl.textContent = "Помилка збереження: " + err.message;
        errorEl.classList.add("visible");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Зберегти товар`;
        statusEl.textContent = "";
    }
}

// ============================================================================
// Утиліти
// ============================================================================

function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; }
function openModal(id) { document.getElementById(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(id) { document.getElementById(id).classList.remove("open"); document.body.style.overflow = ""; }

let toastTimer = null;
function showToast(text, isError) {
    const toast = document.getElementById("toast");
    document.getElementById("toastText").textContent = text;
    toast.classList.toggle("error", !!isError);
    toast.querySelector("i").className = isError ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-check";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
}
function escapeAttr(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

document.addEventListener("click", (e) => {
    document.querySelectorAll(".modal.open").forEach(m => { if (e.target === m) closeModal(m.id); });
});
