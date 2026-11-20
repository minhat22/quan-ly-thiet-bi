<?php
require __DIR__ . '/../includes/auth_check.php';
require __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/response.php';

// GET: lấy danh sách, có tìm kiếm theo họ tên, đơn vị, số điện thoại 
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $like = '%' . trim($_GET['q'] ?? '') . '%';

    $stmt = $pdo->prepare(
        'SELECT ID AS id, HoTen AS hoTen, DonVi AS donVi, SDT AS sdt
         FROM NguoiMuon
         WHERE HoTen LIKE ? OR DonVi LIKE ? OR SDT LIKE ?
         ORDER BY ID DESC'
    );
    $stmt->execute([$like, $like, $like]);

    json_ok($stmt->fetchAll());
}

// ===== POST: chỉ Admin được thêm, sửa hoặc xóa hồ sơ người mượn =====
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Sai phương thức', 405);
}
if (($_SESSION['vai_tro'] ?? '') !== 'admin') {
    json_error('Chỉ Admin mới có quyền quản lý hồ sơ người mượn', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$action = $input['action'] ?? '';
$id = (int)($input['id'] ?? 0);

// Thêm người mượn mới (không cần tạo tài khoản đăng nhập)
if ($action === 'create') {
    $hoTen = trim($input['hoTen'] ?? '');
    $donVi = trim($input['donVi'] ?? '');
    $sdt = trim($input['sdt'] ?? '');
    if ($hoTen === '' || $donVi === '' || !preg_match('/^[0-9 .+]{9,15}$/', $sdt)) {
        json_error('Vui lòng nhập họ tên, đơn vị và số điện thoại hợp lệ');
    }
    $stmt = $pdo->prepare('INSERT INTO NguoiMuon(HoTen,DonVi,SDT) VALUES(?,?,?)');
    $stmt->execute([$hoTen,$donVi,$sdt]);
    json_ok(['id'=>(int)$pdo->lastInsertId()]);
}
if ($id <= 0) json_error('Thiếu mã người mượn');
$stmt = $pdo->prepare('SELECT COUNT(*) FROM NguoiMuon WHERE ID = ?');
$stmt->execute([$id]);
if ($stmt->fetchColumn() == 0) json_error('Không tìm thấy người mượn', 404);

//  SỬA 
if ($action === 'update') {
    $hoTen = trim($input['hoTen'] ?? '');
    $donVi = trim($input['donVi'] ?? '');
    $sdt = trim($input['sdt'] ?? '');

    if ($hoTen === '' || $donVi === '' || $sdt === '') {
        json_error('Vui lòng nhập đủ họ tên, đơn vị và số điện thoại');
    }
    if (mb_strlen($hoTen) > 100 || mb_strlen($donVi) > 150) {
        json_error('Họ tên hoặc đơn vị quá dài');
    }
    if (!preg_match('/^[0-9 .+]{9,15}$/', $sdt)) {
        json_error('Số điện thoại gồm 9 đến 15 chữ số');
    }

    $stmt = $pdo->prepare('UPDATE NguoiMuon SET HoTen = ?, DonVi = ?, SDT = ? WHERE ID = ?');
    $stmt->execute([$hoTen, $donVi, $sdt, $id]);

    json_ok(null);
}

// XÓA 
if ($action === 'delete') {
    // Đếm số phiếu của người này: tổng cộng và đang mượn chưa trả
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS tong, COALESCE(SUM(TrangThai = 'Đang mượn'), 0) AS dang_muon
         FROM PhieuMuon WHERE ID_NguoiMuon = ?"
    );
    $stmt->execute([$id]);
    $dem = $stmt->fetch();

    if ($dem['dang_muon'] > 0) {
        json_error('Người này đang có phiếu mượn chưa trả, chưa thể xóa');
    }
    if ($dem['tong'] > 0) {
        json_error('Người này đã có lịch sử mượn nên không thể xóa');
    }

    $stmt = $pdo->prepare('DELETE FROM NguoiMuon WHERE ID = ?');
    $stmt->execute([$id]);

    json_ok(null);
}

json_error('Hành động không hợp lệ');
