import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
} from 'lucide-react';

export const StaffView = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser, deleteUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('staff');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  const openAddModal = () => {
    setEditingUserId(null);
    setName('');
    setUsername('');
    setRole('staff');
    setEmail('');
    setPhone('09');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUserId(u.id);
    setName(u.name);
    setUsername(u.username);
    setRole(u.role);
    setEmail(u.email);
    setPhone(u.phone);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !username) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        name,
        username,
        role,
        email,
        phone,
        status,
      });
    } else {
      addUser({
        name,
        username,
        role,
        email,
        phone,
        status,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?w=150&auto=format&fit=crop&q=80`,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Administration & Access Control</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Station Staff Accounts & Role-Based Permissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrator, counter staff, and delivery rider accounts. Switch active session seamlessly for role testing.
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        )}
      </div>

      {/* Active User Switcher Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-indigo-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              Active User Simulation Session
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Currently Operating As:</span>
              <span className="text-cyan-300 font-black">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-200 uppercase">
                {currentUser.role}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Select any team member below to immediately switch session view:
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setCurrentUser(u)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{u.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isCurrent ? 'bg-cyan-950/20 text-slate-900' : 'bg-slate-900 text-slate-400'
                }`}>
                  {u.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrentUser = u.id === currentUser.id;

          let roleBg = 'bg-indigo-100 text-indigo-800';
          if (u.role === 'admin') roleBg = 'bg-cyan-100 text-cyan-800';
          if (u.role === 'delivery') roleBg = 'bg-emerald-100 text-emerald-800';

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
                isCurrentUser ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow">
                    {u.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                    <div className="text-[11px] text-slate-500">@{u.username}</div>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleBg}`}>
                  {u.role}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-700">Email: </span>
                  <span>{u.email}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Phone: </span>
                  <span>{u.phone}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status: </span>
                  <span
                    className={`font-bold ${
                      u.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {u.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentUser(u)}
                  className={`text-[11px] font-bold flex items-center gap-1 ${
                    isCurrentUser ? 'text-cyan-600' : 'text-indigo-600 hover:underline'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isCurrentUser ? 'Active Session' : 'Switch to this User'}</span>
                </button>

                {currentUser.role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Staff"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {u.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deactivate staff account for ${u.name}?`)) {
                            deleteUser(u.id);
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Deactivate Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">System Access Control Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">POS & Sales</th>
                <th className="py-2.5 px-3">Deliveries & Map</th>
                <th className="py-2.5 px-3">Inventory Stock In/Out</th>
                <th className="py-2.5 px-3">Product Pricing Edit</th>
                <th className="py-2.5 px-3">Vending Records</th>
                <th className="py-2.5 px-3">Staff Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-800">Administrator</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-indigo-800">Staff / Cashier</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Dispatch & View</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Stock In/Out</td>
                <td className="py-2.5 px-3 text-slate-400">✕ View Only</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Record Collections</td>
                <td className="py-2.5 px-3 text-slate-400">✕ View Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-emerald-800">Delivery Rider</td>
                <td className="py-2.5 px-3 text-slate-400">✕ Restricted</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">✓ Trip Sheet & Status</td>
                <td className="py-2.5 px-3 text-slate-400">✕ View Only</td>
                <td className="py-2.5 px-3 text-slate-400">✕ Restricted</td>
                <td className="py-2.5 px-3 text-slate-400">✕ Restricted</td>
                <td className="py-2.5 px-3 text-slate-400">✕ Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUserId ? 'Edit Staff Account' : 'Create New Staff Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-indigo-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username:</label>
                  <input
                    type="text"
                    placeholder="msantos"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Role:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value )}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="staff">Staff / Cashier</option>
                    <option value="delivery">Delivery Rider</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="user@aquafabz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number:</label>
                  <input
                    type="text"
                    placeholder="0918-000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value  | 'inactive')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="active">Active (Access Granted)</option>
                  <option value="inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
