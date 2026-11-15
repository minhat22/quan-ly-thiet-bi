// history.js - rieng cho PHIEU MUON (history.html) (nap sau core.js)

// Tim kiem + loc theo trang thai phieu
function filterRows() {
    let searchBox = document.getElementById('searchBox');
    let statusBox = document.getElementById('filterStatus');

    let search = searchBox ? searchBox.value.toLowerCase() : '';
    let status = statusBox ? statusBox.value : '';

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

// Do du lieu vao trang
function renderPage() {
    filterRows();
}

// Chay khi mo trang
render();
