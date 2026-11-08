<?php
require_once 'config/db.php';

if (!isset($_SESSION['user'])) {
    header('Location: login.php');
    exit;
}

$currentUser = $_SESSION['user'];
$products = getProducts();
$customers = getCustomers();
$settings = getSettings();

// Handle Admin Adding or Deleting Product from Station Listing
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add_product' && $currentUser['role'] === 'admin') {
        $newProd = [
            'id' => count($products) + 1,
            'product_id' => 'prod-' . (count($products) + 1),
            'code' => strtoupper(trim($_POST['code'] ?? 'ITEM-' . rand(100, 999))),
            'name' => trim($_POST['name'] ?? 'New Item'),
            'category' => $_POST['category'] ?? 'refill',
            'water_type' => $_POST['water_type'] ?? 'purified',
            'price' => floatval($_POST['price'] ?? 25),
            'stock' => intval($_POST['stock'] ?? 100),
            'min_stock' => 20,
            'unit' => 'unit'
        ];
        $products[] = $newProd;
        saveProducts($products);
        header('Location: pos.php?msg=added');
        exit;
    }

    if ($_POST['action'] === 'delete_product' && $currentUser['role'] === 'admin') {
        $deleteId = $_POST['product_id'] ?? '';
        $products = array_filter($products, function($p) use ($deleteId) {
            return $p['product_id'] !== $deleteId;
        });
        saveProducts(array_values($products));
        header('Location: pos.php?msg=deleted');
        exit;
    }

    if ($_POST['action'] === 'complete_order') {
        $cartData = json_decode($_POST['cart_json'] ?? '[]', true);
        if (!empty($cartData)) {
            $orders = getOrders();
            $total = floatval($_POST['total_amount'] ?? 0);
            $newOrder = [
                'id' => count($orders) + 1,
                'order_id' => 'ord-' . (count($orders) + 101),
                'order_number' => 'ORD-' . date('Y') . '-' . str_pad(count($orders) + 1, 3, '0', STR_PAD_LEFT),
                'customer_id' => $_POST['customer_id'] ?? 'cust-walkin',
                'customer_name' => $_POST['customer_name'] ?? 'Walk-In Customer',
                'customer_phone' => $_POST['customer_phone'] ?? 'N/A',
                'delivery_address' => $_POST['delivery_address'] ?? 'Store Counter',
                'barangay' => 'Brgy. Enclaro',
                'order_type' => $_POST['order_type'] ?? 'walk-in',
                'status' => $_POST['order_type'] === 'delivery' ? 'Pending' : 'Delivered',
                'payment_method' => $_POST['payment_method'] ?? 'cash',
                'total_amount' => $total,
                'containers_to_return_count' => intval($_POST['containers_to_return'] ?? 0),
                'assigned_personnel' => $currentUser['name'],
                'items' => $cartData,
                'delivery_fee' => floatval($_POST['delivery_fee'] ?? 0),
                'coordinates' => [
                    'lat' => 10.2014,
                    'lng' => 122.8601
                ],
                'created_at' => date('Y-m-d H:i:s')
            ];
            $orders[] = $newOrder;
            saveOrders($orders);
            header('Location: pos.php?order_success=' . urlencode($newOrder['order_number']));
            exit;
        }
    }
}

require_once 'includes/header.php';
?>

