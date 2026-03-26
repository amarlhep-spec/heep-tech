const DB_KEYS = {
    products: 'store_products',
    orders: 'store_orders',
    cart: 'cartItems',
    settings: 'site_settings',
    messages: 'contactMessages',
    adminUser: 'admin_user',
    adminLoggedIn: 'admin_logged_in'
};

const DEFAULT_PRODUCTS = [
    {
        id: 'phone-1',
        name: 'سامسونج جلاكسي S23',
        description: 'هاتف ذكي بشاشة 6.1 بوصة، كاميرا رئيسية 50 ميجابكسل، ذاكرة 256GB، بطارية 3900 ملي أمبير',
        price: 899.99,
        category: 'phones',
        subcategory: 'سامسونج',
        images: ['images/products/phone1.jpg'],
        stock: 15,
        featured: true,
        specialOffer: true
    },
    {
        id: 'phone-2',
        name: 'آيفون 14 برو',
        description: 'هاتف آيفون بشاشة 6.1 بوصة، معالج A16 بايونيك، كاميرا ثلاثية 48+12+12 ميجابكسل',
        price: 1099.99,
        category: 'phones',
        subcategory: 'آيفون',
        images: ['images/products/phone2.jpg'],
        stock: 8,
        featured: true,
        specialOffer: false
    },
    {
        id: 'phone-3',
        name: 'شاومي ريدمي نوت 12',
        description: 'هاتف ذكي بشاشة 6.67 بوصة AMOLED، كاميرا 108 ميجابكسل، بطارية 5000 ملي أمبير',
        price: 299.99,
        category: 'phones',
        subcategory: 'شاومي',
        images: ['images/products/phone3.jpg'],
        stock: 25,
        featured: false,
        specialOffer: true
    },
    {
        id: 'accessory-1',
        name: 'سماعات بلوتوث لاسلكية',
        description: 'سماعات لاسلكية عالية الجودة مع تقنية إلغاء الضوضاء، بطارية تعمل 30 ساعة',
        price: 89.99,
        category: 'accessories',
        subcategory: 'سماعات',
        images: ['images/products/headphones.jpg'],
        stock: 40,
        featured: true,
        specialOffer: false
    },
    {
        id: 'accessory-2',
        name: 'شاحن سريع 65 واط',
        description: 'شاحن سريع متوافق مع جميع الأجهزة، كابل USB-C مضمن',
        price: 34.99,
        category: 'accessories',
        subcategory: 'شواحن',
        images: ['images/products/charger.jpg'],
        stock: 50,
        featured: false,
        specialOffer: true
    },
    {
        id: 'accessory-3',
        name: 'حافظة هواتف مقاومة للصدمات',
        description: 'حافظة سيليكون عالية الجودة مع حماية الشاشة والكاميرا',
        price: 19.99,
        category: 'accessories',
        subcategory: 'حافظات',
        images: ['images/products/case.jpg'],
        stock: 100,
        featured: false,
        specialOffer: false
    },
    {
        id: 'used-1',
        name: 'سامسونج جلاكسي S20 (مستعمل)',
        description: 'هاتف مستعمل بحالة ممتازة، شاشة 6.2 بوصة، كاميرا 64 ميجابكسل',
        price: 349.99,
        category: 'used-phones',
        subcategory: 'سامسونج',
        images: ['images/products/used1.jpg'],
        stock: 5,
        featured: false,
        specialOffer: false
    },
    {
        id: 'used-2',
        name: 'آيفون 11 (مستعمل)',
        description: 'هاتف آيفون مستعمل بحالة جيدة جدا، بطارية 85%، شاشة 6.1 بوصة',
        price: 449.99,
        category: 'used-phones',
        subcategory: 'آيفون',
        images: ['images/products/used2.jpg'],
        stock: 3,
        featured: true,
        specialOffer: true
    }
];

const DEFAULT_SETTINGS = {
    siteName: 'متجر الإلكترونيات',
    logo: 'images/logo.png',
    mainImage: '',
    description: 'نقدم لكم أحدث المنتجات التقنية بأفضل الأسعار.',
    whyChooseUs: 'نقدم لك منتجات أصلية وأسعار منافسة وخدمة سريعة.',
    footerText: 'متجر الإلكترونيات - أحدث الأجهزة والإكسسوارات بأفضل الأسعار.',
    shippingNote: 'رسوم الشحن على شركة الشحن وتُدفع عند الاستلام.',
    barcode: 'images/barcode.png',
    socialMedia: {
        facebook: '',
        instagram: '',
        whatsapp: '',
        telegram: ''
    },
    contactInfo: {
        phone: '+963 123 456 789',
        email: 'info@store.com',
        address: 'دمشق، سوريا'
    },
    copyright: `© ${new Date().getFullYear()} متجر الإلكترونيات. جميع الحقوق محفوظة.`
};

