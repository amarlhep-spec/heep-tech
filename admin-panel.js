// ===== إدارة لوحة التحكم - النسخة الكاملة المصححة =====

// ===== 1. تهيئة النظام =====
let currentUploads = {
    logo: { file: null, base64: null },
    mainImage: { file: null, base64: null },
    barcode: { file: null, base64: null }
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getPaymentProofHtml(order) {
    if (!order || !order.paymentProof) {
        return `
            <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
                <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
                <p style="margin: 0; color: #6c757d;">لا يوجد إشعار مرفوع لهذا الطلب.</p>
            </div>
        `;
    }

    const proofName = order.receiptFileName || 'receipt';
    const proofIsImage = typeof order.paymentProof === 'string' && order.paymentProof.startsWith('data:image/');

    return `
        <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
            <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
            <p style="margin-bottom: 12px;"><strong>اسم الملف:</strong> ${escapeHtml(proofName)}</p>
            ${proofIsImage ? `
                <div style="text-align: center;">
                    <img src="${order.paymentProof}" alt="إشعار الحوالة" style="max-width: 100%; max-height: 420px; border-radius: 10px; border: 1px solid #ddd;">
                </div>
            ` : `
                <a href="${order.paymentProof}" download="${escapeHtml(proofName)}" class="btn btn-info" style="display: inline-flex;">
                    <i class="fas fa-download"></i> تنزيل الإشعار
                </a>
            `}
        </div>
    `;
}

function triggerImportFile(type) {
    const input = document.getElementById(`import-${type}-file`);
    if (input) {
        input.value = '';
        input.click();
    }
}

function escapeCsvValue(value) {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
}

function buildCsvContent(rows) {
    return '\uFEFF' + rows.map(row => row.map(escapeCsvValue).join(',')).join('\r\n');
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let inQuotes = false;
    const normalized = String(text || '').replace(/^\uFEFF/, '');

    for (let i = 0; i < normalized.length; i += 1) {
        const char = normalized[i];
        const next = normalized[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                value += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            row.push(value);
            value = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') {
                i += 1;
            }
            row.push(value);
            if (row.some(cell => String(cell).trim() !== '')) {
                rows.push(row);
            }
            row = [];
            value = '';
            continue;
        }

        value += char;
    }

    row.push(value);
    if (row.some(cell => String(cell).trim() !== '')) {
        rows.push(row);
    }

    return rows;
}

function csvRowsToObjects(rows) {
    if (!rows.length) {
        return [];
    }

    const [header, ...dataRows] = rows;
    return dataRows.map(row => {
        const obj = {};
        header.forEach((key, index) => {
            obj[key] = row[index] ?? '';
        });
        return obj;
    });
}

function productsToCsvRows(products) {
    const header = ['id', 'name', 'description', 'price', 'oldPrice', 'category', 'subcategory', 'categoryType', 'stock', 'featured', 'specialOffer', 'images'];
    return [
        header,
        ...products.map(product => ([
            product.id || '',
            product.name || '',
            product.description || '',
            product.price || 0,
            product.oldPrice ?? '',
            product.category || '',
            product.subcategory || '',
            product.categoryType || '',
            product.stock || 0,
            product.featured ? 'true' : 'false',
            product.specialOffer ? 'true' : 'false',
            Array.isArray(product.images) ? product.images.join('|') : ''
        ]))
    ];
}

function ordersToCsvRows(orders) {
    const header = ['id', 'customerName', 'customerPhone', 'customerAddress', 'status', 'paymentMethod', 'receiptFileName', 'notes', 'subtotal', 'total', 'createdAt', 'updatedAt', 'items', 'paymentProof'];
    return [
        header,
        ...orders.map(order => ([
            order.id || '',
            order.customerName || '',
            order.customerPhone || '',
            order.customerAddress || '',
            order.status || '',
            order.paymentMethod || '',
            order.receiptFileName || '',
            order.notes || '',
            order.subtotal || 0,
            order.total || 0,
            order.createdAt || '',
            order.updatedAt || '',
            JSON.stringify(order.items || []),
            order.paymentProof || ''
        ]))
    ];
}

function normalizeImportedProducts(objects) {
    return objects.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price) || 0,
        oldPrice: product.oldPrice !== '' ? Number(product.oldPrice) || null : null,
        category: product.category,
        subcategory: product.subcategory,
        categoryType: product.categoryType,
        stock: Number(product.stock) || 0,
        featured: String(product.featured).toLowerCase() === 'true',
        specialOffer: String(product.specialOffer).toLowerCase() === 'true',
        images: product.images ? String(product.images).split('|').map(item => item.trim()).filter(Boolean) : []
    }));
}

function normalizeImportedOrders(objects) {
    return objects.map(order => {
        let items = [];
        try {
            items = order.items ? JSON.parse(order.items) : [];
        } catch (error) {
            items = [];
        }

        return {
            id: order.id,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerAddress: order.customerAddress,
            status: order.status,
            paymentMethod: order.paymentMethod,
            receiptFileName: order.receiptFileName,
            notes: order.notes,
            subtotal: Number(order.subtotal) || 0,
            total: Number(order.total) || 0,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items,
            paymentProof: order.paymentProof || ''
        };
    });
}

function exportData(type) {
    let rows = [];
    let fileName = '';

    if (type === 'products') {
        rows = productsToCsvRows(db.getProducts() || []);
        fileName = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (type === 'orders') {
        rows = ordersToCsvRows(db.getOrders() || []);
        fileName = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
        showNotification('نوع التصدير غير معروف', 'error');
        return;
    }

    const csvContent = buildCsvContent(rows);
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showNotification(`تم تصدير ${type === 'products' ? 'المنتجات' : 'الطلبات'} إلى ملف Excel بنجاح`, 'success');
}

function importDataFromFile(type, event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(loadEvent) {
        try {
            const rows = parseCsv(loadEvent.target.result);
            const objects = csvRowsToObjects(rows);
            if (!Array.isArray(objects) || objects.length === 0) {
                throw new Error('INVALID_FORMAT');
            }

            let success = false;
            if (type === 'products') {
                success = db.importProducts(normalizeImportedProducts(objects));
            } else if (type === 'orders') {
                success = db.importOrders(normalizeImportedOrders(objects));
            }

            if (!success) {
                throw new Error('IMPORT_FAILED');
            }

            showNotification(`تم استيراد ${type === 'products' ? 'المنتجات' : 'الطلبات'} من ملف Excel بنجاح`, 'success');

            if (type === 'products') {
                initProductsTab();
            } else {
                initOrdersTab();
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('فشل استيراد الملف. تأكد أن الملف CSV صالح ومطابق للأعمدة المطلوبة.', 'error');
        }

        event.target.value = '';
    };

    reader.readAsText(file, 'utf-8');
}

// أسماء المجلدات بالانجليزية
const UPLOAD_FOLDERS = {
    logo: 'settings',
    mainImage: 'banners', 
    barcode: 'payment_codes',
    products: 'products'
};

// ===== 2. دوال رفع الملفات =====

// معالجة رفع الشعار
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // التحقق من حجم الملف
    if (file.size > 5 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 5MB', 'error');
        return;
    }
    
    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showNotification('نوع الملف غير مدعوم. يرجى رفع صورة فقط', 'error');
        return;
    }
    
    // حفظ الملف
    currentUploads.logo = { file: file, base64: null };
    
    // عرض المعاينة
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('logo-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            currentUploads.logo.base64 = e.target.result;
            document.getElementById('site-logo').value = e.target.result;
        }
        
        // عرض معلومات الملف
        const fileInfo = document.getElementById('logo-file-info');
        const fileName = document.getElementById('logo-filename');
        if (fileInfo && fileName) {
            fileName.textContent = `الملف: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            fileInfo.style.display = 'block';
        }
        
        showNotification('تم تحميل الشعار بنجاح', 'success');
    };
    
    reader.readAsDataURL(file);
}

// إزالة شعار الموقع
function removeLogoFile() {
    currentUploads.logo = { file: null, base64: null };
    document.getElementById('logo-upload').value = '';
    document.getElementById('site-logo').value = '';
    document.getElementById('logo-preview').src = '';
    document.getElementById('logo-preview').style.display = 'none';
    document.getElementById('logo-file-info').style.display = 'none';
    document.getElementById('logo-external-url').value = '';
    showNotification('تم إزالة الشعار', 'info');
}

// معالجة رفع الصورة الرئيسية
function handleMainImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 5MB', 'error');
        return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showNotification('نوع الملف غير مدعوم', 'error');
        return;
    }
    
    currentUploads.mainImage = { file: file, base64: null };
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('main-image-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            currentUploads.mainImage.base64 = e.target.result;
            document.getElementById('main-image-url').value = e.target.result;
        }
        
        const fileInfo = document.getElementById('main-image-file-info');
        const fileName = document.getElementById('main-image-filename');
        if (fileInfo && fileName) {
            fileName.textContent = `الملف: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            fileInfo.style.display = 'block';
        }
        
        showNotification('تم تحميل الصورة الرئيسية بنجاح', 'success');
    };
    
    reader.readAsDataURL(file);
}

