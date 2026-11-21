/*
   observe.js  —  FILE RIÊNG cho trang THEO DÕI TRẢ (observe.php)
*/

// Do thong ke va danh sach phieu chua tra
// [RIÊNG observe.php] core.render() gọi hàm này
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
