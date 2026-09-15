// ============================================================================
// Стан
// ============================================================================

// Адреса Cloudflare Worker (з'явиться після деплою — встав сюди).
const WORKER_URL = "https://rebottle-worker.rdrapak9.workers.dev";

const ADMIN_KEY_STORAGE = "rebottleAdminUploadKey";

function getAdminKey() {
    let key = localStorage.getItem(ADMIN_KEY_STORAGE);
    if (!key) {
        key = prompt("Ключ доступу для завантаження фото (той самий, що задав в Cloudflare Worker як ADMIN_KEY):");
        if (key) localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
    }
    return (key || "").trim();
}

function resetAdminKey() {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
}

let allCategories = [];
let allProducts = [];
let editingId = null;
let pendingImageFile = null;

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

const AUTH_ERROR_MESSAGES = {
    "auth/invalid-email": "Некоректний email.",
    "auth/user-not-found": "Користувача з таким email не знайдено.",
    "auth/wrong-password": "Невірний пароль.",
    "auth/invalid-credential": "Невірний email або пароль.",
    "auth/too-many-requests": "Забагато спроб входу. Спробуйте пізніше."
};

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");

    errorEl.textContent = "";
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Вхід...`;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
        errorEl.textContent = AUTH_ERROR_MESSAGES[err.code] || "Не вдалося увійти.";
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Увійти`;
    }
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

// ============================================================================
// Категорії
// ============================================================================

async function loadCategories() {
    const snap = await db.collection("categories").orderBy("order").get();
    allCategories = snap.docs.map(doc => ({ slug: doc.id, ...doc.data() }));
    renderCategories();
}

function renderCategories() {
    const el = document.getElementById("adminCategoriesList");
    el.innerHTML = allCategories.length === 0
        ? `<span class="admin-category-empty">Категорій ще немає — додай першу.</span>`
        : allCategories.map(c => `
            <span class="admin-category-chip">
                ${escapeHtml(c.label)}
                <button type="button" onclick="deleteCategory('${escapeAttr(c.slug)}')" title="Видалити"><i class="fa-solid fa-xmark"></i></button>
            </span>
        `).join("");

    const select = document.getElementById("fCategory");
    if (select) {
        const current = select.value;
        select.innerHTML = buildCategoryOptions(current);
    }
}

function buildCategoryOptions(selected) {
    if (!allCategories.length) return `<option value="">Спершу додай категорію</option>`;
    return allCategories.map(c => `<option value="${escapeAttr(c.slug)}" ${c.slug === selected ? "selected" : ""}>${escapeHtml(c.label)}</option>`).join("");
}

async function addCategoryPrompt() {
    const label = prompt("Назва категорії (напр. «Стакани та бокали»):");
    if (!label || !label.trim()) return;
    const slug = slugify(label);
    if (allCategories.some(c => c.slug === slug)) { alert("Категорія з таким кодом уже існує."); return; }
    await db.collection("categories").doc(slug).set({ label: label.trim(), order: allCategories.length });
    await loadCategories();
}

