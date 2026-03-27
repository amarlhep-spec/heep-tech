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
        name: 'Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ Ø¬Ù„Ø§ÙƒØ³ÙŠ S23',
        description: 'Ù‡Ø§ØªÙ Ø°ÙƒÙŠ Ø¨Ø´Ø§Ø´Ø© 6.1 Ø¨ÙˆØµØ©ØŒ ÙƒØ§Ù…ÙŠØ±Ø§ Ø±Ø¦ÙŠØ³ÙŠØ© 50 Ù…ÙŠØ¬Ø§Ø¨ÙƒØ³Ù„ØŒ Ø°Ø§ÙƒØ±Ø© 256GBØŒ Ø¨Ø·Ø§Ø±ÙŠØ© 3900 Ù…Ù„ÙŠ Ø£Ù…Ø¨ÙŠØ±',
        price: 899.99,
        category: 'phones',
        subcategory: 'Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬',
        images: ['images/products/phone1.jpg'],
        stock: 15,
        featured: true,
        specialOffer: true
    },
    {
        id: 'phone-2',
        name: 'Ø¢ÙŠÙÙˆÙ† 14 Ø¨Ø±Ùˆ',
        description: 'Ù‡Ø§ØªÙ Ø¢ÙŠÙÙˆÙ† Ø¨Ø´Ø§Ø´Ø© 6.1 Ø¨ÙˆØµØ©ØŒ Ù…Ø¹Ø§Ù„Ø¬ A16 Ø¨Ø§ÙŠÙˆÙ†ÙŠÙƒØŒ ÙƒØ§Ù…ÙŠØ±Ø§ Ø«Ù„Ø§Ø«ÙŠØ© 48+12+12 Ù…ÙŠØ¬Ø§Ø¨ÙƒØ³Ù„',
        price: 1099.99,
        category: 'phones',
        subcategory: 'Ø¢ÙŠÙÙˆÙ†',
        images: ['images/products/phone2.jpg'],
        stock: 8,
        featured: true,
        specialOffer: false
    },
    {
        id: 'phone-3',
        name: 'Ø´Ø§ÙˆÙ…ÙŠ Ø±ÙŠØ¯Ù…ÙŠ Ù†ÙˆØª 12',
        description: 'Ù‡Ø§ØªÙ Ø°ÙƒÙŠ Ø¨Ø´Ø§Ø´Ø© 6.67 Ø¨ÙˆØµØ© AMOLEDØŒ ÙƒØ§Ù…ÙŠØ±Ø§ 108 Ù…ÙŠØ¬Ø§Ø¨ÙƒØ³Ù„ØŒ Ø¨Ø·Ø§Ø±ÙŠØ© 5000 Ù…Ù„ÙŠ Ø£Ù…Ø¨ÙŠØ±',
        price: 299.99,
        category: 'phones',
        subcategory: 'Ø´Ø§ÙˆÙ…ÙŠ',
        images: ['images/products/phone3.jpg'],
        stock: 25,
        featured: false,
        specialOffer: true
    },
    {
        id: 'accessory-1',
        name: 'Ø³Ù…Ø§Ø¹Ø§Øª Ø¨Ù„ÙˆØªÙˆØ« Ù„Ø§Ø³Ù„ÙƒÙŠØ©',
        description: 'Ø³Ù…Ø§Ø¹Ø§Øª Ù„Ø§Ø³Ù„ÙƒÙŠØ© Ø¹Ø§Ù„ÙŠØ© Ø§Ù„Ø¬ÙˆØ¯Ø© Ù…Ø¹ ØªÙ‚Ù†ÙŠØ© Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø¶ÙˆØ¶Ø§Ø¡ØŒ Ø¨Ø·Ø§Ø±ÙŠØ© ØªØ¹Ù…Ù„ 30 Ø³Ø§Ø¹Ø©',
        price: 89.99,
        category: 'accessories',
        subcategory: 'Ø³Ù…Ø§Ø¹Ø§Øª',
        images: ['images/products/headphones.jpg'],
        stock: 40,
        featured: true,
        specialOffer: false
    },
    {
        id: 'accessory-2',
        name: 'Ø´Ø§Ø­Ù† Ø³Ø±ÙŠØ¹ 65 ÙˆØ§Ø·',
        description: 'Ø´Ø§Ø­Ù† Ø³Ø±ÙŠØ¹ Ù…ØªÙˆØ§ÙÙ‚ Ù…Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¬Ù‡Ø²Ø©ØŒ ÙƒØ§Ø¨Ù„ USB-C Ù…Ø¶Ù…Ù†',
        price: 34.99,
        category: 'accessories',
        subcategory: 'Ø´ÙˆØ§Ø­Ù†',
        images: ['images/products/charger.jpg'],
        stock: 50,
        featured: false,
        specialOffer: true
    },
    {
        id: 'accessory-3',
        name: 'Ø­Ø§ÙØ¸Ø© Ù‡ÙˆØ§ØªÙ Ù…Ù‚Ø§ÙˆÙ…Ø© Ù„Ù„ØµØ¯Ù…Ø§Øª',
        description: 'Ø­Ø§ÙØ¸Ø© Ø³ÙŠÙ„ÙŠÙƒÙˆÙ† Ø¹Ø§Ù„ÙŠØ© Ø§Ù„Ø¬ÙˆØ¯Ø© Ù…Ø¹ Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø´Ø§Ø´Ø© ÙˆØ§Ù„ÙƒØ§Ù…ÙŠØ±Ø§',
        price: 19.99,
        category: 'accessories',
        subcategory: 'Ø­Ø§ÙØ¸Ø§Øª',
        images: ['images/products/case.jpg'],
        stock: 100,
        featured: false,
        specialOffer: false
    },
    {
        id: 'used-1',
        name: 'Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬ Ø¬Ù„Ø§ÙƒØ³ÙŠ S20 (Ù…Ø³ØªØ¹Ù…Ù„)',
        description: 'Ù‡Ø§ØªÙ Ù…Ø³ØªØ¹Ù…Ù„ Ø¨Ø­Ø§Ù„Ø© Ù…Ù…ØªØ§Ø²Ø©ØŒ Ø´Ø§Ø´Ø© 6.2 Ø¨ÙˆØµØ©ØŒ ÙƒØ§Ù…ÙŠØ±Ø§ 64 Ù…ÙŠØ¬Ø§Ø¨ÙƒØ³Ù„',
        price: 349.99,
        category: 'used-phones',
        subcategory: 'Ø³Ø§Ù…Ø³ÙˆÙ†Ø¬',
        images: ['images/products/used1.jpg'],
        stock: 5,
        featured: false,
        specialOffer: false
    },
    {
        id: 'used-2',
        name: 'Ø¢ÙŠÙÙˆÙ† 11 (Ù…Ø³ØªØ¹Ù…Ù„)',
        description: 'Ù‡Ø§ØªÙ Ø¢ÙŠÙÙˆÙ† Ù…Ø³ØªØ¹Ù…Ù„ Ø¨Ø­Ø§Ù„Ø© Ø¬ÙŠØ¯Ø© Ø¬Ø¯Ø§ØŒ Ø¨Ø·Ø§Ø±ÙŠØ© 85%ØŒ Ø´Ø§Ø´Ø© 6.1 Ø¨ÙˆØµØ©',
        price: 449.99,
        category: 'used-phones',
        subcategory: 'Ø¢ÙŠÙÙˆÙ†',
        images: ['images/products/used2.jpg'],
        stock: 3,
        featured: true,
        specialOffer: true
    }
];

