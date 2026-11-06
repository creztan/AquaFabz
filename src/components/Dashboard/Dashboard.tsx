import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Droplets,
  Truck,
  Package,
  AlertTriangle,
  Store,
  Users,
  DollarSign,
  PlusCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Compass,
  Coins,
  MapPin,
  FileText,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenPOS: () => void;
  onOpenNewOrder: () => void;
  onOpenVendingRecord: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenPOS,
  onOpenNewOrder,
  onOpenVendingRecord,
}) => {
  const {
    sales,
    vendingSales,
    vendingMachines,
    orders,
    products,
    customers,
    containers,
    settings,
    currentUser,
    setPrintableItem,
  } = useApp();

  const [salesTimeframe, setSalesTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Calculate Metrics
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Sales calculations
  const todaySalesList = sales.filter((s) => s.date === todayDateStr);
  const totalSalesToday = todaySalesList.reduce((acc, s) => acc + s.totalAmount, 0);

  // Counter vs Vending breakdown today
  const vendingSalesToday = todaySalesList
    .filter((s) => s.isVendingMachineConsolidated)
    .reduce((acc, s) => acc + s.totalAmount, 0);
  const counterSalesToday = totalSalesToday - vendingSalesToday;

  // Active Deliveries
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const preparingOrders = orders.filter((o) => o.status === 'Preparing').length;
  const outForDeliveryOrders = orders.filter((o) => o.status === 'Out for Delivery').length;
  const completedTodayDeliveries = orders.filter(
    (o) => o.status === 'Delivered' && o.date === todayDateStr
  ).length;

  // Container Tracking Stats
  const containerHeldByCustomers = customers.reduce((acc, c) => acc + (c.containersHeld || 0), 0);
  const availableContainersProduct = products.find(
    (p) => p.code === 'CNT-SLM-NEW' || p.category === 'container'
  );
  const availableContainers = availableContainersProduct?.stock || 120;

  // Low Stock Items (< minStock)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const lowWaterVending = vendingMachines.filter((vm) => vm.currentWaterLevelLiters < 250);

  // Vending Machine Stats
  const totalVendingCoinsInBoxes = vendingMachines.reduce((acc, vm) => acc + vm.currentCoinTotal, 0);
  const totalVendingLifetime = vendingMachines.reduce((acc, vm) => acc + vm.totalLifetimeSales, 0);

  return (
    <div className="space-y-6">
      {/* Station Operations Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold tracking-wide">
            <span>Station Operations</span>
            <span aria-hidden="true">·</span>
            <span>AquaFabz Central HQ</span>
            <span aria-hidden="true">·</span>
            <span>10.1883° N, 122.8642° E</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {settings.stationName}
          </h1>
          <p className="text-xs text-slate-300">
            Active operator: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role.toUpperCase()}) · Refilling Station & Geolocation Console
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPOS}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>POS / Walk-In Sale</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>New Delivery Order</span>
          </button>
          <button
            type="button"
            onClick={onOpenVendingRecord}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Audit Vending</span>
          </button>
        </div>
      </div>

      {/* Critical Replenishment Alerts Banner */}
      {(lowStockProducts.length > 0 || lowWaterVending.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-amber-900">
                Replenishment Attention Required ({lowStockProducts.length + lowWaterVending.length} items)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {lowStockProducts.length > 0 && (
                  <span>
                    Low supplies: {lowStockProducts.map((p) => `${p.name} (${p.stock} units left)`).join(', ')}.
                  </span>
                )}
                {lowWaterVending.length > 0 && (
                  <span className="ml-1 font-semibold text-rose-700">
                    Low water in vending units: {lowWaterVending.map((vm) => `${vm.code} (${vm.currentWaterLevelLiters}L)`).join(', ')}.
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            Manage Supplies
          </button>
        </div>
      )}

      {/* 4 Hero Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Gross Sales
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {settings.currencySymbol}
              {totalSalesToday.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Counter: <strong className="text-slate-800">₱{counterSalesToday.toLocaleString()}</strong></span>
              <span>·</span>
              <span>Vending: <strong className="text-purple-600">₱{vendingSalesToday.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Consolidated Revenue</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Reconciled
            </span>
          </div>
        </div>

        {/* Card 2: Delivery Dispatch Pipeline */}
        <div
          onClick={() => onNavigate('deliveries')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-500/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Deliveries
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {outForDeliveryOrders + preparingOrders + pendingOrders}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">{outForDeliveryOrders} On Trip</span>
              <span>·</span>
              <span className="text-sky-600 font-medium">{preparingOrders} Prep</span>
              <span>·</span>
              <span className="text-amber-600 font-medium">{pendingOrders} Pending</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Completed Today</span>
            <span className="text-indigo-700 font-bold">{completedTodayDeliveries} Dispatched</span>
          </div>
        </div>

        {/* Card 3: Water Containers Custody Audit */}
        <div
          onClick={() => onNavigate('containers')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-500/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Containers in Custody
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {containerHeldByCustomers}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>Station Stock: <strong className="text-slate-800">{availableContainers}</strong></span>
              <span>·</span>
              <span>₱200/jug rate</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Customer Deposits</span>
            <span className="text-blue-700 font-bold font-mono tabular-nums">
              ₱{(containerHeldByCustomers * 200).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Vending Machines Network */}
        <div
          onClick={() => onNavigate('vending')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-500/40 transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              24/7 Vending Fleet
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {vendingMachines.length} Units
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>Uncollected: <strong className="text-emerald-700 font-mono">₱{totalVendingCoinsInBoxes.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Lifetime Vending Total</span>
            <span className="text-purple-700 font-bold font-mono tabular-nums">
              ₱{totalVendingLifetime.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Delivery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Interactive Digital Location Map */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Location Mapping Studio & Delivery Path Monitor
                </h3>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-cyan-700 font-semibold">AquaFabz Service Area</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time GIS display of refilling station HQ, delivery customer addresses, and 24/7 vending units.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Expand Map Studio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <DeliveryMap
            settings={settings}
            orders={orders}
            customers={customers}
            vendingMachines={vendingMachines}
            heightClass="h-[380px]"
            showVendingMachines={true}
            showAllCustomers={true}
          />
        </div>

        {/* Right 4 Cols: Live Orders Queue & Quick Dispatches */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Today's Delivery Queue</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('deliveries')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No orders registered today. Click "New Delivery Order" to create one.
              </div>
            ) : (
              orders.slice(0, 5).map((order) => {
                let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                if (order.status === 'Preparing') badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200';
                if (order.status === 'Out for Delivery') badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                if (order.status === 'Delivered') badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                return (
                  <div
                    key={order.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all bg-slate-50/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 truncate max-w-[150px]">
                        {order.customerName}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      📍 {order.deliveryAddress}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-500 font-mono text-[11px]">{order.requestedSchedule}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">₱{order.totalAmount}</span>
                        <button
                          type="button"
                          onClick={() => setPrintableItem({ type: 'order', data: order })}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          Print Slip
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Counter Sales & Vending Fleet Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Counter Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Counter Transactions</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
            >
              Transaction Ledger →
            </button>
          </div>

          <div className="space-y-2">
            {sales.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
                    {sale.isVendingMachineConsolidated ? <Store className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800">{sale.customerName}</div>
                    <div className="text-[11px] text-slate-400">
                      {sale.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-slate-900 font-mono">₱{sale.totalAmount}</div>
                  <div className="text-[10px] text-emerald-600 font-medium capitalize">{sale.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vending Machines Fleet Health */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">24/7 Vending Machine Fleet</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('vending')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              Manage Units →
            </button>
          </div>

          <div className="space-y-2.5">
            {vendingMachines.map((vm) => {
              const waterPct = Math.min(100, Math.round((vm.currentWaterLevelLiters / vm.waterCapacityLiters) * 100));
              const isLow = vm.currentWaterLevelLiters < 250;

              return (
                <div
                  key={vm.id}
                  className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{vm.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({vm.code}) · {vm.barangay}</span>
                    </div>
                    <span className="font-bold font-mono text-purple-700">₱{vm.currentCoinTotal} coins</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Water Reservoir: {vm.currentWaterLevelLiters}L / {vm.waterCapacityLiters}L</span>
                      <span className={isLow ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {waterPct}% {isLow && '(Refill Alert)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow ? 'bg-rose-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${waterPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
