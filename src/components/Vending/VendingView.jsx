import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Store,
  Plus,
  Coins,
  Droplet,
  MapPin,
  AlertTriangle,
  Printer,
  TrendingUp,
  FileText,
  Power,
  PowerOff,
  Edit2,
  Wrench,
  CheckCircle2,
  Sliders,
  Filter,
  Trash2,
} from 'lucide-react';

export const VendingView = () => {
  const {
    vendingMachines,
    vendingSales,
    recordVendingCollection,
    addVendingMachine,
    updateVendingMachine,
    deleteVendingMachine,
    currentUser,
    setPrintableItem,
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [isEditMachineModalOpen, setIsEditMachineModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(vendingMachines[0]?.id || '');
  const [editingMachine, setEditingMachine] = useState(null);

  // Status Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states for collection
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [coinsCollected, setCoinsCollected] = useState(1000);
  const [waterDispensed, setWaterDispensed] = useState(500);
  const [meterStart, setMeterStart] = useState('');
  const [meterEnd, setMeterEnd] = useState('');
  const [waterRefillAmount, setWaterRefillAmount] = useState(0);
  const [notes, setNotes] = useState('');

  // Form states for adding machine
  const [newVmCode, setNewVmCode] = useState(`VM-0${vendingMachines.length + 1}`);
  const [newVmName, setNewVmName] = useState('');
  const [newVmLocation, setNewVmLocation] = useState('');
  const [newVmBarangay, setNewVmBarangay] = useState('Brgy. Poblacion');
  const [newVmCapacity, setNewVmCapacity] = useState(800);
  const [newVmLat, setNewVmLat] = useState(10.2014);
  const [newVmLng, setNewVmLng] = useState(122.8601);
  const [newVmStatus, setNewVmStatus] = useState('operational');

  // Form states for editing machine
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBarangay, setEditBarangay] = useState('');
  const [editStatus, setEditStatus] = useState('operational');
  const [editWaterLevel, setEditWaterLevel] = useState(0);
  const [editCapacity, setEditCapacity] = useState(800);
  const [editPricePerLiter, setEditPricePerLiter] = useState(2);
  const [editNotes, setEditNotes] = useState('');

  // Totals & Metrics
  const totalCoinsInMachines = vendingMachines.reduce((sum, vm) => sum + vm.currentCoinTotal, 0);
  const totalLifetimeVendingSales = vendingMachines.reduce((sum, vm) => sum + vm.totalLifetimeSales, 0);
  const totalWaterInTanks = vendingMachines.reduce((sum, vm) => sum + vm.currentWaterLevelLiters, 0);

  const availableCount = vendingMachines.filter((vm) => vm.status === 'operational').length;
  const offlineCount = vendingMachines.filter((vm) => vm.status === 'offline').length;
  const maintenanceCount = vendingMachines.filter((vm) => vm.status === 'maintenance').length;
  const lowWaterCount = vendingMachines.filter((vm) => vm.status === 'low_water').length;

  const filteredMachines = vendingMachines.filter((vm) => {
    if (statusFilter === 'all') return true;
    return vm.status === statusFilter;
  });

  const handleQuickToggleAvailability = (vm) => {
    // If operational or low_water, toggle to offline (Unavailable)
    // If offline or maintenance, toggle to operational (Available)
    const newStatus =
      vm.status === 'offline' || vm.status === 'maintenance' ? 'operational' : 'offline';

    updateVendingMachine(vm.id, {
      status: newStatus,
      notes: `Availability changed to ${newStatus === 'operational' ? 'Available/Operational' : 'Unavailable/Offline'} by ${currentUser.name}`,
    });
  };

  const handleDeleteMachine = (vm) => {
    if (window.confirm(`Are you sure you want to remove and decommission vending machine "${vm.name} (${vm.code})"?`)) {
      deleteVendingMachine(vm.id);
      if (editingMachine?.id === vm.id) {
        setIsEditMachineModalOpen(false);
        setEditingMachine(null);
      }
    }
  };

  const handleOpenEditModal = (vm) => {
    setEditingMachine(vm);
    setEditName(vm.name);
    setEditLocation(vm.locationName);
    setEditBarangay(vm.barangay);
    setEditStatus(vm.status);
    setEditWaterLevel(vm.currentWaterLevelLiters);
    setEditCapacity(vm.waterCapacityLiters);
    setEditPricePerLiter(vm.pricePerLiter || 2);
    setEditNotes(vm.notes || '');
    setIsEditMachineModalOpen(true);
  };

  const handleSaveEditMachine = (e) => {
    e.preventDefault();
    if (!editingMachine) return;

    updateVendingMachine(editingMachine.id, {
      name: editName,
      locationName: editLocation,
      barangay: editBarangay,
      status: editStatus,
      currentWaterLevelLiters: editWaterLevel,
      waterCapacityLiters: editCapacity,
      pricePerLiter: editPricePerLiter,
      notes: editNotes,
      lastServiced: new Date().toISOString().split('T')[0],
    });

    setIsEditMachineModalOpen(false);
    setEditingMachine(null);
  };

  const handleSaveCollection = (e) => {
    e.preventDefault();
    const machine = vendingMachines.find((vm) => vm.id === selectedMachineId);
    if (!machine) return;

    recordVendingCollection({
      machineId: machine.id,
      machineName: machine.name,
      date: collectionDate,
      coinsCollected,
      waterDispensedLiters: waterDispensed,
      meterReadingStart: meterStart ? parseFloat(meterStart) : undefined,
      meterReadingEnd: meterEnd ? parseFloat(meterEnd) : undefined,
      waterRefilledLiters: waterRefillAmount > 0 ? waterRefillAmount : undefined,
      recordedBy: currentUser.name,
      notes,
    });

    setIsRecordModalOpen(false);
    setCoinsCollected(1000);
    setWaterDispensed(500);
    setWaterRefillAmount(0);
    setNotes('');
  };

  const handleAddMachine = (e) => {
    e.preventDefault();
    if (!newVmName || !newVmLocation) return;

    addVendingMachine({
      code: newVmCode,
      name: newVmName,
      locationName: newVmLocation,
      barangay: newVmBarangay,
      coordinates: {
        lat: newVmLat,
        lng: newVmLng,
      },
      waterCapacityLiters: newVmCapacity,
      currentWaterLevelLiters: newVmCapacity,
      coinCapacity: 10000,
      pricePerLiter: 2,
      status: newVmStatus,
      lastServiced: new Date().toISOString().split('T')[0],
      lastCollectionDate: 'Never',
      notes: 'Newly commissioned unit.',
    });

    setIsAddMachineModalOpen(false);
    setNewVmName('');
    setNewVmLocation('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>Station-Owned Vending Network</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Water Vending Machine Fleet & Availability Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 24/7 coin-operated machine availability, edit operational statuses, and record coin collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => setIsAddMachineModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vending Unit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>Record Coin Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Coins Pending Collection
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              ₱{totalCoinsInMachines.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400">Available across all coin hoppers</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Vending Fleet Availability
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-600">
                {availableCount} Available
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {vendingMachines.length} Units
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {offlineCount > 0 ? `${offlineCount} Unavailable` : '100% Operational Fleet'}
            </span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <Droplet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Lifetime Vending Revenue
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              ₱{totalLifetimeVendingSales.toLocaleString()}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold">Auto-consolidated into station ledger</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Availability Status Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filter Vending Fleet Availability:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({vendingMachines.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('operational')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'operational'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available / Operational ({availableCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('offline')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'offline'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Unavailable / Offline ({offlineCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('maintenance')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'maintenance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance ({maintenanceCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('low_water')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'low_water'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Water ({lowWaterCount})</span>
          </button>
        </div>
      </div>

      {/* Vending Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMachines.map((vm) => {
          const waterPercent = Math.round((vm.currentWaterLevelLiters / vm.waterCapacityLiters) * 100);
          const isAvailable = vm.status === 'operational';
          const isOffline = vm.status === 'offline';
          const isMaintenance = vm.status === 'maintenance';
          const isLowWater = vm.status === 'low_water';

          let statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          let statusLabel = 'Available / Operational';

          if (isOffline) {
            statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
            statusLabel = 'Unavailable / Offline';
          } else if (isMaintenance) {
            statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            statusLabel = 'Under Maintenance';
          } else if (isLowWater) {
            statusBadgeClass = 'bg-orange-100 text-orange-800 border-orange-200';
            statusLabel = 'Low Water Alert';
          }

          return (
            <div
              key={vm.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                isOffline
                  ? 'border-rose-200 bg-rose-50/20'
                  : isMaintenance
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              {/* Card Header & Status Selector */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono font-bold text-xs">
                      {vm.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{vm.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vm.locationName} ({vm.barangay})</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusBadgeClass}`}>
                    {isAvailable && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    {isOffline && <PowerOff className="w-3.5 h-3.5 text-rose-600" />}
                    {isMaintenance && <Wrench className="w-3.5 h-3.5 text-amber-600" />}
                    {isLowWater && <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />}
                    <span>{statusLabel}</span>
                  </span>

                  {/* Inline Status Dropdown */}
                  <select
                    value={vm.status}
                    onChange={(e) =>
                      updateVendingMachine(vm.id, {
                        status: e.target.value ,
                      })
                    }
                    className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="operational">🟢 Available (Operational)</option>
                    <option value="offline">🔴 Unavailable (Offline)</option>
                    <option value="maintenance">🔧 Under Maintenance</option>
                    <option value="low_water">⚠️ Low Water Alert</option>
                  </select>
                </div>
              </div>

              {/* Quick One-Tap Availability Toggle Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  <span>Machine Availability:</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleQuickToggleAvailability(vm)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isAvailable || isLowWater
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                  title={isAvailable ? 'Click to mark  / Offline' : 'Click to mark  / Operational'}
                >
                  {isAvailable || isLowWater ? (
                    <>
                      <PowerOff className="w-3.5 h-3.5" />
                      <span>Set Unavailable</span>
                    </>
                  ) : (
                    <>
                      <Power className="w-3.5 h-3.5" />
                      <span>Set Available</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tank Level Bar */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Purified Tank Storage:</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {vm.currentWaterLevelLiters}L / {vm.waterCapacityLiters}L ({waterPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      waterPercent < 25
                        ? 'bg-rose-500'
                        : waterPercent < 40
                        ? 'bg-amber-500'
                        : 'bg-cyan-600'
                    }`}
                    style={{ width: `${Math.min(100, waterPercent)}%` }}
                  />
                </div>
                {isLowWater && (
                  <p className="text-[10px] text-amber-800 font-medium">
                    ⚠️ Reserve below safety threshold. Schedule station tanker refill.
                  </p>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Current Coin Hopper:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ₱{vm.currentCoinTotal.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-500 block">Total Lifetime Sales:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₱{vm.totalLifetimeSales.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer info & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  Last serviced: {vm.lastServiced}
                </span>

                <div className="flex items-center gap-1.5">
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMachine(vm)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      title="Decommission & Remove Vending Machine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(vm)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Unit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMachineId(vm.id);
                      setIsRecordModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition-colors text-xs cursor-pointer"
                  >
                    Collect Coins
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collection Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">Vending Collection Audit Records</h3>
          </div>
          <span className="text-xs text-slate-500">
            {vendingSales.length} historical collection events recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Vending Machine</th>
                <th className="py-2.5 px-3">Water Dispensed</th>
                <th className="py-2.5 px-3">Coins Collected</th>
                <th className="py-2.5 px-3">Collected By</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendingSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{sale.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{sale.machineName}</td>
                  <td className="py-2.5 px-3 text-cyan-700 font-semibold">{sale.waterDispensedLiters} Liters</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 text-sm">
                    ₱{sale.coinsCollected.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{sale.recordedBy}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-[180px]">
                    {sale.notes || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setPrintableItem({ type: 'vending', data: sale })}
                      className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Vending Machine Modal */}
      {isEditMachineModalOpen && editingMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Edit Vending Machine Availability & Parameters</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditMachineModalOpen(false);
                  setEditingMachine(null);
                }}
                className="text-purple-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditMachine} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Availability & Operational Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value )}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                >
                  <option value="operational">🟢 Operational (Available for Dispensing)</option>
                  <option value="offline">🔴 Offline / Unavailable (Disabled)</option>
                  <option value="maintenance">🔧 Under Maintenance (Servicing)</option>
                  <option value="low_water">⚠️ Low Water Alert (Refill Required)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Machine Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location Landmark:</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barangay:</label>
                  <input
                    type="text"
                    value={editBarangay}
                    onChange={(e) => setEditBarangay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Water Level (L):</label>
                  <input
                    type="number"
                    value={editWaterLevel}
                    onChange={(e) => setEditWaterLevel(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-cyan-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tank Capacity (L):</label>
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseFloat(e.target.value) || 800)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price / Liter (₱):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editPricePerLiter}
                    onChange={(e) => setEditPricePerLiter(parseFloat(e.target.value) || 2)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Servicing / Maintenance Notes:</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes on machine condition or maintenance status..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {currentUser.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMachine(editingMachine)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Decommission Unit</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMachineModalOpen(false);
                      setEditingMachine(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    Save Availability & Data
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Collection Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <h3 className="font-bold text-sm">Record Vending Machine Collection</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="text-purple-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Vending Unit:</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {vendingMachines.map((vm) => (
                    <option key={vm.id} value={vm.id}>
                      {vm.code} - {vm.name} (Hold: ₱{vm.currentCoinTotal})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Collection Date:</label>
                  <input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Coins Collected (₱):</label>
                  <input
                    type="number"
                    min="1"
                    value={coinsCollected}
                    onChange={(e) => setCoinsCollected(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Water Dispensed (L):</label>
                  <input
                    type="number"
                    min="0"
                    value={waterDispensed}
                    onChange={(e) => setWaterDispensed(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-cyan-700"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Replenish Tank (L):</label>
                  <input
                    type="number"
                    min="0"
                    value={waterRefillAmount}
                    onChange={(e) => setWaterRefillAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Servicing Remarks:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleaned coin slot, filters rinsed, coin counter verified."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-100">
                ✨ <strong>Automatic Consolidation:</strong> Recording this collection will automatically append a ₱{coinsCollected.toLocaleString()} transaction to the station's daily and overall sales total.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save & Consolidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Machine Modal (Admin) */}
      {isAddMachineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Station Vending Machine</h3>
              <button
                type="button"
                onClick={() => setIsAddMachineModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMachine} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Machine Code:</label>
                  <input
                    type="text"
                    value={newVmCode}
                    onChange={(e) => setNewVmCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Status:</label>
                  <select
                    value={newVmStatus}
                    onChange={(e) => setNewVmStatus(e.target.value )}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="operational">🟢 Operational (Available)</option>
                    <option value="offline">🔴 Offline (Unavailable)</option>
                    <option value="maintenance">🔧 Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Machine Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Vending Station #5 - Paglaum Barangay Gym"
                  value={newVmName}
                  onChange={(e) => setNewVmName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location / Street Landmark:</label>
                <input
                  type="text"
                  placeholder="e.g. Near Barangay Hall waiting shed"
                  value={newVmLocation}
                  onChange={(e) => setNewVmLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Water Capacity (L):</label>
                  <input
                    type="number"
                    value={newVmCapacity}
                    onChange={(e) => setNewVmCapacity(parseFloat(e.target.value) || 800)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barangay:</label>
                  <input
                    type="text"
                    value={newVmBarangay}
                    onChange={(e) => setNewVmBarangay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
