import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets,
  Truck,
  MapPin,
  Clock,
  Phone,
  Printer,
  PlusCircle,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  User,
  LogOut,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';
import { NewOrderModal } from '../Delivery/NewOrderModal';

export const CustomerPortalView: React.FC = () => {
  const { currentUser, customers, orders, sales, settings, setPrintableItem, logout } = useApp();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Match customer record by ID or name
  const customer =
    customers.find(
      (c) =>
        c.id === currentUser.id.replace('cust-', '') ||
        c.name.toLowerCase() === currentUser.name.toLowerCase() ||
        c.contactNumber === currentUser.phone
    ) || customers[0];

  const myOrders = orders.filter(
    (o) => o.customerId === customer?.id || o.customerName === customer?.name
  );
  const mySales = sales.filter(
    (s) => s.customerId === customer?.id || s.customerName === customer?.name
  );

  const activeDeliveries = myOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastDeliveries = myOrders.filter((o) => o.status === 'Delivered');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-cyan-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Customer / Client Water Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Hello, {customer?.name || currentUser.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track your live water refills, view borrowed container deposits, and request instant station deliveries.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-cyan-200">
            <span>📍 {customer?.primaryAddress} ({customer?.barangay})</span>
            <span>•</span>
            <span>📞 {customer?.contactNumber}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Water Delivery</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Borrowed containers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Station Jugs in Your Custody
          </span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">
            {customer?.containersHeld || 0} containers
          </span>
          <span className="text-[11px] text-slate-400">
            Deposit held: ₱{((customer?.containersHeld || 0) * settings.defaultContainerDeposit).toLocaleString()} (Refundable on return)
          </span>
        </div>

        {/* Active orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Deliveries In-Transit
          </span>
          <span className="text-2xl font-black text-cyan-600 mt-1 block">
            {activeDeliveries.length} orders
          </span>
          <span className="text-[11px] text-cyan-700 font-semibold">
            {activeDeliveries.some((o) => o.status === 'Out for Delivery')
              ? '🚚 Rider is on the road!'
              : 'Station is preparing order'}
          </span>
        </div>

        {/* Total lifetime purchases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Lifetime Completed Orders
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {customer?.totalOrders || myOrders.length} orders
          </span>
          <span className="text-[11px] text-slate-400">
            Total spent: ₱{(customer?.totalSpent || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Live Map Tracking for Customer */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Live Delivery & Location Tracking Map</span>
            </h3>
            <p className="text-xs text-slate-500">
              Your registered delivery pin in Binalbagan and active dispatch routes from AquaFabz Station.
            </p>
          </div>
          <span className="text-xs text-cyan-700 font-mono bg-cyan-50 px-2.5 py-1 rounded-xl font-bold">
            📍 Coordinates: {customer?.coordinates.lat.toFixed(4)}, {customer?.coordinates.lng.toFixed(4)}
          </span>
        </div>

        <DeliveryMap
          settings={settings}
          orders={activeDeliveries}
          customers={customer ? [customer] : []}
          initialCenter={customer?.coordinates}
          heightClass="h-[360px]"
          showVendingMachines={true}
          showAllCustomers={false}
        />
      </div>

      {/* Deliveries & Receipts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active & Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>Active & Recent Deliveries</span>
            </h3>
            <span className="text-xs text-slate-400">{myOrders.length} total orders</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 text-xs">
            {myOrders.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                You have no orders yet. Click "Request Water Delivery" above.
              </div>
            ) : (
              myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-700">{ord.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Out for Delivery'
                          ? 'bg-indigo-100 text-indigo-700'
                          : ord.status === 'Preparing'
                          ? 'bg-sky-100 text-sky-700'
                          : ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-500">
                    <span>Schedule: {ord.requestedSchedule}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">₱{ord.totalAmount}</span>
                      <button
                        type="button"
                        onClick={() => setPrintableItem({ type: 'order', data: ord })}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        Slip
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Counter Receipts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Payment Slips & Invoices</span>
            </h3>
            <span className="text-xs text-slate-400">{mySales.length} receipts</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 text-xs">
            {mySales.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No past walk-in sales receipts on file.
              </div>
            ) : (
              mySales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800">{sale.transactionNumber}</span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {sale.date} • {sale.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block text-sm">
                      ₱{sale.totalAmount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrintableItem({ type: 'receipt', data: sale })}
                      className="text-cyan-600 hover:underline font-bold text-[11px]"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NewOrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </div>
  );
};
