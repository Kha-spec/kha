// admin.js - Logic điều khiển hệ thống CMS & OMS Quản Trị Kh_DTS Store
// Tích hợp: Quản lý Đơn hàng OMS, Tồn kho SKU từng Size, Mã Voucher & Cài đặt VietQR

let adminData = null;
let currentAdminCategory = 'all';
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

// Khởi chạy CMS
function initAdmin() {
    if (typeof StoreService === 'undefined') {
        alert('Lỗi: Không tìm thấy StoreService. Vui lòng kiểm tra file data.js!');
        return;
    }

    adminData = StoreService.loadData();
    renderAdminOrders();
    renderAdminProducts();
    renderAdminVouchers();
    renderAdminArticles();
    fillStoreSettings();
    fillHeroBanner();
    renderAdminLookbook();
    fillShowroomSettings();
    renderAdminLeads();
    updateBadges();
}

// 1. Chuyển đổi Tab điều hướng
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'text-black');
        btn.classList.add('text-gray-400');
    });

    const targetTab = document.getElementById(`tab-${tabId}`);
    const targetBtn = document.getElementById(`tabBtn-${tabId}`);
    if (targetTab) targetTab.classList.remove('hidden');
    if (targetBtn) {
        targetBtn.classList.add('bg-white', 'text-black');
        targetBtn.classList.remove('text-gray-400');
    }
}

// Cập nhật số lượng đếm trên badge & dashboard
function updateBadges() {
    const products = adminData.products || [];
    const countAll = products.length;
    const countTshirt = products.filter(p => p.category === 'tshirt').length;
    const countHoodie = products.filter(p => p.category === 'hoodie').length;
    const countAccessory = products.filter(p => p.category === 'accessory').length;

    const badgeProduct = document.getElementById('productBadgeCount');
    if (badgeProduct) badgeProduct.textContent = countAll;

    const elAll = document.getElementById('countAll');
    const elT = document.getElementById('countTshirt');
    const elH = document.getElementById('countHoodie');
    const elA = document.getElementById('countAccessory');

    if (elAll) elAll.textContent = countAll;
    if (elT) elT.textContent = countTshirt;
    if (elH) elH.textContent = countHoodie;
    if (elA) elA.textContent = countAccessory;

    // Đơn hàng & Dashboard
    const orders = StoreService.getOrders();
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const completedOrders = orders.filter(o => o.status === 'completed');

    let totalRevenue = 0;
    orders.forEach(o => {
        if (o.status !== 'cancelled') {
            totalRevenue += o.total || 0;
        }
    });

    const badgeOrders = document.getElementById('ordersBadgeCount');
    if (badgeOrders) badgeOrders.textContent = pendingOrders.length;

    const sTotal = document.getElementById('statTotalOrders');
    const sPending = document.getElementById('statPendingOrders');
    const sRev = document.getElementById('statRevenue');
    const sComp = document.getElementById('statCompletedOrders');

    if (sTotal) sTotal.textContent = orders.length;
    if (sPending) sPending.textContent = pendingOrders.length;
    if (sRev) sRev.textContent = formatVND(totalRevenue);
    if (sComp) sComp.textContent = completedOrders.length;

    // Vouchers badge
    const vouchers = StoreService.getVouchers();
    const vBadge = document.getElementById('voucherBadgeCount');
    if (vBadge) vBadge.textContent = vouchers.length;

    // Leads badge
    const leads = StoreService.getLeads();
    const leadsBadge = document.getElementById('leadsBadgeCount');
    if (leadsBadge) leadsBadge.textContent = leads.length;

    // Blog articles badge
    const articles = StoreService.getArticles();
    const blogBadge = document.getElementById('blogBadgeCount');
    if (blogBadge) blogBadge.textContent = articles.length;
}

