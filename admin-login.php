<?php
declare(strict_types=1);

require_once __DIR__ . '/admin-auth.php';

admin_secure_session_start();
admin_send_security_headers();

if (admin_is_authenticated()) {
    header('Location: admin-panel.php');
    exit;
}

$errorMessage = '';
$lockedMessage = '';
$ipAddress = admin_get_client_ip();

if (admin_is_locked_out($ipAddress)) {
    $state = admin_get_attempt_state($ipAddress);
    $remaining = max(1, (int) ceil(((int) $state['locked_until'] - time()) / 60));
    $lockedMessage = "تم قفل تسجيل الدخول مؤقتا. حاول مجددا بعد {$remaining} دقيقة.";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$lockedMessage) {
    $csrfToken = $_POST['csrf_token'] ?? '';
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!admin_validate_csrf_token($csrfToken)) {
        $errorMessage = 'انتهت صلاحية الطلب. أعد تحميل الصفحة وحاول مرة أخرى.';
    } elseif ($username === '' || $password === '') {
        $errorMessage = 'يرجى إدخال اسم المستخدم وكلمة المرور.';
    } elseif (admin_verify_password($username, $password)) {
        admin_clear_failed_logins($ipAddress);
        admin_login($username);
        header('Location: admin-panel.php');
        exit;
    } else {
        admin_record_failed_login($ipAddress);
        $errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة.';

        if (admin_is_locked_out($ipAddress)) {
            $state = admin_get_attempt_state($ipAddress);
            $remaining = max(1, (int) ceil(((int) $state['locked_until'] - time()) / 60));
            $errorMessage = "تم قفل تسجيل الدخول مؤقتا بعد محاولات متعددة. حاول بعد {$remaining} دقيقة.";
        }
    }
}

$csrfToken = admin_issue_csrf_token();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - لوحة التحكم</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --border-radius: 8px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body.login-page {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .login-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            position: relative;
            overflow: hidden;
        }

        .login-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--secondary-color), var(--accent-color));
        }

        .login-logo {
            text-align: center;
            margin-bottom: 30px;
        }

        .login-logo h2,
        .login-title {
            color: var(--primary-color);
        }

        .login-title {
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-color);
        }

        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #eee;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 1rem;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            background: var(--secondary-color);
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            text-decoration: none;
        }

        .btn:hover {
            background: #2980b9;
        }

        .login-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }

        .login-footer a {
            color: var(--secondary-color);
            text-decoration: none;
        }

        .notification {
            padding: 15px;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
            text-align: center;
        }

        .notification.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .notification.info {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }

        .security-note {
            margin-top: 18px;
            font-size: 0.92rem;
            color: #6c757d;
            line-height: 1.7;
        }
    </style>
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-logo">
            <h2>لوحة التحكم</h2>
        </div>

        <h2 class="login-title">
            <i class="fas fa-user-shield"></i>
            تسجيل الدخول الآمن
        </h2>

        <?php if ($lockedMessage !== ''): ?>
            <div class="notification info"><?php echo htmlspecialchars($lockedMessage, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>

        <?php if ($errorMessage !== ''): ?>
            <div class="notification error"><?php echo htmlspecialchars($errorMessage, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>

        <form method="post" action="admin-login.php" autocomplete="off">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8'); ?>">

            <div class="form-group">
                <label for="username"><i class="fas fa-user"></i> اسم المستخدم:</label>
                <input type="text" id="username" name="username" required autocomplete="username" value="<?php echo isset($username) ? htmlspecialchars($username, ENT_QUOTES, 'UTF-8') : ''; ?>">
            </div>

            <div class="form-group">
                <label for="password"><i class="fas fa-lock"></i> كلمة المرور:</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>

            <button type="submit" class="btn" <?php echo $lockedMessage !== '' ? 'disabled' : ''; ?>>
                <i class="fas fa-sign-in-alt"></i>
                تسجيل الدخول
            </button>

            <p class="security-note">
                هذه الصفحة محمية بجلسات سيرفر آمنة، مع تقييد لمحاولات الدخول المتكررة وقفل مؤقت عند المحاولات الفاشلة.
            </p>

            <div class="login-footer">
                <a href="index.html"><i class="fas fa-arrow-right"></i> العودة إلى الموقع الرئيسي</a>
            </div>
        </form>
    </div>
</body>
</html>
