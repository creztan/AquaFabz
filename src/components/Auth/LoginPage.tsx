import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Building2,
  Users,
  LogIn,
  UserPlus,
  Home,
  CheckCircle2,
  Truck,
  ShoppingCart,
  Shield,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToLanding?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToLanding,
  onSuccess,
}) => {
  const { login, loginAsCustomer, customers, users } = useApp();

  // Mode: Personnel (Admin/Staff/Rider) vs User (Customer/Client)
  const [accountType, setAccountType] = useState<'personnel' | 'user'>('personnel');

  // Personnel Form States
  const [personnelUsername, setPersonnelUsername] = useState('admin');
  const [personnelPassword, setPersonnelPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Customer / User Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customCustomerQuery, setCustomCustomerQuery] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePersonnelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(personnelUsername, personnelPassword);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please verify credentials.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const query = customCustomerQuery.trim() || selectedCustomerId;

    setTimeout(() => {
      const res = loginAsCustomer(query);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Customer login failed.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
  };

  const selectPersonnelPreset = (username: string, pass: string = 'password123') => {
    setPersonnelUsername(username);
    setPersonnelPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div
            onClick={onNavigateToLanding}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">AquaFabz</span>
                <span className="text-xs text-cyan-400 font-medium">Console Login</span>
              </div>
              <p className="text-[11px] text-slate-400">AquaFabz Water Refilling Station · Secure Portal</p>
            </div>
          </div>

          {/* Upper Right: Navigation Buttons */}
          <div className="flex items-center gap-2">
            {onNavigateToLanding && (
              <button
                type="button"
                onClick={onNavigateToLanding}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-600/30 border border-cyan-500 flex items-center gap-1.5 cursor-default"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToRegister}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Segmented Control Switcher */}
          <div className="flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setAccountType('personnel');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                accountType === 'personnel'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Station Personnel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('user');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                accountType === 'user'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User / Customer</span>
            </button>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {accountType === 'personnel'
                ? 'Station Personnel Sign In'
                : 'Customer Portal Access'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {accountType === 'personnel'
                ? 'Sign in to access station operations, counter POS, GIS delivery dispatch, container audit, and daily sales.'
                : 'Enter your registered customer account or phone number to check refill orders and container balances.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* FORM A: Personnel Login */}
          {accountType === 'personnel' && (
            <form onSubmit={handlePersonnelSubmit} className="space-y-4 text-xs">
              {/* Quick Preset Selector Buttons */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Select Personnel Profile:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => selectPersonnelPreset('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      personnelUsername === 'admin'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">Eugene P. Senining</div>
                    <div className="text-[10px] text-cyan-400 font-medium">Administrator</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPersonnelPreset('chrysty')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      personnelUsername === 'chrysty'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">Chrysty Mae Castillo</div>
                    <div className="text-[10px] text-sky-400 font-medium">Staff / Cashier</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPersonnelPreset('jacob')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      personnelUsername === 'jacob'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">Christan Jacob Verde</div>
                    <div className="text-[10px] text-indigo-400 font-medium">Delivery Rider</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPersonnelPreset('ramon')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      personnelUsername === 'ramon'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs truncate">Ramon Dela Cruz</div>
                    <div className="text-[10px] text-indigo-400 font-medium">Delivery Rider</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Username:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter personnel username..."
                    value={personnelUsername}
                    onChange={(e) => setPersonnelUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={personnelPassword}
                    onChange={(e) => setPersonnelPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.01]"
              >
                <span>{isLoading ? 'Authenticating Profile...' : 'Sign In as Station Personnel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM B: Customer Login */}
          {accountType === 'user' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-300 block mb-1.5">
                  Select Registered Customer Account:
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setCustomCustomerQuery('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500 mb-2 cursor-pointer transition-colors"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerType} · {c.barangay})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Or type customer name / contact number..."
                    value={customCustomerQuery}
                    onChange={(e) => setCustomCustomerQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs transition-colors"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                Customer Portal allows clients to review active delivery dispatches, request 5-gallon container refills, and check refundable deposit records.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer hover:scale-[1.01]"
              >
                <span>{isLoading ? 'Opening Customer Portal...' : 'Sign In as Customer / User'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Clean Academic Reference Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        AquaFabz Water Refilling Station · Water Refilling Station Platform
      </footer>
    </div>
  );
};
