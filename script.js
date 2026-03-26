// ===== مكتبة الإشعارات =====

function showNotification(message, type = 'success') {
    // إزالة الإشعارات القديمة
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // إضافة الأنماط
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// ===== تحميل إعدادات الموقع =====

function loadSiteData() {
    const settings = db.getSiteSettings();
    
    if (!settings) return;
    
    // تحديث عنوان الموقع
    document.title = settings.siteName;
    
    // تحديث الشعار والاسم
    const logos = document.querySelectorAll('#site-logo, #footer-logo');
    logos.forEach(logo => {
        if (logo) logo.src = settings.logo;
    });
    
    const siteNameElements = document.querySelectorAll('#site-name');
    siteNameElements.forEach(element => {
        if (element) element.textContent = settings.siteName;
    });
    
    // تحديث الصورة الرئيسية
    const mainImage = document.getElementById('main-hero-image');
    if (mainImage) mainImage.src = settings.mainImage;
    
    // تحديث نص "لماذا تختارنا"
    const whyChooseText = document.getElementById('why-choose-text');
    if (whyChooseText) whyChooseText.textContent = settings.whyChooseUs;
    
    // تحديث نص الفوتر
    const footerText = document.getElementById('footer-text');
    if (footerText) footerText.textContent = settings.footerText;
    
    // تحديث وسائل التواصل الاجتماعي
    const socialLinks = document.getElementById('social-links');
    if (socialLinks && settings.socialMedia) {
        socialLinks.innerHTML = `
            ${settings.socialMedia.facebook ? `<a href="${settings.socialMedia.facebook}"><i class="fab fa-facebook"></i></a>` : ''}
            ${settings.socialMedia.instagram ? `<a href="${settings.socialMedia.instagram}"><i class="fab fa-instagram"></i></a>` : ''}
            ${settings.socialMedia.whatsapp ? `<a href="${settings.socialMedia.whatsapp}"><i class="fab fa-whatsapp"></i></a>` : ''}
            ${settings.socialMedia.telegram ? `<a href="${settings.socialMedia.telegram}"><i class="fab fa-telegram"></i></a>` : ''}
        `;
    }
    
    // تحديث معلومات الاتصال
    const contactInfo = document.getElementById('contact-info');
    if (contactInfo && settings.contactInfo) {
        contactInfo.innerHTML = `
            <p><i class="fas fa-phone"></i> <span id="contact-phone">${settings.contactInfo.phone}</span></p>
            <p><i class="fas fa-envelope"></i> <span id="contact-email">${settings.contactInfo.email}</span></p>
            <p><i class="fas fa-map-marker-alt"></i> <span id="contact-address">${settings.contactInfo.address}</span></p>
        `;
    }
    
    // تحديث حقوق النشر
    const copyrightText = document.getElementById('copyright-text');
    if (copyrightText) copyrightText.textContent = settings.copyright;
}

// ===== المنتجات المميزة =====

function loadProductsByCategory(category, subcategory = null) {
    const products = db.getProducts();
    let filteredProducts = products.filter(p => p.category === category);
    
    if (subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategory === subcategory);
    }
    
    // عرض المنتجات
    return filteredProducts;
}

