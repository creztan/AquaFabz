import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Dashboard } from './components/Dashboard/Dashboard.jsx';
import { DeliveryView } from './components/Delivery/DeliveryView.jsx';
import { LocationMapView } from './components/Map/LocationMapView.jsx';
import { VendingView } from './components/Vending/VendingView.jsx';
import { ContainerView } from './components/Containers/ContainerView.jsx';
import { InventoryView } from './components/Inventory/InventoryView.jsx';
import { CustomerView } from './components/Customers/CustomerView.jsx';
import { SalesView } from './components/Sales/SalesView.jsx';
import { ReportsView } from './components/Reports/ReportsView.jsx';
import { StaffView } from './components/Staff/StaffView.jsx';
import { SettingsView } from './components/Settings/SettingsView.jsx';
import { POSModal } from './components/POS/POSModal.jsx';
import { NewOrderModal } from './components/Delivery/NewOrderModal.jsx';
import { PrintModal } from './components/Receipt/PrintModal.jsx';
import { LandingPage } from './components/Auth/LandingPage.jsx';
import { LoginPage } from './components/Auth/LoginPage.jsx';
import { RegisterPage } from './components/Auth/RegisterPage.jsx';
import { CustomerPortalView } from './components/CustomerPortal/CustomerPortalView.jsx';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  MapPin,
  Store,
  Droplets,
  Package,
  Users,
  TrendingUp,
  FileText,
  ShieldCheck,
  Settings,
  Bell,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  PlusCircle,
  Map as MapIcon,
  LogOut,
  UserPlus,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Compass,
  AlertTriangle,
} from 'lucide-react';

