import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ActivityCategory, User as AppUser } from '../../types';
import {
  Settings,
  History,
  Save,
  RotateCcw,
  Building,
  User,
  CheckCircle2,
  Search,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    activityLogs,
    currentUser,
    updateUser,
    resetToDefaultData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'station' | 'account' | 'logs'>('station');

  // Station Form States
  const [stationName, setStationName] = useState<string>(settings.stationName);
  const [tagline, setTagline] = useState<string>(settings.tagline);
  const [address, setAddress] = useState<string>(settings.address);
  const [barangay, setBarangay] = useState<string>(settings.barangay);
  const [city, setCity] = useState<string>(settings.city);
  const [province, setProvince] = useState<string>(settings.province);
  const [contactNumber, setContactNumber] = useState<string>(settings.contactNumber);
  const [email, setEmail] = useState<string>(settings.email);
  const [permitNo, setPermitNo] = useState<string>(settings.businessPermitNo);
  const [dohNo, setDohNo] = useState<string>(settings.dohAccreditationNo);
  const [deliveryFee, setDeliveryFee] = useState<number>(settings.defaultDeliveryFee);
  const [containerDeposit, setContainerDeposit] = useState<number>(settings.defaultContainerDeposit);
  const [lat, setLat] = useState<number>(settings.coordinates.lat);
  const [lng, setLng] = useState<number>(settings.coordinates.lng);
  const [savedStationSuccess, setSavedStationSuccess] = useState<boolean>(false);

  // Account Form States
  const [accName, setAccName] = useState<string>(currentUser.name || '');
  const [accEmail, setAccEmail] = useState<string>(currentUser.email || '');
  const [accPhone, setAccPhone] = useState<string>(currentUser.phone || '');
  const [newPassword, setNewPassword] = useState<string>('');
  const [savedAccountSuccess, setSavedAccountSuccess] = useState<boolean>(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState<boolean>(false);

  useEffect(() => {
    setAccName(currentUser.name || '');
    setAccEmail(currentUser.email || '');
    setAccPhone(currentUser.phone || '');
    setNewPassword('');
  }, [currentUser.id, currentUser.name, currentUser.email, currentUser.phone]);

  // Activity Log Search & Filter
  const [logSearch, setLogSearch] = useState<string>('');
  const [logCategory, setLogCategory] = useState<'all' | ActivityCategory>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const q = logSearch.toLowerCase();
    const matchesSearch =
      (log.action || '').toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      (log.userName || '').toLowerCase().includes(q);
    const matchesCat = logCategory === 'all' || log.category === logCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveStation = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    updateSettings({
      stationName,
      tagline,
      address,
      barangay,
      city,
      province,
      contactNumber,
      email,
      businessPermitNo: permitNo,
      dohAccreditationNo: dohNo,
      defaultDeliveryFee: deliveryFee,
      defaultContainerDeposit: containerDeposit,
      coordinates: { lat, lng },
    });
    setSavedStationSuccess(true);
    setTimeout(() => setSavedStationSuccess(false), 3000);
  };

  const handleSaveAccount = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const updates: Partial<AppUser> = {
      name: accName,
      email: accEmail,
      phone: accPhone,
    };
    if (newPassword.trim()) {
      updates.password = newPassword.trim();
    }
    updateUser(currentUser.id, updates);
    setSavedAccountSuccess(true);
    setNewPassword('');
    setTimeout(() => setSavedAccountSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Station Profile & System Audit</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            System Settings, Account Profile & Activity Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure refilling station parameters, legal permits, user security, and review comprehensive activity audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConfirmResetOpen ? (
            <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-xs">
              <span className="font-semibold text-rose-800">Load sample data?</span>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setIsConfirmResetOpen(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(false)}
                className="px-2 py-1 bg-white text-slate-600 rounded-lg font-semibold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmResetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('station')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'station'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Water Station Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'account'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Account & Password</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-cyan-600 text-cyan-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Activity Audit Logs ({activityLogs.length})</span>
        </button>
      </div>

      {/* TAB 1 Settings */}
      {activeTab === 'station' && (
        <form onSubmit={handleSaveStation} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Station Business Information</h3>
              <p className="text-slate-500 text-[11px]">
                Appears on printable receipts, delivery order slips, and thermal slips.
              </p>
            </div>
            {savedStationSuccess && (
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Station settings saved!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Station Name:</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline / Mission:</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Street Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Barangay:</label>
              <input
                type="text"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Municipality & Province:</label>
              <input
                type="text"
                value={`${city}, ${province}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setCity(parts[0]?.trim() || city);
                  if (parts[1]) setProvince(parts[1].trim());
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Phone:</label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Station Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">LGU Business Permit #:</label>
              <input
                type="text"
                value={permitNo}
                onChange={(e) => setPermitNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">DOH Accreditation #:</label>
              <input
                type="text"
                value={dohNo}
                onChange={(e) => setDohNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Delivery Fee (₱):</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Container Deposit (₱):</label>
              <input
                type="number"
                value={containerDeposit}
                onChange={(e) => setContainerDeposit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Station Base Latitude:</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 10.2014)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Station Base Longitude:</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 122.8601)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Station Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2 Account & Password */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-xl text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Account Information & Security</h3>
              <p className="text-slate-500 text-[11px]">
                Update personal staff credentials and login password.
              </p>
            </div>
            {savedAccountSuccess && (
              <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg">
                Account updated!
              </span>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Your Full Name:</label>
            <input
              type="text"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email:</label>
              <input
                type="email"
                value={accEmail}
                onChange={(e) => setAccEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone:</label>
              <input
                type="text"
                value={accPhone}
                onChange={(e) => setAccPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Change Password:</label>
            <input
              type="password"
              placeholder="Leave blank to keep existing password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 3 Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-600" />
                <span>Station Security & Activity Audit Log</span>
              </h3>
              <p className="text-xs text-slate-500">
                Immutable audit trail for monitoring staff accountability, logins, sales, and deliveries.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <select
                value={logCategory}
                onChange={(e) => setLogCategory(e.target.value as 'all' | ActivityCategory)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="all">All Categories</option>
                <option value="sales">Sales</option>
                <option value="delivery">Delivery</option>
                <option value="inventory">Inventory</option>
                <option value="container">Container</option>
                <option value="vending">Vending</option>
                <option value="staff">Staff</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Details / Narrative</th>
                  <th className="py-2.5 px-3">User & Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[320px] truncate">{log.details}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {log.userName} ({log.userRole})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
