import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Droplets,
  Plus,
  RotateCcw,
  AlertTriangle,
  Users,
  Search,
  CheckCircle2,
  DollarSign,
  Printer,
  ShieldCheck,
  Package,
} from 'lucide-react';

export const ContainerView = () => {
  const {
    containers,
    recordContainerAction,
    customers,
    currentUser,
    settings,
    setPrintableItem,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('borrow');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [guestName, setGuestName] = useState('');
  const [containerType, setContainerType] = useState('5-Gallon Slim');
  const [quantity, setQuantity] = useState(2);
  const [depositPerJug, setDepositPerJug] = useState(settings.defaultContainerDeposit);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate container metrics
  const totalBorrowed = customers.reduce((sum, c) => sum + (c.containersHeld || 0), 0);
  const availableAtStation = 185; // Current active washed & ready stock in station bay
  const damagedContainers = containers.filter((c) => c.actionType === 'damaged').reduce((sum, c) => sum + c.quantity, 0);
  const returnedRecordsCount = containers.filter((c) => c.actionType === 'return').reduce((sum, c) => sum + c.quantity, 0);

  // Filtered customer container ledger
  const customersWithContainers = customers.filter(
    (c) =>
      c.containersHeld > 0 &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.barangay.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : guestName || 'Walk-in Customer';

    const depositAmount = modalType === 'borrow' ? quantity * depositPerJug : 0;
    const refundAmount = modalType === 'return' ? quantity * depositPerJug : 0;

    recordContainerAction({
      customerId: customer?.id,
      customerName,
      containerType,
      actionType: modalType,
      quantity,
      depositAmount,
      refundAmount,
      status: modalType === 'return' ? 'cleared' : modalType === 'damaged' ? 'scrapped' : 'active',
      notes,
      staffName: currentUser.name,
    });

    setIsModalOpen(false);
    setNotes('');
    setQuantity(2);
  };

  const openActionModal = (type, customerId) => {
    setModalType(type);
    if (customerId) setSelectedCustomerId(customerId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Droplets className="w-4 h-4" />
            <span>Container Assets & Deposit Control</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Water Container Circulation & Inventory Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor available station jugs, borrowed containers in customer custody, deposit records, and damaged bottle write-offs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openActionModal('borrow')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Borrow Container</span>
          </button>
          <button
            type="button"
            onClick={() => openActionModal('return')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Return & Refund</span>
          </button>
          <button
            type="button"
            onClick={() => openActionModal('damaged')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Record Damaged</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Available at Station
          </span>
          <span className="text-2xl font-black text-cyan-700 mt-1 block">
            {availableAtStation}
          </span>
          <span className="text-[11px] text-slate-400">Sanitized & ready for refilling</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            With Customers (Borrowed)
          </span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">
            {totalBorrowed}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold">
            ₱{(totalBorrowed * settings.defaultContainerDeposit).toLocaleString()} total deposit held
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Containers Returned
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {returnedRecordsCount}
          </span>
          <span className="text-[11px] text-slate-400">Checked back into station</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Damaged / Decommissioned
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {damagedContainers}
          </span>
          <span className="text-[11px] text-slate-400">Scrapped due to hairline leaks</span>
        </div>
      </div>

      {/* Customer Container Balance Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Customer Container Custody Ledger</span>
            </h3>
            <p className="text-xs text-slate-500">
              Clients currently holding water station containers with active security deposits.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer holding jugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Customer Type</th>
                <th className="py-2.5 px-3">Barangay / Address</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Jugs Held</th>
                <th className="py-2.5 px-3">Deposit Held</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customersWithContainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                    No customers with borrowed containers found.
                  </td>
                </tr>
              ) : (
                customersWithContainers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{cust.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {cust.customerType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{cust.barangay}</td>
                    <td className="py-2.5 px-3 text-slate-500">{cust.contactNumber}</td>
                    <td className="py-2.5 px-3 font-black text-indigo-700 text-sm">
                      {cust.containersHeld} containers
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      ₱{(cust.containersHeld * settings.defaultContainerDeposit).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openActionModal('return', cust.id)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Return Jugs
                      </button>
                      <button
                        type="button"
                        onClick={() => openActionModal('borrow', cust.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors"
                      >
                        Borrow More
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Container Activity & Return History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Customer / Origin</th>
                <th className="py-2.5 px-3">Container Type</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Deposit / Refund</th>
                <th className="py-2.5 px-3">Staff</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {containers.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500">{record.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        record.actionType === 'borrow'
                          ? 'bg-indigo-100 text-indigo-700'
                          : record.actionType === 'return'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {record.actionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{record.customerName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{record.containerType}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{record.quantity} pcs</td>
                  <td className="py-2.5 px-3">
                    {record.actionType === 'borrow' && (
                      <span className="text-indigo-600 font-bold">+₱{record.depositAmount}</span>
                    )}
                    {record.actionType === 'return' && (
                      <span className="text-emerald-600 font-bold">-₱{record.refundAmount || 0}</span>
                    )}
                    {record.actionType === 'damaged' && <span className="text-rose-600">₱0 (Loss)</span>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{record.staffName}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                    {record.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                modalType === 'borrow'
                  ? 'bg-cyan-600'
                  : modalType === 'return'
                  ? 'bg-emerald-600'
                  : 'bg-rose-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase">
                  {modalType === 'borrow'
                    ? 'Issue Container Loan Slip'
                    : modalType === 'return'
                    ? 'Process Container Return'
                    : 'Decommission Damaged Jug'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.containersHeld} currently held)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Container Type:</label>
                  <select
                    value={containerType}
                    onChange={(e) => setContainerType(e.target.value )}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="5-Gallon Slim">5-Gallon Slim w/ Faucet</option>
                    <option value="5-Gallon Round">5-Gallon Round Dispenser</option>
                    <option value="Other">Other Container</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity (pcs):</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {modalType !== 'damaged' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">
                    {modalType === 'borrow' ? 'Security Deposit to Collect:' : 'Deposit to Refund:'}
                  </span>
                  <span className="text-base font-black text-cyan-700">
                    ₱{(quantity * depositPerJug).toLocaleString()}
                  </span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks / Condition:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inspected with cap and valve intact."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-md ${
                    modalType === 'borrow'
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : modalType === 'return'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
