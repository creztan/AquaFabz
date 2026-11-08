-- ======================================================================
-- AquaFabz Water Refilling Station - MySQL Database Schema & Sample Data
-- For XAMPP / WAMP / CPanel MySQL Server Deployment
-- ======================================================================

CREATE DATABASE IF NOT EXISTS `aquafabz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aquafabz_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'staff', 'delivery', 'customer') NOT NULL DEFAULT 'customer',
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `last_login` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `barangay` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) DEFAULT 'Binalbagan',
  `customer_type` ENUM('residential', 'commercial', 'institutional') DEFAULT 'residential',
  `containers_held` INT DEFAULT 0,
  `total_orders` INT DEFAULT 0,
  `total_spent` DECIMAL(10,2) DEFAULT 0.00,
  `registered_date` DATE NOT NULL,
  `lat` DECIMAL(10,6) DEFAULT 10.2014,
  `lng` DECIMAL(10,6) DEFAULT 122.8601,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('refill', 'container', 'accessory', 'ice') NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `cost` DECIMAL(10,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 10,
  `unit` VARCHAR(20) DEFAULT 'jug',
  `is_water` TINYINT(1) DEFAULT 0,
  `description` TEXT,
  `requires_container_swap` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Vending Machines Table
CREATE TABLE IF NOT EXISTS `vending_machines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `machine_id` VARCHAR(50) NOT NULL UNIQUE,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `location_name` VARCHAR(200) NOT NULL,
  `barangay` VARCHAR(100) NOT NULL,
  `lat` DECIMAL(10,6) DEFAULT 10.2014,
  `lng` DECIMAL(10,6) DEFAULT 122.8601,
  `water_capacity_liters` INT NOT NULL DEFAULT 800,
  `current_water_level_liters` INT NOT NULL DEFAULT 800,
  `coin_capacity` INT NOT NULL DEFAULT 10000,
  `current_coin_total` DECIMAL(10,2) DEFAULT 0.00,
  `price_per_liter` DECIMAL(10,2) DEFAULT 2.00,
  `total_lifetime_sales` DECIMAL(10,2) DEFAULT 0.00,
  `status` ENUM('operational', 'low_water', 'maintenance', 'offline') NOT NULL DEFAULT 'operational',
  `last_serviced` DATE DEFAULT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Vending Sales Collection Log
CREATE TABLE IF NOT EXISTS `vending_sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `machine_id` VARCHAR(50) NOT NULL,
  `machine_name` VARCHAR(150) NOT NULL,
  `date` DATE NOT NULL,
  `coins_collected` DECIMAL(10,2) NOT NULL,
  `water_dispensed_liters` INT NOT NULL,
  `water_refilled_liters` INT DEFAULT 0,
  `recorded_by` VARCHAR(100) NOT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `barangay` VARCHAR(100) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) DEFAULT 15.00,
  `grand_total` DECIMAL(10,2) NOT NULL,
  `status` ENUM('Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  `payment_status` ENUM('unpaid', 'paid', 'cod') DEFAULT 'cod',
  `payment_method` ENUM('cash', 'gcash', 'bank_transfer') DEFAULT 'cash',
  `assigned_personnel` VARCHAR(100) DEFAULT NULL,
  `containers_to_collect` INT DEFAULT 0,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Sales Transactions Table
CREATE TABLE IF NOT EXISTS `sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_number` VARCHAR(50) NOT NULL UNIQUE,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `customer_name` VARCHAR(100) DEFAULT 'Walk-In Customer',
  `order_type` ENUM('walkin', 'delivery', 'pickup') DEFAULT 'walkin',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discount` DECIMAL(10,2) DEFAULT 0.00,
  `delivery_fee` DECIMAL(10,2) DEFAULT 0.00,
  `container_deposit` DECIMAL(10,2) DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `amount_paid` DECIMAL(10,2) NOT NULL,
  `change_amount` DECIMAL(10,2) DEFAULT 0.00,
  `payment_method` ENUM('cash', 'gcash', 'bank_transfer') DEFAULT 'cash',
  `payment_status` ENUM('paid', 'pending', 'unpaid') DEFAULT 'paid',
  `staff_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Activity Logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `user` VARCHAR(100) DEFAULT 'System'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================================
-- Initial Sample Records Insert
-- ======================================================================

INSERT INTO `users` (`user_id`, `name`, `username`, `password`, `role`, `email`, `phone`, `status`) VALUES
('usr-1', 'Eugene P. Senining', 'admin', '$2y$10$e8T8fM.5NqU81aG7K1eHbe5e/4J7mP5L2kO1i3u4v5w6x7y8z9a0b', 'admin', 'eugene.senining@aquafabz.com', '0918-123-4567', 'active'),
('usr-2', 'Chrysty Mae L. Castillo', 'chrysty', '$2y$10$e8T8fM.5NqU81aG7K1eHbe5e/4J7mP5L2kO1i3u4v5w6x7y8z9a0b', 'staff', 'chrysty.castillo@aquafabz.com', '0919-456-7890', 'active'),
('usr-3', 'Christan Jacob M. Verde', 'jacob', '$2y$10$e8T8fM.5NqU81aG7K1eHbe5e/4J7mP5L2kO1i3u4v5w6x7y8z9a0b', 'delivery', 'jacob.verde@aquafabz.com', '0920-789-0123', 'active');

INSERT INTO `products` (`product_id`, `code`, `name`, `category`, `price`, `cost`, `stock`, `min_stock`, `is_water`, `description`, `requires_container_swap`) VALUES
('prod-1', 'REF-PUR-RND', 'Purified Water Refill (5-Gal Round)', 'refill', 30.00, 4.00, 450, 50, 1, '16-stage purified water refill for inverted water dispensers.', 1),
('prod-2', 'REF-PUR-SLM', 'Purified Water Refill (5-Gal Slim w/ Faucet)', 'refill', 30.00, 4.00, 380, 50, 1, 'Purified water in slim blue container with built-in spigot tap.', 1),
('prod-3', 'REF-MIN-5G', 'Mineral Water Refill (5-Gallon)', 'refill', 35.00, 6.00, 220, 40, 1, 'Enriched with essential minerals (calcium, magnesium, potassium).', 1),
('prod-4', 'REF-ALK-5G', 'Alkaline Ionized Water Refill (5-Gallon pH 9.0+)', 'refill', 45.00, 8.00, 190, 30, 1, 'Micro-clustered alkaline antioxidant water for superior hydration.', 1),
('prod-5', 'CNT-SLM-NEW', 'New 5-Gallon Slim Container w/ Faucet', 'container', 200.00, 140.00, 85, 15, 0, 'Brand-new food-grade polycarbonate 5-gallon container.', 0);

INSERT INTO `vending_machines` (`machine_id`, `code`, `name`, `location_name`, `barangay`, `current_coin_total`, `status`) VALUES
('vm-1', 'VM-01', 'Vending Unit #1 - Brgy. Enclaro Center', 'Near Enclaro Waiting Shed', 'Brgy. Enclaro', 1450.00, 'operational'),
('vm-2', 'VM-02', 'Vending Unit #2 - Crossing Pag-Asa Junction', 'Pag-Asa Tricycle Terminal', 'Brgy. Pag-Asa', 2100.00, 'operational'),
('vm-3', 'VM-03', 'Vending Unit #3 - Progreso Market Plaza', 'Beside Central Elementary School', 'Brgy. Progreso', 890.00, 'low_water'),
('vm-4', 'VM-04', 'Vending Unit #4 - San Jose Resettlement', 'Covered Court Gate', 'Brgy. San Jose', 340.00, 'offline');
