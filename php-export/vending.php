<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

// Handle Status Update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $machineId = $_POST['machine_id'] ?? '';
    $status = $_POST['status'] ?? 'operational';

    $stmt = $pdo->prepare("UPDATE vending_machines SET status = ? WHERE machine_id = ?");
    $stmt->execute([$status, $machineId]);
    header('Location: vending.php');
    exit;
}

// Fetch all vending machines
$stmt = $pdo->query("SELECT * FROM vending_machines ORDER BY code ASC");
$machines = $stmt->fetchAll();

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-purple-400 font-bold uppercase tracking-wider block">Station-Owned Vending Network</span>
      <h1 class="text-2xl font-black text-white">Water Vending Machine Fleet & Availability Console</h1>
      <p class="text-xs text-slate-400 mt-1">Manage 24/7 coin-operated machine availability, edit operational statuses, and review sales.</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <?php foreach ($machines as $vm): ?>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
              <?= htmlspecialchars($vm['code']) ?>
            </span>
            <h3 class="font-bold text-white text-sm mt-1"><?= htmlspecialchars($vm['name']) ?></h3>
            <p class="text-xs text-slate-400 mt-0.5"><i class="fa-solid fa-location-dot text-slate-500 mr-1"></i> <?= htmlspecialchars($vm['location_name']) ?> (<?= htmlspecialchars($vm['barangay']) ?>)</p>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-bold border 
            <?= $vm['status'] === 'operational' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : ($vm['status'] === 'offline' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30') ?>">
            <?= strtoupper($vm['status']) ?>
          </span>
        </div>

        <!-- Availability Toggle Form -->
        <form method="POST" class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <input type="hidden" name="action" value="update_status">
          <input type="hidden" name="machine_id" value="<?= htmlspecialchars($vm['machine_id']) ?>">
          <span class="font-semibold text-slate-300">Set Machine Status:</span>

          <select name="status" onchange="this.form.submit()" class="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 font-semibold text-xs cursor-pointer focus:outline-none focus:border-purple-500">
            <option value="operational" <?= $vm['status'] === 'operational' ? 'selected' : '' ?>>🟢 Available (Operational)</option>
            <option value="offline" <?= $vm['status'] === 'offline' ? 'selected' : '' ?>>🔴 Unavailable (Offline)</option>
            <option value="maintenance" <?= $vm['status'] === 'maintenance' ? 'selected' : '' ?>>🔧 Under Maintenance</option>
            <option value="low_water" <?= $vm['status'] === 'low_water' ? 'selected' : '' ?>>⚠️ Low Water Alert</option>
          </select>
        </form>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2.5 bg-slate-950/50 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Current Coin Hopper:</span>
            <span class="font-bold text-emerald-400 text-sm">₱<?= number_format($vm['current_coin_total'], 2) ?></span>
          </div>
          <div class="p-2.5 bg-slate-950/50 rounded-xl">
            <span class="text-[10px] text-slate-400 block">Lifetime Revenue:</span>
            <span class="font-bold text-white text-sm">₱<?= number_format($vm['total_lifetime_sales'], 2) ?></span>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</main>

</body>
</html>
