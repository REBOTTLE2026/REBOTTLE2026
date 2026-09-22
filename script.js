// ============================================================================
// Налаштування
// ============================================================================

const WORKER_URL = "https://rebottle-worker.rdrapak9.workers.dev";

const LANG_KEY = "rebottleLang";
const CART_KEY = "rebottleCart";

let currentLang = localStorage.getItem(LANG_KEY) || "ua";
let currentCategory = "all";
let allProducts = [];
let allCategories = [];

// ============================================================================
// Словник інтерфейсу
// ============================================================================

const I18N = {
    ua: {
        categories: "Категорії", allProducts: "Всі товари", searchPlaceholder: "Пошук за назвою або артикулом...",
        support: "Підтримка", supportSub: "Ми на зв'язку", writeManager: "Написати менеджеру",
        channel: "Наш канал", channelSub: "Новинки та акції", cart: "Кошик",
        heroTitle: 'Друге життя <span class="accent">скляної пляшки</span>',
        heroLede: "Естетичний декор та посуд ручної роботи: унікальні стакани, бокали, соусниці, вази та підсвічники — кожен виріб відшліфований вручну і не має точної копії.",
        viewCatalog: "Переглянути каталог", aboutProduction: "Про виробництво",
        fact1: "відшліфовані краї", fact2: "виробництво і доставка", fact3: "однакових виробів",
        heroBadge: "🍾 Кожна пляшка отримує друге життя замість смітника",
        catalogEyebrow: "Каталог", catalogSub: "Кожен виріб унікальний — асортимент оновлюється щотижня.", showAll: "Показати всі",
        whyEyebrow: "Переваги", whyTitle: "Чому RE BOTTLE",
        adv1Title: "Безпечні краї", adv1Text: "Кожен виріб проходить кілька етапів шліфування — краї ідеально гладкі й безпечні у щоденному використанні.",
        adv2Title: "Ручна робота", adv2Text: "Кожна пляшка вирізається і обробляється вручну, тому текстура і форма кожного виробу трохи відрізняються.",
        adv3Title: "Друге життя скла", adv3Text: "Замість смітника — стакан на твоєму столі. Менше скляних відходів, більше речей з характером.",
        aboutEyebrow: "Про нас", aboutTitle: "Від пляшки до предмету, яким хочеться користуватись",
        aboutP1: "RE BOTTLE почався з простої ідеї: пляшка, яка інакше опинилась би в смітнику, може стати стаканом, вазою чи підсвічником — і служити роками. Виробництво базується в Польщі, продукція їде як полякам, так і в Україну.",
        aboutP2: "Кожен виріб проходить різку, шліфування країв у кілька етапів і фінальну поліровку — тому їх можна сміливо ставити на стіл щодня.",
        deliveryEyebrow: "Умови", deliveryTitle: "Доставка та оплата", poland: "Польща", ukraine: "Україна",
        plD1: "InPost Paczkomaty — за номером поштомату", plD2: "DPD / Poczta Polska — кур'єр або адреса", plD3: "Оплата: BLIK, переказ на карту або IBAN",
        uaD1: "Нова Пошта — відділення або поштомат", uaD2: "Укрпошта — за індексом", uaD3: "Оплата: переказ на картку",
        contactsTitle: "Питання щодо замовлення чи індивідуального виробу?",
        checkout: "Оформлення замовлення",
        inStock: "Є в наявності", outOfStock: "Немає в наявності",
        addToCart: "Додати в кошик", order: "Замовити", article: "Артикул",
        description: "Опис", characteristics: "Характеристики",
        cartEmpty: "Кошик порожній", total: "Разом", makeOrder: "Оформити замовлення",
        loading: "Завантаження каталогу...", nothingFound: "Нічого не знайдено",
        noProducts: "У цій категорії поки немає товарів",
        country: "Країна доставки", firstName: "Ім'я", lastName: "Прізвище", phone: "Телефон", email: "Email",
        recipient: "Отримувач", delivery: "Доставка", payment: "Оплата",
        deliveryMethod: "Спосіб доставки", city: "Місто", cityPlaceholder: "Почніть вводити назву міста або села",
        branch: "Відділення / поштомат", branchPlaceholder: "Спершу вкажіть місто, потім оберіть відділення",
        branchHint: "Почніть вводити номер або назву відділення — покажемо збіги для обраного міста",
        address: "Адреса", addressPlaceholder: "Вулиця, будинок, квартира, індекс",
        paczkomat: "Номер поштомату", paczkomatPlaceholder: "напр. WAW45A",
        paymentMethod: "Спосіб оплати", notes: "Примітки до замовлення (необов'язково)",
        notesPlaceholder: "Наприклад: зателефонувати перед відправкою",
        confirmOrder: "Підтвердити замовлення", sending: "Відправка...",
        requisites: "Реквізити для оплати", cardNumber: "Переказ на номер картки", iban: "IBAN", blikPhone: "BLIK на номер",
        copy: "Копіювати", copied: "Скопійовано", attachReceipt: "Прикріпіть квитанцію / скріншот оплати",
        chooseFile: "Натисніть, щоб обрати файл", fileChosen: "Файл додано",
        fillRequired: "Заповніть, будь ласка, ім'я та телефон", cartIsEmpty: "Кошик порожній",
        orderSent: "Замовлення надіслано! Ми зв'яжемося з вами найближчим часом.",
        orderError: "Не вдалося надіслати замовлення. Спробуйте ще раз.",
        linkCopied: "Посилання скопійовано", articleCopied: "Артикул скопійовано",
        addedToCart: "Додано в кошик", shareProduct: "Поділитися товаром",
        npCourier: "Кур'єр за адресою", npBranch: "Відділення Нової Пошти",
        cityFirst: "Спершу оберіть місто", nothing: "Збігів не знайдено",
        payCardUA: "Переказ на картку", payCOD: "Накладений платіж", payBlik: "BLIK", payTransferPL: "Переказ на карту / IBAN",
        pcs: "шт."
    },
    pl: {
        categories: "Kategorie", allProducts: "Wszystkie produkty", searchPlaceholder: "Szukaj po nazwie lub kodzie...",
        support: "Wsparcie", supportSub: "Jesteśmy w kontakcie", writeManager: "Napisz do nas",
        channel: "Nasz kanał", channelSub: "Nowości i promocje", cart: "Koszyk",
        heroTitle: 'Drugie życie <span class="accent">szklanej butelki</span>',
        heroLede: "Estetyczna dekoracja i naczynia ręcznie robione: wyjątkowe szklanki, kieliszki, miseczki, wazony i świeczniki — każdy wyrób jest ręcznie szlifowany i nie ma dokładnej kopii.",
        viewCatalog: "Zobacz katalog", aboutProduction: "O produkcji",
        fact1: "wyszlifowane krawędzie", fact2: "produkcja i dostawa", fact3: "identycznych wyrobów",
        heroBadge: "🍾 Każda butelka dostaje drugie życie zamiast śmietnika",
        catalogEyebrow: "Katalog", catalogSub: "Każdy wyrób jest wyjątkowy — asortyment aktualizujemy co tydzień.", showAll: "Pokaż wszystkie",
        whyEyebrow: "Zalety", whyTitle: "Dlaczego RE BOTTLE",
        adv1Title: "Bezpieczne krawędzie", adv1Text: "Każdy wyrób przechodzi kilka etapów szlifowania — krawędzie są idealnie gładkie i bezpieczne w codziennym użyciu.",
        adv2Title: "Ręczna robota", adv2Text: "Każda butelka jest cięta i obrabiana ręcznie, dlatego faktura i kształt każdego wyrobu nieco się różnią.",
        adv3Title: "Drugie życie szkła", adv3Text: "Zamiast śmietnika — szklanka na twoim stole. Mniej odpadów szklanych, więcej rzeczy z charakterem.",
        aboutEyebrow: "O nas", aboutTitle: "Od butelki do przedmiotu, którego chce się używać",
        aboutP1: "RE BOTTLE zaczął się od prostego pomysłu: butelka, która inaczej trafiłaby do śmietnika, może stać się szklanką, wazonem czy świecznikiem — i służyć latami. Produkcja mieści się w Polsce, wysyłamy zarówno po Polsce, jak i na Ukrainę.",
        aboutP2: "Każdy wyrób przechodzi cięcie, kilkuetapowe szlifowanie krawędzi i końcowe polerowanie — dlatego można ich śmiało używać na co dzień.",
        deliveryEyebrow: "Warunki", deliveryTitle: "Dostawa i płatność", poland: "Polska", ukraine: "Ukraina",
        plD1: "InPost Paczkomaty — po numerze paczkomatu", plD2: "DPD / Poczta Polska — kurier lub adres", plD3: "Płatność: BLIK, przelew na kartę lub IBAN",
        uaD1: "Nova Poshta — oddział lub paczkomat", uaD2: "Ukrposhta — po kodzie pocztowym", uaD3: "Płatność: przelew na kartę",
        contactsTitle: "Pytania dotyczące zamówienia lub wyrobu na zamówienie?",
        checkout: "Składanie zamówienia",
        inStock: "Dostępny", outOfStock: "Brak w magazynie",
        addToCart: "Dodaj do koszyka", order: "Zamów", article: "Kod",
        description: "Opis", characteristics: "Specyfikacja",
        cartEmpty: "Koszyk jest pusty", total: "Razem", makeOrder: "Złóż zamówienie",
        loading: "Ładowanie katalogu...", nothingFound: "Nic nie znaleziono",
        noProducts: "W tej kategorii nie ma jeszcze produktów",
        country: "Kraj dostawy", firstName: "Imię", lastName: "Nazwisko", phone: "Telefon", email: "Email",
        recipient: "Odbiorca", delivery: "Dostawa", payment: "Płatność",
        deliveryMethod: "Sposób dostawy", city: "Miasto", cityPlaceholder: "Zacznij wpisywać nazwę miasta",
        branch: "Oddział / paczkomat", branchPlaceholder: "Najpierw wskaż miasto, potem wybierz oddział",
        branchHint: "Zacznij wpisywać numer lub nazwę oddziału — pokażemy dopasowania",
        address: "Adres", addressPlaceholder: "Ulica, numer domu, mieszkanie, kod pocztowy",
        paczkomat: "Numer paczkomatu", paczkomatPlaceholder: "np. WAW45A",
        paymentMethod: "Sposób płatności", notes: "Uwagi do zamówienia (opcjonalnie)",
        notesPlaceholder: "Np. zadzwonić przed wysyłką",
        confirmOrder: "Potwierdź zamówienie", sending: "Wysyłanie...",
        requisites: "Dane do płatności", cardNumber: "Przelew na numer karty", iban: "IBAN", blikPhone: "BLIK na numer",
        copy: "Kopiuj", copied: "Skopiowano", attachReceipt: "Załącz potwierdzenie / zrzut ekranu płatności",
        chooseFile: "Kliknij, aby wybrać plik", fileChosen: "Plik dodany",
        fillRequired: "Proszę podać imię i telefon", cartIsEmpty: "Koszyk jest pusty",
        orderSent: "Zamówienie wysłane! Skontaktujemy się wkrótce.",
        orderError: "Nie udało się wysłać zamówienia. Spróbuj ponownie.",
        linkCopied: "Link skopiowany", articleCopied: "Kod skopiowany",
        addedToCart: "Dodano do koszyka", shareProduct: "Udostępnij produkt",
        npCourier: "Kurier pod adres", npBranch: "Oddział Nova Poshta",
        cityFirst: "Najpierw wybierz miasto", nothing: "Brak dopasowań",
        payCardUA: "Przelew na kartę", payCOD: "Za pobraniem", payBlik: "BLIK", payTransferPL: "Przelew na kartę / IBAN",
        pcs: "szt."
    }
};

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.ua[key] || key;
}

