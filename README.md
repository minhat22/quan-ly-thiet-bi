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