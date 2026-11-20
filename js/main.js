
// main.js - rieng cho TRANG CHU (main.php)
// Nap sau core.js

// Cac dong bang "Phieu muon gan day"
function loanRows(rows) {
    return rows.map(function (loan) {
        return `
            <tr>
                <td>#${loan.id}</td>
                <td>${escapeHtml(loan.borrower)}</td>
                <td>${escapeHtml(loanItemsText(loan))}</td>
                <td>${loan.dueDate}</td>
                <td>
                    <span class="status ${statusClass(loan.status)}">${escapeHtml(loan.status)}</span>
                </td>
            </tr>
        `;

    }).join('');
}

// Ve bieu do cot 6 thang tu so lieu that (chieu cao tinh theo % cua gia tri lon nhat)
function renderChart(months) {
    let box = document.getElementById('loanChart');
    if (box === null) return;

    let max = 1;
    months.forEach(function (m) {
        max = Math.max(max, m.borrowed, m.returned);
    });

    box.innerHTML = months.map(function (m) {
        let h1 = Math.round(m.borrowed * 100 / max);
        let h2 = Math.round(m.returned * 100 / max);
        return '<div class="bar-group">' +
            '<div class="bar" data-h="' + h1 + '" title="Phiếu mượn: ' + m.borrowed + '"></div>' +
            '<div class="bar alt" data-h="' + h2 + '" title="Phiếu trả: ' + m.returned + '"></div>' +
            '<span class="bar-label">' + escapeHtml(m.label) + ' (' + m.borrowed + '/' + m.returned + ')</span>' +
            '</div>';
    }).join('');

    // Chieu cao cot lay tu du lieu (data-h) nen gan bang JS, khong viet style trong HTML
    box.querySelectorAll('[data-h]').forEach(function (bar) {
        bar.style.height = bar.dataset.h + '%';
    });

    // So sanh thang nay voi thang truoc
    let trend = document.getElementById('chartTrend');
    if (trend !== null && months.length >= 2) {
        let cur = months[months.length - 1].borrowed;
        let prev = months[months.length - 2].borrowed;
        let text = '—';
        let cls = 'status blue';
        if (prev > 0) {
            let pct = Math.round((cur - prev) * 100 / prev);
            text = (pct >= 0 ? '+' : '') + pct + '% so với tháng trước';
            cls = 'status ' + (pct >= 0 ? 'green' : 'red');
        } else if (cur > 0) {
            text = 'Tháng này: ' + cur + ' phiếu';
        }
        trend.textContent = text;
        trend.className = cls;
    }
}

// Danh sach xep hang (top thiet bi / top nguoi muon)
function renderRank(id, rows, line) {
    let box = document.getElementById(id);
    if (box === null) return;

    if (rows.length === 0) {
        box.innerHTML = '<p class="rank-empty">Chưa có dữ liệu</p>';
        return;
    }

    box.innerHTML = rows.map(function (row, index) {
        return '<div class="rank-item">' +
            '<span class="rank-no">' + (index + 1) + '</span>' +
            '<div class="rank-info"><p class="txt-strong">' + escapeHtml(row.name) + '</p>' +
            '<p class="txt-small">' + escapeHtml(line(row)) + '</p></div>' +
            '</div>';
    }).join('');
}

// Do thong ke that tu API vao trang chu
function renderStats() {
    let st = data.stats;

    renderChart(st.months);

    renderRank('topDevices', st.topDevices, function (row) {
        return row.qty + ' thiết bị - ' + row.loans + ' phiếu';
    });
    renderRank('topBorrowers', st.topBorrowers, function (row) {
        return row.unit + ' - ' + row.loans + ' phiếu';
    });

    setText('totalLoans', st.totalLoans);
    setText('returnRate', st.returnRate + '%');
    setText('overdueRate', st.overdueRate + '%');
    document.getElementById('returnBar').style.width = st.returnRate + '%';
    document.getElementById('overdueBar').style.width = st.overdueRate + '%';
}

// Do du lieu vao trang chu
function renderPage() {
    renderStats();


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
                '<p class="txt-strong">' + title + '</p>' +
                '<p>' + escapeHtml(act.borrower) + ' - ' + escapeHtml(act.summary) + '</p>' +
                '<time>' + formatTime(act.time) + '</time>' +
                '</div>' +
                '</div>';

        }).join('');
    }
}

// Chay khi mo trang
render();
