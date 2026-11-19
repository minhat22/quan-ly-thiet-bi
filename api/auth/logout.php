<?php
session_start();
require __DIR__ . '/../../includes/response.php';

session_unset();
session_destroy();

json_ok(null);