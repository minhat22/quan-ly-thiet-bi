// Dữ liệu được tải từ MySQL qua API; không còn dùng LocalStorage làm nguồn dữ liệu.
let data = { devices: [], customer: [], loans: [], stockLog: [], activities: [] };
let dataReady = false;

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

// Trang dang mo (lay tu data-page cua <body>)
let currentPage = document.body.dataset.page;

// Muc dang duoc sua (null = dang them moi)
let editing = null;

// Loai form dang mo: device / borrower / loan
let modalType = '';

// Lay phan tu HTML theo selector
function $(selector) {
    return document.querySelector(selector);
}

// Lưu dữ liệu: API MySQL thực hiện việc ghi dữ liệu
function save() { /* Dữ liệu được lưu trực tiếp vào MySQL thông qua API. */ }

// Dinh dang so kieu Viet Nam
function money(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
}

// Hien thong bao nho o goc man hinh
function toast(message) {
    let toastBox = $('#toast');

    toastBox.textContent = message;
    toastBox.classList.add('show');

    setTimeout(function () {
        toastBox.classList.remove('show');
    }, 2200);
}

// Chon mau cho tung trang thai
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
function setText(id, value) {
    let element = document.getElementById(id);

    if (element !== null) {
        element.textContent = value;
    }
}

// Do cac dong <tr> vao bang (tbody#tableBody)
function fillRows(html) {
    let body = document.getElementById('tableBody');

    if (body !== null) {
        body.innerHTML = html;
    }
}

// So thiet bi dang duoc muon (cac phieu chua tra, tinh theo ma thiet bi)
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
function readyCount(device) {
    let ready = Number(device.qty) - borrowedCount(device.id) - Number(device.maintenance || 0);

    return Math.max(0, ready);
}

// Ten thiet bi cua mot dong trong phieu (mat thiet bi thi dung ten da luu)
function itemName(item) {
    let device = data.devices.find(function (d) {
        return d.id === item.deviceId;
    });

    return device ? device.name : item.name;
}

// Dang chu: "Laptop Dell × 2, May chieu × 1"
function loanItemsText(loan) {
    return loan.items.map(function (item) {
        return itemName(item) + ' × ' + item.qty;
    }).join(', ');
}

// Dang chu cho nhat ky: "2 Laptop Dell, 1 May chieu"
function loanSummary(loan) {
    return loan.items.map(function (item) {
        return item.qty + ' ' + itemName(item);
    }).join(', ');
}

// Chuyen ky tu dac biet thanh dang an toan khi chen vao HTML
function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
}

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

// Dieu chinh kho: nhap them / bao hong / sua xong / thanh ly
function applyStock(device, obj) {
    let amount = Math.floor(Number(obj.amount));
    let broken = Number(device.maintenance || 0);
    let ready = readyCount(device);

    if (!(amount >= 1)) {
        toast('Số lượng phải từ 1 trở lên');
        return;
    }

    if (obj.action === 'add') {
        device.qty = Number(device.qty) + amount;
    }
    else if (obj.action === 'broken') {
        if (amount > ready) {
            toast('Chỉ còn ' + ready + ' cái sẵn sàng để báo hỏng');
            return;
        }
        device.maintenance = broken + amount;
    }
    else if (obj.action === 'fixed') {
        if (amount > broken) {
            toast('Chỉ có ' + broken + ' cái đang bảo trì');
            return;
        }
        device.maintenance = broken - amount;
    }
    else if (obj.action === 'dispose') {
        if (amount > broken + ready) {
            toast('Chỉ thanh lý được tối đa ' + (broken + ready) + ' cái (bảo trì + sẵn sàng)');
            return;
        }
        // Thanh ly: lay tu so dang bao tri truoc, thieu thi lay tu so san sang
        device.maintenance = broken - Math.min(amount, broken);
        device.qty = Number(device.qty) - amount;
    }

    // Ghi vao lich su kho (giu 50 muc moi nhat)
    data.stockLog.unshift({
        deviceId: device.id,
        deviceName: device.name,
        action: obj.action,
        amount: amount,
        note: (obj.note || '').trim(),
        time: new Date().toISOString()
    });
    data.stockLog = data.stockLog.slice(0, 50);

    save();
    closeModal();
    render();
    toast('Đã cập nhật kho');
}

// Ghi them mot hoat dong vao dau nhat ky (toi da 30)
function addActivity(type, loan) {
    data.activities.unshift({
        type: type,
        borrower: loan.borrower,
        summary: loanSummary(loan),
        time: new Date().toISOString()
    });
    data.activities = data.activities.slice(0, 30);   // chi giu 30 muc moi nhat
}

// Doi thoi gian sang dang dd/mm/yyyy (kem gio neu co)
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

// Ve lai trang: goi renderPage() cua trang roi to sang menu
function render() {
    if (!dataReady) return;
    if (typeof renderPage === 'function') {
        renderPage();
    }

    highlightMenu();
}

// To sang muc menu cua trang hien tai
function highlightMenu() {
    document.querySelectorAll('.nav a').forEach(function (link) {
        link.classList.toggle('active', link.dataset.page === currentPage);
    });

}

