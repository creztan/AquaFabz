import React from 'react';
import {
  Droplets,
  MapPin,
  Store,
  Truck,
  ShieldCheck,
  Compass,
  ArrowRight,
  Building2,
  CheckCircle2,
  Package,
  Users,
  LogIn,
  UserPlus,
  Coins,
  Shield,
  Activity,
  Layers,
  Clock,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';

export const LandingPage = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight whitespace-nowrap">AquaFabz</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Role Portals</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#portals" className="hover:text-white transition-colors whitespace-nowrap">
              Role Portals
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors whitespace-nowrap">
              Operational Modules
            </a>
            <a href="#vending" className="hover:text-white transition-colors whitespace-nowrap">
              24/7 Vending
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 border border-cyan-500 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Role Portals Login</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToRegister}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-semibold tracking-wide uppercase">
              <span>AquaFabz Water Refilling Station System</span>
              <span>·</span>
              <span>Dedicated Role Portals</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Water Refilling Station & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                Geolocation System
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed text-balance max-w-2xl mx-auto">
              Integrated web platform for AquaFabz Water Refilling Station in Binalbagan, Negros Occidental. Select your role landing portal below to proceed.
            </p>
          </div>

          {/* 4 DEDICATED ROLE PORTAL LANDING CARDS (Matching the user's uploaded role list) */}
          <div id="portals" className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Role Card 1: ADMIN */}
            <div
              onClick={onNavigateToLogin}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 shadow-xl transition-all cursor-pointer group space-y-4 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 uppercase">
                  Role: ADMIN
                </span>
                <h3 className="text-lg font-black text-white mt-2 group-hover:text-cyan-400 transition-colors">
                  Administrator Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Eugene P. Senining · Executive financial control, vending fleet ledgers, staff account management, and government compliance logs.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-bold">
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Role Card 2: STAFF */}
            <div
              onClick={onNavigateToLogin}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 shadow-xl transition-all cursor-pointer group space-y-4 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 uppercase">
                  Role: STAFF
                </span>
                <h3 className="text-lg font-black text-white mt-2 group-hover:text-sky-400 transition-colors">
                  Station Staff Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Chrysty Mae L. Castillo · Walk-in counter POS transactions, order preparation queue, inventory stock checks, and vending coin collection.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-sky-400 font-bold">
                <span>Enter Staff Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Role Card 3: DELIVERY */}
            <div
              onClick={onNavigateToLogin}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 shadow-xl transition-all cursor-pointer group space-y-4 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 uppercase">
                  Role: DELIVERY
                </span>
                <h3 className="text-lg font-black text-white mt-2 group-hover:text-indigo-400 transition-colors">
                  Delivery Driver Console
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Christan Jacob M. Verde & Ramon Dela Cruz · Driver dispatch queue, GIS customer route map, phone contacts, and empty jug collection.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-bold">
                <span>Enter Driver Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Role Card 4: CUSTOMER */}
            <div
              onClick={onNavigateToLogin}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 shadow-xl transition-all cursor-pointer group space-y-4 hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 uppercase">
                  Role: CUSTOMER
                </span>
                <h3 className="text-lg font-black text-white mt-2 group-hover:text-blue-400 transition-colors">
                  Customer Refill Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Registered Clients · Request 5-gallon water refills, track live rider dispatches, and check refundable container deposit balances.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-bold">
                <span>Enter Customer Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* Operational Modules overview */}
        <section id="capabilities" className="border-t border-slate-800/80 bg-slate-900/40 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs text-cyan-400 font-semibold tracking-wide uppercase">Core Architecture</span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Designed for AquaFabz Station Workflows
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-bold text-sm">📍 Location Mapping</div>
                <p className="text-xs text-slate-400">Interactive GIS map for Binalbagan customer delivery destinations.</p>
              </div>

              <div id="vending" className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-purple-400 font-bold text-sm">🏪 24/7 Vending Fleet</div>
                <p className="text-xs text-slate-400">Daily coin collection logging and water tank level monitoring.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-indigo-400 font-bold text-sm">🚚 Delivery Dispatch</div>
                <p className="text-xs text-slate-400">Order lifecycle tracking from Pending to Out for Delivery.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold text-sm">🪣 Container Loan Ledger</div>
                <p className="text-xs text-slate-400">Tracking borrowed 5-gallon jugs and ₱200 refundable deposits.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        AquaFabz Water Refilling Station · Dedicated Role Portals
      </footer>
    </div>
  );
};
