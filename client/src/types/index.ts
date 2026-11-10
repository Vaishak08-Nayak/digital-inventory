export type Role = 'OWNER' | 'STAFF' | 'CUSTOMER';
export type StockStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_DELIVERY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type TransactionType = 'STOCK_IN' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'ARCHIVED' | 'RESTORED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  businessId?: string;
  businessName?: string;
  isEmailVerified: boolean;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  businessType: string;
  logoUrl?: string;
  description?: string;
  currency: string;
  lowStockThreshold: number;
  taxRate: number;
  members?: any[];
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  nameKn?: string;
  brand?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  groceryType?: string;
  unitType: string;
  isLooseItem: boolean;
  supplier?: string;
  description?: string;
  imageUrl?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  reorderLevel: number;
  stockStatus: StockStatus;
  isArchived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  receivedAt: string;
}

export interface Order {
  id: string;
  businessId: string;
  customerId?: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryDate?: string;
  deliveryDeadline?: string;
  deliveryNotes?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items: OrderItem[];
  payments: Payment[];
  isOverdue?: boolean;
  remainingMinutes?: number | null;
}

export interface Customer {
  id: string;
  businessId: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpending: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdAt: string;
  frequentProducts?: { productId: string; name: string; count: number; totalQty: number }[];
  orders?: Order[];
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: TransactionType;
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  product?: { id: string; name: string; nameKn?: string; unitType: string; barcode?: string };
  performedBy?: { name: string; email: string };
}

export interface Offer {
  id: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startDate: string;
  endDate: string;
  eligibleCategories: string[];
  eligibleProducts: string[];
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}
