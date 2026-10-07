// Kh_DTS Fashion Store - Main Application Logic

// 1. Dữ liệu sản phẩm mẫu (Áo thun, Hoodie, Phụ kiện) tầm giá 150.000đ - 250.000đ
const sampleProducts = [
    {
        id: 1,
        name: "Áo Thun Kh_DTS Oversize 'Cyber Vibe' Washed Tee",
        category: "tshirt",
        price: 189000,
        originalPrice: 240000,
        tag: "BEST SELLER",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "L",
        desc: "Cotton 100% 2 chiều định lượng 250gsm, hiệu ứng wash acid cá tính, in lụa cao cấp không bong tróc."
    },
    {
        id: 2,
        name: "Hoodie Nỉ Bông Kh_DTS 'Be Yourself' Boxy Fit",
        category: "hoodie",
        price: 249000,
        originalPrice: 320000,
        tag: "HOT DROP",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "L",
        desc: "Chất nỉ bông chân cua dày dặn giữ ấm tốt, form boxy tôn dáng cho các bạn nam trẻ trung."
    },
    {
        id: 3,
        name: "Áo Thun Graphic 'Nam Định Youth' Heavyweight",
        category: "tshirt",
        price: 169000,
        originalPrice: 220000,
        tag: "NEW",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "M",
        desc: "Họa tiết đồ họa mang âm hưởng đường phố, cổ áo bo dệt kim 3cm chống dão sau nhiều lần giặt."
    },
    {
        id: 4,
        name: "Zip Hoodie Kh_DTS 2 Chiều Blackout Streetwear",
        category: "hoodie",
        price: 239000,
        originalPrice: 290000,
        tag: "TRENDING",
        image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "XL",
        desc: "Dây khóa kéo kim loại 2 chiều tiện lợi tạo kiểu, mũ áo may 2 lớp to phồng cực ngầu."
    },
    {
        id: 5,
        name: "Mũ Lưỡi Trai Kh_DTS Star Metallic Tactical Cap",
        category: "accessory",
        price: 159000,
        originalPrice: 199000,
        tag: "MUST HAVE",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        sizes: ["Freesize"],
        selectedSize: "Freesize",
        desc: "Form nón cứng cáp, vải kaki cotton wash nhẹ, khóa sau kim loại dập nổi logo sắc nét."
    },
    {
        id: 6,
        name: "Áo Thun Basic Trơn Kh_DTS Drop Shoulder",
        category: "tshirt",
        price: 150000,
        originalPrice: 180000,
        tag: "BASIC",
        image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "L",
        desc: "Tone màu trung tính dễ phối đồ đi học, đi chơi hoặc mặc layer cùng áo khoác ngoài."
    },
    {
        id: 7,
        name: "Túi Đeo Chéo Mini Crossbody Streetwear Bag",
        category: "accessory",
        price: 179000,
        originalPrice: 230000,
        tag: "HOT",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        sizes: ["Freesize"],
        selectedSize: "Freesize",
        desc: "Vải Canvas chống trầy xước và kháng nước nhẹ, đựng vừa điện thoại, ví tiền và phụ kiện nhỏ."
    },
    {
        id: 8,
        name: "Hoodie Kh_DTS Raw Cut Vintage Wash",
        category: "hoodie",
        price: 245000,
        originalPrice: 310000,
        tag: "LIMITED",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        sizes: ["M", "L", "XL"],
        selectedSize: "L",
        desc: "Thiết kế gấu áo raw cut cá tính, màu wash loang tự nhiên độc bản không đụng hàng."
    }
];

// Trạng thái ứng dụng
let currentCategory = 'all';
let cart = [];
let currentModalProduct = null;
const HOTLINE = '545654254245';

// Format tiền VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
}

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    setupMobileMenu();
    updateCartUI();
});