// ============================================================================
// Мова та валюта (UA → грн, PL → zł)
// ============================================================================

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === "pl" ? "pl" : "uk";

    document.getElementById("langUA").classList.toggle("active", lang === "ua");
    document.getElementById("langPL").classList.toggle("active", lang === "pl");

    applyTranslations();
    renderCategoryMenus();
    renderProducts(getFilteredProducts());
    if (document.getElementById("cartModal").classList.contains("open")) renderCartModalBody();
}

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = t(el.dataset.i18nTitle); });
    document.title = currentLang === "pl"
        ? "RE BOTTLE — Handmade Glass | Naczynia i dekoracje z butelek"
        : "RE BOTTLE — Handmade Glass | Посуд і декор з пляшок ручної роботи";
}

// мова визначає валюту
function currencyCode() { return currentLang === "pl" ? "PLN" : "UAH"; }
function currencyUnit() { return currentLang === "pl" ? "zł" : "грн"; }
function altUnit() { return currentLang === "pl" ? "грн" : "zł"; }

function priceOf(p) { return (currentLang === "pl" ? p.pricePLN : p.priceUAH) || 0; }
function oldPriceOf(p) { return (currentLang === "pl" ? p.oldPricePLN : p.oldPriceUAH) || 0; }
function altPriceOf(p) { return (currentLang === "pl" ? p.priceUAH : p.pricePLN) || 0; }

