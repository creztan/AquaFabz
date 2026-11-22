export type UserRole = 'admin' | 'staff' | 'delivery' | 'customer';
export type UserStatus = 'active' | 'inactive';
export type CustomerType = 'Residential' | 'Commercial' | 'Eatery' | 'School/Institution' | 'Institutional';
export type ProductCategory = 'refill' | 'bottle' | 'container' | 'accessory' | 'supplies';
export type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'credit';
export type PaymentStatus = 'paid' | 'pending' | 'partially_paid' | 'unpaid';
export type OrderType = 'delivery' | 'pickup' | 'walkin';
export type DeliveryStatus = 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type VendingStatus = 'operational' | 'offline' | 'maintenance' | 'low_water';
export type ContainerActionType = 'borrow' | 'return' | 'damaged';
export type ContainerRecordStatus = 'active' | 'cleared' | 'scrapped';
export type ContainerType = '5-Gallon Slim' | '5-Gallon Round' | 'Other';
export type StockMovementType = 'stock_in' | 'stock_out' | 'spillage' | 'adjustment';
export type ActivityCategory = 'system' | 'sales' | 'delivery' | 'inventory' | 'container' | 'vending' | 'staff' | 'customer';
export type ComplianceLogType = 'doh_water_quality' | 'container_sanitization' | 'lgu_sales_register';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending';

export const USER_ROLES: readonly UserRole[] = ['admin', 'staff', 'delivery', 'customer'] as const;
export const CUSTOMER_TYPES: readonly CustomerType[] = ['Residential', 'Commercial', 'Eatery', 'School/Institution', 'Institutional'] as const;
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = ['refill', 'bottle', 'container', 'accessory', 'supplies'] as const;
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash', 'gcash', 'bank_transfer', 'credit'] as const;
export const PAYMENT_STATUSES: readonly PaymentStatus[] = ['paid', 'pending', 'partially_paid', 'unpaid'] as const;
export const DELIVERY_STATUSES: readonly DeliveryStatus[] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StationSettings {
  stationName: string;
  tagline: string;
  branchName: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  coordinates: Coordinates;
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

export interface User {
  id: string;
  customerId?: string | null;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  email?: string;
  phone?: string;
  status: UserStatus;
  avatar?: string;
  lastLogin?: string;
}

export interface AdditionalLocation {
  id: string;
  label: string;
  address: string;
  barangay: string;
  city: string;
  lat: number;
  lng: number;
  deliveryNotes?: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  customerType: CustomerType;
  primaryAddress: string;
  barangay: string;
  city?: string;
  coordinates: Coordinates;
  deliveryNotes?: string;
  containersHeld: number;
  totalOrders: number;
  totalSpent: number;
  registeredDate: string;
  status: UserStatus;
  additionalLocations?: AdditionalLocation[];
}

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
  coordinates: Coordinates;
  waterCapacityLiters: number;
  currentWaterLevelLiters: number;
  coinCapacity: number;
  currentCoinTotal: number;
  pricePerLiter: number;
  totalLifetimeSales: number;
  status: VendingStatus;
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

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  isWater: boolean;
  requiresContainerSwap?: boolean;
  total: number;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  barangay: string;
  coordinates: Coordinates;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  status: DeliveryStatus;
  assignedPersonnel?: string;
  deliveryVehicle?: string;
  requestedSchedule: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  containersToReturnCount: number;
  containersReturnedCount?: number;
}

export interface SaleTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  time: string;
  customerId?: string;
  customerName: string;
  customerType?: CustomerType;
  orderType: OrderType;
  items: OrderItem[];
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
  isVendingMachineConsolidated?: boolean;
  vendingMachineId?: string;
  notes?: string;
}

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
  status: ContainerRecordStatus;
  notes?: string;
  staffName: string;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  movementType: StockMovementType;
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
  category: ActivityCategory;
}

export interface ComplianceLog {
  id: string;
  date: string;
  logType: ComplianceLogType;
  parameterName: string;
  recordedValue: string;
  inspectorOrStaff: string;
  status: ComplianceStatus;
  notes?: string;
}

export interface ReportMetric {
  label: string;
  value: string | number;
}

export interface ReportData {
  title: string;
  metrics: ReportMetric[];
}

export type PrintableItem =
  | { type: 'receipt'; data: SaleTransaction }
  | { type: 'order'; data: DeliveryOrder }
  | { type: 'vending'; data: VendingSaleRecord }
  | { type: 'report'; data: ReportData };

export interface AuthResult {
  success: boolean;
  message?: string;
}

export interface RegisterUserData {
  name: string;
  username: string;
  role: UserRole;
  email?: string;
  phone?: string;
  address?: string;
  barangay?: string;
  customerType?: CustomerType;
  containersHeld?: number | string;
  deliveryNotes?: string;
  password?: string;
  status?: UserStatus;
  avatar?: string;
  coordinates?: Coordinates;
}
