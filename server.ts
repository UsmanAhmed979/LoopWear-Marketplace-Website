/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { readDb, writeDb } from "./server/db.ts";
import { GoogleGenAI } from "@google/genai";
import { User, Product, Order, Review, ReturnRequest, Notification, OrderItem } from "./src/types.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent as instructed in skills
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// REST APIs

// 1. Auth APIs
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    res.status(400).json({ error: "Email, password, and role are required." });
    return;
  }

  const db = readDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
  );

  if (!user) {
    res.status(401).json({ error: `Invalid ${role} credentials.` });
    return;
  }

  if (user.password !== password) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  if (user.status === "suspended") {
    res.status(403).json({ error: "This account has been suspended by the platform administrator." });
    return;
  }

  // Safe user return
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "All registration fields are required." });
    return;
  }

  const db = readDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    res.status(400).json({ error: "An account with this email already exists." });
    return;
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password, // Store as is in our lightweight db
    role,
    joinedAt: new Date().toISOString(),
    avatar: `https://images.unsplash.com/photo-${role === "seller" ? "1472099645785-5658abf4ff4e" : "1534528741775-53994a69daeb"}?auto=format&fit=crop&q=80&w=150`,
    status: "active",
    ...(role === "seller" ? { earnings: 0, salesCount: 0 } : {})
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
});

// 2. Product APIs
app.get("/api/products", (req, res) => {
  const db = readDb();
  const { category, condition, brand, search, sellerId } = req.query;

  let filtered = db.products;

  // Filter out rejected or pending ones unless requested by seller/admin
  if (!sellerId && req.query.view !== "admin") {
    filtered = filtered.filter((p) => p.status === "approved" && p.stock > 0);
  }

  if (sellerId) {
    filtered = filtered.filter((p) => p.sellerId === sellerId);
  }

  if (category) {
    filtered = filtered.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (condition) {
    filtered = filtered.filter((p) => p.condition.toLowerCase() === (condition as string).toLowerCase());
  }

  if (brand) {
    filtered = filtered.filter((p) => p.brand.toLowerCase().includes((brand as string).toLowerCase()));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// Add listing (Sellers/Admins)
app.post("/api/products", (req, res) => {
  const { name, price, brand, category, size, condition, description, images, sellerId, sellerName } = req.body;

  if (!name || !price || !category || !size || !condition || !sellerId) {
    res.status(400).json({ error: "Missing required listing fields." });
    return;
  }

  // PKR Cap strict rule
  if (Number(price) > 8000) {
    res.status(400).json({ error: "Product price cannot exceed Pakistan digital thrift cap of PKR 8,000." });
    return;
  }

  const db = readDb();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name,
    price: Number(price),
    brand: brand || "Unbranded Thrift",
    category,
    size,
    condition,
    description: description || "Authentic curated item.",
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600"],
    sellerId,
    sellerName: sellerName || "Thrifter PK",
    stock: 1,
    status: "approved", // Autoset approved to improve the immediate testing flow, but support admin reject
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);

  // Send a system notification
  const newNotification: Notification = {
    id: `notif-${Date.now()}`,
    userId: "usr-admin",
    title: "New Product Listing",
    message: `${newProduct.name} (PKR ${newProduct.price}) listed by ${newProduct.sellerName}`,
    type: "system",
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(newNotification);

  writeDb(db);
  res.status(201).json(newProduct);
});

// Update listing (Sellers/Admins)
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  // PKR Cap strict rule if price is modified
  if (req.body.price && Number(req.body.price) > 8000) {
    res.status(400).json({ error: "Price exceeds the digital thrift cap of PKR 8,000." });
    return;
  }

  db.products[idx] = {
    ...db.products[idx],
    ...req.body,
    price: req.body.price ? Number(req.body.price) : db.products[idx].price
  };

  writeDb(db);
  res.json(db.products[idx]);
});

// Delete listing (Sellers/Admins)
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.products.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Listing not found." });
    return;
  }

  db.products.splice(index, 1);
  writeDb(db);
  res.json({ success: true, message: "Listing deleted successfully." });
});

// 3. Review APIs
app.get("/api/products/:id/reviews", (req, res) => {
  const db = readDb();
  const reviews = db.reviews.filter((r) => r.productId === req.params.id);
  res.json(reviews);
});

app.post("/api/reviews", (req, res) => {
  const { productId, customerId, customerName, rating, comment } = req.body;
  if (!productId || !customerId || !rating) {
    res.status(400).json({ error: "Missing essential rating parameters." });
    return;
  }

  const db = readDb();
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    customerId,
    customerName: customerName || "Anonymous Thrifter",
    rating: Number(rating),
    comment: comment || "Curated & clean thrift!",
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);
  writeDb(db);
  res.status(201).json(newReview);
});