// إزالة الصورة الرئيسية
function removeMainImageFile() {
    currentUploads.mainImage = { file: null, base64: null };
    document.getElementById('main-image-file-input').value = '';
    document.getElementById('main-image-url').value = '';
    document.getElementById('main-image-preview').src = '';
    document.getElementById('main-image-preview').style.display = 'none';
    document.getElementById('main-image-file-info').style.display = 'none';
    document.getElementById('main-image-external-url').value = '';
    showNotification('تم إزالة الصورة الرئيسية', 'info');
}

// معالجة رفع الباركود
function handleBarcodeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('حجم الملف كبير جداً. الحد الأقصى 5MB', 'error');
        return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showNotification('نوع الملف غير مدعوم', 'error');
        return;
    }
    
    currentUploads.barcode = { file: file, base64: null };
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('barcode-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            currentUploads.barcode.base64 = e.target.result;
            document.getElementById('barcode-url').value = e.target.result;
        }
        
        const fileInfo = document.getElementById('barcode-file-info');
        const fileName = document.getElementById('barcode-filename');
        if (fileInfo && fileName) {
            fileName.textContent = `الملف: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            fileInfo.style.display = 'block';
        }
        
        showNotification('تم تحميل الباركود بنجاح', 'success');
    };
    
    reader.readAsDataURL(file);
}

// إزالة الباركود
function removeBarcodeFile() {
    currentUploads.barcode = { file: null, base64: null };
    document.getElementById('barcode-file-input').value = '';
    document.getElementById('barcode-url').value = '';
    document.getElementById('barcode-preview').src = '';
    document.getElementById('barcode-preview').style.display = 'none';
    document.getElementById('barcode-file-info').style.display = 'none';
    document.getElementById('barcode-external-url').value = '';
    showNotification('تم إزالة الباركود', 'info');
}

// ===== 3. دوال حفظ البيانات =====

// حفظ إعدادات الموقع
function saveSiteSettings() {
    console.log('بدء حفظ إعدادات الموقع...');
    
    const siteName = document.getElementById('site-name').value.trim();
    let logoData = '';
    
    // تحديد مصدر بيانات الشعار
    if (currentUploads.logo.base64) {
        logoData = currentUploads.logo.base64;
        console.log('استخدام الشعار المرفوع حديثاً');
    } else if (document.getElementById('logo-external-url').value) {
        logoData = document.getElementById('logo-external-url').value;
        console.log('استخدام الرابط الخارجي');
    } else if (document.getElementById('site-logo').value) {
        logoData = document.getElementById('site-logo').value;
        console.log('استخدام الشعار المخزن');
    }
    
    // التحقق من البيانات
    if (!siteName) {
        showNotification('يرجى إدخال اسم الموقع', 'error');
        return;
    }
    
    if (!logoData) {
        showNotification('يرجى رفع شعار للموقع', 'error');
        return;
    }
    
    // حفظ البيانات
    try {
        const success = db.updateSiteSettings({
            siteName: siteName,
            logo: logoData
        });
        
        if (success) {
            showNotification('✅ تم حفظ إعدادات الموقع بنجاح', 'success');
            
            // تحديث العرض
            setTimeout(() => {
                const logoImg = document.getElementById('dashboard-logo');
                const title = document.getElementById('dashboard-title');
                const mainTitle = document.getElementById('dashboard-title-main');
                
                if (logoImg) logoImg.src = logoData;
                if (title) title.textContent = siteName + ' - لوحة التحكم';
                if (mainTitle) mainTitle.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${siteName} - لوحة التحكم`;
            }, 500);
            
        } else {
            showNotification('❌ حدث خطأ في حفظ الإعدادات', 'error');
        }
        
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        showNotification('❌ حدث خطأ غير متوقع', 'error');
    }
}

// حفظ الصورة الرئيسية
function saveMainImage() {
    let imageData = '';
    
    if (currentUploads.mainImage.base64) {
        imageData = currentUploads.mainImage.base64;
    } else if (document.getElementById('main-image-external-url').value) {
        imageData = document.getElementById('main-image-external-url').value;
    } else if (document.getElementById('main-image-url').value) {
        imageData = document.getElementById('main-image-url').value;
    }
    
    if (!imageData) {
        showNotification('يرجى رفع صورة رئيسية', 'error');
        return;
    }
    
    const success = db.updateSiteSettings({ mainImage: imageData });
    
    if (success) {
        showNotification('✅ تم حفظ الصورة الرئيسية بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ الصورة', 'error');
    }
}

// حفظ الباركود
function saveBarcode() {
    let barcodeData = '';
    
    if (currentUploads.barcode.base64) {
        barcodeData = currentUploads.barcode.base64;
    } else if (document.getElementById('barcode-external-url').value) {
        barcodeData = document.getElementById('barcode-external-url').value;
    } else if (document.getElementById('barcode-url').value) {
        barcodeData = document.getElementById('barcode-url').value;
    }
    
    if (!barcodeData) {
        showNotification('يرجى رفع صورة الباركود', 'error');
        return;
    }
    
    const success = db.updateSiteSettings({ barcode: barcodeData });
    
    if (success) {
        showNotification('✅ تم حفظ الباركود بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ الباركود', 'error');
    }
}

// حفظ "لماذا تختارنا"
function saveWhyChooseText() {
    const text = document.getElementById('why-choose-text').value;
    
    if (!text) {
        showNotification('يرجى إدخال نص القسم', 'error');
        return;
    }
    
    const success = db.updateSiteSettings({ whyChooseUs: text });
    
    if (success) {
        showNotification('✅ تم حفظ النص بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ النص', 'error');
    }
}

// حفظ إعدادات الفوتر
function saveFooterSettings() {
    const text = document.getElementById('footer-text').value;
    const phone = document.getElementById('footer-contact-phone').value.trim();
    const email = document.getElementById('footer-contact-email').value.trim();
    const address = document.getElementById('footer-contact-address').value.trim();
    const hours = document.getElementById('footer-contact-hours').value.trim();
    
    if (!text) {
        showNotification('يرجى إدخال نص الفوتر', 'error');
        return;
    }
    
    const success = db.updateSiteSettings({
        footerText: text,
        contactInfo: { phone, email, address, hours }
    });
    
    if (success) {
        showNotification('✅ تم حفظ إعدادات الفوتر بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ الإعدادات', 'error');
    }
}

// حفظ وسائل التواصل
function saveSocialMedia() {
    const facebook = document.getElementById('social-facebook').value;
    const instagram = document.getElementById('social-instagram').value;
    
    const success = db.updateSiteSettings({
        socialMedia: { facebook, instagram }
    });
    
    if (success) {
        showNotification('✅ تم حفظ وسائل التواصل بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ وسائل التواصل', 'error');
    }
}

// حفظ ملاحظة الشحن
function saveShippingNote() {
    const note = document.getElementById('shipping-note').value;
    
    if (!note) {
        showNotification('يرجى إدخال ملاحظة الشحن', 'error');
        return;
    }
    
    const success = db.updateSiteSettings({ shippingNote: note });
    
    if (success) {
        showNotification('✅ تم حفظ ملاحظة الشحن بنجاح', 'success');
    } else {
        showNotification('❌ حدث خطأ في حفظ ملاحظة الشحن', 'error');
    }
}

// ===== 4. دوال التحميل =====

// تحميل إعدادات الموقع
function loadSiteSettings() {
    const settings = db.getSiteSettings();
    
    document.getElementById('site-name').value = settings.siteName || '';
    
    const logo = settings.logo || '';
    if (logo) {
        document.getElementById('site-logo').value = logo;
        const preview = document.getElementById('logo-preview');
        if (preview) {
            preview.src = logo;
            preview.style.display = 'block';
        }
    }
}

// تحميل الصورة الرئيسية
function loadMainImageSettings() {
    const settings = db.getSiteSettings();
    const mainImage = settings.mainImage || '';
    
    if (mainImage) {
        document.getElementById('main-image-url').value = mainImage;
        const preview = document.getElementById('main-image-preview');
        if (preview) {
            preview.src = mainImage;
            preview.style.display = 'block';
        }
    }
}

