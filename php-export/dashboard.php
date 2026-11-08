<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$user = $_SESSION['user'];

// Fetch quick totals
$stmtProducts = $pdo->query("SELECT COUNT(*) FROM products");
$totalProducts = $stmtProducts->fetchColumn();

$stmtMachines = $pdo->query("SELECT COUNT(*) FROM vending_machines");
$totalMachines = $stmtMachines->fetchColumn();

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
  <!-- Welcome Banner -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-cyan-400 font-bold uppercase tracking-wider block">AquaFabz Central Console</span>
      <h1 class="text-2xl font-black text-white">Welcome back, <?= htmlspecialchars($user['name']) ?></h1>
      <p class="text-xs text-slate-400 mt-1">Logged in as <?= strtoupper($user['role']) ?> · Station: Brgy. Enclaro, Crossing Pag-Asa, Binalbagan</p>
    </div>

    <div class="flex items-center gap-2">
      <a href="vending.php" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md">
        <i class="fa-solid fa-store mr-1.5"></i> Vending Network
      </a>
      <a href="deliveries.php" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md">
        <i class="fa-solid fa-truck mr-1.5"></i> Delivery Dispatch
      </a>
    </div>
  </div>

  <!-- KPI Cards Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Station Products</span>
      <span class="text-2xl font-black text-white block mt-1"><?= $totalProducts ?></span>
      <span class="text-[10px] text-cyan-400 mt-1 block">Purified, Mineral, Containers</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Vending Machines</span>
      <span class="text-2xl font-black text-purple-400 block mt-1"><?= $totalMachines ?></span>
      <span class="text-[10px] text-purple-300 mt-1 block">24/7 Coin-Operated Units</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Station Status</span>
      <span class="text-2xl font-black text-emerald-400 block mt-1">Operational</span>
      <span class="text-[10px] text-emerald-300 mt-1 block">16-Stage Osmosis Active</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Registered Role</span>
      <span class="text-2xl font-black text-cyan-400 block mt-1"><?= strtoupper($user['role']) ?></span>
      <span class="text-[10px] text-slate-400 mt-1 block">Full Role Access Granted</span>
    </div>
  </div>
</main>

</body>
</html>
