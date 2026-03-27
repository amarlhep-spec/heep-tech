<?php
declare(strict_types=1);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_SALT = '1ca97169e4d5cfffeabb876abe66a5e8';
const ADMIN_PASSWORD_HASH = '8e115f357cf12d53f880255d7c85dd3a7d43bc8f8a2019b98e8845258a7c850c';
const ADMIN_PASSWORD_ITERATIONS = 210000;
const ADMIN_SESSION_TIMEOUT = 1800;
const ADMIN_MAX_LOGIN_ATTEMPTS = 5;
const ADMIN_LOGIN_WINDOW = 900;
const ADMIN_LOCKOUT_DURATION = 900;

function admin_send_security_headers(): void
{
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}

function admin_storage_path(string $fileName): string
{
    $baseDir = __DIR__ . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'security';
    if (!is_dir($baseDir)) {
        mkdir($baseDir, 0755, true);
    }

    return $baseDir . DIRECTORY_SEPARATOR . $fileName;
}

function admin_secure_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    session_name('HEEP_ADMIN_SESSION');
    session_start();

    if (!isset($_SESSION['initiated_at'])) {
        session_regenerate_id(true);
        $_SESSION['initiated_at'] = time();
    }

    if (isset($_SESSION['last_activity']) && (time() - (int) $_SESSION['last_activity']) > ADMIN_SESSION_TIMEOUT) {
        admin_logout();
        session_start();
    }

    $_SESSION['last_activity'] = time();
}

function admin_get_client_ip(): string
{
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];

    foreach ($keys as $key) {
        if (empty($_SERVER[$key])) {
            continue;
        }

        $value = explode(',', (string) $_SERVER[$key])[0];
        $ip = trim($value);
        if ($ip !== '') {
            return $ip;
        }
    }

    return 'unknown';
}

function admin_load_attempts(): array
{
    $file = admin_storage_path('login_attempts.json');
    if (!is_file($file)) {
        return [];
    }

    $raw = file_get_contents($file);
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function admin_save_attempts(array $attempts): void
{
    $file = admin_storage_path('login_attempts.json');
    file_put_contents($file, json_encode($attempts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function admin_get_attempt_state(string $ip): array
{
    $attempts = admin_load_attempts();
    $entry = $attempts[$ip] ?? ['fails' => [], 'locked_until' => 0];
    $now = time();

    $entry['fails'] = array_values(array_filter($entry['fails'], static function ($timestamp) use ($now) {
        return ($now - (int) $timestamp) <= ADMIN_LOGIN_WINDOW;
    }));

    if (($entry['locked_until'] ?? 0) < $now) {
        $entry['locked_until'] = 0;
    }

    $attempts[$ip] = $entry;
    admin_save_attempts($attempts);

    return $entry;
}

function admin_is_locked_out(string $ip): bool
{
    $state = admin_get_attempt_state($ip);
    return (int) ($state['locked_until'] ?? 0) > time();
}

function admin_record_failed_login(string $ip): void
{
    $attempts = admin_load_attempts();
    $entry = $attempts[$ip] ?? ['fails' => [], 'locked_until' => 0];
    $now = time();

    $entry['fails'] = array_values(array_filter($entry['fails'], static function ($timestamp) use ($now) {
        return ($now - (int) $timestamp) <= ADMIN_LOGIN_WINDOW;
    }));

    $entry['fails'][] = $now;

    if (count($entry['fails']) >= ADMIN_MAX_LOGIN_ATTEMPTS) {
        $entry['locked_until'] = $now + ADMIN_LOCKOUT_DURATION;
        $entry['fails'] = [];
    }

    $attempts[$ip] = $entry;
    admin_save_attempts($attempts);
}

function admin_clear_failed_logins(string $ip): void
{
    $attempts = admin_load_attempts();
    unset($attempts[$ip]);
    admin_save_attempts($attempts);
}

function admin_verify_password(string $username, string $password): bool
{
    $configuredUsername = getenv('ADMIN_USER') ?: ADMIN_USERNAME;
    $salt = getenv('ADMIN_PASSWORD_SALT') ?: ADMIN_PASSWORD_SALT;
    $hash = getenv('ADMIN_PASSWORD_HASH') ?: ADMIN_PASSWORD_HASH;
    $iterations = (int) (getenv('ADMIN_PASSWORD_ITERATIONS') ?: ADMIN_PASSWORD_ITERATIONS);

    if (!hash_equals($configuredUsername, $username)) {
        return false;
    }

    $computed = hash_pbkdf2('sha256', $password, $salt, $iterations, 64);
    return hash_equals($hash, $computed);
}

function admin_issue_csrf_token(): string
{
    admin_secure_session_start();

    if (empty($_SESSION['admin_csrf_token'])) {
        $_SESSION['admin_csrf_token'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['admin_csrf_token'];
}

function admin_validate_csrf_token(?string $token): bool
{
    admin_secure_session_start();

    if (!$token || empty($_SESSION['admin_csrf_token'])) {
        return false;
    }

    return hash_equals((string) $_SESSION['admin_csrf_token'], $token);
}

function admin_login(string $username): void
{
    admin_secure_session_start();
    session_regenerate_id(true);

    $_SESSION['admin_authenticated'] = true;
    $_SESSION['admin_username'] = $username;
    $_SESSION['admin_logged_in_at'] = time();
    $_SESSION['admin_last_regeneration'] = time();
    admin_issue_csrf_token();
}

function admin_logout(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        admin_secure_session_start();
    }

    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
    }

    session_destroy();
}

function admin_is_authenticated(): bool
{
    admin_secure_session_start();
    return !empty($_SESSION['admin_authenticated']) && !empty($_SESSION['admin_username']);
}

function admin_require_auth(): void
{
    if (!admin_is_authenticated()) {
        header('Location: admin-login.php');
        exit;
    }

    if (!empty($_SESSION['admin_last_regeneration']) && (time() - (int) $_SESSION['admin_last_regeneration']) > 300) {
        session_regenerate_id(true);
        $_SESSION['admin_last_regeneration'] = time();
    }
}