// تحميل الباركود
function loadBarcodeSettings() {
    const settings = db.getSiteSettings();
    const barcode = settings.barcode || '';
    
    if (barcode) {
        document.getElementById('barcode-url').value = barcode;
        const preview = document.getElementById('barcode-preview');
        if (preview) {
            preview.src = barcode;
            preview.style.display = 'block';
        }
    }
}

// تحميل "لماذا تختارنا"
function loadWhyChooseSettings() {
    const settings = db.getSiteSettings();
    document.getElementById('why-choose-text').value = settings.whyChooseUs || '';
}

// تحميل إعدادات الفوتر
function loadFooterSettings() {
    const settings = db.getSiteSettings();
    document.getElementById('footer-text').value = settings.footerText || '';
    document.getElementById('footer-contact-phone').value = (settings.contactInfo && settings.contactInfo.phone) || '';
    document.getElementById('footer-contact-email').value = (settings.contactInfo && settings.contactInfo.email) || '';
    document.getElementById('footer-contact-address').value = (settings.contactInfo && settings.contactInfo.address) || '';
    document.getElementById('footer-contact-hours').value = (settings.contactInfo && settings.contactInfo.hours) || '';
}

// تحميل وسائل التواصل
function loadSocialMediaSettings() {
    const settings = db.getSiteSettings();
    const social = settings.socialMedia || {};
    
    document.getElementById('social-facebook').value = social.facebook || '';
    document.getElementById('social-instagram').value = social.instagram || '';
}

// تحميل ملاحظة الشحن
function loadShippingSettings() {
    const settings = db.getSiteSettings();
    document.getElementById('shipping-note').value = settings.shippingNote || '';
}

// ===== 5. دوال التبويبات والإحصائيات =====

