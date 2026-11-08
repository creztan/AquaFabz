# AquaFabz Water Refilling Station System (PHP, CSS, HTML, JSON Edition)

This is the pure **PHP, CSS, HTML, and JSON** edition of the AquaFabz Water Refilling Station Management System, built with **ZERO JSX**, zero build steps, and zero external APIs.

It is designed to run directly on **XAMPP, WAMP, MAMP, cPanel, or any PHP 8.x web server**.

---

## 📁 File Structure

```
php-export/
├── data/                      # JSON Data Storage (Zero SQL Required)
│   ├── settings.json          # Station coordinates & profile
│   ├── users.json             # Admin, Staff, Delivery Rider & Customer accounts
│   ├── products.json          # Water refills, jugs, bottles & accessories
│   ├── vending_machines.json  # 24/7 coin-operated units & tank levels
│   ├── orders.json            # Counter walk-in & delivery orders
│   └── customers.json         # Customer accounts & container balances
├── config/
│   ├── json_db.php            # JSON database CRUD helper (file_get_contents/json_encode)
│   └── db.php                 # Dual storage engine (JSON default + optional MySQL)
├── includes/
│   ├── header.php             # HTML5 header, navigation & Tailwind CSS
│   └── footer.php             # Standard page footer
├── index.php                  # Public customer landing page
├── login.php                  # Authentication console (Admin, Staff, Rider, Customer)
├── register.php               # Account registration with JSON storage
├── dashboard.php              # Multi-role dashboard with live KPI counters
├── pos.php                    # POS Counter: Add items, REMOVE items, print cash slip
├── vending.php                # Vending Fleet: Add Machine, Remove Machine, status toggles
├── deliveries.php             # Dispatch queue & Zero-API Leaflet Driver Map
├── containers.php             # 5-Gallon Slim & Round container deposit tracking
├── logout.php                 # Clears session and redirects to login
└── database.sql               # Optional MySQL schema (if your instructor requires MySQL)
```

---

## 🚀 Quick Run with XAMPP (Plug & Play - No Database Setup Needed!)

Because this system uses **JSON data storage**, you do **not** even need to create a database in phpMyAdmin:

1. Copy the `php-export/` folder into your XAMPP web directory:
   - **Windows**: `C:\xampp\htdocs\aquafabz\`
   - **Mac**: `/Applications/XAMPP/htdocs/aquafabz/`
   - **Linux**: `/opt/lampp/htdocs/aquafabz/`
2. Start Apache in your XAMPP Control Panel.
3. Open your browser and navigate to:
   ```
   http://localhost/aquafabz/index.php
   ```
4. Log in and use the system!

---

## 🔑 Login Accounts (Pre-configured in `data/users.json`)

| Role | Username | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin` | `password123` | Add/Remove Vending Machines, Add/Delete Catalog Items, Full Analytics |
| **Staff / Cashier** | `chrysty` | `password123` | POS Counter, Order Intake, Receipt Slip Printing |
| **Delivery Rider** | `jacob` | `password123` | Driver Map, Dispatch Queue, POS Counter & New Delivery Access |
| **Customer** | `maria` | `password123` | View Water Refill Services & Order Status |

---

## ✨ Features Implemented (Strictly PHP, CSS, HTML, JSON - Zero JSX)

1. **Admin Vending Machine Management (`vending.php`)**:
   - Admin can **Add Vending Machine** (code, name, location, capacity, coordinates).
   - Admin can **Remove Vending Machine** with one click.
   - Real-time water tank percentage bar and operational status toggle.
2. **POS Counter with Item Removal (`pos.php`)**:
   - Product catalog with live search.
   - Add items to ticket.
   - **Remove item when listing** in cart ticket.
   - Admin can **Add Item** and **Delete Item** directly from station catalog.
   - Instant subtotal, delivery fee, grand total, and cash change computation.
3. **Delivery Dispatch & Driver Map (`deliveries.php`)**:
   - **Zero External APIs**: Uses free OpenStreetMap & Leaflet with local Haversine distance math.
   - Sequential stop badges (`#1`, `#2`, `#3`) and trajectory lines.
   - HTML5 Browser GPS button to locate the rider.
   - Delivery rider has direct access to **POS Counter** and **+ New Delivery**.
4. **Container & Deposit Audit (`containers.php`)**:
   - Tracks 5-Gallon Slim & Round jugs in circulation and customer deposit balances.
