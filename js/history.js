/*
   history.js  —  FILE RIÊNG cho trang PHIẾU MƯỢN (history.php)
   Nạp sau: api.js, core.js
*/

// Tim kiem + loc theo trang thai + loc theo khoang ngay muon
// [RIÊNG history.php] (devices.js và customers.js cũng có filterRows riêng, cùng tên nhưng khác nội dung)
function filterRows() {
    let searchBox = document.getElementById('searchBox');
    let statusBox = document.getElementById('filterStatus');
    let fromBox = document.getElementById('fromDate');
    let toBox = document.getElementById('toDate');

    let search = searchBox ? searchBox.value.toLowerCase() : '';
    let status = statusBox ? statusBox.value : '';
    let fromDate = fromBox ? fromBox.value : '';   // dang YYYY-MM-DD
    let toDate = toBox ? toBox.value : '';

    let result = data.loans.filter(function (loan) {
        let information = (
            String(loan.id) +
            loan.borrower +
            loanItemsText(loan)
        ).toLowerCase();

        // Chuoi YYYY-MM-DD so sanh truc tiep duoc
        let inRange = (fromDate === '' || loan.borrowDate >= fromDate) &&
                      (toDate === '' || loan.borrowDate <= toDate);

        return information.includes(search) &&
               (status === '' || loan.status === status) &&
               inRange;
    });

    fillRows(fullLoanRows(result));
}

// Xoa loc ngay
// [RIÊNG history.php]
function clearDateFilter() {
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    filterRows();
}

// Do du lieu vao trang
// [RIÊNG history.php] core.render() gọi hàm này
function renderPage() {
    filterRows();
}

// ==================================================================
// HÀM CHỈ CỦA TRANG PHIẾU MƯỢN — chuyển từ core.js sang  [RIÊNG history.php]
// ==================================================================
// Mot dong chon thiet bi trong form phieu muon (thiet bi + so luong)
// [RIÊNG history.php] một dòng chọn thiết bị + số lượng trong form phiếu
function loanItemRowHtml() {
    let options = data.devices.map(function (device) {
        let ready = readyCount(device);

        return `<option value="${device.id}" ${ready === 0 ? 'disabled' : ''}>${escapeHtml(device.name)}${device.model ? ' - ' + escapeHtml(device.model) : ''} (còn ${ready})</option>`;
    }).join('');

    return `
        <div class="loan-item">
            <select name="itemDevice" onchange="checkLoanRowStock(this)">${options}</select>
            <input name="itemQty" type="number" min="1" value="1" required onchange="checkLoanRowStock(this)">
            
        </div>
    `;
}

// Bao ngay khi nguoi dung nhap so luong vuot qua so luong con trong kho
// [RIÊNG history.php] cảnh báo khi số lượng vượt kho
function checkLoanRowStock(el) {
    const row = el.closest('.loan-item');
    const device = data.devices.find(d => d.id === Number(row.querySelector('[name="itemDevice"]').value));
    const qtyBox = row.querySelector('[name="itemQty"]');
    if (!device) return;
    const available = readyCount(device);
    const qty = Number(qtyBox.value);
    if (qty > available) {
        alert('Không đủ số lượng thiết bị trong kho!\n\nThiết bị: ' + device.name + '\nSố lượng còn sẵn: ' + available + '\nSố lượng yêu cầu: ' + qty);
        qtyBox.value = Math.max(1, available);
    }
}

// Them mot dong thiet bi vao phieu muon
// [RIÊNG history.php] nút "＋ Thêm thiết bị" trong form phiếu
function addLoanItemRow() {
    $('#loanItems').insertAdjacentHTML('beforeend', loanItemRowHtml());
}

// Xoa mot dong thiet bi (phieu phai con it nhat 1 dong)
// [RIÊNG history.php] nút Xóa dòng thiết bị trong form phiếu
function removeLoanItemRow(button) {
    if (document.querySelectorAll('#loanItems .loan-item').length <= 1) {
        alert('Phiếu mượn cần ít nhất 1 thiết bị');
        return;
    }

    button.closest('.loan-item').remove();
}

