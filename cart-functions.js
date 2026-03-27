// cart-functions.js - دوال مساعدة للسلة
console.log('📦 تحميل دوال السلة المساعدة...');

// دالة إضافة منتج للسلة (من صفحة المنتجات)
function addToCartFromPage(productId, quantity = 1) {
    console.log('🛒 استدعاء addToCartFromPage للمنتج:', productId);
    
    if (!productId) {
        console.error('❌ معرف المنتج غير صالح');
        showNotification('خطأ في إضافة المنتج', 'error');
        return false;
    }
    
    // استخدام db.addToCart
    if (window.db && window.db.addToCart) {
        const result = db.addToCart(productId, quantity);
        
        if (result) {
            // سؤال المستخدم إذا كان يريد عرض السلة
            setTimeout(() => {
                const shouldShowCart = confirm('تم إضافة المنتج إلى السلة بنجاح!\nهل تريد الذهاب إلى صفحة السلة الآن؟');
                if (shouldShowCart) {
                    window.location.href = 'cart.html';
                }
            }, 500);
            
            return true;
        } else {
            showNotification('حدث خطأ في إضافة المنتج', 'error');
            return false;
        }
    } else {
        console.error('❌ دالة db.addToCart غير متوفرة');
        showNotification('خطأ في النظام، يرجى المحاولة لاحقاً', 'error');
        return false;
    }
}

// دالة فحص السلة (للتصحيح)
function debugCart() {
    console.log('=== فحص السلة ===');
    
    try {
        // فحص localStorage
        const cartData = localStorage.getItem('cartItems');
        console.log('📋 بيانات localStorage (cartItems):', cartData);
        
        // فحص قاعدة البيانات
        console.log('🔍 فحص db.getCartItems():');
        const dbCart = db.getCartItems();
        console.log('السلة من db:', dbCart);
        
        // فحص الطلبات
        console.log('📦 فحص الطلبات:');
        const orders = db.getOrders();
        console.log('الطلبات:', orders);
        
        // عرض النتائج للمستخدم
        let message = '=== فحص السلة ===\n\n';
        
        if (cartData) {
            const cart = JSON.parse(cartData);
            message += `عدد المنتجات في localStorage: ${cart.length}\n`;
            message += 'المنتجات:\n';
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name || 'غير معروف'} (${item.quantity}x)\n`;
            });
        } else {
            message += '❌ السلة فارغة في localStorage\n';
        }
        
        message += `\nعدد المنتجات من db: ${dbCart.length}\n`;
        message += `\nعدد الطلبات: ${orders.length}\n`;
        
        alert(message);
        
        // إذا كنا في صفحة السلة، أعد تحميلها
        if (window.location.pathname.includes('cart.html') && typeof loadCart === 'function') {
            console.log('🔄 إعادة تحميل السلة...');
            loadCart();
        }
    } catch (e) {
        console.error('❌ خطأ في فحص السلة:', e);
        alert('حدث خطأ في فحص السلة: ' + e.message);
    }
}

// دالة تنظيف السلة
function clearCart() {
    if (confirm('هل أنت متأكد من تفريغ السلة بالكامل؟')) {
        if (window.db && window.db.clearCart) {
            db.clearCart();
            showNotification('تم تفريغ السلة', 'success');
            
            // إعادة تحميل السلة إذا كنا في صفحتها
            if (window.location.pathname.includes('cart.html') && typeof loadCart === 'function') {
                loadCart();
            }
        } else {
            localStorage.setItem('cartItems', JSON.stringify([]));
            showNotification('تم تفريغ السلة', 'success');
        }
    }
}

// دالة اختبار إضافة منتج
function testAddProduct() {
    console.log('🧪 اختبار إضافة منتج...');
    
    // منتجات اختبارية
    const testProducts = [
        { id: 'test-phone-1', name: 'هاتف اختبار 1', price: 299.99, category: 'phones' },
        { id: 'test-accessory-1', name: 'إكسسوار اختبار 1', price: 49.99, category: 'accessories' },
        { id: 'test-used-1', name: 'هاتف مستعمل اختبار', price: 199.99, category: 'used-phones' }
    ];
    
    const randomProduct = testProducts[Math.floor(Math.random() * testProducts.length)];
    
    if (window.db && window.db.addToCart) {
        if (db.addToCart(randomProduct.id, 1)) {
            showNotification('تم إضافة منتج اختبار: ' + randomProduct.name, 'success');
        }
    } else {
        showNotification('خطأ: قاعدة البيانات غير متوفرة', 'error');
    }
}

// دالة عرض إشعارات
function showNotification(message, type = 'success') {
    // إزالة أي إشعارات سابقة
    document.querySelectorAll('.notification').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; left: 20px; right: 20px; background: ${type === 'success' ? '#27ae60' : '#e74c3c'}; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 9999; display: flex; align-items: center; gap: 10px; text-align: center;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span style="flex: 1;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// جعل الدوال متاحة عالمياً
window.addToCartFromPage = addToCartFromPage;
window.debugCart = debugCart;
window.clearCart = clearCart;
window.testAddProduct = testAddProduct;
window.showNotification = showNotification;

console.log('✅ تم تحميل دوال السلة المساعدة بنجاح');