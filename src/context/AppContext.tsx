import React, { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import {
  initialUsers,
  initialCustomers,
  initialProducts,
  initialVendingMachines,
  initialVendingSales,
  initialOrders,
  initialSales,
  initialContainers,
  initialStockMovements,
  initialActivityLogs,
  initialSettings,
} from '../data/initialData';
import type {
  User,
  Customer,
  Product,
  VendingMachine,
  VendingSaleRecord,
  DeliveryOrder,
  SaleTransaction,
  ContainerRecord,
  StockMovement,
  ActivityLog,
  StationSettings,
  PrintableItem,
  AuthResult,
  RegisterUserData,
  DeliveryStatus,
  ActivityCategory,
} from '../types';

export interface AppContextValue {
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => AuthResult;
  loginAsCustomer: (identifier: string, password: string) => AuthResult;
  registerUser: (userData: RegisterUserData) => AuthResult;
  logout: () => void;

  currentUser: User;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setCurrentUser: (user: User) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  addCustomer: (custData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'registeredDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  addProduct: (prodData: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  vendingMachines: VendingMachine[];
  setVendingMachines: Dispatch<SetStateAction<VendingMachine[]>>;
  vendingSales: VendingSaleRecord[];
  setVendingSales: Dispatch<SetStateAction<VendingSaleRecord[]>>;
  addVendingMachine: (vmData: Omit<VendingMachine, 'id' | 'currentCoinTotal' | 'totalLifetimeSales'>) => void;
  updateVendingMachine: (id: string, updates: Partial<VendingMachine>) => void;
  deleteVendingMachine: (id: string) => void;
  removeVendingMachine: (id: string) => void;
  recordVendingCollection: (recordData: Omit<VendingSaleRecord, 'id'>) => void;

  orders: DeliveryOrder[];
  setOrders: Dispatch<SetStateAction<DeliveryOrder[]>>;
  addOrder: (orderData: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'date' | 'time'>) => DeliveryOrder;
  updateOrderStatus: (id: string, status: DeliveryStatus, assignedPersonnel?: string) => void;
  updateOrder: (id: string, updates: Partial<DeliveryOrder>) => void;
  deleteOrder: (id: string) => void;

  sales: SaleTransaction[];
  setSales: Dispatch<SetStateAction<SaleTransaction[]>>;
  recordSale: (saleData: Omit<SaleTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>) => SaleTransaction;

  containers: ContainerRecord[];
  setContainers: Dispatch<SetStateAction<ContainerRecord[]>>;
  recordContainerAction: (recordData: Omit<ContainerRecord, 'id' | 'date'>) => void;

  stockMovements: StockMovement[];
  setStockMovements: Dispatch<SetStateAction<StockMovement[]>>;
  recordStockMovement: (movementData: Omit<StockMovement, 'id' | 'date'>) => void;

  activityLogs: ActivityLog[];
  setActivityLogs: Dispatch<SetStateAction<ActivityLog[]>>;
  logActivity: (action: string, details: string, category: ActivityCategory) => void;

  settings: StationSettings;
  setSettings: Dispatch<SetStateAction<StationSettings>>;
  updateSettings: (updates: Partial<StationSettings>) => void;

  printableItem: PrintableItem | null;
  setPrintableItem: Dispatch<SetStateAction<PrintableItem | null>>;
  triggerPrint: () => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'aquaflow_users',
  CURRENT_USER_ID: 'aquaflow_current_user_id',
  CUSTOMERS: 'aquaflow_customers',
  PRODUCTS: 'aquaflow_products',
  VENDING_MACHINES: 'aquaflow_vending_machines',
  VENDING_SALES: 'aquaflow_vending_sales',
  ORDERS: 'aquaflow_orders',
  SALES: 'aquaflow_sales',
  CONTAINERS: 'aquaflow_containers',
  STOCK_MOVEMENTS: 'aquaflow_stock_movements',
  ACTIVITY_LOGS: 'aquaflow_activity_logs',
  SETTINGS: 'aquaflow_settings',
  IS_AUTHENTICATED: 'aquaflow_is_authenticated',
} as const;

function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) ? parsed : fallback) as T;
    }
    if (fallback && typeof fallback === 'object') {
      return (parsed && typeof parsed === 'object' ? { ...fallback, ...(parsed as Record<string, unknown>) } : fallback) as T;
    }
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => safeParseStorage<User[]>(STORAGE_KEYS.USERS, initialUsers));

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr-1';
    } catch {
      return 'usr-1';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const currentUser: User = users.find((u) => u.id === currentUserId) || users[0] || initialUsers[0];

  const [customers, setCustomers] = useState<Customer[]>(() => safeParseStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []));

  const [products, setProducts] = useState<Product[]>(() => safeParseStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts));

  const [vendingMachines, setVendingMachines] = useState<VendingMachine[]>(() =>
    safeParseStorage<VendingMachine[]>(STORAGE_KEYS.VENDING_MACHINES, [])
  );

  const [vendingSales, setVendingSales] = useState<VendingSaleRecord[]>(() =>
    safeParseStorage<VendingSaleRecord[]>(STORAGE_KEYS.VENDING_SALES, [])
  );

  const [orders, setOrders] = useState<DeliveryOrder[]>(() => safeParseStorage<DeliveryOrder[]>(STORAGE_KEYS.ORDERS, []));

  const [sales, setSales] = useState<SaleTransaction[]>(() => safeParseStorage<SaleTransaction[]>(STORAGE_KEYS.SALES, []));

  const [containers, setContainers] = useState<ContainerRecord[]>(() => safeParseStorage<ContainerRecord[]>(STORAGE_KEYS.CONTAINERS, []));

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    safeParseStorage<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, [])
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => safeParseStorage<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []));

  const [settings, setSettings] = useState<StationSettings>(() => safeParseStorage<StationSettings>(STORAGE_KEYS.SETTINGS, initialSettings));

  const [printableItem, setPrintableItem] = useState<PrintableItem | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDING_MACHINES, JSON.stringify(vendingMachines));
  }, [vendingMachines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENDING_SALES, JSON.stringify(vendingSales));
  }, [vendingSales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
  }, [containers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const logActivity = (action: string, details: string, category: ActivityCategory): void => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'staff',
      action,
      details,
      category,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const login = (identifier: string, password: string): AuthResult => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your username, email, or contact number.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your account password.' };
    }

    const trimmed = identifier.trim().toLowerCase();
    const cleanNumber = identifier.replace(/[^0-9]/g, '');

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === trimmed ||
        (u.email && u.email.toLowerCase() === trimmed) ||
        (cleanNumber.length >= 7 && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanNumber)
    );

    if (!user) {
      return { success: false, message: 'Account not found. Please verify your username, email, or contact number.' };
    }

    if (user.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated. Please contact station management.' };
    }

    const expectedPassword = user.password || 'password123';
    if (password !== expectedPassword) {
      return { success: false, message: 'Incorrect password. Please check your credentials.' };
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    logActivity('User Logged In', `${user.name} (${user.role.toUpperCase()}) signed in successfully`, 'system');
    return { success: true };
  };

  const loginAsCustomer = (identifier: string, password: string): AuthResult => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Please enter your customer username, email, or mobile number.' };
    }
    if (!password) {
      return { success: false, message: 'Please enter your customer password to protect account security.' };
    }

    const query = identifier.trim().toLowerCase();
    const cleanQuery = identifier.replace(/[^0-9]/g, '');

    // 1. Look for existing customer user record in users
    let custUser = users.find(
      (u) =>
        u.role === 'customer' &&
        (u.username.toLowerCase() === query ||
          (u.email && u.email.toLowerCase() === query) ||
          (cleanQuery.length >= 7 && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanQuery))
    );

    // 2. If not found in users, look in customers list
    if (!custUser) {
      const customer = customers.find(
        (c) =>
          c.id.toLowerCase() === query ||
          (c.email && c.email.toLowerCase() === query) ||
          (cleanQuery.length >= 7 && c.contactNumber && c.contactNumber.replace(/[^0-9]/g, '') === cleanQuery) ||
          c.name.toLowerCase() === query
      );

      if (!customer) {
        return {
          success: false,
          message: 'No registered customer account matches that username, email, or mobile number. Please sign up or verify spelling.',
        };
      }

      // Check if user already exists for this customer ID
      custUser = users.find((u) => u.customerId === customer.id || u.id === `usr-${customer.id}` || u.id === `cust-${customer.id}`);

      if (!custUser) {
        const createdCustUser: User = {
          id: `usr-${customer.id}`,
          customerId: customer.id,
          name: customer.name,
          username: customer.email ? customer.email.split('@')[0] : `cust_${customer.id}`,
          password: 'password123',
          role: 'customer',
          email: customer.email || '',
          phone: customer.contactNumber,
          status: 'active',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        };
        custUser = createdCustUser;
        setUsers((prev) => [...prev, createdCustUser]);
      }
    }

    if (custUser.status === 'inactive') {
      return { success: false, message: 'This customer account is currently inactive. Please contact station staff.' };
    }

    const expectedPassword = custUser.password || 'password123';
    if (password !== expectedPassword) {
      return {
        success: false,
        message: 'Incorrect password for this customer account. Password verification is required to prevent unauthorized refill orders.',
      };
    }

    setCurrentUserId(custUser.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, custUser.id);
    logActivity('Customer Signed In', `${custUser.name} authenticated into customer portal`, 'customer');
    return { success: true };
  };

  const registerUser = (userData: RegisterUserData): AuthResult => {
    const trimmedUser = userData.username.trim().toLowerCase();
    const existing = users.find((u) => u.username.toLowerCase() === trimmedUser);

    if (existing) {
      return { success: false, message: 'Username is already taken. Please choose another username.' };
    }

    const newUserId = `usr-${Date.now()}`;
    let newCustomerId: string | null = null;

    if (userData.role === 'customer') {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: userData.name,
        contactNumber: userData.phone || '0912-345-6789',
        email: userData.email || '',
        customerType: userData.customerType || 'Residential',
        primaryAddress: userData.address || 'Brgy. Enclaro, Crossing Pag-Asa',
        barangay: userData.barangay || 'Brgy. Enclaro',
        city: 'Binalbagan',
        deliveryNotes: userData.deliveryNotes || '',
        containersHeld: parseInt(String(userData.containersHeld ?? 0), 10) || 0,
        totalOrders: 0,
        totalSpent: 0,
        registeredDate: new Date().toISOString().split('T')[0],
        status: 'active',
        coordinates: userData.coordinates || {
          lat: (settings?.coordinates?.lat ?? 10.2014) + (Math.random() - 0.5) * 0.008,
          lng: (settings?.coordinates?.lng ?? 122.8601) + (Math.random() - 0.5) * 0.008,
        },
      };
      newCustomerId = newCust.id;
      setCustomers((prev) => [newCust, ...prev]);
      logActivity('Customer Profile Created', `Registered new client profile for ${newCust.name} (${newCust.barangay})`, 'customer');
    }

    const newUser: User = {
      id: newUserId,
      customerId: newCustomerId,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      email: userData.email,
      phone: userData.phone,
      avatar: userData.avatar,
      status: 'active',
      password: userData.password || 'password123',
      lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    logActivity('User Registered', `${newUser.name} created account with role ${(newUser.role || 'customer').toUpperCase()}`, 'staff');
    return { success: true };
  };

  const logout = (): void => {
    logActivity('User Logged Out', `${currentUser?.name || 'User'} signed out of system session`, 'system');
    setIsAuthenticated(false);
    localStorage.setItem('aquaflow_is_authenticated', 'false');
  };

  const setCurrentUser = (user: User): void => {
    setCurrentUserId(user.id);
    logActivity('User Switched', `Active session switched to ${user.name} (${user.role})`, 'system');
  };

  const addUser = (userData: Omit<User, 'id'>): void => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('Staff Account Created', `Created account for ${newUser.name} as ${newUser.role}`, 'staff');
  };

  const updateUser = (id: string, updates: Partial<User>): void => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logActivity('Staff Account Updated', `Updated account information for ID: ${id}`, 'staff');
  };

  const deleteUser = (id: string): void => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Staff Account Deactivated', `Removed account ${target?.name || id}`, 'staff');
  };

  const addCustomer = (
    custData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'registeredDate'>
  ): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      containersHeld: custData.containersHeld ?? 0,
      totalOrders: 0,
      totalSpent: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      status: custData.status || 'active',
    };
    setCustomers((prev) => [newCust, ...prev]);
    logActivity('Customer Registered', `Registered customer: ${newCust.name} (${newCust.customerType})`, 'customer');
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>): void => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logActivity('Customer Updated', `Updated profile for ${updates.name || id}`, 'customer');
  };

  const deleteCustomer = (id: string): void => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('Customer Removed', `Deleted customer record: ${target?.name || id}`, 'customer');
  };

  const addProduct = (prodData: Omit<Product, 'id'>): void => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
    logActivity('Product Added', `Added product: ${newProd.name} (₱${newProd.price})`, 'inventory');
  };

  const updateProduct = (id: string, updates: Partial<Product>): void => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logActivity('Product Updated', `Updated product details/pricing for ${updates.name || id}`, 'inventory');
  };

  const deleteProduct = (id: string): void => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Product Removed', `Deleted product: ${target?.name || id}`, 'inventory');
  };

  const addVendingMachine = (
    vmData: Omit<VendingMachine, 'id' | 'currentCoinTotal' | 'totalLifetimeSales'>
  ): void => {
    const newVm: VendingMachine = {
      ...vmData,
      id: `vm-${Date.now()}`,
      currentCoinTotal: 0,
      totalLifetimeSales: 0,
    };
    setVendingMachines((prev) => [...prev, newVm]);
    logActivity('Vending Machine Added', `Installed vending station: ${newVm.name} at ${newVm.locationName}`, 'vending');
  };

  const updateVendingMachine = (id: string, updates: Partial<VendingMachine>): void => {
    setVendingMachines((prev) => prev.map((vm) => (vm.id === id ? { ...vm, ...updates } : vm)));
    logActivity('Vending Machine Updated', `Updated machine status/data: ${updates.name || id}`, 'vending');
  };

  const deleteVendingMachine = (id: string): void => {
    const target = vendingMachines.find((vm) => vm.id === id);
    setVendingMachines((prev) => prev.filter((vm) => vm.id !== id));
    logActivity('Vending Machine Removed', `Decommissioned vending unit: ${target?.name || id}`, 'vending');
  };

  const recordVendingCollection = (recordData: Omit<VendingSaleRecord, 'id'>): void => {
    const newRecord: VendingSaleRecord = {
      ...recordData,
      id: `vs-${Date.now()}`,
    };
    setVendingSales((prev) => [newRecord, ...prev]);

    setVendingMachines((prev) =>
      prev.map((vm) => {
        if (vm.id === recordData.machineId) {
          const coins = recordData.coinsCollected || 0;
          const dispensed = recordData.waterDispensedLiters || 0;
          const capacity = vm.waterCapacityLiters || 500;
          const newLifetime = (vm.totalLifetimeSales || 0) + coins;
          let newWaterLevel = (vm.currentWaterLevelLiters || 0) - dispensed;
          if (recordData.waterRefilledLiters) {
            newWaterLevel = Math.min(capacity, newWaterLevel + recordData.waterRefilledLiters);
          }
          const newStatus = newWaterLevel < 200 ? 'low_water' : 'operational';
          return {
            ...vm,
            currentCoinTotal: 0,
            totalLifetimeSales: newLifetime,
            currentWaterLevelLiters: Math.max(0, newWaterLevel),
            status: newStatus,
            lastCollectionDate: recordData.date,
          };
        }
        return vm;
      })
    );

    const now = new Date();
    const collectedCoins = recordData.coinsCollected || 0;
    const dispensedLiters = recordData.waterDispensedLiters || 0;
    const consTx: SaleTransaction = {
      id: `tx-vnd-${Date.now()}`,
      transactionNumber: `TX-VND-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      date: recordData.date,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      customerName: `Vending Collection: ${recordData.machineName}`,
      orderType: 'walkin',
      items: [
        {
          productId: 'vending-water',
          productName: `Vending Dispensed (${dispensedLiters} L)`,
          quantity: dispensedLiters,
          unitPrice: collectedCoins / (dispensedLiters || 1),
          unit: 'L',
          isWater: true,
          total: collectedCoins,
        },
      ],
      subtotal: collectedCoins,
      discount: 0,
      deliveryFee: 0,
      containerDeposit: 0,
      totalAmount: collectedCoins,
      amountPaid: collectedCoins,
      change: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      staffName: recordData.recordedBy,
      isVendingMachineConsolidated: true,
      vendingMachineId: recordData.machineId,
      notes: recordData.notes || `Daily vending collection for ${recordData.machineName}`,
    };
    setSales((prev) => [consTx, ...prev]);

    logActivity(
      'Vending Machine Collection',
      `Collected ₱${collectedCoins.toLocaleString()} from ${recordData.machineName} (${dispensedLiters}L dispensed)`,
      'vending'
    );
  };

  const addOrder = (orderData: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'date' | 'time'>): DeliveryOrder => {
    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: DeliveryOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) => [newOrder, ...prev]);

    if (orderData.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === orderData.customerId
            ? {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                totalSpent: (c.totalSpent || 0) + (orderData.totalAmount || 0),
              }
            : c
        )
      );
    }

    logActivity(
      'Order Created',
      `Order ${orderNumber} created for ${orderData.customerName} (${orderData.orderType}) - ₱${orderData.totalAmount || 0}`,
      'delivery'
    );
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: DeliveryStatus, assignedPersonnel?: string): void => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id) {
          const updates: Partial<DeliveryOrder> = { status };
          if (assignedPersonnel) {
            updates.assignedPersonnel = assignedPersonnel;
          }
          if (status === 'Delivered') {
            updates.deliveredAt = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
            updates.paymentStatus = 'paid';
          }
          return { ...ord, ...updates };
        }
        return ord;
      })
    );

    const order = orders.find((o) => o.id === id);
    logActivity('Delivery Status Updated', `Order ${order?.orderNumber || id} updated to ${status}`, 'delivery');
  };

  const updateOrder = (id: string, updates: Partial<DeliveryOrder>): void => {
    setOrders((prev) => prev.map((ord) => (ord.id === id ? { ...ord, ...updates } : ord)));
    logActivity('Order Modified', `Order details updated for ID: ${id}`, 'delivery');
  };

  const deleteOrder = (id: string): void => {
    const target = orders.find((o) => o.id === id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    logActivity('Order Cancelled/Deleted', `Removed order ${target?.orderNumber || id}`, 'delivery');
  };

  const recordSale = (saleData: Omit<SaleTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>): SaleTransaction => {
    const now = new Date();
    const transactionNumber = `TX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(sales.length + 1).padStart(3, '0')}`;
    const saleItems = Array.isArray(saleData.items) ? saleData.items : [];
    const totalAmount = saleData.totalAmount || 0;
    const paymentMethod = saleData.paymentMethod || 'cash';
    const newSale: SaleTransaction = {
      ...saleData,
      items: saleItems,
      totalAmount,
      paymentMethod,
      id: `tx-${Date.now()}`,
      transactionNumber,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setSales((prev) => [newSale, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        const purchasedQty = saleItems
          .filter((item) => item.productId === p.id)
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
        if (purchasedQty > 0) {
          return { ...p, stock: Math.max(0, (p.stock || 0) - purchasedQty) };
        }
        return p;
      })
    );

    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                totalSpent: (c.totalSpent || 0) + totalAmount,
              }
            : c
        )
      );
    }

    logActivity(
      'Sale Recorded',
      `Sale ${transactionNumber} for ${saleData.customerName} - Total: ₱${totalAmount.toLocaleString()} (${paymentMethod.toUpperCase()})`,
      'sales'
    );

    return newSale;
  };

  const recordContainerAction = (recordData: Omit<ContainerRecord, 'id' | 'date'>): void => {
    const newRecord: ContainerRecord = {
      ...recordData,
      id: `cnt-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setContainers((prev) => [newRecord, ...prev]);

    if (recordData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === recordData.customerId) {
            let change = 0;
            if (recordData.actionType === 'borrow') change = recordData.quantity || 0;
            if (recordData.actionType === 'return') change = -(recordData.quantity || 0);
            return { ...c, containersHeld: Math.max(0, (c.containersHeld || 0) + change) };
          }
          return c;
        })
      );
    }

    logActivity(
      'Container Tracked',
      `${(recordData.actionType || 'borrow').toUpperCase()}: ${recordData.quantity}x ${recordData.containerType} by ${recordData.customerName}`,
      'container'
    );
  };

  const recordStockMovement = (movementData: Omit<StockMovement, 'id' | 'date'>): void => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `sm-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === movementData.productId) {
          return { ...p, stock: movementData.newStock };
        }
        return p;
      })
    );

    logActivity(
      'Inventory Stock Movement',
      `${(movementData.movementType || 'adjustment').toUpperCase()}: ${movementData.productName} by ${movementData.quantity} (New stock: ${movementData.newStock})`,
      'inventory'
    );
  };

  const updateSettings = (updates: Partial<StationSettings>): void => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logActivity('Station Settings Updated', 'System parameters, pricing or contact info updated', 'system');
  };

  const triggerPrint = (): void => {
    window.print();
  };

  const resetToDefaultData = (): void => {
    setUsers(initialUsers);
    setCurrentUserId('usr-1');
    setCustomers(initialCustomers);
    setProducts(initialProducts);
    setVendingMachines(initialVendingMachines);
    setVendingSales(initialVendingSales);
    setOrders(initialOrders);
    setSales(initialSales);
    setContainers(initialContainers);
    setStockMovements(initialStockMovements);
    setActivityLogs(initialActivityLogs);
    setSettings(initialSettings);
    logActivity('System Reset', 'All records reloaded to default sample dataset', 'system');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAsCustomer,
        registerUser,
        logout,

        currentUser,
        users,
        setUsers,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,

        customers,
        setCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,

        vendingMachines,
        setVendingMachines,
        vendingSales,
        setVendingSales,
        addVendingMachine,
        updateVendingMachine,
        deleteVendingMachine,
        removeVendingMachine: deleteVendingMachine,
        recordVendingCollection,

        orders,
        setOrders,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,

        sales,
        setSales,
        recordSale,

        containers,
        setContainers,
        recordContainerAction,

        stockMovements,
        setStockMovements,
        recordStockMovement,

        activityLogs,
        setActivityLogs,
        logActivity,

        settings,
        setSettings,
        updateSettings,

        printableItem,
        setPrintableItem,
        triggerPrint,

        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
