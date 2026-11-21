<?php
session_start();

if (isset($_SESSION['user_id'])) {
    header('Location: main.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Đăng nhập | GearFlow Blue</title>
<link rel="icon" type="image/png" href="../images/logo.png">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="main.css?v=20261120-clean-8">
</head>
<body>
<div class="login-wrap">
  <div class="login-card">
    <div class="login-header">
      <h1>GearFlow</h1>
      <p>Đăng nhập hệ thống quản lý thiết bị</p>
    </div>

    <form id="loginForm">
      <div class="form-group">
        <label>Tên đăng nhập</label>
        <input id="username" type="text" autocomplete="username" placeholder="Nhập tên đăng nhập..." required>
      </div>
      <div class="form-group">
        <label>Mật khẩu</label>
        <input id="password" type="password" autocomplete="current-password" placeholder="••••••••" required>
      </div>
      <div id="loginError"></div>
      <button class="btn" type="submit">Đăng nhập</button>
    </form>
  </div>
</div>

<script src="../js/api.js?v=20261121-split-1"></script>

<script>
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const loi = document.getElementById('loginError');
    loi.textContent = '';

    try {
        await api('../api/auth/login.php', 'POST', {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        });
        location.href = 'main.php';
    } catch (err) {
        loi.textContent = err.message;
    }
});
</script>
</body>
</html>