/*
   core.js  —  FILE DÙNG CHUNG cho 5 trang:
   main.php, devices.php, customers.php, history.php, observe.php
   (login.php KHÔNG nạp file này, chỉ nạp api.js)
   Cách hoạt động:
     b1 core.js tự gọi reloadData() khi mở trang (cuối file)
     b2 Tải xong thì gọi render()
     b3 render() gọi renderPage()  <-- hàm này do FILE RIÊNG của từng trang
        tự định nghĩa (main.js / devices.js / history.js / observe.js / customers.js)
 */

// NHÓM 1 — BIẾN TOÀN CỤC + TẢI DỮ LIỆU  [DÙNG CHUNG]
// Dữ liệu được tải từ MySQL qua API;
// kho dữ liệu: devices, customer, loans, stockLog, activities, stats
let data = { 
    devices: [], 
    customer: [], 
    loans: [], 
    stockLog: [], 
    activities: [] 
};
// true khi đã tải xong dữ liệu;
let dataReady = false;

//tải lại toàn bộ dữ liệu từ api/data.php; gọi sau mỗi lần lưu/xóa
async function reloadData() {
    const remote = await api('../api/data.php');
    data = remote;
    data.devices = (data.devices || []).map(d => ({...d, id:Number(d.id), qty:Number(d.qty), maintenance:Number(d.maintenance || 0)}));
    data.customer = (data.customer || []).map(b => ({...b, id:Number(b.id)}));
    data.loans = (data.loans || []).map(l => ({...l, id:Number(l.id), items:(l.items || []).map(i => ({...i, deviceId:Number(i.deviceId), qty:Number(i.qty)}))}));
    data.stockLog = data.stockLog || [];
    data.activities = data.activities || [];
    data.stats = data.stats || { months: [], topDevices: [], topBorrowers: [], totalLoans: 0, returnRate: 0, overdueRate: 0 };
    dataReady = true;
}

// Trang dang mo 
let currentPage = document.body.dataset.page;

// Muc dang duoc sua (null = dang them moi)
let editing = null;

// Loai form dang mo: device / borrower / loan
let modalType = '';


// NHÓM 2 — TIỆN ÍCH GIAO DIỆN NHỎ 
// Lay phan tu HTML theo selector
// [DÙNG CHUNG] rút gọn document.querySelector
function $(selector) {
    return document.querySelector(selector);
}

// Hien thong bao nho o goc man hinh
//mọi trang
function toast(message) {
    let toastBox = $('#toast');

    toastBox.textContent = message;
    toastBox.classList.add('show');

    setTimeout(function () {
        toastBox.classList.remove('show');
    }, 3800);
}

// Chon mau cho tung trang thai
// [Dùng ở: main.js, fullLoanRows]
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

// Gan chu vao phan tu theo id
// [Dùng ở: main.js, observe.js]
function setText(id, value) {
    let element = document.getElementById(id);

    if (element !== null) {
        element.textContent = value;
    }
}

// Do cac dong <tr> vao bang (tbody#tableBody)
// [DÙNG CHUNG] main, devices, customers, history, observe
function fillRows(html) {
    let body = document.getElementById('tableBody');

    if (body !== null) {
        body.innerHTML = html;
    }
}


// NHÓM 3 — TÍNH KHO / TÊN / CHỮ CỦA PHIẾU 
// So thiet bi dang duoc muon (cac phieu chua tra, tinh theo ma thiet bi)
// [Dùng ở: devices.js, readyCount]
function borrowedCount(deviceId) {
    let sum = 0;

    data.loans.forEach(function (loan) {
        if (loan.status === 'Đã trả') {
            return;
        }

        loan.items.forEach(function (item) {
            if (item.deviceId === deviceId) {
                sum += Number(item.qty);
            }
        });
    });

    return sum;
}

// So thiet bi san sang = tong - dang muon - dang bao tri
// [Dùng ở: main.js, devices.js, form phiếu mượn (history.js)]
function readyCount(device) {
    let ready = Number(device.qty) - borrowedCount(device.id) - Number(device.maintenance || 0);

    return Math.max(0, ready);
}

// Ten thiet bi cua mot dong trong phieu (mat thiet bi thi dung ten da luu)
// dùng trong các hàm hiện chữ của phiếu
function itemName(item) {
    let device = data.devices.find(function (d) {
        return d.id === item.deviceId;
    });

    return device ? device.name : item.name;
}