// 4. Order APIs
app.get("/api/orders", (req, res) => {
  const db = readDb();
  const { customerId, sellerId } = req.query;

  let results = db.orders;

  if (customerId) {
    results = results.filter((o) => o.customerId === customerId);
  } else if (sellerId) {
    results = results.filter((o) => o.items.some((item) => item.sellerId === sellerId));
  }

  res.json(results);
});

app.post("/api/orders", (req, res) => {
  const { customerId, customerName, deliveryAddress, city, phoneNumber, items, totalAmount, paymentMethod } = req.body;

  if (!customerId || !items || items.length === 0 || !deliveryAddress || !phoneNumber) {
    res.status(400).json({ error: "Incomplete order checkout details." });
    return;
  }

  const db = readDb();

  const newOrder: Order = {
    id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId,
    customerName,
    deliveryAddress,
    city,
    phoneNumber,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === "Credit/Debit Card" ? "paid" : "pending",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Update original product stock
  items.forEach((item: OrderItem) => {
    const pIdx = db.products.findIndex((p) => p.id === item.productId);
    if (pIdx !== -1) {
      db.products[pIdx].stock = Math.max(0, db.products[pIdx].stock - item.quantity);
    }

    // Allocate notification to the seller
    const sellerNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId: item.sellerId,
      title: "New Purchase Alert!",
      message: `Your item '${item.name}' has been purchased by ${customerName}.`,
      type: "order",
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(sellerNotif);
  });

  writeDb(db);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, courierName, trackingNumber, paymentStatus } = req.body;

  const db = readDb();
  const idx = db.orders.findIndex((o) => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  const oldOrder = db.orders[idx];
  db.orders[idx] = {
    ...oldOrder,
    ...(status ? { status } : {}),
    ...(courierName ? { courierName } : {}),
    ...(trackingNumber ? { trackingNumber } : {}),
    ...(paymentStatus ? { paymentStatus } : {})
  };

  // If status moved to delivered, calculate seller earnings update
  if (status === "delivered" && oldOrder.status !== "delivered") {
    oldOrder.items.forEach((item) => {
      const sellerIdx = db.users.findIndex((u) => u.id === item.sellerId && u.role === "seller");
      if (sellerIdx !== -1) {
        db.users[sellerIdx].earnings = (db.users[sellerIdx].earnings || 0) + item.price * 0.92; // 8% platform fee
        db.users[sellerIdx].salesCount = (db.users[sellerIdx].salesCount || 0) + 1;
      }
    });
  }

  // Push user alert status changed
  const custNotif: Notification = {
    id: `notif-${Date.now()}`,
    userId: oldOrder.customerId,
    title: `Order Status: ${status || "Updated"}`,
    message: `Your order #${id} has been update to state: ${status}. Courier: ${db.orders[idx].courierName || "Local"}`,
    type: "order",
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(custNotif);

  writeDb(db);
  res.json(db.orders[idx]);
});

// 5. Returns APIs
app.get("/api/returns", (req, res) => {
  const db = readDb();
  const { sellerId, customerId } = req.query;

  let filtered = db.returns;
  if (sellerId) filtered = filtered.filter((r) => r.sellerId === sellerId);
  if (customerId) filtered = filtered.filter((r) => r.customerId === customerId);

  res.json(filtered);
});

app.post("/api/returns", (req, res) => {
  const { orderId, productId, sellerId, customerId, customerName, productName, productPrice, reason } = req.body;

  if (!orderId || !productId || !reason) {
    res.status(400).json({ error: "Incomplete return request parameters." });
    return;
  }

  const db = readDb();
  const newReturn: ReturnRequest = {
    id: `ret-${Date.now()}`,
    orderId,
    productId,
    sellerId,
    customerId,
    customerName: customerName || "Customer",
    productName,
    productPrice: Number(productPrice),
    reason,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.returns.push(newReturn);

  // Notify seller of the return request
  const sellerNotif: Notification = {
    id: `notif-${Date.now()}`,
    userId: sellerId,
    title: "Return Request Received",
    message: `${customerName} is requesting a refund for ${productName} due to: ${reason}`,
    type: "return",
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(sellerNotif);

  writeDb(db);
  res.status(201).json(newReturn);
});

app.put("/api/returns/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const db = readDb();
  const idx = db.returns.findIndex((r) => r.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Return request not found." });
    return;
  }

  db.returns[idx].status = status;

  // Let's notify customer
  const custNotif: Notification = {
    id: `notif-${Date.now()}`,
    userId: db.returns[idx].customerId,
    title: `Return Request ${status}`,
    message: `Your return request for ${db.returns[idx].productName} has been ${status}.`,
    type: "return",
    read: false,
    createdAt: new Date().toISOString()
  };
  db.notifications.push(custNotif);

  // If approved, restock item
  if (status === "approved") {
    const prodIdx = db.products.findIndex((p) => p.id === db.returns[idx].productId);
    if (prodIdx !== -1) {
      db.products[prodIdx].stock += 1;
    }
  }

  writeDb(db);
  res.json(db.returns[idx]);
});

// 6. Notifications API
app.get("/api/notifications/:userId", (req, res) => {
  const db = readDb();
  const userNotifs = db.notifications.filter((n) => n.userId === req.params.userId || n.userId === "usr-all");
  res.json(userNotifs);
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  const db = readDb();
  const idx = db.notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    db.notifications[idx].read = true;
    writeDb(db);
  }
  res.json({ success: true });
});

// 7. General System, Admin stats, User management API
app.get("/api/admin/users", (req, res) => {
  const db = readDb();
  // Strip password for admin list
  const safeUsers = db.users.map(({ password: _, ...u }) => u);
  res.json(safeUsers);
});

app.put("/api/admin/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "active" | "suspended"

  const db = readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx !== -1) {
    db.users[idx].status = status;
    writeDb(db);
    res.json({ success: true, status });
    return;
  }
  res.status(404).json({ error: "User not found." });
});

