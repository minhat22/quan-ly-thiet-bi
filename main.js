// ==========================================
// 1. KHAI BAO DU LIEU BAN DAU
// ==========================================

// Du lieu mau cua he thong
const seed = {
    devices: [
        {
            id: 1,
            name: 'Laptop Dell Latitude',
            type: 'Máy tính',
            status: 'Đang cho mượn',
            qty: 12,
            icon: '💻'
        },
        {
            id: 2,
            name: 'Máy chiếu Epson',
            type: 'Thiết bị trình chiếu',
            status: 'Sẵn sàng',
            qty: 6,
            icon: '📽️'
        },
        {
            id: 3,
            name: 'Bộ Arduino Uno',
            type: 'Thiết bị thực hành',
            status: 'Sẵn sàng',
            qty: 20,
            icon: '🔌'
        },
        {
            id: 4,
            name: 'Camera Canon',
            type: 'Thiết bị ghi hình',
            status: 'Bảo trì',
            qty: 4,
            icon: '📷'
        },
        {
            id: 5,
            name: 'Máy đo điện đa năng',
            type: 'Dụng cụ đo',
            status: 'Sẵn sàng',
            qty: 10,
            icon: '🔧'
        }
    ],

    // Danh sach nguoi muon
    borrowers: [
        {
            id: 1,
            name: 'Nguyễn Minh Anh',
            unit: 'Khoa Công nghệ thông tin',
            phone: '0901 234 567'
        },
        {
            id: 2,
            name: 'Trần Hoàng Nam',
            unit: 'Phòng thí nghiệm A',
            phone: '0912 345 678'
        },
        {
            id: 3,
            name: 'Lê Thảo Vy',
            unit: 'Khoa Điện - Điện tử',
            phone: '0987 654 321'
        }
    ],

    // Danh sach phieu muon
    loans: [
        {
            id: 1001,
            borrower: 'Nguyễn Minh Anh',
            device: 'Laptop Dell Latitude',
            qty: 2,
            borrowDate: '2026-10-27',
            dueDate: '2026-11-02',
            returnDate: '',
            status: 'Đang mượn'
        },
        {
            id: 1002,
            borrower: 'Trần Hoàng Nam',
            device: 'Máy chiếu Epson',
            qty: 1,
            borrowDate: '2026-10-25',
            dueDate: '2026-10-29',
            returnDate: '',
            status: 'Quá hạn'
        },
        {
            id: 1003,
            borrower: 'Lê Thảo Vy',
            device: 'Bộ Arduino Uno',
            qty: 3,
            borrowDate: '2026-10-20',
            dueDate: '2026-10-26',
            returnDate: '2026-10-26',
            status: 'Đã trả'
        }
    ]
};


// ==========================================
// 2. KHOI TAO CAC BIEN SU DUNG TRONG CHUONG TRINH
// ==========================================

// Lay du lieu da luu trong LocalStorage
let savedData = localStorage.getItem('gearflow_demo');

// Neu da co du lieu thi su dung du lieu cu
// Neu chua co thi su dung du lieu mau
let data;

if (savedData !== null) {
    data = JSON.parse(savedData);
} else {
    data = seed;
}

// Trang hien tai dang duoc chon
let currentPage = document.body.dataset.page;

// Luu thong tin phan tu dang chinh sua
let editing = null;

// Luu loai form dang mo
let modalType = '';


// ==========================================
// 3. CAC HAM HO TRO
// ==========================================

// Ham lay phan tu HTML theo id hoac selector
function $(selector) {
    return document.querySelector(selector);
}


// Ham luu du lieu vao LocalStorage
function save() {
    localStorage.setItem('gearflow_demo', JSON.stringify(data));
}


// Ham dinh dang so theo tieng Viet
function money(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
}


// Ham hien thi thong bao cho nguoi dung
function toast(message) {
    let toastBox = $('#toast');

    toastBox.textContent = message;
    toastBox.classList.add('show');

    setTimeout(function () {
        toastBox.classList.remove('show');
    }, 2200);
}