<main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
  <!-- POS Header -->
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs text-emerald-400 font-bold uppercase tracking-wider block">AquaFabz Walk-In & Dispatch POS</span>
      <h1 class="text-2xl font-black text-white">Point of Sale (POS) Counter</h1>
      <p class="text-xs text-slate-400 mt-0.5">Cashier: <?= htmlspecialchars($currentUser['name']) ?> (<?= strtoupper($currentUser['role']) ?>) · Instant Calculation & Cash Receipt</p>
    </div>

    <?php if ($currentUser['role'] === 'admin'): ?>
      <button onclick="document.getElementById('addProductModal').classList.remove('hidden')" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Add Item to Catalog
      </button>
    <?php endif; ?>
  </div>

  <?php if (isset($_GET['order_success'])): ?>
    <div class="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-emerald-200 text-xs">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
        <span>Transaction completed successfully! Order <strong><?= htmlspecialchars($_GET['order_success']) ?></strong> recorded into JSON.</span>
      </div>
      <button onclick="window.print()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold">
        <i class="fa-solid fa-print mr-1"></i> Print Receipt
      </button>
    </div>
  <?php endif; ?>

  <!-- POS Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left 7 Cols: Product Catalog -->
    <div class="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-white text-sm flex items-center gap-2">
          <i class="fa-solid fa-boxes-stacked text-cyan-400"></i>
          <span>Select Products & Refills</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono"><?= count($products) ?> items available</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="productGrid">
        <?php foreach ($products as $p): ?>
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <?= htmlspecialchars($p['code']) ?>
                </span>
                <h4 class="font-bold text-white text-xs mt-1.5 line-clamp-2"><?= htmlspecialchars($p['name']) ?></h4>
                <span class="text-[11px] text-slate-400">Stock: <?= $p['stock'] ?> <?= $p['unit'] ?></span>
              </div>

              <?php if ($currentUser['role'] === 'admin'): ?>
                <form method="POST" onsubmit="return confirm('Remove this product permanently from the station listing?');" class="shrink-0">
                  <input type="hidden" name="action" value="delete_product">
                  <input type="hidden" name="product_id" value="<?= htmlspecialchars($p['product_id']) ?>">
                  <button type="submit" class="p-1 text-slate-500 hover:text-rose-400 transition-colors" title="Delete from listing">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </form>
              <?php endif; ?>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span class="text-base font-black text-white">₱<?= number_format($p['price'], 2) ?></span>
              <button type="button" onclick="addToCart(<?= htmlspecialchars(json_encode($p)) ?>)" class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <i class="fa-solid fa-plus text-[10px]"></i> Add
              </button>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Right 5 Cols: Cart & Order Summary -->
    <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 class="font-bold text-white text-sm flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping text-emerald-400"></i>
            <span>Current Order Ticket</span>
          </h3>
          <button type="button" onclick="clearCart()" class="text-xs text-rose-400 hover:underline">Clear</button>
        </div>

        <!-- Cart Items List with Explicit Remove Button -->
        <div id="cartItemsContainer" class="divide-y divide-slate-800/80 my-3 max-h-[300px] overflow-y-auto space-y-2 pr-1">
          <div id="emptyCartMessage" class="py-12 text-center text-xs text-slate-500">
            Cart is empty. Click <strong>Add</strong> on items to begin.
          </div>
        </div>
      </div>

      <!-- Order Form -->
      <form method="POST" id="orderForm" class="space-y-3 pt-3 border-t border-slate-800 text-xs">
        <input type="hidden" name="action" value="complete_order">
        <input type="hidden" name="cart_json" id="cartJsonInput" value="[]">
        <input type="hidden" name="total_amount" id="totalAmountInput" value="0">

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Order Type:</label>
            <select name="order_type" id="orderTypeSelect" onchange="calculateTotals()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
              <option value="walk-in">Store Walk-In</option>
              <option value="delivery">Home/Office Delivery</option>
            </select>
          </div>
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Payment Method:</label>
            <select name="payment_method" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
              <option value="cash">Cash on Hand</option>
              <option value="gcash">GCash</option>
              <option value="credit">Store Credit / Pay Later</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-slate-400 font-semibold block mb-1">Customer Name:</label>
          <input type="text" name="customer_name" id="custNameInput" placeholder="Walk-In Customer" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>

        <div id="deliveryFields" class="hidden space-y-2">
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Delivery Address:</label>
            <input type="text" name="delivery_address" placeholder="Brgy. Enclaro, Purok 3..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
          </div>
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Empty Jugs to Collect:</label>
            <input type="number" name="containers_to_return" value="0" min="0" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
          </div>
        </div>

        <!-- Totals Calculation -->
        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 font-medium">
          <div class="flex justify-between text-slate-400">
            <span>Subtotal:</span>
            <span id="subtotalDisplay">₱0.00</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Delivery Fee:</span>
            <span id="deliveryFeeDisplay">₱0.00</span>
          </div>
          <div class="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
            <span>Grand Total:</span>
            <span class="text-emerald-400 text-lg" id="grandTotalDisplay">₱0.00</span>
          </div>
        </div>

        <!-- Tendered & Change -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Amount Tendered:</label>
            <input type="number" id="tenderedInput" oninput="calculateChange()" placeholder="₱0.00" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold">
          </div>
          <div>
            <label class="text-slate-400 font-semibold block mb-1">Change:</label>
            <div id="changeDisplay" class="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold">₱0.00</div>
          </div>
        </div>

        <button type="submit" id="submitOrderBtn" disabled class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
          <i class="fa-solid fa-check"></i> Complete & Record Order
        </button>
      </form>
    </div>
  </div>
</main>

