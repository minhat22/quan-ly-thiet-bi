/*
   customers.js  —  FILE RIÊNG cho trang NGƯỜI MƯỢN (customers.php)
   RIÊNG của trang này:  danhSach, dangSua, hen, borrowerRows, taiDanhSach,
       filterRows, suaNguoiMuon, themNguoiMuon, xoaNguoiMuon, bộ xử lý submit, renderPage
*/

let danhSach = [];     // danh sách người mượn lấy từ server
let dangSua = null;    // mã người đang được sửa
let hen = null;        // bộ hẹn giờ cho ô tìm kiếm

// Đổi ký tự đặc biệt để chèn an toàn vào HTML (chống XSS)
// Các dòng của bảng người mượn
// [RIÊNG customers.php]
function borrowerRows(rows) {
    return rows.map(function (nguoi) {
        let chuCai = nguoi.hoTen.trim().split(' ').slice(-2).map(function (tu) {
            return tu[0];
        }).join('');

        return `
            <tr>
                <td>
                    <div class="device-cell">
                        <div class="avatar">${escapeHtml(chuCai)}</div>
                        <b>${escapeHtml(nguoi.hoTen)}</b>
                    </div>
                </td>
                <td>NM-${String(nguoi.id).padStart(3, '0')}</td>
                <td>${escapeHtml(nguoi.donVi)}</td>
                <td>${escapeHtml(nguoi.sdt)}</td>
                <td>
                    <button class="action-btn" onclick="suaNguoiMuon(${Number(nguoi.id)})">Sửa</button>
                    <button class="action-btn" onclick="xoaNguoiMuon(${Number(nguoi.id)})">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Lấy danh sách từ server (kèm từ khóa tìm kiếm) rồi vẽ bảng
// [RIÊNG customers.php] gọi api/borrowers.php?q=...
async function taiDanhSach() {
    let o = document.getElementById('searchBox');
    let tuKhoa = o ? o.value.trim() : '';

    try {
        danhSach = await api('../api/borrowers.php?q=' + encodeURIComponent(tuKhoa));

        if (danhSach.length === 0) {
            fillRows('<tr><td colspan="5">Chưa có người mượn nào</td></tr>');
        } else {
            fillRows(borrowerRows(danhSach));
        }
    } catch (loi) {
        alert(loi.message);
    }
}

// Gọi từ ô tìm kiếm: đợi người dùng gõ xong 0,3 giây mới hỏi server
// [RIÊNG customers.php] (devices.js và history.js cũng có filterRows riêng, cùng tên nhưng khác nội dung)
function filterRows() {
    clearTimeout(hen);
    hen = setTimeout(taiDanhSach, 300);
}

// Mở form sửa người mượn
// [RIÊNG customers.php]
function suaNguoiMuon(id) {
    let nguoi = danhSach.find(function (n) {
        return Number(n.id) === id;
    });

    if (nguoi === undefined) {
        return;
    }

    dangSua = id;

    // Danh sách đơn vị lấy từ core.js; đơn vị hiện tại luôn có trong danh sách
    let donViList = (typeof unitList !== 'undefined') ? unitList.slice() : [];
    if (!donViList.includes(nguoi.donVi)) {
        donViList.unshift(nguoi.donVi);
    }

    document.getElementById('modalTitle').textContent = 'Cập nhật người mượn';

    document.getElementById('modalFields').innerHTML = `
        <div class="form-group">
            <label>Họ và tên</label>
            <input name="hoTen" value="${escapeHtml(nguoi.hoTen)}" required>
        </div>
        <div class="form-group">
            <label>Số điện thoại</label>
            <input name="sdt" type="tel" value="${escapeHtml(nguoi.sdt)}"
                   pattern="[0-9 .+]{9,15}" title="Số điện thoại gồm 9 đến 15 chữ số" required>
        </div>
        <div class="form-group full">
            <label>Đơn vị</label>
            <select name="donVi">
                ${donViList.map(function (donVi) {
                    return `<option value="${escapeHtml(donVi)}" ${donVi === nguoi.donVi ? 'selected' : ''}>${escapeHtml(donVi)}</option>`;
                }).join('')}
            </select>
        </div>
    `;

    document.getElementById('modalBackdrop').classList.add('show');
}

// Admin/nhân viên đã đăng nhập có thể thêm người mượn; người mượn không cần tài khoản đăng nhập.
// [RIÊNG customers.php]
function themNguoiMuon() {
    dangSua = null;
    document.getElementById('modalTitle').textContent = 'Thêm người mượn';
    document.getElementById('modalFields').innerHTML = `
      <div class="form-group"><label>Họ và tên</label><input name="hoTen" required maxlength="100"></div>
      <div class="form-group"><label>Số điện thoại</label><input name="sdt" type="tel" pattern="[0-9 .+]{9,15}" required></div>
      <div class="form-group full"><label>Đơn vị</label><input name="donVi" required maxlength="150"></div>`;
    document.getElementById('modalBackdrop').classList.add('show');
}

// Xóa người mượn (server sẽ chặn nếu người này có phiếu mượn)
// [RIÊNG customers.php]
async function xoaNguoiMuon(id) {
    if (!confirm('Bạn có chắc muốn xóa người mượn này?')) {
        return;
    }

    try {
        await api('../api/borrowers.php', 'POST', { action: 'delete', id: id });
        alert('Đã xóa người mượn');
        taiDanhSach();
    } catch (loi) {
        alert(loi.message);
    }
}

// Gỡ bộ xử lý form cũ của core.js (đang lưu vào localStorage):
// thay form bằng một bản sao sạch rồi gắn bộ xử lý mới gọi API
const formCu = document.getElementById('modalForm');
const form = formCu.cloneNode(true);
formCu.replaceWith(form);

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    let du = Object.fromEntries(new FormData(form).entries());

    try {
        await api('../api/borrowers.php', 'POST', {
            action: dangSua === null ? 'create' : 'update',
            id: dangSua,
            hoTen: du.hoTen,
            donVi: du.donVi,
            sdt: du.sdt
        });

        closeModal();
        alert(dangSua === null ? 'Đã thêm người mượn' : 'Đã cập nhật người mượn');
        dangSua = null;
        taiDanhSach();
    } catch (loi) {
        alert(loi.message);
    }
});

// Do du lieu vao trang (core.js goi ham nay trong render)
// [RIÊNG customers.php] core.render() gọi hàm này
function renderPage() {
    taiDanhSach();
}

// Chạy khi mở trang
render();