// 2. PHÂN HỆ QUẢN LÝ ĐƠN HÀNG (OMS)
function renderAdminOrders() {
    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    const filterStatus = document.getElementById('filterOrderStatus') ? document.getElementById('filterOrderStatus').value : 'all';
    let orders = StoreService.getOrders();

    if (filterStatus !== 'all') {
        orders = orders.filter(o => o.status === filterStatus);
    }

    updateBadges();

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-12 text-gray-500">
                    <i class="fa-solid fa-clipboard-check text-3xl mb-2 block text-gray-600"></i>
                    Không có đơn hàng nào trong mục này.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(o => {
        // Trạng thái badge
        let statusBadge = '';
        if (o.status === 'pending') statusBadge = '<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">Chờ duyệt</span>';
        else if (o.status === 'confirmed') statusBadge = '<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">Đã xác nhận</span>';
        else if (o.status === 'shipping') statusBadge = '<span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">Đang ship</span>';
        else if (o.status === 'completed') statusBadge = '<span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">Hoàn tất</span>';
        else if (o.status === 'cancelled') statusBadge = '<span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">Đã hủy</span>';

        // Payment
        const paymentLabel = o.paymentMethod === 'vietqr' 
            ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold"><i class="fa-solid fa-qrcode mr-1"></i>VietQR</span>'
            : '<span class="px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-300 font-bold">COD (Tiền mặt)</span>';

        // Tóm tắt món
        const itemsSummary = (o.items || []).map(i => `<div>• <strong>${i.name}</strong> <span class="text-gray-400">(${i.size}) x${i.quantity}</span></div>`).join('');

        return `
            <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="py-3 px-4 font-mono font-bold text-amber-400">#${o.code}<br><small class="text-gray-500 font-sans font-normal">${o.createdAt}</small></td>
                <td class="py-3 px-4">
                    <div class="font-bold text-white text-xs">${o.customer.name}</div>
                    <a href="tel:${o.customer.phone}" class="text-[11px] text-gray-300 hover:text-white font-mono"><i class="fa-solid fa-phone mr-1"></i>${o.customer.phone}</a>
                </td>
                <td class="py-3 px-4 text-gray-300 text-[11px] max-w-xs">
                    <div>${o.customer.address}</div>
                    ${o.customer.note ? `<div class="text-[10px] text-amber-300/80 italic mt-0.5">Ghi chú: ${o.customer.note}</div>` : ''}
                </td>
                <td class="py-3 px-4 text-xs">${itemsSummary}</td>
                <td class="py-3 px-4">
                    <div class="font-extrabold text-white font-display text-sm">${formatVND(o.total)}</div>
                    <div class="text-[10px] text-gray-400">${o.shippingMethod === 'haihau' ? 'Ship Hải Hậu 2H' : 'Ship Toàn Quốc'}</div>
                </td>
                <td class="py-3 px-4">${paymentLabel}</td>
                <td class="py-3 px-4">
                    <select onchange="changeOrderStatus(${o.id}, this.value)" class="bg-darker border border-bordercol px-2 py-1 rounded text-[11px] text-white focus:outline-none">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>🟡 Chờ duyệt</option>
                        <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>🔵 Đã xác nhận</option>
                        <option value="shipping" ${o.status === 'shipping' ? 'selected' : ''}>🟣 Đang giao hàng</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>🟢 Hoàn tất</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>🔴 Đã hủy</option>
                    </select>
                </td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="printAdminOrderInvoice(${o.id})" class="p-1.5 text-xs bg-darker hover:bg-white hover:text-black border border-bordercol rounded text-gray-300 transition-colors" title="In Hóa Đơn Bán Lẻ">
                            <i class="fa-solid fa-print"></i>
                        </button>
                        <a href="https://zalo.me/${o.customer.phone}?text=${encodeURIComponent('Chào bạn! Kh_DTS Store Hải Hậu liên hệ xác nhận đơn hàng #' + o.code)}" target="_blank" class="p-1.5 text-xs bg-[#0068FF]/10 hover:bg-[#0068FF] hover:text-white border border-[#0068FF]/30 rounded text-[#0068FF] transition-colors" title="Chat Zalo khách hàng">
                            <i class="fa-solid fa-comment-dots"></i>
                        </a>
                        <button onclick="deleteAdminOrder(${o.id})" class="p-1.5 text-xs bg-darker hover:bg-rose-500 hover:text-white border border-bordercol rounded text-gray-400 hover:border-rose-500 transition-colors" title="Xóa đơn hàng">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function changeOrderStatus(orderId, newStatus) {
    StoreService.updateOrderStatus(orderId, newStatus);
    showToast(`Đã cập nhật trạng thái đơn #${orderId}!`, 'info');
    updateBadges();
}

function deleteAdminOrder(orderId) {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng này khỏi hệ thống?`)) {
        StoreService.deleteOrder(orderId);
        renderAdminOrders();
        showToast('Đã xóa đơn hàng thành công!');
    }
}

// In Hóa Đơn từ Admin
function printAdminOrderInvoice(orderId) {
    const orders = StoreService.getOrders();
    const o = orders.find(item => item.id === Number(orderId));
    if (!o) return;

    const s = adminData.settings || {};
    const invoiceWindow = window.open('', '_blank');
    const itemsHtml = o.items.map((it, idx) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${it.name}</strong><br><small>Size: ${it.size}</small></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${it.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatVND(it.price)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatVND(it.price * it.quantity)}</td>
        </tr>
    `).join('');

    const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hóa Đơn Bán Hàng #${o.code}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; color: #111; }
                .invoice-box { max-width: 650px; margin: auto; padding: 25px; border: 1px solid #eee; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
                .header p { margin: 4px 0; font-size: 13px; color: #555; }
                .info-table { width: 100%; margin-bottom: 20px; font-size: 13px; }
                .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
                .items-table th { background: #f4f4f4; padding: 8px; text-align: left; border-bottom: 2px solid #ddd; }
                .total-box { text-align: right; font-size: 14px; margin-top: 15px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 1px dashed #ccc; padding-top: 15px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="no-print" style="text-align: right; margin-bottom: 15px;">
                    <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; font-weight: bold; cursor: pointer;">IN HÓA ĐƠN</button>
                </div>
                <div class="header">
                    <h1>Kh_DTS FASHION STORE</h1>
                    <p>Địa chỉ: ${s.address || 'TT. Yên Định, Hải Hậu, Nam Định'}</p>
                    <p>Hotline: ${s.hotline || '545654254245'}</p>
                    <h2 style="margin-top: 15px; font-size: 18px;">HÓA ĐƠN BÁN LẺ & GIAO HÀNG</h2>
                    <p>Mã đơn: <strong>#${o.code}</strong> • Ngày: ${o.createdAt}</p>
                </div>
                <table class="info-table">
                    <tr>
                        <td><strong>Khách hàng:</strong> ${o.customer.name}</td>
                        <td style="text-align: right;"><strong>Số điện thoại:</strong> ${o.customer.phone}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Địa chỉ giao:</strong> ${o.customer.address}</td>
                    </tr>
                    ${o.customer.note ? `<tr><td colspan="2"><strong>Ghi chú:</strong> ${o.customer.note}</td></tr>` : ''}
                </table>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 30px; text-align: center;">STT</th>
                            <th>Sản Phẩm</th>
                            <th style="width: 50px; text-align: center;">SL</th>
                            <th style="width: 90px; text-align: right;">Đơn Giá</th>
                            <th style="width: 100px; text-align: right;">Thành Tiền</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div class="total-box">
                    <div>Tiền hàng: <strong>${formatVND(o.subtotal)}</strong></div>
                    <div>Phí ship: <strong>${o.shippingFee === 0 ? 'Miễn phí' : formatVND(o.shippingFee)}</strong></div>
                    ${o.discount > 0 ? `<div>Giảm giá: <strong style="color: green;">-${formatVND(o.discount)}</strong></div>` : ''}
                    <div style="font-size: 17px; margin-top: 6px;">Tổng thanh toán: <strong>${formatVND(o.total)}</strong></div>
                    <div style="font-size: 13px; color: #666;">Hình thức: <strong>${o.paymentMethod.toUpperCase()}</strong></div>
                </div>
                <div class="footer">
                    <p>Cảm ơn bạn đã lựa chọn Kh_DTS Store!</p>
                </div>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `;
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
}

// 3. PHÂN HỆ SẢN PHẨM & TỒN KHO SKU
function renderAdminProducts() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody || !adminData.products) return;

    let list = adminData.products;

    if (currentAdminCategory !== 'all') {
        list = list.filter(p => p.category === currentAdminCategory);
    }

    if (currentSearchTerm.trim() !== '') {
        const term = currentSearchTerm.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(term));
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-12 text-gray-500">
                    <i class="fa-solid fa-box-open text-3xl mb-2 block"></i>
                    Không tìm thấy sản phẩm nào phù hợp.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(p => {
        const catLabel = p.category === 'tshirt' 
            ? '<span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">Áo Thun</span>'
            : p.category === 'hoodie'
                ? '<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">Hoodie</span>'
                : '<span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">Phụ Kiện</span>';

        const tagLabel = p.tag 
            ? `<span class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-white text-black">${p.tag}</span>`
            : '<span class="text-gray-500">-</span>';

        // Tồn kho chi tiết theo từng size
        const inv = p.inventory || {};
        let invStr = '';
        if (p.sizes && p.sizes.length > 0) {
            invStr = p.sizes.map(s => {
                const count = inv[s] !== undefined ? Number(inv[s]) : 10;
                return `<span class="inline-block px-1.5 py-0.5 mr-1 rounded ${count > 0 ? 'bg-darker border border-bordercol text-gray-300' : 'bg-rose-500/10 text-rose-400'} font-mono">${s}: <strong>${count}</strong></span>`;
            }).join('');
        } else {
            invStr = '<span class="text-gray-500">Chưa đặt tồn kho</span>';
        }

        const isChecked = p.inStock !== false;

        return `
            <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="py-3 px-4 text-center">
                    <img src="${p.image}" alt="${p.name}" class="w-12 h-14 object-cover rounded border border-bordercol mx-auto">
                </td>
                <td class="py-3 px-4">
                    <div class="font-bold text-white text-xs line-clamp-1">${p.name}</div>
                    <div class="text-[11px] text-gray-400 line-clamp-1 mt-0.5">${p.modelInfo || p.desc || 'Chưa có mô tả'}</div>
                </td>
                <td class="py-3 px-4">${catLabel}</td>
                <td class="py-3 px-4">
                    <div class="font-bold text-white">${formatVND(p.price)}</div>
                    ${p.originalPrice ? `<div class="text-[10px] text-gray-500 line-through">${formatVND(p.originalPrice)}</div>` : ''}
                </td>
                <td class="py-3 px-4 text-xs">${invStr}</td>
                <td class="py-3 px-4">${tagLabel}</td>
                <td class="py-3 px-4 text-center">
                    <label class="switch">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleProductStock(${p.id})">
                        <span class="slider"></span>
                    </label>
                </td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="openProductModal(${p.id})" class="p-1.5 text-xs bg-darker hover:bg-white hover:text-black border border-bordercol rounded text-gray-300 transition-colors" title="Chỉnh sửa sản phẩm & kho">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="confirmDeleteProduct(${p.id}, '${escapeQuote(p.name)}')" class="p-1.5 text-xs bg-darker hover:bg-rose-500 hover:text-white border border-bordercol rounded text-gray-400 hover:border-rose-500 transition-colors" title="Xóa sản phẩm">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterAdminProducts() {
    currentSearchTerm = document.getElementById('productSearchInput').value;
    renderAdminProducts();
}

function filterAdminCategory(cat) {
    currentAdminCategory = cat;
    document.querySelectorAll('.admin-cat-pill').forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
            btn.classList.add('bg-white', 'text-black', 'border-white');
            btn.classList.remove('bg-card', 'text-gray-300', 'border-bordercol');
        } else {
            btn.classList.remove('bg-white', 'text-black', 'border-white');
            btn.classList.add('bg-card', 'text-gray-300', 'border-bordercol');
        }
    });
    renderAdminProducts();
}

function toggleProductStock(id) {
    const newStatus = StoreService.toggleProductStock(id);
    adminData = StoreService.loadData();
    showToast(newStatus ? 'Đã bật bán sản phẩm ra trang chủ' : 'Đã tạm ẩn sản phẩm khỏi trang chủ', 'info');
}

function confirmDeleteProduct(id, name) {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi website không?`)) {
        StoreService.deleteProduct(id);
        adminData = StoreService.loadData();
        renderAdminProducts();
        updateBadges();
        showToast(`Đã xóa sản phẩm thành công!`);
    }
}

// Modal Thêm / Sửa Sản phẩm
function openProductModal(id = null) {
    const modal = document.getElementById('productModal');
    const titleEl = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    document.getElementById('formProductImgPreview').classList.add('hidden');

    if (id) {
        const p = adminData.products.find(item => item.id === Number(id));
        if (!p) return;

        titleEl.textContent = 'CHỈNH SỬA SẢN PHẨM: ' + p.name;
        document.getElementById('formProductId').value = p.id;
        document.getElementById('formProductName').value = p.name;
        document.getElementById('formProductCategory').value = p.category;
        document.getElementById('formProductPrice').value = p.price;
        document.getElementById('formProductOriginalPrice').value = p.originalPrice || '';
        document.getElementById('formProductTag').value = p.tag || '';
        document.getElementById('formProductImage').value = p.image;
        document.getElementById('formProductModelInfo').value = p.modelInfo || '';
        document.getElementById('formProductDesc').value = p.desc || '';

        // Tồn kho từng size
        const inv = p.inventory || {};
        document.getElementById('stockM').value = inv['M'] !== undefined ? inv['M'] : 10;
        document.getElementById('stockL').value = inv['L'] !== undefined ? inv['L'] : 15;
        document.getElementById('stockXL').value = inv['XL'] !== undefined ? inv['XL'] : 8;
        document.getElementById('stockFreesize').value = inv['Freesize'] !== undefined ? inv['Freesize'] : 0;

        previewModalImage(p.image);
    } else {
        titleEl.textContent = 'THÊM MẪU SẢN PHẨM MỚI';
        document.getElementById('formProductId').value = '';
        document.getElementById('stockM').value = 10;
        document.getElementById('stockL').value = 15;
        document.getElementById('stockXL').value = 8;
        document.getElementById('stockFreesize').value = 0;
    }

    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function previewModalImage(url) {
    const img = document.getElementById('formProductImgPreview');
    if (url && url.trim().startsWith('http')) {
        img.src = url;
        img.classList.remove('hidden');
    } else {
        img.classList.add('hidden');
    }
}

function selectQuickTag(tag) {
    document.getElementById('formProductTag').value = tag;
}

function saveProductForm(e) {
    e.preventDefault();

    const id = document.getElementById('formProductId').value;
    const name = document.getElementById('formProductName').value.trim();
    const category = document.getElementById('formProductCategory').value;
    const price = parseFloat(document.getElementById('formProductPrice').value);
    const origPriceVal = document.getElementById('formProductOriginalPrice').value;
    const originalPrice = origPriceVal ? parseFloat(origPriceVal) : null;
    const tag = document.getElementById('formProductTag').value.trim().toUpperCase();
    const image = document.getElementById('formProductImage').value.trim();
    const modelInfo = document.getElementById('formProductModelInfo').value.trim();
    const desc = document.getElementById('formProductDesc').value.trim();

    // Thu thập tồn kho từng size
    const inventory = {
        "M": parseInt(document.getElementById('stockM').value) || 0,
        "L": parseInt(document.getElementById('stockL').value) || 0,
        "XL": parseInt(document.getElementById('stockXL').value) || 0,
        "Freesize": parseInt(document.getElementById('stockFreesize').value) || 0
    };

    const sizes = [];
    if (category === 'accessory') {
        sizes.push('Freesize');
    } else {
        if (inventory['M'] > 0 || id) sizes.push('M');
        if (inventory['L'] > 0 || id) sizes.push('L');
        if (inventory['XL'] > 0 || id) sizes.push('XL');
        if (sizes.length === 0) sizes.push('Freesize');
    }

    const payload = {
        name,
        category,
        price,
        originalPrice,
        tag,
        image,
        sizes,
        inventory,
        modelInfo,
        desc
    };

    if (id) {
        StoreService.updateProduct(id, payload);
        showToast(`Đã cập nhật "${name}" thành công!`);
    } else {
        StoreService.addProduct(payload);
        showToast(`Đã thêm mẫu mới "${name}" vào website!`);
    }

    adminData = StoreService.loadData();
    renderAdminProducts();
    updateBadges();
    closeProductModal();
}

// 4. PHÂN HỆ QUẢN LÝ MÃ GIẢM GIÁ (VOUCHERS)
function renderAdminVouchers() {
    const tbody = document.getElementById('adminVouchersTableBody');
    if (!tbody) return;

    const vouchers = StoreService.getVouchers();
    if (vouchers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-gray-500">
                    Chưa có mã giảm giá nào. Nhấp "+ Thêm Voucher Mới" để tạo.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = vouchers.map(v => `
        <tr class="hover:bg-white/[0.02]">
            <td class="py-3 px-4 font-mono font-bold text-amber-400 text-sm">${v.code}</td>
            <td class="py-3 px-4 font-bold text-white">${v.type === 'shipping' ? 'Miễn phí ship' : formatVND(v.value)}</td>
            <td class="py-3 px-4 text-gray-300">${v.minOrder ? 'Đơn từ ' + formatVND(v.minOrder) : 'Mọi đơn hàng'}</td>
            <td class="py-3 px-4 text-gray-400">${v.desc || '-'}</td>
            <td class="py-3 px-4 text-right">
                <button onclick="deleteAdminVoucher('${v.code}')" class="p-1.5 text-xs text-gray-400 hover:text-rose-400 bg-darker border border-bordercol rounded" title="Xóa mã">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openVoucherModal() {
    document.getElementById('voucherForm').reset();
    document.getElementById('voucherModal').classList.remove('hidden');
}

function closeVoucherModal() {
    document.getElementById('voucherModal').classList.add('hidden');
}

function saveVoucherForm(e) {
    e.preventDefault();
    const code = document.getElementById('voucherCode').value.trim().toUpperCase();
    const type = document.getElementById('voucherType').value;
    const value = parseFloat(document.getElementById('voucherValue').value);
    const minOrder = parseFloat(document.getElementById('voucherMinOrder').value) || 0;
    const desc = document.getElementById('voucherDesc').value.trim();

    StoreService.addVoucher({ code, type, value, minOrder, desc });
    adminData = StoreService.loadData();
    renderAdminVouchers();
    updateBadges();
    closeVoucherModal();
    showToast(`Đã tạo mã giảm giá ${code}!`);
}

function deleteAdminVoucher(code) {
    if (confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) {
        StoreService.deleteVoucher(code);
        adminData = StoreService.loadData();
        renderAdminVouchers();
        updateBadges();
        showToast('Đã xóa mã voucher!');
    }
}

// 5. CÀI ĐẶT CỬA HÀNG & VIETQR
function fillStoreSettings() {
    const s = adminData.settings;
    if (!s) return;

    if (s.topBanner) {
        document.getElementById('settingTopBannerEnabled').checked = s.topBanner.enabled;
        document.getElementById('settingTopBannerText').value = s.topBanner.text || '';
    }

    document.getElementById('settingHotline').value = s.hotline || '545654254245';
    document.getElementById('settingStoreName').value = s.storeName || 'Kh_DTS Fashion Store';

    if (s.bank) {
        document.getElementById('settingBankId').value = s.bank.bankId || 'MB';
        document.getElementById('settingBankAccNo').value = s.bank.accountNumber || '';
        document.getElementById('settingBankAccName').value = s.bank.accountName || '';
    }

    if (s.socialLinks) {
        document.getElementById('settingLinkTiktok').value = s.socialLinks.tiktok || '';
        document.getElementById('settingLinkShopee').value = s.socialLinks.shopee || '';
        document.getElementById('settingLinkFacebook').value = s.socialLinks.facebook || '';
        document.getElementById('settingLinkZalo').value = s.socialLinks.zalo || '';
    }
}

function saveStoreSettings(e) {
    e.preventDefault();

    const bank = {
        bankId: document.getElementById('settingBankId').value,
        bankName: document.getElementById('settingBankId').options[document.getElementById('settingBankId').selectedIndex].text,
        accountNumber: document.getElementById('settingBankAccNo').value.trim(),
        accountName: document.getElementById('settingBankAccName').value.trim().toUpperCase()
    };

    const newSettings = {
        storeName: document.getElementById('settingStoreName').value.trim(),
        hotline: document.getElementById('settingHotline').value.trim(),
        bank,
        topBanner: {
            enabled: document.getElementById('settingTopBannerEnabled').checked,
            text: document.getElementById('settingTopBannerText').value.trim()
        },
        socialLinks: {
            tiktok: document.getElementById('settingLinkTiktok').value.trim(),
            shopee: document.getElementById('settingLinkShopee').value.trim(),
            facebook: document.getElementById('settingLinkFacebook').value.trim(),
            zalo: document.getElementById('settingLinkZalo').value.trim()
        }
    };

    StoreService.updateSettings(newSettings);
    adminData = StoreService.loadData();
    showToast('Đã lưu thông tin cửa hàng & tài khoản VietQR!');
}

// 6. HERO BANNER & LOOKBOOK
function fillHeroBanner() {
    const s = adminData.settings;
    if (!s || !s.hero) return;

    document.getElementById('settingHeroBadge').value = s.hero.badge || '';
    document.getElementById('settingHeroBg').value = s.hero.bgImage || '';
    document.getElementById('settingHeroTitle1').value = s.hero.titleLine1 || '';
    document.getElementById('settingHeroTitle2').value = s.hero.titleLine2 || '';
    document.getElementById('settingHeroDesc').value = s.hero.description || '';
}

function saveHeroBanner() {
    const hero = {
        badge: document.getElementById('settingHeroBadge').value.trim(),
        bgImage: document.getElementById('settingHeroBg').value.trim(),
        titleLine1: document.getElementById('settingHeroTitle1').value.trim(),
        titleLine2: document.getElementById('settingHeroTitle2').value.trim(),
        description: document.getElementById('settingHeroDesc').value.trim(),
        btnShopText: "MUA NGAY (SHOP NOW)",
        btnStoreText: "GHÉ STORE HẢI HẬU"
    };

    StoreService.updateSettings({ hero });
    adminData = StoreService.loadData();
    showToast('Đã cập nhật banner trang chủ!');
}

function renderAdminLookbook() {
    const grid = document.getElementById('adminLookbookGrid');
    if (!grid || !adminData.settings || !adminData.settings.lookbooks) return;

    const list = adminData.settings.lookbooks;
    grid.innerHTML = list.map((url, idx) => `
        <div class="bg-darker border border-bordercol p-2 rounded-lg space-y-2">
            <div class="aspect-square bg-card overflow-hidden rounded">
                <img id="lookbook-preview-${idx}" src="${url}" alt="Lookbook ${idx + 1}" class="w-full h-full object-cover">
            </div>
            <div class="text-[10px] text-gray-400 font-bold uppercase">Ảnh ${idx + 1}:</div>
            <input type="url" id="lookbook-input-${idx}" value="${url}" oninput="previewLookbookItem(${idx}, this.value)" class="w-full bg-card border border-bordercol px-2 py-1 text-[10px] text-white rounded focus:border-white focus:outline-none">
        </div>
    `).join('');
}

function previewLookbookItem(index, val) {
    const img = document.getElementById(`lookbook-preview-${index}`);
    if (img && val.trim().startsWith('http')) {
        img.src = val.trim();
    }
}

function saveLookbookPhotos() {
    const list = [];
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`lookbook-input-${i}`);
        if (input && input.value.trim()) {
            list.push(input.value.trim());
        }
    }
    StoreService.updateSettings({ lookbooks: list });
    adminData = StoreService.loadData();
    showToast('Đã lưu danh sách 6 ảnh Lookbook!');
}

// 7. SHOWROOM HẢI HẬU
function fillShowroomSettings() {
    const s = adminData.settings;
    if (!s) return;

    document.getElementById('settingStoreAddress').value = s.address || '';
    document.getElementById('settingStoreHours').value = s.openHours || '';
    if (s.storeVisual) {
        document.getElementById('settingStoreVisualTitle').value = s.storeVisual.title || '';
        document.getElementById('settingStoreVisualImg').value = s.storeVisual.image || '';
    }
}

function saveShowroomSettings() {
    const s = adminData.settings || {};
    const newSettings = {
        address: document.getElementById('settingStoreAddress').value.trim(),
        openHours: document.getElementById('settingStoreHours').value.trim(),
        storeVisual: {
            image: document.getElementById('settingStoreVisualImg').value.trim(),
            badge: "FLAGSHIP STORE",
            title: document.getElementById('settingStoreVisualTitle').value.trim(),
            subtitle: "Không gian mua sắm streetwear dành riêng cho giới trẻ Nam Định"
        }
    };
    StoreService.updateSettings(newSettings);
    adminData = StoreService.loadData();
    showToast('Đã cập nhật thông tin Showroom Hải Hậu!');
}

// 8. SỔ LOG TƯƠNG TÁC CHỐT ĐƠN
function renderAdminLeads() {
    const tbody = document.getElementById('adminLeadsTableBody');
    if (!tbody) return;

    const leads = StoreService.getLeads();
    updateBadges();

    if (leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10 text-gray-500">
                    <i class="fa-solid fa-bell-slash text-2xl mb-2 block"></i>
                    Chưa có lượt bấm chốt đơn nào được ghi nhận.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = leads.map(lead => {
        let channelBadge = '<span class="px-2 py-0.5 rounded bg-gray-500/10 text-gray-300 font-bold">' + lead.type + '</span>';
        if (lead.platform === 'shopee') {
            channelBadge = '<span class="px-2 py-0.5 rounded bg-red-500/20 text-[#FF5722] font-bold"><i class="fa-solid fa-bag-shopping mr-1"></i>Shopee</span>';
        } else if (lead.platform === 'tiktok') {
            channelBadge = '<span class="px-2 py-0.5 rounded bg-neutral-800 text-white font-bold"><i class="fa-brands fa-tiktok mr-1"></i>TikTok Shop</span>';
        } else if (lead.platform === 'VietQR') {
            channelBadge = '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold"><i class="fa-solid fa-qrcode mr-1"></i>VietQR</span>';
        } else if (lead.platform === 'COD') {
            channelBadge = '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">COD</span>';
        }

        return `
            <tr class="hover:bg-white/[0.02]">
                <td class="py-3 px-4 text-gray-400 whitespace-nowrap">${lead.timestamp}</td>
                <td class="py-3 px-4">${channelBadge}</td>
                <td class="py-3 px-4 font-bold text-white">${lead.productName || '-'}</td>
                <td class="py-3 px-4 text-gray-300 font-medium">${lead.size || '-'}</td>
                <td class="py-3 px-4 text-emerald-400 font-bold">${lead.price ? formatVND(lead.price) : '-'}</td>
            </tr>
        `;
    }).join('');
}

function clearAdminLeads() {
    if (confirm('Bạn có chắc muốn xóa sạch toàn bộ lịch sử chốt đơn không?')) {
        StoreService.clearLeads();
        renderAdminLeads();
        showToast('Đã xóa sạch lịch sử chốt đơn.');
    }
}

// 9. SAO LƯU & PHỤC HỒI
function exportBackupData() {
    StoreService.exportBackupJSON();
    showToast('Đã tải xuống tệp sao lưu JSON!');
}

function importBackupData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        const success = StoreService.importBackupJSON(evt.target.result);
        if (success) {
            adminData = StoreService.loadData();
            initAdmin();
            showToast('Đã phục hồi dữ liệu từ file sao lưu thành công!');
        } else {
            alert('File sao lưu không hợp lệ. Vui lòng kiểm tra lại!');
        }
    };
    reader.readAsText(file);
}

function resetDefaultData() {
    if (confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ sản phẩm và cài đặt về mẫu ban đầu của Kh_DTS. Bạn có chắc không?')) {
        StoreService.resetToDefault();
        adminData = StoreService.loadData();
        initAdmin();
        showToast('Đã khôi phục dữ liệu gốc ban đầu!');
    }
}

// 9. QUẢN LÝ BÀI VIẾT & CẨM NANG BLOG (CMS)
function renderAdminArticles() {
    const tbody = document.getElementById('adminArticlesTableBody');
    if (!tbody) return;

    const articles = StoreService.getArticles();
    updateBadges();

    if (articles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-10 text-gray-500">
                    Chưa có bài viết nào. Bấm "Thêm Bài Viết Mới" để tạo bài viết đầu tiên!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = articles.map(art => {
        const catLabel = art.category === 'mix-match' ? 'Mix & Match' : art.category === 'tips' ? 'Cẩm Nang' : 'Xu Hướng';
        const relatedSummary = (art.relatedProductIds || []).map(pid => {
            const p = (adminData.products || []).find(item => item.id === Number(pid));
            return p ? `<span class="inline-block bg-darker border border-bordercol px-1.5 py-0.5 rounded text-[10px] text-gray-300">#${p.id} ${p.name.slice(0, 16)}...</span>` : '';
        }).join(' ');

        return `
            <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="py-3 px-4">
                    <img src="${art.image}" alt="${art.title}" class="w-14 h-10 object-cover rounded border border-bordercol">
                </td>
                <td class="py-3 px-4 max-w-xs">
                    <strong class="text-white block line-clamp-1">${art.title}</strong>
                    <span class="text-gray-400 text-[11px] line-clamp-1">${art.excerpt}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">${catLabel}</span>
                </td>
                <td class="py-3 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                    ${art.date}<br><small class="text-gray-500">${art.readTime || '4 phút đọc'}</small>
                </td>
                <td class="py-3 px-4 max-w-xs">
                    <div class="flex flex-wrap gap-1">${relatedSummary || '<span class="text-gray-500 italic">Chưa gắn</span>'}</div>
                </td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="openArticleModal(${art.id})" class="p-1.5 text-xs bg-darker hover:bg-white hover:text-black border border-bordercol rounded text-gray-300 transition-colors" title="Chỉnh sửa bài viết">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="deleteAdminArticle(${art.id})" class="p-1.5 text-xs bg-darker hover:bg-rose-500 hover:text-white border border-bordercol rounded text-gray-400 hover:border-rose-500 transition-colors" title="Xóa bài viết">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openArticleModal(articleId = null) {
    const modal = document.getElementById('articleModal');
    const title = document.getElementById('articleModalTitle');
    const idInput = document.getElementById('formArticleId');
    const titleInput = document.getElementById('formArticleTitle');
    const catSelect = document.getElementById('formArticleCategory');
    const readTimeInput = document.getElementById('formArticleReadTime');
    const imgInput = document.getElementById('formArticleImage');
    const excerptInput = document.getElementById('formArticleExcerpt');
    const contentInput = document.getElementById('formArticleContent');
    const relInput = document.getElementById('formArticleRelatedProducts');

    if (!modal) return;

    if (articleId) {
        const art = StoreService.getArticleById(articleId);
        if (!art) return;
        if (title) title.textContent = 'CHỈNH SỬA BÀI VIẾT BLOG';
        if (idInput) idInput.value = art.id;
        if (titleInput) titleInput.value = art.title;
        if (catSelect) catSelect.value = art.category || 'mix-match';
        if (readTimeInput) readTimeInput.value = art.readTime || '4 phút đọc';
        if (imgInput) imgInput.value = art.image || '';
        if (excerptInput) excerptInput.value = art.excerpt || '';
        if (contentInput) contentInput.value = art.content || '';
        if (relInput) relInput.value = (art.relatedProductIds || []).join(', ');
    } else {
        if (title) title.textContent = 'SOẠN THẢO BÀI VIẾT BLOG MỚI';
        if (idInput) idInput.value = '';
        if (titleInput) titleInput.value = '';
        if (catSelect) catSelect.value = 'mix-match';
        if (readTimeInput) readTimeInput.value = '4 phút đọc';
        if (imgInput) imgInput.value = 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80';
        if (excerptInput) excerptInput.value = '';
        if (contentInput) contentInput.value = '<p class="mb-4">Nội dung bài viết chia sẻ phong cách thời trang Streetwear...</p>';
        if (relInput) relInput.value = '1, 2';
    }

    modal.classList.remove('hidden');
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (modal) modal.classList.add('hidden');
}

function saveArticleForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('formArticleId')?.value;
    const title = document.getElementById('formArticleTitle')?.value;
    const category = document.getElementById('formArticleCategory')?.value;
    const readTime = document.getElementById('formArticleReadTime')?.value;
    const image = document.getElementById('formArticleImage')?.value;
    const excerpt = document.getElementById('formArticleExcerpt')?.value;
    const content = document.getElementById('formArticleContent')?.value;
    const relStr = document.getElementById('formArticleRelatedProducts')?.value || '';

    const relatedProductIds = relStr.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
    const categoryName = category === 'mix-match' ? 'Mix & Match Phong Cách' : category === 'tips' ? 'Cẩm Nang & Bảo Quản' : 'Xu Hướng 2026';

    const payload = {
        title,
        category,
        categoryName,
        readTime,
        image,
        excerpt,
        content,
        relatedProductIds
    };

    if (id) {
        payload.id = Number(id);
    }

    StoreService.saveArticle(payload);
    closeArticleModal();
    renderAdminArticles();
    showToast('Đã lưu bài viết blog thành công!', 'success');
}

function deleteAdminArticle(id) {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        StoreService.deleteArticle(id);
        renderAdminArticles();
        showToast('Đã xóa bài viết!', 'info');
    }
}

function formatVND(val) {
    if (!val && val !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ');
}

function escapeQuote(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
}

function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    const icon = type === 'info' ? 'fa-info-circle text-blue-400' : 'fa-check text-emerald-400';
    toast.className = 'fixed bottom-6 right-6 bg-dark border border-gray-700 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 animate-fade-in';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2800);
}
