// ============================================================
// API TYPES
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    stock: number;
    isActive: boolean;
  };
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  count: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  productName: string;
  productImage: string | null;
  productId: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  receiptUrl?: string;
  senderName?: string;
  transactionCode?: string;
  paymentPhone?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  _count?: {
    orders: number;
    wishlist: number;
    addresses: number;
  };
}

export interface Address {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

// ============================================================
// ADMIN TYPES
// ============================================================

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
}

export interface StoreSettings {
  storeName?: string;
  storeTagline?: string;
  logo?: string;
  banner?: string[];
  currency?: { symbol: string; code: string };
  contactEmail?: string;
  contactPhone?: string;
  shippingMethods?: Array<{ name: string; price: number; description: string }>;
  paymentMethods?: Array<{ id: string; name: string; enabled: boolean }>;
  [key: string]: any;
}

export interface CloudinaryImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}