<!-- Add Product Modal (Admin) -->
<div id="addProductModal" class="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <h3 class="font-bold text-white text-base">Add New Item to Catalog</h3>
      <button onclick="document.getElementById('addProductModal').classList.add('hidden')" class="text-slate-400 hover:text-white">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>
    </div>

    <form method="POST" class="space-y-3 text-xs">
      <input type="hidden" name="action" value="add_product">
      <div>
        <label class="text-slate-400 block mb-1">Item Code:</label>
        <input type="text" name="code" placeholder="e.g. REF-SLM-5G" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Item Name:</label>
        <input type="text" name="name" placeholder="e.g. Mineral Water Refill 5-Gal" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-slate-400 block mb-1">Category:</label>
          <select name="category" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
            <option value="refill">Water Refill</option>
            <option value="container">New Container</option>
            <option value="accessory">Accessory/Cap</option>
          </select>
        </div>
        <div>
          <label class="text-slate-400 block mb-1">Price (₱):</label>
          <input type="number" step="0.5" name="price" placeholder="25.00" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
        </div>
      </div>
      <div>
        <label class="text-slate-400 block mb-1">Initial Stock:</label>
        <input type="number" name="stock" value="100" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white">
      </div>
      <button type="submit" class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl mt-2">
        Save Item to Catalog
      </button>
    </form>
  </div>
</div>

<script>
// Pure Vanilla JavaScript Cart Controller (Zero JSX)
let cart = [];

function addToCart(product) {
  const existing = cart.find(item => item.productId === product.product_id);
  if (existing) {
    existing.quantity += 1;
    existing.subtotal = existing.quantity * existing.price;
  } else {
    cart.push({
      productId: product.product_id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      subtotal: product.price
    });
  }
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  item.subtotal = item.quantity * item.price;
  renderCart();
}

// Explicit Remove function for item when listing (Satisfies user requirement #2)
function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const emptyMsg = document.getElementById('emptyCartMessage');
  const submitBtn = document.getElementById('submitOrderBtn');

  if (cart.length === 0) {
    container.innerHTML = '<div class="py-12 text-center text-xs text-slate-500">Cart is empty. Click <strong>Add</strong> on items to begin.</div>';
    submitBtn.disabled = true;
    calculateTotals();
    return;
  }

  submitBtn.disabled = false;
  let html = '';
  cart.forEach(item => {
    html += `
      <div class="py-2 flex items-center justify-between gap-2 text-xs">
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white truncate">${item.productName}</div>
          <div class="text-[11px] text-slate-400">₱${item.price.toFixed(2)} each</div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button type="button" onclick="updateQty('${item.productId}', -1)" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center font-bold">-</button>
            <span class="w-5 text-center font-mono font-bold text-white">${item.quantity}</span>
            <button type="button" onclick="updateQty('${item.productId}', 1)" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center font-bold">+</button>
          </div>

          <span class="w-14 text-right font-black text-white font-mono">₱${item.subtotal.toFixed(2)}</span>

          <!-- Remove Item from Cart Listing -->
          <button type="button" onclick="removeFromCart('${item.productId}')" class="p-1 text-slate-500 hover:text-rose-400 transition-colors" title="Remove from listing">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  calculateTotals();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const isDelivery = document.getElementById('orderTypeSelect').value === 'delivery';
  const deliveryFields = document.getElementById('deliveryFields');
  const deliveryFee = isDelivery && cart.length > 0 ? 15.00 : 0.00;

  if (isDelivery) {
    deliveryFields.classList.remove('hidden');
  } else {
    deliveryFields.classList.add('hidden');
  }

  const grandTotal = subtotal + deliveryFee;

  document.getElementById('subtotalDisplay').innerText = '₱' + subtotal.toFixed(2);
  document.getElementById('deliveryFeeDisplay').innerText = '₱' + deliveryFee.toFixed(2);
  document.getElementById('grandTotalDisplay').innerText = '₱' + grandTotal.toFixed(2);

  document.getElementById('cartJsonInput').value = JSON.stringify(cart);
  document.getElementById('totalAmountInput').value = grandTotal.toFixed(2);

  calculateChange();
}

function calculateChange() {
  const total = parseFloat(document.getElementById('totalAmountInput').value) || 0;
  const tendered = parseFloat(document.getElementById('tenderedInput').value) || 0;
  const change = Math.max(0, tendered - total);
  document.getElementById('changeDisplay').innerText = '₱' + change.toFixed(2);
}
</script>

</body>
</html>
