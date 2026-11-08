# AquaFabz Water Refilling Station System - PHP & MySQL Edition

This directory contains the converted **PHP + MySQL + HTML5 + Tailwind CSS** version of the AquaFabz Water Refilling Station Management System, suitable for deployment on XAMPP, WAMP, MAMP, or cPanel web hosting.

---

## 📁 File Structure

```
php-export/
├── database.sql           # MySQL database setup script (Tables & sample dataset)
├── config/
│   └── db.php             # PDO MySQL connection setup
├── includes/
│   ├── header.php         # Navbar & Tailwind CSS inclusion
│   └── footer.php         # Page footer
├── index.php              # Public landing page
├── login.php              # Dual login console (Personnel & Customers)
├── register.php           # User account registration (4 roles)
├── dashboard.php          # Executive dashboard & KPI metrics
└── vending.php            # Vending machine fleet & availability console
```

---

## 🚀 Setup Instructions for XAMPP / Local Web Server

1. **Install XAMPP** (or WAMP / MAMP) with PHP 8.x and MySQL.
2. Copy the contents of this `php-export/` folder into your web server root:
   - For XAMPP: `C:\xampp\htdocs\aquafabz\`
3. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
4. Create a new database named `aquafabz_db`.
5. Import `database.sql` into `aquafabz_db`.
6. Open `config/db.php` and verify MySQL connection parameters:
   ```php
   $host = 'localhost';
   $dbname = 'aquafabz_db';
   $username = 'root';
   $password = ''; // Your MySQL password if any
   ```
7. Open `http://localhost/aquafabz/index.php` in your browser!

---

## 🔑 Default Login Credentials

- **Administrator**:
  - Username: `admin`
  - Password: `password123`
- **Staff / Cashier**:
  - Username: `chrysty`
  - Password: `password123`
- **Delivery Rider**:
  - Username: `jacob`
  - Password: `password123`
