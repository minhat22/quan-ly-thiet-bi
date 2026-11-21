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
            <button type="button" class="action-btn" onclick="removeLoanItemRow(this)">Xóa</button>
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
        toast('Phiếu mượn cần ít nhất 1 thiết bị');
        return;
    }

    button.closest('.loan-item').remove();
}

// Chon ma nguoi muon trong danh sach MySQL va tu dien thong tin tu ho so
// [RIÊNG history.php] chọn người mượn -> tự điền SĐT, Đơn vị
function fillBorrowerDetails(id) {
    const found = data.customer.find(b => Number(b.id) === Number(id));
    const phoneBox = document.querySelector('#modalFields input[name="phone"]');
    const unitBox = document.querySelector('#modalFields input[name="unit"]');
    if (phoneBox) phoneBox.value = found ? found.phone : '';
    if (unitBox) unitBox.value = found ? found.unit : '';

    // Chua chon nguoi muon: an SDT + Don vi (o chon nguoi muon rong het hang).
    // Chon xong: hien SDT + Don vi (o chon nguoi muon con nua hang, SDT nam ben canh).
    document.querySelectorAll('#modalFields .borrower-extra').forEach(function (group) {
        group.classList.toggle('show', !!found);
    });
    const select = document.getElementById('loanBorrowerSelect');
    if (select) select.closest('.form-group').classList.toggle('full', !found);
}

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
        toast('Đã xóa phiếu mượn #' + id);
    } catch (error) {
        toast(error.message);
    }
}

// Chay khi mo trang
render();
