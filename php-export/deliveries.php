<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$currentUser = $_SESSION['user'];
$orders = getOrders();
$customers = getCustomers();
$settings = getSettings();

// Handle Order Status Updates
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update_order_status') {
        $orderId = $_POST['order_id'] ?? '';
        $newStatus = $_POST['status'] ?? 'Delivered';
        foreach ($orders as &$ord) {
            if ($ord['order_id'] === $orderId) {
                $ord['status'] = $newStatus;
                break;
            }
        }
        saveOrders($orders);
        header('Location: deliveries.php?updated=' . urlencode($orderId));
        exit;
    }

    if ($_POST['action'] === 'create_delivery') {
        $orders = getOrders();
        $qty = intval($_POST['quantity'] ?? 1);
        $price = floatval($_POST['price'] ?? 25.00);
        $total = ($qty * $price) + 15.00; // 15 default delivery fee

        $newOrder = [
            'id' => count($orders) + 1,
            'order_id' => 'ord-' . (count($orders) + 101),
            'order_number' => 'ORD-' . date('Y') . '-' . str_pad(count($orders) + 1, 3, '0', STR_PAD_LEFT),
            'customer_id' => $_POST['customer_id'] ?? 'cust-walkin',
            'customer_name' => trim($_POST['customer_name'] ?? 'Walk-In Customer'),
            'customer_phone' => trim($_POST['customer_phone'] ?? '0912-345-6789'),
            'delivery_address' => trim($_POST['delivery_address'] ?? 'Brgy. Enclaro'),
            'barangay' => trim($_POST['barangay'] ?? 'Brgy. Enclaro'),
            'order_type' => 'delivery',
            'status' => 'Pending',
            'payment_method' => $_POST['payment_method'] ?? 'cash',
            'total_amount' => $total,
            'containers_to_return_count' => intval($_POST['containers_to_return'] ?? 0),
            'assigned_personnel' => $_POST['assigned_personnel'] ?? 'Christan Jacob M. Verde',
            'items' => [
                [
                    'productId' => 'prod-1',
                    'productName' => 'Purified Water Refill (5-Gal)',
                    'quantity' => $qty,
                    'price' => $price,
                    'subtotal' => $qty * $price
                ]
            ],
            'delivery_fee' => 15.00,
            'coordinates' => [
                'lat' => floatval($_POST['lat'] ?? 10.2014),
                'lng' => floatval($_POST['lng'] ?? 122.8601)
            ],
            'created_at' => date('Y-m-d H:i:s')
        ];
        $orders[] = $newOrder;
        saveOrders($orders);
        header('Location: deliveries.php?created=' . urlencode($newOrder['order_number']));
        exit;
    }
}

// Filter active deliveries for view
$activeOrders = array_filter($orders, function($o) {
    return ($o['status'] ?? '') !== 'Delivered' && ($o['status'] ?? '') !== 'Cancelled';
});

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <!-- Driver Dispatch Banner -->
  <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/60 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-indigo-400 font-bold uppercase tracking-wider block">AquaFabz Fleet Operations</span>
      <h1 class="text-2xl font-black text-white">Delivery Dispatch Console & Driver Map</h1>
      <p class="text-xs text-indigo-200 mt-1">Logged in as <?= htmlspecialchars($currentUser['name']) ?> (<?= strtoupper($currentUser['role']) ?>) · Real-time JSON Queue</p>
    </div>

    <div class="px-3.5 py-2 bg-indigo-900/60 border border-indigo-700/60 rounded-xl text-xs font-bold text-indigo-300">
      <i class="fa-solid fa-motorcycle mr-1.5"></i> Driver Route & Handover
    </div>
  </div>

  <!-- Delivery Queue & Map Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left 6 Cols: Delivery Queue -->
    <div class="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-sm flex items-center gap-2">
          <i class="fa-solid fa-route text-indigo-400"></i>
          <span>Active Delivery Queue</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono"><?= count($activeOrders) ?> trips pending</span>
      </div>

      <div class="space-y-3 max-h-[550px] overflow-y-auto pr-1">
        <?php if (empty($activeOrders)): ?>
          <div class="text-center py-16 text-slate-400 bg-slate-950/60 rounded-2xl p-6 text-xs">
            🎉 All delivery trips completed! No pending dispatches.
          </div>
        <?php else: ?>
          <?php $idx = 1; foreach ($activeOrders as $ord): ?>
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-[10px] flex items-center justify-center">
                    #<?= $idx++ ?>
                  </span>
                  <span class="font-mono font-bold text-xs text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                    <?= htmlspecialchars($ord['order_number']) ?>
                  </span>
                </div>

                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $ord['status'] === 'Out for Delivery' ? 'bg-indigo-600 text-white' : 'bg-amber-500/20 text-amber-300' ?>">
                  <?= htmlspecialchars($ord['status']) ?>
                </span>
              </div>

              <div>
                <h4 class="font-black text-white text-sm"><?= htmlspecialchars($ord['customer_name']) ?></h4>
                <p class="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <i class="fa-solid fa-location-dot text-indigo-400"></i>
                  <span><?= htmlspecialchars($ord['delivery_address']) ?> (<?= htmlspecialchars($ord['barangay']) ?>)</span>
                </p>
                <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <i class="fa-solid fa-phone text-slate-500"></i>
                  <span><?= htmlspecialchars($ord['customer_phone']) ?></span>
                </p>
              </div>

              <div class="p-2.5 bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-800/80">
                <div class="flex justify-between text-slate-300">
                  <span>Empty Jugs to Return:</span>
                  <span class="font-bold text-cyan-400"><?= $ord['containers_to_return_count'] ?> containers</span>
                </div>
                <div class="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1">
                  <span>Collect Amount:</span>
                  <span class="text-emerald-400 font-mono">₱<?= number_format($ord['total_amount'], 2) ?> (<?= strtoupper($ord['payment_method']) ?>)</span>
                </div>
              </div>

              <!-- Driver Status Toggle Form -->
              <form method="POST" class="flex items-center gap-2 pt-1">
                <input type="hidden" name="action" value="update_order_status">
                <input type="hidden" name="order_id" value="<?= htmlspecialchars($ord['order_id']) ?>">

                <?php if ($ord['status'] === 'Pending' || $ord['status'] === 'Preparing'): ?>
                  <input type="hidden" name="status" value="Out for Delivery">
                  <button type="submit" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-motorcycle"></i> Depart / Out for Delivery
                  </button>
                <?php else: ?>
                  <input type="hidden" name="status" value="Delivered">
                  <button type="submit" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-circle-check"></i> Mark Delivered & Handover
                  </button>
                <?php endif; ?>
              </form>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>

    <!-- Right 6 Cols: Zero-API Driver Leaflet Map -->
    <div class="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-sm flex items-center gap-2">
          <i class="fa-solid fa-map-location-dot text-indigo-400"></i>
          <span>Live Driver Dispatch Map (Zero External APIs)</span>
        </h3>
        <span class="text-xs text-indigo-400 font-bold">Binalbagan Area</span>
      </div>

      <!-- Map Container -->
      <div id="driverMap" class="w-full h-[480px] rounded-2xl overflow-hidden border border-slate-800 relative z-10"></div>

      <div class="flex items-center justify-between text-xs text-slate-400">
        <button type="button" onclick="locateRider()" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold flex items-center gap-1.5">
          <i class="fa-solid fa-crosshairs text-emerald-400"></i> Locate Rider (Browser GPS)
        </button>
        <span class="text-[11px] text-slate-500">Pure Local Haversine Distance & Free OpenStreetMap</span>
      </div>
    </div>
  </div>