// Danh sach don vi de chon (them/bot don vi o day)
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
const formFields = {
    // Form thiet bi
    device: [
        ['name', 'Tên thiết bị', 'text'],
        ['type', 'Loại thiết bị', 'text'],
        ['qty', 'Số lượng', 'number']
    ],

    // Form nguoi muon
    borrower: [
        ['name', 'Họ và tên', 'text'],
        ['unit', 'Đơn vị', 'text'],
        ['phone', 'Số điện thoại', 'tel']
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
function openModal(type, item = null) {
    modalType = type;

    editing = item;

    let labels = {
        device: 'thiết bị',
        borrower: 'người mượn',
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
        let options = field[3];

        let value = '';

        if (item !== null) {
            value = item[key] ?? '';
        } else if (key === 'qty') {
            value = 1;
        } else if (key === 'borrowDate' && type === 'loan') {
            value = new Date().toISOString().slice(0, 10);   // mac dinh: hom nay
        }

        let control = '';

        // Danh sach chon co san lua chon
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

        // Chi cho phep chon nguoi muon da ton tai trong MySQL
        else if (kind === 'borrowerSelect') {
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

        // Danh sach chon nguoi muon
        else if (kind === 'selectBorrower') {
            control = `
                <select name="${key}">

                    ${data.customer.map(function (borrower) {
                        return `
                            <option value="${escapeHtml(borrower.name)}"
                                ${borrower.name === value ? 'selected' : ''}>
                                ${escapeHtml(borrower.name)}
                            </option>
                        `;

                    }).join('')}

                </select>
            `;
        }

        // Khoi chon nhieu thiet bi cho phieu muon
        else if (kind === 'loanItems') {
            control = `
                <div id="loanItems">${loanItemRowHtml()}</div>
                <button type="button" class="action-btn" onclick="addLoanItemRow()">＋ Thêm thiết bị</button>
            `;
        }

        // Danh sach chon thiet bi
        else if (kind === 'selectDevice') {
            control = `
                <select name="${key}">

                    ${data.devices.map(function (device) {
                        return `
                            <option value="${escapeHtml(device.name)}"
                                ${device.name === value ? 'selected' : ''}>
                                ${escapeHtml(device.name)}
                            </option>
                        `;

                    }).join('')}

                </select>
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

// Mot dong chon thiet bi trong form phieu muon (thiet bi + so luong)
function loanItemRowHtml() {
    let options = data.devices.map(function (device) {
        let ready = readyCount(device);

        return `<option value="${device.id}" ${ready === 0 ? 'disabled' : ''}>${escapeHtml(device.name)} (còn ${ready})</option>`;
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
function addLoanItemRow() {
    $('#loanItems').insertAdjacentHTML('beforeend', loanItemRowHtml());
}

// Xoa mot dong thiet bi (phieu phai con it nhat 1 dong)
function removeLoanItemRow(button) {
    if (document.querySelectorAll('#loanItems .loan-item').length <= 1) {
        toast('Phiếu mượn cần ít nhất 1 thiết bị');
        return;
    }

    button.closest('.loan-item').remove();
}

// Dong form
function closeModal() {
    $('#modalBackdrop').classList.remove('show');
}

// Chon ma nguoi muon trong danh sach MySQL va tu dien thong tin tu ho so
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

// Bam "Luu thong tin": luu phieu / thiet bi / nguoi muon
$('#modalForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const obj = Object.fromEntries(formData.entries());
    try {
        if (modalType === 'stock') {
            await api('../api/data.php','POST',{action:'stock',id:editing.id,operation:obj.action,amount:Number(obj.amount),note:obj.note || ''});
        } else if (modalType === 'device') {
            const isEditingDevice = modalType === 'device' && editing !== null;
            await api('../api/data.php', 'POST', {
                action: isEditingDevice ? 'device_update' : 'device_create',
                id: isEditingDevice ? Number(editing.id) : undefined,
                name: String(obj.name || '').trim(),
                type: String(obj.type || '').trim(),
                qty: Number(obj.qty)
            });
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
        } else if (modalType === 'borrower') {
            await api('../api/borrowers.php','POST',{action:editing?'update':'create',id:editing?.id,hoTen:obj.name,donVi:obj.unit,sdt:obj.phone});
        }
        await reloadData(); closeModal(); render(); toast('Đã lưu thông tin vào MySQL');
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

// Xoa thiet bi / nguoi muon (co hoi xac nhan)
async function deleteItem(type, id) {
    if (type !== 'device') { toast('Quản lý người mượn tại trang Người mượn'); return; }
    if (!confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
    try { await api('../api/data.php','POST',{action:'device_delete',id}); await reloadData(); render(); toast('Đã xóa thiết bị'); }
    catch(error) { toast(error.message); }
}

// Xac nhan da tra thiet bi
async function markReturned(id) {
    try { await api('../api/data.php','POST',{action:'loan_return',id}); await reloadData(); render(); toast('Đã xác nhận hoàn trả thiết bị'); }
    catch(error) { toast(error.message); }
}

// ===== Chi tiet phieu + In phieu + Xoa phieu =====

// Mo cua so chi tiet phieu (tu tao khung HTML neu chua co)
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
function closeDetail() {
    let box = document.getElementById('detailBackdrop');
    if (box !== null) box.classList.remove('show');
}

// Xoa / huy phieu muon (co hoi xac nhan)
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

// Hien ngay hien tai tren thanh tren cung
let today = new Date();

$('#today').textContent = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
}).format(today);

// Nạp dữ liệu tập trung từ MySQL khi trang khởi chạy.
(async function startGearFlow(){ try { await reloadData(); render(); } catch(error) { toast(error.message); } })();