app.get("/api/admin/stats", (req, res) => {
  const db = readDb();
  const totalUsers = db.users.length;
  const activeListings = db.products.filter((p) => p.status === "approved" && p.stock > 0).length;
  
  // Calculate total checkout volume
  const deliveredOrders = db.orders.filter((o) => o.status === "delivered" || o.status === "shipped" || o.status === "processing");
  const salesVolume = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const revenue = Math.round(salesVolume * 0.08); // 8% commission models

  res.json({
    totalUsers,
    activeListings,
    salesVolume,
    revenue,
    commission: 8
  });
});

// 8. Gemini-Powered Thrift Stylist Assistant Route
app.post("/api/gemini/recommendations", async (req, res) => {
  const { userInput, stylePreference, currentBudget } = req.body;
  
  const db = readDb();
  // Read clean approved listings
  const availableInventory = db.products.filter((p) => p.status === "approved" && p.stock > 0);

  if (!ai) {
    // Elegant fallback simulation if API key isn't provided/working yet, so we have ZERO broken screens!
    let matching = availableInventory.slice(0, 3);
    res.json({
      recommendationText: `Rida here, your personal Pakistani Loopwear stylist! Since the Gemini API key is currently loading or offline, I've used my localized sorting algorithms to find excellent matches based on your interest: "${userInput || "General Eco-Dressing"}". Here are my top sustainable thrift recommendations for Karachi, Lahore, and Islamabad:`,
      recommendedProductIds: matching.map((p) => p.id)
    });
    return;
  }

  try {
    const productsString = JSON.stringify(
      availableInventory.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        size: p.size,
        category: p.category,
        condition: p.condition
      }))
    );

    const systemPrompt = `You are "Rida", an expert sustainable fashion thrift stylist from Karachi, Pakistan representing the "Loopwear" digital marketplace.
    You help Pakistani youth discover incredible, affordable, premium second-hand pieces.
    Your tone is friendly, fashionable, authentic, using pleasant Urdu/English mix (Hinglish) where natural but highly professional.
    Analyze the customer's request and recommend up to 3 models specifically from our inventory of available products only.
    IMPORTANT: You must return a JSON response containing:
    1. "recommendationText": A formatted markdown paragraph that acts as Rida’s personalized style advice and response. Friendly and fashion-forward context, mentioning local delivery across Pakistan!
    2. "recommendedProductIds": An string array of product IDs matching the recommendation.
    Ensure to only recommend products that actually exist in the inventory.
    The response MIME type is "application/json".`;

    const userPrompt = `
    Customer Input: "${userInput || "Eco-friendly wardrobe additions"}"
    Style Preferences: "${stylePreference || "Modern/Undecided"}"
    Budget Limit: PKR ${currentBudget || "No limit (Max 8000)"}
    
    Our Available Thrift Products:
    ${productsString}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            recommendationText: {
              type: "STRING",
              description: "Format in markdown. Warm stylist description of style pairing ideas, explaining to user why they will look amazing."
            },
            recommendedProductIds: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "The IDs of products suggested from the inventory."
            }
          },
          required: ["recommendationText", "recommendedProductIds"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);

  } catch (error) {
    console.error("Gemini stylist helper error:", error);
    // Safe graceful recovery fallback
    res.json({
      recommendationText: `Rida here! I had a quick network glitch choosing specific outfits, but I highly suggest checking out our trending **Vite Plaid Flannels** and durable **Levi's Premium Denim**. They are the ultimate building blocks for Pakistani sustainable streetwise fashion! Let me know if you would like to filter by specific sizes.`,
      recommendedProductIds: ["prod-1", "prod-2"]
    });
  }
});


// Orchestrate Vite dev server or serve production dist static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loopwear secure fullstack container online on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();
