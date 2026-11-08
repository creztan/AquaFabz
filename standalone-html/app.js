// ======================================================================
// AquaFabz Standalone Client - Pure JavaScript & JSON (Zero JSX, Zero Backend)
// Runs 100% locally in browser memory & localStorage
// ======================================================================

const DEFAULT_PRODUCTS = [
  { id: 'p1', code: 'REF-PUR-RND', name: 'Purified Water Refill (5-Gal Round)', price: 25.00, stock: 180 },
  { id: 'p2', code: 'REF-PUR-SLM', name: 'Purified Water Refill (5-Gal Slim)', price: 25.00, stock: 160 },
  { id: 'p3', code: 'REF-MIN-RND', name: 'Mineral Water Refill (5-Gal Round)', price: 30.00, stock: 140 },
  { id: 'p4', code: 'REF-ALK-RND', name: 'Alkaline Water Refill (pH 9.5)', price: 40.00, stock: 95 },
  { id: 'p5', code: 'CON-SLM-NEW', name: 'New 5-Gal Slim Container w/ Faucet', price: 220.00, stock: 45 },
  { id: 'p6', code: 'CON-RND-NEW', name: 'New 5-Gal Round Container', price: 200.00, stock: 50 },
  { id: 'p7', code: 'ACC-CAP-NON', name: 'Non-Spill Bottle Cap (Pack of 5)', price: 35.00, stock: 120 }
];

const DEFAULT_VENDING_MACHINES = [
  { id: 'vm1', code: 'AQUAVEND-01', name: 'Binalbagan Public Market Unit A', location: 'Public Market Entrance', barangay: 'Brgy. Sto. Rosario', status: 'operational', waterLiters: 480, capacity: 600, coins: 420.00 },
  { id: 'vm2', code: 'AQUAVEND-02', name: 'Crossing Pag-Asa Junction Unit', location: 'Near Tricycle Terminal', barangay: 'Brgy. Enclaro', status: 'operational', waterLiters: 350, capacity: 500, coins: 310.00 },
  { id: 'vm3', code: 'AQUAVEND-03', name: 'Biscom Sugar Mill Gate Terminal', location: 'Mill Worker Gate 2', barangay: 'Brgy. San Jose', status: 'low_water', waterLiters: 120, capacity: 500, coins: 195.00 }
];

const DEFAULT_ORDERS = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-001',
    customerName: 'Barangay Health Center - Enclaro',
    phone: '0918-444-1122',
    address: 'Health Center Compound, Purok 3',
    barangay: 'Brgy. Enclaro',
    status: 'Out for Delivery',
    items: '5x Purified Water Refill',
    emptyToReturn: 5,
    amount: 140.00,
    lat: 10.2025,
    lng: 122.8615
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-002',
    customerName: 'Aling Nena Store & Eatery',
    phone: '0920-555-7788',
    address: 'National Highway cor. Pag-Asa St.',
    barangay: 'Brgy. Enclaro',
    status: 'Preparing',
    items: '6x Purified Water Refill',
    emptyToReturn: 6,
    amount: 165.00,
    lat: 10.2008,
    lng: 122.8592
  }
];

const DEFAULT_CUSTOMERS = [
  { id: 'c1', name: 'Barangay Health Center - Enclaro', address: 'Health Center Compound, Purok 3', barangay: 'Brgy. Enclaro', phone: '0918-444-1122', held: 6 },
  { id: 'c2', name: 'Aling Nena Store & Eatery', address: 'National Highway cor. Pag-Asa St.', barangay: 'Brgy. Enclaro', phone: '0920-555-7788', held: 8 },
  { id: 'c3', name: 'Dr. Ronald Mendoza', address: 'Block 4, Lot 12, Villa Binalbagan Subd.', barangay: 'Brgy. Paglaum', phone: '0917-888-9900', held: 3 }
];

// Storage Engine
function loadData(key, fallback) {
  const item = localStorage.getItem('aquafabz_' + key);
  return item ? JSON.parse(item) : fallback;
}

function saveData(key, data) {
  localStorage.setItem('aquafabz_' + key, JSON.stringify(data));
}

let products = loadData('products', DEFAULT_PRODUCTS);
let vendingMachines = loadData('vending', DEFAULT_VENDING_MACHINES);
let orders = loadData('orders', DEFAULT_ORDERS);
let customers = loadData('customers', DEFAULT_CUSTOMERS);
let currentRole = 'admin';
let posCart = [];
let mapInstance = null;
let mapMarkersGroup = null;

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById('view-' + tabId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-cyan-600', 'text-white');
    btn.classList.add('text-slate-300');
  });

  const activeNav = document.getElementById('nav-' + tabId);
  if (activeNav) {
    activeNav.classList.add('bg-cyan-600', 'text-white');
    activeNav.classList.remove('text-slate-300');
  }

  if (tabId === 'deliveries') {
    initOrUpdateMap();
  }
}

