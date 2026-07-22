/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Filter,
  Check,
  Star,
  ChevronRight,
  CreditCard,
  Truck,
  Heart,
  MessageSquare,
  Search,
  Undo2,
  Calendar,
  Layers,
  ShoppingBag as CartIcon,
  ShieldAlert,
  HelpCircle,
  Eye,
  Trash2,
  X
} from "lucide-react";
import { Product, Order, Review, User, ReturnRequest, ProductCondition } from "../types.ts";

interface CustomerViewProps {
  currentUser: User | null;
  products: Product[];
  orders: Order[];
  onOpenAuth: () => void;
  onRefreshData: () => void;
  cartItems: Array<{ product: Product; quantity: number }>;
  onAddToCart: (p: Product) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
  selectedProduct: Product | null;
  onSelectProduct: (p: Product | null) => void;
  onOpenStylist: () => void;
  onPlaceOrder: (details: {
    deliveryAddress: string;
    city: string;
    phoneNumber: string;
    paymentMethod: "Cash on Delivery" | "Credit/Debit Card";
  }) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

export default function CustomerView({
  currentUser,
  products,
  orders,
  onOpenAuth,
  onRefreshData,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  selectedProduct,
  onSelectProduct,
  onOpenStylist,
  onPlaceOrder,
  activeTab,
  setActiveTab,
  showCart,
  setShowCart
}: CustomerViewProps) {
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(8000);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Checkout form
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "Credit/Debit Card">("Cash on Delivery");
  
  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingProdId, setReviewingProdId] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);

  // Return file form
  const [returningItemId, setReturningItemId] = useState<{ orderId: string; productId: string } | null>(null);
  const [returnReason, setReturnReason] = useState("");

  const categories = ["All", "Shirts", "Pants", "Jackets", "Hoodies", "Shoes", "Bags", "Accessories"];
  const conditions = ["All", "Like New", "Gently Used", "Worn"];
  const sizes = ["All", "S", "M", "L", "XL", "Free Size", "32", "34", "10 US", "9 US", "Adjustable"];

  // Fetch reviews for selected product
  useEffect(() => {
    if (selectedProduct) {
      fetch(`/api/products/${selectedProduct.id}/reviews`)
        .then((res) => res.json())
        .then((data) => setProductReviews(data))
        .catch((err) => console.error("Error loading reviews", err));
    }
  }, [selectedProduct]);

  // Wishlisting logic
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedProduct) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          customerId: currentUser.id,
          customerName: currentUser.name,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (response.ok) {
        const newRev = await response.json();
        setProductReviews((prev) => [newRev, ...prev]);
        setReviewComment("");
        setReviewRating(5);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningItemId || !currentUser) return;

    const order = orders.find((o) => o.id === returningItemId.orderId);
    if (!order) return;
    const item = order.items.find((i) => i.productId === returningItemId.productId);
    if (!item) return;

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          productId: item.productId,
          sellerId: item.sellerId,
          customerId: currentUser.id,
          customerName: currentUser.name,
          productName: item.name,
          productPrice: item.price,
          reason: returnReason
        })
      });

      if (res.ok) {
        onRefreshData();
        setReturningItemId(null);
        setReturnReason("");
        alert("Refund dispute ticket logged successfully! The Vintage Seller will review your hygiene claim.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!address || !phone) {
      alert("Please provide shipping phone and address dimensions.");
      return;
    }
    onPlaceOrder({
      deliveryAddress: address,
      city,
      phoneNumber: phone,
      paymentMethod
    });
    setIsCheckoutOpen(false);
    setAddress("");
    setPhone("");
  };

  // Advanced Filtering Math
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchCondition = selectedCondition === "All" || p.condition === selectedCondition;
    const matchSize = selectedSize === "All" || p.size === selectedSize;
    const matchPrice = p.price <= priceRange;
    const matchQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchCondition && matchSize && matchPrice && matchQuery && p.status === "approved" && p.stock > 0;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. HOME VIEW */}
      {activeTab === "home" && (
        <div id="customer-home-container" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-10">
          {/* Hero Banner - space grotesk luxury vibes */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-emerald-950 text-white min-h-[380px] flex items-center p-6 md:p-12 shadow-xl border border-white/5">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 max-w-xl space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                🌱 Curated Fashion • Capped at PKR 8,000
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none font-sans">
                Authentic Pakistani <br />
                <span className="text-emerald-400 font-mono">Digital Thrift</span> Is Here.
              </h1>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                Pakistan’s premier high-performance marketplace. Buy deep-cleaned, verified clothing, sneakers, and accessories with TCS logistics and 100% refund security.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const el = document.getElementById("marketplace-feed");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-gray-950 hover:bg-emerald-50 transition shadow-lg flex items-center gap-2 group"
                >
                  Retrieve Listings
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={onOpenStylist}
                  className="rounded-full bg-emerald-700/50 backdrop-blur-md border border-emerald-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition flex items-center gap-2 shadow-md animate-pulse"
                >
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  Stylist Recommendation
                </button>
              </div>
            </div>
            {/* Visual Abstract illustration */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 blur-3xl pointer-events-none hidden lg:block"></div>
          </section>

          {/* Quick Categories Navigation */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">Featured Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-emerald-950 text-white border-emerald-950 scale-[1.03] shadow-md"
                      : "bg-white text-gray-700 hover:text-emerald-700 border-gray-100 hover:border-emerald-200"
                  }`}
                >
                  <span className="truncate">{cat === "All" ? "🛍️ All Gear" : cat}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Trending Slider Deck */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" /> Curated Hot Drops
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {products.filter((p) => p.isFeatured && p.status === "approved").slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-550 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 text-white flex justify-between items-end">
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white">
                        {p.condition}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        PKR {p.price.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={(e) => toggleWishlist(p.id, e)}
                      className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-600 hover:text-rose-500 transition shadow-sm"
                    >
                      <Heart className={`h-4 w-4 ${wishlist.includes(p.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col p-3.5 space-y-1 text-left">
                    <span className="text-[10px] font-bold text-gray-400 capitalize">{p.brand}</span>
                    <h3 className="font-medium text-xs text-gray-900 group-hover:text-emerald-700 transition truncate">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-500 border-t border-gray-50">
                      <span>Size: <span className="font-bold text-gray-700">{p.size}</span></span>
                      <span>By {p.sellerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Main Marketplace Filter Shelf & Dynamic Feed */}
          <section id="marketplace-feed" className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6 border-t border-gray-100">
            {/* Sidebar filter options */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-emerald-800" /> Filter Shelves
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedCondition("All");
                    setSelectedSize("All");
                    setPriceRange(8000);
                    setSearchQuery("");
                  }}
                  className="text-[10px] font-semibold text-emerald-700 hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Text Search inside filters */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Keywords</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search titles, seller names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-1.5 pr-8 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
              </div>

              {/* Capped Price range slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Premium Cap</span>
                  <span className="font-mono font-bold text-emerald-700">PKR {priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="h-1.5 w-full bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>PKR 500</span>
                  <span>Max PKR 8,000 Cap</span>
                </div>
              </div>

              {/* Conditions Drop selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Fabric Quality</label>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setSelectedCondition(cond)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition ${
                        selectedCondition === cond
                          ? "bg-emerald-900 text-white border-emerald-900"
                          : "bg-white text-gray-700 border-gray-200 hover:border-emerald-200"
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selectors */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Garment Sizing</label>
                <div className="flex flex-wrap gap-1">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-7 min-w-[28px] px-1 text-[10px] font-bold rounded border flex items-center justify-center transition ${
                        selectedSize === s
                          ? "bg-emerald-900 text-white border-emerald-900 font-bold"
                          : "bg-white text-gray-700 border-gray-200 hover:border-emerald-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Logistics Promise Banner */}
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-3 space-y-2">
                <h4 className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-orange-700" /> Local PK Shipment Partner
                </h4>
                <p className="text-[10px] text-orange-900 leading-relaxed">
                  Fast deliveries handled across flat TCS / Leopards networks. Delivery charges cap at standard rates with secure parcel inspect.
                </p>
              </div>
            </div>

            {/* Real Listings feed */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs text-gray-500 font-medium">
                  Presenting <span className="text-gray-900 font-bold">{filteredProducts.length}</span> curated garments
                </span>
                <div className="text-xs text-gray-500">
                  Sorting: <span className="font-bold text-gray-900">Relevance</span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3 bg-white">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-emerald-800" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">No thrift findings match your filters</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Aray, we couldn't find matches on hand. Try resetting filters or asking Rida Stylist to suggest alternative pairings or custom sizes!
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedCondition("All");
                      setSelectedSize("All");
                      setPriceRange(8000);
                      setSearchQuery("");
                    }}
                    className="rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-950 transition shadow"
                  >
                    Reset Grid
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p)}
                      className="group flex flex-col border border-gray-150 rounded-2xl overflow-hidden bg-white hover:shadow-md transition duration-200 cursor-pointer"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                        />
                        <button
                          onClick={(e) => toggleWishlist(p.id, e)}
                          className="absolute right-2.5 top-2.5 rounded-full bg-white/95 p-1.5 text-gray-600 hover:text-rose-500 shadow-sm transition"
                        >
                          <Heart className={`h-4 w-4 ${wishlist.includes(p.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>
                        <div className="absolute left-2.5 bottom-2.5 flex flex-wrap gap-1">
                          <span className="rounded bg-emerald-950/90 backdrop-blur-sm px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white">
                            {p.condition}
                          </span>
                          <span className="rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold text-gray-950">
                            Size: {p.size}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1 space-y-2 text-left">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-emerald-800 font-mono uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                            {p.brand}
                          </span>
                          <h3 className="font-semibold text-xs text-gray-900 group-hover:text-emerald-700 transition leading-tight mt-1 truncate">
                            {p.name}
                          </h3>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-gray-50 pt-2">
                          <span className="font-mono text-xs font-black text-gray-950">
                            PKR {p.price.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-400">By {p.sellerName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 2. CUSTOMER ORDERS & DISPUTES TAB */}
      {activeTab === "orders" && (
        <div id="customer-orders-tab" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-sans text-gray-900">Your Sustainable Purchases</h2>
              <p className="text-xs text-gray-500">Track current TSC courier progress, view ratings, or open refund queries</p>
            </div>
            <button
              onClick={() => setActiveTab("home")}
              className="text-xs font-semibold text-emerald-800 flex items-center gap-1 hover:underline self-start"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to Thrifts
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3 bg-white">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Truck className="h-6 w-6 text-emerald-800" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">No orders logged yet</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Sign in to purchase vintage clothing. All order flows support real-time status updates and delivery logs!
              </p>
              <button
                onClick={() => setActiveTab("home")}
                className="rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-950 transition shadow"
              >
                Explore Market
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm p-5 space-y-4 text-left">
                  {/* Order header */}
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-50 pb-3">
                    <div>
                      <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded font-mono font-bold">
                        ORDER ID: #{o.id}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Placed on {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 capitalize ${
                        o.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                        o.status === "shipped" ? "bg-amber-50 text-amber-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        Status: {o.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-900">
                        PKR {o.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order tracking pipeline (Amazon style layout) */}
                  <div className="py-2.5">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Pipeline</p>
                    <div className="grid grid-cols-4 gap-1 text-center relative">
                      <div className="absolute top-2.5 left-[12.5%] right-[12.5%] h-0.5 bg-gray-100 -z-10"></div>
                      <div className="space-y-1">
                        <div className={`h-5 w-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          ["pending", "processing", "shipped", "delivered"].includes(o.status)
                            ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"
                        }`}>✓</div>
                        <p className="text-[9px] font-semibold text-gray-700">Pending</p>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-5 w-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          ["processing", "shipped", "delivered"].includes(o.status)
                            ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"
                        }`}>✓</div>
                        <p className="text-[9px] font-semibold text-gray-700">Packed</p>
                      </div>
                      <div className="space-y-1">
                        <div className={`h-5 w-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          ["shipped", "delivered"].includes(o.status)
                            ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"
                        }`}>✓</div>
                        <p className="text-[9px] font-semibold text-gray-700">Shipped</p>
                      </div>
                      <div className="space-y-1 flex flex-col items-center">
                        <div className={`h-5 w-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold ${
                          o.status === "delivered" ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"
                        }`}>✓</div>
                        <p className="text-[9px] font-semibold text-gray-700">Delivered</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipment details */}
                  {o.trackingNumber && (
                    <div className="bg-emerald-50/50 border border-emerald-100/30 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 text-emerald-950 font-medium">
                        <Truck className="h-4 w-4 text-emerald-700" />
                        <span>Courier Partner: <strong className="font-bold">{o.courierName}</strong></span>
                      </div>
                      <div className="text-gray-600 font-mono">
                        Tracking Pin: <strong className="text-emerald-950 bg-white font-mono px-2 py-0.5 border border-emerald-100 rounded text-xs">{o.trackingNumber}</strong>
                      </div>
                    </div>
                  )}

                  {/* Items catalog list */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Garments Purchased</p>
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-none">
                        <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded-md bg-gray-50 border shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-gray-950 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-xs font-bold text-gray-950">PKR {item.price.toLocaleString()}</span>
                          {o.status === "delivered" && (
                            <div className="flex gap-2 mt-1">
                              {/* Submit refund trigger */}
                              <button
                                onClick={() => {
                                  setReturningItemId({ orderId: o.id, productId: item.productId });
                                  setReturnReason("");
                                }}
                                className="text-[9px] font-bold text-rose-600 hover:underline px-1 py-0.5 rounded bg-rose-50"
                              >
                                Ask Return
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location info */}
                  <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg leading-relaxed">
                    <strong>Delivery Terminal:</strong> {o.deliveryAddress}, {o.city} | {o.phoneNumber} | Method: {o.paymentMethod} ({o.paymentStatus})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PRODUCT IMMERSIVE DETAIL INSPECTION DRAWER */}
      {selectedProduct && (
        <div id="product-detail-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row relative animate-scale-up max-h-[90vh]">
            <button
              onClick={() => onSelectProduct(null)}
              className="absolute right-3.5 top-3.5 rounded-full bg-white/90 p-2 text-gray-600 hover:text-black shadow-md z-10 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Side 1: Large visuals */}
            <div className="md:w-1/2 relative bg-gray-50">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="h-full w-full object-cover min-h-[300px] max-h-[450px]"
              />
              <span className="absolute bottom-3 left-3 rounded-full bg-emerald-950/90 text-white font-mono text-[10px] px-2.5 py-1 tracking-wider uppercase">
                {selectedProduct.condition} Condition
              </span>
            </div>

            {/* Side 2: Description and triggers */}
            <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between max-h-[450px]">
              <div className="space-y-4 text-left">
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedProduct.brand} Curated
                  </span>
                  <h2 className="text-lg font-bold font-sans text-gray-900 mt-1.5 leading-snug">
                    {selectedProduct.name}
                  </h2>
                </div>

                <div className="flex items-baseline justify-between border-y border-gray-100 py-2">
                  <span className="font-mono text-xl font-black text-emerald-950">
                    PKR {selectedProduct.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Size: <strong className="text-gray-900 font-bold">{selectedProduct.size}</strong></span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Provenance & Quality Notes</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Seller specs */}
                <div className="rounded-xl bg-gray-50 p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400">Curated By</p>
                    <p className="font-bold text-gray-900">{selectedProduct.sellerName}</p>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    ⭐ Clean Verified
                  </span>
                </div>

                {/* Reviews listing section */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Wearer Feedback ({productReviews.length})
                  </h4>
                  <div className="max-h-24 overflow-y-auto space-y-2">
                    {productReviews.length === 0 ? (
                      <p className="text-[10px] text-gray-400 text-center py-2">No reviews written yet. Be the first!</p>
                    ) : (
                      productReviews.map((r) => (
                        <div key={r.id} className="text-[11px] leading-tight bg-gray-50 p-2 rounded">
                          <div className="flex justify-between font-bold text-gray-800">
                            <span>{r.customerName}</span>
                            <span className="text-amber-500">★ {r.rating}</span>
                          </div>
                          <p className="text-gray-500 mt-0.5">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add review form - interactive */}
                  {currentUser && (
                    <form onSubmit={handlePostReview} className="space-y-1.5 pt-2 border-t border-gray-50 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-gray-700">Add Review:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewRating(num)}
                              className={`text-sm ${reviewRating >= num ? "text-amber-500" : "text-gray-200"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Your review comment..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full text-[11px] border border-gray-200 rounded px-2 py-1 focus:outline-emerald-800"
                        />
                        <button type="submit" className="bg-emerald-800 text-white rounded text-[10px] font-bold px-2.5 hover:bg-emerald-950">
                          Post
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Add to checkout trigger */}
              <button
                onClick={() => {
                  onAddToCart(selectedProduct);
                  setShowCart(true); // Open drawer immediately
                  onSelectProduct(null);
                }}
                className="w-full mt-4 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white py-2.5 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart (PKR {selectedProduct.price.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COCOD RETURN DISPUTE FORM MODAL */}
      {returningItemId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handlePostReturn} className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-left shadow-2xl border border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-500" /> Log Hygiene & Return Claim
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">
              Loopwear enforces secure quality control. Please supply your return logic (size mismatch, cleanliness issue, courier damage).
            </p>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detailed Logic</label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                required
                rows={3}
                placeholder="Details of the claims..."
                className="w-full text-xs rounded-xl border border-gray-200 bg-gray-50 p-2.5 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturningItemId(null)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs py-2 rounded-xl text-center border font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs py-2 rounded-xl text-center font-bold shadow"
              >
                File Refund
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. SHOPPING CART & COD DRAWER */}
      {showCart && (
        <div id="shopping-cart-drawer" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative animate-slide-in p-6">
            <button
              onClick={() => setShowCart(false)}
              className="absolute right-4 top-4 rounded-full bg-gray-50 p-2 text-gray-500 hover:text-black transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Drawer Header */}
            <div className="border-b border-gray-100 pb-4 text-left">
              <h3 className="font-extrabold text-sm text-gray-950 flex items-center gap-2 uppercase tracking-widest">
                <ShoppingBag className="h-5 w-5 text-emerald-800" /> Curated Cart ({cartItems.length})
              </h3>
              <p className="text-[10px] text-gray-500">Your sustainable thrifts will be packed and shipped from Lahore</p>
            </div>

            {/* Cart list content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <CartIcon className="h-10 w-10 text-gray-300 stroke-[1.5]" />
                  <p className="text-xs text-gray-400 max-w-[200px]">No thrift items added to the bag yet. Get shopping!</p>
                </div>
              ) : (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3.5 p-2 rounded-xl bg-gray-50 border border-gray-100/50 text-left items-center">
                    <img src={product.images[0]} alt={product.name} className="h-12 w-12 object-cover rounded bg-white shadow-inner" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-gray-950 truncate leading-tight">{product.name}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                        <span>Size: <strong className="font-bold">{product.size}</strong></span>
                        <span className="font-mono text-emerald-800 font-bold">PKR {product.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(product.id)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Billing layout details & forms */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-4">
                {/* Total pricing counters */}
                <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-2 text-left">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-700 font-bold font-mono">FREE (Premium Promo)</span>
                  </div>
                  <div className="flex justify-between text-gray-950 font-bold border-t border-gray-200/60 pt-2 text-sm">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-800">PKR {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Fields container */}
                {isCheckoutOpen ? (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3 p-3 border border-emerald-100 bg-emerald-50/20 rounded-xl text-left">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-widest flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-emerald-800" /> Checkout Credentials
                    </h4>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs rounded-lg border border-gray-200 bg-white p-2 focus:border-emerald-500"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Faisalabad">Faisalabad</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detailed Address</label>
                      <input
                        type="text"
                        placeholder="House / Apartment #, Street Name, Area..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="w-full text-xs rounded-lg border border-gray-200 bg-white p-2 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                      <input
                        type="text"
                        placeholder="e.g., +92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full text-xs rounded-lg border border-gray-200 bg-white p-2 focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment System</label>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Cash on Delivery")}
                          className={`p-2 rounded-lg border font-bold transition flex items-center justify-center gap-1 ${
                            paymentMethod === "Cash on Delivery"
                              ? "bg-emerald-950 text-white border-emerald-950"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Truck className="h-3.5 w-3.5" /> COD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("Credit/Debit Card")}
                          className={`p-2 rounded-lg border font-bold transition flex items-center justify-center gap-1 ${
                            paymentMethod === "Credit/Debit Card"
                              ? "bg-emerald-950 text-white border-emerald-950"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Card
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(false)}
                        className="flex-1 text-center py-2 border rounded-xl font-bold bg-white text-gray-700 hover:bg-gray-50 text-xs transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-800 text-white text-center py-2 rounded-xl font-bold hover:bg-emerald-950 text-xs transition shadow-sm"
                      >
                        Place Order (COD/Card)
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={onClearCart}
                      className="px-3.5 py-2.5 border border-gray-200 text-gray-600 hover:text-rose-500 rounded-xl font-bold text-xs transition"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onOpenAuth();
                        } else {
                          setIsCheckoutOpen(true);
                        }
                      }}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-950 text-white text-center py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Delivery Specs</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Support simple state hook nested inside React
import { useState as useLocalState } from "react";
// We expose showCart so App can set state
export function useCartState() {
  const [showCart, setShowCart] = useState(false);
  return { showCart, setShowCart };
}