// назви/описи з підтримкою двох мов (рядок = стара структура, об'єкт = нова)
function localized(field) {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[currentLang] || field.ua || field.pl || "";
}

function discountPercent(p) {
    const now = priceOf(p), old = oldPriceOf(p);
    if (!old || old <= now) return 0;
    return Math.round((1 - now / old) * 100);
}

// ============================================================================
// Кошик
// ============================================================================

function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function updateCartBadge() {
    document.getElementById("cartCount").textContent = Object.values(loadCart()).reduce((s, q) => s + q, 0);
}

function addToCart(productId, btn) {
    const cart = loadCart();
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart(cart);
    updateCartBadge();
    showToast(t("addedToCart"));
    if (btn) {
        const original = btn.innerHTML;
        btn.classList.add("added");
        btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
        setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = original; }, 1000);
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
// Firestore — каталог
// ============================================================================

async function initCatalog() {
    const container = document.getElementById("products-container");
    container.innerHTML = `<div class="no-results"><i class="fa-solid fa-spinner fa-spin"></i>${t("loading")}</div>`;

    if (typeof db === "undefined") {
        container.innerHTML = `<div class="no-results"><i class="fa-solid fa-triangle-exclamation"></i>Каталог тимчасово недоступний.</div>`;
        return;
    }

    try {
        const [catSnap, prodSnap] = await Promise.all([
            db.collection("categories").orderBy("order").get(),
            db.collection("products").get()
        ]);

        allCategories = catSnap.docs.map(d => ({ slug: d.id, ...d.data() }));
        allProducts = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        renderCategoryMenus();
        renderProducts(getFilteredProducts());
        openProductFromUrl();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="no-results"><i class="fa-solid fa-triangle-exclamation"></i>Не вдалося завантажити каталог.</div>`;
    }
}

function categoryLabel(slug) {
    const c = allCategories.find(c => c.slug === slug);
    if (!c) return slug || "";
    return localized(c.label);
}

function renderCategoryMenus() {
    const menu = document.getElementById("categoryMenu");

    const items = [{ slug: "all", label: t("allProducts"), icon: "fa-border-all" }]
        .concat(allCategories.map(c => ({ slug: c.slug, label: localized(c.label), icon: "fa-tag" })));

    menu.innerHTML = items.map(i => `
        <button type="button" class="dropdown-menu-item ${i.slug === currentCategory ? "active" : ""}"
                onclick="filterCategory('${escapeAttr(i.slug)}')">
            <i class="fa-solid ${i.icon}"></i> ${escapeHtml(i.label)}
        </button>`).join("");
}

function filterCategory(slug) {
    currentCategory = slug;
    document.getElementById("categoryDropdown").classList.remove("open");
    document.getElementById("popoverBackdrop")?.classList.remove("open");
    document.getElementById("catalogTitle").textContent = slug === "all" ? t("allProducts") : categoryLabel(slug);
    renderCategoryMenus();
    renderProducts(getFilteredProducts());
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getFilteredProducts() {
    if (currentCategory === "all") return allProducts;
    return allProducts.filter(p => p.category === currentCategory);
}

// ============================================================================
// Рендер карток
// ============================================================================

function productImages(p) {
    if (Array.isArray(p.images) && p.images.length) return p.images.filter(Boolean);
    if (p.imageUrl) return [p.imageUrl];
    return [];
}

function renderProducts(products) {
    const container = document.getElementById("products-container");
    if (!products.length) {
        container.innerHTML = `<div class="no-results"><i class="fa-solid fa-wine-bottle"></i>${t("noProducts")}</div>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const imgs = productImages(p);
        const inStock = p.inStock !== false;
        const disc = discountPercent(p);
        const old = oldPriceOf(p);

        return `
        <div class="product-card" onclick="openProductModal('${p.id}')">
            <div class="product-card-img">
                ${inStock ? `<button type="button" class="card-cart-btn" title="${t("addToCart")}"
                        onclick="event.stopPropagation(); addToCart('${p.id}', this)">
                    <i class="fa-solid fa-cart-plus"></i></button>` : ""}
                ${imgs.length
                    ? `<img src="${escapeAttr(imgs[0])}" alt="${escapeAttr(localized(p.name))}" loading="lazy">`
                    : `<div class="img-fallback"><i class="fa-solid fa-wine-bottle"></i></div>`}
            </div>
            <div class="product-card-body">
                <div class="article-row" style="justify-content: space-between;">
                    <span>
                        ${p.article ? `<i class="fa-solid fa-barcode"></i> ${t("article")}: ${escapeHtml(p.article)}
                        <button type="button" class="article-copy" title="${t("copy")}"
                            onclick="event.stopPropagation(); copyText('${escapeAttr(p.article)}', this, '${t("articleCopied")}')">
                            <i class="fa-regular fa-copy"></i></button>` : ""}
                    </span>
                    <span class="stock-badge card-position ${inStock ? "in" : "out"}">
                        <i class="fa-solid ${inStock ? "fa-circle-check" : "fa-circle-xmark"}"></i>
                        ${inStock ? t("inStock") : t("outOfStock")}
                    </span>
                </div>
                <div class="product-card-title">${escapeHtml(localized(p.name))}</div>
                <div class="price-row">
                    <span class="price-now">${priceOf(p)}<small>${currencyUnit()}</small></span>
                    ${old ? `<span class="price-old">${old} ${currencyUnit()}</span>` : ""}
                    ${disc ? `<span class="discount-badge">-${disc}%</span>` : ""}
                </div>
                <div class="price-alt">≈ ${altPriceOf(p)} ${altUnit()}</div>
                <button type="button" class="btn ${inStock ? "btn-primary" : "btn-outline"} btn-block" style="margin-top:6px;"
                        ${inStock ? "" : "disabled"}
                        onclick="event.stopPropagation(); ${inStock ? `quickOrder('${p.id}')` : ""}">
                    <i class="fa-solid fa-bag-shopping"></i> ${inStock ? t("order") : t("outOfStock")}
                </button>
            </div>
        </div>`;
    }).join("");
}

