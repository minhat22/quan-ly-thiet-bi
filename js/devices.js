/*
   devices.js  —  FILE RIÊNG cho trang THIẾT BỊ (devices.php)
*/

// Cac dong bang thiet bi
// [RIÊNG devices.php]
function deviceRows(rows) {
    return rows.map(function (device) {
        return `
            <tr>
                <td>
                    <div class="device-cell">
                        <img class="device-pic" src="../images/device-default-icon.png" alt="">
                        <div>
                            <b>${escapeHtml(device.name)}</b>
                        </div>
                    </div>
                </td>
                <td>TB-${String(device.id).padStart(3, '0')}</td>
                <td>${escapeHtml(device.model || '')}</td>
                <td>${escapeHtml(device.type)}</td>
                <td>${device.qty}</td>
                <td>${borrowedCount(device.id)}</td>
                <td>${Number(device.maintenance || 0)}</td>
                <td>
                    <span class="status ${readyCount(device) > 0 ? 'green' : 'red'}">${readyCount(device)}</span>
                </td>
                <td>
                    <button class="action-btn" onclick="openStockModal(${device.id})">Điều chỉnh kho</button>
                    <button class="action-btn" onclick="editItem('device', ${device.id})">Sửa</button>
                    <button class="action-btn" onclick="deleteItem('device', ${device.id})">Xóa</button>
                </td>
            </tr>
        `;

    }).join('');
}

// Tim kiem + loc theo tinh trang
// [RIÊNG devices.php] (history.js và customers.js cũng có filterRows riêng, cùng tên nhưng khác nội dung)
function filterRows() {
    let searchBox = document.getElementById('searchBox');
    let statusBox = document.getElementById('filterStatus');

    let search = searchBox ? searchBox.value.toLowerCase() : '';
    let status = statusBox ? statusBox.value : '';

    let result = data.devices.filter(function (device) {
        let information = (device.name + ' ' + (device.model || '') + ' ' + device.type).toLowerCase();

        let match = true;

        if (status === 'available') {
            match = readyCount(device) > 0;
        } else if (status === 'out') {
            match = readyCount(device) === 0;
        } else if (status === 'borrowed') {
            match = borrowedCount(device.id) > 0;
        } else if (status === 'maintenance') {
            match = Number(device.maintenance || 0) > 0;
        }

        return information.includes(search) && match;
    });

    fillRows(deviceRows(result));
}

// Ten va mau cua tung thao tac kho
// [RIÊNG devices.php]
const stockActions = {
    add: ['Nhập thêm', 'green'],
    broken: ['Báo hỏng', 'red'],
    fixed: ['Sửa xong', 'blue'],
    dispose: ['Thanh lý', 'yellow']
};

// Lich su kho: 8 thao tac gan nhat
// [RIÊNG devices.php]
function renderStockLog() {
    let body = document.getElementById('stockLogBody');

    if (body === null) {
        return;
    }

    if (data.stockLog.length === 0) {
        body.innerHTML = '<tr><td colspan="5">Chưa có thao tác kho nào</td></tr>';
        return;
    }

    body.innerHTML = data.stockLog.slice(0, 8).map(function (log) {
        let info = stockActions[log.action];

        return `
            <tr>
                <td>${formatTime(log.time)}</td>
                <td>${escapeHtml(log.deviceName)}</td>
                <td><span class="status ${info[1]}">${info[0]}</span></td>
                <td>${log.amount}</td>
                <td>${log.note ? escapeHtml(log.note) : '—'}</td>
            </tr>
        `;
    }).join('');
}

// Do du lieu vao trang
// [RIÊNG devices.php] core.render() gọi hàm này
function renderPage() {
    filterRows();
    renderStockLog();
}


// HÀM CHỈ CỦA TRANG THIẾT BỊ — chuyển từ core.js sang  [RIÊNG devices.php]
// [RIÊNG devices.php] nút "Điều chỉnh kho" trong deviceRows
// Mo form dieu chinh kho cho mot thiet bi
function openStockModal(id) {
    let device = data.devices.find(function (d) {
        return d.id === id;
    });

    if (device === undefined) {
        return;
    }

    modalType = 'stock';
    editing = device;

    $('#modalTitle').textContent = 'Điều chỉnh kho: ' + device.name;

    $('#modalFields').innerHTML = `
        <div class="form-group full">
            <label>Kho hiện tại</label>
            <div class="stock-summary">
                Tổng <b>${device.qty}</b> /
                Đang mượn <b>${borrowedCount(device.id)}</b> /
                Bảo trì <b>${Number(device.maintenance || 0)}</b> /
                Sẵn sàng <b>${readyCount(device)}</b>
            </div>
        </div>
        <div class="form-group full">
            <label>Thao tác</label>
            <select name="action">
                <option value="add">Nhập thêm (mua thêm thiết bị)</option>
                <option value="broken">Báo hỏng (chuyển sang bảo trì)</option>
                <option value="fixed">Sửa xong (đưa về sẵn sàng)</option>
                <option value="dispose">Thanh lý (loại khỏi kho)</option>
            </select>
        </div>
        <div class="form-group">
            <label>Số lượng</label>
            <input name="amount" type="number" min="1" value="1" required>
        </div>
        <div class="form-group">
            <label>Ghi chú</label>
            <input name="note" type="text" placeholder="Không bắt buộc">
        </div>
    `;

    $('#modalBackdrop').classList.add('show');
}

// [RIÊNG devices.php] nút "Xóa" trong deviceRows (gọi api action device_delete)
// Xoa thiet bi / nguoi muon (co hoi xac nhan)
async function deleteItem(type, id) {
    if (type !== 'device') { alert('Quản lý người mượn tại trang Người mượn'); return; }
    if (!confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try { await api('../api/data.php','POST',{action:'device_delete',id}); await reloadData(); render(); alert('Đã xóa thiết bị'); }
    catch(error) { alert(error.message); }
}

// Chay khi mo trang
render();
