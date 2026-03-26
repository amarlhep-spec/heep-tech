<?php
declare(strict_types=1);

require_once __DIR__ . '/admin-auth.php';

admin_secure_session_start();
admin_send_security_headers();
admin_logout();

header('Location: admin-login.php');
exit;