function quickOrder(productId) {
    const cart = loadCart();
    cart[productId] = (cart[productId] || 0) + 1;
    saveCart(cart);
    updateCartBadge();
    openCheckoutModal();
}

// ============================================================================
// Пошук
// ============================================================================

function handleSearch(query) {
    const box = document.getElementById("searchResults");
    const q = (query || "").trim().toLowerCase();

    if (q.length < 2) { box.classList.remove("open"); return; }

    const matches = allProducts.filter(p =>
        localized(p.name).toLowerCase().includes(q) ||
        (p.article || "").toLowerCase().includes(q) ||
        categoryLabel(p.category).toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
        box.innerHTML = `<div class="autocomplete-empty">${t("nothingFound")}</div>`;
    } else {
        box.innerHTML = matches.map(p => {
            const imgs = productImages(p);
            return `<div class="autocomplete-item" onmousedown="openProductModal('${p.id}'); closeSearch();">
                ${imgs.length ? `<img src="${escapeAttr(imgs[0])}" alt="">` : `<img src="" alt="">`}
                <div class="autocomplete-item-info">
                    <div class="autocomplete-item-title">${escapeHtml(localized(p.name))}</div>
                    <div class="autocomplete-item-meta">${p.article ? escapeHtml(p.article) + " · " : ""}${escapeHtml(categoryLabel(p.category))}</div>
                </div>
                <div class="autocomplete-item-price">${priceOf(p)} ${currencyUnit()}</div>
            </div>`;
        }).join("");
    }
    box.classList.add("open");
}

function closeSearch() {
    document.getElementById("searchResults").classList.remove("open");
    document.getElementById("searchInput").value = "";
}

// ============================================================================
// Модалка товару з галереєю
// ============================================================================

