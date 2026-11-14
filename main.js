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

// Du lieu cu (truoc khi doi ten) co the van luu bang khoa 'borrowers'
if (data.borrowers && !data.customer) {
    data.customer = data.borrowers;
    delete data.borrowers;
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


// Ham gan chu/so vao mot phan tu theo id (bo qua neu trang khong co phan tu do)
function setText(id, value) {
    let element = document.getElementById(id);

    if (element !== null) {
        element.textContent = value;
    }
}


// Ham do cac dong du lieu vao <tbody id="tableBody"> cua trang
// Khung bang (<table>, <thead>) da viet san trong file HTML.
// Neu rows rong thi tbody rong -> bang van hien nhung khong co dong nao.
function fillRows(html) {
    let body = document.getElementById('tableBody');

    if (body !== null) {
        body.innerHTML = html;
    }
}


// ==========================================
// 4. TAO CAC DONG DU LIEU (<tr>) CHO BANG
// ==========================================
// Cac ham duoi day CHI tao cac dong <tr>, khong tao <table>.

// Dong cua bang "Phieu muon gan day" (Trang chu)
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


// Dong cua bang thiet bi
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


// Dong cua bang nguoi muon
function borrowerRows(rows) {

    return rows.map(function (borrower) {

        // Lay chu cai dau cua hai tu cuoi trong ho ten
        let words = borrower.name.split(' ');
        let avatar = words.slice(-2).map(function (word) {
            return word[0];
        }).join('');

        return `
            <tr>
                <td>
                    <div class="device-cell">
                        <div class="avatar">${avatar}</div>
                        <b>${borrower.name}</b>
                    </div>
                </td>
                <td>NM-${String(borrower.id).padStart(3, '0')}</td>
                <td>${borrower.unit}</td>
                <td>${borrower.phone}</td>
                <td>
                    <button class="action-btn" onclick="editItem('borrower', ${borrower.id})">Sửa</button>
                    <button class="action-btn" onclick="deleteItem('borrower', ${borrower.id})">Xóa</button>
                </td>
            </tr>
        `;

    }).join('');
}


// Dong cua bang phieu muon day du (trang Phieu muon va Theo doi tra)
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


// ==========================================
// 5. HAM DO DU LIEU VAO TRANG
// ==========================================
// Moi trang (file HTML) tu khai bao ten bang <body data-page="...">
// Ham render() chi do du lieu vao cac phan tu co san trong HTML.

function render() {

    // ----- Trang chu -----
    if (currentPage === 'trangchu') {

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
    }


    // ----- Cac trang co tim kiem: thiet bi, nguoi muon, phieu muon -----
    else if (currentPage === 'devices' ||
             currentPage === 'customers' ||
             currentPage === 'loans') {

        filterRows();
    }


    // ----- Theo doi tra -----
    else if (currentPage === 'returns') {

        let pending = data.loans.filter(function (loan) {
            return loan.status !== 'Đã trả';
        });

        let overdue = pending.filter(function (loan) {
            return loan.status === 'Quá hạn';
        }).length;

        let borrowing = pending.filter(function (loan) {
            return loan.status === 'Đang mượn';
        }).length;

        let done = data.loans.filter(function (loan) {
            return loan.status === 'Đã trả';
        }).length;

        setText('statPending', pending.length);
        setText('statOverdue', overdue);
        setText('statDone', done);
        setText('statBorrowing', borrowing);

        fillRows(fullLoanRows(pending));
    }


    // Cap nhat trang thai active tren thanh menu
    document.querySelectorAll('.nav a').forEach(function (link) {

        link.classList.toggle('active', link.dataset.page === currentPage);

    });

}


// ==========================================
// 6. CHUC NANG TIM KIEM VA LOC DU LIEU
// ==========================================

function filterRows() {

    // Lay noi dung o tim kiem va trang thai duoc chon (neu trang co)
    let searchBox = document.getElementById('searchBox');
    let statusBox = document.getElementById('filterStatus');

    let search = searchBox ? searchBox.value.toLowerCase() : '';
    let status = statusBox ? statusBox.value : '';


    // Thiet bi
    if (currentPage === 'devices') {

        let result = data.devices.filter(function (device) {

            let information = (device.name + device.type).toLowerCase();

            return information.includes(search) &&
                   (status === '' || device.status === status);

        });

        fillRows(deviceRows(result));

    }


    // Nguoi muon
    else if (currentPage === 'customers') {

        let result = data.customer.filter(function (borrower) {

            let information = (
                borrower.name +
                borrower.unit +
                borrower.phone
            ).toLowerCase();

            return information.includes(search);

        });

        fillRows(borrowerRows(result));

    }


    // Phieu muon
    else if (currentPage === 'loans') {

        let result = data.loans.filter(function (loan) {

            let information = (
                String(loan.id) +
                loan.borrower +
                loan.device
            ).toLowerCase();

            return information.includes(search) &&
                   (status === '' || loan.status === status);

        });

        fillRows(fullLoanRows(result));

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
            arr = data.customer;
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
            arr = data.customer;
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
            data.customer.unshift(obj);
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
        arr = data.customer;
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
        key = 'customer';
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
