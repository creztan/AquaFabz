import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  X,
  Truck,
  Plus,
  Minus,
  MapPin,
  Calendar,
  Clock,
  User,
  ShoppingBag,
} from 'lucide-react';



export const NewOrderModal = ({ isOpen, onClose }) => {
  const { customers, products, addOrder, users, settings } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [orderType, setOrderType] = useState('delivery');
  const [cart, setCart] = useState([
    {
      productId: products[0]?.id || 'prod-1',
      productName: products[0]?.name || 'Purified Water Refill (5-Gal Round)',
      quantity: 5,
      unitPrice: products[0]?.price || 30,
      unit: products[0]?.unit || 'jug',
      isWater: true,
      requiresContainerSwap: true,
      total: (products[0]?.price || 30) * 5,
    },
  ]);
  const [deliverySchedule, setDeliverySchedule] = useState('Today, 10:00 AM - 12:00 PM');
  const [assignedRider, setAssignedRider] = useState('Christan Jacob M. Verde');
  const [deliveryFee, setDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [containersToReturn, setContainersToReturn] = useState(5);

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const handleAddItem = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          unitPrice: prod.price,
          unit: prod.unit,
          isWater: prod.isWater,
          requiresContainerSwap: prod.requiresContainerSwap,
          total: prod.price,
        },
      ];
    });
  };

  const handleUpdateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty, total: newQty * i.unitPrice } : null;
          }
          return i;
        })
        .filter(Boolean) 
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.total, 0);
  const effectiveDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const totalAmount = subtotal + effectiveDeliveryFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCustomer || cart.length === 0) return;

    addOrder({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.contactNumber,
      deliveryAddress: currentCustomer.primaryAddress,
      barangay: currentCustomer.barangay,
      coordinates: currentCustomer.coordinates,
      deliveryNotes: deliveryNotes || currentCustomer.deliveryNotes,
      items: cart,
      subtotal,
      deliveryFee: effectiveDeliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus === 'paid' ? 'paid' : 'pending',
      orderType,
      status: 'Pending',
      assignedPersonnel: orderType === 'delivery' ? assignedRider : undefined,
      deliveryVehicle: 'Station Trike #1',
      requestedSchedule: deliverySchedule,
      containersToReturnCount: containersToReturn,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <h3 className="font-bold text-sm">Create New Delivery or Pickup Order</h3>
          </div>
          <button type="button" onClick={onClose} className="text-indigo-200 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Order Type & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Destination:</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.barangay})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Order Mode:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    orderType === 'delivery'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🚚 Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    orderType === 'pickup'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  🏪 Station Pickup
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Address & Geolocation info */}
          {currentCustomer && orderType === 'delivery' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Delivery Address: {currentCustomer.primaryAddress}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Contact: {currentCustomer.contactNumber} • Map Pin: {currentCustomer.coordinates.lat.toFixed(4)}, {currentCustomer.coordinates.lng.toFixed(4)}
              </div>
              {currentCustomer.deliveryNotes && (
                <div className="text-[11px] text-amber-700 font-medium">
                  Note: {currentCustomer.deliveryNotes}
                </div>
              )}
            </div>
          )}

          {/* Items to Order */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Order Items / Refills:</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
              >
                <option value="">+ Add Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₱{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50 max-h-36 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100"
                >
                  <span className="font-semibold text-slate-800">{item.productName}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-slate-900 min-w-[50px] text-right">
                      ₱{item.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Schedule */}
          {orderType === 'delivery' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assign Delivery Personnel:</label>
                <select
                  value={assignedRider}
                  onChange={(e) => setAssignedRider(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {users
                    .filter((u) => u.role === 'delivery' || u.role === 'staff' || u.role === 'admin')
                    .map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Delivery Time Slot:</label>
                <input
                  type="text"
                  value={deliverySchedule}
                  onChange={(e) => setDeliverySchedule(e.target.value)}
                  placeholder="e.g. Today, 01:00 PM - 03:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          {/* Containers Swap & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Empties to Collect:</label>
              <input
                type="number"
                min="0"
                value={containersToReturn}
                onChange={(e) => setContainersToReturn(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Method:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value )}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="cash">Cash on Delivery</option>
                <option value="gcash">GCash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit">Store Credit / Terms</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Payment Status:</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value  | 'unpaid')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="unpaid">Unpaid / Pay Upon Receipt</option>
                <option value="paid">Prepaid</option>
              </select>
            </div>
          </div>

          {/* Total Bar */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-indigo-900 block font-medium">
                Subtotal: ₱{subtotal} {orderType === 'delivery' && `+ ₱${effectiveDeliveryFee} Delivery Fee`}
              </span>
              <span className="text-base font-black text-indigo-950">
                Grand Total: ₱{totalAmount}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all"
              >
                Dispatch Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
