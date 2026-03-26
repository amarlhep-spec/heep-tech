// slider.js - نظام عرض الشرائح للمنتجات
class ProductSlider {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        if (!this.container || this.images.length === 0) return;
        
        // إنشاء واجهة العرض
        this.container.innerHTML = `
            <div class="slider-container">
                <div class="main-slider">
                    <img id="main-slider-image" src="${this.images[0]}" alt="صورة المنتج">
                    <button class="slider-btn prev" onclick="slider.prev()">‹</button>
                    <button class="slider-btn next" onclick="slider.next()">›</button>
                </div>
                <div class="slider-thumbnails">
                    ${this.images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="slider.goTo(${index})">
                            <img src="${img}" alt="صورة مصغرة ${index + 1}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // تعيين المتغير العام
        window.slider = this;
    }
    
    goTo(index) {
        if (index < 0) index = this.images.length - 1;
        if (index >= this.images.length) index = 0;
        
        this.currentIndex = index;
        this.updateSlider();
    }
    
    next() {
        this.goTo(this.currentIndex + 1);
    }
    
    prev() {
        this.goTo(this.currentIndex - 1);
    }
    
    updateSlider() {
        const mainImage = document.getElementById('main-slider-image');
        const thumbnails = document.querySelectorAll('.thumbnail');
        
        if (mainImage) {
            mainImage.src = this.images[this.currentIndex];
        }
        
        thumbnails.forEach((thumb, index) => {
            if (index === this.currentIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
}

// استخدام المكون
function initProductSlider(productId) {
    const product = db.getProductById(productId);
    if (product && product.images && product.images.length > 0) {
        new ProductSlider('product-images', product.images);
    }
}

// استدعاء التلقائي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إذا كانت صفحة المنتج
    if (window.location.pathname.includes('product.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            setTimeout(() => initProductSlider(productId), 100);
        }
    }
});