// ===== O CHON NGUOI MUON DANG GO TIM (combobox) =====
// Bo dau tieng Viet + chu thuong de tim "ngoc" van ra "Ngọc"
// [RIÊNG history.php]
function normalizeText(text) {
    return String(text || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase().trim();
}

// Chuan hoa SDT: bo khoang trang, dau cham
function cleanPhone(p) { return String(p || '').replace(/[^0-9+]/g, ''); }

// Tim ho so nguoi muon theo SDT (so sanh sau khi chuan hoa)
function findBorrowerByPhone(phone) {
    const c = cleanPhone(phone);
    if (c.length < 9) return null;
    return data.customer.find(b => cleanPhone(b.phone) === c) || null;
}

// Ghi chu trang thai duoi o nguoi muon
function setBorrowerStatus(text, kind) {
    const el = document.getElementById('borrowerStatus');
    if (!el) return;
    el.textContent = text;
    el.style.color = kind === 'dup' ? '#d97706' : (kind === 'new' ? '#16a34a' : '');
}

// Vi tri dong dang duoc tô sáng trong danh sach (de dung phim mui ten)
let borrowerActiveIndex = -1;
// Danh sach dang hien (da loc)
let borrowerShown = [];
// Truong dang go: 'name' hoac 'phone'
let borrowerSearchBy = 'name';

// Loc danh sach theo chu dang go roi ve lai
// [RIÊNG history.php]
function renderBorrowerList(by) {
    const list = document.getElementById('borrowerList');
    if (!list) return;
    borrowerSearchBy = by || borrowerSearchBy;

    const nameBox = document.getElementById('loanBorrowerSearch');
    const phoneBox = document.getElementById('loanPhoneSearch');
    const keyword = normalizeText(borrowerSearchBy === 'phone' ? phoneBox.value : nameBox.value);
    const phoneKeyword = (phoneBox.value || '').replace(/[\s.]/g, '');

    borrowerShown = data.customer.filter(function (b) {
        if (borrowerSearchBy === 'phone') {
            return phoneKeyword === '' || String(b.phone || '').replace(/[\s.]/g, '').includes(phoneKeyword);
        }
        return keyword === '' || normalizeText(b.name).includes(keyword);
    });
    borrowerActiveIndex = borrowerShown.length ? 0 : -1;

    if (borrowerShown.length === 0) {
        list.innerHTML = '<div class="combo-empty">Chưa có người này – nhập SĐT và đơn vị để thêm mới</div>';
    } else {
        list.innerHTML = borrowerShown.map(function (b, i) {
            return `<div class="combo-item${i === 0 ? ' active' : ''}" data-index="${i}" onmousedown="event.preventDefault(); pickBorrower(${b.id})">
                <b>${escapeHtml(b.name)}</b>
                <span>${escapeHtml(b.phone || '')}${b.unit ? ' · ' + escapeHtml(b.unit) : ''}</span>
            </div>`;
        }).join('');
    }
    list.classList.add('show');
}

// Mo danh sach khi bam vao o
function showBorrowerList(by) { renderBorrowerList(by || 'name'); }

// Moi lan go chu: bo lua chon cu va loc lai danh sach
function onBorrowerSearchInput(by) {
    const idBox = document.getElementById('loanBorrowerId');
    if (idBox && idBox.value !== '') {
        // Dang sua lai sau khi da chon -> huy lua chon cu
        idBox.value = '';
        setBorrowerExtra(null);
        // Xoa o con lai de khong bi lech thong tin
        const other = document.getElementById(by === 'phone' ? 'loanBorrowerSearch' : 'loanPhoneSearch');
        if (other) other.value = '';
    }
    if (by === 'phone') checkPhoneDuplicate();
    else renderBorrowerList('name');
}

// Dang go SDT: trung ho so cu thi bao + tu chon; chua co thi bao se them moi
let lastDupNotified = null;
function checkPhoneDuplicate() {
    const phoneBox = document.getElementById('loanPhoneSearch');
    const clean = cleanPhone(phoneBox.value);
    const found = findBorrowerByPhone(phoneBox.value);
    if (found) {
        if (lastDupNotified !== found.id) {
            lastDupNotified = found.id;
            alert('Trùng SĐT với người mượn "' + found.name + '" – đã tự điền thông tin từ hồ sơ.');
        }
        pickBorrower(found.id, true);
        setBorrowerStatus('Trùng SĐT: đã dùng hồ sơ có sẵn của ' + found.name + '.', 'dup');
        return;
    }
    lastDupNotified = null;
    renderBorrowerList('phone');
    if (clean.length >= 9) setBorrowerStatus('SĐT chưa có trong hệ thống: sẽ tự thêm vào mục Người mượn khi lưu phiếu.', 'new');
    else setBorrowerStatus('Nhập SĐT: nếu đã có hồ sơ sẽ tự điền, nếu chưa có sẽ tự thêm vào mục Người mượn khi lưu phiếu.');
}

// Phim mui ten / Enter / Esc trong danh sach
function onBorrowerKeydown(event) {
    const list = document.getElementById('borrowerList');
    if (!list || !list.classList.contains('show')) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!borrowerShown.length) return;
        borrowerActiveIndex = (borrowerActiveIndex + (event.key === 'ArrowDown' ? 1 : -1) + borrowerShown.length) % borrowerShown.length;
        list.querySelectorAll('.combo-item').forEach(function (el, i) {
            el.classList.toggle('active', i === borrowerActiveIndex);
            if (i === borrowerActiveIndex) el.scrollIntoView({ block: 'nearest' });
        });
    } else if (event.key === 'Enter') {
        if (borrowerActiveIndex >= 0) {
            event.preventDefault();
            pickBorrower(borrowerShown[borrowerActiveIndex].id);
        }
    } else if (event.key === 'Escape') {
        list.classList.remove('show');
    }
}

