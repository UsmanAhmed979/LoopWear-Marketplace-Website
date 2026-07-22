/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { User, Product, Order, Review, ReturnRequest, Notification } from "../src/types.ts";

const DB_DIR = path.join(process.cwd(), "server", "data");
const DB_FILE = path.join(DB_DIR, "store.json");

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  returns: ReturnRequest[];
  notifications: Notification[];
}

const PRESEEDED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Classic Plaid Vintage Flannel Shirt",
    price: 1850,
    brand: "Outfitters",
    category: "Shirts",
    size: "M",
    condition: "Gently Used",
    description: "Super soft vintage grunge plaid shirt in excellent vintage condition. Pre-shrunk, cozy cotton flannel. Retro vibe perfect for layering over a graphic tee.",
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller",
    sellerName: "Vintage Vault PK",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: "prod-2",
    name: "Regular Fit Distressed Denim Jeans",
    price: 2400,
    brand: "Levi's",
    category: "Pants",
    size: "32",
    condition: "Like New",
    description: "Authentic Levi's distressed denim jeans. No visible signs of wear. High-quality thick denim that lasts a lifetime. Pocket lining is pristine.",
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller",
    sellerName: "Vintage Vault PK",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: "prod-3",
    name: "Oversized College Varsity Hoodie",
    price: 3200,
    brand: "Adidas",
    category: "Hoodies",
    size: "L",
    condition: "Like New",
    description: "Extremely clean oversized hoodie. Fleece interior is still soft and unpilled. Beautiful embroidered typography detail on frontend.",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller",
    sellerName: "Vintage Vault PK",
    stock: 2,
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Air Max Retro Colorblock Sneakers",
    price: 5800,
    brand: "Nike",
    category: "Shoes",
    size: "10 US",
    condition: "Gently Used",
    description: "Restored thrift find. Soles have minimal wear, deep-cleaned air bubble module. Striking neon and gray accents. Shipped with standard replacement box.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller-2",
    sellerName: "Kicks & Threads",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: "prod-5",
    name: "Classic Chestnut Leather Handbag",
    price: 4500,
    brand: "Thrift Premium",
    category: "Bags",
    size: "Medium",
    condition: "Gently Used",
    description: "Genuine structured leather shoulder bag with brass snap features. Gorgeous patina with light surface aging on bottom corners supporting thrift authenticity.",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller-2",
    sellerName: "Kicks & Threads",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Embroidered Corduroy Adjuster Cap",
    price: 1200,
    brand: "Zara",
    category: "Accessories",
    size: "Adjustable",
    condition: "Like New",
    description: "Soft washed corduroy cap in forest green. Brass adjuster clasp, deep fit. Sanity-washed and fully sanitized for direct wearing.",
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller",
    sellerName: "Vintage Vault PK",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-7",
    name: "Sherpa Lining Heavy Denim Cowboy Jacket",
    price: 6500,
    brand: "Levi's",
    category: "Jackets",
    size: "XL",
    condition: "Worn",
    description: "Insanely cool vintage workwear denim jacket with natural hand distressing. Beautifully faded and lived-in sherpa lining. A warm heavy jacket with maximum character.",
    images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller-2",
    sellerName: "Kicks & Threads",
    stock: 1,
    status: "approved",
    createdAt: new Date().toISOString(),
    isFeatured: true
  },
  {
    id: "prod-8",
    name: "Eco-Linen Lightweight Knit Cardigan",
    price: 2900,
    brand: "Elo",
    category: "Shirts",
    size: "S",
    condition: "Like New",
    description: "Ultra-breathable linen blend cardigan. Drop shoulder style, lightweight beige knit. Perfect for modern Pakistani summer layering.",
    images: ["https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=600"],
    sellerId: "usr-seller",
    sellerName: "Vintage Vault PK",
    stock: 1,
    status: "pending", // Starts as pending to demonstrate admin approval workflow!
    createdAt: new Date().toISOString()
  }
];

