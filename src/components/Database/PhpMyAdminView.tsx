import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Table,
  Terminal,
  Play,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Server,
} from 'lucide-react';

type SubTab = 'structure' | 'browse' | 'sql' | 'operations';

interface ColumnDef {
  field: string;
  type: string;
  key: string;
  null: string;
}

type SqlResult =
  | {
      type: 'select';
      columns: string[];
      rows: Record<string, unknown>[];
      affectedRows: number;
      message: string;
    }
  | {
      type: 'success';
      affectedRows: number;
      message: string;
      rows?: undefined;
    };

interface StatusBanner {
  type: 'success' | 'error';
  message: string;
}

interface ConfirmAction {
  title: string;
  message: string;
  onConfirm: () => void;
}

interface TableConfig {
  data: unknown[];
  setter: (val: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  name: string;
  label: string;
  desc: string;
}

export function PhpMyAdminView(): React.ReactElement {
  const {
    users, setUsers,
    customers, setCustomers,
    products, setProducts,
    vendingMachines, setVendingMachines,
    vendingSales, setVendingSales,
    orders, setOrders,
    sales, setSales,
    containers, setContainers,
    stockMovements, setStockMovements,
    activityLogs, setActivityLogs,
    settings, setSettings,
    logActivity,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('structure');
  const [selectedTable, setSelectedTable] = useState<string>('orders');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM orders;');
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<StatusBanner | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const showStatus = (message: string, type: 'success' | 'error' = 'success'): void => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Table registry mapping
  const tables: Record<string, TableConfig> = {
    orders: {
      data: orders as unknown[],
      setter: setOrders as unknown as TableConfig['setter'],
      name: 'orders',
      label: 'Delivery Orders',
      desc: 'Customer delivery orders and dispatch queue',
    },
    sales: {
      data: sales as unknown[],
      setter: setSales as unknown as TableConfig['setter'],
      name: 'sales',
      label: 'Sales Transactions',
      desc: 'POS walk-in and delivery sales register',
    },
    customers: {
      data: customers as unknown[],
      setter: setCustomers as unknown as TableConfig['setter'],
      name: 'customers',
      label: 'Customers',
      desc: 'Customer directory and delivery addresses',
    },
    products: {
      data: products as unknown[],
      setter: setProducts as unknown as TableConfig['setter'],
      name: 'products',
      label: 'Inventory Products',
      desc: 'Water refills, containers, and accessories catalog',
    },
    vending_machines: {
      data: vendingMachines as unknown[],
      setter: setVendingMachines as unknown as TableConfig['setter'],
      name: 'vending_machines',
      label: 'Vending Machines',
      desc: '24/7 coin-operated water refilling stations',
    },
    vending_sales: {
      data: vendingSales as unknown[],
      setter: setVendingSales as unknown as TableConfig['setter'],
      name: 'vending_sales',
      label: 'Vending Sales & Collections',
      desc: 'Coin collection and water meter logs',
    },
    containers: {
      data: containers as unknown[],
      setter: setContainers as unknown as TableConfig['setter'],
      name: 'containers',
      label: 'Container Tracking',
      desc: 'Jug borrowing, returns, and deposits',
    },
    stock_movements: {
      data: stockMovements as unknown[],
      setter: setStockMovements as unknown as TableConfig['setter'],
      name: 'stock_movements',
      label: 'Stock Movements',
      desc: 'Inventory stock-in and stock-out audit ledger',
    },
    activity_logs: {
      data: activityLogs as unknown[],
      setter: setActivityLogs as unknown as TableConfig['setter'],
      name: 'activity_logs',
      label: 'Activity Logs',
      desc: 'System audit trail and staff actions',
    },
    users: {
      data: users as unknown[],
      setter: setUsers as unknown as TableConfig['setter'],
      name: 'users',
      label: 'System Users',
      desc: 'Admin, staff, driver, and customer portal accounts',
    },
    settings: {
      data: [settings],
      setter: (val) =>
        setSettings((prev) => {
          const res = typeof val === 'function' ? val([prev]) : val;
          return Array.isArray(res) && res[0] ? (res[0] as typeof prev) : prev;
        }),
      name: 'settings',
      label: 'Station Settings',
      desc: 'Global station configuration and parameters',
    },
  };

  const currentTableConfig = tables[selectedTable] || tables.orders;
  const tableData = (Array.isArray(currentTableConfig.data)
    ? currentTableConfig.data
    : [currentTableConfig.data]) as Record<string, unknown>[];

  const filteredRows = tableData.filter((row) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return Object.values(row || {}).some((v) =>
      String(typeof v === 'object' ? JSON.stringify(v) : (v ?? '')).toLowerCase().includes(q)
    );
  });

  // Table columns definition for structure view
  const getTableColumns = (tableName: string): ColumnDef[] => {
    if (tableName === 'orders') {
      return [
        { field: 'id', type: 'VARCHAR(50)', key: 'PRI', null: 'NO' },
        { field: 'orderNumber', type: 'VARCHAR(50)', key: 'UNI', null: 'NO' },
        { field: 'date', type: 'DATE', key: '', null: 'NO' },
        { field: 'customerName', type: 'VARCHAR(150)', key: '', null: 'NO' },
        { field: 'orderType', type: 'VARCHAR(30)', key: '', null: 'NO' },
        { field: 'totalAmount', type: 'DECIMAL(10,2)', key: '', null: 'NO' },
        { field: 'status', type: 'VARCHAR(30)', key: '', null: 'NO' },
        { field: 'paymentStatus', type: 'VARCHAR(30)', key: '', null: 'NO' },
      ];
    }
    if (tableName === 'sales') {
      return [
        { field: 'id', type: 'VARCHAR(50)', key: 'PRI', null: 'NO' },
        { field: 'transactionNumber', type: 'VARCHAR(50)', key: 'UNI', null: 'NO' },
        { field: 'date', type: 'DATE', key: '', null: 'NO' },
        { field: 'customerName', type: 'VARCHAR(150)', key: '', null: 'NO' },
        { field: 'totalAmount', type: 'DECIMAL(10,2)', key: '', null: 'NO' },
        { field: 'paymentMethod', type: 'VARCHAR(30)', key: '', null: 'NO' },
        { field: 'staffName', type: 'VARCHAR(100)', key: '', null: 'NO' },
      ];
    }
    if (tableName === 'customers') {
      return [
        { field: 'id', type: 'VARCHAR(50)', key: 'PRI', null: 'NO' },
        { field: 'name', type: 'VARCHAR(150)', key: '', null: 'NO' },
        { field: 'contactNumber', type: 'VARCHAR(50)', key: '', null: 'NO' },
        { field: 'customerType', type: 'VARCHAR(50)', key: '', null: 'NO' },
        { field: 'primaryAddress', type: 'VARCHAR(250)', key: '', null: 'NO' },
        { field: 'containersHeld', type: 'INT', key: '', null: 'NO' },
        { field: 'totalSpent', type: 'DECIMAL(10,2)', key: '', null: 'NO' },
      ];
    }
    if (tableName === 'products') {
      return [
        { field: 'id', type: 'VARCHAR(50)', key: 'PRI', null: 'NO' },
        { field: 'code', type: 'VARCHAR(50)', key: 'UNI', null: 'NO' },
        { field: 'name', type: 'VARCHAR(150)', key: '', null: 'NO' },
        { field: 'category', type: 'VARCHAR(50)', key: '', null: 'NO' },
        { field: 'price', type: 'DECIMAL(10,2)', key: '', null: 'NO' },
        { field: 'stock', type: 'INT', key: '', null: 'NO' },
        { field: 'unit', type: 'VARCHAR(20)', key: '', null: 'NO' },
      ];
    }
    return [
      { field: 'id', type: 'VARCHAR(50)', key: 'PRI', null: 'NO' },
      { field: 'name / title', type: 'VARCHAR(150)', key: '', null: 'YES' },
      { field: 'created_at / date', type: 'VARCHAR(50)', key: '', null: 'YES' },
      { field: 'status / value', type: 'TEXT', key: '', null: 'YES' },
    ];
  };

  // SQL Query Executor simulator
  const handleRunSql = (): void => {
    setSqlError(null);
    setSqlResult(null);
    const query = sqlQuery.trim();
    const upperQuery = query.toUpperCase();

    try {
      if (upperQuery.startsWith('SELECT')) {
        let targetTable = 'orders';
        for (const t of Object.keys(tables)) {
          if (upperQuery.includes(t.toUpperCase())) {
            targetTable = t;
            break;
          }
        }
        const data = tables[targetTable].data;
        const resultRows = (Array.isArray(data) ? data : [data]) as Record<string, unknown>[];
        setSqlResult({
          type: 'select',
          columns: resultRows.length > 0 ? Object.keys(resultRows[0]) : ['id', 'status'],
          rows: resultRows,
          affectedRows: resultRows.length,
          message: `Query returned ${resultRows.length} row(s) from table \`${targetTable}\``,
        });
        logActivity('SQL Query Executed', `Executed SELECT query on table ${targetTable}`, 'system');
      } else if (upperQuery.startsWith('TRUNCATE') || upperQuery.startsWith('DROP')) {
        let targetTable = '';
        for (const t of Object.keys(tables)) {
          if (upperQuery.includes(t.toUpperCase())) {
            targetTable = t;
            break;
          }
        }
        if (targetTable && tables[targetTable]) {
          tables[targetTable].setter(targetTable === 'settings' ? [{ stationName: 'AquaFabz' }] : []);
          setSqlResult({
            type: 'success',
            affectedRows: 0,
            message: `Table \`${targetTable}\` successfully truncated/emptied.`,
          });
          logActivity('Database TRUNCATE', `Truncated table ${targetTable} via phpMyAdmin SQL Console`, 'system');
        } else {
          setSqlError('Table not found in database schema.');
        }
      } else if (upperQuery.startsWith('DELETE')) {
        let targetTable = 'orders';
        for (const t of Object.keys(tables)) {
          if (upperQuery.includes(t.toUpperCase())) {
            targetTable = t;
            break;
          }
        }
        tables[targetTable].setter(targetTable === 'settings' ? [] : []);
        setSqlResult({
          type: 'success',
          affectedRows: 1,
          message: `DELETE executed successfully on \`${targetTable}\`.`,
        });
      } else if (upperQuery.startsWith('SHOW TABLES')) {
        const tableList: Record<string, unknown>[] = Object.keys(tables).map((t) => ({
          Tables_in_aquafabz_db: t,
          Rows: Array.isArray(tables[t].data) ? tables[t].data.length : 1,
        }));
        setSqlResult({
          type: 'select',
          columns: ['Tables_in_aquafabz_db', 'Rows'],
          rows: tableList,
          affectedRows: tableList.length,
          message: `Showing all 11 tables in database \`aquafabz_db\``,
        });
      } else {
        setSqlResult({
          type: 'success',
          affectedRows: 1,
          message: 'SQL statement executed successfully. (0 errors).',
        });
      }
    } catch (err: unknown) {
      setSqlError(err instanceof Error ? err.message : 'SQL syntax error encountered.');
    }
  };

  // Delete All Data (Truncate Database)
  const handleTruncateAllData = (): void => {
    setConfirmAction({
      title: 'Empty All Operational Tables (TRUNCATE DB)',
      message: 'This will permanently clear all orders, sales, customers, products, vending machines, containers, stock movements, and logs.',
      onConfirm: () => {
        setOrders([]);
        setSales([]);
        setCustomers([]);
        setProducts([]);
        setVendingMachines([]);
        setVendingSales([]);
        setContainers([]);
        setStockMovements([]);
        setActivityLogs([]);
        logActivity('Database Wiped', 'All operational records wiped clean via phpMyAdmin operations console', 'system');
        setConfirmAction(null);
        showStatus('All operational database tables have been emptied (truncated).', 'success');
      },
    });
  };

  // Delete a single row
  const handleDeleteRow = (rowId: string): void => {
    setConfirmAction({
      title: `Delete Record (${rowId})`,
      message: `Remove record ID "${rowId}" from table \`${selectedTable}\`?`,
      onConfirm: () => {
        currentTableConfig.setter((prev) => {
          if (!Array.isArray(prev)) return prev;
          return prev.filter((item) => (item as { id?: string }).id !== rowId);
        });
        logActivity('Record Deleted', `Deleted row ${rowId} from table ${selectedTable}`, 'system');
        setConfirmAction(null);
        showStatus(`Deleted record ${rowId} from \`${selectedTable}\`.`, 'success');
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Inline Status Banner */}
      {statusBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            statusBanner.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline Confirmation Prompt */}
      {confirmAction && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="text-xs space-y-0.5">
            <div className="font-black text-rose-300">{confirmAction.title}</div>
            <div className="text-slate-300">{confirmAction.message}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAction.onConfirm}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Confirm Action
            </button>
          </div>
        </div>
      )}

      {/* phpMyAdmin Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">phpMyAdmin</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">v5.2.1-stable</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              MySQL Server: <span className="text-cyan-400 font-mono">localhost:3306</span> · Database:{' '}
              <span className="text-emerald-400 font-mono">aquafabz_db</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTruncateAllData}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Delete all records across all tables"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty All Data (Truncate DB)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const exportData = JSON.stringify(
                {
                  orders,
                  sales,
                  customers,
                  products,
                  vendingMachines,
                  vendingSales,
                  containers,
                  stockMovements,
                  activityLogs,
                  settings,
                },
                null,
                2
              );
              const blob = new Blob([exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `aquafabz_mysql_dump_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export SQL / JSON Dump</span>
          </button>
        </div>
      </div>

      {/* Main Database Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Database Tables List (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-orange-400" />
              <span>Tables in aquafabz_db</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400">{Object.keys(tables).length} tables</span>
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {Object.entries(tables).map(([key, config]) => {
              const isSelected = selectedTable === key;
              const count = Array.isArray(config.data) ? config.data.length : 1;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTable(key);
                    setActiveSubTab('browse');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                    <span className="truncate font-mono">{config.name}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Table Viewer / SQL Terminal (9 Cols) */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          {/* Table Header & Sub-Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-mono">table: {currentTableConfig.name}</h2>
                <span className="text-xs text-slate-400">({tableData.length} records)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentTableConfig.desc}</p>
            </div>

            {/* Sub-tabs: Browse, Structure, SQL, Operations */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSubTab('browse')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSubTab === 'browse' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Browse Data
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('structure')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSubTab === 'structure' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Structure
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('sql')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  activeSubTab === 'sql' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>SQL Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('operations')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeSubTab === 'operations' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Operations
              </button>
            </div>
          </div>

          {/* TAB 1: BROWSE DATA */}
          {activeSubTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${selectedTable}...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Showing {filteredRows.length} of {tableData.length} entries
                </div>
              </div>

              {filteredRows.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2 bg-slate-950 rounded-2xl border border-slate-800/80">
                  <Database className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-400 text-sm">
                    {tableData.length === 0 ? 'Table is empty (0 rows)' : 'No matching rows'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tableData.length === 0
                      ? 'All data in this table has been deleted or cleared.'
                      : 'Try clearing your search filter.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Actions</th>
                        {Object.keys(filteredRows[0] || {})
                          .slice(0, 6)
                          .map((col) => (
                            <th key={col} className="p-3">
                              {col}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredRows.map((row, idx) => {
                        const rowId = typeof row.id === 'string' ? row.id : undefined;
                        return (
                          <tr key={rowId || idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 flex items-center gap-1.5">
                              {rowId && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(rowId)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                            {Object.entries(row)
                              .slice(0, 6)
                              .map(([, val], i) => (
                                <td key={i} className="p-3 max-w-[200px] truncate">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                                </td>
                              ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STRUCTURE */}
          {activeSubTab === 'structure' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Column</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Key</th>
                      <th className="p-3">Null</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {getTableColumns(selectedTable).map((col, idx) => (
                      <tr key={col.field} className="hover:bg-slate-900/50">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-orange-400">{col.field}</td>
                        <td className="p-3 text-cyan-400">{col.type}</td>
                        <td className="p-3 font-bold text-amber-400">{col.key}</td>
                        <td className="p-3 text-slate-400">{col.null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SQL TERMINAL */}
          {activeSubTab === 'sql' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Run SQL query on database <strong className="text-white">aquafabz_db</strong>:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSqlQuery(`SELECT * FROM ${selectedTable};`)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                    >
                      SELECT *
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqlQuery(`SHOW TABLES;`)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] cursor-pointer"
                    >
                      SHOW TABLES
                    </button>
                    <button
                      type="button"
                      onClick={() => setSqlQuery(`TRUNCATE TABLE ${selectedTable};`)}
                      className="px-2 py-1 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 rounded text-[10px] cursor-pointer"
                    >
                      TRUNCATE
                    </button>
                  </div>
                </div>

                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter SQL query (e.g., SELECT * FROM orders;)"
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRunSql}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Go / Execute SQL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSqlQuery('');
                      setSqlResult(null);
                      setSqlError(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear Console
                  </button>
                </div>
              </div>

              {sqlError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{sqlError}</span>
                </div>
              )}

              {sqlResult && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{sqlResult.message}</span>
                  </div>

                  {sqlResult.type === 'select' && sqlResult.rows.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 max-h-64">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <tr>
                            {sqlResult.columns.map((c) => (
                              <th key={c} className="p-2.5">
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {sqlResult.rows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-900/50">
                              {sqlResult.columns.map((c) => (
                                <td key={c} className="p-2.5 max-w-[180px] truncate">
                                  {typeof r[c] === 'object' ? JSON.stringify(r[c]) : String(r[c] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OPERATIONS */}
          {activeSubTab === 'operations' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-sm">Table Maintenance</h3>
                <p className="text-slate-400">
                  Manage table storage, indexes, and data wiping for <code className="text-orange-400">{selectedTable}</code>.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTable === 'settings') {
                        showStatus('Station settings table cannot be emptied while active.', 'error');
                        return;
                      }
                      currentTableConfig.setter([]);
                      logActivity('Table Emptied', `Truncated table ${selectedTable}`, 'system');
                      showStatus(`Table \`${selectedTable}\` emptied successfully.`);
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Empty Table (TRUNCATE)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedTable === 'settings') {
                        showStatus('Station settings table cannot be dropped while active.', 'error');
                        return;
                      }
                      setConfirmAction({
                        title: `Drop Table \`${selectedTable}\``,
                        message: `Clear all records from \`${selectedTable}\`?`,
                        onConfirm: () => {
                          currentTableConfig.setter([]);
                          logActivity('Table Dropped', `Cleared table ${selectedTable}`, 'system');
                          setConfirmAction(null);
                          showStatus(`Table \`${selectedTable}\` cleared.`);
                        },
                      });
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Drop Table (DROP)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
