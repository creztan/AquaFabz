<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$currentUser = $_SESSION['user'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AquaFabz Water Refilling Station System</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <!-- Leaflet CSS for Map (Zero External APIs) -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Navigation Bar -->
  <header class="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="index.php" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
          <i class="fa-solid fa-droplet"></i>
        </div>
        <div>
          <span class="font-black text-white text-base tracking-tight">AquaFabz</span>
          <span class="text-xs text-cyan-400 font-medium ml-1">Platform</span>
          <p class="text-[10px] text-slate-400">Brgy. Enclaro, Crossing Pag-Asa, Binalbagan</p>
        </div>
      </a>

      <div class="flex items-center gap-2 text-xs font-semibold">
        <?php if ($currentUser): ?>
          <nav class="hidden md:flex items-center gap-1.5 mr-2">
            <a href="dashboard.php" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              <i class="fa-solid fa-chart-pie mr-1 text-cyan-400"></i> Dashboard
            </a>
            <?php if ($currentUser['role'] === 'admin' || $currentUser['role'] === 'staff'): ?>
              <a href="pos.php" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
                <i class="fa-solid fa-cash-register mr-1 text-emerald-400"></i> POS Counter
              </a>
            <?php endif; ?>
            <a href="deliveries.php" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              <i class="fa-solid fa-truck mr-1 text-indigo-400"></i> Deliveries & Map
            </a>
            <a href="vending.php" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              <i class="fa-solid fa-store mr-1 text-purple-400"></i> Vending
            </a>
            <a href="containers.php" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors">
              <i class="fa-solid fa-box-archive mr-1 text-blue-400"></i> Containers
            </a>
          </nav>

          <span class="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            <i class="fa-solid fa-circle-user text-cyan-400 mr-1"></i>
            <?= htmlspecialchars($currentUser['name']) ?> (<?= strtoupper($currentUser['role']) ?>)
          </span>
          <a href="logout.php" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-800 transition-all">
            <i class="fa-solid fa-right-from-bracket"></i>
          </a>
        <?php else: ?>
          <a href="login.php" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
            Login
          </a>
          <a href="register.php" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-600/30 transition-all">
            Sign Up
          </a>
        <?php endif; ?>
      </div>
    </div>
  </header>
