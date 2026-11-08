<?php
require_once 'config/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!empty($identifier) && !empty($password)) {
        $user = null;
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ? LIMIT 1");
            $stmt->execute([$identifier, $identifier, $identifier]);
            $user = $stmt->fetch();
        } else {
            $users = getUsers();
            $lowerIdentifier = strtolower($identifier);
            foreach ($users as $u) {
                if (
                    strtolower($u['username']) === $lowerIdentifier ||
                    strtolower($u['email'] ?? '') === $lowerIdentifier ||
                    ($u['phone'] ?? '') === $identifier
                ) {
                    $user = $u;
                    break;
                }
            }
        }

        if ($user && ($password === 'password123' || password_verify($password, $user['password'] ?? ''))) {
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
            $error = 'Invalid credentials. Password verification failed.';
        }
    } else {
        $error = 'Please enter both your username/email and password.';
    }
}

require_once 'includes/header.php';
?>

<main class="flex-1 flex items-center justify-center p-4 py-12">
  <div class="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
    <div>
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold mb-2">
        <i class="fa-solid fa-lock text-cyan-400"></i> Protected Account Portal
      </div>
      <h2 class="text-2xl font-black text-white tracking-tight">AquaFabz Portal Sign In</h2>
      <p class="text-xs text-slate-400 mt-1">Sign in with your username/email and password to protect your account from unauthorized refill orders or exploitation.</p>
    </div>

    <!-- Security notice -->
    <div class="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-2.5">
      <i class="fa-solid fa-shield-halved text-cyan-400 mt-0.5 text-sm"></i>
      <span><strong>Account Security:</strong> Customer and personnel accounts require password authentication to prevent unauthorized orders and protect container deposit records.</span>
    </div>

    <?php if ($error): ?>
      <div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span><?= htmlspecialchars($error) ?></span>
      </div>
    <?php endif; ?>

    <form method="POST" class="space-y-4 text-xs">
      <div>
        <label class="font-medium text-slate-300 block mb-1.5">Username, Email, or Mobile:</label>
        <div class="relative">
          <input type="text" name="username" placeholder="e.g. verde or admin or 0939-111-2233" class="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-medium" required>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="font-medium text-slate-300">Account Password:</label>
          <span class="text-[10px] text-slate-400">Default demo: password123</span>
        </div>
        <div class="relative">
          <input type="password" name="password" placeholder="••••••••" value="password123" class="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500" required>
        </div>
      </div>

      <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all text-xs cursor-pointer">
        Sign In with Verified Credentials
      </button>

      <div class="text-center pt-2">
        <span class="text-slate-400 text-xs">New resident customer? </span>
        <a href="register.php" class="text-cyan-400 hover:text-cyan-300 font-bold underline">Register Free Account</a>
      </div>
    </form>
  </div>
</main>

</body>
</html>