// Ham xac dinh mau sac cua trang thai
function statusClass(status) {

    if (status === 'Sẵn sàng' || status === 'Đã trả') {
        return 'green';
    } 
    else if (status === 'Quá hạn' || status === 'Bảo trì') {
        return 'red';
    } 
    else if (status === 'Đang mượn' || status === 'Đang cho mượn') {
        return 'blue';
    } 
    else {
        return 'yellow';
    }
}


// Ham tao phan tieu de cho moi trang
function head(kicker, title, description, button = '') {

    return `
        <div class="page-head">

            <div>
                <div class="eyebrow">${kicker}</div>

                <h1>${title}</h1>

                <p>${description}</p>
            </div>

            ${button}

        </div>
    `;
}


// Ham tao the thong ke tren Dashboard
function stat(label, value, icon, note, color = 'var(--green)') {

    return `
        <div class="stat" style="--glow:${color}">

            <div class="stat-top">
                <span>${label}</span>
                <span class="stat-icon">${icon}</span>
            </div>

            <strong>${value}</strong>

            <small>${note}</small>

        </div>
    `;
}


// ==========================================
// 4. TRANG TONG QUAN DASHBOARD
// ==========================================

function dashboard() {

    // Tinh tong so luong thiet bi
    let total = 0;

    data.devices.forEach(function (device) {
        total += Number(device.qty);
    });

    // Dem so phieu dang muon
    let active = data.loans.filter(function (loan) {
        return loan.status === 'Đang mượn';
    }).length;

    // Dem so phieu qua han
    let overdue = data.loans.filter(function (loan) {
        return loan.status === 'Quá hạn';
    }).length;

    // Dem so loai thiet bi dang san sang
    let ready = data.devices.filter(function (device) {
        return device.status === 'Sẵn sàng';
    }).length;


    // Tao noi dung trang Dashboard
    return head(
        'OVERVIEW / 01',
        'Tổng quan hệ thống',
        'Theo dõi nhanh tình hình thiết bị và hoạt động mượn – trả.',
        '<button class="btn btn-primary" onclick="openModal(\'loan\')">＋ Tạo phiếu mượn</button>'
    )

    + `

        <div class="stats">

            ${stat(
                'Tổng số thiết bị',
                total,
                '▣',
                'Trong kho và đang lưu hành'
            )}

            ${stat(
                'Phiếu đang mượn',
                active,
                '⇄',
                'Cần theo dõi lịch trả',
                'var(--blue)'
            )}

            ${stat(
                'Thiết bị sẵn sàng',
                ready,
                '✓',
                'Có thể đăng ký mượn'
            )}

            ${stat(
                'Phiếu quá hạn',
                overdue,
                '◷',
                'Cần xử lý ngay',
                'var(--red)'
            )}

        </div>


        <div class="grid-main">

            <div class="panel">

                <div class="panel-head">

                    <div>
                        <h3>Hoạt động mượn thiết bị</h3>
                        <p>Biểu đồ minh họa số lượt mượn trong 6 tháng</p>
                    </div>

                    <span class="status green">+12.8%</span>

                </div>

                <div class="chart">

                    ${[38, 56, 45, 72, 61, 88].map(function (value, index) {

                        let months = ['T5', 'T6', 'T7', 'T8', 'T9', 'T10'];

                        return `
                            <div class="bar-group">

                                <div class="bar" style="height:${value}%"></div>

                                <div class="bar alt"
                                    style="height:${Math.max(10, value - 22)}%">
                                </div>

                                <span class="bar-label">${months[index]}</span>

                            </div>
                        `;

                    }).join('')}

                </div>

                <div class="chart-legend">
                    <span><i class="legend-dot"></i>Lượt mượn</span>
                    <span><i class="legend-dot blue"></i>Lượt trả</span>
                </div>

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>
                        <h3>Hoạt động gần đây</h3>
                        <p>Cập nhật trong hệ thống</p>
                    </div>

                    <span style="color:var(--green)">•••</span>

                </div>


                <div class="activity">

                    <div class="activity-item">

                        <div class="activity-icon">＋</div>

                        <div>
                            <strong>Tạo phiếu mượn mới</strong>
                            <p>Nguyễn Minh Anh · 2 Laptop Dell</p>
                            <time>Hôm nay, 09:15</time>
                        </div>

                    </div>


                    <div class="activity-item">

                        <div class="activity-icon">↩</div>

                        <div>
                            <strong>Thiết bị được hoàn trả</strong>
                            <p>Lê Thảo Vy · Bộ Arduino Uno</p>
                            <time>Hôm qua, 15:40</time>
                        </div>

                    </div>


                    <div class="activity-item">

                        <div class="activity-icon">!</div>

                        <div>
                            <strong>Phiếu mượn sắp quá hạn</strong>
                            <p>Trần Hoàng Nam · Máy chiếu Epson</p>
                            <time>Hôm qua, 08:30</time>
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <div class="lower-grid">

            <div class="panel">

                <div class="panel-head">

                    <div>
                        <h3>Phiếu mượn gần đây</h3>
                        <p>Danh sách giao dịch mới nhất</p>
                    </div>

                    <button class="text-link" onclick="go('loans')">
                        Xem tất cả →
                    </button>

                </div>

                ${loanTable(data.loans.slice(0, 4))}

            </div>


            <div class="panel">

                <div class="panel-head">

                    <div>
                        <h3>Thao tác nhanh</h3>
                        <p>Truy cập chức năng thường dùng</p>
                    </div>

                </div>


                <div class="quick-grid">

                    <button class="quick" onclick="go('devices')">
                        <span>▣</span>
                        <b>Quản lý thiết bị</b>
                        <small>Thêm và cập nhật kho</small>
                    </button>

                    <button class="quick" onclick="go('borrowers')">
                        <span>♙</span>
                        <b>Người mượn</b>
                        <small>Thông tin cá nhân</small>
                    </button>

                    <button class="quick" onclick="openModal('loan')">
                        <span>⇄</span>
                        <b>Tạo phiếu mượn</b>
                        <small>Ghi nhận giao dịch</small>
                    </button>

                    <button class="quick" onclick="go('returns')">
                        <span>↩</span>
                        <b>Theo dõi trả</b>
                        <small>Kiểm tra hạn trả</small>
                    </button>

                </div>

            </div>

        </div>

    `;
}