function openProductModal(productId) {
    const p = allProducts.find(x => x.id === productId);
    if (!p) return;

    const imgs = productImages(p);
    const inStock = p.inStock !== false;
    const disc = discountPercent(p);
    const old = oldPriceOf(p);
    const specs = localized(p.characteristics)
        .split("\n").map(s => s.trim()).filter(Boolean);

    document.getElementById("productModalBody").innerHTML = `
        <div class="pm-grid">
            <div class="pm-gallery">
                <div class="pm-main-img">
                    ${imgs.length
                        ? `<img src="${escapeAttr(imgs[0])}" alt="${escapeAttr(localized(p.name))}" id="pmMainImg">`
                        : `<div class="img-fallback" style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:40px;"><i class="fa-solid fa-wine-bottle"></i></div>`}
                </div>
                ${imgs.length > 1 ? `<div class="pm-thumbs">
                    ${imgs.slice(0, 4).map((src, i) => `
                        <button type="button" class="pm-thumb ${i === 0 ? "active" : ""}" onclick="switchMainImage('${escapeAttr(src)}', this)">
                            <img src="${escapeAttr(src)}" alt="">
                        </button>`).join("")}
                </div>` : ""}
            </div>

            <div class="pm-info">
                <div class="pm-top-row">
                    <span class="stock-badge ${inStock ? "in" : "out"}" style="position:static;">
                        <i class="fa-solid ${inStock ? "fa-circle-check" : "fa-circle-xmark"}"></i>
                        ${inStock ? t("inStock") : t("outOfStock")}
                    </span>
                    <button type="button" class="share-btn" title="${t("shareProduct")}" onclick="shareProduct('${p.id}', this)">
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </div>

                ${p.article ? `<div class="article-row" style="margin-bottom:10px;">
                    <i class="fa-solid fa-barcode"></i> ${t("article")}: ${escapeHtml(p.article)}
                    <button type="button" class="article-copy" onclick="copyText('${escapeAttr(p.article)}', this, '${t("articleCopied")}')">
                        <i class="fa-regular fa-copy"></i></button>
                </div>` : ""}

                <div class="pm-category">${escapeHtml(categoryLabel(p.category))}</div>
                <div class="pm-title">${escapeHtml(localized(p.name))}</div>

                <div class="pm-price-row">
                    <span class="pm-price-now">${priceOf(p)} ${currencyUnit()}</span>
                    ${old ? `<span class="price-old">${old} ${currencyUnit()}</span>` : ""}
                    ${disc ? `<span class="discount-badge">-${disc}%</span>` : ""}
                </div>
                <div class="pm-price-alt">≈ ${altPriceOf(p)} ${altUnit()}</div>

                ${localized(p.description) ? `<div class="pm-section">
                    <div class="pm-section-title">${t("description")}</div>
                    <div class="pm-desc">${escapeHtml(localized(p.description))}</div>
                </div>` : ""}

                ${specs.length ? `<div class="pm-section">
                    <div class="pm-section-title">${t("characteristics")}</div>
                    <ul class="pm-specs">${specs.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
                </div>` : ""}

                ${inStock ? `<div class="pm-actions">
                    <button type="button" class="btn btn-outline" onclick="addToCart('${p.id}'); closeModal('productModal');">
                        <i class="fa-solid fa-cart-plus"></i> ${t("addToCart")}
                    </button>
                    <button type="button" class="btn btn-primary" onclick="closeModal('productModal'); quickOrder('${p.id}');">
                        <i class="fa-solid fa-bag-shopping"></i> ${t("order")}
                    </button>
                </div>` : ""}
            </div>
        </div>`;

    openModal("productModal");
    history.replaceState(null, "", `?p=${encodeURIComponent(p.id)}`);
}

function switchMainImage(src, btn) {
    document.getElementById("pmMainImg").src = src;
    document.querySelectorAll(".pm-thumb").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function shareProduct(productId, btn) {
    const url = `${location.origin}${location.pathname}?p=${encodeURIComponent(productId)}`;
    const p = allProducts.find(x => x.id === productId);
    if (navigator.share) {
        navigator.share({ title: localized(p.name), url }).catch(() => {});
    } else {
        copyText(url, btn, t("linkCopied"));
    }
}

function openProductFromUrl() {
    const id = new URLSearchParams(location.search).get("p");
    if (id && allProducts.some(p => p.id === id)) openProductModal(id);
}

// ============================================================================
// Модалки
// ============================================================================

function openModal(id) { document.getElementById(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(id) {
    document.getElementById(id).classList.remove("open");
    if (!document.querySelector(".modal.open")) document.body.style.overflow = "";
    if (id === "productModal") history.replaceState(null, "", location.pathname);
}

document.addEventListener("click", (e) => {
    document.querySelectorAll(".modal.open").forEach(m => { if (e.target === m) closeModal(m.id); });

    if (!e.target.closest("#categoryDropdown")) document.getElementById("categoryDropdown")?.classList.remove("open");
    if (!e.target.closest("#contactsDropdown")) document.getElementById("contactsPopover")?.classList.remove("open");
    if (!e.target.closest("#categoryDropdown") && !e.target.closest("#contactsDropdown")) document.getElementById("popoverBackdrop")?.classList.remove("open");
    if (!e.target.closest(".header-search")) document.getElementById("searchResults")?.classList.remove("open");
    if (!e.target.closest(".form-group")) document.querySelectorAll(".np-list.open").forEach(l => l.classList.remove("open"));
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal.open").forEach(m => closeModal(m.id));
});

function toggleCategoryMenu(e) {
    e.stopPropagation();
    document.getElementById("contactsPopover")?.classList.remove("open");
    const open = document.getElementById("categoryDropdown").classList.toggle("open");
    document.getElementById("popoverBackdrop").classList.toggle("open", open);
}
function toggleContactsMenu(e) {
    e.stopPropagation();
    document.getElementById("categoryDropdown")?.classList.remove("open");
    const open = document.getElementById("contactsPopover").classList.toggle("open");
    document.getElementById("popoverBackdrop").classList.toggle("open", open);
}
function closeAllPopovers() {
    document.getElementById("categoryDropdown")?.classList.remove("open");
    document.getElementById("contactsPopover")?.classList.remove("open");
    document.getElementById("popoverBackdrop")?.classList.remove("open");
}

// ============================================================================
// Кошик — модалка
// ============================================================================

function openCartModal() { renderCartModalBody(); openModal("cartModal"); }

function renderCartModalBody() {
    const cart = loadCart();
    const ids = Object.keys(cart);
    const body = document.getElementById("cartModalBody");

    if (!ids.length) {
        body.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i>${t("cartEmpty")}</div>`;
        return;
    }

    let total = 0;
    const itemsHtml = ids.map(id => {
        const p = allProducts.find(x => x.id === id);
        if (!p) return "";
        const qty = cart[id];
        const unit = priceOf(p);
        total += unit * qty;
        const imgs = productImages(p);
        return `
        <div class="cart-item">
            ${imgs.length ? `<img src="${escapeAttr(imgs[0])}" alt="">` : `<img src="" alt="">`}
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(localized(p.name))}</div>
                <div class="cart-item-price">${unit} ${currencyUnit()} / ${t("pcs")}</div>
            </div>
            <div class="qty-controls">
                <button type="button" onclick="changeQty('${id}', -1)">−</button>
                <span>${qty}</span>
                <button type="button" onclick="changeQty('${id}', 1)">+</button>
            </div>
            <div class="cart-item-sum">${unit * qty} ${currencyUnit()}</div>
            <button type="button" class="trash-btn" onclick="removeFromCart('${id}')"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    }).join("");

    body.innerHTML = `
        <div class="cart-items">${itemsHtml}</div>
        <div class="cart-summary">
            <span>${t("total")}</span>
            <span class="cart-summary-total">${total} ${currencyUnit()}</span>
        </div>
        <button type="button" class="btn btn-primary btn-block" onclick="openCheckoutModal()">
            <i class="fa-solid fa-arrow-right"></i> ${t("makeOrder")}
        </button>`;
}

// ============================================================================
// ЧЕКАУТ
// ============================================================================

let checkoutCountry = "UA";
let checkoutPayment = "";
let receiptFile = null;
let selectedCityRef = "";

function openCheckoutModal() {
    checkoutCountry = currentLang === "pl" ? "PL" : "UA";
    receiptFile = null;
    selectedCityRef = "";
    closeModal("cartModal");
    renderCheckoutForm();
    openModal("checkoutModal");
}

function renderCheckoutForm() {
    document.getElementById("checkoutModalBody").innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("country")}</span>
            <div class="radio-group">
                <div class="radio-option ${checkoutCountry === "UA" ? "active" : ""}" onclick="setCheckoutCountry('UA')">🇺🇦 ${t("ukraine")}</div>
                <div class="radio-option ${checkoutCountry === "PL" ? "active" : ""}" onclick="setCheckoutCountry('PL')">🇵🇱 ${t("poland")}</div>
            </div>
        </div>

        <div class="form-section-title"><i class="fa-solid fa-user"></i> ${t("recipient")}</div>
        <div class="form-row">
            <div class="form-group">
                <span class="field-label">${t("firstName")}</span>
                <input type="text" id="custFirstName" placeholder="${t("firstName")}">
            </div>
            <div class="form-group">
                <span class="field-label">${t("lastName")}</span>
                <input type="text" id="custLastName" placeholder="${t("lastName")}">
            </div>
        </div>
        <div class="form-group">
            <span class="field-label">${t("phone")}</span>
            <input type="tel" id="custPhone" placeholder="${checkoutCountry === "PL" ? "+48 123 456 789" : "+380 __ ___ __ __"}">
        </div>
        <div class="form-group">
            <span class="field-label">${t("email")}</span>
            <input type="email" id="custEmail" placeholder="you@example.com">
        </div>

        <div class="form-section-title"><i class="fa-solid fa-truck-fast"></i> ${t("delivery")}</div>
        <div id="deliveryFields"></div>

        <div class="form-section-title"><i class="fa-solid fa-credit-card"></i> ${t("payment")}</div>
        <div class="form-group">
            <span class="field-label">${t("paymentMethod")}</span>
            <select id="paymentMethod" onchange="onPaymentChange()"></select>
        </div>
        <div id="requisitesContainer"></div>

        <div class="form-group">
            <span class="field-label">${t("notes")}</span>
            <textarea id="custNotes" rows="2" placeholder="${t("notesPlaceholder")}"></textarea>
        </div>

        <button type="button" class="btn btn-primary btn-block" id="submitOrderBtn" onclick="submitOrder()">
            <i class="fa-solid fa-paper-plane"></i> ${t("confirmOrder")}
        </button>`;

    renderDeliveryFields();
    renderPaymentOptions();
}

function setCheckoutCountry(country) {
    checkoutCountry = country;
    selectedCityRef = "";
    renderCheckoutForm();
}

// ---- поля доставки ----

function renderDeliveryFields() {
    const el = document.getElementById("deliveryFields");

    if (checkoutCountry === "PL") {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("deliveryMethod")}</span>
            <select id="deliveryMethod" onchange="renderPLDeliveryDetails()">
                <option value="inpost">InPost Paczkomat</option>
                <option value="dpd">DPD — kurier</option>
                <option value="poczta">Poczta Polska</option>
            </select>
        </div>
        <div class="form-group">
            <span class="field-label">${t("city")}</span>
            <input type="text" id="deliveryCity" placeholder="${t("cityPlaceholder")}">
        </div>
        <div id="plDeliveryDetails"></div>`;
        renderPLDeliveryDetails();
    } else {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("deliveryMethod")}</span>
            <select id="deliveryMethod" onchange="renderUADeliveryDetails()">
                <option value="np_branch">${t("npBranch")}</option>
                <option value="np_courier">${t("npCourier")}</option>
                <option value="ukrposhta">Укрпошта</option>
            </select>
        </div>
        <div class="form-group">
            <span class="field-label">${t("city")}</span>
            <input type="text" id="deliveryCity" autocomplete="off" placeholder="${t("cityPlaceholder")}"
                   oninput="searchNPCity(this.value)">
            <div class="np-list" id="cityList"></div>
        </div>
        <div id="uaDeliveryDetails"></div>`;
        renderUADeliveryDetails();
    }
}

