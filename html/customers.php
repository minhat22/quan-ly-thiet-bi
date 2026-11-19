<?php require __DIR__ . '/../includes/page_guard.php'; ?>
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Người mượn | GearFlow Blue</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="main.css">

</head>
<body data-page="customers">
<div class="app">
<aside class="sidebar">
  <div class="brand">
    <div><img class="logo-img" src="../images/logo.png" alt=""></div><div>
      <span class="title-name">GearFlow</span><small>EQUIPMENT MANAGER</small>
    </div>
  </div>
  <div class="nav-label">TỔNG QUAN</div>
  <nav class="nav">
    <a href="main.php" data-page="trangchu">
      <div>
        <img class="ico" src="../images/menu-TongQuang.png" alt="">
        <span class="nav-text">Trang chủ</span>
      </div>
    </a>
  </nav>
  <div class="nav-label">QUẢN LÝ</div>
  <nav class="nav">
    <a href="devices.php" data-page="devices">
      <div>
        <img class="ico" src="../images/menu-TB.png" alt="">
        <span class="nav-text">Thiết bị</span>
      </div>
    </a>
    <a href="customers.php" data-page="customers">
      <div>
        <img class="ico" src="../images/menu-Customers.png" alt="">
        <span class="nav-text">Người mượn</span>
      </div>
    </a>
    <a href="history.php" data-page="loans">
      <div>
        <img class="ico" src="../images/menu-PhieuMuon.png" alt="">
        <span class="nav-text">Phiếu mượn</span>
      </div>
    </a>
    <a href="observe.php" data-page="returns">
      <div>
        <img class="ico" src="../images/menu-history.png" alt="">
        <span class="nav-text">Theo dõi trả</span>
      </div>
    </a>
  </nav>
</aside>
<main class="main">
  <div class="topbar">
    <div class="crumb">Workspace<span class="sep">/</span><b id="crumb">Người mượn</b></div>
    <div class="top-right">
      <div class="date-chip" id="today"></div>
      <div class="user-chip">
        <div class="avatar">AD</div>
        <span><?= htmlspecialchars($_SESSION['ho_ten']) ?></span>
        <a href="#" onclick="dangXuat(); return false;" style="margin-left:10px;font-size:12px;text-decoration:none">Đăng xuất</a>
        
      </div>
    </div>
  </div>
  <section id="page">
    <div class="page-head">
      <div class="parent">
        <div class="eyebrow">Người mượn / 03</div>
        <h1>Quản lý người mượn</h1>
        <p>Lưu trữ thông tin cá nhân và đơn vị công tác.</p>
      </div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <div class="search">
          <input id="searchBox" placeholder="Tìm họ tên, đơn vị, số điện thoại..." oninput="filterRows()">
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
            <th>NGƯỜI MƯỢN</th>
            <th>MÃ ID</th>
            <th>ĐƠN VỊ</th>
            <th>SỐ ĐIỆN THOẠI</th>
            <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
    </div>
  </section>
</main>
</div>
<div class="modal-backdrop" id="modalBackdrop">
  <div class="modal">
    <div class="modal-head">
      <h3 id="modalTitle">Thêm mới</h3>
      <button class="close" onclick="closeModal()"><span class="close-button">x</span></button>
    </div>
    <form id="modalForm">
      <div id="modalFields" class="form-grid"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" type="submit">Lưu thông tin</button>
      </div>
    </form>
  </div>
</div>
<div class="toast" id="toast"></div>

<script src="../js/api.js"></script>
<script src="../js/core.js"></script>
<script src="../js/customers.js"></script>
</body>
</html>
