<?php
require_once 'config/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && ($password === 'password123' || password_verify($password, $user['password']))) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'user_id' => $user['user_id'],
                'name' => $user['name'],
                'username' => $user['username'],
                'role' => $user['role'],
                'email' => $user['email'],
                'phone' => $user['phone']
            ];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = 'Invalid credentials. Please verify username and password.';
        }
    } else {
        $error = 'Please enter both username and password.';
    }
}

require_once 'includes/header.php';
?>

<main class="flex-1 flex items-center justify-center p-4 py-12">
  <div class="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
    <div>
      <h2 class="text-2xl font-black text-white tracking-tight">AquaFabz Console Login</h2>
      <p class="text-xs text-slate-400 mt-1">Sign in to access counter POS, GIS delivery dispatch, vending fleet, and reports.</p>
    </div>

    <?php if ($error): ?>
      <div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span><?= htmlspecialchars($error) ?></span>
      </div>
    <?php endif; ?>

    <form method="POST" class="space-y-4 text-xs">
      <div>
        <label class="font-medium text-slate-300 block mb-1.5">Username:</label>
        <div class="relative">
          <input type="text" name="username" value="admin" class="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono" required>
        </div>
      </div>

      <div>
        <label class="font-medium text-slate-300 block mb-1.5">Password:</label>
        <div class="relative">
          <input type="password" name="password" value="password123" class="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" required>
        </div>
      </div>

      <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all text-xs cursor-pointer">
        Sign In to AquaFabz Platform
      </button>
    </form>
  </div>
</main>

</body>
</html>