// التبديل بين التبويبات
function switchTab(tabId) {
    console.log('التبديل إلى تبويب:', tabId);
    
    // تحديث القائمة النشطة
    document.querySelectorAll('.dashboard-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`a[href="#${tabId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إظهار المحتوى المطلوب
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        
        // تحديث العنوان
        const titles = {
            'dashboard': 'لوحة التحكم',
            'settings': 'إعدادات الموقع',
            'main-image': 'الصورة الرئيسية',
            'barcode': 'باركود الدفع',
            'products': 'إدارة المنتجات',
            'orders': 'إدارة الطلبات',
            'messages': 'رسائل الاتصال',
            'why-choose': 'لماذا تختارنا',
            'footer': 'إعدادات الفوتر',
            'social': 'وسائل التواصل',
            'shipping': 'ملاحظة الشحن'
        };
        
        const titleElement = document.getElementById('dashboard-title-main');
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${titles[tabId] || 'لوحة التحكم'}`;
        }
        
        // تحميل بيانات التبويب
        loadTabData(tabId);
    }
}

// تحميل بيانات التبويب
function loadTabData(tabId) {
    console.log('تحميل بيانات تبويب:', tabId);
    
    setTimeout(() => {
        switch(tabId) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'settings':
                loadSiteSettings();
                break;
            case 'main-image':
                loadMainImageSettings();
                break;
            case 'barcode':
                loadBarcodeSettings();
                break;
            case 'why-choose':
                loadWhyChooseSettings();
                break;
            case 'footer':
                loadFooterSettings();
                break;
            case 'social':
                loadSocialMediaSettings();
                break;
            case 'shipping':
                loadShippingSettings();
                break;
            case 'products':
                initProductsTab();
                break;
            case 'orders':
                initOrdersTab();
                break;
            case 'messages':
                initMessagesTab();
                break;
        }
    }, 100);
}

// تحميل الإحصائيات
function loadDashboardStats() {
    console.log('تحميل الإحصائيات...');
    try {
        const products = db.getProducts() || [];
        const orders = db.getOrders() || [];
        const featured = products.filter(p => p.featured) || [];
        const special = products.filter(p => p.specialOffer) || [];
        
        console.log('إحصائيات:', { products: products.length, orders: orders.length });
        
        const totalProducts = document.getElementById('total-products');
        const totalOrders = document.getElementById('total-orders');
        const featuredProducts = document.getElementById('featured-products');
        const specialOffers = document.getElementById('special-offers');
        
        if (totalProducts) totalProducts.textContent = products.length;
        if (totalOrders) totalOrders.textContent = orders.length;
        if (featuredProducts) featuredProducts.textContent = featured.length;
        if (specialOffers) specialOffers.textContent = special.length;
        
        console.log('✅ تم تحميل الإحصائيات');
    } catch (error) {
        console.error('❌ خطأ في تحميل الإحصائيات:', error);
    }
}

function parseLinesTextarea(text) {
    return String(text || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function serializeLines(values) {
    return (Array.isArray(values) ? values : []).join('\n');
}

function serializeAccessoryTypes(types) {
    return (Array.isArray(types) ? types : [])
        .map(type => type.label || type.value || '')
        .join('\n');
}

function parseAccessoryTypes(text) {
    return parseLinesTextarea(text).map((line, index) => {
        const label = line || `نوع ${index + 1}`;
        const value = label
            .toLowerCase()
            .replace(/\s+/g, '-');
        return {
            value,
            label,
            icon: 'fas fa-tag'
        };
    });
}

function serializeCompatibilityOptions(options) {
    return (Array.isArray(options) ? options : [])
        .map(option => [option.value || '', option.label || ''].join('|'))
        .join('\n');
}

function parseCompatibilityOptions(text) {
    return parseLinesTextarea(text).map((line, index) => {
        const [valueRaw, labelRaw] = line.split('|').map(part => part.trim());
        const label = labelRaw || valueRaw || `خيار ${index + 1}`;
        const value = (valueRaw || label)
            .toLowerCase()
            .replace(/\s+/g, '-');
        return {
            value,
            label
        };
    });
}

function normalizeAccessoryBundleItems(bundle, accessoryProducts) {
    const productsById = new Map((Array.isArray(accessoryProducts) ? accessoryProducts : []).map(product => [String(product.id), product]));
    const productIds = Array.isArray(bundle.productIds)
        ? bundle.productIds.map(id => String(id))
        : [];

    if (productIds.length > 0) {
        return productIds
            .map(id => productsById.get(id))
            .filter(Boolean)
            .map(product => ({
                id: product.id,
                name: product.name,
                price: typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '',
                image: (product.images && product.images[0]) || ''
            }));
    }

    return (Array.isArray(bundle.items) ? bundle.items : []).map(item => ({
        id: item.id || '',
        name: item.name || '',
        price: item.price || '',
        image: item.image || ''
    }));
}

function calculateBundleSavingsText(currentPrice, oldPrice) {
    const current = parseFloat(currentPrice);
    const old = parseFloat(oldPrice);
    if (Number.isFinite(current) && Number.isFinite(old) && old > current) {
        return `وفر ${(old - current).toFixed(2)}`;
    }
    return '';
}

function createAccessoryProductCheckboxes(selectedIds) {
    const accessories = db.getProductsByCategory('accessories') || [];
    const selected = new Set((selectedIds || []).map(id => String(id)));

    if (accessories.length === 0) {
        return '<p style="color: #6c757d; margin: 0;">لا توجد منتجات إكسسوارات حاليًا.</p>';
    }

    return accessories.map(product => `
        <label style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 1px solid #e9ecef; border-radius: 10px; background: #fff;">
            <input type="checkbox" value="${product.id}" ${selected.has(String(product.id)) ? 'checked' : ''}>
            <span style="flex: 1;">${product.name}</span>
            <span style="color: #6c757d; font-size: 0.9rem;">$${Number(product.price || 0).toFixed(2)}</span>
        </label>
    `).join('');
}

function renderAccessoryBundlesEditor(bundles) {
    const container = document.getElementById('accessory-bundles-editor');
    if (!container) return;

    const accessories = db.getProductsByCategory('accessories') || [];
    const normalizedBundles = Array.isArray(bundles) && bundles.length > 0 ? bundles : [{
        title: 'مجموعة جديدة',
        subtitle: '',
        currentPrice: '',
        oldPrice: '',
        buttonText: 'إضافة المجموعة للسلة',
        productIds: []
    }];

    container.innerHTML = normalizedBundles.map((bundle, index) => {
        const items = normalizeAccessoryBundleItems(bundle, accessories);
        const productIds = Array.isArray(bundle.productIds) && bundle.productIds.length > 0
            ? bundle.productIds
            : items.map(item => item.id).filter(Boolean);
        const savingsText = calculateBundleSavingsText(bundle.currentPrice, bundle.oldPrice);

        return `
            <div class="accessory-bundle-card" data-bundle-index="${index}" style="border: 1px solid #e9ecef; border-radius: 12px; padding: 16px; margin-bottom: 16px; background: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px;">
                    <h5 style="margin: 0; color: #2c3e50;">مجموعة ${index + 1}</h5>
                    <button type="button" class="btn btn-outline" onclick="removeAccessoryBundleEditor(${index})" style="padding: 8px 12px;">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px;">العنوان</label>
                        <input type="text" class="form-control bundle-title" value="${bundle.title || ''}" placeholder="مثال: مجموعة المسافر">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px;">الوصف</label>
                        <input type="text" class="form-control bundle-subtitle" value="${bundle.subtitle || ''}" placeholder="وصف مختصر للمجموعة">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px;">السعر الحالي</label>
                        <input type="number" step="0.01" min="0" class="form-control bundle-current-price" value="${bundle.currentPrice || ''}" oninput="refreshAccessoryBundleSavings(this)">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px;">السعر القديم</label>
                        <input type="number" step="0.01" min="0" class="form-control bundle-old-price" value="${bundle.oldPrice || ''}" oninput="refreshAccessoryBundleSavings(this)">
                    </div>
                </div>
                <div style="margin-top: 14px;">
                    <label style="display: block; margin-bottom: 6px;">المنتجات داخل المجموعة</label>
                    <div class="bundle-products-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
                        ${createAccessoryProductCheckboxes(productIds)}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 14px;">
                    <div class="bundle-savings-preview" style="color: #198754; font-weight: 700;">${savingsText}</div>
                    <input type="hidden" class="bundle-button-text" value="${bundle.buttonText || 'إضافة المجموعة للسلة'}">
                </div>
            </div>
        `;
    }).join('');
}

function collectAccessoryBundlesFromEditor() {
    const accessories = db.getProductsByCategory('accessories') || [];
    const productsById = new Map(accessories.map(product => [String(product.id), product]));
    const cards = document.querySelectorAll('#accessory-bundles-editor .accessory-bundle-card');

    return Array.from(cards).map((card, index) => {
        const title = card.querySelector('.bundle-title')?.value.trim() || `مجموعة ${index + 1}`;
        const subtitle = card.querySelector('.bundle-subtitle')?.value.trim() || '';
        const currentPrice = card.querySelector('.bundle-current-price')?.value.trim() || '';
        const oldPrice = card.querySelector('.bundle-old-price')?.value.trim() || '';
        const buttonText = card.querySelector('.bundle-button-text')?.value.trim() || 'إضافة المجموعة للسلة';
        const productIds = Array.from(card.querySelectorAll('.bundle-products-list input[type="checkbox"]:checked'))
            .map(input => String(input.value));
        const items = productIds
            .map(id => productsById.get(id))
            .filter(Boolean)
            .map(product => ({
                id: product.id,
                name: product.name,
                price: typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : '',
                image: (product.images && product.images[0]) || ''
            }));

        return {
            title,
            subtitle,
            currentPrice,
            oldPrice,
            savingsText: calculateBundleSavingsText(currentPrice, oldPrice),
            buttonText,
            productIds,
            items
        };
    }).filter(bundle => bundle.title || bundle.productIds.length > 0);
}

function addAccessoryBundleEditor() {
    const currentBundles = collectAccessoryBundlesFromEditor();
    currentBundles.push({
        title: `مجموعة ${currentBundles.length + 1}`,
        subtitle: '',
        currentPrice: '',
        oldPrice: '',
        buttonText: 'إضافة المجموعة للسلة',
        productIds: []
    });
    renderAccessoryBundlesEditor(currentBundles);
}

function removeAccessoryBundleEditor(index) {
    const currentBundles = collectAccessoryBundlesFromEditor();
    currentBundles.splice(index, 1);
    renderAccessoryBundlesEditor(currentBundles);
}

function refreshAccessoryBundleSavings(element) {
    const card = element.closest('.accessory-bundle-card');
    if (!card) return;
    const currentPrice = card.querySelector('.bundle-current-price')?.value || '';
    const oldPrice = card.querySelector('.bundle-old-price')?.value || '';
    const preview = card.querySelector('.bundle-savings-preview');
    if (preview) {
        preview.textContent = calculateBundleSavingsText(currentPrice, oldPrice);
    }
}

function loadProductManagementSettings() {
    const categoryConfig = typeof db.getProductCategoriesConfig === 'function'
        ? db.getProductCategoriesConfig()
        : {};
    const accessorySettings = typeof db.getAccessorySettings === 'function'
        ? db.getAccessorySettings()
        : {};

    const phonesField = document.getElementById('phones-subcategories');
    const accessoriesField = document.getElementById('accessories-subcategories');
    const usedPhonesField = document.getElementById('used-phones-subcategories');
    const accessoryTypesField = document.getElementById('accessory-types-config');
    const compatibilityField = document.getElementById('accessory-compatibility-config');

    if (phonesField) phonesField.value = serializeLines((categoryConfig.phones || {}).subcategories || []);
    if (accessoriesField) accessoriesField.value = serializeLines((categoryConfig.accessories || {}).subcategories || []);
    if (usedPhonesField) usedPhonesField.value = serializeLines((categoryConfig['used-phones'] || {}).subcategories || []);
    if (accessoryTypesField) accessoryTypesField.value = serializeAccessoryTypes(accessorySettings.types || []);
    if (compatibilityField) compatibilityField.value = serializeCompatibilityOptions(accessorySettings.compatibilityOptions || []);
    renderAccessoryBundlesEditor(accessorySettings.bundles || []);
}

function saveProductCategoriesSettings() {
    const categorySettings = {
        phones: {
            name: 'هواتف',
            subcategories: parseLinesTextarea(document.getElementById('phones-subcategories')?.value)
        },
        accessories: {
            name: 'إكسسوارات',
            subcategories: parseLinesTextarea(document.getElementById('accessories-subcategories')?.value)
        },
        'used-phones': {
            name: 'هواتف مستعملة',
            subcategories: parseLinesTextarea(document.getElementById('used-phones-subcategories')?.value)
        }
    };

    const success = db.updateSiteSettings({ productCategories: categorySettings });
    showNotification(success ? 'تم حفظ التصنيفات بنجاح' : 'تعذر حفظ التصنيفات', success ? 'success' : 'error');
    if (success) {
        initProductsTab();
    }
}

function saveAccessoryOptionsSettings() {
    const current = typeof db.getAccessorySettings === 'function' ? db.getAccessorySettings() : {};
    const accessorySettings = {
        ...current,
        types: parseAccessoryTypes(document.getElementById('accessory-types-config')?.value),
        compatibilityOptions: parseCompatibilityOptions(document.getElementById('accessory-compatibility-config')?.value)
    };

    const success = db.updateSiteSettings({ accessorySettings });
    showNotification(success ? 'تم حفظ إعدادات الإكسسوارات بنجاح' : 'تعذر حفظ إعدادات الإكسسوارات', success ? 'success' : 'error');
}

function saveAccessoryBundlesSettings() {
    const current = typeof db.getAccessorySettings === 'function' ? db.getAccessorySettings() : {};
    const bundles = collectAccessoryBundlesFromEditor();

    const accessorySettings = {
        ...current,
        bundles
    };

    const success = db.updateSiteSettings({ accessorySettings });
    showNotification(success ? 'تم حفظ مجموعات الإكسسوارات بنجاح' : 'تعذر حفظ مجموعات الإكسسوارات', success ? 'success' : 'error');
}

// ===== 6. إدارة المنتجات =====

function initProductsTab() {
    console.log('بدء تحميل تبويب المنتجات...');
    
    const container = document.querySelector('#products .dashboard-section');
    if (!container) {
        console.error('❌ حاوية المنتجات غير موجودة');
        return;
    }
    
    container.innerHTML = `
        <h3><i class="fas fa-box"></i> إدارة المنتجات</h3>
        <div style="text-align: center; padding: 40px; color: #6c757d;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <p>جاري تحميل المنتجات...</p>
        </div>
    `;
    
    setTimeout(() => {
        try {
            const products = db.getProducts();
            console.log('المنتجات المحملة:', products);
            
            let html = `
                <h3><i class="fas fa-box"></i> إدارة المنتجات</h3>
                 
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="showAddProductModal()">
                            <i class="fas fa-plus"></i> إضافة منتج جديد
                        </button>
                        <button class="btn btn-info" onclick="exportData('products')">
                            <i class="fas fa-file-export"></i> تصدير
                        </button>
                        <button class="btn" onclick="triggerImportFile('products')" style="background: #f8f9fa; color: #333;">
                            <i class="fas fa-file-import"></i> استيراد
                        </button>
                        <input type="file" id="import-products-file" accept=".csv,text/csv" onchange="importDataFromFile('products', event)" style="display: none;">
                    </div>
                    <div style="width: 300px;">
                        <input type="text" id="product-search" class="form-control" placeholder="بحث عن منتج..." 
                               onkeyup="searchProducts()">
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 18px;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-sitemap"></i> التصنيفات العامة</h4>
                        <label style="display: block; margin-bottom: 8px;">تصنيفات الهواتف</label>
                        <textarea id="phones-subcategories" class="form-control" rows="4" placeholder="كل تصنيف في سطر"></textarea>
                        <label style="display: block; margin: 12px 0 8px;">تصنيفات الإكسسوارات</label>
                        <textarea id="accessories-subcategories" class="form-control" rows="4" placeholder="كل تصنيف في سطر"></textarea>
                        <label style="display: block; margin: 12px 0 8px;">تصنيفات المستعمل</label>
                        <textarea id="used-phones-subcategories" class="form-control" rows="4" placeholder="كل تصنيف في سطر"></textarea>
                        <button class="btn btn-primary" onclick="saveProductCategoriesSettings()" style="margin-top: 14px; width: 100%;">
                            <i class="fas fa-save"></i> حفظ التصنيفات
                        </button>
                    </div>

                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 18px;">
                        <h4 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-headphones"></i> إعدادات الإكسسوارات</h4>
                        <label style="display: block; margin-bottom: 8px;">أنواع الإكسسوارات</label>
                        <textarea id="accessory-types-config" class="form-control" rows="5" placeholder="كل نوع في سطر"></textarea>
                        <small style="display: block; color: #6c757d; margin-top: 6px;">مثال: سماعات</small>
                        <label style="display: block; margin: 12px 0 8px;">خيارات التوافق</label>
                        <textarea id="accessory-compatibility-config" class="form-control" rows="5" placeholder="value|label"></textarea>
                        <small style="display: block; color: #6c757d; margin-top: 6px;">مثال: iphone|iPhone</small>
                        <button class="btn btn-primary" onclick="saveAccessoryOptionsSettings()" style="margin-top: 14px; width: 100%;">
                            <i class="fas fa-save"></i> حفظ إعدادات الإكسسوارات
                        </button>
                    </div>
                </div>

                <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
                    <h4 style="margin-bottom: 15px; color: #2c3e50;"><i class="fas fa-gift"></i> مجموعات الإكسسوارات المميزة</h4>
                    <div id="accessory-bundles-editor"></div>
                    <button class="btn" type="button" onclick="addAccessoryBundleEditor()" style="background: #f8f9fa; color: #333; margin-top: 6px;">
                        <i class="fas fa-plus"></i> إضافة مجموعة
                    </button>
                    <small style="display: block; color: #6c757d; margin-top: 8px;">اختر المنتجات من القائمة، ثم أدخل السعر الحالي والقديم. التوفير يُحسب تلقائيًا.</small>
                    <button class="btn btn-primary" onclick="saveAccessoryBundlesSettings()" style="margin-top: 14px;">
                        <i class="fas fa-save"></i> حفظ المجموعات المميزة
                    </button>
                </div>
            `;
            
            if (!products || products.length === 0) {
                html += `
                    <div style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>لا توجد منتجات بعد</p>
                        <button class="btn btn-primary mt-3" onclick="showAddProductModal()">
                            <i class="fas fa-plus"></i> إضافة أول منتج
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الصورة</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الاسم</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">السعر</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الفئة</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">مميز</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">عرض خاص</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                products.forEach(product => {
                    html += `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 12px;">
                                <img src="${product.images?.[0] || 'https://via.placeholder.com/60x60/ccc/fff?text=No+Image'}" 
                                     alt="${product.name}" 
                                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                            </td>
                            <td style="padding: 12px; font-weight: 600;">${product.name || 'غير معروف'}</td>
                            <td style="padding: 12px;">${product.price || 0} SP</td>
                            <td style="padding: 12px;">${product.category || 'غير مصنف'}</td>
                            <td style="padding: 12px;">
                                <span style="padding: 5px 10px; border-radius: 20px; background: ${product.featured ? '#d4edda' : '#f8d7da'}; color: ${product.featured ? '#155724' : '#721c24'};">
                                    ${product.featured ? 'نعم' : 'لا'}
                                </span>
                            </td>
                            <td style="padding: 12px;">
                                <span style="padding: 5px 10px; border-radius: 20px; background: ${product.specialOffer ? '#fff3cd' : '#f8d7da'}; color: ${product.specialOffer ? '#856404' : '#721c24'};">
                                    ${product.specialOffer ? 'نعم' : 'لا'}
                                </span>
                            </td>
                            <td style="padding: 12px;">
                                <button class="btn btn-sm btn-info" onclick="editProductInPanel('${product.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProductInPanel('${product.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            loadProductManagementSettings();
            console.log('✅ تم تحميل تبويب المنتجات');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل المنتجات:', error);
            container.innerHTML = `
                <h3><i class="fas fa-box"></i> إدارة المنتجات</h3>
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p>حدث خطأ في تحميل المنتجات</p>
                    <button class="btn btn-primary mt-3" onclick="initProductsTab()">
                        <i class="fas fa-redo"></i> إعادة المحاولة
                    </button>
                </div>
            `;
        }
    }, 300);
}

// ===== 7. إدارة الطلبات =====

function initOrdersTab() {
    console.log('بدء تحميل تبويب الطلبات...');
    
    const container = document.querySelector('#orders .dashboard-section');
    if (!container) {
        console.error('❌ حاوية الطلبات غير موجودة');
        return;
    }
    
    container.innerHTML = `
        <h3><i class="fas fa-shopping-bag"></i> إدارة الطلبات</h3>
        <div style="text-align: center; padding: 40px; color: #6c757d;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <p>جاري تحميل الطلبات...</p>
        </div>
    `;
    
    setTimeout(() => {
        try {
            const orders = db.getOrders();
            console.log('الطلبات المحملة:', orders);
            
            let html = `
                <h3><i class="fas fa-shopping-bag"></i> إدارة الطلبات</h3>
                
                <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                    <button class="btn btn-primary" onclick="initOrdersTab()">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                    <button class="btn btn-info" onclick="exportData('orders')">
                        <i class="fas fa-file-export"></i> تصدير
                    </button>
                    <button class="btn" onclick="triggerImportFile('orders')" style="background: #f8f9fa; color: #333;">
                        <i class="fas fa-file-import"></i> استيراد
                    </button>
                    <input type="file" id="import-orders-file" accept=".csv,text/csv" onchange="importDataFromFile('orders', event)" style="display: none;">
                    <div style="flex: 1; max-width: 400px;">
                        <input type="text" id="order-search" class="form-control" placeholder="ابحث برقم الطلب أو اسم العميل...">
                    </div>
                </div>
            `;
            
            if (!orders || orders.length === 0) {
                html += `
                    <div style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>لا توجد طلبات بعد</p>
                    </div>
                `;
            } else {
                html += `
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">رقم الطلب</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">العميل</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">التاريخ</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">المبلغ</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الحالة</th>
                                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                orders.forEach(order => {
                    const statusColors = {
                        'pending': { bg: '#fff3cd', color: '#856404', text: 'قيد الانتظار' },
                        'processing': { bg: '#cce5ff', color: '#004085', text: 'قيد المعالجة' },
                        'shipped': { bg: '#d4edda', color: '#155724', text: 'تم الشحن' },
                        'completed': { bg: '#d1ecf1', color: '#0c5460', text: 'مكتمل' },
                        'cancelled': { bg: '#f8d7da', color: '#721c24', text: 'ملغي' }
                    };
                    
                    const status = order.status || 'pending';
                    const statusInfo = statusColors[status] || statusColors.pending;
                    
                    html += `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 12px; font-weight: 600;">${order.id || 'غير معروف'}</td>
                            <td style="padding: 12px;">
                                <div>${order.customerName || 'غير معروف'}</div>
                                <small style="color: #6c757d;">${order.customerPhone || 'لا يوجد'}</small>
                            </td>
                            <td style="padding: 12px;">${new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SA')}</td>
                            <td style="padding: 12px; font-weight: 600;">${order.total || 0} SP</td>
                            <td style="padding: 12px;">
                                <span style="padding: 5px 10px; border-radius: 20px; background: ${statusInfo.bg}; color: ${statusInfo.color};">
                                    ${statusInfo.text}
                                </span>
                            </td>
                            <td style="padding: 12px;">
                                <button class="btn btn-sm btn-info" onclick="viewOrderDetails('${order.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="changeOrderStatus('${order.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            console.log('✅ تم تحميل تبويب الطلبات');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الطلبات:', error);
            container.innerHTML = `
                <h3><i class="fas fa-shopping-bag"></i> إدارة الطلبات</h3>
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p>حدث خطأ في تحميل الطلبات</p>
                </div>
            `;
        }
    }, 300);
}

// ===== 8. إدارة الرسائل =====

function initMessagesTab() {
    console.log('بدء تحميل تبويب الرسائل...');
    
    const container = document.querySelector('#messages .dashboard-section');
    if (!container) {
        console.error('❌ حاوية الرسائل غير موجودة');
        return;
    }
    
    container.innerHTML = `
        <h3><i class="fas fa-envelope"></i> رسائل الاتصال</h3>
        <div style="text-align: center; padding: 40px; color: #6c757d;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
            <p>جاري تحميل الرسائل...</p>
        </div>
    `;
    
    setTimeout(() => {
        try {
            const messages = db.getContactMessages();
            console.log('الرسائل المحملة:', messages);
            
            let html = `
                <h3><i class="fas fa-envelope"></i> إدارة رسائل الاتصال</h3>
                
                <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                    <span id="unread-count" style="padding: 8px 15px; background: #17a2b8; color: white; border-radius: 20px;">
                        0 رسائل غير مقروءة
                    </span>
                    <button class="btn btn-danger btn-sm" onclick="clearAllMessages()">
                        <i class="fas fa-trash"></i> حذف الكل
                    </button>
                </div>
                
                <div id="messages-list">
            `;
            
            if (!messages || messages.length === 0) {
                html += `
                    <div style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-envelope-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>لا توجد رسائل بعد</p>
                    </div>
                `;
            } else {
                messages.forEach(message => {
                    const isUnread = message.status === 'unread';
                    const date = new Date(message.createdAt || Date.now());
                    const formattedDate = date.toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    html += `
                        <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 15px; 
                              background: ${isUnread ? '#f8f9fa' : 'white'}; border-right: 4px solid ${isUnread ? '#007bff' : '#28a745'}">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #343a40;">${message.name || 'غير معروف'}</strong>
                                    <small style="color: #6c757d; margin-right: 10px;">${message.email || 'لا يوجد'}</small>
                                    <small style="color: #6c757d;">${message.phone || 'لا يوجد'}</small>
                                </div>
                                <div>
                                    <small style="color: #6c757d;">${formattedDate}</small>
                                    <span style="margin-right: 10px; padding: 3px 8px; border-radius: 12px; 
                                          background: ${isUnread ? '#007bff' : '#28a745'}; 
                                          color: white; font-size: 0.8rem;">
                                        ${isUnread ? 'غير مقروء' : 'مقروء'}
                                    </span>
                                </div>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <strong>الموضوع:</strong> ${message.subject || 'لا يوجد موضوع'}
                            </div>
                            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin-bottom: 15px;">
                                ${message.message || 'لا يوجد نص'}
                            </div>
                            <div style="display: flex; gap: 10px;">
                                ${isUnread ? `
                                    <button class="btn btn-sm btn-success" onclick="markAsRead('${message.id}')">
                                        <i class="fas fa-check"></i> تعيين كمقروء
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-info" onclick="replyToMessage('${message.email || ''}')">
                                    <i class="fas fa-reply"></i> رد
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteMessage('${message.id}')">
                                    <i class="fas fa-trash"></i> حذف
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
            
            html += `</div>`;
            container.innerHTML = html;
            
            // تحديث عدد الرسائل غير المقروءة
            const unreadCount = messages ? messages.filter(m => m.status === 'unread').length : 0;
            const unreadElement = document.getElementById('unread-count');
            if (unreadElement) {
                unreadElement.textContent = `${unreadCount} رسائل غير مقروءة`;
            }
            
            console.log('✅ تم تحميل تبويب الرسائل');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل الرسائل:', error);
            container.innerHTML = `
                <h3><i class="fas fa-envelope"></i> رسائل الاتصال</h3>
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <p>حدث خطأ في تحميل الرسائل</p>
                </div>
            `;
        }
    }, 300);
}

// ===== 9. دوال المنتجات =====

function showAddProductModal() {
    const categories = typeof db.getProductCategoriesConfig === 'function'
        ? db.getProductCategoriesConfig()
        : {
            'phones': { name: 'هواتف', subcategories: ['جديد', 'مستعمل', 'مجدول'] },
            'accessories': { name: 'إكسسوارات', subcategories: ['بنوك طاقة', 'كابلات', 'أغطية', 'شواحن', 'سماعات', 'أخرى'] },
            'used-phones': { name: 'هواتف مستعملة', subcategories: ['آيفون', 'سامسونج', 'شاومي', 'أخرى'] }
        };
    const accessorySettings = typeof db.getAccessorySettings === 'function' ? db.getAccessorySettings() : { types: [], compatibilityOptions: [] };
    
    let categoryOptions = '';
    for (const [key, cat] of Object.entries(categories)) {
        categoryOptions += `<option value="${key}">${cat.name}</option>`;
    }
    const order = {};
    
    let unusedPaymentProofHtml = `
        <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
            <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
            <p style="margin: 0; color: #6c757d;">لا يوجد إشعار مرفوع لهذا الطلب.</p>
        </div>
    `;

    if (order.paymentProof) {
        const proofName = order.receiptFileName || 'receipt';
        const proofIsImage = typeof order.paymentProof === 'string' && order.paymentProof.startsWith('data:image/');

        unusedPaymentProofHtml = `
            <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
                <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
                <p style="margin-bottom: 12px;"><strong>اسم الملف:</strong> ${escapeHtml(proofName)}</p>
                ${proofIsImage ? `
                    <div style="text-align: center;">
                        <img src="${order.paymentProof}" alt="إشعار الحوالة" style="max-width: 100%; max-height: 420px; border-radius: 10px; border: 1px solid #ddd;">
                    </div>
                ` : `
                    <a href="${order.paymentProof}" download="${escapeHtml(proofName)}" class="btn btn-info" style="display: inline-flex;">
                        <i class="fas fa-download"></i> تنزيل الإشعار
                    </a>
                `}
            </div>
        `;
    }

    let paymentProofHtml = `
        <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
            <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
            <p style="margin: 0; color: #6c757d;">لا يوجد إشعار مرفوع لهذا الطلب.</p>
        </div>
    `;
    
    if (order.paymentProof) {
        const proofName = order.receiptFileName || 'receipt';
        const proofIsImage = typeof order.paymentProof === 'string' && order.paymentProof.startsWith('data:image/');
        
        paymentProofHtml = `
            <div style="margin-top: 20px; padding: 18px; border: 1px solid #eee; border-radius: 10px; background: #fafafa;">
                <h4 style="margin-bottom: 12px;">إشعار الحوالة:</h4>
                <p style="margin-bottom: 12px;"><strong>اسم الملف:</strong> ${escapeHtml(proofName)}</p>
                ${proofIsImage ? `
                    <div style="text-align: center;">
                        <img src="${order.paymentProof}" alt="إشعار الحوالة" style="max-width: 100%; max-height: 420px; border-radius: 10px; border: 1px solid #ddd;">
                    </div>
                ` : `
                    <a href="${order.paymentProof}" download="${escapeHtml(proofName)}" class="btn btn-info" style="display: inline-flex;">
                        <i class="fas fa-download"></i> تنزيل الإشعار
                    </a>
                `}
            </div>
        `;
    }
    
    const modalHTML = `
        <div class="modal-overlay" style="position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin: 0;"><i class="fas fa-box"></i> إضافة منتج جديد</h3>
                    <button onclick="closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6;">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                    <div>
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-tag"></i> اسم المنتج *</label>
                            <input type="text" id="modal-product-name" class="form-control" required>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-money-bill"></i> السعر (SP) *</label>
                            <input type="number" id="modal-product-price" class="form-control" required>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-money-bill-wave"></i> السعر القديم</label>
                            <input type="number" id="modal-product-old-price" class="form-control">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label><i class="fas fa-folder"></i> الفئة الرئيسية *</label>
                                <select id="modal-product-category" class="form-control" onchange="updateSubcategories()">
                                    ${categoryOptions}
                                </select>
                            </div>
                            
                            <div>
                                <label><i class="fas fa-folder-open"></i> التصنيف الفرعي *</label>
                                <select id="modal-product-subcategory" class="form-control">
                                    <option value="بنوك طاقة">بنوك طاقة</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-layer-group"></i> حالة المنتج</label>
                            <select id="modal-product-type" class="form-control">
                                <option value="new">جديد</option>
                                <option value="used">مستعمل</option>
                                <option value="refurbished">مجدول</option>
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label><i class="fas fa-shapes"></i> نوع الإكسسوار</label>
                                <select id="modal-product-accessory-type" class="form-control">
                                    <option value="">بدون</option>
                                    ${((accessorySettings.types || []).map(type => `<option value="${type.value}">${type.label}</option>`).join(''))}
                                </select>
                            </div>

                            <div>
                                <label><i class="fas fa-mobile-alt"></i> التوافق</label>
                                <input type="text" id="modal-product-compatibility" class="form-control" placeholder="مثال: iPhone, Samsung">
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-image"></i> صورة المنتج الرئيسية *</label>
                            <input type="text" id="modal-product-image" class="form-control" 
                                   placeholder="https://example.com/image.jpg" required>
                            <small style="color: #95a5a6; font-size: 0.8rem;">أضف رابط الصورة</small>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-images"></i> روابط صور إضافية (كل رابط في سطر)</label>
                            <textarea id="modal-product-additional-images" class="form-control" rows="3" 
                                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"></textarea>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label><i class="fas fa-align-left"></i> الوصف التفصيلي *</label>
                            <textarea id="modal-product-description" class="form-control" rows="6" required></textarea>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                                <input type="checkbox" id="modal-product-featured">
                                <i class="fas fa-star" style="color: #f39c12;"></i> منتج مميز
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 8px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                                <input type="checkbox" id="modal-product-special">
                                <i class="fas fa-fire" style="color: #e74c3c;"></i> عرض خاص
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; display: flex; gap: 15px;">
                    <button class="btn btn-primary" onclick="saveNewProduct()" style="flex: 1;">
                        <i class="fas fa-save"></i> حفظ المنتج
                    </button>
                    <button class="btn" onclick="closeModal()" style="flex: 1; background: #f8f9fa; color: #333;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    modal.id = 'product-modal';
    document.body.appendChild(modal);
    
    // تعيين التصنيفات الفرعية
    setTimeout(() => updateSubcategories(), 100);
}

function updateSubcategories() {
    const categorySelect = document.getElementById('modal-product-category');
    const subcategorySelect = document.getElementById('modal-product-subcategory');
    const productTypeSelect = document.getElementById('modal-product-type');
    const accessoryTypeSelect = document.getElementById('modal-product-accessory-type');
    const compatibilityField = document.getElementById('modal-product-compatibility');
    
    if (!categorySelect || !subcategorySelect) return;
    
    const category = categorySelect.value;
    const categories = typeof db.getProductCategoriesConfig === 'function' ? db.getProductCategoriesConfig() : {};
    const subcategories = ((categories[category] || {}).subcategories || ['عام']);
    
    // تفريغ القائمة الحالية
    subcategorySelect.innerHTML = '';
    
    // إضافة التصنيفات الفرعية
    subcategories.forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = sub;
        subcategorySelect.appendChild(option);
    });

    if (productTypeSelect) {
        if (category === 'used-phones') {
            productTypeSelect.value = 'used';
        } else if (category === 'accessories' && !productTypeSelect.value) {
            productTypeSelect.value = 'new';
        }
    }

    if (accessoryTypeSelect) {
        accessoryTypeSelect.disabled = category !== 'accessories';
        if (category !== 'accessories') {
            accessoryTypeSelect.value = '';
        }
    }

    if (compatibilityField) {
        compatibilityField.disabled = category !== 'accessories';
        if (category !== 'accessories') {
            compatibilityField.value = '';
        }
    }
}

function saveNewProduct() {
    const productData = {
        name: document.getElementById('modal-product-name').value,
        price: parseFloat(document.getElementById('modal-product-price').value),
        oldPrice: document.getElementById('modal-product-old-price').value ? 
                  parseFloat(document.getElementById('modal-product-old-price').value) : null,
        description: document.getElementById('modal-product-description').value,
        images: [
            document.getElementById('modal-product-image').value,
            ...document.getElementById('modal-product-additional-images').value
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0)
        ],
        category: document.getElementById('modal-product-category').value,
        subcategory: document.getElementById('modal-product-subcategory').value,
        categoryType: document.getElementById('modal-product-type').value,
        type: document.getElementById('modal-product-accessory-type').value,
        compatibility: document.getElementById('modal-product-compatibility').value.trim(),
        featured: document.getElementById('modal-product-featured').checked,
        specialOffer: document.getElementById('modal-product-special').checked,
        inStock: true
    };
    
    if (!productData.name || !productData.price || !productData.images[0]) {
        showNotification('يرجى ملء الحقول المطلوبة (الاسم، السعر، صورة)', 'error');
        return;
    }
    
    if (db.addProduct(productData)) {
        showNotification('تم إضافة المنتج بنجاح', 'success');
        closeModal();
        initProductsTab();
    } else {
        showNotification('حدث خطأ في إضافة المنتج', 'error');
    }
}

function editProductInPanel(productId) {
    const product = db.getProductById(productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }
    
    showAddProductModal();
    
    setTimeout(() => {
        document.getElementById('modal-product-name').value = product.name;
        document.getElementById('modal-product-price').value = product.price;
        document.getElementById('modal-product-old-price').value = product.oldPrice || '';
        document.getElementById('modal-product-description').value = product.description || '';
        document.getElementById('modal-product-image').value = product.images[0] || '';
        document.getElementById('modal-product-category').value = product.category || 'phones';
        document.getElementById('modal-product-type').value = product.categoryType || 'new';
        document.getElementById('modal-product-accessory-type').value = product.type || '';
        document.getElementById('modal-product-compatibility').value = product.compatibility || '';
        document.getElementById('modal-product-featured').checked = product.featured || false;
        document.getElementById('modal-product-special').checked = product.specialOffer || false;
        
        // تحديث التصنيفات الفرعية
        updateSubcategories();
        setTimeout(() => {
            if (product.subcategory) {
                document.getElementById('modal-product-subcategory').value = product.subcategory;
            }
        }, 200);
        
        // تحديث صور إضافية
        const additionalImages = product.images.slice(1).join('\n');
        document.getElementById('modal-product-additional-images').value = additionalImages;
        
        // تغيير الزر
        const saveBtn = document.querySelector('.modal-overlay .btn-primary');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> تحديث المنتج';
            saveBtn.onclick = function() { updateProduct(productId); };
        }
    }, 200);
}