// مثال لعرض إكسسوارات حسب التصنيف
function loadAccessories() {
    const categories = db.getCategories();
    const accessories = categories['accessories'];
    
    let html = '';
    
    accessories.subcategories.forEach(subcat => {
        const products = db.getProductsBySubcategory('accessories', subcat);
        
        if (products.length > 0) {
            html += `
                <div class="category-section">
                    <h3>${subcat}</h3>
                    <div class="products-grid">
                        ${products.map(product => `
                            <div class="product-card">
                                <img src="${product.images[0]}" alt="${product.name}">
                                <h4>${product.name}</h4>
                                <div class="price">${product.price} SP</div>
                                <button onclick="addToCart('${product.id}')">أضف للسلة</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    return html;
}

// ===== العروض الخاصة =====

function loadSpecialOffers() {
    const container = document.getElementById('special-offers');
    if (!container) return;
    
    const specialOffers = db.getSpecialOffers();
    
    if (specialOffers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>لا توجد عروض خاصة حالياً</h3>
                <p>تابعنا للحصول على أحدث العروض</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = specialOffers.map(product => `
        <div class="offer-card">
            <div class="offer-badge">عرض خاص</div>
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="offer-content">
                <h3>${product.name}</h3>
                <p class="offer-description">${product.description.substring(0, 80)}...</p>
                <div class="offer-price-section">
                    <span class="offer-price">${product.price.toLocaleString()} SP</span>
                    ${product.oldPrice ? `<span class="offer-old-price">${product.oldPrice.toLocaleString()} SP</span>` : ''}
                </div>
                <div class="offer-actions">
                    <button class="btn" onclick="viewProduct('${product.id}')">اطلب الآن</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadFeaturedProducts() {
    if (window.db && typeof db.getFeaturedProducts === 'function') {
        return db.getFeaturedProducts();
    }

    const products = window.db && typeof db.getProducts === 'function' ? db.getProducts() : [];
    return products.filter(product => product.featured);
}

// ===== وظائف المنتجات =====

function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

function addToCart(productId, quantity = 1) {
    if (db.addToCart(productId, quantity)) {
        showNotification('تمت إضافة المنتج إلى السلة', 'success');
        
        // تحديث عدد السلة في الواجهة
        db.updateCartCount();
    } else {
        showNotification('حدث خطأ في إضافة المنتج', 'error');
    }
}

// ===== نظام الشرائح للمنتج =====

class ProductSlider {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.currentIndex = 0;
        
        if (this.container && this.images.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.container.innerHTML = `
            <div class="slider-container">
                <div class="main-slider">
                    <img src="${this.images[0]}" alt="صورة المنتج" id="main-slide-image">
                    ${this.images.length > 1 ? `
                        <button class="slider-btn prev" onclick="window.currentSlider.prev()">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="slider-btn next" onclick="window.currentSlider.next()">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    ` : ''}
                </div>
                ${this.images.length > 1 ? `
                    <div class="slider-thumbnails">
                        ${this.images.map((img, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="window.currentSlider.goTo(${index})">
                                <img src="${img}" alt="صورة ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // تعيين المربع العام للتحكم
        window.currentSlider = this;
    }
    
    goTo(index) {
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;
        
        this.currentIndex = index;
        this.update();
    }
    
    next() {
        this.goTo(this.currentIndex + 1);
    }
    
    prev() {
        this.goTo(this.currentIndex - 1);
    }
    
    update() {
        const mainImage = document.getElementById('main-slide-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        if (mainImage) {
            mainImage.src = this.images[this.currentIndex];
        }
        
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }
}

// ===== نظام المودال =====

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// ===== تهيئة عامة =====

document.addEventListener('DOMContentLoaded', function() {
    // تحميل إعدادات الموقع
    loadSiteData();
    
    // تحديث عدد السلة
    db.updateCartCount();
    
    // إعداد القائمة المتحركة للأجهزة المحمولة
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    
    
    // إغلاق المودال عند النقر خارجها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
});

// ===== تصدير الوظائف =====

window.loadSiteData = loadSiteData;
window.loadFeaturedProducts = loadFeaturedProducts;
window.loadSpecialOffers = loadSpecialOffers;
window.viewProduct = viewProduct;
window.addToCart = addToCart;
window.openModal = openModal;
window.closeModal = closeModal;
// تحديث إحصائيات لوحة التحكم
function updateDashboardStats() {
    try {
        const products = db.getProducts();
        const orders = db.getOrders();
        const messages = db.getContactMessages();
        
        // إحصاءات المنتجات
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const specialOffers = products.filter(p => p.special).length;
        
        // إحصاءات الطلبات
        const totalOrders = orders.length;
        
        // تحديث الواجهة
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('featured-products').textContent = featuredProducts;
        document.getElementById('special-offers').textContent = specialOffers;
        
        // تحديث عدد الرسائل غير المقروءة في لوحة التحكم
        const unreadMessages = messages.filter(m => m.status === 'unread').length;
        const messagesTab = document.querySelector('a[href="#messages"]');
        if (messagesTab && unreadMessages > 0) {
            let badge = messagesTab.querySelector('.message-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge badge-danger message-badge';
                badge.style.position = 'absolute';
                badge.style.left = '20px';
                badge.style.top = '10px';
                messagesTab.style.position = 'relative';
                messagesTab.appendChild(badge);
            }
            badge.textContent = unreadMessages;
            badge.style.display = 'inline-block';
        }
        
    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}
// ===== إصلاح نهائي للقائمة على الجوال =====

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        // إنشاء الطبقة السوداء الخلفية
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        
        // حدث فتح/إغلاق القائمة
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('show');
            overlay.classList.toggle('show');
        });
        
        // إغلاق القائمة عند النقر على الطبقة السوداء
        overlay.addEventListener('click', function() {
            navMenu.classList.remove('show');
            overlay.classList.remove('show');
        });
        
        // إغلاق القائمة عند النقر على رابط
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
                overlay.classList.remove('show');
            });
        });
        
        // إغلاق القائمة عند التمرير
        window.addEventListener('scroll', function() {
            navMenu.classList.remove('show');
            overlay.classList.remove('show');
        });
    }
    
    // إصلاح تأثيرات التمرير
    window.addEventListener('scroll', function() {
        const elements = document.querySelectorAll('.animate-in');
        
        elements.forEach(element => {
            const position = element.getBoundingClientRect();
            
            if (position.top < window.innerHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    });
});
// دالة لإضافة منتج للسلة (تستخدم في كل صفحات المنتجات)
function addToCartFromPage(productId, quantity = 1) {
    console.log('🛒 محاولة إضافة منتج للسلة:', productId, 'الكمية:', quantity);
    
    // الحصول على معلومات المنتج
    let product = null;
    if (window.db && window.db.getProductById) {
        product = window.db.getProductById(productId);
    }
    
    if (!product) {
        console.error('❌ المنتج غير موجود:', productId);
        showNotification('المنتج غير موجود', 'error');
        return false;
    }
    
    console.log('📦 معلومات المنتج:', product);
    
    // جلب السلة الحالية
    let cart = [];
    try {
        const cartData = localStorage.getItem('cartItems');
        if (cartData) {
            cart = JSON.parse(cartData);
        }
    } catch (e) {
        console.error('❌ خطأ في قراءة السلة:', e);
        cart = [];
    }
    
    // التحقق إذا كان المنتج موجوداً بالفعل
    const existingItemIndex = cart.findIndex(item => 
        item.productId == productId || (item.id && item.id == productId)
    );
    
    if (existingItemIndex !== -1) {
        // تحديث الكمية إذا كان المنتج موجوداً
        cart[existingItemIndex].quantity += quantity;
        console.log('✅ تم تحديث الكمية للمنتج الموجود');
    } else {
        // إضافة منتج جديد
        const cartItem = {
            productId: productId,
            id: productId, // احتياطي
            name: product.name,
            price: product.price,
            image: product.image || product.images?.[0] || '',
            quantity: quantity,
            category: product.category
        };
        
        cart.push(cartItem);
        console.log('✅ تم إضافة منتج جديد للسلة');
    }
    
    // حفظ السلة في localStorage
    try {
        localStorage.setItem('cartItems', JSON.stringify(cart));
        console.log('💾 تم حفظ السلة:', cart);
        
        // تحديث العداد
        updateCartCounter();
        
        showNotification('تم إضافة المنتج إلى السلة', 'success');
        return true;
    } catch (e) {
        console.error('❌ خطأ في حفظ السلة:', e);
        showNotification('حدث خطأ في إضافة المنتج', 'error');
        return false;
    }
}

// دالة لتحديث عداد السلة
function updateCartCounter() {
    try {
        const cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // تحديث العداد في الهيدر
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
        
        console.log('🔄 تحديث العداد:', totalItems);
        return totalItems;
    } catch (e) {
        console.error('❌ خطأ في تحديث العداد:', e);
        return 0;
    }
}

// دالة لعرض الإشعارات
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; left: 20px; right: 20px; background: ${type === 'success' ? '#27ae60' : '#e74c3c'}; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 9999; display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// تحديث العداد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
});

// دوال فحص
function debugCart() {
    console.log('=== فحص السلة ===');
    
    // من localStorage
    try {
        const cartData = localStorage.getItem('cartItems');
        console.log('📦 من localStorage:', cartData);
        
        if (cartData) {
            const cart = JSON.parse(cartData);
            console.log('📋 محتويات السلة:', cart);
            console.log('🔢 عدد المنتجات:', cart.length);
            
            if (cart.length > 0) {
                console.log('📝 المنتجات:');
                cart.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.name || 'غير معروف'} - السعر: $${item.price || 0} - الكمية: ${item.quantity || 1}`);
                });
            }
        }
    } catch (e) {
        console.error('❌ خطأ في localStorage:', e);
    }
    
    // من db
    if (window.db) {
        if (window.db.getCartItems) {
            try {
                const cart = window.db.getCartItems();
                console.log('💾 من db.getCartItems():', cart);
            } catch (e) {
                console.error('❌ خطأ في db.getCartItems():', e);
            }
        }
        
        if (window.db.getCart) {
            try {
                const cart = window.db.getCart();
                console.log('💾 من db.getCart():', cart);
            } catch (e) {
                console.error('❌ خطأ في db.getCart():', e);
            }
        }
    }
    
    console.log('=== نهاية الفحص ===');
}

