<?php
declare(strict_types=1);
require_once __DIR__ . '/admin-auth.php';
admin_require_auth();
admin_send_security_headers();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - إدارة المتجر</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* أنماط لوحة التحكم */
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --danger-color: #e74c3c;
            --light-color: #f8f9fa;
            --gray-color: #95a5a6;
            --border-radius: 8px;
            --box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            --transition: all 0.3s ease;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body.dashboard {
            font-family: 'Cairo', sans-serif;
            background: var(--light-color);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            overflow-x: hidden;
        }
        
        /* الشريط الجانبي */
        .dashboard-sidebar {
            width: 280px;
            background: linear-gradient(135deg, var(--primary-color) 0%, #1a252f 100%);
            color: white;
            position: fixed;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
            box-shadow: 3px 0 20px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        
        .dashboard-logo {
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .dashboard-logo img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 3px solid var(--secondary-color);
            padding: 3px;
            margin-bottom: 15px;
            object-fit: cover;
            background: #f0f0f0;
        }
        
        .dashboard-logo h3 {
            color: white;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .dashboard-menu {
            flex: 1;
            overflow-y: auto;
            padding: 20px 0;
        }
        
        .dashboard-menu ul {
            list-style: none;
        }
        
        .dashboard-menu ul li {
            margin-bottom: 5px;
        }
        
        .dashboard-menu ul li a {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 18px 25px;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: var(--transition);
            border-right: 4px solid transparent;
            font-size: 1.05rem;
        }
        
        .dashboard-menu ul li a:hover {
            background: rgba(255,255,255,0.1);
            color: white;
            border-right-color: var(--secondary-color);
            padding-right: 30px;
        }
        
        .dashboard-menu ul li a.active {
            background: rgba(255,255,255,0.15);
            color: white;
            border-right-color: var(--secondary-color);
        }
        
        .dashboard-menu ul li a i {
            font-size: 1.2rem;
            width: 24px;
            text-align: center;
        }
        
        /* المحتوى الرئيسي */
        .dashboard-content {
            flex: 1;
            margin-right: 280px;
            padding: 30px;
            min-height: 100vh;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .dashboard-header {
            background: white;
            padding: 25px 30px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideDown 0.4s ease;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .dashboard-header h2 {
            color: var(--primary-color);
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        #sidebar-toggle {
            display: none;
            background: var(--secondary-color);
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            transition: var(--transition);
        }
        
        #sidebar-toggle:hover {
            transform: rotate(90deg);
            background: #2980b9;
        }
        
        /* الإحصائيات */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: white;
            padding: 30px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            text-align: center;
            border-top: 4px solid var(--secondary-color);
            transition: var(--transition);
        }
        
        .stat-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 3rem;
            color: var(--secondary-color);
            margin-bottom: 20px;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            color: var(--primary-color);
            margin: 15px 0;
        }
        
        .stat-label {
            color: var(--gray-color);
            font-size: 1.1rem;
        }
        
        /* الأقسام */
        .dashboard-section {
            background: white;
            padding: 35px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            margin-bottom: 30px;
            animation: fadeInUp 0.6s ease;
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .dashboard-section h3 {
            color: var(--primary-color);
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 1.5rem;
        }
        
        /* النماذج */
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 25px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .form-control {
            width: 100%;
            padding: 15px;
            border: 2px solid #eee;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 1rem;
            transition: var(--transition);
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }
        
        textarea.form-control {
            min-height: 120px;
            resize: vertical;
        }
        
        /* أزرار رفع الملفات */
        .file-upload-area {
            border: 2px dashed var(--secondary-color);
            border-radius: var(--border-radius);
            padding: 30px;
            text-align: center;
            cursor: pointer;
            margin-top: 10px;
            background: #f8f9fa;
            transition: var(--transition);
        }
        
        .file-upload-area:hover {
            background: #e8f4fd;
            border-color: var(--accent-color);
        }
        
        .file-upload-area i {
            font-size: 2.5rem;
            color: var(--secondary-color);
            margin-bottom: 15px;
        }
        
        .image-preview-container {
            margin-top: 20px;
            text-align: center;
        }
        
        .image-preview {
            max-width: 200px;
            max-height: 200px;
            border-radius: 10px;
            border: 3px solid #f0f0f0;
            padding: 5px;
            background: white;
            display: none;
            margin: 10px auto;
        }
        
        .file-info {
            display: none;
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        /* الأزرار */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 28px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 1.05rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .btn-primary {
            background: var(--secondary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: #2980b9;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(52, 152, 219, 0.3);
        }
        
        .btn-info {
            background: #17a2b8;
            color: white;
        }
        
        .btn-info:hover {
            background: #138496;
        }
        
        .btn-danger {
            background: var(--danger-color);
            color: white;
        }
        
        .btn-danger:hover {
            background: #c0392b;
        }
        
        .btn-sm {
            padding: 8px 16px;
            font-size: 0.9rem;
        }
        
        .mt-2 {
            margin-top: 10px;
        }
        
        .mt-3 {
            margin-top: 15px;
        }
        
        /* التوافق مع الأجهزة المحمولة */
        @media (max-width: 992px) {
            .dashboard-sidebar {
                transform: translateX(100%);
            }
            
            .dashboard-sidebar.show {
                transform: translateX(0);
            }
            
            .dashboard-content {
                margin-right: 0;
                padding: 20px;
            }
            
            #sidebar-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        
        @media (max-width: 768px) {
            .dashboard-header {
                flex-direction: column;
                gap: 20px;
                align-items: flex-start;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                grid-template-columns: 1fr;
            }
        }
        
        /* إشعارات */
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDown 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .notification.success {
            background: var(--success-color);
        }
        
        .notification.error {
            background: var(--danger-color);
        }
        
        .notification.info {
            background: var(--secondary-color);
        }
    </style>
</head>
<body class="dashboard">
    <!-- الشريط الجانبي -->
    <aside class="dashboard-sidebar" id="dashboard-sidebar">
        <div class="dashboard-logo">
            <img id="dashboard-logo" src="" alt="شعار المتجر">
            <h3 id="dashboard-title">لوحة التحكم</h3>
        </div>
        
        <nav class="dashboard-menu">
            <ul>
                <li><a href="#dashboard" class="active" onclick="switchTab('dashboard')">
                    <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                </a></li>
                <li><a href="#products" onclick="switchTab('products')">
                    <i class="fas fa-box"></i> إدارة المنتجات
                </a></li>
                <li><a href="#orders" onclick="switchTab('orders')">
                    <i class="fas fa-shopping-bag"></i> إدارة الطلبات
                </a></li>
                <li><a href="#messages" onclick="switchTab('messages')">
                    <i class="fas fa-envelope"></i> رسائل الاتصال
                </a></li>
                <li><a href="#settings" onclick="switchTab('settings')">
                    <i class="fas fa-cog"></i> إعدادات الموقع
                </a></li>
                <li><a href="#main-image" onclick="switchTab('main-image')">
                    <i class="fas fa-image"></i> الصورة الرئيسية
                </a></li>
                <li><a href="#why-choose" onclick="switchTab('why-choose')">
                    <i class="fas fa-question-circle"></i> لماذا تختارنا
                </a></li>
                <li><a href="#footer" onclick="switchTab('footer')">
                    <i class="fas fa-shoe-prints"></i> إعدادات الفوتر
                </a></li>
                <li><a href="#social" onclick="switchTab('social')">
                    <i class="fas fa-share-alt"></i> وسائل التواصل
                </a></li>
                <li><a href="#barcode" onclick="switchTab('barcode')">
                    <i class="fas fa-qrcode"></i> باركود الدفع
                </a></li>
                <li><a href="#shipping" onclick="switchTab('shipping')">
                    <i class="fas fa-truck"></i> ملاحظة الشحن
                </a></li>
                <li><a href="javascript:void(0)" onclick="logout()" style="color: #e74c3c;">
                    <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
                </a></li>
            </ul>
        </nav>
    </aside>
    
    <!-- المحتوى الرئيسي -->
    <main class="dashboard-content">
        <header class="dashboard-header">
            <h2 id="dashboard-title-main">
                <i class="fas fa-tachometer-alt"></i> لوحة التحكم
            </h2>
            <button class="btn btn-outline" id="sidebar-toggle" onclick="toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
        </header>
        
        <!-- الإحصائيات -->
        <div id="dashboard" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-number" id="total-products">0</div>
                    <div class="stat-label">إجمالي المنتجات</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-number" id="total-orders">0</div>
                    <div class="stat-label">إجمالي الطلبات</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="stat-number" id="featured-products">0</div>
                    <div class="stat-label">منتجات مميزة</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-fire"></i>
                    </div>
                    <div class="stat-number" id="special-offers">0</div>
                    <div class="stat-label">عروض خاصة</div>
                </div>
            </div>
            
            <div class="dashboard-section">
                <h3><i class="fas fa-chart-line"></i> نظرة عامة</h3>
                <p>مرحباً بك في لوحة تحكم متجر الإلكترونيات.</p>
                <div class="quick-actions" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px;">
                    <button class="btn btn-primary" onclick="switchTab('products')">
                        <i class="fas fa-plus"></i> إضافة منتج جديد
                    </button>
                    <button class="btn btn-outline" onclick="switchTab('orders')">
                        <i class="fas fa-eye"></i> عرض الطلبات
                    </button>
                    <a href="index.html" target="_blank" class="btn btn-info">
                        <i class="fas fa-external-link-alt"></i> زيارة الموقع
                    </a>
                </div>
            </div>
        </div>
        
        <!-- إعدادات الموقع -->
        <div id="settings" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-cog"></i> إعدادات الموقع العامة</h3>
                
                <div class="form-group">
                    <label><i class="fas fa-store"></i> اسم الموقع:</label>
                    <input type="text" id="site-name" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-image"></i> شعار الموقع:</label>
                    <div class="file-upload-area" onclick="document.getElementById('logo-upload').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>انقر لرفع شعار الموقع</p>
                        <small>JPG, PNG, GIF (الحد الأقصى: 5MB)</small>
                    </div>
                    <input type="file" id="logo-upload" accept="image/*" style="display: none;" onchange="handleLogoUpload(event)">
                    <input type="hidden" id="site-logo" value="">
                    
                    <div class="image-preview-container">
                        <img id="logo-preview" src="" alt="معاينة الشعار" class="image-preview">
                        <div id="logo-file-info" class="file-info">
                            <p id="logo-filename"></p>
                            <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeLogoFile()">
                                <i class="fas fa-trash"></i> إزالة الصورة
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>أو أدخل رابط خارجي:</label>
                    <input type="text" id="logo-external-url" class="form-control" placeholder="https://example.com/logo.png">
                </div>
                
                <button type="button" class="btn btn-primary" onclick="saveSiteSettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
                
                <button type="button" class="btn btn-info mt-3" onclick="testSave()">
                    <i class="fas fa-vial"></i> اختبار الحفظ
                </button>
            </div>
        </div>
        
        <!-- الصورة الرئيسية -->
        <div id="main-image" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-image"></i> إدارة الصورة الرئيسية للموقع</h3>
                
                <div class="form-group">
                    <label><i class="fas fa-upload"></i> رفع صورة رئيسية:</label>
                    <div class="file-upload-area" onclick="document.getElementById('main-image-file-input').click()">
                        <i class="fas fa-image"></i>
                        <p>انقر لرفع صورة رئيسية للموقع</p>
                        <small>يفضل صورة بأبعاد 1200x600 بكسل (الحجم الأقصى: 5MB)</small>
                    </div>
                    <input type="file" id="main-image-file-input" accept="image/*" style="display: none;" onchange="handleMainImageUpload(event)">
                    <input type="hidden" id="main-image-url" value="">
                </div>
                
                <div class="form-group">
                    <label>أو أدخل رابط خارجي:</label>
                    <input type="text" id="main-image-external-url" class="form-control" placeholder="https://example.com/main-banner.jpg">
                </div>
                
                <div class="image-preview-container">
                    <img id="main-image-preview" src="" alt="معاينة الصورة الرئيسية" class="image-preview">
                    <div id="main-image-file-info" class="file-info">
                        <p id="main-image-filename"></p>
                        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeMainImageFile()">
                            <i class="fas fa-trash"></i> إزالة الصورة
                        </button>
                    </div>
                </div>
                
                <button type="button" class="btn btn-primary" onclick="saveMainImage()">
                    <i class="fas fa-save"></i> حفظ الصورة الرئيسية
                </button>
            </div>
        </div>
        
        <!-- باركود الدفع -->
        <div id="barcode" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-qrcode"></i> إدارة باركود الدفع</h3>
                
                <div class="form-group">
                    <label><i class="fas fa-upload"></i> رفع صورة الباركود:</label>
                    <div class="file-upload-area" onclick="document.getElementById('barcode-file-input').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>انقر لرفع صورة الباركود</p>
                        <small>JPG, PNG, GIF (الحجم الأقصى: 5MB)</small>
                    </div>
                    <input type="file" id="barcode-file-input" accept="image/*" style="display: none;" onchange="handleBarcodeUpload(event)">
                    <input type="hidden" id="barcode-url" value="">
                </div>
                
                <div class="form-group">
                    <label>أو أدخل رابط خارجي:</label>
                    <input type="text" id="barcode-external-url" class="form-control" placeholder="https://example.com/barcode.jpg">
                </div>
                
                <div class="image-preview-container">
                    <img id="barcode-preview" src="" alt="معاينة الباركود" class="image-preview">
                    <div id="barcode-file-info" class="file-info">
                        <p id="barcode-filename"></p>
                        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeBarcodeFile()">
                            <i class="fas fa-trash"></i> إزالة الصورة
                        </button>
                    </div>
                </div>
                
                <button type="button" class="btn btn-primary" onclick="saveBarcode()">
                    <i class="fas fa-save"></i> حفظ الباركود
                </button>
            </div>
        </div>
        
        <!-- باقي الأقسام -->
        <div id="products" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-box"></i> إدارة المنتجات</h3>
                <p>سيتم تحميل المنتجات...</p>
            </div>
        </div>
        
        <div id="orders" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-shopping-bag"></i> إدارة الطلبات</h3>
                <p>سيتم تحميل الطلبات...</p>
            </div>
        </div>
        
        <div id="messages" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-envelope"></i> إدارة رسائل الاتصال</h3>
                <p>سيتم تحميل الرسائل...</p>
            </div>
        </div>
        
        <div id="why-choose" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-question-circle"></i> لماذا تختارنا</h3>
                <textarea id="why-choose-text" class="form-control" rows="6"></textarea>
                <button type="button" class="btn btn-primary mt-3" onclick="saveWhyChooseText()">
                    <i class="fas fa-save"></i> حفظ النص
                </button>
            </div>
        </div>
        
        <div id="footer" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-shoe-prints"></i> إعدادات الفوتر</h3>
                <textarea id="footer-text" class="form-control" rows="3"></textarea>
                <button type="button" class="btn btn-primary mt-3" onclick="saveFooterSettings()">
                    <i class="fas fa-save"></i> حفظ الإعدادات
                </button>
            </div>
        </div>
        
        <div id="social" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-share-alt"></i> وسائل التواصل الاجتماعي</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fab fa-facebook"></i> فيسبوك:</label>
                        <input type="text" id="social-facebook" class="form-control">
                    </div>
                    <div class="form-group">
                        <label><i class="fab fa-instagram"></i> إنستغرام:</label>
                        <input type="text" id="social-instagram" class="form-control">
                    </div>
                </div>
                <button type="button" class="btn btn-primary" onclick="saveSocialMedia()">
                    <i class="fas fa-save"></i> حفظ وسائل التواصل
                </button>
            </div>
        </div>
        
        <div id="shipping" class="tab-content">
            <div class="dashboard-section">
                <h3><i class="fas fa-truck"></i> ملاحظة الشحن</h3>
                <textarea id="shipping-note" class="form-control" rows="4"></textarea>
                <button type="button" class="btn btn-primary mt-3" onclick="saveShippingNote()">
                    <i class="fas fa-save"></i> حفظ ملاحظة الشحن
                </button>
            </div>
        </div>
    </main>

    <!-- الروابط -->
    <script src="database.js"></script>
    <script src="admin-panel.js"></script>
</body>
</html>