function renderPLDeliveryDetails() {
    const method = document.getElementById("deliveryMethod").value;
    const el = document.getElementById("plDeliveryDetails");
    if (method === "inpost") {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("paczkomat")}</span>
            <input type="text" id="deliveryDetails" placeholder="${t("paczkomatPlaceholder")}">
            <span class="field-hint">Numer paczkomatu znajdziesz na inpost.pl/znajdz-paczkomat</span>
        </div>`;
    } else {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("address")}</span>
            <input type="text" id="deliveryDetails" placeholder="${t("addressPlaceholder")}">
        </div>`;
    }
}

function renderUADeliveryDetails() {
    const method = document.getElementById("deliveryMethod").value;
    const el = document.getElementById("uaDeliveryDetails");

    if (method === "np_branch") {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("branch")}</span>
            <input type="text" id="deliveryDetails" autocomplete="off" placeholder="${t("branchPlaceholder")}"
                   oninput="searchNPWarehouse(this.value)">
            <div class="np-list" id="warehouseList"></div>
            <span class="field-hint">${t("branchHint")}</span>
        </div>`;
    } else {
        el.innerHTML = `
        <div class="form-group">
            <span class="field-label">${t("address")}</span>
            <input type="text" id="deliveryDetails" placeholder="${t("addressPlaceholder")}">
        </div>`;
    }
}

// ---- Нова Пошта: міста ----

let cityTimer = null;

function searchNPCity(query) {
    const list = document.getElementById("cityList");
    selectedCityRef = "";
    clearTimeout(cityTimer);

    if (!query || query.trim().length < 2) { list.classList.remove("open"); return; }

    list.innerHTML = `<div class="np-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>`;
    list.classList.add("open");

    cityTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${WORKER_URL}/novaposhta`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelName: "Address",
                    calledMethod: "searchSettlements",
                    methodProperties: { CityName: query.trim(), Limit: "15" }
                })
            });
            const data = await res.json();
            const items = (data.data && data.data[0] && data.data[0].Addresses) || [];

            if (!items.length) {
                list.innerHTML = `<div class="np-loading">${t("nothing")}</div>`;
                return;
            }

            list.innerHTML = items.map(c => `
                <div class="np-item" onmousedown="selectNPCity('${escapeAttr(c.Ref)}', '${escapeAttr(c.Present)}')">
                    ${escapeHtml(c.MainDescription)}
                    <span>${escapeHtml(c.Area ? c.Area + " обл." : "")} ${escapeHtml(c.SettlementTypeCode || "")}</span>
                </div>`).join("");
        } catch (err) {
            list.innerHTML = `<div class="np-loading">${t("nothing")}</div>`;
        }
    }, 300);
}

function selectNPCity(ref, present) {
    selectedCityRef = ref;
    document.getElementById("deliveryCity").value = present;
    document.getElementById("cityList").classList.remove("open");
    const details = document.getElementById("deliveryDetails");
    if (details) { details.value = ""; details.placeholder = t("branchPlaceholder"); }
}

// ---- Нова Пошта: відділення ----

let warehouseTimer = null;

function searchNPWarehouse(query) {
    const list = document.getElementById("warehouseList");
    clearTimeout(warehouseTimer);

    if (!selectedCityRef) {
        list.innerHTML = `<div class="np-loading">${t("cityFirst")}</div>`;
        list.classList.add("open");
        return;
    }

    list.innerHTML = `<div class="np-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>`;
    list.classList.add("open");

    warehouseTimer = setTimeout(async () => {
        try {
            const res = await fetch(`${WORKER_URL}/novaposhta`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modelName: "Address",
                    calledMethod: "getWarehouses",
                    methodProperties: { SettlementRef: selectedCityRef, Limit: "500" }
                })
            });
            const data = await res.json();
            let items = data.data || [];

            const q = (query || "").trim().toLowerCase();
            if (q) items = items.filter(w => (w.Description || "").toLowerCase().includes(q) || String(w.Number) === q);
            items = items.slice(0, 40);

            if (!items.length) {
                list.innerHTML = `<div class="np-loading">${t("nothing")}</div>`;
                return;
            }

            list.innerHTML = items.map(w => {
                const short = (w.Description || "").replace(/^Відділення\s*№?\d+[:\s-]*/i, "").replace(/^Поштомат\s*№?\d+[:\s-]*/i, "");
                return `<div class="np-item" onmousedown="selectNPWarehouse('${escapeAttr(w.Description)}')">
                    <b>№${escapeHtml(String(w.Number))}</b> ${escapeHtml(short)}
                </div>`;
            }).join("");
        } catch (err) {
            list.innerHTML = `<div class="np-loading">${t("nothing")}</div>`;
        }
    }, 250);
}