// ==========================================
// 5. HIEN THI BANG PHIEU MUON GAN DAY
// ==========================================

function loanTable(rows) {

    // Kiem tra danh sach co du lieu hay khong
    if (rows.length === 0) {
        return `
            <div class="empty">
                <div>▤</div>
                Chưa có phiếu mượn
            </div>
        `;
    }

    return `

        <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>MÃ PHIẾU</th>
                        <th>NGƯỜI MƯỢN</th>
                        <th>THIẾT BỊ</th>
                        <th>HẠN TRẢ</th>
                        <th>TRẠNG THÁI</th>
                    </tr>
                </thead>


                <tbody>

                    ${rows.map(function (loan) {

                        return `
                            <tr>

                                <td>#${loan.id}</td>

                                <td>${loan.borrower}</td>

                                <td>${loan.device} × ${loan.qty}</td>

                                <td>${loan.dueDate}</td>

                                <td>
                                    <span class="status ${statusClass(loan.status)}">
                                        ${loan.status}
                                    </span>
                                </td>

                            </tr>
                        `;

                    }).join('')}

                </tbody>

            </table>

        </div>

    `;
}

// ==========================================
// 6. TRANG QUAN LY THIET BI
// ==========================================

function devicesPage() {

    return head(
        'ASSET MANAGEMENT / 02',
        'Quản lý thiết bị',
        'Quản lý danh mục, số lượng và tình trạng thiết bị.',
        '<button class="btn btn-primary" onclick="openModal(\'device\')">＋ Thêm thiết bị</button>'
    )

    + `

        <div class="panel">

            <div class="toolbar">

                <div class="search">
                    <input
                        id="searchBox"
                        placeholder="Tìm tên hoặc loại thiết bị..."
                        oninput="filterRows()"
                    >
                </div>

                <select id="filterStatus" onchange="filterRows()">

                    <option value="">Tất cả tình trạng</option>

                    <option>Sẵn sàng</option>

                    <option>Đang cho mượn</option>

                    <option>Bảo trì</option>

                </select>

            </div>

            <div id="tableArea">
                ${deviceTable(data.devices)}
            </div>

        </div>

    `;
}


