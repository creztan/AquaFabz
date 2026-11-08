import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Droplets,
  Store,
  Truck,
  Users,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const ReportsView = () => {
  const {
    sales,
    vendingSales,
    vendingMachines,
    products,
    containers,
    orders,
    customers,
    settings,
    setPrintableItem,
  } = useApp();

  const [activeReport, setActiveReport] = useState('sales');

  const [timeframe, setTimeframe] = useState('daily');

  // Sales totals
  const totalGrossSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const vendingPortion = sales
    .filter((s) => s.isVendingMachineConsolidated)
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const counterPortion = totalGrossSales - vendingPortion;

  // Inventory valuation
  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const totalInventoryRetailValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  // Containers
  const totalBorrowedContainers = customers.reduce((sum, c) => sum + (c.containersHeld || 0), 0);
  const totalDepositsHeld = totalBorrowedContainers * settings.defaultContainerDeposit;

  // Deliveries
  const totalDeliveries = orders.filter((o) => o.orderType === 'delivery').length;
  const completedDeliveries = orders.filter((o) => o.status === 'Delivered').length;

  const handlePrintCurrentReport = () => {
    let reportData = {};
    if (activeReport === 'sales') {
      reportData = {
        title: 'Comprehensive Sales & Revenue Report',
        metrics: [
          { label: 'Total Gross Revenue', value: `₱${totalGrossSales.toLocaleString()}` },
          { label: 'Station Counter POS Sales', value: `₱${counterPortion.toLocaleString()}` },
          { label: 'Vending Machine Revenue', value: `₱${vendingPortion.toLocaleString()}` },
          { label: 'Total Completed Transactions', value: sales.length },
          { label: 'Timeframe', value: timeframe.toUpperCase() },
        ],
      };
    } else if (activeReport === 'inventory') {
      reportData = {
        title: 'Inventory & Supplies Valuation Report',
        metrics: [
          { label: 'Total Catalog Products', value: products.length },
          { label: 'Total In-Stock Units', value: totalInventoryUnits },
          { label: 'Total Stock Cost Value', value: `₱${totalInventoryCost.toLocaleString()}` },
          { label: 'Potential Retail Valuation', value: `₱${totalInventoryRetailValue.toLocaleString()}` },
          { label: 'Low-Stock Alerts', value: products.filter((p) => p.stock <= p.minStock).length },
        ],
      };
    } else if (activeReport === 'containers') {
      reportData = {
        title: 'Water Container Custody & Audit Report',
        metrics: [
          { label: 'Available Ready Jugs in Station', value: '185 units' },
          { label: 'Jugs Held by Customers', value: `${totalBorrowedContainers} units` },
          { label: 'Total Security Deposits Held', value: `₱${totalDepositsHeld.toLocaleString()}` },
          { label: 'Damaged / Scrapped Jugs', value: containers.filter((c) => c.actionType === 'damaged').length },
        ],
      };
    } else if (activeReport === 'vending') {
      reportData = {
        title: 'Vending Fleet Performance Report',
        metrics: [
          { label: 'Active 24/7 Vending Units', value: vendingMachines.length },
          { label: 'Lifetime Vending Sales', value: `₱${vendingMachines.reduce((s, vm) => s + vm.totalLifetimeSales, 0).toLocaleString()}` },
          { label: 'Total Water in Reserve Tanks', value: `${vendingMachines.reduce((s, vm) => s + vm.currentWaterLevelLiters, 0)} Liters` },
          { label: 'Total Coin Box Holdings', value: `₱${vendingMachines.reduce((s, vm) => s + vm.currentCoinTotal, 0).toLocaleString()}` },
        ],
      };
    } else if (activeReport === 'compliance') {
      reportData = {
        title: 'DOH Sanitary Inspection & Government Bound Logbook Sheet',
        metrics: [
          { label: 'Station Name', value: settings.stationName },
          { label: 'DOH Accreditation No.', value: settings.dohAccreditationNo },
          { label: 'Business Permit No.', value: settings.businessPermitNo },
          { label: 'Location', value: `${settings.barangay}, ${settings.city}` },
          { label: 'Compliance Status', value: 'CERTIFIED COMPLIANT' },
        ],
      };
    } else {
      reportData = {
        title: 'Operations Summary Report',
        metrics: [
          { label: 'Total Registered Customers', value: customers.length },
          { label: 'Completed Deliveries', value: completedDeliveries },
          { label: 'Total Delivery Fleet Orders', value: totalDeliveries },
        ],
      };
    }

    setPrintableItem({ type: 'report', data: reportData });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Management Intelligence & Analytics</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Station Audit Reports & Government Compliance Logbooks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate formal reports and printable bound logbook sheets for DOH sanitary and LGU inspections.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintCurrentReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Formal Report / Sheet</span>
        </button>
      </div>

      {/* Report Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 text-xs">
        {[
          { id: 'sales', label: 'Sales & Revenue Summary', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory & Supplies', icon: Package },
          { id: 'containers', label: 'Container Audit', icon: Droplets },
          { id: 'vending', label: 'Vending Machines', icon: Store },
          { id: 'delivery', label: 'Delivery & Logistics', icon: Truck },
          { id: 'customers', label: 'Customer Accounts', icon: Users },
          { id: 'compliance', label: 'DOH / LGU Compliance Logbooks', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id )}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT 1 & Revenue */}
      {activeReport === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Station Revenue
              </span>
              <span className="text-2xl font-black text-cyan-700 mt-1 block">
                ₱{totalGrossSales.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">Aggregated counter + vending units</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Counter & Delivery Sales
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₱{counterPortion.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">
                {Math.round((counterPortion / (totalGrossSales || 1)) * 100)}% of total business
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Vending Machine Revenue
              </span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">
                ₱{vendingPortion.toLocaleString()}
              </span>
              <span className="text-[11px] text-purple-600 font-semibold">
                {Math.round((vendingPortion / (totalGrossSales || 1)) * 100)}% passive 24/7 coin income
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Transactions Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Transaction #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer / Entity</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Staff</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold">{s.transactionNumber}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.date} {s.time}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.customerName}</td>
                      <td className="py-2.5 px-3 uppercase text-slate-600">{s.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.staffName}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        ₱{s.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2 & Valuation */}
      {activeReport === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Products Catalog
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {products.length} SKUs
              </span>
              <span className="text-[11px] text-slate-400">Water refills, containers, parts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Stock Valuation (Cost)
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                ₱{totalInventoryCost.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">Total capital tied up in inventory</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Retail Sales Value
              </span>
              <span className="text-2xl font-black text-cyan-700 mt-1 block">
                ₱{totalInventoryRetailValue.toLocaleString()}
              </span>
              <span className="text-[11px] text-cyan-700 font-semibold">
                Projected gross margin: ₱{(totalInventoryRetailValue - totalInventoryCost).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Detailed Product Stock Valuation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Unit Cost</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">Total Cost</th>
                    <th className="py-2.5 px-3 text-right">Total Retail Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{p.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.stock} {p.unit}</td>
                      <td className="py-2.5 px-3 text-slate-600">₱{p.cost}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-semibold">₱{p.price}</td>
                      <td className="py-2.5 px-3 text-slate-600">₱{(p.stock * p.cost).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-800">
                        ₱{(p.stock * p.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3 */}
      {activeReport === 'containers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Containers in Customer Circulation
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {totalBorrowedContainers} units
              </span>
              <span className="text-[11px] text-slate-400">Out with registered accounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Security Deposits Held
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                ₱{totalDepositsHeld.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">Refundable upon bottle return</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Station Replacement Reserve
              </span>
              <span className="text-2xl font-black text-cyan-700 mt-1 block">
                185 units
              </span>
              <span className="text-[11px] text-slate-400">Available in washing & filling bay</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Customers with Container Balances</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Barangay</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Jugs Held</th>
                    <th className="py-2.5 px-3 text-right">Deposit Held</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers
                    .filter((c) => c.containersHeld > 0)
                    .map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.barangay}</td>
                        <td className="py-2.5 px-3 text-slate-500">{c.contactNumber}</td>
                        <td className="py-2.5 px-3 font-black text-indigo-700">{c.containersHeld} containers</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₱{(c.containersHeld * settings.defaultContainerDeposit).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4 Fleet */}
      {activeReport === 'vending' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Vending Machine Station Audit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Name & Location</th>
                    <th className="py-2.5 px-3">Water Level</th>
                    <th className="py-2.5 px-3">Uncollected Coins</th>
                    <th className="py-2.5 px-3">Lifetime Revenue</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendingMachines.map((vm) => (
                    <tr key={vm.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{vm.code}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{vm.name}</div>
                        <div className="text-[11px] text-slate-500">{vm.locationName}</div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-cyan-800">
                        {vm.currentWaterLevelLiters}L / {vm.waterCapacityLiters}L
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">
                        ₱{vm.currentCoinTotal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900">
                        ₱{vm.totalLifetimeSales.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            vm.status === 'low_water'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {vm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 5 & Logistics */}
      {activeReport === 'delivery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Orders Dispatched
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {orders.length} orders
              </span>
              <span className="text-[11px] text-slate-400">Station delivery fleet</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Successfully Delivered
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {completedDeliveries}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {Math.round((completedDeliveries / (orders.length || 1)) * 100)}% fulfillment rate
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Active Trips on Road
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {orders.filter((o) => o.status === 'Out for Delivery').length}
              </span>
              <span className="text-[11px] text-slate-400">Tricycle & motorcycle routes</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 6 Customers */}
      {activeReport === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Top Accounts by Lifetime Purchases</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3">Completed Orders</th>
                  <th className="py-2.5 px-3 text-right">Lifetime Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...customers]
                  .sort((a, b) => b.totalSpent - a.totalSpent)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {c.customerType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{c.primaryAddress}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{c.totalOrders} orders</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-600 text-sm">
                        ₱{c.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 7 / LGU Compliance Logbooks */}
      {activeReport === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">Regulatory & DOH Compliance Logbooks</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-formatted printable sheets and manual record-keeping for LGU business permit inspectors and Department of Health (DOH) sanitary audits.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrintCurrentReport}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Print Official Compliance Log Sheet
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-xs text-slate-950 uppercase tracking-wide">
                  1. DOH Sanitary & Water Quality Log
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Daily recording of residual chlorine, pH level (6.5–8.5), Total Dissolved Solids (TDS), and UV lamp / ozone sterilization running hours.
                </p>
                <div className="pt-2 text-[11px] text-cyan-700 font-semibold">
                  ✓ Required for DOH Annual Renewal
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-xs text-slate-950 uppercase tracking-wide">
                  2. Container Washing & Sanitization Log
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Manual daily checklist of detergent soaking, internal brushing, high-pressure rinsing, and iodophor sanitizing of returned 5-gallon jugs.
                </p>
                <div className="pt-2 text-[11px] text-cyan-700 font-semibold">
                  ✓ Required for LGU Health Certificate
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-xs text-slate-950 uppercase tracking-wide">
                  3. Official Book of Accounts (Sales)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bound daily sales ledger consolidating counter POS transactions and vending machine coinbox collections for BIR / LGU tax reporting.
                </p>
                <div className="pt-2 text-[11px] text-cyan-700 font-semibold">
                  ✓ Required for Municipal Business Permit
                </div>
              </div>
            </div>

            {/* Manual Record Entry Table */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Active Government Inspection Log Entries</h4>
                <span className="text-xs text-slate-500 font-mono">AquaFabz Municipal Health Office Standard</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Inspection Type</th>
                      <th className="py-2.5 px-3">Parameter / Checklist Item</th>
                      <th className="py-2.5 px-3">Recorded Result / Value</th>
                      <th className="py-2.5 px-3">Inspector / Staff</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-600">2026-11-05</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">DOH Water Quality</td>
                      <td className="py-2.5 px-3 text-slate-700">pH Level (6.5 - 8.5)</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-700 font-bold">7.4 pH (Optimal)</td>
                      <td className="py-2.5 px-3 text-slate-600">Eugene P. Senining (Admin)</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Compliant
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-600">2026-11-05</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">DOH Water Quality</td>
                      <td className="py-2.5 px-3 text-slate-700">Total Dissolved Solids (TDS)</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-700 font-bold">42 ppm (&lt; 500 max)</td>
                      <td className="py-2.5 px-3 text-slate-600">Eugene P. Senining (Admin)</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Compliant
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-600">2026-11-05</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Container Sanitization</td>
                      <td className="py-2.5 px-3 text-slate-700">High-Pressure Wash & Iodophor Soak</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-700 font-bold">120 Jugs Processed</td>
                      <td className="py-2.5 px-3 text-slate-600">Chrysty Mae L. Castillo (Staff)</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Compliant
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono text-slate-600">2026-11-04</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">LGU Sales Register</td>
                      <td className="py-2.5 px-3 text-slate-700">Daily Counter & Vending Revenue</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">₱4,150.00 Reconciled</td>
                      <td className="py-2.5 px-3 text-slate-600">Chrysty Mae L. Castillo (Staff)</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Compliant
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
