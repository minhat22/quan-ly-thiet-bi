-- Chạy file này nếu bạn đã import CSDL GearFlow trước đó.
USE gearflow;
INSERT INTO NguoiDung (TenDangNhap, MatKhau, HoTen, VaiTro)
VALUES ('admin', '$2y$12$rIXi96ypaH6XGycR8vMvpOlgEtcB7Ac1p.0e00Oo47gxAYLm0bitS', 'Quản trị viên', 'admin')
ON DUPLICATE KEY UPDATE
  MatKhau = VALUES(MatKhau),
  HoTen = VALUES(HoTen),
  VaiTro = VALUES(VaiTro);