const PRESEEDED_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    customerId: "usr-customer",
    customerName: "Usman Ahmed",
    rating: 5,
    comment: "This flannel shirt feels like heaven! Clean design, exact sizing as advertised, and smelled so fresh! High level thrift hygiene verified.",
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: "rev-2",
    productId: "prod-4",
    customerId: "usr-customer",
    customerName: "Usman Ahmed",
    rating: 4,
    comment: "Air bubbles are in excellent shape. Minimal dirt on sole as described. Very friendly shipping updates from the seller.",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export function readDb(): DatabaseSchema {
  try {
    ensureDirectoryExistence(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        users: [
          {
            id: "usr-admin",
            name: "Loopwear Controller (Admin)",
            email: "admin@loopwear.pk",
            password: "admin123",
            role: "admin",
            joinedAt: new Date().toISOString(),
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
            status: "active"
          },
          {
            id: "usr-seller",
            name: "Vintage Vault PK",
            email: "seller@loopwear.pk",
            password: "seller123",
            role: "seller",
            joinedAt: new Date().toISOString(),
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
            status: "active",
            earnings: 12500,
            salesCount: 6
          },
          {
            id: "usr-seller-2",
            name: "Kicks & Threads",
            email: "kicks@loopwear.pk",
            password: "seller123",
            role: "seller",
            joinedAt: new Date().toISOString(),
            avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=150",
            status: "active",
            earnings: 5800,
            salesCount: 1
          },
          {
            id: "usr-customer",
            name: "Usman Ahmed",
            email: "customer@loopwear.pk",
            password: "customer123",
            role: "customer",
            joinedAt: new Date().toISOString(),
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
            status: "active"
          }
        ],
        products: PRESEEDED_PRODUCTS,
        orders: [
          {
            id: "ord-101",
            customerId: "usr-customer",
            customerName: "Usman Ahmed",
            deliveryAddress: "Apartment 4B, Askari V, Gulberg III",
            city: "Lahore",
            phoneNumber: "+92 300 1234567",
            items: [
              {
                productId: "prod-1",
                name: "Classic Plaid Vintage Flannel Shirt",
                price: 1850,
                size: "M",
                quantity: 1,
                sellerId: "usr-seller",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600"
              }
            ],
            totalAmount: 1850,
            paymentMethod: "Cash on Delivery",
            paymentStatus: "pending",
            status: "delivered", // Already delivered to allow reviews
            courierName: "Leopards Courier",
            trackingNumber: "LEO9874521",
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: "ord-102",
            customerId: "usr-customer",
            customerName: "Usman Ahmed",
            deliveryAddress: "Apartment 4B, Askari V, Gulberg III",
            city: "Lahore",
            phoneNumber: "+92 300 1234567",
            items: [
              {
                productId: "prod-3",
                name: "Oversized College Varsity Hoodie",
                price: 3200,
                size: "L",
                quantity: 1,
                sellerId: "usr-seller",
                image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600"
              }
            ],
            totalAmount: 3200,
            paymentMethod: "Credit/Debit Card",
            paymentStatus: "paid",
            status: "shipped", // Shipped to allow order tracking demonstration
            courierName: "TCS Express",
            trackingNumber: "TCS30491039",
            createdAt: new Date(Date.now() - 43200000).toISOString()
          }
        ],
        reviews: PRESEEDED_REVIEWS,
        returns: [],
        notifications: [
          {
            id: "notif-1",
            userId: "usr-seller",
            title: "New Order Received!",
            message: "You have received an order for: Oversized College Varsity Hoodie. Pack it with a hygiene-card!",
            type: "order",
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: "notif-2",
            userId: "usr-customer",
            title: "Order Shipped 📦",
            message: "Your Varsity Hoodie has been dispatched via TCS Express. Tracking: TCS30491039",
            type: "order",
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Database reading error, using preseeds:", error);
    return {
      users: [],
      products: PRESEEDED_PRODUCTS,
      orders: [],
      reviews: PRESEEDED_REVIEWS,
      returns: [],
      notifications: []
    };
  }
}

export function writeDb(data: DatabaseSchema): boolean {
  try {
    ensureDirectoryExistence(DB_FILE);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Database writing error:", error);
    return false;
  }
}
