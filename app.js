// app.js - Logic hiển thị và tương tác người dùng Kh_DTS Fashion Store
// Tích hợp: Chi tiết sản phẩm (Gallery + Tồn kho), Giỏ hàng Voucher & Chốt đơn VietQR tự động

let storeData = null;
let currentCategory = 'all';
let cart = [];
let currentDetailProduct = null;
let currentDetailSelectedSize = null;

// Trạng thái vận chuyển & Voucher trong giỏ hàng
let currentShippingMethod = 'haihau'; // 'haihau' (15k) | 'nationwide' (25k)
let appliedVoucher = null;
let lastCreatedOrder = null;

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Lắng nghe sự kiện đồng bộ từ Admin (khi mở 2 tab song song)
window.addEventListener('storage', (e) => {
    if (e.key === 'kh_dts_store_v2') {
        console.log('[Kh_DTS] Đồng bộ dữ liệu mới nhất từ CMS Admin...');
        initApp();
    }
});

function initApp() {
    if (typeof StoreService !== 'undefined') {
        storeData = StoreService.loadData();
    } else {
        console.warn('StoreService chưa tải, kiểm tra file data.js');
        return;
    }

    renderSiteSettings();
    renderCategories();
    renderPromos();
    renderLookbook();
    renderProducts();
    setupMobileMenu();
    updateCartUI();
}

// 1. Render Cài đặt & Thông tin chung của Website
function renderSiteSettings() {
    const s = storeData.settings;
    if (!s) return;

    // Top Announcement Bar
    const topBar = document.getElementById('topAnnouncementBar');
    const topText = document.getElementById('topAnnouncementText');
    if (topBar && topText) {
        if (s.topBanner && s.topBanner.enabled) {
            topBar.classList.remove('hidden');
            topText.textContent = s.topBanner.text;
        } else {
            topBar.classList.add('hidden');
        }
    }

    // Logo & Hotline
    const hotline = s.hotline || '545654254245';
    document.querySelectorAll('.hotline-text').forEach(el => {
        el.textContent = hotline;
    });
    document.querySelectorAll('.hotline-href').forEach(el => {
        el.setAttribute('href', `tel:${hotline}`);
    });
    const storeHotlineLink = document.getElementById('storeHotlineLink');
    if (storeHotlineLink) {
        storeHotlineLink.setAttribute('href', `tel:${hotline}`);
        storeHotlineLink.textContent = hotline;
    }

    // Hero Section
    if (s.hero) {
        const heroBg = document.getElementById('heroBgImg');
        const heroBadge = document.getElementById('heroBadgeText');
        const heroT1 = document.getElementById('heroTitleLine1');
        const heroT2 = document.getElementById('heroTitleLine2');
        const heroDesc = document.getElementById('heroDescText');
        const heroBtnShop = document.getElementById('heroBtnShop');
        const heroBtnStore = document.getElementById('heroBtnStore');

        if (heroBg && s.hero.bgImage) heroBg.src = s.hero.bgImage;
        if (heroBadge) heroBadge.textContent = s.hero.badge || 'NEW SEASON COLLECTION 2026';
        if (heroT1) heroT1.textContent = s.hero.titleLine1 || 'STREETWEAR.';
        if (heroT2) heroT2.textContent = s.hero.titleLine2 || 'BE YOURSELF.';
        if (heroDesc) heroDesc.textContent = s.hero.description || '';
        if (heroBtnShop && s.hero.btnShopText) heroBtnShop.textContent = s.hero.btnShopText;
        if (heroBtnStore && s.hero.btnStoreText) heroBtnStore.textContent = s.hero.btnStoreText;
    }

    // Physical Store Section
    const addr = document.getElementById('storeAddressText');
    const hours = document.getElementById('storeHoursText');
    const footerAddr = document.getElementById('footerAddressText');
    if (addr && s.address) addr.textContent = s.address;
    if (hours && s.openHours) hours.textContent = s.openHours;
    if (footerAddr && s.address) footerAddr.textContent = s.address;

    if (s.storeVisual) {
        const storeImg = document.getElementById('storeImgVisual');
        const storeBadge = document.getElementById('storeBadgeVisual');
        const storeTitle = document.getElementById('storeTitleVisual');
        const storeSub = document.getElementById('storeSubtitleVisual');
        if (storeImg && s.storeVisual.image) storeImg.src = s.storeVisual.image;
        if (storeBadge) storeBadge.textContent = s.storeVisual.badge || 'FLAGSHIP STORE';
        if (storeTitle) storeTitle.textContent = s.storeVisual.title || 'KH_DTS YÊN ĐỊNH';
        if (storeSub) storeSub.textContent = s.storeVisual.subtitle || '';
    }

    // Social Links
    if (s.socialLinks) {
        const tk = document.getElementById('footerSocialTiktok');
        const sp = document.getElementById('footerSocialShopee');
        const fb = document.getElementById('footerSocialFacebook');
        const zl = document.getElementById('footerSocialZalo');
        if (tk && s.socialLinks.tiktok) tk.href = s.socialLinks.tiktok;
        if (sp && s.socialLinks.shopee) sp.href = s.socialLinks.shopee;
        if (fb && s.socialLinks.facebook) fb.href = s.socialLinks.facebook;
        if (zl && s.socialLinks.zalo) zl.href = s.socialLinks.zalo;
    }
}

