<?php
// Đóng gói các phản hồi từ server về cho giao diện (JavaScript) dưới dạng JSON
header('Content-Type: application/json; charset=utf-8');

function json_ok($data = null) {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}