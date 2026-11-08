<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$user = $_SESSION['user'];
$products = getProducts();
$machines = getVendingMachines();
$orders = getOrders();
$customers = getCustomers();

$totalProducts = count($products);
$totalMachines = count($machines);
$activeOrders = array_filter($orders, function($o) {
    return ($o['status'] ?? '') !== 'Delivered' && ($o['status'] ?? '') !== 'Cancelled';
});
$todaySales = array_reduce($orders, function($sum, $o) {
    return $sum + ($o['total_amount'] ?? 0);
}, 0);

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <!-- Welcome Banner -->
  <div class="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-cyan-400 font-bold uppercase tracking-wider block">AquaFabz Central Console</span>
      <h1 class="text-2xl font-black text-white">Welcome back, <?= htmlspecialchars($user['name']) ?></h1>
      <p class="text-xs text-slate-400 mt-1">Logged in as <?= strtoupper($user['role']) ?> · Station: Brgy. Enclaro, Crossing Pag-Asa, Binalbagan</p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <a href="pos.php" class="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
        <i class="fa-solid fa-cash-register"></i> POS Counter
      </a>
      <a href="deliveries.php" class="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
        <i class="fa-solid fa-truck"></i> Delivery Map
      </a>
      <a href="vending.php" class="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
        <i class="fa-solid fa-store"></i> Vending Network
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
      <span class="text-slate-400 font-medium block">Active Delivery Trips</span>
      <span class="text-2xl font-black text-indigo-400 block mt-1"><?= count($activeOrders) ?></span>
      <span class="text-[10px] text-indigo-300 mt-1 block">Assigned to Jacob & fleet</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Vending Machines</span>
      <span class="text-2xl font-black text-purple-400 block mt-1"><?= $totalMachines ?></span>
      <span class="text-[10px] text-purple-300 mt-1 block">24/7 Coin-Operated Units</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Recorded Revenue</span>
      <span class="text-2xl font-black text-emerald-400 block mt-1">₱<?= number_format($todaySales, 2) ?></span>
      <span class="text-[10px] text-emerald-300 mt-1 block">JSON Data Persistent</span>
    </div>
  </div>

  <!-- Recent Deliveries Quick Table -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 class="font-bold text-white text-sm flex items-center gap-2">
        <i class="fa-solid fa-list-check text-cyan-400"></i>
        <span>Recent Orders & Handovers</span>
      </h3>
      <a href="deliveries.php" class="text-xs text-cyan-400 hover:underline">View All in Dispatch →</a>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="text-slate-400 uppercase text-[10px] bg-slate-950/80 border-b border-slate-800">
          <tr>
            <th class="py-2.5 px-4">Order #</th>
            <th class="py-2.5 px-4">Customer</th>
            <th class="py-2.5 px-4">Address</th>
            <th class="py-2.5 px-4">Status</th>
            <th class="py-2.5 px-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80 text-slate-300">
          <?php foreach (array_slice(array_reverse($orders), 0, 5) as $ord): ?>
            <tr class="hover:bg-slate-950/50 transition-colors">
              <td class="py-2.5 px-4 font-mono font-bold text-indigo-400"><?= htmlspecialchars($ord['order_number']) ?></td>
              <td class="py-2.5 px-4 font-bold text-white"><?= htmlspecialchars($ord['customer_name']) ?></td>
              <td class="py-2.5 px-4"><?= htmlspecialchars($ord['delivery_address']) ?></td>
              <td class="py-2.5 px-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold <?= $ord['status'] === 'Delivered' ? 'bg-emerald-950 text-emerald-400' : 'bg-indigo-950 text-indigo-400' ?>">
                  <?= htmlspecialchars($ord['status']) ?>
                </span>
              </td>
              <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">₱<?= number_format($ord['total_amount'], 2) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</main>

</body>
</html>