// 2. Render Danh mục (Shop By Category)
function renderCategories() {
    const container = document.getElementById('categoryCardsContainer');
    if (!container || !storeData.categories) return;

    container.innerHTML = storeData.categories.map(cat => `
        <div onclick="filterCategory('${cat.id}')" class="group relative h-96 overflow-hidden bg-card border border-bordercol cursor-pointer transition-all duration-300 hover:border-gray-400">
            <img src="${cat.image}" 
                 alt="${cat.name}" 
                 class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6 text-center">
                <h3 class="font-display text-2xl font-bold uppercase tracking-wider mb-1">${cat.name}</h3>
                <p class="text-xs text-gray-400 mb-3">${cat.sub || ''}</p>
                <span class="inline-block px-5 py-2 text-[11px] font-bold tracking-widest uppercase bg-white text-black group-hover:bg-gray-200 transition-colors">
                    XEM DANH MỤC
                </span>
            </div>
        </div>
    `).join('');
}

// 3. Render 3 Thẻ Promo nhanh
function renderPromos() {
    const container = document.getElementById('promoCardsContainer');
    if (!container || !storeData.settings || !storeData.settings.promos) return;

    const hotline = storeData.settings.hotline || '545654254245';

    container.innerHTML = storeData.settings.promos.map(item => {
        let actionAttr = '';
        if (item.action === 'tel') {
            actionAttr = `href="tel:${hotline}"`;
        } else if (item.action === 'platformModal') {
            actionAttr = `href="javascript:void(0)" onclick="openPlatformModal()"`;
        } else {
            actionAttr = `href="javascript:void(0)" onclick="filterCategory('all')"`;
        }

        return `
            <div class="bg-card border border-bordercol p-8 flex flex-col justify-between">
                <div>
                    <span class="text-xs font-bold tracking-widest text-subtext uppercase">${item.tag}</span>
                    <h3 class="font-display text-2xl font-bold uppercase tracking-tight mt-2 mb-3">${item.title}</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">${item.desc}</p>
                </div>
                <a ${actionAttr} class="mt-6 text-xs font-bold uppercase tracking-widest text-white underline hover:text-gray-300 text-left block">
                    ${item.btnText}
                </a>
            </div>
        `;
    }).join('');
}

// 4. Render Lookbook ảnh cộng đồng
function renderLookbook() {
    const grid = document.getElementById('lookbookGrid');
    if (!grid || !storeData.settings || !storeData.settings.lookbooks) return;

    grid.innerHTML = storeData.settings.lookbooks.map(imgUrl => `
        <div class="aspect-square bg-card border border-bordercol overflow-hidden group">
            <img src="${imgUrl}" class="w-full h-full object-cover filter grayscale group-hover:scale-110 transition-transform duration-500">
        </div>
    `).join('');
}