const DEFAULT_SETTINGS = {
    siteName: 'Ù…ØªØ¬Ø± Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª',
    logo: 'images/logo.png',
    mainImage: '',
    description: 'Ù†Ù‚Ø¯Ù… Ù„ÙƒÙ… Ø£Ø­Ø¯Ø« Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ© Ø¨Ø£ÙØ¶Ù„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø±.',
    whyChooseUs: 'Ù†Ù‚Ø¯Ù… Ù„Ùƒ Ù…Ù†ØªØ¬Ø§Øª Ø£ØµÙ„ÙŠØ© ÙˆØ£Ø³Ø¹Ø§Ø± Ù…Ù†Ø§ÙØ³Ø© ÙˆØ®Ø¯Ù…Ø© Ø³Ø±ÙŠØ¹Ø©.',
    footerText: 'Ù…ØªØ¬Ø± Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª - Ø£Ø­Ø¯Ø« Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© ÙˆØ§Ù„Ø¥ÙƒØ³Ø³ÙˆØ§Ø±Ø§Øª Ø¨Ø£ÙØ¶Ù„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø±.',
    shippingNote: 'Ø±Ø³ÙˆÙ… Ø§Ù„Ø´Ø­Ù† Ø¹Ù„Ù‰ Ø´Ø±ÙƒØ© Ø§Ù„Ø´Ø­Ù† ÙˆØªÙØ¯ÙØ¹ Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù….',
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
        address: 'Ø¯Ù…Ø´Ù‚ØŒ Ø³ÙˆØ±ÙŠØ§',
        hours: '9:00 ص - 6:00 م'
    },
    productCategories: {
        phones: { name: 'هواتف', subcategories: ['سامسونج', 'آيفون', 'شاومي', 'أخرى'] },
        accessories: { name: 'إكسسوارات', subcategories: ['بنوك طاقة', 'كابلات', 'أغطية', 'شواحن', 'سماعات', 'أخرى'] },
        'used-phones': { name: 'هواتف مستعملة', subcategories: ['آيفون', 'سامسونج', 'شاومي', 'أخرى'] }
    },
    accessorySettings: {
        types: [
            { value: 'headphones', label: 'سماعات', icon: 'fas fa-headphones' },
            { value: 'chargers', label: 'شواحن', icon: 'fas fa-charging-station' },
            { value: 'cases', label: 'أغطية', icon: 'fas fa-mobile-alt' },
            { value: 'cables', label: 'كابلات', icon: 'fas fa-usb' },
            { value: 'power-banks', label: 'بنوك طاقة', icon: 'fas fa-battery-full' },
            { value: 'others', label: 'أخرى', icon: 'fas fa-ellipsis-h' }
        ],
        compatibilityOptions: [
            { value: 'all', label: 'جميع الأجهزة' },
            { value: 'iphone', label: 'iPhone' },
            { value: 'samsung', label: 'Samsung' },
            { value: 'android', label: 'Android عام' },
            { value: 'universal', label: 'متعدد الاستخدام' }
        ],
        bundles: [
            {
                title: 'مجموعة المسافر',
                subtitle: 'كل ما تحتاجه للسفر والتنقل',
                currentPrice: '119.99',
                oldPrice: '139.97',
                savingsText: 'وفر .98',
                buttonText: 'إضافة المجموعة للسلة',
                items: [
                    { name: 'بنك طاقة 20000mAh', price: '.99', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' },
                    { name: 'شاحن سريع 65W', price: '.99', image: 'https://images.unsplash.com/photo-1599661046286-309c8b1c7b57?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' },
                    { name: 'سماعات لاسلكية', price: '.99', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }
                ]
            },
            {
                title: 'مجموعة المنزل',
                subtitle: 'إكسسوارات منزلية متكاملة',
                currentPrice: '49.99',
                oldPrice: '59.97',
                savingsText: 'وفر .98',
                buttonText: 'إضافة المجموعة للسلة',
                items: [
                    { name: 'محول USB متعدد', price: '.99', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' },
                    { name: 'مجموعة كابلات', price: '.99', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' },
                    { name: 'حامل هاتف', price: '.99', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }
                ]
            }
        ]
    },
    copyright: `Â© ${new Date().getFullYear()} Ù…ØªØ¬Ø± Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª. Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©.`
};

const DEFAULT_ADMIN_USERS = [];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeCategoryType(category, categoryType, condition) {
    const normalizedCategory = String(category || '').trim();
    const normalizedType = String(categoryType || condition || '').trim().toLowerCase();

    if (normalizedCategory === 'used-phones') {
        return normalizedType || 'used';
    }

    if (normalizedCategory === 'phones') {
        return normalizedType || 'new';
    }

    return normalizedType;
}

function normalizeCategory(category, categoryType, condition) {
    const normalizedCategory = String(category || 'products').trim();
    const normalizedType = normalizeCategoryType(normalizedCategory, categoryType, condition);

    if (normalizedCategory === 'phones' && ['used', 'refurbished'].includes(normalizedType)) {
        return 'used-phones';
    }

    if (normalizedCategory === 'used-phones') {
        return 'used-phones';
    }

    return normalizedCategory;
}

function normalizeProductRecord(product, fallbackId, fallbackName) {
    const categoryType = normalizeCategoryType(product.category, product.categoryType, product.condition);
    const category = normalizeCategory(product.category, categoryType, product.condition);

    return {
        ...product,
        id: product.id || fallbackId || `product-${Date.now()}`,
        name: product.name || fallbackName || 'منتج جديد',
        description: product.description || '',
        price: Number(product.price) || 0,
        oldPrice: product.oldPrice != null && product.oldPrice !== '' ? Number(product.oldPrice) : null,
        category,
        subcategory: product.subcategory || '',
        categoryType,
        type: product.type || '',
        compatibility: product.compatibility || '',
        condition: product.condition || '',
        images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
        stock: Number(product.stock) || 0,
        featured: Boolean(product.featured),
        specialOffer: Boolean(product.specialOffer || product.special),
        special: Boolean(product.specialOffer || product.special)
    };
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

        this.products = products.map((product, index) =>
            normalizeProductRecord(product, `product-imported-${Date.now()}-${index}`, 'منتج بدون اسم')
        );

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
        const settings = this.getSiteSettings();
        const categories = JSON.parse(JSON.stringify((settings && settings.productCategories) || DEFAULT_SETTINGS.productCategories));

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

    getProductCategoriesConfig() {
        const settings = this.getSiteSettings();
        return JSON.parse(JSON.stringify((settings && settings.productCategories) || DEFAULT_SETTINGS.productCategories));
    },

    getAccessorySettings() {
        const settings = this.getSiteSettings();
        return JSON.parse(JSON.stringify((settings && settings.accessorySettings) || DEFAULT_SETTINGS.accessorySettings));
    },

    addProduct(product) {
        const normalized = normalizeProductRecord(product, `product-${Date.now()}`, 'منتج جديد');

        this.products.push(normalized);
        return this.saveProducts();
    },

    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex((product) => product.id === id);
        if (index === -1) {
            return false;
        }

        let merged = {
            ...this.products[index],
            ...updatedProduct
        };

        merged = normalizeProductRecord(merged, this.products[index].id, this.products[index].name);

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
                    name: item.name || 'Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
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
                    name: item.name || (item.product && item.product.name) || 'Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
                    price: Number(item.price != null ? item.price : (item.product && item.product.price)) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: item.image || (item.product && item.product.image) || '',
                    product: item.product || null
                }))
                : [];

            return {
                ...order,
                id: order.id || `order-imported-${Date.now()}-${index}`,
                customerName: order.customerName || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
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
                    name: item.name || itemProduct.name || 'Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
                    price: Number(item.price != null ? item.price : itemProduct.price) || 0,
                    quantity: Number(item.quantity) || 1,
                    image: item.image || itemProduct.image || (itemProduct.images && itemProduct.images[0]) || '',
                    product: {
                        ...itemProduct,
                        name: item.name || itemProduct.name || 'Ù…Ù†ØªØ¬ ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ',
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
            },
            productCategories: {
                ...(current.productCategories || DEFAULT_SETTINGS.productCategories),
                ...((partialSettings && partialSettings.productCategories) || {})
            },
            accessorySettings: {
                ...(current.accessorySettings || DEFAULT_SETTINGS.accessorySettings),
                ...((partialSettings && partialSettings.accessorySettings) || {})
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

        this.products = this.readJson(DB_KEYS.products, DEFAULT_PRODUCTS).map((product, index) =>
            normalizeProductRecord(product, product.id || `product-init-${index}`, product.name || 'منتج')
        );
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