const DEFAULT_ADMIN_USERS = [];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

const db = {
    adminUsers: deepClone(DEFAULT_ADMIN_USERS),
    products: [],
    orders: [],
    messages: [],

    readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : deepClone(fallback);
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return deepClone(fallback);
        }
    },

    writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing ${key}:`, error);
            return false;
        }
    },

    saveProducts() {
        return this.writeJson(DB_KEYS.products, this.products);
    },

    importProducts(products) {
        if (!Array.isArray(products)) {
            return false;
        }

        this.products = products.map((product, index) => ({
            id: product.id || `product-imported-${Date.now()}-${index}`,
            name: product.name || 'منتج بدون اسم',
            description: product.description || '',
            price: Number(product.price) || 0,
            oldPrice: product.oldPrice != null && product.oldPrice !== '' ? Number(product.oldPrice) : null,
            category: product.category || 'products',
            subcategory: product.subcategory || '',
            categoryType: product.categoryType || '',
            images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
            stock: Number(product.stock) || 0,
            featured: Boolean(product.featured),
            specialOffer: Boolean(product.specialOffer || product.special),
            special: Boolean(product.specialOffer || product.special)
        }));

        return this.saveProducts();
    },

    getProducts() {
        return this.products;
    },

    getAllProducts() {
        return this.products;
    },

    getProductById(id) {
        return this.products.find((product) => product.id === id) || null;
    },

    getProductsByCategory(category) {
        return this.products.filter((product) => product.category === category);
    },

    getProductsBySubcategory(category, subcategory) {
        return this.products.filter((product) => {
            return product.category === category && product.subcategory === subcategory;
        });
    },

    getSpecialOffers() {
        return this.products.filter((product) => product.specialOffer || product.special);
    },

    getFeaturedProducts() {
        return this.products.filter((product) => product.featured);
    },

    getCategories() {
        const categories = {
            phones: { name: 'هواتف', subcategories: [] },
            accessories: { name: 'إكسسوارات', subcategories: [] },
            'used-phones': { name: 'هواتف مستعملة', subcategories: [] }
        };

        this.products.forEach((product) => {
            if (!categories[product.category]) {
                categories[product.category] = { name: product.category, subcategories: [] };
            }

            if (product.subcategory && !categories[product.category].subcategories.includes(product.subcategory)) {
                categories[product.category].subcategories.push(product.subcategory);
            }
        });

        return categories;
    },

    addProduct(product) {
        const normalized = {
            id: product.id || `product-${Date.now()}`,
            name: product.name || 'منتج جديد',
            description: product.description || '',
            price: Number(product.price) || 0,
            oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
            category: product.category || 'products',
            subcategory: product.subcategory || '',
            categoryType: product.categoryType || '',
            images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
            stock: Number(product.stock) || 0,
            featured: Boolean(product.featured),
            specialOffer: Boolean(product.specialOffer || product.special),
            special: Boolean(product.specialOffer || product.special)
        };

        this.products.push(normalized);
        return this.saveProducts();
    },

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex((product) => product.id === id);
        if (index === -1) {
            return false;
        }

        const merged = {
            ...this.products[index],
            ...updatedProduct
        };

        if (merged.price != null) {
            merged.price = Number(merged.price) || 0;
        }

        if (merged.oldPrice === '') {
            merged.oldPrice = null;
        } else if (merged.oldPrice != null) {
            merged.oldPrice = Number(merged.oldPrice) || null;
        }

        if (!Array.isArray(merged.images)) {
            merged.images = [];
        }

        merged.specialOffer = Boolean(merged.specialOffer || merged.special);
        merged.special = merged.specialOffer;

        this.products[index] = merged;
        return this.saveProducts();
    },

    deleteProduct(id) {
        const initialLength = this.products.length;
        this.products = this.products.filter((product) => product.id !== id);
        if (this.products.length === initialLength) {
            return false;
        }
        return this.saveProducts();
    },

    getCartItems() {
        return this.readJson(DB_KEYS.cart, []);
    },

    getCart() {
        return this.getCartItems().map((item) => {
            const productId = item.productId || item.id;
            const product = this.getProductById(productId);

            return {
                ...item,
                productId,
                product: product || {
                    id: productId,
                    name: item.name || 'منتج غير معروف',
                    price: Number(item.price) || 0,
                    images: [item.image || 'images/placeholder.jpg'],
                    category: item.category || ''
                }
            };
        });
    },

    saveCart(cart) {
        return this.writeJson(DB_KEYS.cart, cart);
    },

    addToCart(productId, quantity = 1) {
        const product = this.getProductById(productId);
        if (!product) {
            return false;
        }

        const cart = this.getCartItems();
        const existingItem = cart.find((item) => (item.productId || item.id) === productId);

        if (existingItem) {
            existingItem.quantity = (Number(existingItem.quantity) || 0) + Number(quantity || 1);
        } else {
            cart.push({
                productId,
                id: productId,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.images && product.images[0] ? product.images[0] : 'images/placeholder.jpg',
                quantity: Number(quantity || 1),
                category: product.category
            });
        }

        const saved = this.saveCart(cart);
        if (saved) {
            this.updateCartCount();
        }
        return saved;
    },

    removeFromCart(productId) {
        const cart = this.getCartItems().filter((item) => (item.productId || item.id) !== productId);
        const saved = this.saveCart(cart);
        if (saved) {
            this.updateCartCount();
        }
        return saved;
    },

    updateCartItem(productId, newQuantity) {
        const quantity = Number(newQuantity);
        if (quantity < 1) {
            return this.removeFromCart(productId);
        }

        const cart = this.getCartItems();
        const item = cart.find((entry) => (entry.productId || entry.id) === productId);
        if (!item) {
            return false;
        }

        item.quantity = quantity;
        const saved = this.saveCart(cart);
        if (saved) {
            this.updateCartCount();
        }
        return saved;
    },

    clearCart() {
        const saved = this.saveCart([]);
        if (saved) {
            localStorage.removeItem('cart');
            localStorage.removeItem('checkoutCart');
            localStorage.removeItem('cartTotal');
            this.updateCartCount();
        }
        return saved;
    },

    updateCartCount() {
        const totalItems = this.getCartItems().reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0);
        }, 0);

        document.querySelectorAll('.cart-count').forEach((element) => {
            element.textContent = totalItems;
        });

        return totalItems;
    },

    getOrders() {
        this.orders = this.readJson(DB_KEYS.orders, []);
        return this.orders;
    },

    importOrders(orders) {
        if (!Array.isArray(orders)) {
            return false;
        }

        this.orders = orders.map((order, index) => {
            const normalizedItems = Array.isArray(order.items)
                ? order.items.map((item) => ({
                    productId: item.productId || item.id || '',
                    name: item.name || (item.product && item.product.name) || 'منتج غير معروف',
                    price: Number(item.price != null ? item.price : (item.product && item.product.price)) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: item.image || (item.product && item.product.image) || '',
                    product: item.product || null
                }))
                : [];

            return {
                ...order,
                id: order.id || `order-imported-${Date.now()}-${index}`,
                customerName: order.customerName || 'غير معروف',
                customerPhone: order.customerPhone || '',
                customerAddress: order.customerAddress || '',
                items: normalizedItems,
                total: Number(order.total) || 0,
                subtotal: Number(order.subtotal) || 0,
                status: order.status || 'pending',
                paymentMethod: order.paymentMethod || '',
                paymentProof: order.paymentProof || '',
                receiptFileName: order.receiptFileName || '',
                notes: order.notes || '',
                createdAt: order.createdAt || new Date().toISOString(),
                updatedAt: order.updatedAt || new Date().toISOString()
            };
        });

        return this.writeJson(DB_KEYS.orders, this.orders);
    },

    getOrderById(orderId) {
        return this.getOrders().find((order) => order.id === orderId) || null;
    },

    getOrdersByStatus(status) {
        return this.getOrders().filter((order) => order.status === status);
    },

    addOrder(order) {
        if (!order || !order.id || !order.customerName || !order.customerPhone) {
            return false;
        }

        const normalizedItems = Array.isArray(order.items)
            ? order.items.map((item) => {
                const itemProduct = item.product || {};
                return {
                    productId: item.productId || item.id || itemProduct.id || '',
                    name: item.name || itemProduct.name || 'منتج غير معروف',
                    price: Number(item.price != null ? item.price : itemProduct.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: item.image || itemProduct.image || (itemProduct.images && itemProduct.images[0]) || '',
                    product: {
                        ...itemProduct,
                        name: item.name || itemProduct.name || 'منتج غير معروف',
                        price: Number(item.price != null ? item.price : itemProduct.price) || 0
                    }
                };
            })
            : [];

        const orders = this.getOrders();
        orders.push({
            ...order,
            items: normalizedItems,
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString(),
            status: order.status || 'pending'
        });

        this.orders = orders;
        return this.writeJson(DB_KEYS.orders, orders);
    },

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const order = orders.find((entry) => entry.id === orderId);
        if (!order) {
            return false;
        }

        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        this.orders = orders;
        return this.writeJson(DB_KEYS.orders, orders);
    },

    deleteOrder(orderId) {
        const orders = this.getOrders().filter((order) => order.id !== orderId);
        this.orders = orders;
        return this.writeJson(DB_KEYS.orders, orders);
    },

    getContactMessages() {
        this.messages = this.readJson(DB_KEYS.messages, []);
        return this.messages;
    },

    saveContactMessages(messages) {
        this.messages = messages;
        return this.writeJson(DB_KEYS.messages, messages);
    },

    addContactMessage(message) {
        const messages = this.getContactMessages();
        messages.push({
            id: message.id || `msg-${Date.now()}`,
            name: message.name || '',
            email: message.email || '',
            phone: message.phone || '',
            subject: message.subject || '',
            message: message.message || '',
            status: message.status || 'unread',
            createdAt: message.createdAt || new Date().toISOString()
        });
        return this.saveContactMessages(messages);
    },

    updateMessageStatus(messageId, status) {
        const messages = this.getContactMessages();
        const message = messages.find((entry) => entry.id === messageId);
        if (!message) {
            return false;
        }

        message.status = status;
        return this.saveContactMessages(messages);
    },

    deleteMessage(messageId) {
        const messages = this.getContactMessages().filter((message) => message.id !== messageId);
        return this.saveContactMessages(messages);
    },

    getSiteSettings() {
        return this.readJson(DB_KEYS.settings, DEFAULT_SETTINGS);
    },

    saveSiteSettings(settings) {
        return this.writeJson(DB_KEYS.settings, settings);
    },

    updateSiteSettings(partialSettings) {
        const current = this.getSiteSettings();
        const merged = {
            ...current,
            ...partialSettings,
            socialMedia: {
                ...(current.socialMedia || {}),
                ...((partialSettings && partialSettings.socialMedia) || {})
            },
            contactInfo: {
                ...(current.contactInfo || {}),
                ...((partialSettings && partialSettings.contactInfo) || {})
            }
        };

        return this.saveSiteSettings(merged);
    },

    authenticateAdmin() {
        console.warn('Client-side admin authentication is disabled. Use the secure PHP login flow.');
        return null;
    },

    isAdminLoggedIn() {
        return (
            localStorage.getItem(DB_KEYS.adminLoggedIn) === 'true' ||
            sessionStorage.getItem(DB_KEYS.adminLoggedIn) === 'true' ||
            localStorage.getItem('adminLoggedIn') === 'true' ||
            sessionStorage.getItem('adminLoggedIn') === 'true'
        );
    },

    logoutAdmin() {
        localStorage.removeItem(DB_KEYS.adminLoggedIn);
        sessionStorage.removeItem(DB_KEYS.adminLoggedIn);
        localStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoggedIn');
        localStorage.removeItem(DB_KEYS.adminUser);
        sessionStorage.removeItem(DB_KEYS.adminUser);
        localStorage.removeItem('adminUsername');
        sessionStorage.removeItem('adminUsername');
        localStorage.removeItem('adminLoginTime');
        return true;
    },

    getCurrentAdmin() {
        try {
            const raw = localStorage.getItem(DB_KEYS.adminUser) || sessionStorage.getItem(DB_KEYS.adminUser);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error getting current admin:', error);
            return null;
        }
    },

    getStats() {
        const orders = this.getOrders();
        const products = this.getProducts();
        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

        return {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue,
            pendingOrders: orders.filter((order) => order.status === 'pending').length,
            completedOrders: orders.filter((order) => order.status === 'completed').length,
            lowStockProducts: products.filter((product) => (Number(product.stock) || 0) < 5).length
        };
    },

    init() {
        if (!localStorage.getItem(DB_KEYS.products)) {
            this.writeJson(DB_KEYS.products, DEFAULT_PRODUCTS);
        }

        if (!localStorage.getItem(DB_KEYS.settings)) {
            this.writeJson(DB_KEYS.settings, DEFAULT_SETTINGS);
        }

        if (!localStorage.getItem(DB_KEYS.orders)) {
            this.writeJson(DB_KEYS.orders, []);
        }

        if (!localStorage.getItem(DB_KEYS.messages)) {
            this.writeJson(DB_KEYS.messages, []);
        }

        if (!localStorage.getItem(DB_KEYS.cart)) {
            this.writeJson(DB_KEYS.cart, []);
        }

        this.products = this.readJson(DB_KEYS.products, DEFAULT_PRODUCTS).map((product) => ({
            ...product,
            featured: Boolean(product.featured),
            specialOffer: Boolean(product.specialOffer || product.special),
            special: Boolean(product.specialOffer || product.special)
        }));
        this.orders = this.readJson(DB_KEYS.orders, []);
        this.messages = this.readJson(DB_KEYS.messages, []);
        this.updateCartCount();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => db.init());
} else {
    db.init();
}

window.db = db;