// ==========================================
// 7. HIEN THI DANH SACH THIET BI
// ==========================================

function deviceTable(rows) {

    return `

        <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>THIẾT BỊ</th>
                        <th>MÃ ID</th>
                        <th>LOẠI</th>
                        <th>SỐ LƯỢNG</th>
                        <th>TÌNH TRẠNG</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>


                <tbody>

                    ${rows.map(function (device) {

                        return `
                            <tr>

                                <td>
                                    <div class="device-cell">

                                        <div class="device-pic">
                                            ${device.icon || '▣'}
                                        </div>

                                        <div>
                                            <b>${device.name}</b>
                                            <small>Kho thiết bị GearFlow</small>
                                        </div>

                                    </div>
                                </td>

                                <td>
                                    TB-${String(device.id).padStart(3, '0')}
                                </td>

                                <td>${device.type}</td>

                                <td>${device.qty}</td>

                                <td>
                                    <span class="status ${statusClass(device.status)}">
                                        ${device.status}
                                    </span>
                                </td>

                                <td>

                                    <button
                                        class="action-btn"
                                        onclick="editItem('device', ${device.id})"
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        class="action-btn"
                                        onclick="deleteItem('device', ${device.id})"
                                    >
                                        Xóa
                                    </button>

                                </td>

                            </tr>
                        `;

                    }).join('')}

                </tbody>

            </table>

        </div>

    `;
}


// ==========================================
// 8. TRANG QUAN LY NGUOI MUON
// ==========================================

function borrowersPage() {

    return head(
        'PEOPLE / 03',
        'Quản lý người mượn',
        'Lưu trữ thông tin cá nhân và đơn vị công tác.',
        '<button class="btn btn-primary" onclick="openModal(\'borrower\')">＋ Thêm người mượn</button>'
    )

    + `

        <div class="panel">

            <div class="toolbar">

                <div class="search">

                    <input
                        id="searchBox"
                        placeholder="Tìm họ tên, đơn vị, số điện thoại..."
                        oninput="filterRows()"
                    >

                </div>

            </div>

            <div id="tableArea">
                ${borrowerTable(data.borrowers)}
            </div>

        </div>

    `;
}


// ==========================================
// 9. HIEN THI DANH SACH NGUOI MUON
// ==========================================

function borrowerTable(rows) {

    return `

        <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>NGƯỜI MƯỢN</th>
                        <th>MÃ ID</th>
                        <th>ĐƠN VỊ</th>
                        <th>SỐ ĐIỆN THOẠI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>


                <tbody>

                    ${rows.map(function (borrower) {

                        // Lay chu cai dau cua hai tu cuoi trong ho ten
                        let words = borrower.name.split(' ');
                        let avatar = words.slice(-2).map(function (word) {
                            return word[0];
                        }).join('');

                        return `
                            <tr>

                                <td>

                                    <div class="device-cell">

                                        <div class="avatar">
                                            ${avatar}
                                        </div>

                                        <b>${borrower.name}</b>

                                    </div>

                                </td>

                                <td>
                                    NM-${String(borrower.id).padStart(3, '0')}
                                </td>

                                <td>${borrower.unit}</td>

                                <td>${borrower.phone}</td>

                                <td>

                                    <button
                                        class="action-btn"
                                        onclick="editItem('borrower', ${borrower.id})"
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        class="action-btn"
                                        onclick="deleteItem('borrower', ${borrower.id})"
                                    >
                                        Xóa
                                    </button>

                                </td>

                            </tr>
                        `;

                    }).join('')}

                </tbody>

            </table>

        </div>

    `;
}

