import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Customer, CartItem, PaymentMethod } from '../../types';
import {
  X,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  DollarSign,
  Droplets,
  CreditCard,
  UserCheck,
  Printer,
  Package,
} from 'lucide-react';

interface POSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POSModal: React.FC<POSModalProps> = ({ isOpen, onClose }) => {
  const { products, customers, recordSale, currentUser, settings, setPrintableItem } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('Walk-in Customer');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [containerDepositAmount, setContainerDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [orderType, setOrderType] = useState<'walkin' | 'pickup' | 'delivery'>('walkin');

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          unit: product.unit,
          isWater: product.isWater,
          requiresContainerSwap: product.requiresContainerSwap,
          total: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setDeliveryFee(0);
    setContainerDepositAmount(0);
    setAmountTendered('');
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + containerDepositAmount);
  const tenderedNum = parseFloat(amountTendered) || 0;
  const change = Math.max(0, tenderedNum - totalAmount);

  const handleCheckout = (autoPrint = true) => {
    if (cart.length === 0) return;

    const customerName = selectedCustomer ? selectedCustomer.name : guestName.trim() || 'Walk-in Customer';

    const recorded = recordSale({
      customerId: selectedCustomer?.id,
      customerName,
      customerType: selectedCustomer?.customerType || 'Residential',
      orderType,
      items: cart,
      subtotal,
      discount: discountAmount,
      deliveryFee,
      containerDeposit: containerDepositAmount,
      totalAmount,
      amountPaid: paymentMethod === 'cash' ? Math.max(tenderedNum, totalAmount) : totalAmount,
      change: paymentMethod === 'cash' ? change : 0,
      paymentMethod,
      paymentStatus: 'paid',
      staffName: currentUser.name,
      notes,
    });

    if (autoPrint) {
      setPrintableItem({ type: 'receipt', data: recorded });
    }

    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Point of Sale (POS) Counter</h2>
              <p className="text-xs text-slate-500">
                Staff: <span className="font-semibold text-slate-700">{currentUser.name}</span> • Quick Register & Cash Slip
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* POS Body: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left 7 Cols: Product Catalog */}
          <div className="lg:col-span-7 p-5 flex flex-col overflow-hidden border-r border-slate-200 bg-slate-50/50">
            {/* Search & Categories */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search water refilling products, container jugs, caps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'refill', label: 'Water Refills' },
                  { id: 'container', label: 'Jugs & Containers' },
                  { id: 'bottle', label: 'Bottled Packs' },
                  { id: 'accessory', label: 'Pumps & Accs' },
                  { id: 'supplies', label: 'Caps & Seals' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addToCart(prod)}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200/80 hover:border-cyan-500 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded font-bold">
                        {prod.code}
                      </span>
                      <span className="text-[10px] text-slate-400">Stock: {prod.stock}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-cyan-700 line-clamp-2 leading-tight">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      ₱{prod.price}
                    </span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-cyan-50 group-hover:bg-cyan-600 text-cyan-700 group-hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 5 Cols: Current Cart & Checkout */}
          <div className="lg:col-span-5 bg-white p-5 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Top: Customer & Order Type Selection */}
            <div className="space-y-3 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Order Details
                </span>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('walkin')}
                    className={`px-2 py-0.5 rounded font-medium ${
                      orderType === 'walkin' ? 'bg-white shadow-sm text-cyan-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`px-2 py-0.5 rounded font-medium ${
                      orderType === 'pickup' ? 'bg-white shadow-sm text-cyan-700 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Pickup
                  </button>
                </div>
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Account:
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      if (e.target.value) {
                        const cust = customers.find((c) => c.id === e.target.value);
                        if (cust) setGuestName(cust.name);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Walk-In Guest (Unregistered)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.customerType})
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedCustomerId && (
                  <input
                    type="text"
                    placeholder="Guest / Customer Name (Optional)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mt-1.5 w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  />
                )}

                {selectedCustomer && (
                  <div className="mt-1 text-[11px] text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg flex justify-between">
                    <span>Borrowed Containers: <strong>{selectedCustomer.containersHeld}</strong></span>
                    <span>Total Orders: {selectedCustomer.totalOrders}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Cart Items */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Package className="w-10 h-10 mb-2 opacity-40 text-cyan-600" />
                  <p className="text-xs font-medium">Cart is empty</p>
                  <p className="text-[11px] text-slate-400">Click items on the left to add them to this sale.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-800 truncate">{item.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        ₱{item.unitPrice} / {item.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[60px]">
                      <div className="font-bold text-xs text-slate-900">₱{item.total}</div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[10px] text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom: Discounts, Totals & Payment */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              {/* Optional Adjustments */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500">Discount (₱):</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Container Deposit (₱):</label>
                  <input
                    type="number"
                    min="0"
                    value={containerDepositAmount || ''}
                    onChange={(e) => setContainerDepositAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Payment Method:</label>
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  {(['cash', 'gcash', 'bank_transfer', 'credit'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1 rounded-lg font-semibold uppercase text-center transition-colors ${
                        paymentMethod === m
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m === 'bank_transfer' ? 'Bank' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash tender calculator if cash */}
              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 block">Cash Tendered:</span>
                    <input
                      type="number"
                      placeholder={`₱${totalAmount}`}
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className="w-full font-bold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Change:</span>
                    <span className="font-bold text-emerald-600 text-sm">₱{change.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex items-center justify-between text-slate-900 bg-cyan-50/60 p-2.5 rounded-xl border border-cyan-100">
                <span className="text-xs font-bold uppercase text-cyan-950">Grand Total Payable</span>
                <span className="text-xl font-black text-cyan-700">₱{totalAmount.toLocaleString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Confirm Sale Only
                </button>
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Complete & Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
