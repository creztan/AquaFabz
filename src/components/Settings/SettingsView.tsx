import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  History,
  ShieldAlert,
  Save,
  RotateCcw,
  Building,
  MapPin,
  Lock,
  User,
  CheckCircle2,
  Filter,
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
  const [stationName, setStationName] = useState(settings.stationName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [barangay, setBarangay] = useState(settings.barangay);
  const [city, setCity] = useState(settings.city);
  const [province, setProvince] = useState(settings.province);
  const [contactNumber, setContactNumber] = useState(settings.contactNumber);
  const [email, setEmail] = useState(settings.email);
  const [permitNo, setPermitNo] = useState(settings.businessPermitNo);
  const [dohNo, setDohNo] = useState(settings.dohAccreditationNo);
  const [deliveryFee, setDeliveryFee] = useState(settings.defaultDeliveryFee);
  const [containerDeposit, setContainerDeposit] = useState(settings.defaultContainerDeposit);
  const [lat, setLat] = useState(settings.coordinates.lat);
  const [lng, setLng] = useState(settings.coordinates.lng);
  const [savedStationSuccess, setSavedStationSuccess] = useState(false);

  // Account Form States
  const [accName, setAccName] = useState(currentUser.name);
  const [accEmail, setAccEmail] = useState(currentUser.email);
  const [accPhone, setAccPhone] = useState(currentUser.phone);
  const [newPassword, setNewPassword] = useState('');
  const [savedAccountSuccess, setSavedAccountSuccess] = useState(false);

  // Activity Log Search & Filter
  const [logSearch, setLogSearch] = useState('');
  const [logCategory, setLogCategory] = useState<string>('all');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(logSearch.toLowerCase());
    const matchesCat = logCategory === 'all' || log.category === logCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveStation = (e: React.FormEvent) => {
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

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: accName,
      email: accEmail,
      phone: accPhone,
    });
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
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset system data back to default sample records? Any local changes will be refreshed.')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
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

      {/* TAB 1: Station Settings */}
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

      {/* TAB 2: User Account & Password */}
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

      {/* TAB 3: Activity Logs */}
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
                onChange={(e) => setLogCategory(e.target.value)}
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