// ==========================================
// 10. TRANG QUAN LY PHIEU MUON
// ==========================================

function loansPage() {

    return head(
        'BORROWING / 04',
        'Quản lý phiếu mượn',
        'Tạo phiếu, ghi nhận thiết bị và thời gian mượn – trả.',
        '<button class="btn btn-primary" onclick="openModal(\'loan\')">＋ Tạo phiếu mượn</button>'
    )

    + `

        <div class="panel">

            <div class="toolbar">

                <div class="search">

                    <input
                        id="searchBox"
                        placeholder="Tìm mã phiếu hoặc người mượn..."
                        oninput="filterRows()"
                    >

                </div>


                <select id="filterStatus" onchange="filterRows()">

                    <option value="">Tất cả trạng thái</option>

                    <option>Đang mượn</option>

                    <option>Quá hạn</option>

                    <option>Đã trả</option>

                </select>

            </div>


            <div id="tableArea">
                ${fullLoanTable(data.loans)}
            </div>

        </div>

    `;
}


// ==========================================
// 11. HIEN THI DAY DU DANH SACH PHIEU MUON
// ==========================================

function fullLoanTable(rows) {

    return `

        <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>MÃ PHIẾU</th>
                        <th>NGƯỜI MƯỢN</th>
                        <th>THIẾT BỊ</th>
                        <th>SL</th>
                        <th>NGÀY MƯỢN</th>
                        <th>HẸN TRẢ</th>
                        <th>TRẠNG THÁI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>


                <tbody>

                    ${rows.map(function (loan) {

                        return `
                            <tr>

                                <td>#${loan.id}</td>

                                <td>${loan.borrower}</td>

                                <td>${loan.device}</td>

                                <td>${loan.qty}</td>

                                <td>${loan.borrowDate}</td>

                                <td>${loan.dueDate}</td>

                                <td>

                                    <span class="status ${statusClass(loan.status)}">
                                        ${loan.status}
                                    </span>

                                </td>

                                <td>

                                    ${loan.status !== 'Đã trả'

                                        ? `
                                            <button
                                                class="action-btn"
                                                onclick="markReturned(${loan.id})"
                                            >
                                                Xác nhận trả
                                            </button>
                                        `

                                        : '—'
                                    }

                                </td>

                            </tr>
                        `;

                    }).join('')}

                </tbody>

            </table>

        </div>

    `;
}


// ==========================================
// 12. TRANG THEO DOI TRA THIET BI
// ==========================================

function returnsPage() {

    // Lay cac phieu chua duoc tra
    let active = data.loans.filter(function (loan) {
        return loan.status !== 'Đã trả';
    });


    // Dem so phieu qua han
    let overdue = active.filter(function (loan) {
        return loan.status === 'Quá hạn';
    }).length;


    // Dem so phieu dang muon
    let borrowing = active.filter(function (loan) {
        return loan.status === 'Đang mượn';
    }).length;


    // Dem so phieu da tra
    let returned = data.loans.filter(function (loan) {
        return loan.status === 'Đã trả';
    }).length;


    return head(
        'RETURN TRACKING / 05',
        'Theo dõi trả thiết bị',
        'Kiểm tra hạn trả, xác nhận hoàn trả và ghi nhận tình trạng.',
        ''
    )

    + `

        <div class="stats">

            ${stat(
                'Chờ hoàn trả',
                active.length,
                '↩',
                'Phiếu chưa hoàn tất'
            )}

            ${stat(
                'Quá hạn',
                overdue,
                '◷',
                'Cần liên hệ người mượn',
                'var(--red)'
            )}

            ${stat(
                'Đã hoàn tất',
                returned,
                '✓',
                'Đã xác nhận trả'
            )}

            ${stat(
                'Đang mượn',
                borrowing,
                '⇄',
                'Trong thời hạn',
                'var(--blue)'
            )}

        </div>


        <div class="panel">

            <div class="panel-head">

                <div>
                    <h3>Danh sách cần theo dõi</h3>
                    <p>Xác nhận trả sau khi kiểm tra thiết bị thực tế</p>
                </div>

            </div>

            ${fullLoanTable(active)}

        </div>

    `;
}

