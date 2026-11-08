<?php
// ======================================================================
// AquaFabz System - JSON Database & Storage Engine (Zero SQL Required)
// Enables plug-and-play PHP, CSS, HTML, JSON operation
// ======================================================================

define('JSON_DATA_DIR', __DIR__ . '/../data');

function getJsonFile($filename) {
    $path = JSON_DATA_DIR . '/' . $filename;
    if (!file_exists($path)) {
        return [];
    }
    $content = file_get_contents($path);
    return json_decode($content, true) ?: [];
}

function saveJsonFile($filename, $data) {
    $path = JSON_DATA_DIR . '/' . $filename;
    if (!is_dir(JSON_DATA_DIR)) {
        mkdir(JSON_DATA_DIR, 0777, true);
    }
    return file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Helpers for each entity
function getSettings() {
    return getJsonFile('settings.json');
}

function getUsers() {
    return getJsonFile('users.json');
}

function getProducts() {
    return getJsonFile('products.json');
}

function saveProducts($products) {
    return saveJsonFile('products.json', $products);
}

function getVendingMachines() {
    return getJsonFile('vending_machines.json');
}

function saveVendingMachines($machines) {
    return saveJsonFile('vending_machines.json', $machines);
}

function getOrders() {
    return getJsonFile('orders.json');
}

function saveOrders($orders) {
    return saveJsonFile('orders.json', $orders);
}

function getCustomers() {
    return getJsonFile('customers.json');
}

function saveCustomers($customers) {
    return saveJsonFile('customers.json', $customers);
}

// Session startup helper
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
