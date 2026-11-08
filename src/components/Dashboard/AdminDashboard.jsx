import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  DollarSign,
  TrendingUp,
  Truck,
  Droplets,
  Store,
  PlusCircle,
  AlertTriangle,
  ArrowUpRight,
  Compass,
  ChevronRight,
  ShieldCheck,
  Coins,
  FileText,
  Users,
  Package,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';

export const AdminDashboard = ({
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

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Sales metrics
  const todaySalesList = sales.filter((s) => s.date === todayDateStr);
  const totalSalesToday = todaySalesList.reduce((acc, s) => acc + s.totalAmount, 0);

  const vendingSalesToday = todaySalesList
    .filter((s) => s.isVendingMachineConsolidated)
    .reduce((acc, s) => acc + s.totalAmount, 0);
  const counterSalesToday = totalSalesToday - vendingSalesToday;

  // Deliveries
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const preparingOrders = orders.filter((o) => o.status === 'Preparing').length;
  const outForDeliveryOrders = orders.filter((o) => o.status === 'Out for Delivery').length;
  const completedTodayDeliveries = orders.filter(
    (o) => o.status === 'Delivered' && o.date === todayDateStr
  ).length;

  // Containers & inventory
  const containerHeldByCustomers = customers.reduce((acc, c) => acc + (c.containersHeld || 0), 0);
  const availableContainers = products.find((p) => p.category === 'container')?.stock || 120;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const lowWaterVending = vendingMachines.filter((vm) => vm.currentWaterLevelLiters < 250);

  const totalVendingCoinsInBoxes = vendingMachines.reduce((acc, vm) => acc + vm.currentCoinTotal, 0);
  const totalVendingLifetime = vendingMachines.reduce((acc, vm) => acc + vm.totalLifetimeSales, 0);

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Administrator Portal Landing Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {settings.stationName} Master Executive Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            Administrator: <strong className="text-white">{currentUser.name}</strong> · Complete Financials, Vending Fleet, Staff Control & Station Audits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPOS}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>POS Counter</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>New Order</span>
          </button>
          <button
            type="button"
            onClick={onOpenVendingRecord}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Coins className="w-4 h-4 text-purple-400" />
            <span>Vending Audit</span>
          </button>
        </div>
      </div>

      {/* Critical Replenishment Alerts Banner */}
      {(lowStockProducts.length > 0 || lowWaterVending.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide">
                Replenishment Attention Required ({lowStockProducts.length + lowWaterVending.length} items)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {lowStockProducts.length > 0 && (
                  <span>
                    Low supplies: {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}.
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
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
          >
            Manage Supplies
          </button>
        </div>
      )}

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Gross Sales
            </span>
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₱{totalSalesToday.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>Counter: <strong className="text-slate-800">₱{counterSalesToday.toLocaleString()}</strong></span>
              <span>·</span>
              <span>Vending: <strong className="text-purple-600">₱{vendingSalesToday.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Reconciled Ledger</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Balanced
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('deliveries')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-400 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Delivery Pipeline
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {outForDeliveryOrders + preparingOrders + pendingOrders} orders
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">{outForDeliveryOrders} On Trip</span>
              <span>·</span>
              <span className="text-sky-600 font-medium">{preparingOrders} Prep</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dispatched Today</span>
            <span className="text-indigo-700 font-bold">{completedTodayDeliveries} Completed</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('containers')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-blue-400 transition-all space-y-3"
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
            <div className="text-2xl font-black text-slate-900 font-mono">
              {containerHeldByCustomers} containers
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>Station Reserve: <strong className="text-slate-800">{availableContainers}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Customer Deposits</span>
            <span className="text-blue-700 font-bold font-mono">
              ₱{(containerHeldByCustomers * 200).toLocaleString()}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('vending')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-purple-400 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              24/7 Vending Network
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {vendingMachines.length} Units
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>Uncollected: <strong className="text-emerald-700 font-mono">₱{totalVendingCoinsInBoxes.toLocaleString()}</strong></span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Lifetime Vending Total</span>
            <span className="text-purple-700 font-bold font-mono">
              ₱{totalVendingLifetime.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Map & Delivery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-600" />
                <span>Station Interactive GIS Location Map</span>
              </h3>
              <p className="text-xs text-slate-500">AquaFabz Refilling Station Hub, Vending Fleet, and Customer Delivery Pins.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Map Studio</span>
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

        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Today's Order Queue</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('deliveries')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {order.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">📍 {order.deliveryAddress}</div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-bold text-slate-900 font-mono">₱{order.totalAmount}</span>
                  <button
                    type="button"
                    onClick={() => setPrintableItem({ type: 'order', data: order })}
                    className="text-indigo-600 font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    Print Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
