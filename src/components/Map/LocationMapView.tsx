import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryMap } from './DeliveryMap';
import {
  MapPin,
  Navigation,
  Layers,
  Truck,
  Store,
  Users,
  Compass,
  Phone,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Crosshair,
} from 'lucide-react';
import { Customer, DeliveryOrder } from '../../types';

export const LocationMapView: React.FC = () => {
  const { settings, orders, customers, vendingMachines, setPrintableItem, updateOrderStatus } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(orders[0] || null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [mapFilter, setMapFilter] = useState<'all' | 'Out for Delivery' | 'Preparing' | 'Pending'>('all');
  const [activeCoverageBarangay, setActiveCoverageBarangay] = useState<string>('all');

  // Coverage statistics per barangay
  const barangays = ['Brgy. Poblacion', 'Brgy. San Teodoro', 'Brgy. San Pedro', 'Brgy. Enclaro', 'Brgy. Sto. Rosario', 'Brgy. Paglaum'];

  const barangayStats = barangays.map((bgy) => {
    const custCount = customers.filter((c) => c.barangay === bgy).length;
    const orderCount = orders.filter((o) => o.barangay === bgy).length;
    const vmCount = vendingMachines.filter((vm) => vm.barangay === bgy).length;
    return { name: bgy, custCount, orderCount, vmCount };
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Digital Geographic Information System (GIS)</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Interactive Location Mapping & Geolocation Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize customer locations, delivery trip routes, 24/7 vending machine clusters, and delivery area frequency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
            <span className="font-semibold px-2 text-slate-600">Trip Filter:</span>
            {(['all', 'Out for Delivery', 'Preparing', 'Pending'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setMapFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  mapFilter === st
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Studio View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Full interactive Leaflet Map */}
        <div className="lg:col-span-8 space-y-3">
          <DeliveryMap
            settings={settings}
            orders={orders}
            customers={customers}
            vendingMachines={vendingMachines}
            selectedOrderId={selectedOrder?.id}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setSelectedCustomer(null);
            }}
            onSelectCustomer={(cust) => {
              setSelectedCustomer(cust);
              setSelectedOrder(null);
            }}
            filterStatus={mapFilter}
            heightClass="h-[620px]"
            showVendingMachines={true}
            showAllCustomers={true}
          />
        </div>

        {/* Right 4 Cols: Destination Inspector & Area Coverage */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Target Inspector Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              <span>Inspector: Delivery Destination</span>
            </h3>

            {selectedOrder ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-gradient-to-tr from-cyan-900 to-indigo-950 text-white rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-cyan-300">
                    <span className="font-mono font-bold">{selectedOrder.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 font-bold uppercase">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white pt-1">{selectedOrder.customerName}</h4>
                  <p className="text-cyan-100 text-[11px]">📍 {selectedOrder.deliveryAddress}</p>
                  <p className="text-cyan-200 text-[10px]">📞 {selectedOrder.customerPhone}</p>
                </div>

                <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono text-[11px] text-slate-800">
                      {selectedOrder.coordinates.lat.toFixed(4)}, {selectedOrder.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Rider:</span>
                    <strong className="text-indigo-700">{selectedOrder.assignedPersonnel || 'Unassigned'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <span>{selectedOrder.requestedSchedule}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-sm text-cyan-700">₱{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {selectedOrder.deliveryNotes && (
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-900 border border-amber-200 text-[11px]">
                    <strong>Driver Reference:</strong> {selectedOrder.deliveryNotes}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {selectedOrder.status !== 'Delivered' && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextSt =
                          selectedOrder.status === 'Pending'
                            ? 'Preparing'
                            : selectedOrder.status === 'Preparing'
                            ? 'Out for Delivery'
                            : 'Delivered';
                        updateOrderStatus(selectedOrder.id, nextSt);
                        setSelectedOrder((prev) => (prev ? { ...prev, status: nextSt } : null));
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                    >
                      Advance Status
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPrintableItem({ type: 'order', data: selectedOrder })}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Slip
                  </button>
                </div>
              </div>
            ) : selectedCustomer ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
                    {selectedCustomer.customerType}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedCustomer.name}</h4>
                  <p className="text-slate-600">📍 {selectedCustomer.primaryAddress}</p>
                  <p className="text-slate-500 text-[11px]">📞 {selectedCustomer.contactNumber}</p>
                </div>
                <div className="flex justify-between text-slate-600 p-2 bg-slate-50 rounded-lg">
                  <span>Containers Loaned:</span>
                  <strong className="text-cyan-700">{selectedCustomer.containersHeld} units</strong>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Click any marker on the map to inspect customer or order destination.
              </div>
            )}
          </div>

          {/* Area Coverage Monitoring (Barangay Breakdown) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Delivery Area Coverage</span>
              </h3>
              <span className="text-[10px] text-slate-400">AquaFabz Sectors</span>
            </div>

            <div className="space-y-2 text-xs">
              {barangayStats.map((item) => (
                <div
                  key={item.name}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.custCount} customer accounts
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.vmCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">
                        {item.vmCount} VM
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                      {item.orderCount} trips
                    </span>
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
