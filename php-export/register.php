<?php
require_once 'config/db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $role = $_POST['role'] ?? 'customer';
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($name) || empty($username) || empty($password)) {
        $error = 'Please fill in all required fields.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } else {
        // Check if username exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $error = 'Username is already taken.';
        } else {
            $hashed = password_hash($password, PASSWORD_BCRYPT);
            $userId = 'usr-' . time();
            $stmt = $pdo->prepare("INSERT INTO users (user_id, name, username, password, role, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
            $stmt->execute([$userId, $name, $username, $hashed, $role, $email ?: "$username@aquafabz.com", $phone]);

            $_SESSION['user'] = [
                'user_id' => $userId,
                'name' => $name,
                'username' => $username,
                'role' => $role,
                'email' => $email,
                'phone' => $phone
            ];
            header('Location: dashboard.php');
            exit;
        }
    }
}

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-4xl mx-auto w-full p-6 py-10">
  <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-4">
    <div>
      <h2 class="text-2xl font-black text-white">Create Account at AquaFabz</h2>
      <p class="text-xs text-slate-400 mt-1">Select your role to access POS cashiering, delivery dispatch, or customer portal.</p>
    </div>

    <?php if ($error): ?>
      <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
        <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <form method="POST" class="space-y-3.5 text-xs">
      <div>
        <label class="font-semibold text-slate-300 block mb-1">Full Name:</label>
        <input type="text" name="name" placeholder="e.g. Maria Clara Santos" class="w-full px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white" required>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Username:</label>
          <input type="text" name="username" placeholder="msantos" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono" required>
        </div>
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Role Selected:</label>
          <select name="role" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-semibold">
            <option value="customer">Customer / Resident</option>
            <option value="staff">Staff / Cashier</option>
            <option value="delivery">Delivery Rider</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Email:</label>
          <input type="email" name="email" placeholder="user@aquafabz.com" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white">
        </div>
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Contact Phone:</label>
          <input type="text" name="phone" placeholder="0918-000-0000" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white" required>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Password:</label>
          <input type="password" name="password" placeholder="••••••••" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white" required>
        </div>
        <div>
          <label class="font-semibold text-slate-300 block mb-1">Confirm Password:</label>
          <input type="password" name="confirm_password" placeholder="••••••••" class="w-full px-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white" required>
        </div>
      </div>

      <button type="submit" class="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all text-xs">
        Complete Registration
      </button>
    </form>
  </div>
</main>

</body>
</html>