// 5. Render Danh sách sản phẩm (Trending Now)
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid || !storeData.products) return;

    const activeProducts = storeData.products.filter(p => p.inStock !== false);
    const filtered = currentCategory === 'all' 
        ? activeProducts 
        : activeProducts.filter(p => p.category === currentCategory);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-gray-500 text-sm">
                <i class="fa-solid fa-box-open text-4xl mb-3 block"></i>
                Hiện chưa có sản phẩm nào trong danh mục này.
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const catName = product.category === 'tshirt' 
            ? 'Áo Thun' 
            : product.category === 'hoodie' 
                ? 'Hoodie' 
                : 'Phụ Kiện';

        const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Freesize'];
        const selectedSize = product.selectedSize || sizes[0];

        // Kiểm tra tổng tồn kho
        let totalStock = 0;
        if (product.inventory) {
            Object.values(product.inventory).forEach(num => totalStock += Number(num) || 0);
        } else {
            totalStock = 10;
        }

        return `
            <div class="product-card bg-card border border-bordercol flex flex-col justify-between group">
                <div>
                    <!-- Ảnh sản phẩm: Click để mở modal xem chi tiết -->
                    <div onclick="openProductDetail(${product.id})" class="img-zoom-container relative aspect-[4/5] bg-darker overflow-hidden cursor-pointer">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover filter contrast-110">
                        ${product.tag ? `
                            <span class="absolute top-2.5 left-2.5 text-[9px] font-extrabold tracking-widest px-2 py-0.5 bg-white text-black uppercase">
                                ${product.tag}
                            </span>
                        ` : ''}
                        ${totalStock <= 0 ? `
                            <div class="absolute inset-0 bg-black/75 flex items-center justify-center">
                                <span class="text-xs font-black uppercase tracking-wider text-rose-400 bg-black/80 px-3 py-1 border border-rose-500/50">Hết Hàng</span>
                            </div>
                        ` : ''}
                        <button onclick="event.stopPropagation(); addToCart(${product.id})" class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-bordercol flex items-center justify-center transition-all opacity-90 group-hover:opacity-100" title="Thêm vào giỏ nhanh">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>

                    <!-- Thông tin sản phẩm -->
                    <div class="p-3.5">
                        <div class="text-[10px] uppercase font-bold text-subtext tracking-wider mb-1">
                            ${catName}
                        </div>
                        <h3 onclick="openProductDetail(${product.id})" class="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug h-9 mb-2 cursor-pointer hover:underline">
                            ${product.name}
                        </h3>

                        <!-- Giá bán -->
                        <div class="flex items-baseline gap-2 mb-3">
                            <span class="text-sm sm:text-base font-extrabold text-white font-display">
                                ${formatCurrency(product.price)}
                            </span>
                            ${product.originalPrice ? `
                                <span class="text-[11px] text-gray-500 line-through">
                                    ${formatCurrency(product.originalPrice)}
                                </span>
                            ` : ''}
                        </div>

                        <!-- Chọn Size nhanh trên thẻ -->
                        <div class="flex items-center gap-1.5 mb-3 flex-wrap">
                            ${sizes.map(size => {
                                const stock = (product.inventory && product.inventory[size] !== undefined) ? product.inventory[size] : 10;
                                const isOut = stock <= 0;
                                return `
                                    <button onclick="selectProductSize(${product.id}, '${size}')" 
                                            id="size-btn-${product.id}-${size}"
                                            ${isOut ? 'disabled title="Hết size này"' : ''}
                                            class="size-btn text-[10px] font-bold px-2 py-1 border border-bordercol rounded-none ${size === selectedSize && !isOut ? 'selected' : isOut ? 'opacity-35 line-through cursor-not-allowed text-gray-600' : 'text-gray-400 hover:text-white'}">
                                        ${size}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- Bộ 2 nút hành động: THÊM VÀO GIỎ HÀNG & MUA NGAY -->
                <div class="p-3.5 pt-0 space-y-2">
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" class="w-full py-2.5 bg-darker hover:bg-white hover:text-black border border-white/40 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm rounded-none">
                        <i class="fa-solid fa-cart-plus text-xs text-emerald-400 group-hover:text-black"></i>
                        <span>THÊM VÀO GIỎ HÀNG</span>
                    </button>
                    <button onclick="openProductDetail(${product.id})" class="w-full py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 shadow rounded-none">
                        <span>XEM ĐỒ & MUA NGAY</span>
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 6. Xử lý Modal Xem Chi Tiết Sản Phẩm (PDP / Quick View Modal)
function openProductDetail(productId) {
    const p = storeData.products.find(item => item.id === Number(productId));
    if (!p) return;

    currentDetailProduct = p;
    const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['Freesize'];
    currentDetailSelectedSize = p.selectedSize || sizes[0];

    // Cập nhật thông tin text
    document.getElementById('detailTitle').textContent = p.name;
    document.getElementById('detailPrice').textContent = formatCurrency(p.price);
    document.getElementById('detailCategoryBadge').textContent = p.category === 'tshirt' ? 'ÁO THUN OVERSIZE' : p.category === 'hoodie' ? 'HOODIE & NỈ BÔNG' : 'PHỤ KIỆN';

    const tagBadge = document.getElementById('detailTagBadge');
    if (p.tag) {
        tagBadge.textContent = p.tag;
        tagBadge.classList.remove('hidden');
    } else {
        tagBadge.classList.add('hidden');
    }

    const origEl = document.getElementById('detailOriginalPrice');
    const percentEl = document.getElementById('detailDiscountPercent');
    if (p.originalPrice && p.originalPrice > p.price) {
        origEl.textContent = formatCurrency(p.originalPrice);
        origEl.classList.remove('hidden');
        const pct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        percentEl.textContent = `-${pct}%`;
        percentEl.classList.remove('hidden');
    } else {
        origEl.classList.add('hidden');
        percentEl.classList.add('hidden');
    }

    document.getElementById('detailModelInfo').textContent = p.modelInfo || 'Mẫu nam 1m73 - 62kg mặc Size L chuẩn form Oversize che khuyết điểm tôn dáng.';
    document.getElementById('detailDesc').textContent = p.desc || 'Chất vải cao cấp dày dặn, form dáng thời trang streetwear chuẩn phong cách Gen Z.';

    // Thư viện ảnh (Gallery)
    const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image];
    const mainImg = document.getElementById('detailMainImg');
    mainImg.src = gallery[0];

    const thumbsGrid = document.getElementById('detailThumbnailsGrid');
    thumbsGrid.innerHTML = gallery.map((imgUrl, idx) => `
        <div onclick="switchDetailGalleryImg('${imgUrl}')" class="aspect-square bg-darker border ${idx === 0 ? 'border-white' : 'border-bordercol'} hover:border-white cursor-pointer overflow-hidden rounded">
            <img src="${imgUrl}" alt="Thumbnail ${idx}" class="w-full h-full object-cover">
        </div>
    `).join('');

    // Kích cỡ & Tồn kho
    renderDetailSizes(p);

    // Bảng số đo
    renderDetailMeasurements(p);

    // Ẩn bảng size box ban đầu
    const chartBox = document.getElementById('detailSizeChartBox');
    if (chartBox) chartBox.classList.add('hidden');

    // Mở modal
    document.getElementById('productDetailModal').classList.remove('hidden');
}

