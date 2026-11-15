// devices.js - rieng cho THIET BI (devices.html) (nap sau core.js)

// Cac dong bang thiet bi
function deviceRows(rows) {
    return rows.map(function (device) {
        return `
            <tr>
                <td>
                    <div class="device-cell">
                        <div class="device-pic">${device.icon || '▣'}</div>
                        <div>
                            <b>${device.name}</b>
                            <small>Kho thiết bị GearFlow</small>
                        </div>
                    </div>
                </td>
                <td>TB-${String(device.id).padStart(3, '0')}</td>
                <td>${device.type}</td>
                <td>${device.qty}</td>
                <td>
                    <span class="status ${statusClass(device.status)}">${device.status}</span>
                </td>
                <td>
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
        let information = (device.name + device.type).toLowerCase();

        return information.includes(search) &&
               (status === '' || device.status === status);
    });

    fillRows(deviceRows(result));
}

// Do du lieu vao trang
function renderPage() {
    filterRows();
}

// Chay khi mo trang
render();