async function deleteCategory(slug) {
    const inUse = allProducts.filter(p => p.category === slug).length;
    const warn = inUse > 0 ? `У цій категорії ${inUse} товар(и) — вони лишаться без категорії. Видалити?` : "Видалити цю категорію?";
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
// Товари — список
// ============================================================================

async function loadProducts() {
    const listEl = document.getElementById("adminProductsList");
    const snap = await db.collection("products").orderBy("createdAt", "desc").get();
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    document.getElementById("productsCountTitle").textContent = `Товари (${allProducts.length})`;

    if (!allProducts.length) {
        listEl.innerHTML = `<div class="admin-loading">Товарів ще немає — додай перший.</div>`;
        return;
    }

    listEl.innerHTML = allProducts.map(p => `
        <div class="admin-product-row">
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="">` : `<div class="admin-product-row-info" style="flex:0 0 52px;"></div>`}
            <div class="admin-product-row-info">
                <div class="admin-product-row-title">${escapeHtml(p.name)}</div>
                <div class="admin-product-row-meta">${escapeHtml(CATEGORY_LABEL(p.category))} · ${p.inStock === false ? '❌ немає в наявності' : '✅ в наявності'}</div>
            </div>
            <div class="admin-product-row-price">${p.pricePLN ?? 0} zł / ${p.priceUAH ?? 0} грн</div>
            <div class="admin-product-row-actions">
                <button type="button" class="admin-row-btn" onclick="openProductForm('${p.id}')" title="Редагувати"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="admin-row-btn" onclick="toggleStock('${p.id}')" title="Змінити наявність"><i class="fa-solid fa-toggle-on"></i></button>
                <button type="button" class="admin-row-btn" onclick="removeProduct('${p.id}')" title="Видалити"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function CATEGORY_LABEL(slug) {
    const c = allCategories.find(c => c.slug === slug);
    return c ? c.label : (slug || "без категорії");
}

async function toggleStock(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    await db.collection("products").doc(id).update({ inStock: p.inStock === false ? true : false });
    await loadProducts();
}

async function removeProduct(id) {
    if (!confirm("Видалити товар остаточно?")) return;
    await db.collection("products").doc(id).delete();
    await loadProducts();
}

// ============================================================================
// Форма товару (додавання / редагування)
// ============================================================================

function openProductForm(id) {
    editingId = id || null;
    pendingImageFile = null;
    const product = id ? allProducts.find(p => p.id === id) : null;

    document.getElementById("productFormBody").innerHTML = `
        <div class="admin-form-title">${product ? "Редагувати товар" : "Новий товар"}</div>
        <form id="productForm">
            <div class="admin-image-upload" id="imageSlot">
                ${product && product.imageUrl ? `<img src="${product.imageUrl}" alt="">` : `<div class="slot-placeholder"><i class="fa-solid fa-camera"></i>Фото товару</div>`}
                <input type="file" accept="image/*" onchange="handleImageSelect(event)">
            </div>

            <div class="form-group">
                <span class="field-label">Назва товару</span>
                <input type="text" id="fName" value="${product ? escapeAttr(product.name) : ""}" placeholder="напр. Стакан з пляшки Jameson">
            </div>

            <div class="form-group">
                <span class="field-label">Категорія</span>
                <select id="fCategory">${buildCategoryOptions(product ? product.category : "")}</select>
            </div>

            <div class="admin-form-row">
                <div class="form-group">
                    <span class="field-label">Ціна, PLN</span>
                    <input type="number" id="fPricePLN" value="${product ? product.pricePLN ?? "" : ""}" placeholder="40">
                </div>
                <div class="form-group">
                    <span class="field-label">Ціна, UAH</span>
                    <input type="number" id="fPriceUAH" value="${product ? product.priceUAH ?? "" : ""}" placeholder="400">
                </div>
            </div>

            <div class="form-group">
                <span class="field-label">Опис</span>
                <textarea id="fDescription" rows="3" placeholder="Об'єм 350 мл, відшліфований край">${product ? escapeHtml(product.description || "") : ""}</textarea>
            </div>

            <div class="form-group">
                <span class="field-label">Наявність</span>
                <div class="stock-toggle-group" id="stockToggle" data-value="${product ? product.inStock !== false : true}">
                    <button type="button" class="stock-toggle-option in-stock ${product ? product.inStock !== false : true ? 'active' : ''}" onclick="setStockToggle(true)"><i class="fa-solid fa-check"></i> В наявності</button>
                    <button type="button" class="stock-toggle-option out-of-stock ${product && product.inStock === false ? 'active' : ''}" onclick="setStockToggle(false)"><i class="fa-solid fa-xmark"></i> Немає</button>
                </div>
            </div>

            <div class="admin-form-error" id="productFormError"></div>
            <div class="admin-save-status" id="productSaveStatus"></div>

            <button type="submit" class="btn btn-primary" style="width:100%;" id="productSaveBtn">
                <i class="fa-solid fa-floppy-disk"></i> Зберегти товар
            </button>
        </form>
    `;

    document.getElementById("productForm").addEventListener("submit", saveProduct);
    openModal("productModal");
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
    pendingImageFile = null;
}

// ---- фото: стискаємо і завантажуємо через Cloudflare Worker у R2 ----

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
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Не вдалося обробити фото")), "image/jpeg", quality);
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

async function uploadImageToWorker(blob, productSlug) {
    if (!WORKER_URL) throw new Error("WORKER_URL ще не задано в admin.js — спершу задеплой Cloudflare Worker.");
    const adminKey = getAdminKey();
    if (!adminKey) throw new Error("Потрібен ключ доступу для завантаження фото.");

    const fileBase64 = await blobToBase64(blob);
    const res = await fetch(`${WORKER_URL}/api/admin/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ fileBase64, fileName: "photo.jpg", mime: "image/jpeg", path: `products/${productSlug}` })
    });

    if (res.status === 401) { resetAdminKey(); throw new Error("Невірний ключ доступу — спробуй ще раз і введи ADMIN_KEY заново."); }
    if (!res.ok) throw new Error("Помилка завантаження фото на сервер.");

    const data = await res.json();
    return data.url;
}

async function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const slot = document.getElementById("imageSlot");
    slot.classList.add("compressing");
    try {
        pendingImageFile = await compressImageToBlob(file);
        const previewUrl = URL.createObjectURL(pendingImageFile);
        const existingImg = slot.querySelector("img");
        const placeholder = slot.querySelector(".slot-placeholder");
        if (existingImg) existingImg.src = previewUrl;
        else {
            const img = document.createElement("img");
            img.src = previewUrl;
            slot.insertBefore(img, slot.firstChild);
            if (placeholder) placeholder.remove();
        }
    } catch (err) {
        alert(err.message);
    } finally {
        slot.classList.remove("compressing");
    }
}

async function saveProduct(e) {
    e.preventDefault();
    const errorEl = document.getElementById("productFormError");
    const statusEl = document.getElementById("productSaveStatus");
    const btn = document.getElementById("productSaveBtn");
    errorEl.classList.remove("visible");

    const name = document.getElementById("fName").value.trim();
    const category = document.getElementById("fCategory").value;
    const pricePLN = parseFloat(document.getElementById("fPricePLN").value) || 0;
    const priceUAH = parseFloat(document.getElementById("fPriceUAH").value) || 0;
    const description = document.getElementById("fDescription").value.trim();
    const inStock = document.getElementById("stockToggle").dataset.value !== "false";

    if (!name || !category || !pricePLN) {
        errorEl.textContent = "Заповніть назву, категорію і ціну в PLN.";
        errorEl.classList.add("visible");
        return;
    }

    const existing = editingId ? allProducts.find(p => p.id === editingId) : null;
    if (!editingId && !pendingImageFile) {
        errorEl.textContent = "Додайте фото товару.";
        errorEl.classList.add("visible");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Збереження...`;

    let imageUrl = existing ? (existing.imageUrl || null) : null;

    if (pendingImageFile) {
        statusEl.textContent = "Завантажуємо фото...";
        try {
            imageUrl = await uploadImageToWorker(pendingImageFile, editingId || slugify(name));
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.add("visible");
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Зберегти товар`;
            statusEl.textContent = "";
            return;
        }
    }

    statusEl.textContent = "Зберігаємо картку товару...";

    const data = {
        name, category, pricePLN, priceUAH, description, inStock, imageUrl,
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
// Модалка (спільна з сайтом)
// ============================================================================

function openModal(id) { document.getElementById(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(id) { document.getElementById(id).classList.remove("open"); document.body.style.overflow = ""; }

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