// Chon mot nguoi trong danh sach -> dien ten, SDT, don vi
function pickBorrower(id, fromPhone) {
    const found = data.customer.find(b => Number(b.id) === Number(id));
    if (!found) return;
    document.getElementById('loanBorrowerId').value = found.id;
    document.getElementById('loanBorrowerSearch').value = found.name;
    if (!fromPhone) document.getElementById('loanPhoneSearch').value = found.phone || '';
    setBorrowerExtra(found);
    document.getElementById('borrowerList').classList.remove('show');
    if (!fromPhone) setBorrowerStatus('Đã chọn hồ sơ có sẵn của ' + found.name + '.', 'dup');
}

// Chon nguoi co san: dien + khoa Don vi; bo chon: mo khoa va xoa
function setBorrowerExtra(found) {
    const unitBox = document.querySelector('#modalFields input[name="unit"]');
    if (!unitBox) return;
    unitBox.value = found ? (found.unit || '') : '';
    unitBox.readOnly = !!found;
    if (!found) {
        lastDupNotified = null;
        setBorrowerStatus('Nhập SĐT: nếu đã có hồ sơ sẽ tự điền, nếu chưa có sẽ tự thêm vào mục Người mượn khi lưu phiếu.');
    }
}

// Bam ra ngoai thi dong danh sach goi y
document.addEventListener('mousedown', function (e) {
    const list = document.getElementById('borrowerList');
    if (list && !e.target.closest('#borrowerCombo') && e.target.id !== 'loanPhoneSearch') {
        list.classList.remove('show');
    }
});

// Xoa / huy phieu muon (co hoi xac nhan)
// [RIÊNG history.php] nút Xóa chỉ hiện khi currentPage === "loans" (xem fullLoanRows)
async function deleteLoan(id) {
    let loan = data.loans.find(function (l) {
        return Number(l.id) === Number(id);
    });
    if (loan === undefined) return;

    let message = 'Bạn có chắc muốn xóa phiếu #' + id + ' của ' + loan.borrower + '?';
    if (loan.status !== 'Đã trả') {
        message += '\n\nPhiếu chưa trả: thiết bị sẽ được hoàn lại vào kho.';
    }
    if (!confirm(message)) return;

    try {
        await api('../api/data.php', 'POST', { action: 'loan_delete', id: Number(id) });
        await reloadData();
        render();
        alert('Đã xóa phiếu mượn #' + id);
    } catch (error) {
        alert(error.message);
    }
}

// Chay khi mo trang
render();
