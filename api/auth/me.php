<?php
//Lấy thông tin tài khoản người dùng Đang đăng nhập hiện tại
session_start();
require __DIR__. '/../../includes/response.php';

if(!isset($_SESSION['user_id'])){
    json_error('Chưa đăng nhập',401);
}
json_ok(['hoTen' => $_SESSION['ho_ten'], 'vaiTro' => $_SESSION['vai_tro']]);