function closeProductDetailModal() {
    document.getElementById('productDetailModal').classList.add('hidden');
    currentDetailProduct = null;
}

function switchDetailGalleryImg(url) {
    const mainImg = document.getElementById('detailMainImg');
    if (mainImg) mainImg.src = url;
}

function renderDetailSizes(product) {
    const container = document.getElementById('detailSizesContainer');
    if (!container) return;

    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['Freesize'];
    const inv = product.inventory || {};

    container.innerHTML = sizes.map(size => {
        const stock = inv[size] !== undefined ? Number(inv[size]) : 10;
        const isOut = stock <= 0;
        const isSelected = size === currentDetailSelectedSize && !isOut;

        return `
            <button type="button" 
                    onclick="selectDetailSize('${size}', ${stock})"
                    ${isOut ? 'disabled' : ''}
                    class="px-3.5 py-2 border text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                        isSelected 
                            ? 'bg-white text-black border-white' 
                            : isOut 
                                ? 'bg-darker border-bordercol text-gray-600 line-through cursor-not-allowed opacity-50' 
                                : 'bg-darker border-bordercol text-gray-300 hover:border-gray-400'
                    }">
                <span>${size}</span>
                <span class="text-[10px] font-normal opacity-75">(${isOut ? 'Hết' : 'Còn ' + stock})</span>
            </button>
        `;
    }).join('');
}

function selectDetailSize(size, stock) {
    if (stock <= 0) return;
    currentDetailSelectedSize = size;
    if (currentDetailProduct) {
        renderDetailSizes(currentDetailProduct);
    }
}

function toggleDetailSizeChart() {
    const box = document.getElementById('detailSizeChartBox');
    if (box) box.classList.toggle('hidden');
}

function renderDetailMeasurements(product) {
    const tbody = document.getElementById('detailSizeChartBody');
    if (!tbody) return;

    const defaultTable = [
        { size: "M", length: "70cm", chest: "110cm", shoulder: "52cm" },
        { size: "L", length: "73cm", chest: "116cm", shoulder: "54cm" },
        { size: "XL", length: "76cm", chest: "122cm", shoulder: "56cm" }
    ];

    const rows = (product.measurements && product.measurements.table) || defaultTable;
    tbody.innerHTML = rows.map(r => `
        <tr class="border-b border-bordercol/50">
            <td class="py-1.5 font-bold text-white">${r.size}</td>
            <td class="py-1.5">${r.length}</td>
            <td class="py-1.5">${r.chest}</td>
            <td class="py-1.5">${r.shoulder}</td>
        </tr>
    `).join('');
}

function addCurrentDetailToCart() {
    if (!currentDetailProduct) return;
    addToCart(currentDetailProduct.id, currentDetailSelectedSize);
    closeProductDetailModal();
    openCartDrawer();
}

function buyCurrentDetailNow() {
    if (!currentDetailProduct) return;
    // Thêm món vào giỏ và mở thẳng Checkout Modal
    addToCart(currentDetailProduct.id, currentDetailSelectedSize);
    closeProductDetailModal();
    openDirectCheckoutModal();
}