// [Dùng ở: main.js, history.js]
function loanItemsText(loan) {
    return loan.items.map(function (item) {
        return itemName(item) + ' × ' + item.qty;
    }).join(', ');
}

// Chuyen ky tu dac biet thanh dang an toan khi chen vao HTML
// [DÙNG CHUNG] (customers.js cũng dùng hàm này)
function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
}



// NHÓM 4 — ĐỊNH DẠNG NGÀY + BẢNG PHIẾU MƯỢN  [DÙNG CHUNG]
// Doi thoi gian sang dang dd/mm/yyyy
// [Dùng ở: main.js, devices.js (nhật ký kho), showLoanDetail]
function formatTime(t) {
    if (!t) { return ''; }
    if (t.length === 10) {
        let p = t.split('-');
        return p[2] + '/' + p[1] + '/' + p[0];
    }
    let d = new Date(t);
    let pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' - ' +
           pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

// Cac dong bang phieu muon day du (trang Phieu muon + Theo doi tra)
// [Dùng ở: history.js, observe.js] nút Xóa chỉ hiện khi currentPage === "loans"
function fullLoanRows(rows) {
    return rows.map(function (loan) {
        let action = `<button class="action-btn" onclick="showLoanDetail(${loan.id})">Chi tiết</button>`;

        if (loan.status !== 'Đã trả') {
            action += `<button class="action-btn" onclick="markReturned(${loan.id})">Xác nhận trả</button>`;
        }

        // Nut Xoa chi hien o trang Phieu muon
        if (currentPage === 'loans') {
            action += `<button class="action-btn danger" onclick="deleteLoan(${loan.id})">Xóa</button>`;
        }

        return `
            <tr>
                <td>#${loan.id}</td>
                <td>${escapeHtml(loan.borrower)}</td>
                <td>${loan.items.map(function (item) { return escapeHtml(itemName(item)) + ' × ' + item.qty; }).join('<br>')}</td>
                <td>${loan.items.reduce(function (sum, item) { return sum + Number(item.qty); }, 0)}</td>
                <td>${loan.borrowDate}</td>
                <td>${loan.dueDate}</td>
                <td>
                    <span class="status ${statusClass(loan.status)}">${escapeHtml(loan.status)}</span>
                </td>
                <td>${action}</td>
            </tr>
        `;

    }).join('');
}


// NHÓM 5 — VẼ LẠI TRANG + MENU  [DÙNG CHUNG]
// Ve lai trang: goi renderPage() cua trang roi to sang menu
// [DÙNG CHUNG] gọi renderPage() của file riêng từng trang
function render() {
    if (!dataReady) return;
    if (typeof renderPage === 'function') {
        renderPage();
    }

    highlightMenu();
}

// To sang muc menu cua trang hien tai
// [DÙNG CHUNG]
function highlightMenu() {
    document.querySelectorAll('.nav a').forEach(function (link) {
        link.classList.toggle('active', link.dataset.page === currentPage);
    });

}


// NHÓM 6 — FORM POPUP (modal) THÊM/SỬA  [DÙNG CHUNG]
// Danh sach don vi de chon (them/bot don vi o day)
// [Dùng ở: customers.js] danh sách đơn vị trong form sửa người mượn
const unitList = [
    'Trường Công Nghệ Thông Tin Và Truyền Thông',
    'Trường Kinh Tế',
    'Trường Nông Nghiệp',
    'Trường Bách Khoa',
    'Trường Thủy Sản',
    'Trường Chính Trị',
    'Trường Khoa Học Xã Hội Và Nhân Văn'
];

// Cac o nhap cua tung form: [ten truong, nhan hien thi, kieu o]
// [Dùng ở: openModal] khai báo ô nhập của form device / loan
const formFields = {
    // Form thiet bi
    device: [
        ['name', 'Tên thiết bị', 'text'],
        ['model', 'Model', 'text'],
        ['type', 'Loại thiết bị', 'text'],
        ['qty', 'Số lượng', 'number']
    ],

    // Form phieu muon
    loan: [
        ['borrowerId', 'Người mượn', 'borrowerSelect'],
        ['phone', 'Số điện thoại', 'readonly'],
        ['unit', 'Đơn vị', 'readonly'],
        ['items', 'Thiết bị mượn', 'loanItems'],
        ['borrowDate', 'Ngày mượn', 'date'],
        ['dueDate', 'Ngày hẹn trả', 'date']
    ]
};

// Mo form va dung cac o nhap tu formFields
// [Dùng ở: devices.php openModal("device"), history.php openModal("loan")] form người mượn do customers.js tự làm
function openModal(type, item = null) {
    modalType = type;

    editing = item;

    let labels = {
        device: 'thiết bị',
        loan: 'phiếu mượn'
    };

    if (item !== null) {
        $('#modalTitle').textContent = 'Cập nhật ' + labels[type];
    } else {
        $('#modalTitle').textContent = 'Thêm ' + labels[type];
    }

    let fields = formFields[type];

    let html = '';

    fields.forEach(function (field) {
        let key = field[0];
        let label = field[1];
        let kind = field[2];

        let value = '';

        if (item !== null) {
            value = item[key] ?? '';
        } else if (key === 'qty') {
            value = 1;
        } else if (key === 'borrowDate' && type === 'loan') {
            value = new Date().toISOString().slice(0, 10);   // mac dinh: hom nay
        }

        let control = '';

        // Chi cho phep chon nguoi muon da ton tai trong MySQL
        if (kind === 'borrowerSelect') {
            control = `
                <select name="${key}" id="loanBorrowerSelect" onchange="fillBorrowerDetails(this.value)" required ${data.customer.length === 0 ? 'disabled' : ''}>
                    <option value="">Chọn người mượn</option>
                    ${data.customer.map(function (borrower) {
                        return `<option value="${borrower.id}">${escapeHtml(borrower.name)} — ${escapeHtml(borrower.unit)} — ${escapeHtml(borrower.phone)}</option>`;
                    }).join('')}
                </select>
                <p class="loan-borrower-hint txt-small">
                    ${data.customer.length === 0
                        ? 'Danh sách hiện chưa có người mượn. '
                        : 'Lưu ý bạn có thể thêm người được mượn '}
                    <a href="customers.php" target="_blank" rel="noopener">tại đây</a>.
                </p>
            `;
        }

        // Thong tin nguoi muon tu dong dien, khong cho sua tai form phieu
        else if (kind === 'readonly') {
            control = `<input name="${key}" type="text" value="" readonly placeholder="Tự động lấy từ hồ sơ người mượn">`;
        }

        // Khoi chon nhieu thiet bi cho phieu muon
        else if (kind === 'loanItems') {
            control = `
                <div id="loanItems">${loanItemRowHtml()}</div>
                <button type="button" class="action-btn" onclick="addLoanItemRow()">＋ Thêm thiết bị</button>
            `;
        }

        // O nhap thong thuong (chu, so, ngay, dien thoai)
        else {
            control = `
                <input
                    name="${key}"
                    type="${kind}"
                    value="${escapeHtml(value)}"
                    ${key === 'qty' ? 'min="1"' : ''}
                    ${key === 'phone' ? 'pattern="[0-9 .+]{9,15}" title="Số điện thoại gồm 9 đến 15 chữ số" placeholder="VD: 0901 234 567"' : ''}
                    required
                >
            `;
        }

        html += `

            <div class="form-group${(key === 'unit' || kind === 'loanItems' || (type === 'loan' && key === 'borrowerId')) ? ' full' : ''}${(type === 'loan' && (key === 'phone' || key === 'unit')) ? ' borrower-extra' : ''}">

                <label>${label}</label>

                ${control}

            </div>

        `;
    });

    $('#modalFields').innerHTML = html;

    $('#modalBackdrop').classList.add('show');
}

//Dong form
//nút Hủy / dấu x của mọi trang
function closeModal() {
    $('#modalBackdrop').classList.remove('show');
}

// Bam "Luu thong tin": luu phieu / thiet bi / nguoi muon
// [DÙNG CHUNG nhưng chia theo modalType]
//   'stock'    -> chỉ devices.php   (openStockModal trong devices.js)
//   'device'   -> chỉ devices.php
//   'loan'     -> chỉ history.php
//   (người mượn: customers.js gỡ bộ xử lý này và tự gắn bộ xử lý riêng)
$('#modalForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const obj = Object.fromEntries(formData.entries());
    let saveNotice = '';
    try {
        if (modalType === 'stock') {
            await api('../api/data.php','POST',{action:'stock',id:editing.id,operation:obj.action,amount:Number(obj.amount),note:obj.note || ''});
        } else if (modalType === 'device') {
            const isEditingDevice = modalType === 'device' && editing !== null;
            const res = await api('../api/data.php', 'POST', {
                action: isEditingDevice ? 'device_update' : 'device_create',
                id: isEditingDevice ? Number(editing.id) : undefined,
                name: String(obj.name || '').trim(),
                model: String(obj.model || '').trim(),
                type: String(obj.type || '').trim(),
                qty: Number(obj.qty)
            });
            saveNotice = res && res.notice ? res.notice : '';
        } else if (modalType === 'loan') {
            const borrowerId = Number(obj.borrowerId || 0);
            const borrowerExists = data.customer.some(person => Number(person.id) === borrowerId);
            if (!borrowerExists) {
                toast('Người này chưa có trong danh sách Người mượn. Hãy thêm hồ sơ ở trang Người mượn trước khi tạo phiếu.');
                return;
            }
            const ids = formData.getAll('itemDevice');
            const quantities = formData.getAll('itemQty');
            const items = ids.map((id, i) => ({ deviceId: Number(id), qty: Number(quantities[i]) }));

            // Kiem tra ngay: ngay hen tra khong duoc truoc ngay muon
            if (!obj.borrowDate || !obj.dueDate) {
                alert('Vui lòng nhập đầy đủ Ngày mượn và Ngày hẹn trả.');
                return;
            }
            if (obj.dueDate < obj.borrowDate) {
                alert('Ngày hẹn trả không được trước ngày mượn!\n\nNgày mượn: ' + formatTime(obj.borrowDate) + '\nNgày hẹn trả: ' + formatTime(obj.dueDate));
                return;
            }

            // Kiem tra ton kho ngay tren giao dien de hien alert truoc khi gui yeu cau.
            // Cong don cac dong neu nguoi dung chon cung mot thiet bi nhieu lan.
            const requestedByDevice = new Map();
            for (const item of items) {
                if (!Number.isInteger(item.qty) || item.qty < 1) {
                    alert('Vui lòng nhập số lượng thiết bị hợp lệ (ít nhất 1).');
                    return;
                }
                requestedByDevice.set(item.deviceId, (requestedByDevice.get(item.deviceId) || 0) + item.qty);
            }

            for (const [deviceId, requestedQty] of requestedByDevice.entries()) {
                const device = data.devices.find(d => Number(d.id) === Number(deviceId));
                if (!device) {
                    alert('Thiết bị được chọn không còn tồn tại. Vui lòng tải lại trang.');
                    return;
                }
                const availableQty = readyCount(device);
                if (requestedQty > availableQty) {
                    alert(`Không đủ số lượng thiết bị trong kho!\n\nThiết bị: ${device.name}\nSố lượng còn sẵn: ${availableQty}\nSố lượng yêu cầu: ${requestedQty}`);
                    return;
                }
            }

            // Server van kiem tra lai trong transaction de tranh truong hop ton kho thay doi dong thoi.
            await api('../api/data.php','POST',{action:'loan_create',borrowerId,borrowDate:obj.borrowDate,dueDate:obj.dueDate,items});
        }
        await reloadData(); closeModal(); render(); 
        toast(saveNotice || 'Đã lưu thông tin vào MySQL');
    } catch (error) {
        // Khi số lượng yêu cầu vượt quá số lượng còn sẵn trong kho,
        // hiển thị alert đơn giản để người dùng nhận biết ngay.
        const message = String(error.message || 'Có lỗi xảy ra');
        const normalizedMessage = message.toLocaleLowerCase('vi');
        if (normalizedMessage.includes('không đủ') || normalizedMessage.includes('sẵn sàng không đủ')) {
            alert('Không đủ số lượng thiết bị trong kho!\n\n' + message);
        } else {
            console.error('GearFlow: không thể lưu dữ liệu:', error);
            toast(message);
        }
    }
});

