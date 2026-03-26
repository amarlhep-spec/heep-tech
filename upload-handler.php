<?php
declare(strict_types=1);

require_once __DIR__ . '/admin-auth.php';
admin_require_auth();
admin_send_security_headers();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'الطريقة غير مسموحة']);
    exit;
}

$allowedFolders = ['products', 'settings', 'banners', 'payment_codes', 'general'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$maxSize = 5 * 1024 * 1024;

foreach ($allowedFolders as $folder) {
    $dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

if (!isset($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
    echo json_encode(['success' => false, 'message' => 'لم يتم رفع أي ملف']);
    exit;
}

$file = $_FILES['image'];

if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'حدث خطأ أثناء رفع الملف']);
    exit;
}

if (($file['size'] ?? 0) > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'حجم الملف كبير جدا']);
    exit;
}

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($extension, $allowedExtensions, true)) {
    echo json_encode(['success' => false, 'message' => 'نوع الملف غير مدعوم']);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($mimeType, $allowedMimeTypes, true)) {
    echo json_encode(['success' => false, 'message' => 'نوع الملف غير صالح']);
    exit;
}

$type = $_POST['type'] ?? 'general';
$folder = in_array($type, $allowedFolders, true) ? $type : 'general';

$filename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
$relativePath = 'uploads/' . $folder . '/' . $filename;
$targetPath = __DIR__ . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['success' => false, 'message' => 'تعذر حفظ الملف على الخادم']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'تم رفع الملف بنجاح',
    'filePath' => $relativePath,
    'fileName' => $filename
]);
