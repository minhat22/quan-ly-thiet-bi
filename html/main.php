<?php require __DIR__ . '/../includes/page_guard.php'; ?>
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Trang chủ | GearFlow Blue</title>
<link rel="icon" type="image/png" href="../images/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="main.css?v=20261120-clean-8">

</head>
<body data-page="trangchu">
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
  <div class="topbar">
  <div class="crumb">Workspace 
    <span class="sep">/</span> 
    <b id="crumb">Trang chủ</b>
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
        <div class="eyebrow">Trang chủ / 01</div>
        <h1>Tổng quan hệ thống</h1>
        <p>Theo dõi nhanh tình hình thiết bị và hoạt động mượn - trả.</p>
      </div>
    </div>

    <div class="stats">
      <div class="stat stat-green">
        <div class="stat-top">
          <span>Tổng số thiết bị</span>
           <img class="stat-icon" src="../images/main-TSThietBi.png" alt="">
        </div>
        <p class="txt-strong" id="statTotal">0</p>
        <p class="txt-small">Trong kho và đang lưu hành</p>
      </div>
      <div class="stat stat-blue">
        <div class="stat-top">
          <span>Phiếu đang mượn</span>
          <img class="stat-icon" src="../images/main-PhieuDgMuon.png" alt="">
        </div>
        <p class="txt-strong" id="statActive">0</p>
        <p class="txt-small">Cần theo dõi lịch trả</p>
      </div>
      <div class="stat stat-green">
        <div class="stat-top">
          <span>Thiết bị sẵn sàng</span>
          <img class="stat-icon" src="../images/main-TBSanSang.png" alt="">
        </div>
        <p class="txt-strong" id="statReady">0</p>
        <p class="txt-small">Có thể đăng ký mượn</p>
      </div>
      <div class="stat stat-red">
        <div class="stat-top">
          <span>Phiếu quá hạn</span>
          <img class="stat-icon" src="../images/main-PhieuQuaHan.png" alt="">
        </div>
        <p class="txt-strong" id="statOverdue">0</p>
        <p class="txt-small">Cần xử lý ngay</p>
      </div>
    </div>

    <div class="flex-main">

      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Hoạt động mượn thiết bị</h3>
            <p>Số phiếu mượn và phiếu trả trong 6 tháng gần nhất</p>
          </div>
          <span class="status green" id="chartTrend">—</span>
        </div>

        <div class="chart" id="loanChart"></div>

        <div class="chart-legend">
          <span><i class="legend-dot"></i>Phiếu mượn</span>
          <span><i class="legend-dot blue"></i>Phiếu trả</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Hoạt động gần đây</h3>
            <p>Cập nhật trong hệ thống</p>
          </div>
          
        </div>

        <div class="activity" id="activityList">

        </div>
      </div>
    </div>

    <div class="stat-flex">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Thiết bị được mượn nhiều nhất</h3>
            <p>Tính theo tổng số lượng đã mượn</p>
          </div>
        </div>
        <div id="topDevices"></div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Người mượn nhiều nhất</h3>
            <p>Tính theo số phiếu mượn</p>
          </div>
        </div>
        <div id="topBorrowers"></div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Tỷ lệ phiếu</h3>
            <p>Trên tổng <b id="totalLoans">0</b> phiếu</p>
          </div>
        </div>
        <div class="rate-row"><span>Đã trả</span><p class="txt-strong" id="returnRate">0%</p></div>
        <div class="rate-bar"><i id="returnBar"></i></div>
        <div class="rate-row"><span>Quá hạn</span><p class="txt-strong" id="overdueRate">0%</p></div>
        <div class="rate-bar red"><i id="overdueBar"></i></div>
      </div>
    </div>

    <div class="lower-flex">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h3>Phiếu mượn gần đây</h3>
            <p>Danh sách giao dịch mới nhất</p>
          </div>
        </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
            <th>MÃ PHIẾU</th>
            <th>NGƯỜI MƯỢN</th>
            <th>THIẾT BỊ</th>
            <th>HẠN TRẢ</th>
            <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
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

<script src="../js/api.js"></script>
<script src="../js/core.js?v=20261120-clean-8"></script>
<script src="../js/main.js"></script>
</body>
</html>
