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
    <title>إدارة الطلبات - لوحة التحكم</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --light-color: #f8f9fa;
            --gray-color: #95a5a6;
            --border-radius: 10px;
            --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            --transition: all 0.3s ease;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Cairo', sans-serif;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }
        
        .admin-container {
            display: flex;
            min-height: 100vh;
        }
        
        /* ===== الشريط الجانبي ===== */
        .admin-sidebar {
            width: 250px;
            background: var(--primary-color);
            color: white;
            padding: 20px 0;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
        }
        
        .admin-logo {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .admin-logo img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-bottom: 10px;
        }
        
        .admin-logo h2 {
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .admin-menu {
            padding: 20px 0;
        }
        
        .admin-menu ul {
            list-style: none;
        }
        
        .admin-menu ul li {
            margin-bottom: 5px;
        }
        
        .admin-menu ul li a {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: var(--transition);
            border-right: 4px solid transparent;
        }
        
        .admin-menu ul li a:hover,
        .admin-menu ul li a.active {
            background: rgba(255,255,255,0.1);
            color: white;
            border-right-color: var(--secondary-color);
        }
        
        .admin-menu ul li a i {
            width: 20px;
            text-align: center;
        }
        
        /* ===== المحتوى الرئيسي ===== */
        .admin-main {
            flex: 1;
            margin-right: 250px;
            padding: 20px;
        }
        
        .admin-header {
            background: white;
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .admin-header h1 {
            color: var(--primary-color);
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .admin-actions {
            display: flex;
            gap: 15px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        
        .btn-primary {
            background: var(--secondary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background: #2980b9;
        }
        
        .btn-success {
            background: var(--success-color);
            color: white;
        }
        
        .btn-warning {
            background: var(--warning-color);
            color: white;
        }
        
        .btn-danger {
            background: var(--accent-color);
            color: white;
        }
        
        /* ===== بطاقات الإحصائيات ===== */
        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            display: flex;
            align-items: center;
            gap: 20px;
            transition: var(--transition);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .stat-new .stat-icon {
            background: rgba(52, 152, 219, 0.2);
            color: var(--secondary-color);
        }
        
        .stat-processing .stat-icon {
            background: rgba(243, 156, 18, 0.2);
            color: var(--warning-color);
        }
        
        .stat-completed .stat-icon {
            background: rgba(39, 174, 96, 0.2);
            color: var(--success-color);
        }
        
        .stat-cancelled .stat-icon {
            background: rgba(231, 76, 60, 0.2);
            color: var(--accent-color);
        }
        
        .stat-info h3 {
            font-size: 2rem;
            margin-bottom: 5px;
        }
        
        .stat-info p {
            color: var(--gray-color);
            font-size: 0.9rem;
        }
        
        /* ===== جدول الطلبات ===== */
        .orders-table {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            overflow: hidden;
        }
        
        .table-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .table-header h3 {
            color: var(--primary-color);
            font-size: 1.3rem;
        }
        
        .search-box {
            position: relative;
            width: 300px;
        }
        
        .search-box input {
            width: 100%;
            padding: 10px 15px 10px 40px;
            border: 2px solid #eee;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
        }
        
        .search-box i {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray-color);
        }
        
        .table-container {
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: #f8f9fa;
        }
        
        th {
            padding: 15px;
            text-align: right;
            color: var(--primary-color);
            font-weight: 600;
            border-bottom: 2px solid #eee;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        
        tbody tr:hover {
            background: #f8f9fa;
        }
        
        /* ===== حالة الطلب ===== */
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-new {
            background: rgba(52, 152, 219, 0.2);
            color: var(--secondary-color);
        }
        
        .status-processing {
            background: rgba(243, 156, 18, 0.2);
            color: var(--warning-color);
        }
        
        .status-completed {
            background: rgba(39, 174, 96, 0.2);
            color: var(--success-color);
        }
        
        .status-cancelled {
            background: rgba(231, 76, 60, 0.2);
            color: var(--accent-color);
        }
        
        .status-pending {
            background: rgba(149, 165, 166, 0.2);
            color: var(--gray-color);
        }
        
        /* ===== أزرار الإجراءات ===== */
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .action-btn {
            width: 35px;
            height: 35px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
        }
        
        .view-btn {
            background: rgba(52, 152, 219, 0.2);
            color: var(--secondary-color);
        }
        
        .view-btn:hover {
            background: var(--secondary-color);
            color: white;
        }
        
        .edit-btn {
            background: rgba(243, 156, 18, 0.2);
            color: var(--warning-color);
        }
        
        .edit-btn:hover {
            background: var(--warning-color);
            color: white;
        }
        
        .delete-btn {
            background: rgba(231, 76, 60, 0.2);
            color: var(--accent-color);
        }
        
        .delete-btn:hover {
            background: var(--accent-color);
            color: white;
        }
        
        /* ===== نموذج عرض الطلب ===== */
        .order-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .order-modal-content {
            background: white;
            border-radius: var(--border-radius);
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            color: var(--primary-color);
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .close-modal {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--gray-color);
            cursor: pointer;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .order-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .order-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: var(--border-radius);
        }
        
        .order-section h4 {
            color: var(--primary-color);
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            color: var(--gray-color);
        }
        
        .detail-value {
            color: var(--primary-color);
            font-weight: 600;
        }
        
        .order-items {
            margin-top: 20px;
        }
        
        .order-item {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        
        .order-item:last-child {
            border-bottom: none;
        }
        
        .item-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .item-image {
            width: 60px;
            height: 60px;
            border-radius: var(--border-radius);
            object-fit: cover;
        }
        
        .item-name {
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .receipt-preview {
            text-align: center;
            margin-top: 20px;
        }
        
        .receipt-preview img {
            max-width: 100%;
            max-height: 300px;
            border-radius: var(--border-radius);
            border: 1px solid #eee;
        }
        
        .receipt-pdf {
            padding: 20px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            text-align: center;
        }
        
        /* ===== التوافق مع الأجهزة المحمولة ===== */
        @media (max-width: 992px) {
            .admin-sidebar {
                width: 70px;
            }
            
            .admin-sidebar span {
                display: none;
            }
            
            .admin-main {
                margin-right: 70px;
            }
            
            .admin-logo h2 {
                display: none;
            }
            
            .order-details-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .stats-cards {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .table-header {
                flex-direction: column;
                gap: 15px;
            }
            
            .search-box {
                width: 100%;
            }
        }
        
        @media (max-width: 576px) {
            .stats-cards {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .admin-actions {
                flex-direction: column;
                width: 100%;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- الشريط الجانبي -->
        <aside class="admin-sidebar">
            <div class="admin-logo">
                <img src="images/logo.png" alt="شعار المتجر">
                <h2>لوحة التحكم</h2>
            </div>
            
            <nav class="admin-menu">
                <ul>
                    <li><a href="dashboard.html"><i class="fas fa-home"></i> <span>الرئيسية</span></a></li>
                    <li><a href="products-management.html"><i class="fas fa-box"></i> <span>المنتجات</span></a></li>
                    <li><a href="orders-management.html" class="active"><i class="fas fa-shopping-cart"></i> <span>الطلبات</span></a></li>
                    <li><a href="customers-management.html"><i class="fas fa-users"></i> <span>العملاء</span></a></li>
                    <li><a href="reports.html"><i class="fas fa-chart-bar"></i> <span>التقارير</span></a></li>
                    <li><a href="settings.html"><i class="fas fa-cog"></i> <span>الإعدادات</span></a></li>
                    <li><a href="home.html"><i class="fas fa-sign-out-alt"></i> <span>العودة للمتجر</span></a></li>
                </ul>
            </nav>
        </aside>
        
        <!-- المحتوى الرئيسي -->
        <main class="admin-main">
            <!-- الهيدر -->
            <header class="admin-header">
                <h1><i class="fas fa-shopping-cart"></i> إدارة الطلبات</h1>
                <div class="admin-actions">
                    <button class="btn btn-primary" onclick="refreshOrders()">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                    <button class="btn btn-success" onclick="exportOrders()">
                        <i class="fas fa-download"></i> تصدير
                    </button>
                </div>
            </header>
            
            <!-- بطاقات الإحصائيات -->
            <div class="stats-cards">
                <div class="stat-card stat-new">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="new-orders-count">0</h3>
                        <p>طلبات جديدة</p>
                    </div>
                </div>
                
                <div class="stat-card stat-processing">
                    <div class="stat-icon">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="processing-orders-count">0</h3>
                        <p>قيد المعالجة</p>
                    </div>
                </div>
                
                <div class="stat-card stat-completed">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="completed-orders-count">0</h3>
                        <p>مكتملة</p>
                    </div>
                </div>
                
                <div class="stat-card stat-cancelled">
                    <div class="stat-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="cancelled-orders-count">0</h3>
                        <p>ملغية</p>
                    </div>
                </div>
            </div>
            
            <!-- جدول الطلبات -->
            <div class="orders-table">
                <div class="table-header">
                    <h3>جميع الطلبات</h3>
                    <div class="search-box">
                        <input type="text" id="order-search" placeholder="ابحث في الطلبات..." onkeyup="searchOrders()">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <div class="table-container">
                    <table id="orders-table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>التاريخ</th>
                                <th>المبلغ</th>
                                <th>طريقة الدفع</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body">
                            <!-- سيتم تعبئتها بالجافاسكريبت -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    
    <!-- نموذج عرض تفاصيل الطلب -->
    <div id="order-detail-modal" class="order-modal" style="display: none;">
        <div class="order-modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-file-invoice"></i> تفاصيل الطلب</h3>
                <button class="close-modal" onclick="closeOrderModal()">×</button>
            </div>
            <div class="modal-body" id="order-detail-content">
                <!-- سيتم تعبئتها بالجافاسكريبت -->
            </div>
        </div>
    </div>
    
    <!-- نموذج تغيير حالة الطلب -->
    <div id="status-modal" class="order-modal" style="display: none;">
        <div class="order-modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> تغيير حالة الطلب</h3>
                <button class="close-modal" onclick="closeStatusModal()">×</button>
            </div>
            <div class="modal-body">
                <div id="status-modal-content">
                    <!-- سيتم تعبئتها بالجافاسكريبت -->
                </div>
            </div>
        </div>
    </div>
    
    <script src="database.js"></script>
    <script>
        // تحميل الطلبات عند بدء التشغيل
        document.addEventListener('DOMContentLoaded', function() {
            loadOrders();
        });
        
        // تحميل الطلبات
        function loadOrders() {
            const orders = db.getOrders ? db.getOrders() : [];
            
            // تحديث الإحصائيات
            updateOrderStats(orders);
            
            // عرض الطلبات في الجدول
            displayOrders(orders);
        }
        
        // تحديث إحصائيات الطلبات
        function updateOrderStats(orders) {
            const newOrders = orders.filter(order => order.status === 'قيد المراجعة' || order.status === 'جديد').length;
            const processingOrders = orders.filter(order => order.status === 'قيد المعالجة' || order.status === 'قيد التجهيز').length;
            const completedOrders = orders.filter(order => order.status === 'مكتمل' || order.status === 'تم التوصيل').length;
            const cancelledOrders = orders.filter(order => order.status === 'ملغي' || order.status === 'مرفوض').length;
            
            document.getElementById('new-orders-count').textContent = newOrders;
            document.getElementById('processing-orders-count').textContent = processingOrders;
            document.getElementById('completed-orders-count').textContent = completedOrders;
            document.getElementById('cancelled-orders-count').textContent = cancelledOrders;
        }
        
        // عرض الطلبات في الجدول
        function displayOrders(orders) {
            const tbody = document.getElementById('orders-table-body');
            if (!tbody) return;
            
            if (orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray-color);">
                            <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
                            <p>لا توجد طلبات حتى الآن</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // ترتيب الطلبات من الأحدث إلى الأقدم
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td><strong>${order.id}</strong></td>
                    <td>
                        <div>${order.customerName}</div>
                        <small style="color: var(--gray-color);">${order.customerPhone}</small>
                    </td>
                    <td>${order.orderDate || new Date(order.date).toLocaleDateString('ar-SA')}</td>
                    <td><strong>$${order.total.toFixed(2)}</strong></td>
                    <td>${order.paymentMethod || 'الشام كاش'}</td>
                    <td>
                        <span class="status-badge ${getStatusClass(order.status)}">
                            ${order.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewOrder('${order.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="changeOrderStatus('${order.id}')" title="تغيير الحالة">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteOrder('${order.id}')" title="حذف الطلب">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        // الحصول على كلاس الحالة
        function getStatusClass(status) {
            switch(status) {
                case 'جديد':
                case 'قيد المراجعة':
                    return 'status-new';
                case 'قيد المعالجة':
                case 'قيد التجهيز':
                    return 'status-processing';
                case 'مكتمل':
                case 'تم التوصيل':
                    return 'status-completed';
                case 'ملغي':
                case 'مرفوض':
                    return 'status-cancelled';
                default:
                    return 'status-pending';
            }
        }
        
        // البحث في الطلبات
        function searchOrders() {
            const searchTerm = document.getElementById('order-search').value.toLowerCase();
            const orders = db.getOrders ? db.getOrders() : [];
            
            if (!searchTerm) {
                displayOrders(orders);
                return;
            }
            
            const filteredOrders = orders.filter(order => 
                order.id.toLowerCase().includes(searchTerm) ||
                order.customerName.toLowerCase().includes(searchTerm) ||
                order.customerPhone.includes(searchTerm) ||
                order.status.toLowerCase().includes(searchTerm)
            );
            
            displayOrders(filteredOrders);
        }
        
        // عرض تفاصيل الطلب
        function viewOrder(orderId) {
            const orders = db.getOrders ? db.getOrders() : [];
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                alert('الطلب غير موجود');
                return;
            }
            
            const modalContent = document.getElementById('order-detail-content');
            const modal = document.getElementById('order-detail-modal');
            
            let receiptHtml = '';
            if (order.receiptFile) {
                if (order.receiptFileName && order.receiptFileName.toLowerCase().endsWith('.pdf')) {
                    receiptHtml = `
                        <div class="receipt-section">
                            <h4><i class="fas fa-receipt"></i> إشعار الدفع</h4>
                            <div class="receipt-pdf">
                                <i class="fas fa-file-pdf" style="font-size: 3rem; color: #e74c3c; margin-bottom: 10px;"></i>
                                <p>${order.receiptFileName}</p>
                                <a href="${order.receiptFile}" download="${order.receiptFileName}" class="btn btn-primary" style="margin-top: 15px;">
                                    <i class="fas fa-download"></i> تحميل الإشعار
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    receiptHtml = `
                        <div class="receipt-section">
                            <h4><i class="fas fa-receipt"></i> إشعار الدفع</h4>
                            <div class="receipt-preview">
                                <img src="${order.receiptFile}" alt="إشعار الدفع">
                                <a href="${order.receiptFile}" download="receipt_${order.id}.jpg" class="btn btn-primary" style="margin-top: 15px;">
                                    <i class="fas fa-download"></i> تحميل الصورة
                                </a>
                            </div>
                        </div>
                    `;
                }
            }
            
            modalContent.innerHTML = `
                <div class="order-details-grid">
                    <div class="order-section">
                        <h4><i class="fas fa-info-circle"></i> معلومات الطلب</h4>
                        <div class="detail-item">
                            <span class="detail-label">رقم الطلب:</span>
                            <span class="detail-value">${order.id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">تاريخ الطلب:</span>
                            <span class="detail-value">${order.orderDate || new Date(order.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">طريقة الدفع:</span>
                            <span class="detail-value">${order.paymentMethod || 'الشام كاش'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">الحالة:</span>
                            <span class="detail-value">
                                <span class="status-badge ${getStatusClass(order.status)}">
                                    ${order.status}
                                </span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="order-section">
                        <h4><i class="fas fa-user"></i> معلومات العميل</h4>
                        <div class="detail-item">
                            <span class="detail-label">الاسم:</span>
                            <span class="detail-value">${order.customerName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">رقم الهاتف:</span>
                            <span class="detail-value">${order.customerPhone}</span>
                        </div>
                    </div>
                    
                    <div class="order-section">
                        <h4><i class="fas fa-money-bill-wave"></i> المبلغ</h4>
                        <div class="detail-item">
                            <span class="detail-label">المجموع الفرعي:</span>
                            <span class="detail-value">$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">رسوم الشحن:</span>
                            <span class="detail-value">$${order.shipping.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">الإجمالي:</span>
                            <span class="detail-value" style="color: var(--success-color); font-size: 1.2rem;">$${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                ${receiptHtml}
                
                <div class="order-section" style="margin-top: 20px;">
                    <h4><i class="fas fa-box"></i> المنتجات</h4>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-info">
                                    <div>
                                        <div class="item-name">${item.name}</div>
                                        <div style="color: var(--gray-color); font-size: 0.9rem;">الكمية: ${item.quantity}</div>
                                    </div>
                                </div>
                                <div style="font-weight: bold;">$${item.total.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button onclick="changeOrderStatus('${order.id}')" class="btn btn-warning" style="flex: 1;">
                        <i class="fas fa-edit"></i> تغيير الحالة
                    </button>
                    <button onclick="printOrder('${order.id}')" class="btn btn-primary" style="flex: 1;">
                        <i class="fas fa-print"></i> طباعة الطلب
                    </button>
                    <button onclick="closeOrderModal()" class="btn" style="flex: 1; background: #f8f9fa; color: var(--primary-color);">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
        
        // إغلاق نموذج تفاصيل الطلب
        function closeOrderModal() {
            document.getElementById('order-detail-modal').style.display = 'none';
        }
        
        // تغيير حالة الطلب
        function changeOrderStatus(orderId) {
            const orders = db.getOrders ? db.getOrders() : [];
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                alert('الطلب غير موجود');
                return;
            }
            
            const modalContent = document.getElementById('status-modal-content');
            const modal = document.getElementById('status-modal');
            
            modalContent.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <p style="color: var(--gray-color); margin-bottom: 15px;">تغيير حالة الطلب: <strong>${order.id}</strong></p>
                    <p style="color: var(--gray-color); margin-bottom: 15px;">العميل: <strong>${order.customerName}</strong></p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 10px; color: var(--primary-color); font-weight: 600;">
                        <i class="fas fa-tag"></i> الحالة الجديدة
                    </label>
                    <select id="new-status" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: var(--border-radius); font-family: 'Cairo', sans-serif;">
                        <option value="قيد المراجعة" ${order.status === 'قيد المراجعة' ? 'selected' : ''}>قيد المراجعة</option>
                        <option value="قيد المعالجة" ${order.status === 'قيد المعالجة' ? 'selected' : ''}>قيد المعالجة</option>
                        <option value="قيد التجهيز" ${order.status === 'قيد التجهيز' ? 'selected' : ''}>قيد التجهيز</option>
                        <option value="قيد التوصيل" ${order.status === 'قيد التوصيل' ? 'selected' : ''}>قيد التوصيل</option>
                        <option value="تم التوصيل" ${order.status === 'تم التوصيل' ? 'selected' : ''}>تم التوصيل</option>
                        <option value="ملغي" ${order.status === 'ملغي' ? 'selected' : ''}>ملغي</option>
                        <option value="مرفوض" ${order.status === 'مرفوض' ? 'selected' : ''}>مرفوض</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 10px; color: var(--primary-color); font-weight: 600;">
                        <i class="fas fa-comment"></i> ملاحظات (اختياري)
                    </label>
                    <textarea id="status-notes" style="width: 100%; padding: 12px; border: 2px solid #eee; border-radius: var(--border-radius); font-family: 'Cairo', sans-serif; min-height: 100px;" placeholder="أضف ملاحظات عن حالة الطلب..."></textarea>
                </div>
                
                <div style="display: flex; gap: 15px;">
                    <button onclick="updateOrderStatus('${order.id}')" class="btn btn-success" style="flex: 1;">
                        <i class="fas fa-save"></i> حفظ التغييرات
                    </button>
                    <button onclick="closeStatusModal()" class="btn" style="flex: 1; background: #f8f9fa; color: var(--primary-color);">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
        
        // تحديث حالة الطلب
        function updateOrderStatus(orderId) {
            const newStatus = document.getElementById('new-status').value;
            const notes = document.getElementById('status-notes').value;
            
            if (db.updateOrderStatus) {
                if (db.updateOrderStatus(orderId, newStatus, notes)) {
                    showNotification(`تم تغيير حالة الطلب ${orderId} إلى "${newStatus}"`, 'success');
                    closeStatusModal();
                    loadOrders();
                } else {
                    showNotification('حدث خطأ في تحديث حالة الطلب', 'error');
                }
            } else {
                // دالة وهمية للتجربة
                showNotification(`تم تغيير حالة الطلب ${orderId} إلى "${newStatus}" (وهمي)`, 'success');
                closeStatusModal();
                loadOrders();
            }
        }
        
        // إغلاق نموذج تغيير الحالة
        function closeStatusModal() {
            document.getElementById('status-modal').style.display = 'none';
        }
        
        // حذف طلب
        function deleteOrder(orderId) {
            if (confirm(`هل أنت متأكد من حذف الطلب ${orderId}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                if (db.deleteOrder) {
                    if (db.deleteOrder(orderId)) {
                        showNotification(`تم حذف الطلب ${orderId}`, 'success');
                        loadOrders();
                    } else {
                        showNotification('حدث خطأ في حذف الطلب', 'error');
                    }
                } else {
                    // دالة وهمية للتجربة
                    showNotification(`تم حذف الطلب ${orderId} (وهمي)`, 'success');
                    loadOrders();
                }
            }
        }
        
        // طباعة الطلب
        function printOrder(orderId) {
            const orders = db.getOrders ? db.getOrders() : [];
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                alert('الطلب غير موجود');
                return;
            }
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html dir="rtl">
                <head>
                    <title>طباعة الطلب ${order.id}</title>
                    <style>
                        body {
                            font-family: 'Cairo', Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #333;
                            padding-bottom: 20px;
                        }
                        .order-info {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        .section {
                            margin-bottom: 20px;
                        }
                        .section h3 {
                            background: #f8f9fa;
                            padding: 10px;
                            border-right: 4px solid #3498db;
                        }
                        .detail-item {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            border-bottom: 1px solid #eee;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        th, td {
                            padding: 10px;
                            text-align: right;
                            border: 1px solid #ddd;
                        }
                        th {
                            background: #f8f9fa;
                        }
                        .total {
                            text-align: left;
                            margin-top: 20px;
                            font-size: 1.2rem;
                            font-weight: bold;
                            color: #27ae60;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #666;
                            font-size: 0.9rem;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>فاتورة طلب</h1>
                        <h2>${order.id}</h2>
                    </div>
                    
                    <div class="order-info">
                        <div>
                            <h3>معلومات الطلب</h3>
                            <div class="detail-item">
                                <span>رقم الطلب:</span>
                                <span>${order.id}</span>
                            </div>
                            <div class="detail-item">
                                <span>تاريخ الطلب:</span>
                                <span>${order.orderDate || new Date(order.date).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div class="detail-item">
                                <span>طريقة الدفع:</span>
                                <span>${order.paymentMethod || 'الشام كاش'}</span>
                            </div>
                            <div class="detail-item">
                                <span>الحالة:</span>
                                <span>${order.status}</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3>معلومات العميل</h3>
                            <div class="detail-item">
                                <span>الاسم:</span>
                                <span>${order.customerName}</span>
                            </div>
                            <div class="detail-item">
                                <span>رقم الهاتف:</span>
                                <span>${order.customerPhone}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h3>المنتجات</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية</th>
                                    <th>السعر</th>
                                    <th>الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>$${item.total.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="text-align: left;">
                        <div class="detail-item">
                            <span>المجموع الفرعي:</span>
                            <span>$${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span>رسوم الشحن:</span>
                            <span>$${order.shipping.toFixed(2)}</span>
                        </div>
                        <div class="detail-item" style="font-size: 1.2rem; font-weight: bold; color: #27ae60;">
                            <span>الإجمالي النهائي:</span>
                            <span>$${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>شكراً لتعاملكم مع متجر الإلكترونيات</p>
                        <p>رقم الهاتف: +963 123 456 789 | البريد الإلكتروني: info@store.com</p>
                        <p>تم الطباعة في: ${new Date().toLocaleString('ar-SA')}</p>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        }
                    <\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
        
        // تصدير الطلبات
        function exportOrders() {
            const orders = db.getOrders ? db.getOrders() : [];
            
            if (orders.length === 0) {
                showNotification('لا توجد طلبات لتصديرها', 'warning');
                return;
            }
            
            // تحويل الطلبات إلى CSV
            let csv = 'رقم الطلب,العميل,الهاتف,التاريخ,المبلغ,طريقة الدفع,الحالة\n';
            
            orders.forEach(order => {
                csv += `"${order.id}","${order.customerName}","${order.customerPhone}","${order.orderDate || new Date(order.date).toLocaleDateString('ar-SA')}","$${order.total.toFixed(2)}","${order.paymentMethod || 'الشام كاش'}","${order.status}"\n`;
            });
            
            // إنشاء ملف وتنزيله
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification(`تم تصدير ${orders.length} طلب`, 'success');
        }
        
        // تحديث الطلبات
        function refreshOrders() {
            loadOrders();
            showNotification('تم تحديث قائمة الطلبات', 'success');
        }
        
        // إظهار الإشعارات
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#e74c3c'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            
            notification.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // إغلاق النماذج عند النقر خارجها
        document.addEventListener('click', function(event) {
            const orderModal = document.getElementById('order-detail-modal');
            const statusModal = document.getElementById('status-modal');
            
            if (orderModal.style.display === 'flex' && event.target === orderModal) {
                closeOrderModal();
            }
            
            if (statusModal.style.display === 'flex' && event.target === statusModal) {
                closeStatusModal();
            }
        });
    </script>
</body>
</html>