// 7. Quản lý Giỏ hàng Nâng cao (Tích hợp Voucher & Tính phí ship)
function addToCart(productId, specificSize = null) {
    const product = storeData.products.find(p => p.id === Number(productId));
    if (!product) return;

    const size = specificSize || product.selectedSize || (product.sizes ? product.sizes[0] : 'L');
    
    // Kiểm tra số lượng tồn kho của size
    const stock = (product.inventory && product.inventory[size] !== undefined) ? Number(product.inventory[size]) : 10;
    if (stock <= 0) {
        alert(`Rất tiếc! Mẫu áo "${product.name}" (Size ${size}) hiện đang tạm hết hàng.`);
        return;
    }

    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
        if (cart[existingIndex].quantity >= stock) {
            alert(`Kho hiện chỉ còn tối đa ${stock} sản phẩm size ${size}!`);
            return;
        }
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            quantity: 1
        });
    }

    updateCartUI();
    showToast(`Đã thêm "${product.name}" (${size}) vào giỏ hàng!`);
    openCartDrawer(); // Tự động trượt mở giỏ hàng ngay lập tức để khách thấy đồ đã vào giỏ
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = totalCount;

    const listEl = document.getElementById('cartItemsList');
    if (!listEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-10 text-gray-500 text-xs">
                <i class="fa-solid fa-basket-shopping text-3xl mb-2 block"></i>
                Chưa có sản phẩm nào trong giỏ hàng.
            </div>
        `;
        renderTotals(0, 0, 0, 0);
        return;
    }

    listEl.innerHTML = cart.map((item, index) => `
        <div class="flex items-center gap-3 p-3 bg-card border border-bordercol">
            <img src="${item.image}" alt="${item.name}" class="w-12 h-14 object-cover rounded">
            <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-white line-clamp-1">${item.name}</h4>
                <div class="text-[11px] text-gray-400 mt-0.5">Size: <strong class="text-white">${item.size}</strong></div>
                <div class="text-xs font-extrabold text-white mt-1">${formatCurrency(item.price * item.quantity)}</div>
            </div>
            <div class="flex items-center gap-1 border border-bordercol bg-darker rounded px-1.5 py-0.5">
                <button onclick="changeCartItemQuantity(${index}, -1)" class="text-gray-400 hover:text-white text-xs px-1">-</button>
                <span class="text-xs font-bold text-white px-1.5">${item.quantity}</span>
                <button onclick="changeCartItemQuantity(${index}, 1)" class="text-gray-400 hover:text-white text-xs px-1">+</button>
            </div>
            <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-red-400 p-1.5 text-xs">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');

    calculateCartTotals();
}

function changeCartItemQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartShipping(method) {
    currentShippingMethod = method;
    calculateCartTotals();
}

// Tính toán toàn bộ chi phí
function calculateCartTotals() {
    let subtotal = 0;
    let totalItems = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        totalItems += item.quantity;
    });

    // Chính sách ship: Freeship từ 2 sản phẩm trở lên
    let baseShippingFee = currentShippingMethod === 'haihau' ? 15000 : 25000;
    let shippingFee = totalItems >= 2 ? 0 : baseShippingFee;

    // Cập nhật text hiển thị phí ship
    const haihauFeeText = document.getElementById('shippingFeeHaiHauText');
    const nationwideFeeText = document.getElementById('shippingFeeNationwideText');
    if (haihauFeeText) {
        haihauFeeText.textContent = totalItems >= 2 ? 'MIỄN PHÍ' : '15.000đ';
        haihauFeeText.className = totalItems >= 2 ? 'font-bold text-emerald-400' : 'font-bold text-gray-300';
    }
    if (nationwideFeeText) {
        nationwideFeeText.textContent = totalItems >= 2 ? 'MIỄN PHÍ' : '25.000đ';
        nationwideFeeText.className = totalItems >= 2 ? 'font-bold text-emerald-400' : 'font-bold text-gray-300';
    }

    // Áp dụng voucher nếu có
    let discount = 0;
    if (appliedVoucher) {
        const check = StoreService.applyVoucher(appliedVoucher.code, subtotal, shippingFee);
        if (check.valid) {
            discount = check.discount;
        } else {
            appliedVoucher = null; // Huỷ voucher nếu không còn đạt điều kiện
            const msg = document.getElementById('cartVoucherMsg');
            if (msg) {
                msg.textContent = check.message;
                msg.className = 'text-[11px] font-semibold text-rose-400 block';
            }
        }
    }

    const finalTotal = Math.max(0, subtotal + shippingFee - discount);
    renderTotals(subtotal, shippingFee, discount, finalTotal);
}

function renderTotals(subtotal, shippingFee, discount, finalTotal) {
    // Trong Cart Drawer
    const elSub = document.getElementById('cartSubtotalText');
    const elShip = document.getElementById('cartShippingText');
    const elDiscRow = document.getElementById('cartDiscountRow');
    const elDisc = document.getElementById('cartDiscountText');
    const elFinal = document.getElementById('cartFinalTotalText');

    if (elSub) elSub.textContent = formatCurrency(subtotal);
    if (elShip) elShip.textContent = shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee);
    if (elDiscRow && elDisc) {
        if (discount > 0) {
            elDiscRow.classList.remove('hidden');
            elDisc.textContent = `-${formatCurrency(discount)}`;
        } else {
            elDiscRow.classList.add('hidden');
        }
    }
    if (elFinal) elFinal.textContent = formatCurrency(finalTotal);

    // Đồng bộ sang Checkout Modal nếu đang mở
    const oSub = document.getElementById('orderSubtotalText');
    const oShip = document.getElementById('orderShippingText');
    const oDiscRow = document.getElementById('orderDiscountRow');
    const oDisc = document.getElementById('orderDiscountText');
    const oFinal = document.getElementById('orderFinalTotalText');

    if (oSub) oSub.textContent = formatCurrency(subtotal);
    if (oShip) oShip.textContent = shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee);
    if (oDiscRow && oDisc) {
        if (discount > 0) {
            oDiscRow.classList.remove('hidden');
            oDisc.textContent = `-${formatCurrency(discount)}`;
        } else {
            oDiscRow.classList.add('hidden');
        }
    }
    if (oFinal) oFinal.textContent = formatCurrency(finalTotal);
}