// Render danh sách sản phẩm
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const filtered = currentCategory === 'all' 
        ? sampleProducts 
        : sampleProducts.filter(p => p.category === currentCategory);

    grid.innerHTML = filtered.map(product => `
        <div class="product-card bg-card border border-bordercol flex flex-col justify-between group">
            <div>
                <!-- Ảnh sản phẩm -->
                <div class="img-zoom-container relative aspect-[4/5] bg-darker overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover filter contrast-110">
                    <span class="absolute top-2.5 left-2.5 text-[9px] font-extrabold tracking-widest px-2 py-0.5 bg-white text-black uppercase">
                        ${product.tag}
                    </span>
                    <button onclick="addToCart(${product.id})" class="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/80 hover:bg-white text-white hover:text-black border border-bordercol flex items-center justify-center transition-all opacity-90 group-hover:opacity-100" title="Thêm vào giỏ">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>

                <!-- Thông tin sản phẩm -->
                <div class="p-3.5">
                    <div class="text-[10px] uppercase font-bold text-subtext tracking-wider mb-1">
                        ${product.category === 'tshirt' ? 'Áo Thun' : product.category === 'hoodie' ? 'Hoodie' : 'Phụ Kiện'}
                    </div>
                    <h3 class="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug h-9 mb-2">
                        ${product.name}
                    </h3>

                    <!-- Giá bán -->
                    <div class="flex items-baseline gap-2 mb-3">
                        <span class="text-sm sm:text-base font-extrabold text-white font-display">
                            ${formatCurrency(product.price)}
                        </span>
                        <span class="text-[11px] text-gray-500 line-through">
                            ${formatCurrency(product.originalPrice)}
                        </span>
                    </div>

                    <!-- Chọn Size -->
                    <div class="flex items-center gap-1.5 mb-3">
                        ${product.sizes.map(size => `
                            <button onclick="selectProductSize(${product.id}, '${size}')" 
                                    id="size-btn-${product.id}-${size}"
                                    class="size-btn text-[10px] font-bold px-2 py-1 border border-bordercol rounded-none ${size === product.selectedSize ? 'selected' : 'text-gray-400 hover:text-white'}">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Nút Mua Ngay (Kích hoạt Modal chọn Shopee / TikTok / Zalo) -->
            <div class="p-3.5 pt-0">
                <button onclick="openCheckoutModal(${product.id})" class="w-full py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 shadow">
                    <span>CHỐT ĐƠN NGAY</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Lọc theo danh mục
function filterCategory(category) {
    currentCategory = category;
    
    // Cập nhật trạng thái nút
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
            btn.classList.remove('bg-card', 'text-gray-300');
            btn.classList.add('bg-white', 'text-black');
        } else {
            btn.classList.remove('active', 'bg-white', 'text-black');
            btn.classList.add('bg-card', 'text-gray-300');
        }
    });

    renderProducts();

    // Cuộn nhẹ tới danh sách sản phẩm nếu đang ở section khác
    const section = document.getElementById('products');
    if (section && window.scrollY < section.offsetTop - 300) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Đổi size trực tiếp trên card
function selectProductSize(productId, size) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;
    product.selectedSize = size;

    // Cập nhật UI nút size
    product.sizes.forEach(s => {
        const btn = document.getElementById(`size-btn-${productId}-${s}`);
        if (btn) {
            if (s === size) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        }
    });
}

// Mở modal điều hướng chốt đơn
function openCheckoutModal(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;

    currentModalProduct = product;

    document.getElementById('modalProductImg').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = formatCurrency(product.price);
    document.getElementById('modalProductSize').textContent = `Size: ${product.selectedSize}`;

    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('hidden');
}

// Đóng modal điều hướng
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('hidden');
    currentModalProduct = null;
}

