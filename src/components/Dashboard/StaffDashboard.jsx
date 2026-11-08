import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  ShoppingCart,
  PlusCircle,
  Truck,
  Coins,
  Droplets,
  Clock,
  Store,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const StaffDashboard = ({
  onNavigate,
  onOpenPOS,
  onOpenNewOrder,
  onOpenVendingRecord,
}) => {
  const {
    orders,
    vendingMachines,
    products,
    customers,
    sales,
    currentUser,
    setPrintableItem,
  } = useApp();

  const todayDateStr = new Date().toISOString().split('T')[0];

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const outForDelivery = orders.filter((o) => o.status === 'Out for Delivery');

  const availableJugs = products.find((p) => p.category === 'container')?.stock || 120;
  const lowStockSupplies = products.filter((p) => p.stock <= p.minStock);
  const lowWaterVending = vendingMachines.filter((vm) => vm.currentWaterLevelLiters < 250);

  const todayStaffSales = sales.filter((s) => s.date === todayDateStr && !s.isVendingMachineConsolidated);

  return (
    <div className="space-y-6">
      {/* Staff Operational Console Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4" />
            <span>Station Staff Portal Landing Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Staff Desk Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            Active Operator: <strong className="text-white">{currentUser.name}</strong> (Staff) · Station Walk-In POS, Order Fulfillment & Vending Logging
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenPOS}
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>New Order</span>
          </button>
          <button
            type="button"
            onClick={onOpenVendingRecord}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>Record Vending</span>
          </button>
        </div>
      </div>

      {/* Staff Action Notice */}
      {(lowStockSupplies.length > 0 || lowWaterVending.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide">
                Station Workstation Alerts ({lowStockSupplies.length + lowWaterVending.length})
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockSupplies.length > 0 && `Items low: ${lowStockSupplies.map((p) => p.name).join(', ')}. `}
                {lowWaterVending.length > 0 && `Vending tank refill required: ${lowWaterVending.map((vm) => vm.code).join(', ')}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
          >
            Check Inventory
          </button>
        </div>
      )}

      {/* 3 Main Staff KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Orders Pending Preparation
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block font-mono">
              {pendingOrders.length + preparingOrders.length} orders
            </span>
            <span className="text-[11px] text-slate-400">
              {pendingOrders.length} unassigned · {preparingOrders.length} in filling bay
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Station Ready Containers
            </span>
            <span className="text-2xl font-black text-cyan-600 mt-1 block font-mono">
              {availableJugs} units
            </span>
            <span className="text-[11px] text-slate-400">Available for walk-in & delivery</span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Vending Network Status
            </span>
            <span className="text-2xl font-black text-purple-600 mt-1 block font-mono">
              {vendingMachines.filter((vm) => vm.status === 'operational').length} / {vendingMachines.length} Units
            </span>
            <span className="text-[11px] text-slate-400">24/7 Coin Dispensing</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Store className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Staff Main Grid: Active Orders & POS Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Orders Queue */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Pending Order Dispatch Queue</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('deliveries')}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Dispatch Pipeline →
            </button>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">No active delivery orders registered.</div>
            ) : (
              orders.slice(0, 6).map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-700">{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ord.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{ord.customerName}</h4>
                    <p className="text-[11px] text-slate-500 truncate">📍 {ord.deliveryAddress} ({ord.barangay})</p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-900 font-mono">₱{ord.totalAmount}</span>
                    <button
                      type="button"
                      onClick={() => setPrintableItem({ type: 'order', data: ord })}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      Print Slip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Cols: Quick POS & Vending Overview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Counter POS Banner */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-6 rounded-3xl shadow-lg space-y-3">
            <h3 className="font-black text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Walk-In Refill & POS Counter</span>
            </h3>
            <p className="text-xs text-cyan-100">
              Record counter sales for purified water refills, slim 5-gallon containers, caps, and seals.
            </p>
            <button
              type="button"
              onClick={onOpenPOS}
              className="w-full py-3 bg-white text-cyan-950 font-black rounded-2xl text-xs shadow-md hover:bg-cyan-50 transition-all cursor-pointer"
            >
              Launch POS Terminal Now
            </button>
          </div>

          {/* Vending Machine Quick List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-600" />
                <span>Vending Units Status</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('vending')}
                className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
              >
                Audit Fleet →
              </button>
            </div>

            <div className="space-y-2.5">
              {vendingMachines.map((vm) => (
                <div key={vm.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{vm.name}</span>
                    <span className="text-[10px] text-slate-500 block">{vm.locationName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-purple-700">₱{vm.currentCoinTotal}</span>
                    <span className="text-[10px] text-slate-400 block">{vm.currentWaterLevelLiters}L water</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