// Role Switching
function changeRole(role) {
  currentRole = role;
  document.getElementById('welcomeHeading').innerText =
    role === 'admin' ? 'Welcome, Administrator' : (role === 'staff' ? 'Welcome, Staff Cashier' : 'Welcome, Delivery Rider');

  const adminPos = document.getElementById('adminPosActions');
  const adminVending = document.getElementById('adminVendingActions');
  const navPos = document.getElementById('nav-pos');

  if (adminPos) adminPos.style.display = role === 'admin' ? 'flex' : 'none';
  if (adminVending) adminVending.style.display = role === 'admin' ? 'block' : 'none';
  if (navPos) navPos.style.display = role === 'delivery' ? 'none' : 'inline-flex';

  renderPosProducts();
}

// -------------------------------------------------------------
// POS COUNTER (Add, Cart, REMOVE item when listing, Checkout)
// -------------------------------------------------------------
function renderPosProducts() {
  const container = document.getElementById('posProductList');
  if (!container) return;
  document.getElementById('posProductCount').innerText = products.length + ' items available';

  let html = '';
  products.forEach(p => {
    html += `
      <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">${p.code}</span>
            <h4 class="font-bold text-white text-xs mt-1.5">${p.name}</h4>
            <span class="text-[11px] text-slate-400">Stock: ${p.stock}</span>
          </div>

          ${currentRole === 'admin' ? `
            <button type="button" onclick="deleteProduct('${p.id}')" class="p-1 text-slate-500 hover:text-rose-400 cursor-pointer" title="Delete from catalog">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span class="text-base font-black text-white font-mono">₱${p.price.toFixed(2)}</span>
          <button type="button" onclick="addToPosCart('${p.id}')" class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-plus text-[10px]"></i> Add
          </button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function addToPosCart(prodId) {
  const p = products.find(x => x.id === prodId);
  if (!p) return;
  const existing = posCart.find(i => i.id === prodId);
  if (existing) {
    existing.qty += 1;
    existing.subtotal = existing.qty * existing.price;
  } else {
    posCart.push({ id: p.id, name: p.name, price: p.price, qty: 1, subtotal: p.price });
  }
  renderPosCart();
}

function updatePosCartQty(prodId, delta) {
  const item = posCart.find(i => i.id === prodId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removePosCartItem(prodId);
    return;
  }
  item.subtotal = item.qty * item.price;
  renderPosCart();
}

// User Request #2: Explicit Remove item when listing
function removePosCartItem(prodId) {
  posCart = posCart.filter(i => i.id !== prodId);
  renderPosCart();
}

function clearPosCart() {
  posCart = [];
  renderPosCart();
}

function renderPosCart() {
  const container = document.getElementById('posCartContainer');
  const checkoutBtn = document.getElementById('posCheckoutBtn');
  if (!container) return;

  if (posCart.length === 0) {
    container.innerHTML = '<div class="py-12 text-center text-xs text-slate-500">Cart is empty. Click <strong>Add</strong> on items to begin.</div>';
    if (checkoutBtn) checkoutBtn.disabled = true;
    recalculatePosTotals();
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;
  let html = '';
  posCart.forEach(item => {
    html += `
      <div class="py-2 flex items-center justify-between gap-2 text-xs">
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white truncate">${item.name}</div>
          <div class="text-[11px] text-slate-400">₱${item.price.toFixed(2)} each</div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button type="button" onclick="updatePosCartQty('${item.id}', -1)" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center font-bold cursor-pointer">-</button>
            <span class="w-5 text-center font-mono font-bold text-white">${item.qty}</span>
            <button type="button" onclick="updatePosCartQty('${item.id}', 1)" class="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 flex items-center justify-center font-bold cursor-pointer">+</button>
          </div>

          <span class="w-14 text-right font-black text-white font-mono">₱${item.subtotal.toFixed(2)}</span>

          <!-- Remove Item from Cart Listing (Request #2) -->
          <button type="button" onclick="removePosCartItem('${item.id}')" class="p-1 text-slate-500 hover:text-rose-400 cursor-pointer" title="Remove from listing">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  recalculatePosTotals();
}

function recalculatePosTotals() {
  const subtotal = posCart.reduce((s, i) => s + i.subtotal, 0);
  const isDelivery = document.getElementById('posOrderType')?.value === 'delivery';
  const deliveryFee = isDelivery && posCart.length > 0 ? 15.00 : 0.00;
  const grandTotal = subtotal + deliveryFee;

  document.getElementById('posSubtotal').innerText = '₱' + subtotal.toFixed(2);
  document.getElementById('posDeliveryFee').innerText = '₱' + deliveryFee.toFixed(2);
  document.getElementById('posTotalAmount').innerText = '₱' + grandTotal.toFixed(2);

  calculatePosChange();
}

function calculatePosChange() {
  const totalStr = document.getElementById('posTotalAmount').innerText.replace('₱', '');
  const total = parseFloat(totalStr) || 0;
  const tendered = parseFloat(document.getElementById('posTendered').value) || 0;
  const change = Math.max(0, tendered - total);
  document.getElementById('posChange').innerText = '₱' + change.toFixed(2);
}

function checkoutPosOrder() {
  if (posCart.length === 0) return;
  const custName = document.getElementById('posCustomerName').value || 'Walk-In Customer';
  const isDelivery = document.getElementById('posOrderType').value === 'delivery';
  const totalStr = document.getElementById('posTotalAmount').innerText.replace('₱', '');

  const newOrd = {
    id: 'ord-' + (orders.length + 1),
    orderNumber: 'ORD-2026-00' + (orders.length + 1),
    customerName: custName,
    phone: '0912-345-6789',
    address: isDelivery ? 'Poblacion Binalbagan' : 'Store Counter',
    barangay: 'Brgy. Enclaro',
    status: isDelivery ? 'Pending' : 'Delivered',
    items: posCart.map(i => `${i.qty}x ${i.name}`).join(', '),
    emptyToReturn: isDelivery ? 2 : 0,
    amount: parseFloat(totalStr),
    lat: 10.2014,
    lng: 122.8601
  };

  orders.unshift(newOrd);
  saveData('orders', orders);

  alert('Sale successfully completed! Ticket: ' + newOrd.orderNumber + ' (₱' + newOrd.amount + ')');
  clearPosCart();
  renderDeliveryQueue();
  updateKpi();
}

function submitNewProduct() {
  const code = document.getElementById('newProdCode').value || 'PROD-NEW';
  const name = document.getElementById('newProdName').value || 'New Item';
  const price = parseFloat(document.getElementById('newProdPrice').value) || 25;
  const stock = parseInt(document.getElementById('newProdStock').value) || 50;

  products.push({ id: 'p-' + Date.now(), code, name, price, stock });
  saveData('products', products);

  document.getElementById('posAddModal').classList.add('hidden');
  renderPosProducts();
  updateKpi();
}

function deleteProduct(prodId) {
  if (!confirm('Remove this product permanently from the station listing?')) return;
  products = products.filter(p => p.id !== prodId);
  saveData('products', products);
  renderPosProducts();
  updateKpi();
}

// -------------------------------------------------------------
// VENDING MACHINES (User Request #1: Admin Add & Remove)
// -------------------------------------------------------------
function renderVendingMachines() {
  const container = document.getElementById('vendingFleetList');
  if (!container) return;

  let html = '';
  vendingMachines.forEach(vm => {
    const isLow = vm.status === 'low_water';
    const pct = Math.min(100, (vm.waterLiters / vm.capacity) * 100);

    html += `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">${vm.code}</span>
              <h3 class="font-bold text-white text-sm mt-1.5">${vm.name}</h3>
              <p class="text-xs text-slate-400 mt-0.5"><i class="fa-solid fa-location-dot text-slate-500 mr-1"></i> ${vm.location} (${vm.barangay})</p>
            </div>

            <!-- Remove Vending Machine Button (User Request #1) -->
            ${currentRole === 'admin' ? `
              <button type="button" onclick="removeVendingMachine('${vm.id}')" class="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer" title="Remove vending machine">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : ''}
          </div>

          <div class="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-slate-400">Water Level:</span>
              <span class="font-bold ${isLow ? 'text-amber-400' : 'text-cyan-400'}">${vm.waterLiters}L / ${vm.capacity}L</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="h-full ${isLow ? 'bg-amber-400' : 'bg-cyan-500'}" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <div class="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-300">Status:</span>
            <select onchange="updateVendingStatus('${vm.id}', this.value)" class="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs cursor-pointer">
              <option value="operational" ${vm.status === 'operational' ? 'selected' : ''}>🟢 Operational</option>
              <option value="offline" ${vm.status === 'offline' ? 'selected' : ''}>🔴 Offline</option>
              <option value="maintenance" ${vm.status === 'maintenance' ? 'selected' : ''}>🔧 Maintenance</option>
              <option value="low_water" ${vm.status === 'low_water' ? 'selected' : ''}>⚠️ Low Water</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 bg-slate-950/50 rounded-xl">
              <span class="text-[10px] text-slate-400 block">Hopper:</span>
              <span class="font-bold text-emerald-400">₱${vm.coins.toFixed(2)}</span>
            </div>
            <div class="p-2 bg-slate-950/50 rounded-xl">
              <span class="text-[10px] text-slate-400 block">Capacity:</span>
              <span class="font-bold text-white">${vm.capacity}L</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// User Request #1: Admin Add Machine
function submitNewVendingMachine() {
  const code = document.getElementById('newVmCode').value || 'AQUAVEND-' + (vendingMachines.length + 1);
  const name = document.getElementById('newVmName').value || 'New Unit';
  const location = document.getElementById('newVmLocation').value || 'Binalbagan Area';

  vendingMachines.push({
    id: 'vm-' + Date.now(),
    code,
    name,
    location,
    barangay: 'Brgy. Enclaro',
    status: 'operational',
    waterLiters: 500,
    capacity: 500,
    coins: 0.00
  });

  saveData('vending', vendingMachines);
  document.getElementById('vendingAddModal').classList.add('hidden');
  renderVendingMachines();
  updateKpi();
}

// User Request #1: Admin Remove Machine
function removeVendingMachine(machineId) {
  if (!confirm('Remove this vending machine from the fleet?')) return;
  vendingMachines = vendingMachines.filter(m => m.id !== machineId);
  saveData('vending', vendingMachines);
  renderVendingMachines();
  updateKpi();
}

function updateVendingStatus(machineId, newStatus) {
  const vm = vendingMachines.find(m => m.id === machineId);
  if (vm) {
    vm.status = newStatus;
    saveData('vending', vendingMachines);
    renderVendingMachines();
  }
}

// -------------------------------------------------------------
// DELIVERIES & ZERO-API DRIVER MAP (Sequential Stops & Browser GPS)
// -------------------------------------------------------------
function renderDeliveryQueue() {
  const container = document.getElementById('deliveryCardsContainer');
  if (!container) return;

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  document.getElementById('deliveryQueueCount').innerText = activeOrders.length + ' trips pending';

  if (activeOrders.length === 0) {
    container.innerHTML = '<div class="text-center py-16 text-slate-400 bg-slate-950/60 rounded-2xl p-6 text-xs">🎉 All delivery trips completed!</div>';
    return;
  }

  let html = '';
  activeOrders.forEach((ord, idx) => {
    html += `
      <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-[10px] flex items-center justify-center">#${idx + 1}</span>
            <span class="font-mono font-bold text-xs text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">${ord.orderNumber}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${ord.status === 'Out for Delivery' ? 'bg-indigo-600 text-white' : 'bg-amber-500/20 text-amber-300'}">${ord.status}</span>
        </div>

        <div>
          <h4 class="font-black text-white text-sm">${ord.customerName}</h4>
          <p class="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <i class="fa-solid fa-location-dot text-indigo-400"></i>
            <span>${ord.address} (${ord.barangay})</span>
          </p>
        </div>

        <div class="p-2.5 bg-slate-900 rounded-xl text-xs space-y-1 border border-slate-800/80">
          <div class="flex justify-between text-slate-300">
            <span>Empty Jugs to Pick Up:</span>
            <span class="font-bold text-cyan-400">${ord.emptyToReturn} containers</span>
          </div>
          <div class="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1">
            <span>Collect Amount:</span>
            <span class="text-emerald-400 font-mono">₱${ord.amount.toFixed(2)}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1">
          ${ord.status === 'Pending' || ord.status === 'Preparing' ? `
            <button type="button" onclick="updateOrderStatus('${ord.id}', 'Out for Delivery')" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-motorcycle"></i> Depart / Out for Delivery
            </button>
          ` : `
            <button type="button" onclick="updateOrderStatus('${ord.id}', 'Delivered')" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-circle-check"></i> Mark Delivered & Handover
            </button>
          `}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateOrderStatus(ordId, newStatus) {
  const ord = orders.find(o => o.id === ordId);
  if (ord) {
    ord.status = newStatus;
    saveData('orders', orders);
    renderDeliveryQueue();
    initOrUpdateMap();
    updateKpi();
  }
}

function submitNewDelivery() {
  const name = document.getElementById('newDelCustomerName').value || 'Customer';
  const phone = document.getElementById('newDelPhone').value || '0912-345-6789';
  const address = document.getElementById('newDelAddress').value || 'Brgy. Enclaro';
  const qty = parseInt(document.getElementById('newDelQty').value) || 2;
  const empty = parseInt(document.getElementById('newDelEmpty').value) || 2;
  const amount = (qty * 25.00) + 15.00;

  orders.unshift({
    id: 'ord-' + Date.now(),
    orderNumber: 'ORD-2026-00' + (orders.length + 1),
    customerName: name,
    phone,
    address,
    barangay: 'Brgy. Enclaro',
    status: 'Pending',
    items: `${qty}x Purified Water Refill`,
    emptyToReturn: empty,
    amount,
    lat: 10.2014 + (Math.random() * 0.006 - 0.003),
    lng: 122.8601 + (Math.random() * 0.006 - 0.003)
  });

  saveData('orders', orders);
  document.getElementById('newDeliveryModal').classList.add('hidden');
  renderDeliveryQueue();
  initOrUpdateMap();
  updateKpi();
}

// Zero-API Leaflet Map (Pure Local Haversine & Free OpenStreetMap)
function initOrUpdateMap() {
  const mapDiv = document.getElementById('standaloneMap');
  if (!mapDiv) return;

  const stationLat = 10.2014;
  const stationLng = 122.8601;

  if (!mapInstance) {
    mapInstance = L.map('standaloneMap').setView([stationLat, stationLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap | AquaFabz Zero-API System',
      maxZoom: 19
    }).addTo(mapInstance);

    mapMarkersGroup = L.layerGroup().addTo(mapInstance);
  }

  mapMarkersGroup.clearLayers();

  // Station HQ Pin
  const hq = L.marker([stationLat, stationLng]).addTo(mapMarkersGroup);
  hq.bindPopup('<strong>AquaFabz Station HQ</strong><br>Brgy. Enclaro, Crossing Pag-Asa, Binalbagan');

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const waypoints = [[stationLat, stationLng]];

  activeOrders.forEach((ord, i) => {
    if (ord.lat && ord.lng) {
      const pin = L.marker([ord.lat, ord.lng]).addTo(mapMarkersGroup);
      pin.bindPopup(`
        <div style="font-size:12px; min-width:170px;">
          <strong style="color:#4f46e5;">Stop #${i + 1} · ${ord.orderNumber}</strong><br>
          <b>${ord.customerName}</b><br>
          📍 ${ord.address}<br>
          <b>Collect:</b> ₱${ord.amount.toFixed(2)}
        </div>
      `);
      waypoints.push([ord.lat, ord.lng]);
    }
  });

  // Polyline connecting stops sequentially (Zero APIs)
  if (waypoints.length > 1) {
    L.polyline(waypoints, { color: '#6366f1', weight: 3, dashArray: '6, 6' }).addTo(mapMarkersGroup);
  }
}

function locateBrowserRider() {
  if (navigator.geolocation && mapInstance) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const marker = L.circleMarker([lat, lng], { radius: 9, fillColor: '#10b981', color: '#fff', weight: 3, fillOpacity: 1 }).addTo(mapInstance);
      marker.bindPopup('<b>Your Live Position (Rider)</b>').openPopup();
      mapInstance.flyTo([lat, lng], 15);
    }, () => {
      alert('Could not access device GPS. Defaulting to station coordinates.');
    });
  }
}

// -------------------------------------------------------------
// CONTAINERS TRACKING
// -------------------------------------------------------------
function renderContainers() {
  const container = document.getElementById('containerTableBody');
  if (!container) return;

  let html = '';
  customers.forEach(c => {
    html += `
      <tr class="hover:bg-slate-950/50 transition-colors">
        <td class="py-3 px-4 font-bold text-white">${c.name}</td>
        <td class="py-3 px-4">${c.address} (${c.barangay})</td>
        <td class="py-3 px-4 font-mono text-slate-400">${c.phone}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-black ${c.held > 0 ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}">${c.held} jugs</span>
        </td>
        <td class="py-3 px-4 text-right font-mono font-bold text-emerald-400">₱${(c.held * 200).toFixed(2)}</td>
      </tr>
    `;
  });
  container.innerHTML = html;
}

function updateKpi() {
  const kpiP = document.getElementById('kpiProducts');
  const kpiD = document.getElementById('kpiDeliveries');
  const kpiV = document.getElementById('kpiVending');
  const kpiC = document.getElementById('kpiContainers');

  if (kpiP) kpiP.innerText = products.length;
  if (kpiD) kpiD.innerText = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  if (kpiV) kpiV.innerText = vendingMachines.length;
  if (kpiC) kpiC.innerText = customers.reduce((s, c) => s + c.held, 0);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderPosProducts();
  renderPosCart();
  renderVendingMachines();
  renderDeliveryQueue();
  renderContainers();
  updateKpi();
});