// Áp dụng Voucher
function applyCartVoucher() {
    const input = document.getElementById('cartVoucherInput');
    const msg = document.getElementById('cartVoucherMsg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        msg.textContent = 'Vui lòng nhập mã giảm giá!';
        msg.className = 'text-[11px] font-semibold text-rose-400 block';
        return;
    }

    let subtotal = 0;
    cart.forEach(i => subtotal += i.price * i.quantity);
    let shippingFee = (currentShippingMethod === 'haihau' ? 15000 : 25000);
    if (cart.reduce((sum, item) => sum + item.quantity, 0) >= 2) shippingFee = 0;

    const result = StoreService.applyVoucher(code, subtotal, shippingFee);
    if (result.valid) {
        appliedVoucher = result.voucher;
        msg.textContent = result.message;
        msg.className = 'text-[11px] font-semibold text-emerald-400 block';
        calculateCartTotals();
    } else {
        appliedVoucher = null;
        msg.textContent = result.message;
        msg.className = 'text-[11px] font-semibold text-rose-400 block';
        calculateCartTotals();
    }
}

function quickApplyVoucher(code) {
    const input = document.getElementById('cartVoucherInput');
    if (input) {
        input.value = code;
        applyCartVoucher();
    }
}

function openCartDrawer() {
    document.getElementById('cartDrawer').classList.remove('hidden');
}

function closeCartDrawer() {
    document.getElementById('cartDrawer').classList.add('hidden');
}

// 8. Chốt Đơn Trực Tiếp & Thanh Toán VietQR
function openDirectCheckoutModal() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống, hãy chọn áo trước nhé!');
        return;
    }
    closeCartDrawer();
    calculateCartTotals();

    // Sinh mã đơn tạm thời để đưa vào mã VietQR
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const tempOrderCode = `DTS-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

    // Cập nhật thông tin VietQR
    updateVietQRDisplay(tempOrderCode);

    document.getElementById('directCheckoutModal').classList.remove('hidden');
}

function closeDirectCheckoutModal() {
    document.getElementById('directCheckoutModal').classList.add('hidden');
}

function togglePaymentDisplay(method) {
    const qrBox = document.getElementById('vietqrPreviewBox');
    if (!qrBox) return;
    if (method === 'vietqr') {
        qrBox.classList.remove('hidden');
    } else {
        qrBox.classList.add('hidden');
    }
}

function updateVietQRDisplay(orderCode) {
    const bank = (storeData.settings && storeData.settings.bank) || {
        bankId: "MB",
        bankName: "MBBank",
        accountNumber: "0389999999",
        accountName: "NGUYEN VAN KHA"
    };

    let subtotal = 0;
    cart.forEach(i => subtotal += i.price * i.quantity);
    let shippingFee = (currentShippingMethod === 'haihau' ? 15000 : 25000);
    if (cart.reduce((sum, item) => sum + item.quantity, 0) >= 2) shippingFee = 0;
    let discount = appliedVoucher ? StoreService.applyVoucher(appliedVoucher.code, subtotal, shippingFee).discount || 0 : 0;
    const finalAmount = Math.max(0, subtotal + shippingFee - discount);

    document.getElementById('vietqrAmountText').textContent = formatCurrency(finalAmount);
    document.getElementById('vietqrBankName').textContent = bank.bankName;
    document.getElementById('vietqrAccountNo').textContent = bank.accountNumber;
    document.getElementById('vietqrAccountName').textContent = bank.accountName;
    document.getElementById('vietqrMemo').textContent = orderCode;

    // Link API VietQR chuẩn Napas 24/7
    const qrUrl = `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNumber}-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(orderCode)}&accountName=${encodeURIComponent(bank.accountName)}`;
    document.getElementById('vietqrImage').src = qrUrl;
}

// Xử lý gửi Form Đặt Hàng Trực Tiếp
function submitDirectOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }

    const name = document.getElementById('orderCustomerName').value.trim();
    const phone = document.getElementById('orderCustomerPhone').value.trim();
    const address = document.getElementById('orderCustomerAddress').value.trim();
    const note = document.getElementById('orderCustomerNote').value.trim();
    const paymentMethod = document.querySelector('input[name="orderPaymentMethod"]:checked').value;

    let subtotal = 0;
    cart.forEach(i => subtotal += i.price * i.quantity);
    let shippingFee = (currentShippingMethod === 'haihau' ? 15000 : 25000);
    if (cart.reduce((sum, item) => sum + item.quantity, 0) >= 2) shippingFee = 0;
    let discount = appliedVoucher ? StoreService.applyVoucher(appliedVoucher.code, subtotal, shippingFee).discount || 0 : 0;
    const total = Math.max(0, subtotal + shippingFee - discount);

    const orderPayload = {
        customer: {
            name,
            phone,
            address,
            note
        },
        items: [...cart],
        shippingMethod: currentShippingMethod,
        shippingFee,
        discount,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
        subtotal,
        total,
        paymentMethod
    };

    // Tạo đơn hàng lưu vào hệ thống
    const createdOrder = StoreService.addOrder(orderPayload);
    lastCreatedOrder = createdOrder;

    // Ghi nhận lead
    StoreService.recordLead({
        type: `Đơn Hàng Mới #${createdOrder.code}`,
        productName: cart.map(i => `${i.name} (${i.size})`).join(', '),
        size: cart.map(i => i.size).join(', '),
        price: total,
        platform: paymentMethod === 'vietqr' ? 'VietQR' : 'COD'
    });

    // Làm rỗng giỏ hàng
    cart = [];
    appliedVoucher = null;
    updateCartUI();

    closeDirectCheckoutModal();

    // Mở màn hình Chúc mừng thành công
    document.getElementById('successOrderCode').textContent = `#${createdOrder.code}`;
    document.getElementById('successOrderTotal').textContent = formatCurrency(createdOrder.total);
    document.getElementById('successPaymentMethod').textContent = paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Thanh toán tiền mặt khi nhận đồ (COD)';
    document.getElementById('orderSuccessModal').classList.remove('hidden');
}