// ==========================================
// 13. HAM HIEN THI NOI DUNG TRANG
// ==========================================

function render() {

    // Ten hien thi tren thanh dieu huong
    let names = {
        dashboard: 'Dashboard',
        devices: 'Thiết bị',
        borrowers: 'Người mượn',
        loans: 'Phiếu mượn',
        returns: 'Theo dõi trả'
    };


    // Cap nhat ten trang hien tai
    $('#crumb').textContent = names[currentPage];


    // Chon ham tuong ung voi trang dang mo
    let pages = {
        dashboard: dashboard,
        devices: devicesPage,
        borrowers: borrowersPage,
        loans: loansPage,
        returns: returnsPage
    };


    // Hien thi noi dung trang len giao dien
    $('#page').innerHTML = pages[currentPage]();


    // Cap nhat trang thai active tren thanh menu
    document.querySelectorAll('.nav a').forEach(function (link) {

        link.classList.toggle('active', link.dataset.page === currentPage);

    });

}


// ==========================================
// 14. HAM CHUYEN TRANG (MO FILE HTML KHAC)
// ==========================================

function go(page) {

    // Dashboard la index.html, cac trang con la <ten>.html
    window.location.href = (page === 'dashboard' ? 'index' : page) + '.html';

}


// ==========================================
// 15. CHUC NANG TIM KIEM VA LOC DU LIEU
// ==========================================

function filterRows() {

    // Lay noi dung nguoi dung nhap vao o tim kiem
    let search = $('#searchBox').value.toLowerCase();

    // Lay trang thai duoc chon
    let status = $('#filterStatus')?.value || '';


    // Tim kiem va loc thiet bi
    if (currentPage === 'devices') {

        let result = data.devices.filter(function (device) {

            let information = (device.name + device.type).toLowerCase();

            let matchSearch = information.includes(search);

            let matchStatus = status === '' || device.status === status;

            return matchSearch && matchStatus;

        });

        $('#tableArea').innerHTML = deviceTable(result);

    }


    // Tim kiem nguoi muon
    else if (currentPage === 'borrowers') {

        let result = data.borrowers.filter(function (borrower) {

            let information = (
                borrower.name +
                borrower.unit +
                borrower.phone
            ).toLowerCase();

            return information.includes(search);

        });

        $('#tableArea').innerHTML = borrowerTable(result);

    }


    // Tim kiem va loc phieu muon
    else if (currentPage === 'loans') {

        let result = data.loans.filter(function (loan) {

            let information = (
                String(loan.id) +
                loan.borrower +
                loan.device
            ).toLowerCase();

            let matchSearch = information.includes(search);

            let matchStatus = status === '' || loan.status === status;

            return matchSearch && matchStatus;

        });

        $('#tableArea').innerHTML = fullLoanTable(result);

    }

}

// ==========================================
// 16. KHAI BAO CAC TRUONG DU LIEU TRONG FORM
// ==========================================

// Moi loai du lieu se co cac truong nhap khac nhau

const schemas = {

    // Form them hoac sua thiet bi
    device: [
        ['name', 'Tên thiết bị', 'text'],
        ['type', 'Loại thiết bị', 'text'],
        ['qty', 'Số lượng', 'number'],
        ['status', 'Tình trạng', 'select', [
            'Sẵn sàng',
            'Đang cho mượn',
            'Bảo trì'
        ]],
        ['icon', 'Biểu tượng (emoji)', 'text']
    ],


    // Form them hoac sua nguoi muon
    borrower: [
        ['name', 'Họ và tên', 'text'],
        ['unit', 'Đơn vị', 'text'],
        ['phone', 'Số điện thoại', 'tel']
    ],


    // Form tao phieu muon
    loan: [
        ['borrower', 'Người mượn', 'selectBorrower'],
        ['device', 'Thiết bị', 'selectDevice'],
        ['qty', 'Số lượng mượn', 'number'],
        ['borrowDate', 'Ngày mượn', 'date'],
        ['dueDate', 'Ngày hẹn trả', 'date']
    ]

};


