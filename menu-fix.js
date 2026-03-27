// إصلاح القائمة لجميع الصفحات
document.addEventListener('DOMContentLoaded', function() {
    // تأكد من أن ملف mobile-fix.css محمل
    if (!document.querySelector('link[href*="mobile-fix.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'mobile-fix.css';
        document.head.appendChild(link);
    }
    
    // إصلاح القائمة
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        // إنشاء الطبقة الخلفية
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }
        
        const menuList = navMenu.querySelector('ul');
        
        // حدث فتح/إغلاق القائمة
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (menuList) {
                menuList.classList.toggle('show');
                overlay.classList.toggle('show');
            }
        });
        
        // إغلاق بالنقر خارج القائمة
        overlay.addEventListener('click', function() {
            if (menuList) {
                menuList.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
        
        // إغلاق بالنقر على رابط
        if (menuList) {
            menuList.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    menuList.classList.remove('show');
                    overlay.classList.remove('show');
                });
            });
        }
        
        // إغلاق عند التمرير
        window.addEventListener('scroll', function() {
            if (menuList && menuList.classList.contains('show')) {
                menuList.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
    }
});