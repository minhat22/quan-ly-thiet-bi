# Hệ Thống Quản Lý Mượn Thiết Bị

Ứng dụng web quản lý việc đăng ký mượn và trả thiết bị trong phòng thí nghiệm hoặc cơ quan, được xây dựng theo mô hình tương tác API bất đồng bộ (AJAX) kết hợp với cơ sở dữ liệu quan hệ MySQL.

## Thành viên nhóm (3 sinh viên)

| STT | Họ và tên | Mã số sinh viên | Vai trò / Phân công |
| :-: | :--- | :--- | :--- |
| 1 | Tên thành viên 1 | MSSV 1 | Backend API, Thiết kế CSDL |
| 2 | [Tên thành viên 2] | [MSSV 2] | Frontend (HTML/CSS/JS), AJAX |
| 3 | [Tên thành viên 3] | [MSSV 3] | Kiểm thử, Báo cáo & Tài liệu |

## Công nghệ sử dụng

* **Backend:** PHP (sử dụng Prepared Statements để chống SQL Injection)
* **Frontend:** HTML5, CSS3, JavaScript (AJAX)
* **Cơ sở dữ liệu:** MySQL
* **Môi trường chạy thử:** XAMPP (Apache & MySQL)

## Cấu trúc Cơ sở dữ liệu (MySQL)

Hệ thống bao gồm 4 bảng thực thể chính:
1. **`ThietBi`** (`ID`, `TenThietBi`, `Loai`, `TinhTrang`, `SoLuong`): Lưu trữ danh mục và số lượng tồn kho của thiết bị.
2. **`NguoiMuon`** (`ID`, `HoTen`, `DonVi`, `SDT`): Quản lý thông tin người đăng ký mượn.
3. **`PhieuMuon`** (`ID`, `ID_NguoiMuon`, `NgayMuon`, `NgayHenTra`, `NgayTra`, `TrangThai`): Lưu thông tin tổng quát của mỗi lượt mượn.
4. **`ChiTietMuon`** (`ID_PhieuMuon`, `ID_ThietBi`, `SoLuong`): Lưu chi tiết từng thiết bị và số lượng tương ứng trong mỗi phiếu mượn.

## Chức năng chính

* **Quản lý phiên (Session):** Đăng nhập và đăng xuất hệ thống.
* **Quản lý danh mục (CRUD):** Thêm, xem, sửa, xóa thông tin thiết bị và người mượn.
* **Nghiệp vụ mượn - trả:** Tạo phiếu mượn mới, ghi nhận trả thiết bị và tự động cập nhật lại số lượng thiết bị khả dụng.
* **Theo dõi & Thống kê:** Lọc và theo dõi danh sách các thiết bị đang được mượn, quá hạn trả hoặc bị hư hỏng.

## Hướng dẫn cài đặt và chạy dự án

1. **Tải mã nguồn:** Tải kho lưu trữ này về máy (hoặc `git clone`) và đặt vào thư mục `htdocs` của XAMPP (ví dụ: `C:\xampp\htdocs\quan-ly-muon-thiet-bi`).
2. **Khởi động dịch vụ:** Mở **XAMPP Control Panel**, bật **Apache** và **MySQL**.
3. **Import Cơ sở dữ liệu:**
   * Truy cập `http://localhost/phpmyadmin`.
   * Tạo một cơ sở dữ liệu mới (ví dụ: `ql_muon_thiet_bi`).
   * Chọn tab **Import** và tải lên tệp `.sql` đính kèm trong thư mục dự án.
4. **Cấu hình kết nối:** Kiểm tra tệp cấu hình kết nối database trong mã nguồn (đảm bảo đúng tên database, `username` là `root`, `password` để trống nếu dùng mặc định của XAMPP).
5. **Chạy ứng dụng:** Mở trình duyệt và truy cập địa chỉ `http://localhost/quan-ly-muon-thiet-bi`.
<!-- Những chỗ ăn điểm bảo mật, nhớ ghi vào báo cáo:

prepare và execute: Prepared Statements, chống SQL injection.
password_verify: so mật khẩu với bản mã hóa, không lưu mật khẩu thật.
session_regenerate_id(true): đổi mã phiên sau khi đăng nhập.
Sai tên hay sai mật khẩu đều báo cùng một câu, để người lạ không dò được tên nào tồn tại.
Sai đăng nhập trả mã 400, còn mã 401 để dành cho “chưa đăng nhập” (khác nhau để api() biết khi nào cần chuyển về trang đăng nhập). -->
## Bản cập nhật MySQL tập trung (GearFlow)

- Dữ liệu thiết bị, người mượn, phiếu mượn, chi tiết phiếu, lịch sử kho và hoạt động được đọc/ghi qua PHP API vào MySQL; JavaScript không còn dùng `localStorage` làm nguồn dữ liệu.
- Đăng nhập dùng bảng `NguoiDung` và `password_verify()`. Tài khoản mặc định: `admin`; mật khẩu: `Gearflowct428`.
- Người mượn là hồ sơ độc lập, không cần tài khoản đăng nhập. Người dùng đã đăng nhập có thể thêm hồ sơ tại trang **Người mượn**; API lưu vào bảng `NguoiMuon`.
- Các thao tác mượn, trả và điều chỉnh kho chạy trong transaction, kiểm tra số lượng khả dụng phía máy chủ.

### Cài đặt / cập nhật

1. Chép thư mục dự án vào `C:\\xampp\\htdocs\\quan-ly-thiet-bi`.
2. Bật Apache và MySQL trong XAMPP.
3. Mở phpMyAdmin, import `gearflow.sql` để tạo mới CSDL `gearflow`.
4. Nếu đã có CSDL GearFlow cũ, chạy thêm `fix_admin.sql` trong phpMyAdmin để cập nhật hash mật khẩu Admin.
5. Kiểm tra `config/db.php`: mặc định XAMPP là host `localhost`, database `gearflow`, user `root`, mật khẩu rỗng.
6. Mở `http://localhost/quan-ly-thiet-bi/html/login.php`.

Nếu XAMPP của bạn đặt mật khẩu cho MySQL `root`, hãy sửa biến `$password` trong `config/db.php`.


### Ràng buộc người mượn khi tạo phiếu (bản cập nhật)

- Form Phiếu mượn chỉ hiển thị người mượn đã có trong bảng `NguoiMuon`; chọn theo mã hồ sơ, kèm họ tên, đơn vị và số điện thoại.
- Đơn vị và số điện thoại được tự động lấy từ hồ sơ, không nhập tự do trong form phiếu.
- API `loan_create` kiểm tra `borrowerId` tồn tại trong MySQL và từ chối nếu không tồn tại; API không còn tự động thêm người mượn khi tạo phiếu.
- Khi tạo phiếu, dữ liệu được ghi trong một transaction vào `PhieuMuon` và `ChiTietPhieu`, đồng thời ghi nhật ký vào `HoatDong`. Nếu một bước lỗi, transaction rollback để tránh phiếu thiếu chi tiết.
- Nếu danh sách chọn trống, hãy vào trang **Người mượn** thêm hồ sơ trước rồi quay lại tạo phiếu.
