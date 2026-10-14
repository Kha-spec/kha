// data.js - Dữ liệu mặc định và Dịch vụ quản lý dữ liệu (Store Service) cho Kh_DTS
(function (global) {
    const STORAGE_KEY = 'kh_dts_store_v2';
    const LEADS_KEY = 'kh_dts_leads_v2';
    const ORDERS_KEY = 'kh_dts_orders_v2';

    // Dữ liệu cấu hình, ngân hàng, sản phẩm & voucher mặc định
    const defaultData = {
        settings: {
            storeName: "Kh_DTS Fashion Store",
            tagline: "Be Yourself | Hải Hậu, Nam Định",
            logoUrl: "assets/logo.png",
            hotline: "545654254245",
            address: "Thị trấn Yên Định, huyện Hải Hậu, tỉnh Nam Định",
            openHours: "08:30 – 22:00 (Mở cửa tất cả các ngày trong tuần)",
            topBanner: {
                enabled: true,
                text: "FREESHIP TOÀN QUỐC TỪ 2 SẢN PHẨM • GHÉ THỬ ĐỒ TRỰC TIẾP TẠI TT. YÊN ĐỊNH, HẢI HẬU"
            },
            // Cài đặt ngân hàng phục vụ thanh toán VietQR động
            bank: {
                bankId: "MB",
                bankName: "MBBank (Ngân hàng Quân Đội)",
                accountNumber: "0389999999",
                accountName: "NGUYEN VAN KHA"
            },
            shippingFees: {
                haihau: 15000,   // Giao hỏa tốc 2h quanh Yên Định - Hải Hậu
                nationwide: 25000, // Giao tiêu chuẩn toàn quốc
                freeThreshold: 2  // Miễn phí vận chuyển từ 2 sản phẩm trở lên
            },
            socialLinks: {
                tiktok: "https://tiktok.com",
                shopee: "https://shopee.vn",
                facebook: "https://facebook.com",
                zalo: "https://zalo.me/545654254245"
            },
            hero: {
                badge: "NEW SEASON COLLECTION 2026",
                titleLine1: "STREETWEAR.",
                titleLine2: "BE YOURSELF.",
                description: "Tuyển tập Áo thun Oversize, Hoodie nỉ bông cao cấp & Phụ kiện chuẩn gu Gen Z. Form dáng phóng khoáng, chất vải dày dặn, giá chỉ từ 150k - 250k cho giới trẻ Nam Định.",
                bgImage: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1920&q=80",
                btnShopText: "MUA NGAY (SHOP NOW)",
                btnStoreText: "GHÉ STORE HẢI HẬU"
            },
            promos: [
                {
                    id: 1,
                    tag: "SPECIAL PROMO",
                    title: "MUA COMBO TIẾT KIỆM",
                    desc: "Giảm thêm 30k khi mua combo Áo Thun + Nón hoặc Hoodie + Áo Thun.",
                    btnText: "KHÁM PHÁ NGAY →",
                    action: "filter:all"
                },
                {
                    id: 2,
                    tag: "FAST DELIVERY",
                    title: "SHIP HẢI HẬU 2H",
                    desc: "Giao hàng hỏa tốc trong ngày các xã quanh TT. Yên Định, Hải Hậu.",
                    btnText: "GỌI SHIP NGAY: 545654254245 →",
                    action: "tel"
                },
                {
                    id: 3,
                    tag: "TIKTOK & SHOPEE",
                    title: "SĂN VOUCHER LIVE",
                    desc: "Follow kênh TikTok của Kh_DTS để săn mã freeship và deal 1k mỗi tuần.",
                    btnText: "CHỌN KÊNH SĂN SALE →",
                    action: "platformModal"
                }
            ],
            lookbooks: [
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80"
            ],
            storeVisual: {
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
                badge: "FLAGSHIP STORE",
                title: "KH_DTS YÊN ĐỊNH",
                subtitle: "Không gian mua sắm streetwear dành riêng cho giới trẻ Nam Định"
            }
        },
        categories: [
            {
                id: "tshirt",
                name: "ÁO THUN OVERSIZE",
                sub: "T-Shirts • Washed Tee • 150k - 190k",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "hoodie",
                name: "HOODIE & NỈ BÔNG",
                sub: "Zip Hoodie • Pullover • 210k - 250k",
                image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
            },
            {
                id: "accessory",
                name: "PHỤ KIỆN STREET",
                sub: "Mũ lưỡi trai • Túi chéo • 150k - 190k",
                image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"
            }
        ],
        vouchers: [
            {
                code: "KHDTS10",
                type: "fixed",
                value: 10000,
                minOrder: 150000,
                desc: "Giảm 10.000đ cho đơn hàng từ 150k"
            },
            {
                code: "FREESHIP",
                type: "shipping",
                value: 25000,
                minOrder: 200000,
                desc: "Miễn phí vận chuyển toàn quốc cho đơn từ 200k"
            },
            {
                code: "HAIHAU2H",
                type: "shipping",
                value: 15000,
                minOrder: 0,
                desc: "Freeship Hỏa Tốc nội huyện Hải Hậu"
            }
        ],
        products: [
            {
                id: 1,
                name: "Áo Thun Kh_DTS Oversize 'Cyber Vibe' Washed Tee",
                category: "tshirt",
                price: 189000,
                originalPrice: 240000,
                tag: "BEST SELLER",
                image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 6, "L": 12, "XL": 4 },
                selectedSize: "L",
                modelInfo: "Mẫu nam 1m74 - 63kg mặc Size L chuẩn form Oversize phủ mông nhẹ",
                measurements: {
                    form: "Oversize Dropped Shoulder",
                    table: [
                        { size: "M", length: "70cm", chest: "110cm", shoulder: "52cm" },
                        { size: "L", length: "73cm", chest: "116cm", shoulder: "54cm" },
                        { size: "XL", length: "76cm", chest: "122cm", shoulder: "56cm" }
                    ]
                },
                desc: "Cotton 100% 2 chiều định lượng 250gsm, hiệu ứng wash acid cá tính, in lụa cao cấp không bong tróc.",
                inStock: true
            },
            {
                id: 2,
                name: "Hoodie Nỉ Bông Kh_DTS 'Be Yourself' Boxy Fit",
                category: "hoodie",
                price: 249000,
                originalPrice: 320000,
                tag: "HOT DROP",
                image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 4, "L": 8, "XL": 2 },
                selectedSize: "L",
                modelInfo: "Mẫu nam 1m72 - 60kg mặc Size L phồng đẹp chuẩn Boxy",
                measurements: {
                    form: "Boxy Fit tay phồng",
                    table: [
                        { size: "M", length: "68cm", chest: "118cm", shoulder: "56cm" },
                        { size: "L", length: "71cm", chest: "124cm", shoulder: "58cm" },
                        { size: "XL", length: "74cm", chest: "130cm", shoulder: "60cm" }
                    ]
                },
                desc: "Chất nỉ bông chân cua dày dặn giữ ấm tốt, form boxy tôn dáng cho các bạn nam trẻ trung.",
                inStock: true
            },
            {
                id: 3,
                name: "Áo Thun Graphic 'Nam Định Youth' Heavyweight",
                category: "tshirt",
                price: 169000,
                originalPrice: 220000,
                tag: "NEW",
                image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 8, "L": 14, "XL": 6 },
                selectedSize: "M",
                modelInfo: "Mẫu nam 1m68 - 56kg mặc Size M vừa vặn năng động",
                measurements: {
                    form: "Oversize Street",
                    table: [
                        { size: "M", length: "69cm", chest: "108cm", shoulder: "50cm" },
                        { size: "L", length: "72cm", chest: "114cm", shoulder: "52cm" },
                        { size: "XL", length: "75cm", chest: "120cm", shoulder: "54cm" }
                    ]
                },
                desc: "Họa tiết đồ họa mang âm hưởng đường phố, cổ áo bo dệt kim 3cm chống dão sau nhiều lần giặt.",
                inStock: true
            },
            {
                id: 4,
                name: "Zip Hoodie Kh_DTS 2 Chiều Blackout Streetwear",
                category: "hoodie",
                price: 239000,
                originalPrice: 290000,
                tag: "TRENDING",
                image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 3, "L": 7, "XL": 5 },
                selectedSize: "XL",
                modelInfo: "Mẫu nam 1m78 - 72kg mặc Size XL cực chất",
                measurements: {
                    form: "Relaxed Zip Fit 2 chiều",
                    table: [
                        { size: "M", length: "70cm", chest: "116cm", shoulder: "54cm" },
                        { size: "L", length: "73cm", chest: "122cm", shoulder: "56cm" },
                        { size: "XL", length: "76cm", chest: "128cm", shoulder: "58cm" }
                    ]
                },
                desc: "Dây khóa kéo kim loại 2 chiều tiện lợi tạo kiểu, mũ áo may 2 lớp to phồng cực ngầu.",
                inStock: true
            },
            {
                id: 5,
                name: "Mũ Lưỡi Trai Kh_DTS Star Metallic Tactical Cap",
                category: "accessory",
                price: 159000,
                originalPrice: 199000,
                tag: "MUST HAVE",
                image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["Freesize"],
                inventory: { "Freesize": 25 },
                selectedSize: "Freesize",
                modelInfo: "Khóa kim loại phía sau tùy chỉnh vòng đầu từ 54cm - 60cm",
                desc: "Form nón cứng cáp, vải kaki cotton wash nhẹ, khóa sau kim loại dập nổi logo sắc nét.",
                inStock: true
            },
            {
                id: 6,
                name: "Áo Thun Basic Trơn Kh_DTS Drop Shoulder",
                category: "tshirt",
                price: 150000,
                originalPrice: 180000,
                tag: "BASIC",
                image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 12, "L": 18, "XL": 10 },
                selectedSize: "L",
                modelInfo: "Mẫu nam 1m70 - 61kg mặc Size L",
                desc: "Tone màu trung tính dễ phối đồ đi học, đi chơi hoặc mặc layer cùng áo khoác ngoài.",
                inStock: true
            },
            {
                id: 7,
                name: "Túi Đeo Chéo Mini Crossbody Streetwear Bag",
                category: "accessory",
                price: 179000,
                originalPrice: 230000,
                tag: "HOT",
                image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["Freesize"],
                inventory: { "Freesize": 15 },
                selectedSize: "Freesize",
                modelInfo: "Kích thước: 22cm x 16cm x 6cm",
                desc: "Vải Canvas chống trầy xước và kháng nước nhẹ, đựng vừa điện thoại, ví tiền và phụ kiện nhỏ.",
                inStock: true
            },
            {
                id: 8,
                name: "Hoodie Kh_DTS Raw Cut Vintage Wash",
                category: "hoodie",
                price: 245000,
                originalPrice: 310000,
                tag: "LIMITED",
                image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
                ],
                sizes: ["M", "L", "XL"],
                inventory: { "M": 2, "L": 5, "XL": 3 },
                selectedSize: "L",
                modelInfo: "Mẫu nam 1m75 - 66kg mặc Size L",
                desc: "Thiết kế gấu áo raw cut cá tính, màu wash loang tự nhiên độc bản không đụng hàng.",
                inStock: true
            }
        ]
    };

    // Service thao tác dữ liệu
    const StoreService = {
        // Tải toàn bộ dữ liệu
        loadData() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return {
                        settings: { ...defaultData.settings, ...(parsed.settings || {}) },
                        categories: parsed.categories || defaultData.categories,
                        vouchers: parsed.vouchers || defaultData.vouchers,
                        products: parsed.products || defaultData.products
                    };
                }
            } catch (e) {
                console.error("Lỗi khi đọc dữ liệu LocalStorage:", e);
            }
            this.saveData(defaultData);
            return defaultData;
        },

        // Lưu toàn bộ dữ liệu
        saveData(data) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error("Lỗi khi lưu dữ liệu LocalStorage:", e);
                return false;
            }
        },

        // Cập nhật cài đặt cửa hàng
        updateSettings(newSettings) {
            const data = this.loadData();
            data.settings = { ...data.settings, ...newSettings };
            this.saveData(data);
            return data.settings;
        },

        // Lấy danh sách sản phẩm
        getProducts() {
            return this.loadData().products;
        },

        // Lấy 1 sản phẩm theo ID
        getProductById(id) {
            const products = this.getProducts();
            return products.find(p => p.id === Number(id)) || null;
        },

        // Thêm sản phẩm mới
        addProduct(product) {
            const data = this.loadData();
            const newId = data.products.length > 0 
                ? Math.max(...data.products.map(p => p.id)) + 1 
                : 1;

            const inventory = product.inventory || {};
            // Nếu chưa có inventory cụ thể, khởi tạo theo sizes
            if (product.sizes && product.sizes.length > 0) {
                product.sizes.forEach(s => {
                    if (inventory[s] === undefined) inventory[s] = 10;
                });
            }

            const newProduct = {
                id: newId,
                inStock: true,
                inventory: inventory,
                selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'L',
                gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
                ...product
            };
            data.products.unshift(newProduct);
            this.saveData(data);
            return newProduct;
        },

        // Sửa sản phẩm
        updateProduct(id, updatedFields) {
            const data = this.loadData();
            const index = data.products.findIndex(p => p.id === Number(id));
            if (index !== -1) {
                data.products[index] = { ...data.products[index], ...updatedFields };
                this.saveData(data);
                return data.products[index];
            }
            return null;
        },

        // Xóa sản phẩm
        deleteProduct(id) {
            const data = this.loadData();
            data.products = data.products.filter(p => p.id !== Number(id));
            this.saveData(data);
            return true;
        },

        // Đổi trạng thái Ẩn/Hiện sản phẩm
        toggleProductStock(id) {
            const data = this.loadData();
            const p = data.products.find(p => p.id === Number(id));
            if (p) {
                p.inStock = !p.inStock;
                this.saveData(data);
                return p.inStock;
            }
            return false;
        },

        // Trừ tồn kho khi đơn hàng được tạo thành công
        deductInventory(items) {
            const data = this.loadData();
            items.forEach(item => {
                const p = data.products.find(prod => prod.id === item.id);
                if (p && p.inventory && p.inventory[item.size]) {
                    p.inventory[item.size] = Math.max(0, p.inventory[item.size] - item.quantity);
                }
            });
            this.saveData(data);
        },

        // --- QUẢN LÝ ĐƠN HÀNG (Order Management System) ---
        getOrders() {
            try {
                const stored = localStorage.getItem(ORDERS_KEY);
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error("Lỗi khi đọc đơn hàng:", e);
            }
            return [];
        },

        saveOrders(orders) {
            try {
                localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
                return true;
            } catch (e) {
                console.error("Lỗi khi lưu đơn hàng:", e);
                return false;
            }
        },

        addOrder(orderInput) {
            const orders = this.getOrders();
            const now = new Date();
            const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
            const randomNum = Math.floor(100 + Math.random() * 900);
            const orderCode = `DTS-${dateStr}-${randomNum}`;

            const newOrder = {
                id: Date.now(),
                code: orderCode,
                status: 'pending', // pending | confirmed | shipping | completed | cancelled
                paymentStatus: orderInput.paymentMethod === 'vietqr' ? 'paid' : 'pending',
                createdAt: now.toLocaleString('vi-VN'),
                ...orderInput
            };

            orders.unshift(newOrder);
            this.saveOrders(orders);

            // Tự động trừ tồn kho
            if (orderInput.items && orderInput.items.length > 0) {
                this.deductInventory(orderInput.items);
            }

            return newOrder;
        },

        updateOrderStatus(orderId, newStatus) {
            const orders = this.getOrders();
            const order = orders.find(o => o.id === Number(orderId));
            if (order) {
                order.status = newStatus;
                if (newStatus === 'completed') {
                    order.paymentStatus = 'paid';
                }
                this.saveOrders(orders);
                return order;
            }
            return null;
        },

        deleteOrder(orderId) {
            let orders = this.getOrders();
            orders = orders.filter(o => o.id !== Number(orderId));
            this.saveOrders(orders);
            return true;
        },

        // --- QUẢN LÝ VOUCHER KHUYẾN MÃI ---
        getVouchers() {
            return this.loadData().vouchers || [];
        },

        applyVoucher(code, subtotal, shippingFee = 0) {
            const vouchers = this.getVouchers();
            const v = vouchers.find(item => item.code.toUpperCase() === code.trim().toUpperCase());
            if (!v) {
                return { valid: false, message: "Mã giảm giá không tồn tại!" };
            }
            if (v.minOrder && subtotal < v.minOrder) {
                return { 
                    valid: false, 
                    message: `Mã ${v.code} chỉ áp dụng cho đơn từ ${new Intl.NumberFormat('vi-VN').format(v.minOrder)}đ!` 
                };
            }

            let discountAmount = 0;
            if (v.type === 'shipping') {
                discountAmount = Math.min(v.value, shippingFee);
            } else if (v.type === 'percent') {
                discountAmount = Math.round((subtotal * v.value) / 100);
            } else {
                discountAmount = Math.min(v.value, subtotal);
            }

            return {
                valid: true,
                voucher: v,
                discount: discountAmount,
                message: `Đã áp dụng mã ${v.code}: Giảm ${new Intl.NumberFormat('vi-VN').format(discountAmount)}đ`
            };
        },

        addVoucher(voucher) {
            const data = this.loadData();
            data.vouchers = data.vouchers || [];
            data.vouchers.push(voucher);
            this.saveData(data);
            return voucher;
        },

        deleteVoucher(code) {
            const data = this.loadData();
            data.vouchers = (data.vouchers || []).filter(v => v.code !== code);
            this.saveData(data);
            return true;
        },

        // Khôi phục dữ liệu gốc mẫu
        resetToDefault() {
            this.saveData(defaultData);
            return defaultData;
        },

        // Xuất file JSON sao lưu
        exportBackupJSON() {
            const data = this.loadData();
            const orders = this.getOrders();
            const backupPayload = {
                store: data,
                orders: orders,
                exportedAt: new Date().toISOString()
            };
            const jsonStr = JSON.stringify(backupPayload, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Kh_DTS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },

        // Nhập file JSON sao lưu
        importBackupJSON(jsonString) {
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed.store && parsed.store.settings && parsed.store.products) {
                    this.saveData(parsed.store);
                    if (parsed.orders) {
                        this.saveOrders(parsed.orders);
                    }
                    return true;
                } else if (parsed.settings && parsed.products) {
                    this.saveData(parsed);
                    return true;
                }
            } catch (e) {
                console.error("File JSON không hợp lệ:", e);
            }
            return false;
        },

        // Ghi nhận lead / tương tác chốt đơn
        recordLead(leadInfo) {
            try {
                const leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
                leads.unshift({
                    id: Date.now(),
                    timestamp: new Date().toLocaleString('vi-VN'),
                    ...leadInfo
                });
                localStorage.setItem(LEADS_KEY, JSON.stringify(leads.slice(0, 200)));
            } catch (e) {
                console.error("Lỗi khi ghi nhận Lead:", e);
            }
        },

        getLeads() {
            try {
                return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
            } catch (e) {
                return [];
            }
        },

        clearLeads() {
            localStorage.removeItem(LEADS_KEY);
        }
    };

    global.StoreService = StoreService;
    global.defaultStoreData = defaultData;
})(window);
