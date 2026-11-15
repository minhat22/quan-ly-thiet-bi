// main.js - rieng cho TRANG CHU (main.html) (nap sau core.js)

// Cac dong bang "Phieu muon gan day"
function loanRows(rows) {
    return rows.map(function (loan) {
        return `
            <tr>
                <td>#${loan.id}</td>
                <td>${loan.borrower}</td>
                <td>${loan.device} × ${loan.qty}</td>
                <td>${loan.dueDate}</td>
                <td>
                    <span class="status ${statusClass(loan.status)}">${loan.status}</span>
                </td>
            </tr>
        `;

    }).join('');
}

// Do du lieu vao trang chu
function renderPage() {
    // Thong ke 4 o tren cung
    let total = 0;

    data.devices.forEach(function (device) {
        total += Number(device.qty);
    });

    let active = data.loans.filter(function (loan) {
        return loan.status === 'Đang mượn';
    }).length;

    let overdue = data.loans.filter(function (loan) {
        return loan.status === 'Quá hạn';
    }).length;

    let ready = data.devices.filter(function (device) {
        return device.status === 'Sẵn sàng';
    }).length;

    setText('statTotal', total);
    setText('statActive', active);
    setText('statReady', ready);
    setText('statOverdue', overdue);

    fillRows(loanRows(data.loans.slice(0, 4)));

    // Hoat dong gan day: lay tu nhat ky
    let activityBox = document.getElementById('activityList');

    if (activityBox !== null) {
        activityBox.innerHTML = data.activities.slice(0, 3).map(function (act) {
            let icon = 'main-add.png';
            let title = 'Tạo phiếu mượn mới';

            if (act.type === 'return') {
                icon = 'main-HoanTra.png';
                title = 'Thiết bị được hoàn trả';
            }

            return '<div class="activity-item">' +
                '<img class="activity-icon" src="../image/' + icon + '" alt="">' +
                '<div>' +
                '<strong>' + title + '</strong>' +
                '<p>' + act.borrower + ' · ' + act.qty + ' ' + act.device + '</p>' +
                '<time>' + formatTime(act.time) + '</time>' +
                '</div>' +
                '</div>';

        }).join('');
    }
}

// Chay khi mo trang
render();
