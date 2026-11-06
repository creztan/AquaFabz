import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Customer,
  Product,
  VendingMachine,
  VendingSaleRecord,
  SalesTransaction,
  DeliveryOrder,
  ContainerRecord,
  StockMovement,
  ActivityLog,
  StationSettings,
  DeliveryStatus,
} from '../types';
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

interface AppContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  loginAsCustomer: (customerIdOrPhone: string) => { success: boolean; message?: string };
  registerUser: (userData: Omit<User, 'id'>) => { success: boolean; message?: string };
  logout: () => void;

  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'containersHeld' | 'totalOrders' | 'totalSpent' | 'registeredDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  vendingMachines: VendingMachine[];
  vendingSales: VendingSaleRecord[];
  addVendingMachine: (vm: Omit<VendingMachine, 'id' | 'currentCoinTotal' | 'totalLifetimeSales'>) => void;
  updateVendingMachine: (id: string, updates: Partial<VendingMachine>) => void;
  recordVendingCollection: (record: Omit<VendingSaleRecord, 'id'>) => void;

  orders: DeliveryOrder[];
  addOrder: (order: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'date' | 'time'>) => DeliveryOrder;
  updateOrderStatus: (id: string, status: DeliveryStatus, assignedPersonnel?: string) => void;
  updateOrder: (id: string, updates: Partial<DeliveryOrder>) => void;
  deleteOrder: (id: string) => void;

  sales: SalesTransaction[];
  recordSale: (sale: Omit<SalesTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>) => SalesTransaction;

  containers: ContainerRecord[];
  recordContainerAction: (record: Omit<ContainerRecord, 'id' | 'date'>) => void;

  stockMovements: StockMovement[];
  recordStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;

  activityLogs: ActivityLog[];
  logActivity: (action: string, details: string, category: ActivityLog['category']) => void;

  settings: StationSettings;
  updateSettings: (updates: Partial<StationSettings>) => void;

  printableItem: { type: 'receipt' | 'order' | 'report' | 'vending'; data: any } | null;
  setPrintableItem: (item: { type: 'receipt' | 'order' | 'report' | 'vending'; data: any } | null) => void;
  triggerPrint: () => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr-1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If not set yet, default to false so user sees login screen
    const stored = localStorage.getItem('aquaflow_is_authenticated');
    return stored === 'true';
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || initialUsers[0];

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [vendingMachines, setVendingMachines] = useState<VendingMachine[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDING_MACHINES);
    return saved ? JSON.parse(saved) : initialVendingMachines;
  });

  const [vendingSales, setVendingSales] = useState<VendingSaleRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDING_SALES);
    return saved ? JSON.parse(saved) : initialVendingSales;
  });

  const [orders, setOrders] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [sales, setSales] = useState<SalesTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [containers, setContainers] = useState<ContainerRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return saved ? JSON.parse(saved) : initialContainers;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    return saved ? JSON.parse(saved) : initialStockMovements;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [settings, setSettings] = useState<StationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [printableItem, setPrintableItem] = useState<{ type: 'receipt' | 'order' | 'report' | 'vending'; data: any } | null>(null);

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

  const logActivity = (action: string, details: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      category,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const login = (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const user = users.find((u) => u.username.toLowerCase() === trimmedUser);

    if (!user) {
      return { success: false, message: 'Username not found. Please register or check your spelling.' };
    }

    if (user.status === 'inactive') {
      return { success: false, message: 'This staff account has been deactivated. Please contact the administrator.' };
    }

    const expectedPassword = user.password || 'password123';
    if (password !== expectedPassword) {
      return { success: false, message: 'Incorrect password. (Default is password123)' };
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    logActivity('User Logged In', `${user.name} (${user.role.toUpperCase()}) signed in successfully`, 'system');
    return { success: true };
  };

  const loginAsCustomer = (customerIdOrPhone: string) => {
    const query = customerIdOrPhone.trim().toLowerCase();
    const customer = customers.find(
      (c) =>
        c.id === query ||
        c.contactNumber.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
        c.name.toLowerCase().includes(query)
    );

    if (!customer) {
      return { success: false, message: 'Customer account not found. Please verify name or contact number.' };
    }

    const customerUserId = `cust-${customer.id}`;
    let custUser = users.find((u) => u.id === customerUserId);

    if (!custUser) {
      custUser = {
        id: customerUserId,
        name: customer.name,
        username: customer.contactNumber.replace(/[^0-9]/g, '') || `customer_${customer.id}`,
        role: 'customer',
        email: customer.email || '',
        phone: customer.contactNumber,
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      };
      setUsers((prev) => [...prev, custUser!]);
    }

    setCurrentUserId(custUser.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, custUser.id);
    logActivity('Customer Signed In', `${customer.name} (Client Portal) accessed water account`, 'customer');
    return { success: true };
  };

  const registerUser = (userData: Omit<User, 'id'>) => {
    const trimmedUser = userData.username.trim().toLowerCase();
    const existing = users.find((u) => u.username.toLowerCase() === trimmedUser);

    if (existing) {
      return { success: false, message: 'Username is already taken. Please choose another username.' };
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'active',
      password: userData.password || 'password123',
      lastLogin: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    localStorage.setItem('aquaflow_is_authenticated', 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    logActivity('User Registered', `${newUser.name} created account with role ${newUser.role.toUpperCase()}`, 'staff');
    return { success: true };
  };

  const logout = () => {
    logActivity('User Logged Out', `${currentUser.name} signed out of system session`, 'system');
    setIsAuthenticated(false);
    localStorage.setItem('aquaflow_is_authenticated', 'false');
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserId(user.id);
    logActivity('User Switched', `Active session switched to ${user.name} (${user.role})`, 'system');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('Staff Account Created', `Created account for ${newUser.name} as ${newUser.role}`, 'staff');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logActivity('Staff Account Updated', `Updated account information for ID: ${id}`, 'staff');
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Staff Account Deactivated', `Removed account ${target?.name || id}`, 'staff');
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'containersHeld' | 'totalOrders' | 'totalSpent' | 'registeredDate'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      containersHeld: 0,
      totalOrders: 0,
      totalSpent: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setCustomers((prev) => [newCust, ...prev]);
    logActivity('Customer Registered', `Registered customer: ${newCust.name} (${newCust.customerType})`, 'customer');
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logActivity('Customer Updated', `Updated profile for ${updates.name || id}`, 'customer');
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    logActivity('Customer Removed', `Deleted customer record: ${target?.name || id}`, 'customer');
  };

  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [...prev, newProd]);
    logActivity('Product Added', `Added product: ${newProd.name} (₱${newProd.price})`, 'inventory');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logActivity('Product Updated', `Updated product details/pricing for ${updates.name || id}`, 'inventory');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Product Removed', `Deleted product: ${target?.name || id}`, 'inventory');
  };

  const addVendingMachine = (vmData: Omit<VendingMachine, 'id' | 'currentCoinTotal' | 'totalLifetimeSales'>) => {
    const newVm: VendingMachine = {
      ...vmData,
      id: `vm-${Date.now()}`,
      currentCoinTotal: 0,
      totalLifetimeSales: 0,
    };
    setVendingMachines((prev) => [...prev, newVm]);
    logActivity('Vending Machine Added', `Installed vending station: ${newVm.name} at ${newVm.locationName}`, 'vending');
  };

  const updateVendingMachine = (id: string, updates: Partial<VendingMachine>) => {
    setVendingMachines((prev) => prev.map((vm) => (vm.id === id ? { ...vm, ...updates } : vm)));
    logActivity('Vending Machine Updated', `Updated machine status/data: ${updates.name || id}`, 'vending');
  };

  const recordVendingCollection = (recordData: Omit<VendingSaleRecord, 'id'>) => {
    const newRecord: VendingSaleRecord = {
      ...recordData,
      id: `vs-${Date.now()}`,
    };
    setVendingSales((prev) => [newRecord, ...prev]);

    // Update Vending Machine counters
    setVendingMachines((prev) =>
      prev.map((vm) => {
        if (vm.id === recordData.machineId) {
          const newLifetime = vm.totalLifetimeSales + recordData.coinsCollected;
          let newWaterLevel = vm.currentWaterLevelLiters - recordData.waterDispensedLiters;
          if (recordData.waterRefilledLiters) {
            newWaterLevel = Math.min(vm.waterCapacityLiters, newWaterLevel + recordData.waterRefilledLiters);
          }
          const newStatus = newWaterLevel < 200 ? 'low_water' : 'operational';
          return {
            ...vm,
            currentCoinTotal: 0, // collected
            totalLifetimeSales: newLifetime,
            currentWaterLevelLiters: Math.max(0, newWaterLevel),
            status: newStatus,
            lastCollectionDate: recordData.date,
          };
        }
        return vm;
      })
    );

    // Consolidated sale transaction added to daily sales total as requested in proposal:
    // "The system also supports vending machines owned by the station; sales made through each machine are recorded and automatically added to the station's daily and overall sales total."
    const now = new Date();
    const consTx: SalesTransaction = {
      id: `tx-vnd-${Date.now()}`,
      transactionNumber: `TX-VND-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      date: recordData.date,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      customerName: `Vending Collection: ${recordData.machineName}`,
      orderType: 'walkin',
      items: [
        {
          productId: 'vending-water',
          productName: `Vending Dispensed (${recordData.waterDispensedLiters} L)`,
          quantity: recordData.waterDispensedLiters,
          unitPrice: recordData.coinsCollected / (recordData.waterDispensedLiters || 1),
          unit: 'L',
          isWater: true,
          total: recordData.coinsCollected,
        },
      ],
      subtotal: recordData.coinsCollected,
      discount: 0,
      deliveryFee: 0,
      containerDeposit: 0,
      totalAmount: recordData.coinsCollected,
      amountPaid: recordData.coinsCollected,
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
      `Collected ₱${recordData.coinsCollected.toLocaleString()} from ${recordData.machineName} (${recordData.waterDispensedLiters}L dispensed)`,
      'vending'
    );
  };

  const addOrder = (orderData: Omit<DeliveryOrder, 'id' | 'orderNumber' | 'date' | 'time'>) => {
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

    // Update customer stats
    if (orderData.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === orderData.customerId
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + orderData.totalAmount,
              }
            : c
        )
      );
    }

    logActivity(
      'Order Created',
      `Order ${orderNumber} created for ${orderData.customerName} (${orderData.orderType}) - ₱${orderData.totalAmount}`,
      'delivery'
    );
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: DeliveryStatus, assignedPersonnel?: string) => {
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

  const updateOrder = (id: string, updates: Partial<DeliveryOrder>) => {
    setOrders((prev) => prev.map((ord) => (ord.id === id ? { ...ord, ...updates } : ord)));
    logActivity('Order Modified', `Order details updated for ID: ${id}`, 'delivery');
  };

  const deleteOrder = (id: string) => {
    const target = orders.find((o) => o.id === id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    logActivity('Order Cancelled/Deleted', `Removed order ${target?.orderNumber || id}`, 'delivery');
  };

  const recordSale = (saleData: Omit<SalesTransaction, 'id' | 'transactionNumber' | 'date' | 'time'>) => {
    const now = new Date();
    const transactionNumber = `TX-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(sales.length + 1).padStart(3, '0')}`;
    const newSale: SalesTransaction = {
      ...saleData,
      id: `tx-${Date.now()}`,
      transactionNumber,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct stock for inventory items sold
    saleData.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.productId) {
            const newStock = Math.max(0, p.stock - item.quantity);
            return { ...p, stock: newStock };
          }
          return p;
        })
      );
    });

    // Update customer stats if customer attached
    if (saleData.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === saleData.customerId
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + saleData.totalAmount,
              }
            : c
        )
      );
    }

    logActivity(
      'Sale Recorded',
      `Sale ${transactionNumber} for ${saleData.customerName} - Total: ₱${saleData.totalAmount.toLocaleString()} (${saleData.paymentMethod.toUpperCase()})`,
      'sales'
    );

    return newSale;
  };

  const recordContainerAction = (recordData: Omit<ContainerRecord, 'id' | 'date'>) => {
    const newRecord: ContainerRecord = {
      ...recordData,
      id: `cnt-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setContainers((prev) => [newRecord, ...prev]);

    // Update customer container balance if applicable
    if (recordData.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === recordData.customerId) {
            let change = 0;
            if (recordData.actionType === 'borrow') change = recordData.quantity;
            if (recordData.actionType === 'return') change = -recordData.quantity;
            return { ...c, containersHeld: Math.max(0, c.containersHeld + change) };
          }
          return c;
        })
      );
    }

    logActivity(
      'Container Tracked',
      `${recordData.actionType.toUpperCase()}: ${recordData.quantity}x ${recordData.containerType} by ${recordData.customerName}`,
      'container'
    );
  };

  const recordStockMovement = (movementData: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `sm-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    // Update product stock level
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
      `${movementData.movementType.toUpperCase()}: ${movementData.productName} by ${movementData.quantity} (New stock: ${movementData.newStock})`,
      'inventory'
    );
  };

  const updateSettings = (updates: Partial<StationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logActivity('Station Settings Updated', 'System parameters, pricing or contact info updated', 'system');
  };

  const triggerPrint = () => {
    window.print();
  };

  const resetToDefaultData = () => {
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
    localStorage.clear();
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
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,

        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,

        products,
        addProduct,
        updateProduct,
        deleteProduct,

        vendingMachines,
        vendingSales,
        addVendingMachine,
        updateVendingMachine,
        recordVendingCollection,

        orders,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,

        sales,
        recordSale,

        containers,
        recordContainerAction,

        stockMovements,
        recordStockMovement,

        activityLogs,
        logActivity,

        settings,
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
