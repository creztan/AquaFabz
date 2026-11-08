import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
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
  Coins,
  Compass,
} from 'lucide-react';

export const LoginPage = ({
  onNavigateToRegister,
  onNavigateToLanding,
  onSuccess,
}) => {
  const { login, loginAsCustomer, customers, users } = useApp();

  // Role Landing Portals: 'admin' | 'staff' | 'delivery' | 'customer'
  const [selectedPortal, setSelectedPortal] = useState('admin');

  // Form States for Personnel
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Form States for Customer Portal
  const [customerIdentifier, setCustomerIdentifier] = useState('verde');
  const [customerPassword, setCustomerPassword] = useState('password123');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle switching portals
  const handleSwitchPortal = (portalKey) => {
    setSelectedPortal(portalKey);
    setErrorMessage('');
    if (portalKey === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else if (portalKey === 'staff') {
      setUsername('chrysty');
      setPassword('password123');
    } else if (portalKey === 'delivery') {
      setUsername('jacob');
      setPassword('password123');
    } else if (portalKey === 'customer') {
      setCustomerIdentifier('verde');
      setCustomerPassword('password123');
    }
  };

  const handlePersonnelSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please verify credentials.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAsCustomer(customerIdentifier, customerPassword);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Customer login failed. Please verify your credentials.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
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
                <span className="text-xs text-cyan-400 font-medium">Role Portals</span>
              </div>
              <p className="text-[11px] text-slate-400">AquaFabz Water Refilling Station · Dedicated Role Landing Entry</p>
            </div>
          </div>

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
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* 4 Dedicated Role Portal Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Select Your Dedicated Role Portal Landing:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchPortal('admin')}
                className={`py-2.5 px-2 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedPortal === 'admin'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px]">ADMIN</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPortal('staff')}
                className={`py-2.5 px-2 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedPortal === 'staff'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-[11px]">STAFF</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPortal('delivery')}
                className={`py-2.5 px-2 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedPortal === 'delivery'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="text-[11px]">DELIVERY</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPortal('customer')}
                className={`py-2.5 px-2 rounded-xl font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedPortal === 'customer'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[11px]">CUSTOMER</span>
              </button>
            </div>
          </div>

          {/* Heading per Role Portal */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              {selectedPortal === 'admin' && <ShieldCheck className="w-5 h-5 text-cyan-400" />}
              {selectedPortal === 'staff' && <ShoppingCart className="w-5 h-5 text-sky-400" />}
              {selectedPortal === 'delivery' && <Truck className="w-5 h-5 text-indigo-400" />}
              {selectedPortal === 'customer' && <Users className="w-5 h-5 text-blue-400" />}

              <span>
                {selectedPortal === 'admin' && 'Administrator Executive Portal'}
                {selectedPortal === 'staff' && 'Station Operations & POS Staff Portal'}
                {selectedPortal === 'delivery' && 'Delivery Fleet Rider Dispatch Console'}
                {selectedPortal === 'customer' && 'Customer Self-Service Water Portal'}
              </span>
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedPortal === 'admin' && 'Full financial control, station master dashboard, vending fleet logs, staff accounts, and government compliance.'}
              {selectedPortal === 'staff' && 'Walk-in counter POS, order fulfillment queue, inventory stock checks, and daily vending coin collections.'}
              {selectedPortal === 'delivery' && 'Delivery route map, customer address lookup, phone contact, and empty jug return collection.'}
              {selectedPortal === 'customer' && 'Request 5-gallon water refills, track live rider dispatches, and audit container deposit balances.'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ADMIN PORTAL FORM */}
          {selectedPortal === 'admin' && (
            <form onSubmit={handlePersonnelSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-xs">
                👤 Preset Profile: <strong>Eugene P. Senining</strong> (Station Owner / Administrator)
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Username:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>{isLoading ? 'Opening Admin Dashboard...' : 'Enter Admin Executive Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STAFF PORTAL FORM */}
          {selectedPortal === 'staff' && (
            <form onSubmit={handlePersonnelSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-sky-200 text-xs">
                👤 Preset Profile: <strong>Chrysty Mae L. Castillo</strong> (Station Staff / Cashier)
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Username:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500 text-xs font-mono"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500 text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>{isLoading ? 'Opening Staff Desk...' : 'Enter Staff Operations Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* DELIVERY RIDER PORTAL FORM */}
          {selectedPortal === 'delivery' && (
            <form onSubmit={handlePersonnelSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Select Delivery Rider Account:</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('jacob');
                      setPassword('password123');
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      username === 'jacob'
                        ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Christan Jacob M. Verde</div>
                    <div className="text-[10px] text-indigo-400">Rider #1</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUsername('ramon');
                      setPassword('password123');
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                      username === 'ramon'
                        ? 'bg-indigo-950 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>Ramon Dela Cruz</div>
                    <div className="text-[10px] text-indigo-400">Rider #2</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-300 block mb-1.5">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>{isLoading ? 'Opening Rider Console...' : 'Enter Driver Dispatch Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* CUSTOMER PORTAL FORM */}
          {selectedPortal === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
              {/* Account Security Notice */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-[11px] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Account Protection & Order Verification:</strong>
                  <span>
                    Customer accounts require your username/email and password to prevent unauthorized refill orders, protect container balances, and prevent account exploitation.
                  </span>
                </div>
              </div>

              {/* Username or Email / Phone */}
              <div>
                <label className="font-medium text-slate-300 block mb-1.5">
                  Customer Username, Registered Email, or Mobile:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. verde or verde.family@gmail.com or 0939-111-2233"
                    value={customerIdentifier}
                    onChange={(e) => setCustomerIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300">Customer Password:</label>
                  <span className="text-[10px] text-slate-400">Default demo: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCustomerPassword ? 'text' : 'password'}
                    placeholder="Enter your customer password"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  >
                    {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Demo Customer Account Shortcuts */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                  Quick-Fill Verified Demo Accounts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerIdentifier('verde');
                      setCustomerPassword('password123');
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-colors ${
                      customerIdentifier === 'verde'
                        ? 'bg-blue-950/80 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">Verde Family</div>
                    <div className="text-[10px] text-cyan-400 font-mono">verde</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomerIdentifier('mamachits');
                      setCustomerPassword('password123');
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-colors ${
                      customerIdentifier === 'mamachits'
                        ? 'bg-blue-950/80 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">Mama Chit's Grill</div>
                    <div className="text-[10px] text-cyan-400 font-mono">mamachits</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCustomerIdentifier('binalbagan_it');
                      setCustomerPassword('password123');
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-colors ${
                      customerIdentifier === 'binalbagan_it'
                        ? 'bg-blue-950/80 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">Binalbagan IT Dept</div>
                    <div className="text-[10px] text-cyan-400 font-mono">binalbagan_it</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>{isLoading ? 'Verifying Account Security...' : 'Secure Sign In to Customer Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Sign up prompt */}
              <div className="text-center pt-1">
                <span className="text-slate-400 text-xs">Don't have a customer profile yet? </span>
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                >
                  Register as Customer
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        AquaFabz Water Refilling Station · Dedicated Role Portals
      </footer>
    </div>
  );
};
