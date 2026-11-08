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
    $address = trim($_POST['address'] ?? '');
    $barangay = $_POST['barangay'] ?? 'Brgy. Enclaro';
    $customerType = $_POST['customer_type'] ?? 'Residential';
    $containersHeld = intval($_POST['containers_held'] ?? 0);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($name) || empty($username) || empty($password)) {
        $error = 'Please fill in all required fields.';
    } elseif ($role === 'customer' && empty($address)) {
        $error = 'Please provide your street address or house number for water delivery.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } else {
        // Check if username exists
        $userExists = false;
        if ($pdo) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $userExists = (bool)$stmt->fetch();
        } else {
            $users = getUsers();
            foreach ($users as $u) {
                if (strtolower($u['username']) === strtolower($username)) {
                    $userExists = true;
                    break;
                }
            }
        }

        if ($userExists) {
            $error = 'Username is already taken.';
        } else {
            $userId = 'usr-' . time();
            if ($pdo) {
                $hashed = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO users (user_id, name, username, password, role, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')");
                $stmt->execute([$userId, $name, $username, $hashed, $role, $email ?: "$username@aquafabz.com", $phone]);
            } else {
                $users = getUsers();
                $users[] = [
                    'id' => count($users) + 1,
                    'user_id' => $userId,
                    'name' => $name,
                    'username' => $username,
                    'password' => $password,
                    'role' => $role,
                    'email' => $email ?: "$username@aquafabz.com",
                    'phone' => $phone,
                    'status' => 'active',
                    'last_login' => date('Y-m-d H:i A')
                ];
                saveJsonFile('users.json', $users);

                // If customer, also save into customers.json
                if ($role === 'customer') {
                    $customers = getCustomers();
                    $customers[] = [
                        'id' => count($customers) + 1,
                        'customer_id' => 'cust-' . time(),
                        'name' => $name,
                        'phone' => $phone,
                        'email' => $email,
                        'address' => $address,
                        'barangay' => $barangay,
                        'city' => 'Binalbagan',
                        'customer_type' => strtolower($customerType),
                        'containers_held' => $containersHeld,
                        'total_orders' => 0,
                        'total_spent' => 0.00,
                        'lat' => 10.2014,
                        'lng' => 122.8601
                    ];
                    saveCustomers($customers);
                }
            }

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
      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold mb-2">
        <i class="fa-solid fa-droplet text-cyan-400"></i> Customer Self-Service Portal
      </div>
      <h2 class="text-2xl font-black text-white">Resident / Customer Registration</h2>
      <p class="text-xs text-slate-400 mt-1">Create your customer account to place water refill orders and monitor container deposits in Binalbagan.</p>
    </div>

    <!-- Station Personnel Callout Notice -->
    <div class="p-3 rounded-xl bg-slate-950/70 border border-indigo-900/40 text-[11px] text-indigo-200/90 flex items-start gap-2.5">
      <i class="fa-solid fa-shield-halved text-indigo-400 mt-0.5 text-xs"></i>
      <span><strong>Station Personnel Notice:</strong> Cashier, Delivery Rider, and Staff accounts are provisioned exclusively by the Station Administrator inside the Admin Staff Console.</span>
    </div>

    <?php if ($error): ?>
      <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
        <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <form method="POST" class="space-y-3.5 text-xs">
      <input type="hidden" name="role" value="customer">

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
          <label class="font-semibold text-slate-300 block mb-1">Account Role:</label>
          <div class="w-full px-3 py-2.5 bg-cyan-950/40 border border-cyan-800/50 rounded-xl text-cyan-300 font-bold flex items-center gap-2">
            <i class="fa-solid fa-user-check text-cyan-400"></i>
            <span>Customer / Resident</span>
          </div>
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

      <!-- Enhanced Customer Profile Fields -->
      <div id="customerProfileFields" class="p-3.5 bg-slate-950/70 border border-cyan-900/50 rounded-2xl space-y-3">
        <span class="text-cyan-400 font-bold block"><i class="fa-solid fa-location-dot mr-1"></i> Water Delivery Address & Profile</span>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="font-semibold text-slate-300 block mb-1">Barangay (Binalbagan):</label>
            <select name="barangay" class="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium">
              <option value="Brgy. Enclaro">Brgy. Enclaro (Crossing Pag-Asa)</option>
              <option value="Brgy. Poblacion">Brgy. Poblacion (Town Proper)</option>
              <option value="Brgy. Sto. Rosario">Brgy. Sto. Rosario (Market Area)</option>
              <option value="Brgy. Paglaum">Brgy. Paglaum</option>
              <option value="Brgy. San Jose">Brgy. San Jose (Biscom Mill)</option>
              <option value="Brgy. Canmoros">Brgy. Canmoros</option>
              <option value="Brgy. Progreso">Brgy. Progreso</option>
              <option value="Brgy. Amontay">Brgy. Amontay</option>
              <option value="Brgy. Marina">Brgy. Marina</option>
              <option value="Brgy. Bi-ao">Brgy. Bi-ao</option>
            </select>
          </div>
          <div>
            <label class="font-semibold text-slate-300 block mb-1">Customer Category:</label>
            <select name="customer_type" class="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-medium">
              <option value="Residential">Residential Household</option>
              <option value="Commercial">Commercial (Store/Eatery)</option>
              <option value="Institutional">Institutional (Office/Clinic)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="font-semibold text-slate-300 block mb-1">Street Address / House No. / Purok:</label>
            <input type="text" name="address" placeholder="e.g. Purok 3, Near Brgy. Hall / Highway cor. Pag-Asa" class="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white">
          </div>
          <div>
            <label class="font-semibold text-slate-300 block mb-1">5-Gal Jugs Held:</label>
            <input type="number" min="0" value="0" name="containers_held" class="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono">
          </div>
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

<script>
function toggleCustomerFields(role) {
  const fields = document.getElementById('customerProfileFields');
  if (role === 'customer') {
    fields.classList.remove('hidden');
  } else {
    fields.classList.add('hidden');
  }
}
</script>

</body>
</html>
