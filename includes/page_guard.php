<?php
//Không lưu bộ nhớ đệm lại khi đăng xuất và nếu nhập đường link mà không đăng nhập thì đá thẳng ra trang đăng nhập
session_start();

header('Cache-Control: no-store');
if(!isset($_SESSION['user_id'])){
    header('Location: login.php');
    exit;
}