function closeSuccessModal() {
    document.getElementById('orderSuccessModal').classList.add('hidden');
}

function confirmOrderWithZalo() {
    if (!lastCreatedOrder) return;
    const hotline = (storeData.settings && storeData.settings.hotline) || '545654254245';
    const o = lastCreatedOrder;
    let msg = `Chào Kh_DTS Store Hải Hậu! Mình vừa đặt đơn hàng #${o.code} trên website:\n`;
    msg += `Khách hàng: ${o.customer.name} - SĐT: ${o.customer.phone}\n`;
    msg += `Địa chỉ: ${o.customer.address}\n`;
    msg += `Các món đặt:\n`;
    o.items.forEach((item, idx) => {
        msg += `+ ${idx + 1}. ${item.name} (Size ${item.size}) x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
    });
    msg += `Tổng thanh toán: ${formatCurrency(o.total)} (${o.paymentMethod.toUpperCase()})\nShop check đơn và giữ đồ ship cho mình nhé!`;

    window.open(`https://zalo.me/${hotline}?text=${encodeURIComponent(msg)}`, '_blank');
}

// In hóa đơn bán lẻ trực tiếp (A5/K80 Clean Invoice)
function printOrderInvoice() {
    if (!lastCreatedOrder) return;
    const o = lastCreatedOrder;
    const s = storeData.settings || {};
    const bank = s.bank || {};

    const invoiceWindow = window.open('', '_blank');
    const itemsHtml = o.items.map((it, idx) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${it.name}</strong><br><small>Size: ${it.size}</small></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${it.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(it.price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(it.price * it.quantity)}</td>
        </tr>
    `).join('');

    const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hóa Đơn Bán Lẻ #${o.code} - Kh_DTS Fashion Store</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; color: #222; }
                .invoice-box { max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.15); }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                .header p { margin: 4px 0; font-size: 13px; color: #555; }
                .info-table { width: 100%; margin-bottom: 20px; font-size: 13px; }
                .info-table td { padding: 4px 0; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                .items-table th { background: #f4f4f4; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
                .total-box { text-align: right; font-size: 14px; margin-top: 15px; }
                .total-box div { margin: 4px 0; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px dashed #ccc; padding-top: 15px; }
                @media print {
                    .no-print { display: none; }
                    .invoice-box { border: none; box-shadow: none; padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="no-print" style="text-align: right; margin-bottom: 15px;">
                    <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; font-weight: bold; cursor: pointer;">IN HÓA ĐƠN NÀY</button>
                </div>
                <div class="header">
                    <h1>Kh_DTS FASHION STORE</h1>
                    <p>Địa chỉ: ${s.address || 'TT. Yên Định, Hải Hậu, Nam Định'}</p>
                    <p>Hotline: ${s.hotline || '545654254245'} • Giờ mở cửa: 08:30 – 22:00</p>
                    <h2 style="margin-top: 15px; font-size: 18px;">HÓA ĐƠN BÁN HÀNG</h2>
                    <p>Mã đơn: <strong>#${o.code}</strong> • Ngày tạo: ${o.createdAt}</p>
                </div>
                <table class="info-table">
                    <tr>
                        <td><strong>Khách hàng:</strong> ${o.customer.name}</td>
                        <td style="text-align: right;"><strong>Số điện thoại:</strong> ${o.customer.phone}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Địa chỉ giao hàng:</strong> ${o.customer.address}</td>
                    </tr>
                    ${o.customer.note ? `<tr><td colspan="2"><strong>Ghi chú:</strong> ${o.customer.note}</td></tr>` : ''}
                </table>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 30px; text-align: center;">STT</th>
                            <th>Tên Sản Phẩm</th>
                            <th style="width: 50px; text-align: center;">SL</th>
                            <th style="width: 90px; text-align: right;">Đơn Giá</th>
                            <th style="width: 100px; text-align: right;">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="total-box">
                    <div>Tiền hàng: <strong>${formatCurrency(o.subtotal)}</strong></div>
                    <div>Phí vận chuyển: <strong>${o.shippingFee === 0 ? 'Miễn phí' : formatCurrency(o.shippingFee)}</strong></div>
                    ${o.discount > 0 ? `<div>Giảm giá Voucher: <strong style="color: green;">-${formatCurrency(o.discount)}</strong></div>` : ''}
                    <div style="font-size: 17px; margin-top: 8px;">Tổng thanh toán: <strong style="color: #000;">${formatCurrency(o.total)}</strong></div>
                    <div style="font-size: 13px; color: #555;">Phương thức: <strong>${o.paymentMethod.toUpperCase()}</strong> (${o.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Thu Tiền Khi Nhận'})</div>
                </div>
                <div class="footer">
                    <p>Cảm ơn bạn đã lựa chọn đồ của Kh_DTS!</p>
                    <p>Hỗ trợ đổi size trong vòng 7 ngày nếu mặc không vừa • Hotline: ${s.hotline}</p>
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
}

// Format tiền VND chuẩn
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
}

// Lọc theo danh mục
function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active', 'bg-white', 'text-black');
            btn.classList.remove('bg-card', 'text-gray-300');
        } else {
            btn.classList.remove('active', 'bg-white', 'text-black');
            btn.classList.add('bg-card', 'text-gray-300');
        }
    });
    renderProducts();

    const section = document.getElementById('products');
    if (section && window.scrollY < section.offsetTop - 300) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function selectProductSize(productId, size) {
    const product = storeData.products.find(p => p.id === productId);
    if (!product) return;
    product.selectedSize = size;

    if (product.sizes) {
        product.sizes.forEach(s => {
            const btn = document.getElementById(`size-btn-${productId}-${s}`);
            if (btn && !btn.disabled) {
                if (s === size) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            }
        });
    }
}

// Tính Size tự động (Check Size Form)
function calculateSize() {
    const height = parseFloat(document.getElementById('userHeight').value);
    const weight = parseFloat(document.getElementById('userWeight').value);
    const resultBox = document.getElementById('sizeResult');
    const sizeText = document.getElementById('recommendedSizeText');
    const adviceText = document.getElementById('sizeAdviceText');

    if (!height || !weight) {
        alert("Vui lòng nhập cả chiều cao và cân nặng để xem gợi ý size nhé!");
        return;
    }

    let recommended = 'SIZE L';
    let advice = 'Size L là size quốc dân chuẩn Streetwear, che khuyết điểm tốt và tôn dáng.';

    if (height < 168 && weight < 58) {
        recommended = 'SIZE M';
        advice = 'Form áo Kh_DTS chuẩn Oversize, size M sẽ mặc thụng thoải mái và vừa vặn đẹp.';
    } else if (height <= 177 && weight <= 72) {
        recommended = 'SIZE L';
        advice = 'Size L là size quốc dân chuẩn Streetwear, che khuyết điểm tốt và tôn dáng.';
    } else {
        recommended = 'SIZE XL';
        advice = 'Size XL form rộng rãi phủ mông cá tính, thoải mái vận động cho dáng người cao to.';
    }

    sizeText.textContent = recommended;
    adviceText.textContent = advice;
    resultBox.classList.remove('hidden');
}

// Mobile Menu toggling
function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });
}

function scrollToProducts() {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function openPlatformModal() {
    if (storeData && storeData.products && storeData.products.length > 0) {
        openProductDetail(storeData.products[0].id);
    }
}

function openZaloModal() {
    const hotline = (storeData.settings && storeData.settings.hotline) || '545654254245';
    window.open(`https://zalo.me/${hotline}?text=${encodeURIComponent('Chào Kh_DTS Store Hải Hậu! Mình cần tư vấn mẫu áo phù hợp.')}`, '_blank');
}

// Toast Notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-2';
    toast.innerHTML = `<i class="fa-solid fa-check text-emerald-600"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2500);
}
