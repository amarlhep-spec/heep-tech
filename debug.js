// ===== ملف تصحيح الأخطاء =====

// تفعيل وضع التصحيح
const DEBUG_MODE = true;

// تسجيل الأخطاء
function logError(error, context = '') {
    if (DEBUG_MODE) {
        console.error(`[ERROR] ${context}:`, error);
        
        // عرض رسالة خطأ للمستخدم
        if (typeof showNotification === 'function') {
            showNotification(`حدث خطأ: ${context}`, 'error');
        }
    }
}

// التحقق من توفر الوظائف
function checkFunctions() {
    const requiredFunctions = ['db', 'loadSiteData', 'showNotification'];
    
    requiredFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'undefined') {
            console.warn(`[WARNING] الوظيفة ${funcName} غير موجودة`);
        }
    });
}

// التحقق من البيانات
function checkData() {
    try {
        // التحقق من localStorage
        if (!localStorage) {
            console.warn('[WARNING] localStorage غير مدعوم');
            return false;
        }
        
        // التحقق من وجود بيانات المنتجات
        const products = db.getProducts();
        if (!Array.isArray(products)) {
            console.warn('[WARNING] بيانات المنتجات غير صالحة');
            return false;
        }
        
        // التحقق من وجود الإعدادات
        const settings = db.getSiteSettings();
        if (!settings || typeof settings !== 'object') {
            console.warn('[WARNING] بيانات الإعدادات غير صالحة');
            return false;
        }
        
        console.log('[DEBUG] جميع البيانات صالحة');
        return true;
    } catch (error) {
        logError(error, 'checkData');
        return false;
    }
}

// إصلاح مشاكل localStorage
function fixLocalStorage() {
    try {
        // محاولة قراءة وكتابة بيانات تجريبية
        localStorage.setItem('__test__', 'test');
        const testValue = localStorage.getItem('__test__');
        localStorage.removeItem('__test__');
        
        if (testValue !== 'test') {
            console.warn('[WARNING] localStorage لا يعمل بشكل صحيح');
            return false;
        }
        
        console.log('[DEBUG] localStorage يعمل بشكل صحيح');
        return true;
    } catch (error) {
        console.error('[ERROR] localStorage معطّل:', error);
        return false;
    }
}

// إعادة تعيين البيانات
function resetData() {
    if (confirm('هل تريد إعادة تعيين جميع البيانات؟ سيتم حذف جميع المنتجات والطلبات والإعدادات.')) {
        localStorage.clear();
        alert('تم إعادة تعيين جميع البيانات. سيتم إعادة تحميل الصفحة.');
        location.reload();
    }
}

// اختبار جميع المكونات
function runTests() {
    console.log('[DEBUG] بدء اختبار المكونات...');
    
    const tests = [
        { name: 'localStorage', test: fixLocalStorage },
        { name: 'Database Functions', test: () => typeof db !== 'undefined' },
        { name: 'Site Data', test: checkData },
        { name: 'DOM Ready', test: () => document.readyState === 'complete' }
    ];
    
    tests.forEach(test => {
        try {
            const result = typeof test.test === 'function' ? test.test() : test.test;
            console.log(`[TEST] ${test.name}: ${result ? '✅ PASS' : '❌ FAIL'}`);
        } catch (error) {
            console.error(`[TEST] ${test.name}: ❌ ERROR -`, error);
        }
    });
    
    console.log('[DEBUG] اكتمال اختبار المكونات');
}

// تهيئة التصحيح
function initDebug() {
    if (DEBUG_MODE) {
        console.log('[DEBUG] تم تفعيل وضع التصحيح');
        
        // إضافة أزرار التصحيح في وضع التطوير
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            addDebugButtons();
        }
        
        // تشغيل الاختبارات تلقائياً
        setTimeout(runTests, 1000);
        
        // تسجيل الأخطاء العالمية
        window.addEventListener('error', function(event) {
            logError(event.error, 'Global Error');
        });
        
        // تسجيل رفض الوعود
        window.addEventListener('unhandledrejection', function(event) {
            logError(event.reason, 'Unhandled Promise Rejection');
        });
    }
}

// إضافة أزرار التصحيح
function addDebugButtons() {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        font-family: monospace;
        font-size: 12px;
    `;
    
    debugPanel.innerHTML = `
        <div style="margin-bottom: 5px;">🔧 وضع التصحيح</div>
        <button onclick="runTests()" style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; cursor: pointer;">
            اختبار
        </button>
        <button onclick="checkData()" style="background: #2ecc71; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; cursor: pointer;">
            بيانات
        </button>
        <button onclick="resetData()" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; cursor: pointer;">
            إعادة تعيين
        </button>
    `;
    
    document.body.appendChild(debugPanel);
}

// تصدير الوظائف
window.logError = logError;
window.checkFunctions = checkFunctions;
window.checkData = checkData;
window.fixLocalStorage = fixLocalStorage;
window.resetData = resetData;
window.runTests = runTests;

// التشغيل التلقائي
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initDebug();
        checkFunctions();
    });
}