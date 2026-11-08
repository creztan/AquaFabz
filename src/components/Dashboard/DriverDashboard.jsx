import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Truck,
  Navigation,
  MapPin,
  Phone,
  Clock,
  Droplets,
  CheckCircle2,
  Printer,
  ChevronRight,
  Compass,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';

export const DriverDashboard = ({ onNavigate }) => {
  const {
    orders,
    customers,
    settings,
    currentUser,
    updateOrderStatus,
    setPrintableItem,
  } = useApp();

  const todayDateStr = new Date().toISOString().split('T')[0];

  const myAssignedOrders = orders.filter(
    (o) =>
      o.assignedPersonnel?.toLowerCase() === currentUser.name.toLowerCase() ||
      currentUser.role === 'admin' ||
      currentUser.role === 'delivery'
  );

  const activeOrders = myAssignedOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedToday = myAssignedOrders.filter((o) => o.status === 'Delivered' && o.date === todayDateStr);
  const totalJugsToCollect = activeOrders.reduce((sum, o) => sum + (o.containersToReturnCount || 0), 0);

  const [selectedOrder, setSelectedOrder] = useState(activeOrders[0] || null);

  return (
    <div className="space-y-6">
      {/* Driver Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-3xl border border-indigo-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Navigation className="w-4 h-4" />
            <span>Delivery Fleet Driver Portal Landing Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Rider Console: {currentUser.name}
          </h1>
          <p className="text-xs text-indigo-200 mt-0.5">
            AquaFabz Station Driver Dispatch · Live Route Map & Customer Destination Cards
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('deliveries')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Full Dispatch Pipeline</span>
          </button>
        </div>
      </div>

      {/* Driver Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Trips Pending Today
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block font-mono">
              {activeOrders.length} destinations
            </span>
            <span className="text-[11px] text-slate-400">Assigned to your vehicle</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Empty Jugs to Pick Up
            </span>
            <span className="text-2xl font-black text-cyan-600 mt-1 block font-mono">
              {totalJugsToCollect} containers
            </span>
            <span className="text-[11px] text-slate-400">Collect from customers</span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Completed Handovers Today
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block font-mono">
              {completedToday.length} orders
            </span>
            <span className="text-[11px] text-slate-400">Delivered & payment collected</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Driver Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Route Cards (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Your Active Delivery Route Queue</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">{activeOrders.length} trips</span>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {activeOrders.length === 0 ? (
              <div className="text-center py-16 text-xs text-slate-400 bg-slate-50 rounded-2xl p-6">
                🎉 No active delivery trips assigned right now. All orders delivered!
              </div>
            ) : (
              activeOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                    selectedOrder?.id === ord.id
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Out for Delivery'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{ord.customerName}</h4>
                    <p className="text-xs text-slate-700 mt-1 flex items-start gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{ord.deliveryAddress} ({ord.barangay})</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ord.customerPhone}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl text-xs space-y-1.5 border border-slate-200/80">
                    <div className="flex justify-between text-slate-700">
                      <span>Items:</span>
                      <span className="font-semibold">
                        {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-indigo-700 font-bold">
                      <span>Collect Empty Jugs:</span>
                      <span>{ord.containersToReturnCount} containers</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
                      <span>Collect Payment:</span>
                      <span>₱{ord.totalAmount} ({ord.paymentMethod.toUpperCase()})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {ord.status === 'Pending' || ord.status === 'Preparing' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(ord.id, 'Out for Delivery');
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Depart / Out for Delivery</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(ord.id, 'Delivered');
                        }}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered & Handover</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrintableItem({ type: 'order', data: ord });
                      }}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Slip
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interactive Driver Route Map (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Route Location Map</span>
            </h3>
            <span className="text-xs text-indigo-600 font-bold">Binalbagan Area</span>
          </div>

          <DeliveryMap
            settings={settings}
            orders={activeOrders}
            customers={customers}
            selectedOrderId={selectedOrder?.id}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            heightClass="h-[440px]"
            showVendingMachines={false}
            showAllCustomers={false}
          />
        </div>
      </div>
    </div>
  );
};
