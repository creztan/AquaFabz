import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, StockMovement } from '../../types';
import {
  Package,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Filter,
  DollarSign,
  History,
  Layers,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    stockMovements,
    recordStockMovement,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for stock movement
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [refNumber, setRefNumber] = useState<string>('');
  const [supplierOrParty, setSupplierOrParty] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [outType, setOutType] = useState<'stock_out' | 'spillage' | 'adjustment'>('stock_out');

  // Form states for product
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('refill');
  const [prodPrice, setProdPrice] = useState(30);
  const [prodCost, setProdCost] = useState(5);
  const [prodStock, setProdStock] = useState(100);
  const [prodMinStock, setProdMinStock] = useState(20);
  const [prodUnit, setProdUnit] = useState('jug');
  const [prodDesc, setProdDesc] = useState('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const handleStockInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const previousStock = product.stock;
    const newStock = previousStock + movementQty;

    recordStockMovement({
      productId: product.id,
      productName: product.name,
      movementType: 'stock_in',
      quantity: movementQty,
      previousStock,
      newStock,
      referenceNo: refNumber || `PO-${Date.now().toString().slice(-6)}`,
      supplierOrParty: supplierOrParty || 'Local Water Packaging Supply',
      staffName: currentUser.name,
      notes: reason || 'Inventory replenishment received',
    });

    setIsStockInModalOpen(false);
    setMovementQty(10);
    setRefNumber('');
    setSupplierOrParty('');
    setReason('');
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock - movementQty);

    recordStockMovement({
      productId: product.id,
      productName: product.name,
      movementType: outType,
      quantity: movementQty,
      previousStock,
      newStock,
      referenceNo: refNumber || `STK-OUT-${Date.now().toString().slice(-6)}`,
      supplierOrParty: supplierOrParty || 'Internal Station Bay',
      staffName: currentUser.name,
      notes: reason || 'Stock consumed, damaged or adjusted',
    });

    setIsStockOutModalOpen(false);
    setMovementQty(10);
    setReason('');
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdCode(prod.code);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdCost(prod.cost);
    setProdStock(prod.stock);
    setProdMinStock(prod.minStock);
    setProdUnit(prod.unit);
    setProdDesc(prod.description);
    setIsProductModalOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProdCode(`ITM-${Math.floor(100 + Math.random() * 900)}`);
    setProdName('');
    setProdCategory('supplies');
    setProdPrice(50);
    setProdCost(30);
    setProdStock(50);
    setProdMinStock(15);
    setProdUnit('pc');
    setProdDesc('');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        code: prodCode,
        name: prodName,
        category: prodCategory,
        price: prodPrice,
        cost: prodCost,
        stock: prodStock,
        minStock: prodMinStock,
        unit: prodUnit,
        description: prodDesc,
      });
    } else {
      addProduct({
        code: prodCode,
        name: prodName,
        category: prodCategory,
        price: prodPrice,
        cost: prodCost,
        stock: prodStock,
        minStock: prodMinStock,
        unit: prodUnit,
        isWater: prodCategory === 'refill' || prodCategory === 'bottle',
        description: prodDesc,
      });
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Inventory, Pricing & Supplies Control</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Water Station Inventory & Stock-In / Stock-Out
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage water refills, empty containers, dispenser pumps, non-spill caps, and tamper-evident heat seals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={openNewProduct}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsStockInModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Stock-In</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStockOutModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Stock-Out</span>
          </button>
        </div>
      </div>

      {/* Low-stock indicator if any */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Low-Stock Alert:</strong> {lowStockCount} items have reached or dropped below their minimum threshold level. Consider restocking.
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by code, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'refill', label: 'Refills' },
            { id: 'container', label: 'Containers' },
            { id: 'bottle', label: 'Bottled Water' },
            { id: 'accessory', label: 'Accessories' },
            { id: 'supplies', label: 'Caps & Seals' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Product Name & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.minStock;
                const isOut = prod.stock === 0;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700">{prod.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                        {prod.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900 text-sm">
                        {prod.stock} <span className="text-xs font-normal text-slate-500">{prod.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {prod.minStock} {prod.unit}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ₱{prod.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      ₱{prod.cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut
                            ? 'bg-rose-100 text-rose-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {currentUser.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={() => openEditProduct(prod)}
                          className="p-1.5 text-slate-500 hover:text-cyan-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Product & Pricing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Admin Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-600" />
          <h3 className="font-bold text-slate-900 text-sm">Stock Movement Audit History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Qty Change</th>
                <th className="py-2.5 px-3">Prev ➔ New Stock</th>
                <th className="py-2.5 px-3">Reference / Supplier</th>
                <th className="py-2.5 px-3">Staff</th>
                <th className="py-2.5 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockMovements.map((sm) => (
                <tr key={sm.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{sm.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        sm.movementType === 'stock_in'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sm.movementType === 'stock_out'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {sm.movementType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{sm.productName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {sm.movementType === 'stock_in' ? `+${sm.quantity}` : `-${sm.quantity}`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {sm.previousStock} ➔ {sm.newStock}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {sm.referenceNo} {sm.supplierOrParty ? `(${sm.supplierOrParty})` : ''}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{sm.staffName}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                    {sm.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock-In Modal */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                <h3 className="font-bold text-sm">Record Stock-In / Purchase Delivery</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStockInModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Item:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Added:</label>
                  <input
                    type="number"
                    min="1"
                    value={movementQty}
                    onChange={(e) => setMovementQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Invoice / PO Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier / Source:</label>
                <input
                  type="text"
                  placeholder="e.g. HydroPro Packaging Bacolod"
                  value={supplierOrParty}
                  onChange={(e) => setSupplierOrParty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks:</label>
                <input
                  type="text"
                  placeholder="e.g. Delivered intact with batch certificate"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm Stock-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock-Out Modal */}
      {isStockOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-bold text-sm">Record Stock-Out / Disposal / Adjustment</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStockOutModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Item:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reason / Type:</label>
                  <select
                    value={outType}
                    onChange={(e) => setOutType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="stock_out">Station Consumption</option>
                    <option value="spillage">Damaged / Defect / Spillage</option>
                    <option value="adjustment">Physical Audit Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Deducted:</label>
                  <input
                    type="number"
                    min="1"
                    value={movementQty}
                    onChange={(e) => setMovementQty(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Explanation:</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Cracked container neck discarded; seal rolls used in filling bay"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockOutModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Deduct from Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal (Admin) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProduct ? 'Edit Product & Pricing' : 'Add New Water Station Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Code:</label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="refill">Water Refill</option>
                    <option value="container">Water Jug / Container</option>
                    <option value="bottle">Bottled Water Pack</option>
                    <option value="accessory">Pumps & Dispenser Accs</option>
                    <option value="supplies">Caps & Seals Supplies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Purified Water Refill (5-Gal Round)"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selling Price (₱):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Cost (₱):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prodCost}
                    onChange={(e) => setProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Stock:</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Threshold:</label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit:</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="jug, pc, pack"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Short description of product..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
