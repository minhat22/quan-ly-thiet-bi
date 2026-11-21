/* 
   api.js  —  FILE DÙNG CHUNG cho TẤT CẢ trang
   Nạp đầu tiên, trước core.js và các file riêng.
   Chứa:  api()  và  dangXuat()
*/

//mọi lệnh gọi PHP đều đi qua đây (login, core, main, devices, history, observe, customers)
async function api(url, method = 'GET', body = null) {
    let response;

    try {
        response = await fetch(url, {
            method: method,
            headers: body !== null ? { 'Content-Type': 'application/json' } : {},
            body: body !== null ? JSON.stringify(body) : null,
            credentials: 'same-origin'
        });
    } catch (error) {
        throw new Error('Không kết nối được máy chủ. Hãy kiểm tra Apache và MySQL trong XAMPP đã chạy chưa.');
    }

    // Chưa đăng nhập hoặc hết phiên: chuyển về trang đăng nhập
    if (response.status === 401) {
        if (!location.pathname.endsWith('login.php')) {
            location.href = 'login.php';
        }
        throw new Error('Chưa đăng nhập');
    }

    // Đọc phản hồi. Nếu PHP bị lỗi thì nó trả về chữ/HTML chứ không phải JSON
    const text = await response.text();
    let json;

    try {
        json = JSON.parse(text);
    } catch (error) {
        console.error('PHP không trả về JSON, nội dung nhận được:', text);
        throw new Error('Máy chủ báo lỗi, xem chi tiết trong Console (nhấn F12).');
    }

    if (!json.ok) {
        throw new Error(json.error || 'Có lỗi xảy ra');
    }

    return json.data;
}

// Đăng xuất rồi chuyển về trang đăng nhập
// [DÙNG CHUNG] nút "Đăng xuất" của main, devices, customers, history, observe
async function dangXuat() {
    try {
        await api('../api/auth/logout.php');
    } catch (error) {
        // Có lỗi vẫn chuyển về trang đăng nhập
    }

    location.href = 'login.php';
}