function updateProduct(productId) {
    const productData = {
        name: document.getElementById('modal-product-name').value,
        price: parseFloat(document.getElementById('modal-product-price').value),
        oldPrice: document.getElementById('modal-product-old-price').value ? 
                  parseFloat(document.getElementById('modal-product-old-price').value) : null,
        description: document.getElementById('modal-product-description').value,
        images: [
            document.getElementById('modal-product-image').value,
            ...document.getElementById('modal-product-additional-images').value
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0)
        ],
        category: document.getElementById('modal-product-category').value,
        subcategory: document.getElementById('modal-product-subcategory').value,
        categoryType: document.getElementById('modal-product-type').value,
        type: document.getElementById('modal-product-accessory-type').value,
        compatibility: document.getElementById('modal-product-compatibility').value.trim(),
        featured: document.getElementById('modal-product-featured').checked,
        specialOffer: document.getElementById('modal-product-special').checked
    };
    
    if (db.updateProduct(productId, productData)) {
        showNotification('تم تحديث المنتج بنجاح', 'success');
        closeModal();
        initProductsTab();
    } else {
        showNotification('حدث خطأ في تحديث المنتج', 'error');
    }
}

function deleteProductInPanel(productId) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) {
        if (db.deleteProduct(productId)) {
            showNotification('تم حذف المنتج بنجاح', 'success');
            initProductsTab();
        } else {
            showNotification('حدث خطأ في حذف المنتج', 'error');
        }
    }
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.remove();
    }
}