// Mo form sua thiet bi / nguoi muon
// [Dùng ở: devices.js] (nút Sửa thiết bị)
function editItem(type, id) {
    let arr;

    if (type === 'device') {
        arr = data.devices;
    } else {
        arr = data.customer;
    }

    let item = arr.find(function (element) {
        return Number(element.id) === Number(id);
    });

    if (item !== undefined) {
        openModal(type, item);
    }
}


// ==================================================================
// NHÓM 7 — THAO TÁC PHIẾU DÙNG CHUNG history.php + observe.php
// ==================================================================
// Xac nhan da tra thiet bi
// [Dùng ở: history.js + observe.js qua fullLoanRows]
async function markReturned(id) {
    try { 
    await api('../api/data.php','POST',{action:'loan_return',id}); 
    await reloadData(); render(); toast('Đã xác nhận hoàn trả thiết bị'); 
}
    catch(error) { toast(error.message); 
        
    }
}

// ===== Chi tiet phieu (hien/dong cua so chi tiet) =====

// Mo cua so chi tiet phieu (tu tao khung HTML neu chua co)
// [Dùng ở: history.js + observe.js qua fullLoanRows]
function showLoanDetail(id) {
    let loan = data.loans.find(function (l) {
        return Number(l.id) === Number(id);
    });
    if (loan === undefined) return;

    let box = document.getElementById('detailBackdrop');
    if (box === null) {
        box = document.createElement('div');
        box.id = 'detailBackdrop';
        box.className = 'modal-backdrop';
        document.body.appendChild(box);
    }

    let totalQty = loan.items.reduce(function (sum, item) {
        return sum + Number(item.qty);
    }, 0);

    let itemRows = loan.items.map(function (item, index) {
        return '<tr><td>' + (index + 1) + '</td><td>' + escapeHtml(itemName(item)) +
               '</td><td>' + item.qty + '</td></tr>';
    }).join('');

    box.innerHTML =
        '<div class="modal detail-modal">' +
            '<div class="modal-head">' +
                '<h3>Chi tiết phiếu mượn #' + loan.id + '</h3>' +
                '<button class="close" onclick="closeDetail()"><span class="close-button">x</span></button>' +
            '</div>' +
            '<div class="detail-info">' +
                '<div><span>Người mượn</span><p class="txt-strong">' + escapeHtml(loan.borrower) + '</p></div>' +
                '<div><span>Đơn vị</span><p class="txt-strong">' + escapeHtml(loan.unit || '—') + '</p></div>' +
                '<div><span>Số điện thoại</span><p class="txt-strong">' + escapeHtml(loan.phone || '—') + '</p></div>' +
                '<div><span>Trạng thái</span><p class="txt-strong">' + escapeHtml(loan.status) + '</p></div>' +
                '<div><span>Ngày mượn</span><p class="txt-strong">' + formatTime(loan.borrowDate) + '</p></div>' +
                '<div><span>Hẹn trả</span><p class="txt-strong">' + formatTime(loan.dueDate) + '</p></div>' +
                '<div><span>Ngày trả thực tế</span><p class="txt-strong">' + (loan.returnDate ? formatTime(loan.returnDate) : 'Chưa trả') + '</p></div>' +
                '<div><span>Tổng số lượng</span><p class="txt-strong">' + totalQty + '</p></div>' +
            '</div>' +
            '<table class="detail-table">' +
                '<thead><tr><th>STT</th><th>Thiết bị</th><th>Số lượng</th></tr></thead>' +
                '<tbody>' + itemRows + '</tbody>' +
            '</table>' +
        '</div>';

    box.classList.add('show');
}

// Dong cua so chi tiet
// [Dùng ở: history.js + observe.js]
function closeDetail() {
    let box = document.getElementById('detailBackdrop');
    if (box !== null) box.classList.remove('show');
}

// ==================================================================
// NHÓM 8 — KHỞI CHẠY KHI MỞ TRANG  [DÙNG CHUNG]
// ==================================================================
// Hien ngay hien tai tren thanh tren cung
// [DÙNG CHUNG] hiện ngày ở thanh trên cùng (#today)
let today = new Date();

$('#today').textContent = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
}).format(today);

// Nạp dữ liệu tập trung từ MySQL khi trang khởi chạy.
(async function startGearFlow(){ try { await reloadData(); render(); } catch(error) { toast(error.message); } })();
