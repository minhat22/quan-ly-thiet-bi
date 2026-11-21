# GearFlow – Hệ thống quản lý mượn thiết bị

Ứng dụng web quản lý việc mượn và trả thiết bị trong phòng thí nghiệm hoặc cơ quan. Giao diện đa trang gửi yêu cầu bất đồng bộ (Fetch API) tới các API PHP trả về JSON, dữ liệu lưu trong MySQL/MariaDB. Đồ án môn CT428 – Lập trình Web, Trường Công nghệ Thông tin và Truyền thông, Đại học Cần Thơ.

## Thành viên nhóm

| STT | Họ và tên | MSSV | Phân công |
| :-: | :-- | :-- | :-- |
| 1 | Nguyễn Anh Quốc | B2405520 | Trang Thiết bị, cơ sở dữ liệu, API thiết bị và kho, giao diện kho thiết bị |
| 2 | Hồ Cao Tiến | B2405532 | Trang chủ, trang Phiếu mượn, trang Theo dõi trả, API phiếu mượn và thống kê |
| 3 | Lê Duy Minh | B2405511 | Trang Đăng nhập, trang Người mượn, xác thực và phiên (Session), kiểm thử và tài liệu |

## Công nghệ sử dụng

- **Giao diện:** HTML5, CSS3, JavaScript (ES6+), Fetch API (async/await)
- **Máy chủ:** PHP, truy cập CSDL bằng PDO và Prepared Statements
- **Cơ sở dữ liệu:** MySQL / MariaDB (utf8mb4, InnoDB)
- **Môi trường chạy thử:** XAMPP (Apache + MySQL)

## Cấu trúc thư mục

```
quan-ly-thiet-bi/
├── html/            # Các trang PHP: login, main, devices, customers, history, observe + main.css
├── js/              # api.js, core.js và các file JS riêng của từng trang
├── api/
│   ├── auth/        # login.php, logout.php, me.php
│   ├── data.php     # Thiết bị, kho, phiếu mượn, thống kê (phân biệt theo "action")
│   └── borrowers.php# Hồ sơ người mượn
├── includes/        # auth_check.php, page_guard.php, response.php
├── config/db.php    # Kết nối MySQL qua PDO
├── images/
├── gearflow.sql     # Tạo CSDL và dữ liệu mẫu
└── fix_admin.sql    # Đặt lại tài khoản quản trị
```

## Cơ sở dữ liệu

CSDL `gearflow` gồm 6 bảng:

| Bảng | Các cột chính | Ghi chú |
| :-- | :-- | :-- |
| `NguoiDung` | ID, TenDangNhap, MatKhau, HoTen, VaiTro, NgayTao | Tài khoản đăng nhập, mật khẩu băm bcrypt |
| `NguoiMuon` | ID, HoTen, DonVi, SDT | Hồ sơ người mượn (không cần tài khoản) |
| `ThietBi` | ID, Ten, Model, Loai, TongSo, BaoTri | Model là duy nhất, nhập trùng Model thì cộng dồn số lượng |
| `PhieuMuon` | ID, ID_NguoiMuon, NgayMuon, HenTra, NgayTra, TrangThai | Trạng thái: Đang mượn, Quá hạn, Đã trả |
| `ChiTietPhieu` | ID_Phieu, ID_ThietBi, SoLuong | Một phiếu gồm nhiều thiết bị (khóa chính kép) |
| `LichSuKho` | ID, ID_ThietBi, ThaoTac, SoLuong, GhiChu, ThoiGian | Thao tác: add, broken, fixed, dispose |

## Chức năng chính

- **Đăng nhập và phiên:** đăng nhập, đăng xuất, chặn truy cập khi chưa đăng nhập.
- **Thiết bị:** thêm, sửa, xóa; điều chỉnh kho (nhập thêm, báo hỏng, sửa xong, thanh lý) kèm lịch sử kho.
- **Người mượn:** thêm và cập nhật hồ sơ (đơn vị, số điện thoại).
- **Phiếu mượn:** lập phiếu nhiều thiết bị cho người mượn đã có hồ sơ; tìm kiếm, lọc theo trạng thái và khoảng ngày mượn; xem chi tiết; xác nhận trả; xóa phiếu (phiếu chưa trả bị xóa thì thiết bị hoàn lại kho).
- **Theo dõi trả:** theo dõi phiếu đang mượn, sắp đến hạn và quá hạn. Trạng thái phiếu được hệ thống tự cập nhật theo ngày hẹn trả.
- **Thống kê trang chủ:** biểu đồ phiếu mượn/trả 6 tháng gần nhất, top 5 thiết bị, top 5 người mượn, tỷ lệ phiếu đã trả và quá hạn, hoạt động gần đây.

## Bảo mật

- Mọi truy vấn có dữ liệu từ người dùng dùng `prepare()` và `execute()` (PDO, `EMULATE_PREPARES = false`) để chống SQL Injection.
- Mật khẩu lưu dạng băm bcrypt, kiểm tra bằng `password_verify()`; đổi mã phiên sau khi đăng nhập bằng `session_regenerate_id(true)`.
- Thông báo đăng nhập sai không cho biết tên đăng nhập có tồn tại hay không.
- Kiểm soát truy cập hai lớp: `page_guard.php` cho các trang, `auth_check.php` cho API (trả HTTP 401 khi chưa đăng nhập).
- Các thao tác nhập kho, điều chỉnh kho, tạo phiếu, trả và xóa phiếu chạy trong transaction, khóa dòng (`FOR UPDATE`) khi kiểm tra tồn kho.
- Dữ liệu chèn vào HTML đều qua `escapeHtml()` để chống XSS.

## Cài đặt và chạy

1. Chép thư mục dự án vào `C:\xampp\htdocs\quan-ly-thiet-bi`.
2. Mở **XAMPP Control Panel**, bật **Apache** và **MySQL**.
3. Vào `http://localhost/phpmyadmin`, chọn tab **Import**, nhập tệp `gearflow.sql` (tự tạo CSDL `gearflow`, 6 bảng và dữ liệu mẫu, gồm tài khoản quản trị).
4. Nếu đã có CSDL GearFlow phiên bản cũ, chạy `migrate_remove_icon_hoatdong.sql` để bỏ cột `Icon` và bảng `HoatDong`.
5. Kiểm tra `config/db.php`: mặc định XAMPP là host `localhost`, database `gearflow`, user `root`, mật khẩu rỗng. Nếu MySQL của bạn có mật khẩu thì sửa biến `$password`.
6. Mở `http://localhost/quan-ly-thiet-bi/html/login.php` và đăng nhập:
   - Tên đăng nhập: `admin`
   - Mật khẩu: `Gearflowct428`

> Tài khoản trên chỉ dùng để chạy thử. Hãy đổi mật khẩu nếu đưa dự án lên môi trường công khai.

## Xử lý sự cố

| Hiện tượng | Cách khắc phục |
| :-- | :-- |
| "Không kết nối được máy chủ" | Kiểm tra Apache và MySQL trong XAMPP đã bật |
| Apache không khởi động | Cổng 80 đang bị ứng dụng khác chiếm, tắt ứng dụng đó hoặc đổi cổng |
| Lỗi kết nối CSDL | Kiểm tra `config/db.php` và đã import `gearflow.sql` chưa |
| Đăng nhập sai dù đúng mật khẩu | Chạy `fix_admin.sql` trong phpMyAdmin |
| Trang trắng hoặc báo lỗi | Mở F12, xem tab Console và Network |

## Tài liệu

Chi tiết các ca kiểm thử xem tệp `docs/KIEM_THU_VA_BAO_CAO.docx`.