// ===== 10. دوال الطلبات =====

function viewOrderDetails(orderId) {
    const order = db.getOrderById(orderId);
    if (!order) {
        showNotification('الطلب غير موجود', 'error');
        return;
    }
    
    const statusText = {
        'pending': 'قيد الانتظار',
        'processing': 'قيد المعالجة',
        'shipped': 'تم الشحن',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = `
            <h4>المنتجات:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd;">المنتج</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">الكمية</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">السعر</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">المجموع</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        order.items.forEach(item => {
            const itemTotal = item.quantity * (item.price || 0);
            itemsHtml += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name || 'غير معروف'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity || 1}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.price || 0} SP</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${itemTotal} SP</td>
                </tr>
            `;
        });
        
        itemsHtml += `
                </tbody>
            </table>
        `;
    }
    
    const modalHTML = `
        <div class="modal-overlay" style="position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin: 0;"><i class="fas fa-file-invoice"></i> تفاصيل الطلب #${order.id}</h3>
                    <button onclick="closeOrderModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6;">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4>معلومات العميل:</h4>
                        <p><strong>الاسم:</strong> ${order.customerName || 'غير معروف'}</p>
                        <p><strong>الهاتف:</strong> ${order.customerPhone || 'لا يوجد'}</p>
                        <p><strong>العنوان:</strong> ${order.customerAddress || 'لا يوجد'}</p>
                    </div>
                    
                    <div>
                        <h4>معلومات الطلب:</h4>
                        <p><strong>التاريخ:</strong> ${new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p><strong>الحالة:</strong> ${statusText[order.status] || order.status}</p>
                        <p><strong>الإجمالي:</strong> ${order.total || 0} SP</p>
                    </div>
                </div>
                
                ${itemsHtml}
                ${getPaymentProofHtml(order)}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; display: flex; gap: 15px;">
                    <button class="btn btn-primary" onclick="closeOrderModal()" style="flex: 1;">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    modal.id = 'order-modal';
    document.body.appendChild(modal);
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.remove();
    }
}

function changeOrderStatus(orderId) {
    const order = db.getOrderById(orderId);
    if (!order) {
        showNotification('الطلب غير موجود', 'error');
        return;
    }
    
    const statusOptions = [
        { value: 'pending', text: 'قيد الانتظار' },
        { value: 'processing', text: 'قيد المعالجة' },
        { value: 'shipped', text: 'تم الشحن' },
        { value: 'completed', text: 'مكتمل' },
        { value: 'cancelled', text: 'ملغي' }
    ];
    
    let optionsHtml = '';
    statusOptions.forEach(option => {
        const selected = order.status === option.value ? 'selected' : '';
        optionsHtml += `<option value="${option.value}" ${selected}>${option.text}</option>`;
    });
    
    const modalHTML = `
        <div class="modal-overlay" style="position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50; margin: 0;"><i class="fas fa-edit"></i> تغيير حالة الطلب</h3>
                    <button onclick="closeStatusModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #95a5a6;">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <p>تغيير حالة الطلب: <strong>${order.id}</strong></p>
                    <p>العميل: <strong>${order.customerName || 'غير معروف'}</strong></p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label>الحالة الجديدة:</label>
                    <select id="new-order-status" class="form-control">
                        ${optionsHtml}
                    </select>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button class="btn btn-primary" onclick="saveOrderStatus('${orderId}')" style="flex: 1;">
                        <i class="fas fa-save"></i> حفظ
                    </button>
                    <button class="btn" onclick="closeStatusModal()" style="flex: 1; background: #f8f9fa; color: #333;">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    modal.id = 'status-modal';
    document.body.appendChild(modal);
}

