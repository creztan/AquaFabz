import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Droplets,
  ShieldCheck,
  User,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShoppingCart,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Home,
  LogIn,
  UserPlus,
  MapPin,
  Building2,
  Store,
  FileText,
  Check,
} from 'lucide-react';



export const RegisterPage = ({
  onNavigateToLogin,
  onNavigateToLanding,
  onSuccess,
}) => {
  const { registerUser } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('09');
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState('Brgy. Enclaro');
  const [customerType, setCustomerType] = useState('Residential');
  const [containersHeld, setContainersHeld] = useState('0');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !username.trim()) {
      setErrorMessage('Please provide both your full name and preferred username.');
      return;
    }

    if (role === 'customer' && !address.trim()) {
      setErrorMessage('Please enter your delivery street address or house/purok number for water refilling delivery.');
      return;
    }

    // Phone validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 11-digit mobile number (e.g. 0917-123-4567).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (!agreedTerms) {
      setErrorMessage('Please agree to station operational guidelines to proceed.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = registerUser({
        name: name.trim(),
        username: username.trim(),
        role,
        email: email.trim() || `${username.toLowerCase()}@aquafabz-station.com`,
        phone: phone.trim(),
        address: address.trim() || `${barangay}, Binalbagan`,
        barangay: barangay,
        customerType: customerType,
        containersHeld: parseInt(containersHeld, 10) || 0,
        deliveryNotes: deliveryNotes.trim(),
        password,
        status: 'active',
        avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 9999999)}?w=150&auto=format&fit=crop&q=80`,
      });

      setIsLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={onNavigateToLanding}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">AquaFabz</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                  Registration Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-400">AquaFabz Water Refilling Station · New User Registration</p>
            </div>
          </div>

          {/* Upper Right and Sign Up */}
          <div className="flex items-center gap-2">
            {onNavigateToLanding && (
              <button
                type="button"
                onClick={onNavigateToLanding}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login</span>
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-600/30 border border-cyan-500 flex items-center gap-1.5 cursor-default"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Registration Landing Page */}
      <main className="relative z-20 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          {/* Left 5 Cols Descriptions & System Access */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customer Self-Service Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Register as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Customer</span>.
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sign up to order 16-stage purified, mineral, and alkaline water refills delivered directly to your doorstep in Binalbagan.
            </p>

            {/* Customer Portal Features */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Online Water Refill Ordering</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Order 5-gallon slim or round dispenser jugs with zero hassle, with cash on delivery or GCash options.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Live Delivery Rider Tracking</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Follow your delivery queue status as our rider departs the station and approaches your purok.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Borrowed Container Deposit Ledger</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Keep accurate track of all 5-gallon containers currently held at your home or business.
                  </p>
                </div>
              </div>
            </div>

            {/* Station Personnel Notice */}
            <div className="p-3.5 rounded-2xl border border-indigo-950 bg-indigo-950/30 text-[11px] text-indigo-200/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Station Personnel Notice:</strong> Cashier, Delivery Rider, and Staff accounts are created and managed exclusively by the Administrator inside the Station Admin Console.
              </span>
            </div>
          </div>

          {/* Right 7 Cols Registration Form Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl backdrop-blur-xl space-y-4">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Customer Registration</span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  Customer / Resident Sign Up
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create your profile to start ordering refills and tracking container deliveries.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Full Name:</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Maria Clara Santos"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Preferred Username:</label>
                    <input
                      type="text"
                      placeholder="e.g. msantos"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Contact Mobile Phone:</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="0918-000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Email Address (Optional):</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="maria@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Password:</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        required
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Confirm Password:</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        required
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault();
                          setShowConfirmPassword(!showConfirmPassword);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specialized Customer Delivery Profile (Enhanced Registration) */}
                {role === 'customer' && (
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-cyan-900/40 space-y-3">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Water Delivery Address & Profile</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Barangay (Binalbagan):</label>
                        <select
                          value={barangay}
                          onChange={(e) => setBarangay(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                        >
                          <option value="Brgy. Enclaro">Brgy. Enclaro (Crossing Pag-Asa)</option>
                          <option value="Brgy. Poblacion">Brgy. Poblacion (Town Proper)</option>
                          <option value="Brgy. Sto. Rosario">Brgy. Sto. Rosario (Market Area)</option>
                          <option value="Brgy. Paglaum">Brgy. Paglaum</option>
                          <option value="Brgy. San Jose">Brgy. San Jose (Biscom Mill)</option>
                          <option value="Brgy. Canmoros">Brgy. Canmoros</option>
                          <option value="Brgy. Progreso">Brgy. Progreso</option>
                          <option value="Brgy. Amontay">Brgy. Amontay</option>
                          <option value="Brgy. Marina">Brgy. Marina</option>
                          <option value="Brgy. Bi-ao">Brgy. Bi-ao</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Customer Category:</label>
                        <select
                          value={customerType}
                          onChange={(e) => setCustomerType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
                        >
                          <option value="Residential">Residential Household</option>
                          <option value="Commercial">Commercial (Store/Eatery)</option>
                          <option value="Institutional">Institutional (Office/Clinic)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300 block mb-1">Street / House No. / Purok:</label>
                      <input
                        type="text"
                        placeholder="e.g. Purok 3, Near Brgy. Hall / Highway cor. Pag-Asa"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        required={role === 'customer'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Current 5-Gal Jugs Held:</label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={containersHeld}
                          onChange={(e) => setContainersHeld(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Empty jugs ready for swap</span>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-300 block mb-1">Landmark / Delivery Note:</label>
                        <input
                          type="text"
                          placeholder="e.g. Blue gate, beside chapel"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-400">
                    I acknowledge refilling station rules and operational logging.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Enter Console'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        AquaFabz Water Refilling Station · Water Refilling Station Platform
      </footer>
    </div>
  );
};
