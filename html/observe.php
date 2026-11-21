<?php require __DIR__ . '/../includes/page_guard.php'; ?>
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Theo dõi trả | GearFlow Blue</title>
<link rel="icon" type="image/png" href="../images/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="main.css?v=20261120-clean-8">

</head>
<body data-page="returns">
<div class="app">
<aside class="sidebar">
  <div class="brand">
    <div>
      <img class="logo-img" src="../images/logo.png" alt="">
    </div>
    <div>
      <span class="title-name">GearFlow</span>
      <p class="txt-small">EQUIPMENT MANAGER</p>
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
  <div class="topbar"><div class="crumb">Workspace 
    <span class="sep">/</span> 
    <b id="crumb">Theo dõi trả</b>
  </div>
  <div class="top-right">
    <div class="date-chip" id="today"></div>
      <div class="user-chip">
        <div class="avatar">AD</div>
        <span><?= htmlspecialchars($_SESSION['ho_ten']) ?></span>
        <button type="button" class="btn btn-primary btn-logout" onclick="dangXuat()">Đăng xuất</button>
      </div>
  </div>
</div>
  <section id="page">
    <div class="page-head">
      <div class="parent">
        <div class="eyebrow">Theo dõi trả / 05</div>
        <h1>Theo dõi trả thiết bị</h1>
        <p>Kiểm tra hạn trả, xác nhận hoàn trả và ghi nhận tình trạng.</p>
      </div>
      
    </div>

    <div class="stats">
      <div class="stat stat-green">
        <div class="stat-top">
          <span>Chờ hoàn trả</span>
          <img class="stat-icon" src="../images/waiting.png" alt="">
        </div>
        <p class="txt-strong" id="statPending">0</p>
        <p class="txt-small">Phiếu chưa hoàn tất</p>
      </div>
      <div class="stat stat-red">
        <div class="stat-top">
          <span>Quá hạn</span>
          <img class="stat-icon" src="../images/main-PhieuQuaHan.png" alt="">
        </div>
        <p class="txt-strong" id="statOverdue">0</p>
        <p class="txt-small">Cần liên hệ người mượn</p>
      </div>
      <div class="stat stat-green">
        <div class="stat-top">
          <span>Đã hoàn tất</span>
          <img class="stat-icon" src="../images/success.png" alt="">
        </div>
        <p class="txt-strong" id="statDone">0</p>
        <p class="txt-small">Đã xác nhận trả</p>
      </div>
      <div class="stat stat-blue">
        <div class="stat-top">
          <span>Đang mượn</span>
          <img class="stat-icon" src="../images/main-PhieuDgMuon.png" alt="">
        </div>
        <p class="txt-strong" id="statBorrowing">0</p>
        <p class="txt-small">Trong thời hạn</p>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Danh sách cần theo dõi</h3>
          <p>Xác nhận trả sau khi kiểm tra thiết bị thực tế</p>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
            <th>MÃ PHIẾU</th>
            <th>NGƯỜI MƯỢN</th>
            <th>THIẾT BỊ</th>
            <th>SL</th>
            <th>NGÀY MƯỢN</th>
            <th>HẸN TRẢ</th>
            <th>TRẠNG THÁI</th>
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
      <div id="modalFields" class="form-flex"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Hủy</button>
        <button class="btn btn-primary" type="submit">Lưu thông tin</button>
      </div>
    </form>
  </div>
</div>
<div class="toast" id="toast"></div>

<script src="../js/api.js?v=20261121-split-1"></script>
<script src="../js/core.js?v=20261121-split-1"></script>
<script src="../js/observe.js?v=20261121-split-1"></script>
</body>
</html>
