-- =========================================================
-- GearFlow - CSDL quản lý mượn thiết bị
-- MySQL 5.7+ / MariaDB 10.4+
-- =========================================================

CREATE DATABASE IF NOT EXISTS gearflow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gearflow;

-- ---------- Tài khoản người dùng ----------
CREATE TABLE IF NOT EXISTS NguoiDung (
  ID            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  TenDangNhap   VARCHAR(50)  NOT NULL UNIQUE,
  MatKhau       VARCHAR(255) NOT NULL,               -- bcrypt hash
  HoTen         VARCHAR(100) NOT NULL,
  VaiTro        ENUM('admin','user') NOT NULL DEFAULT 'user',
  NgayTao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- Người mượn ----------
CREATE TABLE IF NOT EXISTS NguoiMuon (
  ID     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  HoTen  VARCHAR(100) NOT NULL,
  DonVi  VARCHAR(150) NOT NULL,
  SDT    VARCHAR(20)  NOT NULL,
  INDEX idx_HoTen (HoTen),
  INDEX idx_DonVi (DonVi),
  INDEX idx_SDT   (SDT)
) ENGINE=InnoDB;

-- ---------- Thiết bị ----------
CREATE TABLE IF NOT EXISTS ThietBi (
  ID       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Ten      VARCHAR(150) NOT NULL,
  Loai     VARCHAR(100) NOT NULL,
  Icon     VARCHAR(20)  DEFAULT '▣',
  TongSo   INT UNSIGNED NOT NULL DEFAULT 0,   -- tổng số lượng trong kho
  BaoTri   INT UNSIGNED NOT NULL DEFAULT 0,   -- đang bảo trì
  INDEX idx_Ten  (Ten),
  INDEX idx_Loai (Loai)
) ENGINE=InnoDB;

-- ---------- Phiếu mượn ----------
CREATE TABLE IF NOT EXISTS PhieuMuon (
  ID            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ID_NguoiMuon  INT UNSIGNED NOT NULL,
  NgayMuon      DATE NOT NULL,
  HenTra        DATE NOT NULL,
  NgayTra       DATE NULL,
  TrangThai     ENUM('Đang mượn','Quá hạn','Đã trả') NOT NULL DEFAULT 'Đang mượn',
  CONSTRAINT fk_PhieuMuon_NguoiMuon
    FOREIGN KEY (ID_NguoiMuon) REFERENCES NguoiMuon(ID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_TrangThai (TrangThai),
  INDEX idx_NgayMuon  (NgayMuon)
) ENGINE=InnoDB;

-- ---------- Chi tiết phiếu mượn (1 phiếu - nhiều thiết bị) ----------
CREATE TABLE IF NOT EXISTS ChiTietPhieu (
  ID_Phieu    INT UNSIGNED NOT NULL,
  ID_ThietBi  INT UNSIGNED NOT NULL,
  SoLuong     INT UNSIGNED NOT NULL,
  PRIMARY KEY (ID_Phieu, ID_ThietBi),
  CONSTRAINT fk_CTP_Phieu
    FOREIGN KEY (ID_Phieu) REFERENCES PhieuMuon(ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_CTP_ThietBi
    FOREIGN KEY (ID_ThietBi) REFERENCES ThietBi(ID)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------- Lịch sử kho ----------
CREATE TABLE IF NOT EXISTS LichSuKho (
  ID         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ID_ThietBi INT UNSIGNED NOT NULL,
  ThaoTac    ENUM('add','broken','fixed','dispose') NOT NULL,
  SoLuong    INT UNSIGNED NOT NULL,
  GhiChu     VARCHAR(255) DEFAULT NULL,
  ThoiGian   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_LSK_ThietBi
    FOREIGN KEY (ID_ThietBi) REFERENCES ThietBi(ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_ThoiGian (ThoiGian)
) ENGINE=InnoDB;

-- ---------- Nhật ký hoạt động ----------
CREATE TABLE IF NOT EXISTS HoatDong (
  ID         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Loai       ENUM('create','return') NOT NULL,
  NguoiMuon  VARCHAR(100) NOT NULL,
  TomTat     VARCHAR(255) NOT NULL,
  ThoiGian   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ThoiGian (ThoiGian)
) ENGINE=InnoDB;

-- =========================================================
-- DỮ LIỆU MẪU
-- =========================================================

-- Tài khoản admin (mật khẩu: Gearflowct428)
INSERT INTO NguoiDung (TenDangNhap, MatKhau, HoTen, VaiTro) VALUES
('admin',
 '$2y$12$rIXi96ypaH6XGycR8vMvpOlgEtcB7Ac1p.0e00Oo47gxAYLm0bitS',
 'Quản trị viên', 'admin')
ON DUPLICATE KEY UPDATE MatKhau=VALUES(MatKhau), HoTen=VALUES(HoTen), VaiTro=VALUES(VaiTro);

-- Người mượn
INSERT INTO NguoiMuon (HoTen, DonVi, SDT) VALUES
('Nguyễn Minh Anh', 'Khoa Công nghệ thông tin', '0901234567'),
('Trần Hoàng Nam',  'Phòng thí nghiệm A',      '0912345678'),
('Lê Thảo Vy',      'Khoa Điện - Điện tử',     '0987654321');

-- Thiết bị
INSERT INTO ThietBi (Ten, Loai, Icon, TongSo, BaoTri) VALUES
('Laptop Dell Latitude',  'Máy tính',                '💻', 12, 0),
('Máy chiếu Epson',       'Thiết bị trình chiếu',    '📽️', 6, 0),
('Bộ Arduino Uno',        'Thiết bị thực hành',      '🔌', 20, 0),
('Camera Canon',          'Thiết bị ghi hình',       '📷', 4, 1),
('Máy đo điện đa năng',   'Dụng cụ đo',              '🔧', 10, 0);

-- Phiếu mượn mẫu
INSERT INTO PhieuMuon (ID_NguoiMuon, NgayMuon, HenTra, NgayTra, TrangThai) VALUES
(1, '2026-10-27', '2026-11-02', NULL, 'Đang mượn'),
(2, '2026-10-25', '2026-10-29', NULL, 'Quá hạn'),
(3, '2026-10-20', '2026-10-26', '2026-10-26', 'Đã trả');

-- Chi tiết phiếu
INSERT INTO ChiTietPhieu (ID_Phieu, ID_ThietBi, SoLuong) VALUES
(1, 1, 2),
(2, 2, 1),
(3, 3, 3);