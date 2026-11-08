<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$currentUser = $_SESSION['user'];
$machines = getVendingMachines();

// Handle Admin Adding Vending Machine
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add_machine' && $currentUser['role'] === 'admin') {
        $newMachine = [
            'id' => count($machines) + 1,
            'machine_id' => 'vm-' . str_pad(count($machines) + 1, 2, '0', STR_PAD_LEFT),
            'code' => strtoupper(trim($_POST['code'] ?? 'AQUAVEND-' . (count($machines) + 1))),
            'name' => trim($_POST['name'] ?? 'New Vending Station'),
            'location_name' => trim($_POST['location_name'] ?? 'Binalbagan Area'),
            'barangay' => trim($_POST['barangay'] ?? 'Brgy. Enclaro'),
            'status' => 'operational',
            'current_coin_total' => 0.00,
            'total_lifetime_sales' => 0.00,
            'current_water_level_liters' => intval($_POST['water_capacity'] ?? 500),
            'water_capacity_liters' => intval($_POST['water_capacity'] ?? 500),
            'price_per_liter' => 1.00,
            'lat' => floatval($_POST['lat'] ?? 10.2014),
            'lng' => floatval($_POST['lng'] ?? 122.8601)
        ];
        $machines[] = $newMachine;
        saveVendingMachines($machines);
        header('Location: vending.php?msg=added');
        exit;
    }

    // Handle Admin Removing Vending Machine
    if ($_POST['action'] === 'remove_machine' && $currentUser['role'] === 'admin') {
        $machineId = $_POST['machine_id'] ?? '';
        $machines = array_filter($machines, function($vm) use ($machineId) {
            return $vm['machine_id'] !== $machineId;
        });
        saveVendingMachines(array_values($machines));
        header('Location: vending.php?msg=removed');
        exit;
    }

    // Handle Status Update
    if ($_POST['action'] === 'update_status') {
        $machineId = $_POST['machine_id'] ?? '';
        $status = $_POST['status'] ?? 'operational';
        foreach ($machines as &$vm) {
            if ($vm['machine_id'] === $machineId) {
                $vm['status'] = $status;
                break;
            }
        }
        saveVendingMachines($machines);
        header('Location: vending.php?msg=updated');
        exit;
    }
}

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-purple-400 font-bold uppercase tracking-wider block">Station-Owned Vending Network</span>
      <h1 class="text-2xl font-black text-white">Water Vending Machine Fleet & Availability Console</h1>
      <p class="text-xs text-slate-400 mt-1">Manage 24/7 coin-operated machine availability, add/remove units, and monitor water levels.</p>
    </div>

    <?php if ($currentUser['role'] === 'admin'): ?>
      <button onclick="document.getElementById('addMachineModal').classList.remove('hidden')" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Add Vending Machine
      </button>
    <?php endif; ?>
  </div>

  <?php if (isset($_GET['msg'])): ?>
    <div class="p-3 bg-purple-950/80 border border-purple-500/50 rounded-2xl text-purple-200 text-xs flex items-center gap-2">
      <i class="fa-solid fa-circle-check text-purple-400"></i>
      <span>Vending machine fleet successfully updated in JSON database!</span>
    </div>
  <?php endif; ?>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <?php foreach ($machines as $vm): ?>
      <?php 
        $isLow = $vm['status'] === 'low_water';
        $pct = ($vm['current_water_level_liters'] / $vm['water_capacity_liters']) * 100;
      ?>
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 relative flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
                <?= htmlspecialchars($vm['code']) ?>
              </span>
              <h3 class="font-bold text-white text-sm mt-1.5"><?= htmlspecialchars($vm['name']) ?></h3>
              <p class="text-xs text-slate-400 mt-0.5">
                <i class="fa-solid fa-location-dot text-slate-500 mr-1"></i> <?= htmlspecialchars($vm['location_name']) ?> (<?= htmlspecialchars($vm['barangay']) ?>)
              </p>
            </div>

            <!-- Remove Vending Machine Action (Admin) -->
            <?php if ($currentUser['role'] === 'admin'): ?>
              <form method="POST" onsubmit="return confirm('Remove vending machine <?= htmlspecialchars($vm['name']) ?> from system?');" class="shrink-0">
                <input type="hidden" name="action" value="remove_machine">
                <input type="hidden" name="machine_id" value="<?= htmlspecialchars($vm['machine_id']) ?>">
                <button type="submit" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors" title="Remove vending machine">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </form>
            <?php endif; ?>
          </div>

          <!-- Water Tank Gauge -->
          <div class="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Water Reservoir:</span>
              <span class="font-bold <?= $isLow ? 'text-amber-400' : 'text-cyan-400' ?>"><?= $vm['current_water_level_liters'] ?>L / <?= $vm['water_capacity_liters'] ?>L</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="h-full <?= $isLow ? 'bg-amber-400' : 'bg-cyan-500' ?>" style="width: <?= min(100, $pct) ?>%"></div>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <!-- Availability Status Form -->
          <form method="POST" class="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <input type="hidden" name="action" value="update_status">
            <input type="hidden" name="machine_id" value="<?= htmlspecialchars($vm['machine_id']) ?>">
            <span class="font-semibold text-slate-300">Status:</span>

            <select name="status" onchange="this.form.submit()" class="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 font-semibold text-xs cursor-pointer focus:outline-none focus:border-purple-500">
              <option value="operational" <?= $vm['status'] === 'operational' ? 'selected' : '' ?>>🟢 Operational</option>
              <option value="offline" <?= $vm['status'] === 'offline' ? 'selected' : '' ?>>🔴 Offline</option>
              <option value="maintenance" <?= $vm['status'] === 'maintenance' ? 'selected' : '' ?>>🔧 Maintenance</option>
              <option value="low_water" <?= $vm['status'] === 'low_water' ? 'selected' : '' ?>>⚠️ Low Water</option>
            </select>
          </form>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 bg-slate-950/50 rounded-xl">
              <span class="text-[10px] text-slate-400 block">Coin Hopper:</span>
              <span class="font-bold text-emerald-400">₱<?= number_format($vm['current_coin_total'], 2) ?></span>
            </div>
            <div class="p-2 bg-slate-950/50 rounded-xl">
              <span class="text-[10px] text-slate-400 block">Lifetime Sales:</span>
              <span class="font-bold text-white">₱<?= number_format($vm['total_lifetime_sales'], 2) ?></span>
            </div>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</main>

