<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$currentUser = $_SESSION['user'];
$customers = getCustomers();
$orders = getOrders();

// Calculate total containers held across customers
$totalHeld = array_reduce($customers, function($sum, $c) {
    return $sum + ($c['containers_held'] ?? 0);
}, 0);

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-blue-400 font-bold uppercase tracking-wider block">Station Asset Protection</span>
      <h1 class="text-2xl font-black text-white">5-Gallon Container & Deposit Tracking</h1>
      <p class="text-xs text-slate-400 mt-1">Audit jugs in customer possession, deposits held, and return compliance.</p>
    </div>

    <div class="px-4 py-2 bg-blue-950/80 border border-blue-800 rounded-2xl text-xs font-bold text-blue-300">
      <i class="fa-solid fa-droplet mr-1.5"></i> <?= $totalHeld ?> Jugs Currently in Circulation
    </div>
  </div>

  <!-- Metric Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Total Jugs Outstanding</span>
      <span class="text-2xl font-black text-cyan-400 block mt-1"><?= $totalHeld ?> units</span>
      <span class="text-[10px] text-slate-500 mt-1 block">Held by registered accounts</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Security Deposit Value</span>
      <span class="text-2xl font-black text-emerald-400 block mt-1">₱<?= number_format($totalHeld * 200, 2) ?></span>
      <span class="text-[10px] text-slate-500 mt-1 block">₱200 standard deposit/container</span>
    </div>

    <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <span class="text-slate-400 font-medium block">Station In-House Inventory</span>
      <span class="text-2xl font-black text-white block mt-1">95 ready</span>
      <span class="text-[10px] text-slate-500 mt-1 block">Sanitized & sealed at refilling line</span>
    </div>
  </div>

  <!-- Customer Container Balance Table -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 class="font-bold text-white text-sm flex items-center gap-2">
        <i class="fa-solid fa-users text-blue-400"></i>
        <span>Customer Container Balances</span>
      </h3>
      <span class="text-xs text-slate-400 font-mono"><?= count($customers) ?> accounts listed</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="text-slate-400 uppercase text-[10px] bg-slate-950/80 border-b border-slate-800">
          <tr>
            <th class="py-3 px-4">Customer Name</th>
            <th class="py-3 px-4">Category</th>
            <th class="py-3 px-4">Barangay / Address</th>
            <th class="py-3 px-4">Phone</th>
            <th class="py-3 px-4 text-center">Containers Held</th>
            <th class="py-3 px-4 text-right">Deposit Value</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80 text-slate-300">
          <?php foreach ($customers as $c): ?>
            <tr class="hover:bg-slate-950/50 transition-colors">
              <td class="py-3 px-4 font-bold text-white"><?= htmlspecialchars($c['name']) ?></td>
              <td class="py-3 px-4 capitalize"><?= htmlspecialchars($c['customer_type'] ?? 'Residential') ?></td>
              <td class="py-3 px-4"><?= htmlspecialchars($c['address']) ?> (<?= htmlspecialchars($c['barangay']) ?>)</td>
              <td class="py-3 px-4 font-mono text-slate-400"><?= htmlspecialchars($c['phone']) ?></td>
              <td class="py-3 px-4 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-black <?= $c['containers_held'] > 0 ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400' ?>">
                  <?= $c['containers_held'] ?> jugs
                </span>
              </td>
              <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                ₱<?= number_format(($c['containers_held'] ?? 0) * 200, 2) ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</main>

</body>
</html>
