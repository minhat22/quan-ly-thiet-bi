
// main.js - rieng cho TRANG CHU (main.html)
// Nap sau core.js

// Cac dong bang "Phieu muon gan day"
function loanRows(rows) {
    return rows.map(function (loan) {
        return `
            <tr>
                <td>#${loan.id}</td>
                <td>${loan.borrower}</td>
                <td>${loanItemsText(loan)}</td>
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

    // So phieu dang muon
    let active = data.loans.filter(function (loan) {
        return loan.status === 'Đang mượn';
    }).length;

    // So phieu qua han
    let overdue = data.loans.filter(function (loan) {
        return loan.status === 'Quá hạn';
    }).length;

    // So loai thiet bi con san sang
    let ready = data.devices.filter(function (device) {
        return readyCount(device) > 0;
    }).length;

    setText('statTotal', total);
    setText('statActive', active);
    setText('statReady', ready);
    setText('statOverdue', overdue);

    // Hien thi 4 phieu muon gan day
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
                '<img class="activity-icon" src="../images/' + icon + '" alt="">' +
                '<div>' +
                '<strong>' + title + '</strong>' +
                '<p>' + act.borrower + ' · ' + act.summary + '</p>' +
                '<time>' + formatTime(act.time) + '</time>' +
                '</div>' +
                '</div>';

        }).join('');
    }
}

// Chay khi mo trang
render();
