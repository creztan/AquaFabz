import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalesTransaction } from '../../types';
import {
  TrendingUp,
  Search,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  PlusCircle,
  FileSpreadsheet,
  Store,
  ShoppingCart,
} from 'lucide-react';

interface SalesViewProps {
  onOpenPOS: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onOpenPOS }) => {
  const { sales, setPrintableItem, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'vending'
        ? s.isVendingMachineConsolidated
        : !s.isVendingMachineConsolidated;

    const matchesDate = !dateFilter || s.date === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const totalFilteredSales = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Transaction Number', 'Date', 'Time', 'Customer', 'Type', 'Total Amount', 'Payment Method', 'Staff'];
    const rows = filteredSales.map((s) => [
      s.transactionNumber,
      s.date,
      s.time,
      `"${s.customerName}"`,
      s.orderType,
      s.totalAmount,
      s.paymentMethod,
      `"${s.staffName}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aquaflow-sales-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Sales & Revenue Management</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Station Counter & Consolidated Vending Sales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit daily transactions, generate printable tax receipts, and analyze gross revenues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenPOS}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open POS Register</span>
          </button>
        </div>
      </div>

      {/* Filter and Summary Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transaction #, customer name, staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="all">All Sales Types</option>
            <option value="counter">Station Counter POS Only</option>
            <option value="vending">Vending Machine Collections</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          />

          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-500 hover:underline"
            >
              Clear Date
            </button>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">Filtered Total Sales:</span>
          <span className="text-lg font-black text-cyan-700">₱{totalFilteredSales.toLocaleString()}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Transaction #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer / Source</th>
                <th className="py-3 px-4">Items / Dispensed</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Cashier / Staff</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{sale.transactionNumber}</td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{sale.date}</div>
                    <div className="text-[10px] text-slate-400">{sale.time}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{sale.customerName}</span>
                      {sale.isVendingMachineConsolidated && (
                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">
                          Vending
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">{sale.orderType} sale</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 line-clamp-1">
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{sale.staffName}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    ₱{sale.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setPrintableItem({ type: 'receipt', data: sale })}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
