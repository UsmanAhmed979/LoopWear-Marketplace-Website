/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "customer" | "seller" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  joinedAt: string;
  avatar: string;
  status: "active" | "suspended";
  earnings?: number; // For Sellers
  salesCount?: number; // For Sellers
}

export type ProductCondition = "Like New" | "Gently Used" | "Worn";

export type ProductStatus = "pending" | "approved" | "rejected";

export interface Product {
  id: string;
  name: string;
  price: number; // Max PKR 8000
  brand: string;
  category: string; // e.g. "Shirts", "Pants", "Jackets", "Hoodies", "Shoes", "Bags", "Accessories"
  size: string;
  condition: ProductCondition;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  isFeatured?: boolean;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";
export type PaymentMethod = "Cash on Delivery" | "Credit/Debit Card";
export type PaymentStatus = "pending" | "paid";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  sellerId: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  deliveryAddress: string;
  city: string;
  phoneNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  customerId: string;
  customerName: string;
  productName: string;
  productPrice: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "return" | "message" | "system";
  read: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeListings: number;
  salesVolume: number;
  revenue: number;
  commission: number; // platform admin cuts
}
