export type UserRole = 'admin' | 'staff' | 'delivery' | 'customer';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  lastLogin?: string;
  password?: string;
}

export type CustomerType = 'Residential' | 'Commercial' | 'Eatery' | 'School/Institution';

export interface CustomerLocation {
  id: string;
  label: string; // e.g. "Main House", "Branch 2", "Kitchen Entrance"
  address: string;
  barangay: string;
  city: string;
  lat: number;
  lng: number;
  deliveryNotes?: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  customerType: CustomerType;
  primaryAddress: string;
  barangay: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  additionalLocations?: CustomerLocation[];
  deliveryNotes?: string;
  containersHeld: number; // current borrowed / deposit containers
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: 'active' | 'inactive';
}

export type ProductCategory = 'refill' | 'bottle' | 'container' | 'accessory' | 'supplies';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  isWater: boolean;
  description: string;
  requiresContainerSwap?: boolean;
}

export interface VendingMachine {
  id: string;
  code: string;
  name: string;
  locationName: string;
  barangay: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  waterCapacityLiters: number;
  currentWaterLevelLiters: number;
  coinCapacity: number;
  currentCoinTotal: number;
  pricePerLiter: number;
  totalLifetimeSales: number;
  status: 'operational' | 'low_water' | 'maintenance' | 'offline';
  lastServiced: string;
  lastCollectionDate: string;
  notes?: string;
}

export interface VendingSaleRecord {
  id: string;
  machineId: string;
  machineName: string;
  date: string;
  coinsCollected: number;
  waterDispensedLiters: number;
  meterReadingStart?: number;
  meterReadingEnd?: number;
  waterRefilledLiters?: number;
  recordedBy: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'credit';
export type PaymentStatus = 'paid' | 'pending' | 'partially_paid' | 'unpaid';
export type OrderType = 'walkin' | 'delivery' | 'pickup';
export type DeliveryStatus = 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  isWater: boolean;
  requiresContainerSwap?: boolean;
  total: number;
}

export interface SalesTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  time: string;
  customerId?: string;
  customerName: string;
  customerType?: CustomerType;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  containerDeposit: number;
  totalAmount: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  staffName: string;
  notes?: string;
  isVendingMachineConsolidated?: boolean;
  vendingMachineId?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  barangay: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderType: 'delivery' | 'pickup';
  status: DeliveryStatus;
  assignedPersonnel?: string;
  deliveryVehicle?: string;
  requestedSchedule: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  cancelledReason?: string;
  containersToReturnCount: number;
  containersReturnedCount?: number;
}

export type ContainerType = '5-Gallon Slim' | '5-Gallon Round' | 'Other';
export type ContainerActionType = 'borrow' | 'return' | 'damaged' | 'customer_owned_refill' | 'new_purchase';

export interface ContainerRecord {
  id: string;
  date: string;
  customerId?: string;
  customerName: string;
  containerType: ContainerType;
  actionType: ContainerActionType;
  quantity: number;
  depositAmount: number;
  refundAmount?: number;
  status: 'active' | 'cleared' | 'scrapped';
  notes?: string;
  staffName: string;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  movementType: 'stock_in' | 'stock_out' | 'sales_deduction' | 'spillage' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNo?: string;
  supplierOrParty?: string;
  staffName: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'sales' | 'inventory' | 'customer' | 'delivery' | 'vending' | 'staff' | 'container' | 'system';
}

export interface StationSettings {
  stationName: string;
  tagline: string;
  branchName: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  contactNumber: string;
  email: string;
  businessPermitNo: string;
  dohAccreditationNo: string;
  currencySymbol: string;
  defaultDeliveryFee: number;
  defaultContainerDeposit: number;
  taxRatePercent: number;
  waterSourceDescription: string;
}

export interface ComplianceLog {
  id: string;
  date: string;
  logType: 'doh_water_quality' | 'container_sanitization' | 'lgu_sales_register';
  parameterName: string;
  recordedValue: string;
  inspectorOrStaff: string;
  status: 'compliant' | 'requires_action';
  notes?: string;
}