function selectNPWarehouse(description) {
    document.getElementById("deliveryDetails").value = description;
    document.getElementById("warehouseList").classList.remove("open");
}

// ---- оплата ----

function renderPaymentOptions() {
    const select = document.getElementById("paymentMethod");
    const options = checkoutCountry === "PL"
        ? [{ v: "blik", l: t("payBlik") }, { v: "transfer_pl", l: t("payTransferPL") }]
        : [{ v: "cod", l: t("payCOD") }, { v: "card_ua", l: t("payCardUA") }];

    select.innerHTML = options.map(o => `<option value="${o.v}">${o.l}</option>`).join("");
    checkoutPayment = options[0].v;
    onPaymentChange();
}

async function onPaymentChange() {
    checkoutPayment = document.getElementById("paymentMethod").value;
    const box = document.getElementById("requisitesContainer");

    // накладений платіж — реквізити не потрібні
    if (checkoutPayment === "cod") { box.innerHTML = ""; return; }

    box.innerHTML = `<div class="np-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>`;

    try {
        const res = await fetch(`${WORKER_URL}/api/requisites?c=${checkoutCountry}`);
        const r = await res.json();

        let rows = "";
        if (checkoutCountry === "PL") {
            if (checkoutPayment === "blik" && r.blik) rows += requisiteRow(t("blikPhone"), r.blik);
            if (checkoutPayment === "transfer_pl") {
                if (r.card) rows += requisiteRow(t("cardNumber"), r.card);
                if (r.iban) rows += requisiteRow(t("iban"), r.iban);
            }
        } else if (r.card) {
            rows += requisiteRow(t("cardNumber"), r.card);
        }

        if (!rows) { box.innerHTML = ""; return; }

        box.innerHTML = `
        <div class="requisites-box">
            <div class="requisites-title"><i class="fa-solid fa-circle-info"></i> ${t("requisites")}</div>
            ${rows}
            <div class="requisites-row">
                <span class="field-label">${t("attachReceipt")}</span>
                <label class="file-field" id="receiptField">
                    <input type="file" accept="image/*" onchange="handleReceiptSelect(event)">
                    <span class="file-field-text" id="receiptText"><i class="fa-solid fa-paperclip"></i> ${t("chooseFile")}</span>
                </label>
            </div>
        </div>`;
    } catch (err) {
        box.innerHTML = "";
    }
}

