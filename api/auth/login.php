<?php
ini_set('session.cookie_httponly', 1); // chống JavaScript đọc cookie phiên
session_start();
require __DIR__ . '/../../config/db.php';
require __DIR__ . '/../../includes/response.php';

$input = json_decode(file_get_contents('php://input'), true);
$tenDangNhap = trim($input['username'] ?? '');
$matKhau = $input['password'] ?? '';

if ($tenDangNhap === '' || $matKhau === '') {
    json_error('Vui lòng nhập tên đăng nhập và mật khẩu');
}

// PDO dùng prepared statement chặn tấn công SQL Injection
$stmt = $pdo->prepare('SELECT * FROM NguoiDung WHERE TenDangNhap = ?');
$stmt->execute([$tenDangNhap]);
$user = $stmt->fetch();

//Kiểm tra dạng băm với mật khẩu người dùng nhập
if (!$user || !password_verify($matKhau, $user['MatKhau'])) {
    json_error('Sai tên đăng nhập hoặc mật khẩu');
}

//tạo một session_id mới khác và hủy dữ liệu session cũ ngay trên server => chống tấn công session fixation.
session_regenerate_id(true);
$_SESSION['user_id'] = $user['ID'];
$_SESSION['ho_ten'] = $user['HoTen'];
$_SESSION['vai_tro'] = $user['VaiTro'];

json_ok(['hoTen' => $user['HoTen']]);