function closeStatusModal() {
    const modal = document.getElementById('status-modal');
    if (modal) {
        modal.remove();
    }
}

function saveOrderStatus(orderId) {
    const newStatus = document.getElementById('new-order-status').value;
    
    if (db.updateOrderStatus(orderId, newStatus)) {
        showNotification('تم تحديث حالة الطلب بنجاح', 'success');
        closeStatusModal();
        initOrdersTab();
    } else {
        showNotification('حدث خطأ في تحديث حالة الطلب', 'error');
    }
}

// ===== 11. دوال الرسائل =====

function markAsRead(messageId) {
    if (db.updateMessageStatus(messageId, 'read')) {
        showNotification('تم تعيين الرسالة كمقروءة', 'success');
        initMessagesTab();
    } else {
        showNotification('حدث خطأ في تحديث حالة الرسالة', 'error');
    }
}

function replyToMessage(email) {
    if (!email) {
        showNotification('لا يوجد بريد إلكتروني للرد', 'error');
        return;
    }
    window.open(`mailto:${email}?subject=رد على رسالتك&body=عزيزي العميل،`, '_blank');
}

function deleteMessage(messageId) {
    if (confirm('هل تريد حذف هذه الرسالة؟')) {
        if (db.deleteMessage(messageId)) {
            showNotification('تم حذف الرسالة', 'success');
            initMessagesTab();
        } else {
            showNotification('حدث خطأ في حذف الرسالة', 'error');
        }
    }
}

