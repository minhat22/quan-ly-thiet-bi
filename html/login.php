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
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./main.css">
<style>
  body {
      background: #f4f7fc;
      font-family: 'Be Vietnam Pro', sans-serif;
      margin: 0;
  }
  .login-wrap { 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: linear-gradient(135deg, #f0f4ff 0%, #e4edf8 100%);
  }
  .login-card { 
      width: 400px; 
      padding: 40px; 
      background: #ffffff; 
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(30, 80, 160, 0.12); 
      border: 1px solid rgba(220, 230, 245, 0.8);
  }
  .login-header {
      text-align: center;
      margin-bottom: 28px;
  }
  .login-card h1 { 
      margin: 0 0 6px; 
      font-size: 26px; 
      font-weight: 700;
      color: #1e3a60; 
  }
  .login-card p { 
      margin: 0; 
      color: #6b7f99; 
      font-size: 14px; 
  }
  .login-card .form-group { 
      margin-bottom: 18px; 
  }
  .login-card label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #334e68;
  }
  .login-card input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
  }
  .login-card input:focus {
      border-color: #1e50a0;
      box-shadow: 0 0 0 3px rgba(30, 80, 160, 0.15);
  }
  .login-card .btn { 
      width: 100%; 
      padding: 12px;
      background: #1e50a0;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 10px;
      
      display: flex;
      align-items: center;
      justify-content: center;
  }
  .login-card .btn:hover {
      background: #163d7d;
  }
  #loginError { 
      color: #dc2626; 
      font-size: 13px; 
      min-height: 18px; 
      margin-bottom: 12px; 
      text-align: center;
  }
</style>
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

<script src="../js/api.js"></script>

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