<!-- Add Vending Machine Modal (Admin) -->
<div id="addMachineModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 class="font-bold text-white text-base">Add New Vending Machine</h3>
      <button onclick="document.getElementById('addMachineModal').classList.add('hidden')" class="text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <form method="POST" class="space-y-3 text-xs">
      <input type="hidden" name="action" value="add_machine">
      <div>
        <label class="text-slate-400 block mb-1">Machine Code:</label>
        <input type="text" name="code" placeholder="e.g. AQUAVEND-04" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Unit Display Name:</label>
        <input type="text" name="name" placeholder="e.g. Paglaum Plaza Corner Unit" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-slate-400 block mb-1">Location Details:</label>
          <input type="text" name="location_name" placeholder="Near Elementary School" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
        <div>
          <label class="text-slate-400 block mb-1">Barangay:</label>
          <input type="text" name="barangay" placeholder="Brgy. Paglaum" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="text-slate-400 block mb-1">Capacity (L):</label>
          <input type="number" name="water_capacity" value="500" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
        <div>
          <label class="text-slate-400 block mb-1">Latitude:</label>
          <input type="text" name="lat" value="10.2014" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
        <div>
          <label class="text-slate-400 block mb-1">Longitude:</label>
          <input type="text" name="lng" value="122.8601" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
      </div>
      <button type="submit" class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl mt-2">
        Register Machine to Fleet
      </button>
    </form>
  </div>
</div>

</body>
</html>
