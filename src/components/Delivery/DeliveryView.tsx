import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryOrder, DeliveryStatus } from '../../types';
import {
  Truck,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Phone,
  Printer,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  User,
  Layers,
  Map as MapIcon,
  List,
  Navigation,
} from 'lucide-react';
import { DeliveryMap } from '../Map/DeliveryMap';
import { NewOrderModal } from './NewOrderModal';

export const DeliveryView: React.FC = () => {
  const { orders, updateOrderStatus, setPrintableItem, settings, users, customers } = useApp();

  const [viewMode, setViewMode] = useState<'pipeline' | 'list' | 'map' | 'rider'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRiderFilter, setSelectedRiderFilter] = useState<string>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.barangay.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesRider =
      selectedRiderFilter === 'all' || order.assignedPersonnel === selectedRiderFilter;

    return matchesSearch && matchesStatus && matchesRider;
  });

  const statuses: DeliveryStatus[] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];

  const handleAdvanceStatus = (order: DeliveryOrder) => {
    if (order.status === 'Pending') {
      updateOrderStatus(order.id, 'Preparing');
    } else if (order.status === 'Preparing') {
      updateOrderStatus(order.id, 'Out for Delivery');
    } else if (order.status === 'Out for Delivery') {
      updateOrderStatus(order.id, 'Delivered');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Delivery Management & Geolocation Tracking</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Water Delivery Orders & Fleet Dispatch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor delivery pipelines, assign riders, check delivery destinations on interactive map, and track container returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'pipeline' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              Pipeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rider')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'rider' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-600'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              Rider Reference
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, street address, or barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>

          <select
            value={selectedRiderFilter}
            onChange={(e) => setSelectedRiderFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="all">All Riders</option>
            {users
              .filter((u) => u.role === 'delivery' || u.role === 'admin' || u.role === 'staff')
              .map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: Pipeline / Kanban Board View */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statuses.map((status) => {
            const statusOrders = filteredOrders.filter((o) => o.status === status);

            let headerBg = 'bg-amber-500 text-white';
            if (status === 'Preparing') headerBg = 'bg-sky-500 text-white';
            if (status === 'Out for Delivery') headerBg = 'bg-indigo-600 text-white';
            if (status === 'Delivered') headerBg = 'bg-emerald-600 text-white';

            return (
              <div key={status} className="bg-slate-100 rounded-2xl p-3 flex flex-col space-y-3 min-h-[450px]">
                <div className={`px-3 py-2 rounded-xl flex items-center justify-between font-bold text-xs ${headerBg}`}>
                  <span>{status}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                    {statusOrders.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {statusOrders.length === 0 ? (
                    <div className="text-center py-10 text-[11px] text-slate-400">
                      No orders in {status.toLowerCase()}
                    </div>
                  ) : (
                    statusOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[10px] text-slate-500">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">{order.requestedSchedule}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{order.customerName}</h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            📍 {order.deliveryAddress}
                          </p>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg text-[11px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Items:</span>
                            <span className="font-medium">
                              {order.items.reduce((sum, i) => sum + i.quantity, 0)} units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total:</span>
                            <span className="font-bold text-indigo-700">₱{order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                            <span>Rider:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                              {order.assignedPersonnel || 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => setPrintableItem({ type: 'order', data: order })}
                            className="text-[10px] text-slate-500 hover:text-indigo-600 font-semibold flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Slip</span>
                          </button>

                          {status !== 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStatus(order)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <span>
                                {status === 'Pending'
                                  ? 'Prepare'
                                  : status === 'Preparing'
                                  ? 'Dispatch'
                                  : 'Deliver'}
                              </span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Table / List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">Address / Barangay</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Rider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{order.deliveryAddress}</div>
                      <span className="text-[10px] text-slate-500 font-medium">{order.barangay}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{order.requestedSchedule}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {order.assignedPersonnel || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Out for Delivery'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'Preparing'
                            ? 'bg-sky-100 text-sky-800'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">₱{order.totalAmount}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setPrintableItem({ type: 'order', data: order })}
                        className="text-slate-600 hover:text-indigo-600 font-semibold text-[11px]"
                      >
                        Print Slip
                      </button>
                      {order.status !== 'Delivered' && (
                        <button
                          type="button"
                          onClick={() => handleAdvanceStatus(order)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Next Step
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Interactive Location Map Studio */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <DeliveryMap
              settings={settings}
              orders={filteredOrders}
              customers={customers}
              selectedOrderId={selectedOrder?.id}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              heightClass="h-[550px]"
              showVendingMachines={true}
              showAllCustomers={true}
            />
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between max-h-[550px] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Selected Destination Details</span>
              </h3>

              {selectedOrder ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1">
                    <span className="font-mono text-[10px] text-indigo-700 font-bold">
                      {selectedOrder.orderNumber}
                    </span>
                    <h4 className="font-bold text-sm text-indigo-950">{selectedOrder.customerName}</h4>
                    <p className="text-indigo-800">📍 {selectedOrder.deliveryAddress}</p>
                    <p className="text-[11px] text-indigo-600 font-medium">📞 {selectedOrder.customerPhone}</p>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <strong className="text-indigo-700 uppercase">{selectedOrder.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Assigned Rider:</span>
                      <strong className="text-slate-800">{selectedOrder.assignedPersonnel}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Schedule:</span>
                      <span>{selectedOrder.requestedSchedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payable:</span>
                      <strong className="text-slate-900 text-sm">₱{selectedOrder.totalAmount}</strong>
                    </div>
                    <div className="flex justify-between text-indigo-700 font-medium">
                      <span>Empty Jugs to Collect:</span>
                      <span>{selectedOrder.containersToReturnCount} jugs</span>
                    </div>
                  </div>

                  {selectedOrder.deliveryNotes && (
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-800 border border-amber-200 text-[11px]">
                      ⚠️ Note: {selectedOrder.deliveryNotes}
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    {selectedOrder.status !== 'Delivered' && (
                      <button
                        type="button"
                        onClick={() => handleAdvanceStatus(selectedOrder)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs"
                      >
                        Advance to{' '}
                        {selectedOrder.status === 'Pending'
                          ? 'Preparing'
                          : selectedOrder.status === 'Preparing'
                          ? 'Out for Delivery'
                          : 'Delivered'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPrintableItem({ type: 'order', data: selectedOrder })}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                    >
                      Slip
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Click any marker or delivery trip on the map to inspect customer destination details.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Delivery Location Reference / Rider Mode */}
      {viewMode === 'rider' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Delivery Location Reference (Driver Dispatch Mode)</h3>
              <p className="text-xs text-indigo-200">
                Visual card sheet optimized for motorcycle & tricycle delivery riders on the road.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 rounded-xl text-xs font-mono font-semibold">
              {filteredOrders.filter((o) => o.status !== 'Delivered').length} destinations to complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders
              .filter((o) => o.status !== 'Delivered')
              .map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-indigo-100 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {order.status}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base">{order.customerName}</h4>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div className="flex items-start gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress} ({order.barangay})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target: {order.requestedSchedule}</span>
                      </div>
                    </div>

                    {order.deliveryNotes && (
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-900 border border-amber-200 text-[11px]">
                        <strong>Rider Note:</strong> {order.deliveryNotes}
                      </div>
                    )}

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Items:</span>
                        <span>{order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}</span>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-bold">
                        <span>Empty Jugs to Collect:</span>
                        <span>{order.containersToReturnCount} jugs</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                        <span>Collect Payment:</span>
                        <span>₱{order.totalAmount} ({order.paymentMethod.toUpperCase()})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {order.status === 'Pending' || order.status === 'Preparing' ? (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Depart / Out for Delivery</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Delivered & Handover</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* New Order Modal */}
      <NewOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} />
    </div>
  );
};