// Chuyển hướng tới Shopee, TikTok Shop, Zalo
function redirectToPlatform(platform) {
    if (!currentModalProduct) return;

    const p = currentModalProduct;
    const productName = encodeURIComponent(p.name);
    const orderMessage = encodeURIComponent(`Chào Kh_DTS! Mình muốn đặt mua mẫu: "${p.name}" (Size ${p.selectedSize}) - Giá ${formatCurrency(p.price)}. Shop tư vấn và ship hàng về giúp mình nhé!`);

    if (platform === 'shopee') {
        // Mở Shopee (hoặc search gian hàng Kh_DTS)
        window.open(`https://shopee.vn/search?keyword=Kh_DTS%20${productName}`, '_blank');
    } else if (platform === 'tiktok') {
        // Mở TikTok Shop
        window.open(`https://www.tiktok.com/tag/kh_dts`, '_blank');
    } else if (platform === 'zalo') {
        // Mở chat Zalo với hotline & nội dung soạn sẵn
        window.open(`https://zalo.me/${HOTLINE}?text=${orderMessage}`, '_blank');
    }

    closeCheckoutModal();
}

// Giỏ hàng
function addToCart(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === product.selectedSize);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: product.selectedSize,
            quantity: 1
        });
    }

    updateCartUI();
    showToast(`Đã thêm "${product.name}" (${product.selectedSize}) vào giỏ!`);
}

function updateCartUI() {
    const countEl = document.getElementById('cartCount');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = totalCount;

    const listEl = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotalPrice');

    if (!listEl || !totalEl) return;

    if (cart.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-8 text-gray-500 text-xs">
                <i class="fa-solid fa-basket-shopping text-3xl mb-2 block"></i>
                Chưa có sản phẩm nào trong giỏ hàng.
            </div>
        `;
        totalEl.textContent = '0đ';
        return;
    }

    let totalPrice = 0;
    listEl.innerHTML = cart.map((item, index) => {
        totalPrice += item.price * item.quantity;
        return `
            <div class="flex items-center gap-3 p-3 bg-card border border-bordercol">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover">
                <div class="flex-1">
                    <h4 class="text-xs font-bold text-white line-clamp-1">${item.name}</h4>
                    <div class="text-[11px] text-gray-400 mt-0.5">Size: <strong class="text-white">${item.size}</strong> • SL: ${item.quantity}</div>
                    <div class="text-xs font-extrabold text-white mt-1">${formatCurrency(item.price * item.quantity)}</div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-red-400 p-2 text-xs">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');

    totalEl.textContent = formatCurrency(totalPrice);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function openCartDrawer() {
    document.getElementById('cartDrawer').classList.remove('hidden');
}

function closeCartDrawer() {
    document.getElementById('cartDrawer').classList.add('hidden');
}

function checkoutCart(platform) {
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    let orderSummary = "Kh_DTS ơi, mình muốn đặt các món sau:\n";
    let total = 0;
    cart.forEach((item, idx) => {
        orderSummary += `${idx + 1}. ${item.name} - Size ${item.size} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
        total += item.price * item.quantity;
    });
    orderSummary += `Tổng cộng: ${formatCurrency(total)}\nĐịa chỉ nhận hàng tại Hải Hậu/Toàn quốc: `;

    if (platform === 'zalo') {
        window.open(`https://zalo.me/${HOTLINE}?text=${encodeURIComponent(orderSummary)}`, '_blank');
    } else {
        window.open(`https://shopee.vn/search?keyword=Kh_DTS`, '_blank');
    }
}

// Tính Size tự động
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

    let recommended = 'L';
    let advice = '';

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
    if (sampleProducts.length > 0) {
        openCheckoutModal(sampleProducts[0].id);
    }
}

function openZaloModal() {
    window.open(`https://zalo.me/${HOTLINE}?text=${encodeURIComponent('Chào Kh_DTS Store Hải Hậu! Mình cần tư vấn mẫu áo phù hợp.')}`, '_blank');
}

// Toast Notification đơn giản
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs font-bold px-4 py-2 rounded-full shadow-2xl z-50 animate-bounce';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2500);
}
