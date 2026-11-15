// Du lieu mau ban dau: thiet bi, nguoi muon, phieu muon
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

    customer: [
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

// Doc du lieu da luu; chua co thi dung du lieu mau
let savedData = localStorage.getItem('gearflow_demo');

let data;

if (savedData !== null) {
    data = JSON.parse(savedData);
} else {
    data = seed;
}

// Doi khoa cu 'borrowers' thanh 'customer'
if (data.borrowers && !data.customer) {
    data.customer = data.borrowers;
    delete data.borrowers;
}

// Tao nhat ky hoat dong neu chua co
if (!data.activities) {
    data.activities = [];
    data.loans.forEach(function (loan) {
        if (loan.status === 'Đã trả') {
            data.activities.push({ type: 'return', borrower: loan.borrower, device: loan.device, qty: loan.qty, time: loan.returnDate });
        }
        data.activities.push({ type: 'create', borrower: loan.borrower, device: loan.device, qty: loan.qty, time: loan.borrowDate });
    });
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

// Luu du lieu vao localStorage
function save() {
    localStorage.setItem('gearflow_demo', JSON.stringify(data));
}

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

// Ghi them mot hoat dong vao dau nhat ky (toi da 30)
function addActivity(type, loan) {
    data.activities.unshift({
        type: type,
        borrower: loan.borrower,
        device: loan.device,
        qty: loan.qty,
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
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' · ' +
           pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

// Cac dong bang phieu muon day du (trang Phieu muon + Theo doi tra)
function fullLoanRows(rows) {
    return rows.map(function (loan) {
        let action = '—';

        if (loan.status !== 'Đã trả') {
            action = `<button class="action-btn" onclick="markReturned(${loan.id})">Xác nhận trả</button>`;
        }

        return `
            <tr>
                <td>#${loan.id}</td>
                <td>${loan.borrower}</td>
                <td>${loan.device}</td>
                <td>${loan.qty}</td>
                <td>${loan.borrowDate}</td>
                <td>${loan.dueDate}</td>
                <td>
                    <span class="status ${statusClass(loan.status)}">${loan.status}</span>
                </td>
                <td>${action}</td>
            </tr>
        `;

    }).join('');
}

// Ve lai trang: goi renderPage() cua trang roi to sang menu
function render() {
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
        ['qty', 'Số lượng', 'number'],
        ['status', 'Tình trạng', 'select', [
            'Sẵn sàng',
            'Đang cho mượn',
            'Bảo trì'
        ]],
        ['icon', 'Biểu tượng (emoji)', 'text']
    ],

    // Form nguoi muon
    borrower: [
        ['name', 'Họ và tên', 'text'],
        ['unit', 'Đơn vị', 'text'],
        ['phone', 'Số điện thoại', 'tel']
    ],

    // Form phieu muon
    loan: [
        ['borrower', 'Người mượn', 'borrowerInput'],
        ['phone', 'Số điện thoại', 'tel'],
        ['unit', 'Đơn vị', 'select', unitList],  
        ['device', 'Thiết bị', 'selectDevice'],
        ['qty', 'Số lượng mượn', 'number'],
        ['borrowDate', 'Ngày mượn', 'date'],
        ['dueDate', 'Ngày hẹn trả', 'date']
    ]
};

// Mo form va dung cac o nhap tu formFields
function openModal(type, item = null) {
    modalType = type;

    editing = item;

    let labels = {
        device: 'Thiết bị',
        borrower: 'Người mượn',
        loan: 'Phiếu mượn'
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

        // Danh sach chon nguoi muon
        else if (kind === 'selectBorrower') {
            control = `
                <select name="${key}">

                    ${data.customer.map(function (borrower) {
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

        // O ten nguoi muon: go tu do + goi y ten co san
        else if (kind === 'borrowerInput') {
            control = `
                <input
                    name="${key}"
                    list="borrowerList"
                    value="${value}"
                    placeholder="Nhập hoặc chọn tên"
                    autocomplete="off"
                    oninput="fillPhone(this.value)"
                    required
                >
                <datalist id="borrowerList">
                    ${data.customer.map(function (b) {
                        return `<option value="${b.name}"></option>`;
                    }).join('')}
                </datalist>
            `;
        }

        // Danh sach chon thiet bi
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

        // O nhap thong thuong (chu, so, ngay, dien thoai)
        else {
            control = `
                <input
                    name="${key}"
                    type="${kind}"
                    value="${value}"
                    ${key === 'qty' ? 'min="1"' : ''}
                    ${key === 'phone' ? 'pattern="[0-9 .+]{9,15}" title="Số điện thoại gồm 9 đến 15 chữ số" placeholder="VD: 0901 234 567"' : ''}
                    required
                >
            `;
        }

        html += `

            <div class="form-group ${key === 'unit' ? 'full' : ''}">

                <label>${label}</label>

                ${control}

            </div>

        `;
    });

    $('#modalFields').innerHTML = html;

    $('#modalBackdrop').classList.add('show');
}

// Dong form
function closeModal() {
    $('#modalBackdrop').classList.remove('show');
}

// Chon nguoi da co thi tu dien so dien thoai
function fillPhone(name) {
    let found = data.customer.find(function (b) {
        return b.name === name;
    });

    let phoneBox = document.querySelector('#modalFields input[name="phone"]');
    let unitBox = document.querySelector('#modalFields select[name="unit"]');


    if (found && phoneBox) {
        phoneBox.value = found.phone;
    }
     if (found && unitBox) {
        unitBox.value = found.unit;
    }
}

// Bam "Luu thong tin": luu phieu / thiet bi / nguoi muon
$('#modalForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Lay du lieu nguoi dung vua nhap
    let formData = new FormData(event.target);

    let obj = Object.fromEntries(formData.entries());

    // Doi so luong tu chu sang so
    if (modalType === 'device' || modalType === 'loan') {
        obj.qty = Number(obj.qty);
    }

    // Dang sua: cap nhat muc da co
    if (editing !== null) {
        let arr;

        if (modalType === 'device') {
            arr = data.devices;
        } else if (modalType === 'borrower') {
            arr = data.customer;
        } else {
            arr = data.loans;
        }

        let item = arr.find(function (element) {
            return element.id === editing.id;
        });

        Object.assign(item, obj);
    }

    // Tao phieu muon moi
    else if (modalType === 'loan') {
        // Tao ID moi cho phieu
        obj.id = Math.max(
            1000,
            ...data.loans.map(function (loan) {
                return loan.id;
            })
        ) + 1;

        // Phieu moi: chua tra, trang thai Dang muon
        obj.returnDate = '';

        obj.status = 'Đang mượn';

        // Ten nguoi muon chua co thi them vao danh sach nguoi muon
        obj.borrower = obj.borrower.trim();

        let known = data.customer.some(function (b) {
            return b.name === obj.borrower;
        });

        if (!known) {
            data.customer.unshift({
                id: Math.max(0, ...data.customer.map(function (b) { return b.id; })) + 1,
                name: obj.borrower,
                unit: obj.unit,
                phone: obj.phone
            });
        }

        // Them phieu vao dau danh sach va ghi nhat ky
        data.loans.unshift(obj);
        addActivity('create', obj);
    }

    // Them thiet bi hoac nguoi muon moi
    else {
        let arr;

        if (modalType === 'device') {
            arr = data.devices;
        } else {
            arr = data.customer;
        }

        obj.id = Math.max(
            0,
            ...arr.map(function (item) {
                return item.id;
            })
        ) + 1;

        if (modalType === 'device') {
            data.devices.unshift(obj);
        } else {
            data.customer.unshift(obj);
        }
    }

    // Luu, dong form, ve lai trang
    save();

    closeModal();

    render();

    toast('Đã lưu thông tin thành công');
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
        return element.id === id;
    });

    if (item !== undefined) {
        openModal(type, item);
    }
}

// Xoa thiet bi / nguoi muon (co hoi xac nhan)
function deleteItem(type, id) {
    let answer = confirm('Bạn có chắc muốn xóa mục này?');

    if (answer === false) {
        return;
    }

    let key;

    if (type === 'device') {
        key = 'devices';
    } else {
        key = 'customer';
    }

    data[key] = data[key].filter(function (item) {
        return item.id !== id;
    });

    save();

    render();

    toast('Đã xóa dữ liệu');
}

// Xac nhan da tra thiet bi
function markReturned(id) {
    let loan = data.loans.find(function (item) {
        return item.id === id;
    });

    if (loan === undefined) {
        return;
    }

    loan.status = 'Đã trả';

    // Ghi ngay tra va ghi nhat ky
    loan.returnDate = new Date().toISOString().slice(0, 10);

    addActivity('return', loan);

    save();

    render();

    toast('Đã xác nhận hoàn trả thiết bị');
}

// Hien ngay hien tai tren thanh tren cung
let today = new Date();

$('#today').textContent = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
}).format(today);