function clearAllMessages() {
    if (confirm('هل تريد حذف جميع الرسائل؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        db.saveContactMessages([]);
        showNotification('تم حذف جميع الرسائل', 'success');
        initMessagesTab();
    }
}

// ===== 12. دوال البحث =====

function searchProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const rows = document.querySelectorAll('#products table tbody tr');
    
    rows.forEach(row => {
        const productName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ===== 13. دوال المساعدة =====

// إظهار الإشعارات
function showNotification(message, type = 'success') {
    // إزالة الإشعارات القديمة
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-exclamation-circle' : 
                       'fa-info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// تبديل الشريط الجانبي
function toggleSidebar() {
    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

// تسجيل الخروج
function logout() {
    if (confirm('هل تريد تسجيل الخروج من لوحة التحكم؟')) {
        if (window.db && typeof db.logoutAdmin === 'function') {
            db.logoutAdmin();
        } else {
            localStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('admin_logged_in');
            sessionStorage.removeItem('admin_logged_in');
        }
        window.location.href = 'admin-logout.php';
    }
}

// اختبار الحفظ
function testSave() {
    console.log('=== اختبار النظام ===');
    console.log('db موجود؟', !!window.db);
    console.log('db.updateSiteSettings موجود؟', typeof db.updateSiteSettings === 'function');
    
    const testResult = db.updateSiteSettings({ test: Date.now() });
    console.log('نتيجة الاختبار:', testResult);
    
    if (testResult) {
        showNotification('✅ اختبار النظام ناجح', 'success');
    } else {
        showNotification('❌ اختبار النظام فاشل', 'error');
    }
}

// ===== 14. تهيئة الصفحة =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة لوحة التحكم...');
    
    // تحميل إعدادات الموقع
    const settings = db.getSiteSettings();
    
    // تحديث الشعار والعنوان
    const logoImg = document.getElementById('dashboard-logo');
    const title = document.getElementById('dashboard-title');
    const mainTitle = document.getElementById('dashboard-title-main');
    
    if (logoImg && settings.logo) {
        logoImg.src = settings.logo;
    }
    
    if (title) {
        title.textContent = (settings.siteName || 'متجر الإلكترونيات') + ' - لوحة التحكم';
    }
    
    if (mainTitle) {
        mainTitle.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${settings.siteName || 'متجر الإلكترونيات'} - لوحة التحكم`;
    }
    
    // تحميل الإحصائيات
    loadDashboardStats();
    
    // إعداد الشريط الجانبي للأجهزة المحمولة
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // إغلاق الشريط الجانبي عند النقر خارجها
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('dashboard-sidebar');
        const toggle = document.getElementById('sidebar-toggle');
        
        if (window.innerWidth <= 992 && 
            sidebar && toggle &&
            !sidebar.contains(event.target) && 
            !toggle.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });
    
    console.log('✅ لوحة التحكم جاهزة');
});

// ===== 15. تصدير الدوال =====
window.switchTab = switchTab;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.handleLogoUpload = handleLogoUpload;
window.removeLogoFile = removeLogoFile;
window.handleMainImageUpload = handleMainImageUpload;
window.removeMainImageFile = removeMainImageFile;
window.handleBarcodeUpload = handleBarcodeUpload;
window.removeBarcodeFile = removeBarcodeFile;
window.exportData = exportData;
window.triggerImportFile = triggerImportFile;
window.importDataFromFile = importDataFromFile;
window.saveSiteSettings = saveSiteSettings;
window.saveMainImage = saveMainImage;
window.saveBarcode = saveBarcode;
window.saveWhyChooseText = saveWhyChooseText;
window.saveFooterSettings = saveFooterSettings;
window.saveSocialMedia = saveSocialMedia;
window.saveShippingNote = saveShippingNote;
window.testSave = testSave;
window.showAddProductModal = showAddProductModal;
window.closeModal = closeModal;
window.saveNewProduct = saveNewProduct;
window.editProductInPanel = editProductInPanel;
window.updateProduct = updateProduct;
window.deleteProductInPanel = deleteProductInPanel;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
window.changeOrderStatus = changeOrderStatus;
window.closeStatusModal = closeStatusModal;
window.saveOrderStatus = saveOrderStatus;
window.markAsRead = markAsRead;
window.replyToMessage = replyToMessage;
window.deleteMessage = deleteMessage;
window.clearAllMessages = clearAllMessages;
window.searchProducts = searchProducts;
window.updateSubcategories = updateSubcategories;
window.initProductsTab = initProductsTab;
window.initOrdersTab = initOrdersTab;
window.initMessagesTab = initMessagesTab;
window.saveProductCategoriesSettings = saveProductCategoriesSettings;
window.saveAccessoryOptionsSettings = saveAccessoryOptionsSettings;
window.saveAccessoryBundlesSettings = saveAccessoryBundlesSettings;
window.addAccessoryBundleEditor = addAccessoryBundleEditor;
window.removeAccessoryBundleEditor = removeAccessoryBundleEditor;
window.refreshAccessoryBundleSavings = refreshAccessoryBundleSavings;
