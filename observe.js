// observe.js - rieng cho THEO DOI TRA (observe.html) (nap sau core.js)

// Do thong ke va danh sach phieu chua tra
function renderPage() {
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

// Chay khi mo trang
render();