// ==========================================
// 17. HAM MO FORM THEM VA CAP NHAT DU LIEU
// ==========================================

function openModal(type, item = null) {

    // Luu loai form dang mo
    modalType = type;

    // Luu doi tuong dang duoc chinh sua
    editing = item;


    // Ten hien thi cua tung loai form
    let labels = {
        device: 'Thiết bị',
        borrower: 'Người mượn',
        loan: 'Phiếu mượn'
    };


    // Cap nhat tieu de form
    if (item !== null) {
        $('#modalTitle').textContent = 'Cập nhật ' + labels[type];
    } else {
        $('#modalTitle').textContent = 'Thêm ' + labels[type];
    }


    // Tao cac o nhap du lieu
    let fields = schemas[type];

    let html = '';


    fields.forEach(function (field) {

        let key = field[0];
        let label = field[1];
        let kind = field[2];
        let options = field[3];

        // Lay gia tri cu neu dang sua
        let value = '';

        if (item !== null) {
            value = item[key];
        } else if (key === 'qty') {
            value = 1;
        }


        // Tao noi dung o nhap
        let control = '';


        // Neu la danh sach lua chon trang thai
        if (kind === 'select') {

            control = `
                <select name="${key}">

                    ${options.map(function (option) {

                        return `
                            <option value="${option}"
                                ${option === value ? 'selected' : ''}>
                                ${option}
                            </option>
                        `;

                    }).join('')}

                </select>
            `;

        }


        // Neu la danh sach nguoi muon
        else if (kind === 'selectBorrower') {

            control = `
                <select name="${key}">

                    ${data.borrowers.map(function (borrower) {

                        return `
                            <option value="${borrower.name}"
                                ${borrower.name === value ? 'selected' : ''}>
                                ${borrower.name}
                            </option>
                        `;

                    }).join('')}

                </select>
            `;

        }


        // Neu la danh sach thiet bi
        else if (kind === 'selectDevice') {

            control = `
                <select name="${key}">

                    ${data.devices.map(function (device) {

                        return `
                            <option value="${device.name}"
                                ${device.name === value ? 'selected' : ''}>
                                ${device.name}
                            </option>
                        `;

                    }).join('')}

                </select>
            `;

        }


        // Cac truong hop con lai se tao o input
        else {

            control = `
                <input
                    name="${key}"
                    type="${kind}"
                    value="${value}"
                    ${key === 'qty' ? 'min="1"' : ''}
                    required
                >
            `;

        }


        // Them truong vua tao vao form
        html += `

            <div class="form-group ${key === 'unit' ? 'full' : ''}">

                <label>${label}</label>

                ${control}

            </div>

        `;

    });


    // Dua cac truong vao form
    $('#modalFields').innerHTML = html;

    // Hien thi hop thoai
    $('#modalBackdrop').classList.add('show');

}


// ==========================================
// 18. HAM DONG FORM
// ==========================================

function closeModal() {

    $('#modalBackdrop').classList.remove('show');

}


// ==========================================
// 19. XU LY SU KIEN LUU FORM
// ==========================================