function clearCart() {
    if (confirm('هل تريد تفريغ السلة بالكامل؟')) {
        localStorage.setItem('cartItems', JSON.stringify([]));
        loadCart();
        showNotification('تم تفريغ السلة', 'success');
    }
}

function testAddProduct() {
    const testProduct = {
        productId: 'test-001',
        name: 'منتج تجريبي',
        price: 100,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
    };
    
    let cart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    cart.push(testProduct);
    localStorage.setItem('cartItems', JSON.stringify(cart));
    
    loadCart();
    showNotification('تم إضافة منتج تجريبي', 'success');
}
// script.js - تحديث قسم إضافة المنتجات للسلة

document.addEventListener('DOMContentLoaded', function() {
    // تحديث العداد عند التحميل
    if (window.db && window.db.updateCartCount) {
        db.updateCartCount();
    }
    
    // إعداد أزرار إضافة إلى السلة
    setupAddToCartButtons();
});

function setupAddToCartButtons() {
    // معالجة جميع أزرار "إضافة إلى السلة"
    document.querySelectorAll('[onclick*="addToCart"], .add-to-cart-btn, button[data-product-id]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let productId = null;
            
            // محاولة الحصول على معرف المنتج بطرق مختلفة
            if (this.dataset.productId) {
                productId = this.dataset.productId;
            } else if (this.closest('[data-product-id]')) {
                productId = this.closest('[data-product-id]').dataset.productId;
            } else if (this.id && this.id.startsWith('add-to-cart-')) {
                productId = this.id.replace('add-to-cart-', '');
            }
            
            if (productId) {
                console.log('🛒 إضافة منتج من الزر:', productId);
                addToCartFromPage(productId);
            } else {
                console.warn('⚠️ لا يمكن العثور على معرف المنتج');
                showNotification('حدث خطأ في إضافة المنتج', 'error');
            }
        });
    });
}

// مثال لزر إضافة إلى السلة في صفحات المنتجات
function createAddToCartButton(productId) {
    return `
        <button class="btn btn-primary add-to-cart-btn" 
                data-product-id="${productId}"
                onclick="addToCartFromPage('${productId}')">
            <i class="fas fa-cart-plus"></i> أضف إلى السلة
        </button>
    `;
}


window.debugCart = debugCart;
window.clearCart = clearCart;
window.testAddProduct = testAddProduct;

// جعل الدوال متاحة عالمياً
window.addToCartFromPage = addToCartFromPage;
window.updateCartCounter = updateCartCounter;
window.showNotification = showNotification;
