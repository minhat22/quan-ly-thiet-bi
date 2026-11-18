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

$stmt = $pdo->prepare('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?');
$stmt->execute([$tenDangNhap]);
$user = $stmt->fetch();

if (!$user || !password_verify($matKhau, $user['MatKhau'])) {
    json_error('Sai tên đăng nhập hoặc mật khẩu');
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['ID'];
$_SESSION['ho_ten'] = $user['HoTen'];
$_SESSION['vai_tro'] = $user['VaiTro'];

json_ok(['hoTen' => $user['HoTen']]);