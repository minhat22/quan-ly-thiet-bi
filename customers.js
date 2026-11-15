// customers.js - rieng cho NGUOI MUON (customers.html) (nap sau core.js)

// Cac dong bang nguoi muon
function borrowerRows(rows) {
    return rows.map(function (borrower) {
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

// Tim kiem nguoi muon
function filterRows() {
    let searchBox = document.getElementById('searchBox');

    let search = searchBox ? searchBox.value.toLowerCase() : '';

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

// Do du lieu vao trang
function renderPage() {
    filterRows();
}

// Chay khi mo trang
render();