function MainApp() {
  const {
    currentUser,
    users,
    setCurrentUser,
    settings,
    orders,
    products,
    vendingMachines,
    isAuthenticated,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authLandingPage, setAuthLandingPage] = useState('login');
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // If user is not authenticated, render dedicated view
  if (!isAuthenticated) {
    if (authLandingPage === 'landing') {
      return (
        <LandingPage
          onNavigateToLogin={() => setAuthLandingPage('login')}
          onNavigateToRegister={() => setAuthLandingPage('register')}
        />
      );
    }
    if (authLandingPage === 'register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => setAuthLandingPage('login')}
          onNavigateToLanding={() => setAuthLandingPage('landing')}
          onSuccess={() => setActiveTab('dashboard')}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToRegister={() => setAuthLandingPage('register')}
        onNavigateToLanding={() => setAuthLandingPage('landing')}
        onSuccess={() => setActiveTab('dashboard')}
      />
    );
  }

  // Notifications count (low stock + pending orders + low vending water)
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const lowVendingCount = vendingMachines.filter((vm) => vm.currentWaterLevelLiters < 250).length;
  const totalAlerts = pendingOrdersCount + lowStockCount + lowVendingCount;

  // Grouped Navigation structure filtered strictly by role use case
  const navigationGroups = [
    {
      group: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'deliveries', label: 'Delivery Dispatch', icon: Truck, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
        { id: 'map', label: 'Location Map Studio', icon: Compass },
      ],
    },
    {
      group: 'Station Assets',
      items: [
        { id: 'vending', label: 'Vending Machines', icon: Store, badge: lowVendingCount > 0 ? 'Alert' : undefined },
        { id: 'containers', label: 'Container Tracking', icon: Droplets },
        { id: 'inventory', label: 'Inventory & Supplies', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
      ],
    },
    {
      group: 'Business & CRM',
      items: [
        { id: 'customers', label: 'Customer Directory', icon: Users },
        { id: 'sales', label: 'Sales Transactions', icon: TrendingUp },
        { id: 'reports', label: 'Reports & Analytics', icon: FileText },
      ],
    },
    {
      group: 'Administration',
      items: [
        { id: 'staff', label: 'Staff Accounts', icon: ShieldCheck },
        { id: 'settings', label: 'Settings & Logs', icon: Settings },
      ],
    },
  ]
    .map((group) => {
      let items = group.items;
      if (currentUser.role === 'delivery') {
        items = items
          .filter((item) => ['dashboard', 'deliveries', 'map', 'containers'].includes(item.id))
          .map((item) => (item.id === 'dashboard' ? { ...item, label: 'Rider Dispatch Console' } : item));
      } else if (currentUser.role === 'staff') {
        items = items
          .filter((item) => !['staff', 'settings'].includes(item.id))
          .map((item) => (item.id === 'dashboard' ? { ...item, label: 'Staff Desk Dashboard' } : item));
      } else if (currentUser.role === 'admin') {
        items = items.map((item) =>
          item.id === 'dashboard' ? { ...item, label: 'Administrator Dashboard' } : item
        );
      }
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  // Flatten allowed item IDs for current user's role
  const allowedItemIds = navigationGroups.flatMap((g) => g.items.map((i) => i.id));
  const effectiveActiveTab = allowedItemIds.includes(activeTab) ? activeTab : 'dashboard';

  // Look up active item label
  let currentTabLabel = 'Dashboard';
  for (const g of navigationGroups) {
    const match = g.items.find((i) => i.id === effectiveActiveTab);
    if (match) currentTabLabel = match.label;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Left Sidebar (Desktop fixed + Mobile slide-over) */}
      {currentUser.role !== 'customer' && (
        <aside
          className={`fixed inset-y-0 left-0 z-50 bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800/80 transition-all duration-300 lg:static ${
            isMobileMenuOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full lg:translate-x-0'
          } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        >
          {/* Sidebar Header Brand */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
            <div
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0 group-hover:scale-105 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="font-extrabold text-white text-base tracking-tight truncate">
                    AquaFabz
                  </div>
                  <div className="text-[10px] text-cyan-400 font-medium truncate">
                    AquaFabz Station
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button Inside Sidebar */}
          {!isSidebarCollapsed && (currentUser.role === 'admin' || currentUser.role === 'staff') && (
            <div className="p-3 border-b border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setIsPOSOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Open POS Counter</span>
              </button>
            </div>
          )}

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
            {navigationGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {group.group}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      title={isSidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {!isSidebarCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            isActive
                              ? 'bg-white text-cyan-900'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Bottom Footer Toggle & Status */}
          <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2">
            {!isSidebarCollapsed && (
              <div className="px-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>DOH Certified</span>
                <span className="text-cyan-400 font-mono">16-Stage R.O.</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-full items-center justify-center py-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl text-xs transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Menu</span>
                </div>
              )}
            </button>
          </div>
        </aside>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
            {/* Left Toggle & Breadcrumb View Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  AquaFabz
                </span>
                <span className="text-xs text-slate-300 hidden sm:inline">/</span>
                <h2 className="font-bold text-slate-900 text-sm tracking-tight">
                  {currentUser.role === 'customer' ? 'Customer Self-Service Portal' : currentTabLabel}
                </h2>
              </div>
            </div>

            {/* Right Action Buttons, Notifications, User Menu */}
            <div className="flex items-center gap-2.5">
              {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPOSOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>POS Counter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewOrderOpen(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>New Delivery</span>
                  </button>
                </>
              )}

                  {/* Notification Alerts Bell & Popover */}
                  {currentUser.role !== 'customer' && (
                    <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                      title={`${totalAlerts} Pending Alerts`}
                    >
                      <Bell className="w-4 h-4" />
                      {totalAlerts > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                      )}
                    </button>

                    {isAlertsOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2">
                        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                          <span>Operational Alerts</span>
                          <span className="text-[10px] font-mono text-slate-500">{totalAlerts} total</span>
                        </div>
                        {totalAlerts === 0 ? (
                          <div className="text-slate-400 py-3 text-center">No active alerts. All systems normal.</div>
                        ) : (
                          <div className="space-y-1.5">
                            {pendingOrdersCount > 0 && (
                              <div
                                onClick={() => {
                                  setActiveTab('deliveries');
                                  setIsAlertsOpen(false);
                                }}
                                className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer text-indigo-900 flex items-center justify-between"
                              >
                                <span>{pendingOrdersCount} pending deliveries</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {lowStockCount > 0 && (
                              <div
                                onClick={() => {
                                  setActiveTab('inventory');
                                  setIsAlertsOpen(false);
                                }}
                                className="p-2 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer text-amber-900 flex items-center justify-between"
                              >
                                <span>{lowStockCount} items at low stock</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {lowVendingCount > 0 && (
                              <div
                                onClick={() => {
                                  setActiveTab('vending');
                                  setIsAlertsOpen(false);
                                }}
                                className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer text-rose-900 flex items-center justify-between"
                              >
                                <span>{lowVendingCount} vending units low water</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* User Session Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-slate-800 text-[11px] leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-3">
                    <div className="px-1 py-1">
                      <p className="font-bold text-slate-900 text-sm">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.email || 'authenticated@aquafabz.com'}</p>
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-cyan-100 text-cyan-900 border border-cyan-200">
                        Authenticated Role: {currentUser.role}
                      </div>
                    </div>

                    {/* ADMIN EXCEPTION: Admin can simulate other roles without signing out */}
                    {(currentUser.role === 'admin' || currentUser.username === 'admin') && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-cyan-800">
                          <span>👑 Admin Simulation Override:</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-cyan-50 rounded text-cyan-700">Admin Only</span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          As Administrator, you can simulate and preview other role dashboards:
                        </p>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setCurrentUser(u);
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                u.id === currentUser.id
                                  ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-200'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="truncate">{u.name}</span>
                              <span className="text-[9px] uppercase font-mono font-bold text-slate-400">{u.role}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Explicit Log Out button on Header */}
              <button
                type="button"
                onClick={logout}
                title="Log Out to Landing"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentUser.role === 'customer' ? (
            <CustomerPortalView />
          ) : (
            <>
              {effectiveActiveTab === 'dashboard' && (
                <Dashboard
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenPOS={() => setIsPOSOpen(true)}
                  onOpenNewOrder={() => setIsNewOrderOpen(true)}
                  onOpenVendingRecord={() => setActiveTab('vending')}
                />
              )}

              {effectiveActiveTab === 'deliveries' && <DeliveryView />}
              {effectiveActiveTab === 'map' && <LocationMapView />}
              {effectiveActiveTab === 'vending' && <VendingView />}
              {effectiveActiveTab === 'containers' && <ContainerView />}
              {effectiveActiveTab === 'inventory' && <InventoryView />}
              {effectiveActiveTab === 'customers' && <CustomerView />}
              {effectiveActiveTab === 'sales' && <SalesView onOpenPOS={() => setIsPOSOpen(true)} />}
              {effectiveActiveTab === 'reports' && <ReportsView />}
              {effectiveActiveTab === 'staff' && <StaffView />}
              {effectiveActiveTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>

        {/* Clean Footer Branding */}
        <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong>AquaFabz</strong> · Sales, Inventory, Customer & Location Mapping Management System
            </div>
            <div className="text-[11px] text-slate-400">
              AquaFabz Central Hub · Water Refilling Station Platform
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Action Button for Mobile Quick POS */}
      {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
        <div className="lg:hidden fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => setIsPOSOpen(true)}
            className="w-13 h-13 rounded-2xl bg-cyan-600 text-white shadow-xl flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="POS Counter"
          >
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Global Modals */}
      <POSModal isOpen={isPOSOpen} onClose={() => setIsPOSOpen(false)} />
      <NewOrderModal isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} />
      <PrintModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
