/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShoppingBag,
  Layers,
  Users,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  X,
  CreditCard,
  Lock,
  ChevronRight,
  RefreshCw,
  Bell,
  Heart,
  Truck,
  Plus
} from "lucide-react";
import { User, Product, Order, ReturnRequest, Notification } from "./types.ts";
import Navbar from "./components/Navbar.tsx";
import CustomerView from "./components/CustomerView.tsx";
import SellerDashboard from "./components/SellerDashboard.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import GeminiStylist from "./components/GeminiStylist.tsx";

export default function App() {
  // 1. Session and Role State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("loopwear_session");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Global DB State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Navigation and UI Overlays State
  const [activeTab, setActiveTab] = useState<string>("home"); // "home" or "orders" for customers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);

  // 4. Cart State (comprehensive local persistence)
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>(() => {
    const saved = localStorage.getItem("loopwear_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Auth form state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authRole, setAuthRole] = useState<"customer" | "seller" | "admin">("customer");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  // Sync cart
  useEffect(() => {
    localStorage.setItem("loopwear_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("loopwear_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("loopwear_session");
    }
  }, [currentUser]);

  // Load backend database records
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch products (all or seller-specific handles)
      const prodRes = await fetch("/api/products");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // If user is log-in, fetch orders, returns and alerts
      if (currentUser) {
        const orderUrl =
          currentUser.role === "customer"
            ? `/api/orders?customerId=${currentUser.id}`
            : `/api/orders?sellerId=${currentUser.id}`;
        
        // Admins can fetch all orders by omitting role filters
        const finalOrderUrl = currentUser.role === "admin" ? "/api/orders" : orderUrl;

        const orderRes = await fetch(finalOrderUrl);
        if (orderRes.ok) {
          const ordData = await orderRes.json();
          setOrders(ordData);
        }

        const returnUrl =
          currentUser.role === "customer"
            ? `/api/returns?customerId=${currentUser.id}`
            : `/api/returns?sellerId=${currentUser.id}`;
        
        const finalReturnUrl = currentUser.role === "admin" ? "/api/returns" : returnUrl;

        const returnRes = await fetch(finalReturnUrl);
        if (returnRes.ok) {
          const retData = await returnRes.json();
          setReturns(retData);
        }

        // Fetch notifications
        const notifRes = await fetch(`/api/notifications/${currentUser.id}`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.reverse()); // latest first
        }
      }
    } catch (err) {
      console.error("Data loading failure", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  // Sign out triggers
  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]);
    setActiveTab("home");
    setIsStylistOpen(false);
  };

  // Auth Submit handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail || !authPassword) {
      setAuthError("Please fill in email and password credentials.");
      return;
    }

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      authMode === "login"
        ? { email: authEmail, password: authPassword, role: authRole }
        : { name: authName, email: authEmail, password: authPassword, role: authRole };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setCurrentUser(data.user);
      setIsAuthOpen(false);
      // clean form
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");

    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    }
  };

  // Demo account filler (UX premium booster)
  const handleFillDemoCreds = (role: "customer" | "seller" | "admin") => {
    setAuthRole(role);
    setAuthPassword(role === "admin" ? "admin123" : role === "seller" ? "seller123" : "customer123");
    setAuthEmail(role === "admin" ? "admin@loopwear.pk" : role === "seller" ? "seller@loopwear.pk" : "customer@loopwear.pk");
  };

  // Instant switch for developer testing bar
  const handleQuickRoleSwitch = async (role: "customer" | "seller" | "admin" | null) => {
    if (role === null) {
      handleLogout();
      return;
    }

    try {
      const email = role === "admin" ? "admin@loopwear.pk" : role === "seller" ? "seller@loopwear.pk" : "customer@loopwear.pk";
      const password = role === "admin" ? "admin123" : role === "seller" ? "seller123" : "customer123";

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Checkout order submission
  const handlePlaceOrder = async (details: {
    deliveryAddress: string;
    city: string;
    phoneNumber: string;
    paymentMethod: "Cash on Delivery" | "Credit/Debit Card";
  }) => {
    if (!currentUser) return;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const orderPayload = {
      customerId: currentUser.id,
      customerName: currentUser.name,
      deliveryAddress: details.deliveryAddress,
      city: details.city,
      phoneNumber: details.phoneNumber,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        size: item.product.size,
        quantity: item.quantity,
        sellerId: item.product.sellerId,
        image: item.product.images[0]
      })),
      totalAmount: cartTotal,
      paymentMethod: details.paymentMethod
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        alert(`Mubarak! Your order has been placed via ${details.paymentMethod}. Tracking updates will follow soon.`);
        setCartItems([]);
        setShowCart(false);
        setActiveTab("orders"); // Move customer to tracking tab immediately!
        fetchAllData();
      } else {
        alert("Could not process order carton. Try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      // reload notifications
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Navbar */}
      <Navbar
        currentUser={currentUser}
        cartCount={cartItems.length}
        onOpenCart={() => setShowCart(true)}
        onOpenAuth={() => {
          setIsAuthOpen(true);
          setAuthMode("login");
        }}
        onLogout={handleLogout}
        onSearch={(query) => {
          // Pass down keyword triggers
          // Trigger a virtual category scroll of marketplace
          const mel = document.getElementById("marketplace-feed");
          if (mel) mel.scrollIntoView({ behavior: "smooth" });
        }}
        onSelectRole={handleQuickRoleSwitch}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onOpenStylist={() => setIsStylistOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. Main Role Views Router */}
      <main className="flex-grow">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <RefreshCw className="h-8 w-8 text-emerald-800 animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Auditing Pakistani Sustainable Clothing Racks...</p>
          </div>
        ) : (
          <>
            {/* 2.1 Default: Customer Landing Page - Displays to anonymous or customer role */}
            {(!currentUser || currentUser.role === "customer") && (
              <CustomerView
                currentUser={currentUser}
                products={products}
                orders={orders}
                onOpenAuth={() => setIsAuthOpen(true)}
                onRefreshData={fetchAllData}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                onOpenStylist={() => setIsStylistOpen(true)}
                onPlaceOrder={handlePlaceOrder}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showCart={showCart}
                setShowCart={setShowCart}
              />
            )}

            {/* 2.2 Locked Role View: Seller Dashboard */}
            {currentUser && currentUser.role === "seller" && (
              <SellerDashboard
                currentUser={currentUser}
                products={products}
                orders={orders}
                returns={returns}
                onRefreshData={fetchAllData}
              />
            )}

            {/* 2.3 Locked Role View: Admin Control Panel */}
            {currentUser && currentUser.role === "admin" && (
              <AdminDashboard
                currentUser={currentUser}
                products={products}
                orders={orders}
                onRefreshData={fetchAllData}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Floating Stylist Assistant Drawer panel (Openable anytime) */}
      {isStylistOpen && (
        <GeminiStylist
          onClose={() => setIsStylistOpen(false)}
          inventory={products}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setIsStylistOpen(false); // Close as we inspect item details
          }}
        />
      )}

      {/* 4. Complete Authentications Overlay Modal */}
      {isAuthOpen && (
        <div id="auth-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative animate-scale-up">
            <button
              onClick={() => {
                setIsAuthOpen(false);
                setAuthError("");
              }}
              className="absolute right-4 top-4 rounded-full bg-gray-50 p-2 text-gray-500 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Brand Panel */}
            <div className="bg-emerald-950 text-white p-6 text-left space-y-2">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                Loopwear Pakistan
              </span>
              <h3 className="text-xl font-bold font-sans">
                {authMode === "login" ? "Sign In to Your Account" : "Register Sustainable Account"}
              </h3>
              <p className="text-xs text-emerald-100/70">
                Unlock role-specific dashboards for Curators, Sellers, and Admins.
              </p>
            </div>

            {/* Auth forms content */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4 text-left">
              {authError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs">
                  {authError}
                </div>
              )}

              {/* Selector for Roles */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["customer", "seller", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAuthRole(r)}
                      className={`py-1.5 rounded-lg border text-[10px] font-mono tracking-wide transition uppercase font-bold text-center ${
                        authRole === r
                          ? "bg-emerald-900 border-emerald-900 text-white"
                          : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Fill Pills for frictionless sandbox testing */}
              <div className="bg-emerald-50/50 rounded-xl p-3 space-y-1.5 text-xs">
                <p className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Click below to fill preseeded demo credentials:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds("customer")}
                    className="bg-white hover:bg-emerald-100 text-gray-800 border px-2 py-0.5 rounded text-[10px]"
                  >
                    Customer Client
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds("seller")}
                    className="bg-white hover:bg-emerald-100 text-gray-800 border px-2 py-0.5 rounded text-[10px]"
                  >
                    Vintage Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoCreds("admin")}
                    className="bg-white hover:bg-emerald-100 text-gray-800 border px-2 py-0.5 rounded text-[10px]"
                  >
                    Supervisor Admin
                  </button>
                </div>
              </div>

              {authMode === "register" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Full User Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Ahmed"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. account@loopwear.pk"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pass-code</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white font-bold py-2.5 text-xs transition shadow-md flex items-center justify-center gap-1"
              >
                <span>Authorize {authMode === "login" ? "Sign In" : "Registration"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <p className="text-[11px] text-gray-500 text-center">
                {authMode === "login" ? "New around sustainable PK thrifting?" : "Already configured an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="font-bold text-emerald-800 hover:underline ml-1"
                >
                  {authMode === "login" ? "Register account" : "Sign in here"}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modern Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 border-t border-gray-900 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <span className="font-mono text-lg font-black text-white/90">
              LOOP<span className="text-emerald-500">WEAR</span>
            </span>
            <p className="text-[11px] text-gray-400 max-w-sm">
              Pakistan's first fully reliable digital thrift destination. Powered by local communities and automated logistics escrows.
            </p>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            © {new Date().getFullYear()} Loopwear PK LLC. Verified Sanitation Standards.
          </div>
        </div>
      </footer>
    </div>
  );
}
