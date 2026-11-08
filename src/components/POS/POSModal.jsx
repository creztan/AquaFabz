import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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



export const POSModal = ({ isOpen, onClose }) => {
  const {
    products,
    customers,
    recordSale,
    currentUser,
    settings,
    setPrintableItem,
    deleteProduct,
    addProduct,
  } = useApp();

  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestName, setGuestName] = useState('Walk-in Customer');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [containerDepositAmount, setContainerDepositAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState('walkin');

  // Admin add product modal state in POS
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('refill');
  const [newProdPrice, setNewProdPrice] = useState(30);
  const [newProdStock, setNewProdStock] = useState(100);
  const [newProdUnit, setNewProdUnit] = useState('jug');

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

  const addToCart = (product) => {
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

  const updateQuantity = (productId, delta) => {
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
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
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

  // Admin delete product from station listing
  const handleDeleteCatalogProduct = (product) => {
    if (window.confirm(`Are you sure you want to remove "${product.name}" (${product.code}) from the station listing?`)) {
      if (deleteProduct) deleteProduct(product.id);
      removeFromCart(product.id);
    }
  };

  // Admin add product to station listing
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    const code = newProdCode.trim() || `ITM-${Date.now().toString().slice(-4)}`;
    if (addProduct) {
      addProduct({
        code,
        name: newProdName.trim(),
        category: newProdCategory,
        price: parseFloat(newProdPrice) || 0,
        cost: Math.round((parseFloat(newProdPrice) || 0) * 0.3),
        stock: parseInt(newProdStock, 10) || 50,
        minStock: 20,
        unit: newProdUnit,
        isWater: newProdCategory === 'refill',
        requiresContainerSwap: newProdCategory === 'refill',
        description: 'Station catalog item added from POS counter.',
      });
    }
    setIsAddProductOpen(false);
    setNewProdName('');
    setNewProdCode('');
    setNewProdPrice(30);
    setNewProdStock(100);
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
          {/* Left 7 Cols Catalog */}
          <div className="lg:col-span-7 p-5 flex flex-col overflow-hidden border-r border-slate-200 bg-slate-50/50">
            {/* Search, Categories & Admin Controls */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search water refilling products, container jugs, caps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all cursor-pointer"
                    title="Add new product to catalog (Admin)"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Item</span>
                  </button>
                )}
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
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer ${
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
              {filteredProducts.map((prod) => {
                const cartItem = cart.find((item) => item.productId === prod.id);
                const inCartQty = cartItem ? cartItem.quantity : 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    className={`p-3.5 rounded-2xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group ${
                      inCartQty > 0
                        ? 'bg-cyan-50/20 border-cyan-500 ring-2 ring-cyan-500/20'
                        : 'bg-white border-slate-200/80 hover:border-cyan-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded font-bold">
                            {prod.code}
                          </span>
                          {inCartQty > 0 && (
                            <span className="text-[10px] bg-cyan-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                              ✓ {inCartQty} in cart
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Stock: {prod.stock}</span>
                          {currentUser?.role === 'admin' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCatalogProduct(prod);
                              }}
                              className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete/Remove item from station catalog (Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-cyan-700 line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <span className="text-sm font-black text-slate-900">
                        ₱{prod.price}
                      </span>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => removeFromCart(prod.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Remove from current order"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>

                          <div className="flex items-center gap-0.5 bg-white border border-cyan-300 rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="w-5 h-5 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center font-black text-xs text-cyan-900">
                              {inCartQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, 1)}
                              className="w-5 h-5 rounded hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(prod);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-50 group-hover:bg-cyan-600 text-cyan-700 group-hover:text-white flex items-center gap-1 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols Cart & Checkout */}
          <div className="lg:col-span-5 bg-white p-5 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Top & Order Type Selection */}
            <div className="space-y-3 pb-3 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Order Details
                  </span>
                  {cart.length > 0 && (
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-1.5 py-0.5 rounded-full">
                      {cart.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Remove all items from current order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove All</span>
                    </button>
                  )}

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

            {/* Middle Items */}
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

                    <div className="text-right min-w-[70px] flex flex-col items-end">
                      <div className="font-bold text-xs text-slate-900">₱{item.total}</div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="mt-1 px-1.5 py-0.5 text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        title="Remove item from order"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom, Totals & Payment */}
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
                  {(['cash', 'gcash', 'bank_transfer', 'credit'] ).map((m) => (
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Confirm Sale Only
                </button>
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => handleCheckout(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Complete & Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin: Add Product to Catalog Modal */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Add Item to Catalog</h3>
                    <p className="text-[11px] text-slate-400">Available to POS counter and inventory</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alkaline Refill 5-Gallon"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      placeholder="e.g. REF-04 (auto if blank)"
                      value={newProdCode}
                      onChange={(e) => setNewProdCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                    >
                      <option value="refill">Water Refills</option>
                      <option value="container">Jugs & Containers</option>
                      <option value="bottle">Bottled Packs</option>
                      <option value="accessory">Pumps & Accessories</option>
                      <option value="supplies">Caps & Seals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price (₱)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. jug, pack"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    Add to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