$('#modalForm').addEventListener('submit', function (event) {

    // Ngan trang web tai lai khi submit form
    event.preventDefault();


    // Lay toan bo du lieu nguoi dung nhap
    let formData = new FormData(event.target);

    let obj = Object.fromEntries(formData.entries());


    // Chuyen so luong tu chuoi sang kieu Number
    if (modalType === 'device' || modalType === 'loan') {
        obj.qty = Number(obj.qty);
    }


    // Truong hop dang cap nhat du lieu
    if (editing !== null) {

        let arr;

        if (modalType === 'device') {
            arr = data.devices;
        } else if (modalType === 'borrower') {
            arr = data.borrowers;
        } else {
            arr = data.loans;
        }


        // Tim phan tu can sua theo ID
        let item = arr.find(function (element) {
            return element.id === editing.id;
        });


        // Cap nhat thong tin moi
        Object.assign(item, obj);

    }


    // Truong hop tao phieu muon moi
    else if (modalType === 'loan') {

        // Tao ID moi cho phieu muon
        obj.id = Math.max(
            1000,
            ...data.loans.map(function (loan) {
                return loan.id;
            })
        ) + 1;


        // Mac dinh chua tra thiet bi
        obj.returnDate = '';

        // Mac dinh trang thai la dang muon
        obj.status = 'Đang mượn';


        // Them phieu muon vao dau danh sach
        data.loans.unshift(obj);

    }


    // Truong hop them thiet bi hoac nguoi muon
    else {

        let arr;

        if (modalType === 'device') {
            arr = data.devices;
        } else {
            arr = data.borrowers;
        }


        // Tao ID moi
        obj.id = Math.max(
            0,
            ...arr.map(function (item) {
                return item.id;
            })
        ) + 1;


        // Them du lieu vao danh sach
        if (modalType === 'device') {
            data.devices.unshift(obj);
        } else {
            data.borrowers.unshift(obj);
        }

    }


    // Luu du lieu vao LocalStorage
    save();


    // Dong form sau khi luu
    closeModal();


    // Cap nhat lai giao dien
    render();


    // Hien thi thong bao
    toast('Đã lưu thông tin thành công');

});


// ==========================================
// 20. HAM MO FORM CHINH SUA DU LIEU
// ==========================================

function editItem(type, id) {

    let arr;


    // Xac dinh danh sach can chinh sua
    if (type === 'device') {
        arr = data.devices;
    } else {
        arr = data.borrowers;
    }


    // Tim phan tu theo ID
    let item = arr.find(function (element) {
        return element.id === id;
    });


    // Neu tim thay thi mo form chinh sua
    if (item !== undefined) {
        openModal(type, item);
    }

}


// ==========================================
// 21. HAM XOA THIET BI HOAC NGUOI MUON
// ==========================================

function deleteItem(type, id) {

    // Hoi xac nhan truoc khi xoa
    let answer = confirm('Bạn có chắc muốn xóa mục này?');

    if (answer === false) {
        return;
    }


    // Xac dinh danh sach can xoa
    let key;

    if (type === 'device') {
        key = 'devices';
    } else {
        key = 'borrowers';
    }


    // Loc bo phan tu co ID can xoa
    data[key] = data[key].filter(function (item) {
        return item.id !== id;
    });


    // Luu du lieu moi
    save();


    // Cap nhat giao dien
    render();


    // Thong bao xoa thanh cong
    toast('Đã xóa dữ liệu');

}


// ==========================================
// 22. HAM XAC NHAN DA TRA THIET BI
// ==========================================

function markReturned(id) {

    // Tim phieu muon theo ID
    let loan = data.loans.find(function (item) {
        return item.id === id;
    });


    // Neu khong tim thay phieu muon thi dung ham
    if (loan === undefined) {
        return;
    }


    // Cap nhat trang thai thanh da tra
    loan.status = 'Đã trả';


    // Ghi nhan ngay tra hien tai
    loan.returnDate = new Date().toISOString().slice(0, 10);


    // Luu thay doi vao LocalStorage
    save();


    // Cap nhat lai giao dien
    render();


    // Hien thi thong bao
    toast('Đã xác nhận hoàn trả thiết bị');

}

// ==========================================
// 23. HIEN THI NGAY HIEN TAI
// ==========================================

let today = new Date();

$('#today').textContent = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
}).format(today);


// ==========================================
// 24. KHOI CHAY CHUONG TRINH
// ==========================================

// Hien thi trang Dashboard khi mo website
render();
