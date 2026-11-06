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
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
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

      {/* Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (Actions) */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight whitespace-nowrap">AquaFabz</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Station System</span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#capabilities" className="hover:text-white transition-colors whitespace-nowrap">
              Operational Features
            </a>
            <a href="#vending" className="hover:text-white transition-colors whitespace-nowrap">
              24/7 Vending Fleet
            </a>
            <a href="#mapping" className="hover:text-white transition-colors whitespace-nowrap">
              Location GIS Map
            </a>
            <a href="#research" className="hover:text-white transition-colors whitespace-nowrap">
              System Overview
            </a>
          </nav>

          {/* Zone 3: Upper-Right Login and Sign Up Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 border border-cyan-500 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 7 Columns: Editorial Headline and System Scope */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed Metadata Kicker (Anti-slop: zero pill discipline) */}
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold tracking-wide">
                <span>AquaFabz Water Refilling Station</span>
                <span aria-hidden="true">·</span>
                <span>Commercial Station Platform</span>
                <span aria-hidden="true">·</span>
                <span>Automated Vending & GIS Delivery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance">
                Digital Geolocation & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                  Water Station Operations
                </span>{' '}
                Management.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl text-balance">
                An integrated platform uniting point-of-sale counter transactions, automated 24/7 coin vending machine sales consolidation, customer GIS address mapping, container loan deposit audits, and rider delivery dispatch.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Launch Station Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Register Staff Member</span>
                </button>
              </div>

              {/* Verified Domain Metrics Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">4 Units</div>
                  <div className="text-xs text-slate-400 mt-0.5">Automated Vending Fleet</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">7 Barangays</div>
                  <div className="text-xs text-slate-400 mt-0.5">Binalbagan Coverage</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">₱200/jug</div>
                  <div className="text-xs text-slate-400 mt-0.5">Refundable Deposit Audit</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Station Telemetry Preview Mockup Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <div>
                      <h4 className="font-bold text-xs text-white">Live Station Telemetry</h4>
                      <p className="text-[10px] text-slate-400">AquaFabz Station HQ · Binalbagan</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">10.1883° N, 122.8642° E</span>
                </div>

                {/* Sub-card 1: Delivery Trip Monitor */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Active Delivery Fleet</span>
                    </span>
                    <span className="text-[11px] font-mono text-indigo-400">2 Dispatched</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Route: Brgy. Progreso & Paglaum</span>
                    <span className="text-white font-semibold">ETA 12m</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-2/3" />
                  </div>
                </div>

                {/* Sub-card 2: Vending Fleet Sales Breakdown */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-purple-400" />
                      <span>Vending Daily Consolidation</span>
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">₱1,450.00 Collected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>Station 1 (Campus Gate): <strong className="text-white">₱450</strong></div>
                    <div>Station 2 (Market Plaza): <strong className="text-white">₱380</strong></div>
                    <div>Station 3 (San Pedro): <strong className="text-white">₱320</strong></div>
                    <div>Station 4 (Progreso): <strong className="text-white">₱300</strong></div>
                  </div>
                </div>

                {/* Sub-card 3: Container Inventory */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Containers in Custody</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Round 5-Gallon & Slim Dispensers</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-white font-mono">145 Loaned</div>
                    <div className="text-[10px] text-cyan-400">₱29,000 Deposit Value</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In as Personnel or Customer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Four Foundational Operational Modules */}
        <section id="capabilities" className="border-t border-slate-800/80 bg-slate-900/40 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs text-cyan-400 font-semibold tracking-wide uppercase">Core Architecture</span>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Designed for Real Water Station Workflows
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Addresses the real operational friction points of daily water refilling operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Location Mapping Studio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive Leaflet digital GIS map with exact customer GPS pin drops, delivery route polylines, and delivery zone filtering for Binalbagan barangays.
                </p>
                <div className="pt-2 text-[11px] text-cyan-400 font-mono">
                  GPS coordinate geocoding
                </div>
              </div>

              {/* Feature 2 */}
              <div id="vending" className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">24/7 Vending Fleet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Daily coinbox collection tracking, water meter calibration, automated consolidation into total station sales, and low-water refill alerts.
                </p>
                <div className="pt-2 text-[11px] text-purple-400 font-mono">
                  Automated sales ledger
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Delivery Fleet Dispatch</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kanban order lifecycle tracking from Pending, Preparing, to Out for Delivery, with rider assignment and thermal receipt printing.
                </p>
                <div className="pt-2 text-[11px] text-indigo-400 font-mono">
                  Dispatch slips & route sheet
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Container Loan Ledger</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tracks round 5-gallon jugs and slim dispensers borrowed by customers, computes refundable ₱200 deposits, and audits returns and damage.
                </p>
                <div className="pt-2 text-[11px] text-emerald-400 font-mono">
                  Borrow & swap accountability
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Water Station Pricing Reference */}
        <section className="py-20 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs text-cyan-400 font-semibold tracking-wide uppercase">Product Catalog</span>
                <h2 className="text-3xl font-black text-white tracking-tight mt-1">
                  Water Rates & Container Deposit Standard
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Standard station counter and delivery pricing configured for Binalbagan residential, commercial, and institutional clients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-medium">Purified Water Refill</div>
                <div className="text-3xl font-black text-white font-mono">₱25.00</div>
                <p className="text-xs text-slate-400">Standard 5-gallon refill (16-stage reverse osmosis filtration).</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-medium">Mineral Water Refill</div>
                <div className="text-3xl font-black text-white font-mono">₱30.00</div>
                <p className="text-xs text-slate-400">Enriched with natural electrolytes, calcium, and magnesium.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-medium">Alkaline Water Refill</div>
                <div className="text-3xl font-black text-white font-mono">₱35.00</div>
                <p className="text-xs text-slate-400">High pH 8.5–9.5 ionizer-balanced drinking water.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs text-slate-400 font-medium">Refundable Jug Deposit</div>
                <div className="text-3xl font-black text-cyan-400 font-mono">₱200.00</div>
                <p className="text-xs text-slate-400">Refundable custody deposit for borrowed round or slim jugs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Station Alignment */}
        <section id="research" className="border-t border-slate-800/80 bg-slate-900/60 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                  <Building2 className="w-4 h-4" />
                  <span>AquaFabz Water Refilling Station · Operations Division</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  Enterprise Water Refilling Station & Geolocation System
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Project Title: "Web-Based Sales, Inventory, Customer, and Location Mapping Management System for a Water Refilling Station".
                  Engineered for high-efficiency daily operations, automated 24/7 coin vending machine consolidation, and GIS delivery route tracking.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Enter Station Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">AquaFabz</span>
            <span>· Web-Based Water Refilling Station & Geolocation System</span>
          </div>
          <div>
            AquaFabz Water Refilling Station · 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