function requisiteRow(label, value) {
    return `<div class="requisites-row">
        <span class="field-label">${label}</span>
        <div class="copy-field">
            <input type="text" value="${escapeAttr(value)}" readonly>
            <button type="button" class="copy-btn" onclick="copyText('${escapeAttr(value)}', this, '${t("copied")}')">
                <i class="fa-regular fa-copy"></i> ${t("copy")}
            </button>
        </div>
    </div>`;
}

function handleReceiptSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    receiptFile = file;
    document.getElementById("receiptField").classList.add("has-file");
    document.getElementById("receiptText").innerHTML = `<i class="fa-solid fa-circle-check"></i> ${t("fileChosen")}: ${escapeHtml(file.name)}`;
}

// ---- відправка ----

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function submitOrder() {
    const firstName = val("custFirstName"), lastName = val("custLastName");
    const phone = val("custPhone"), email = val("custEmail"), notes = val("custNotes");
    const deliveryMethod = document.getElementById("deliveryMethod");
    const deliveryLabel = deliveryMethod ? deliveryMethod.options[deliveryMethod.selectedIndex].text : "";
    const city = val("deliveryCity"), details = val("deliveryDetails");
    const paySelect = document.getElementById("paymentMethod");
    const payLabel = paySelect ? paySelect.options[paySelect.selectedIndex].text : "";

    if (!firstName || !phone) { showToast(t("fillRequired"), true); return; }

    const cart = loadCart();
    const ids = Object.keys(cart);
    if (!ids.length) { showToast(t("cartIsEmpty"), true); return; }

    let total = 0;
    const lines = ids.map(id => {
        const p = allProducts.find(x => x.id === id);
        if (!p) return "";
        const qty = cart[id], unit = priceOf(p);
        total += unit * qty;
        return `• ${localized(p.name)}${p.article ? ` [${p.article}]` : ""} — ${qty} ${t("pcs")} × ${unit} = ${unit * qty} ${currencyCode()}`;
    }).filter(Boolean).join("\n");

    const message =
`📦 <b>НОВЕ ЗАМОВЛЕННЯ</b>

🛍 <b>Товари:</b>
${lines}
💰 <b>Разом: ${total} ${currencyCode()}</b>

👤 <b>Покупець:</b> ${firstName} ${lastName}
📞 <b>Тел:</b> ${phone}
📧 <b>Email:</b> ${email || "—"}

🚚 <b>Доставка:</b> ${checkoutCountry === "PL" ? "🇵🇱 Польща" : "🇺🇦 Україна"} — ${deliveryLabel}
🏙 ${city || "—"}
📍 ${details || "—"}

💳 <b>Оплата:</b> ${payLabel}
${notes ? `📝 <b>Примітка:</b> ${notes}` : ""}`;

    const btn = document.getElementById("submitOrderBtn");
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t("sending")}`;

    try {
        const payload = { message };
        if (receiptFile) {
            payload.photoBase64 = await fileToBase64(receiptFile);
            payload.photoMime = receiptFile.type;
            payload.photoName = receiptFile.name;
        }

        const res = await fetch(`${WORKER_URL}/api/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("bad status");

        localStorage.removeItem(CART_KEY);
        updateCartBadge();
        receiptFile = null;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ${t("orderSent")}`;
        showToast(t("orderSent"));
        setTimeout(() => closeModal("checkoutModal"), 1600);
    } catch (err) {
        showToast(t("orderError"), true);
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${t("confirmOrder")}`;
    }
}

// ============================================================================
// Утиліти
// ============================================================================

function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; }

function copyText(text, btn, message) {
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const original = btn.innerHTML;
            btn.classList.add("copied");
            btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
            setTimeout(() => { btn.classList.remove("copied"); btn.innerHTML = original; }, 1400);
        }
        showToast(message || t("copied"));
    });
}

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

// ============================================================================
// Старт
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang);
    initCatalog();
    updateCartBadge();

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    } else {
        document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    }
});