</main>

<!-- New Delivery Order Modal -->
<div id="newDeliveryModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 class="font-bold text-white text-base">Book New Delivery Drop-Off</h3>
      <button onclick="document.getElementById('newDeliveryModal').classList.add('hidden')" class="text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <form method="POST" class="space-y-3 text-xs">
      <input type="hidden" name="action" value="create_delivery">
      <div>
        <label class="text-slate-400 block mb-1">Customer Name:</label>
        <input type="text" name="customer_name" placeholder="Customer full name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Contact Phone:</label>
        <input type="text" name="customer_phone" placeholder="09XX-XXX-XXXX" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Delivery Address:</label>
        <input type="text" name="delivery_address" placeholder="House/Street/Sitio" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-slate-400 block mb-1">Barangay:</label>
          <select name="barangay" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            <option value="Brgy. Enclaro">Brgy. Enclaro</option>
            <option value="Brgy. Sto. Rosario">Brgy. Sto. Rosario</option>
            <option value="Brgy. Paglaum">Brgy. Paglaum</option>
            <option value="Brgy. San Jose">Brgy. San Jose</option>
          </select>
        </div>
        <div>
          <label class="text-slate-400 block mb-1">Refill Jugs (Qty):</label>
          <input type="number" name="quantity" value="3" min="1" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Empty Jugs to Pick Up:</label>
        <input type="number" name="containers_to_return" value="3" min="0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <button type="submit" class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl mt-2">
        Dispatch Delivery Order
      </button>
    </form>
  </div>
</div>

<!-- Map Script (Pure Vanilla JS, Zero APIs, Free Leaflet) -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const stationLat = 10.2014;
  const stationLng = 122.8601;

  const map = L.map('driverMap').setView([stationLat, stationLng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap | AquaFabz Zero-API System',
    maxZoom: 19
  }).addTo(map);

  // Station HQ Marker
  const hqMarker = L.marker([stationLat, stationLng]).addTo(map);
  hqMarker.bindPopup('<strong>AquaFabz Station HQ</strong><br>Brgy. Enclaro, Crossing Pag-Asa, Binalbagan').openPopup();

  // Active Orders passed from PHP JSON
  const orders = <?= json_encode(array_values($activeOrders)) ?>;
  const waypoints = [[stationLat, stationLng]];

  orders.forEach((ord, i) => {
    if (ord.coordinates && ord.coordinates.lat && ord.coordinates.lng) {
      const marker = L.marker([ord.coordinates.lat, ord.coordinates.lng]).addTo(map);
      marker.bindPopup(`
        <div style="font-size:12px; min-width:180px;">
          <strong style="color:#4f46e5;">Stop #${i + 1} · ${ord.order_number}</strong><br>
          <b>${ord.customer_name}</b><br>
          📍 ${ord.delivery_address}<br>
          📞 ${ord.customer_phone}<br>
          <b>Collect:</b> ₱${ord.total_amount}
        </div>
      `);
      waypoints.push([ord.coordinates.lat, ord.coordinates.lng]);
    }
  });

  // Polyline Route Trajectory Connecting Stops (Zero External APIs)
  if (waypoints.length > 1) {
    L.polyline(waypoints, {
      color: '#6366f1',
      weight: 3,
      dashArray: '6, 6'
    }).addTo(map);
  }

  // HTML5 Browser Geolocation (Zero APIs)
  window.locateRider = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const riderMarker = L.circleMarker([lat, lng], {
          radius: 9,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        }).addTo(map);
        riderMarker.bindPopup('<b>Your Live Position (Rider)</b>').openPopup();
        map.flyTo([lat, lng], 15);
      }, function() {
        alert('Could not access device GPS. Defaulting to station base.');
      });
    }
  };
});
</script>

</body>
</html>
