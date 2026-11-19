<?php
//chốt chặn" bảo vệ dành riêng cho các file API. kiểm tra xem người gọi API đã đăng nhập hay chưa trước khi cho phép lấy hoặc thao tác dữ liệu.
session_start();
require_once __DIR__ . '/response.php';

if(!isset($_SESSION['user_id'])){
     json_error('Chưa đăng nhập', 401);
}