// history.js - rieng cho PHIEU MUON (history.php) (nap sau core.js)

// Tim kiem + loc theo trang thai + loc theo khoang ngay muon
function filterRows() {
    let searchBox = document.getElementById('searchBox');
    let statusBox = document.getElementById('filterStatus');
    let fromBox = document.getElementById('fromDate');
    let toBox = document.getElementById('toDate');

    let search = searchBox ? searchBox.value.toLowerCase() : '';
    let status = statusBox ? statusBox.value : '';
    let fromDate = fromBox ? fromBox.value : '';   // dang YYYY-MM-DD
    let toDate = toBox ? toBox.value : '';

    let result = data.loans.filter(function (loan) {
        let information = (
            String(loan.id) +
            loan.borrower +
            loanItemsText(loan)
        ).toLowerCase();

        // Chuoi YYYY-MM-DD so sanh truc tiep duoc
        let inRange = (fromDate === '' || loan.borrowDate >= fromDate) &&
                      (toDate === '' || loan.borrowDate <= toDate);

        return information.includes(search) &&
               (status === '' || loan.status === status) &&
               inRange;
    });

    fillRows(fullLoanRows(result));
}

// Xoa loc ngay
function clearDateFilter() {
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    filterRows();
}

// Do du lieu vao trang
function renderPage() {
    filterRows();
}

// Chay khi mo trang
render();
