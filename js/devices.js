// devices.js - rieng cho THIET BI (devices.php) (nap sau core.js)

// Cac dong bang thiet bi
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
const stockActions = {
    add: ['Nhập thêm', 'green'],
    broken: ['Báo hỏng', 'red'],
    fixed: ['Sửa xong', 'blue'],
    dispose: ['Thanh lý', 'yellow']
};

// Lich su kho: 8 thao tac gan nhat
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
function renderPage() {
    filterRows();
    renderStockLog();
}

// Chay khi mo trang
render();
