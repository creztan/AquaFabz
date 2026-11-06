import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VendingMachine, VendingSaleRecord } from '../../types';
import {
  Store,
  Plus,
  Coins,
  Droplet,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  TrendingUp,
  FileText,
  Clock,
  RotateCw,
} from 'lucide-react';

interface VendingViewProps {
  onOpenRecordModal?: () => void;
}

export const VendingView: React.FC<VendingViewProps> = () => {
  const {
    vendingMachines,
    vendingSales,
    recordVendingCollection,
    addVendingMachine,
    updateVendingMachine,
    currentUser,
    setPrintableItem,
    settings,
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(vendingMachines[0]?.id || '');

  // Form states for collection
  const [collectionDate, setCollectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coinsCollected, setCoinsCollected] = useState<number>(1000);
  const [waterDispensed, setWaterDispensed] = useState<number>(500);
  const [meterStart, setMeterStart] = useState<string>('');
  const [meterEnd, setMeterEnd] = useState<string>('');
  const [waterRefillAmount, setWaterRefillAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Form states for adding machine
  const [newVmCode, setNewVmCode] = useState<string>('VM-05');
  const [newVmName, setNewVmName] = useState<string>('');
  const [newVmLocation, setNewVmLocation] = useState<string>('');
  const [newVmBarangay, setNewVmBarangay] = useState<string>('Brgy. Poblacion');
  const [newVmCapacity, setNewVmCapacity] = useState<number>(800);
  const [newVmLat, setNewVmLat] = useState<number>(10.2014);
  const [newVmLng, setNewVmLng] = useState<number>(122.8601);

  // Totals
  const totalCoinsInMachines = vendingMachines.reduce((sum, vm) => sum + vm.currentCoinTotal, 0);
  const totalLifetimeVendingSales = vendingMachines.reduce((sum, vm) => sum + vm.totalLifetimeSales, 0);
  const totalWaterInTanks = vendingMachines.reduce((sum, vm) => sum + vm.currentWaterLevelLiters, 0);

  const handleSaveCollection = (e: React.FormEvent) => {
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

  const handleAddMachine = (e: React.FormEvent) => {
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
      status: 'operational',
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
            Water Vending Machine Sales & Fleet Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record 24/7 coin-operated machine collections; sales are automatically consolidated into daily revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              type="button"
              onClick={() => setIsAddMachineModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vending Unit</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
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
              Total Vending Water Reserve
            </span>
            <span className="text-2xl font-black text-cyan-600 mt-1 block">
              {totalWaterInTanks.toLocaleString()} Liters
            </span>
            <span className="text-[11px] text-slate-400">In 4 satellite field tanks</span>
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

      {/* Vending Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendingMachines.map((vm) => {
          const waterPercent = Math.round((vm.currentWaterLevelLiters / vm.waterCapacityLiters) * 100);
          const isLowWater = vm.status === 'low_water';

          return (
            <div
              key={vm.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between">
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

                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isLowWater
                      ? 'bg-amber-100 text-amber-800 flex items-center gap-1'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isLowWater && <AlertTriangle className="w-3.5 h-3.5" />}
                  {isLowWater ? 'Low Water Alert' : 'Operational'}
                </span>
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

              {/* Footer info & collection trigger */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">
                  Last collected: {vm.lastCollectionDate}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMachineId(vm.id);
                    setIsRecordModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition-colors text-xs"
                >
                  Collect Coins
                </button>
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
                      className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-semibold"
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
                className="text-purple-200 hover:text-white"
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
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
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
                className="text-slate-400 hover:text-white"
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
                  <label className="font-semibold text-slate-700 block mb-1">Water Capacity (L):</label>
                  <input
                    type="number"
                    value={newVmCapacity}
                    onChange={(e) => setNewVmCapacity(parseFloat(e.target.value) || 800)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
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
                  <label className="font-semibold text-slate-700 block mb-1">Latitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newVmLat}
                    onChange={(e) => setNewVmLat(parseFloat(e.target.value) || 10.2014)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitude:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newVmLng}
                    onChange={(e) => setNewVmLng(parseFloat(e.target.value) || 122.8601)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
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
