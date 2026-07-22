/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Truck,
  Image,
  Layers,
  AlertCircle,
  MessageSquare,
  Undo2,
  Eye
} from "lucide-react";
import { Product, Order, ReturnRequest, User, ProductCondition, OrderItem, ProductStatus } from "../types.ts";

interface SellerDashboardProps {
  currentUser: User;
  products: Product[];
  orders: Order[];
  returns: ReturnRequest[];
  onRefreshData: () => void;
}

export default function SellerDashboard({
  currentUser,
  products,
  orders,
  returns,
  onRefreshData
}: SellerDashboardProps) {
  // Navigation tabs of Seller
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "add" | "manage" | "orders" | "returns">("analytics");

  // New product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Shirts");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState<ProductCondition>("Gently Used");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit item state
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  // Ship order state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState("TCS Express");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Filter products by current seller
  const sellerProducts = products.filter((p) => p.sellerId === currentUser.id);

  // Inbound orders for this seller
  const sellerInboundOrders = orders.filter((o) =>
    o.items.some((item) => item.sellerId === currentUser.id)
  );

  // Return requests for this seller
  const sellerReturns = returns.filter((r) => r.sellerId === currentUser.id);

  // Filter out statistics
  const totalSalesVolume = sellerInboundOrders
    .filter((o) => o.status === "delivered")
    .reduce((val, o) => {
      // only count this seller's item sub-volumes
      const sellerItemSum = o.items
        .filter((i) => i.sellerId === currentUser.id)
        .reduce((sum, i) => sum + i.price * i.quantity, 0);
      return val + sellerItemSum;
    }, 0);

  // 92% payouts after 8% commission models
  const netEarnings = Math.round(totalSalesVolume * 0.92);

  const activeCount = sellerProducts.filter((p) => p.stock > 0).length;

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!name || !price || !category || !size || !condition) {
      setFormError("Aray, please fill in all essential garment specifications.");
      return;
    }

    // PKR strict limit
    if (Number(price) > 8000) {
      setFormError("Pricing Constraint Violation: The second-hand marketplace price limit is PKR 8,000.");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          brand: brand || "Curated",
          category,
          size,
          condition,
          description,
          images: imageUrl ? [imageUrl] : undefined,
          sellerId: currentUser.id,
          sellerName: currentUser.name
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to catalog item.");
      }

      onRefreshData();
      setSuccessMsg("Excellent! The garment has been cataloged successfully and is instantly live for Pakistani customers.");
      // reset form
      setName("");
      setPrice("");
      setBrand("");
      setDescription("");
      setImageUrl("");
    } catch (err: any) {
      setFormError(err.message || "An unexpected database entry error occurred.");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (Number(editingItem.price) > 8000) {
      alert("Error: Price cannot exceed Pakistan digital thrift cap of PKR 8,000.");
      return;
    }

    try {
      const response = await fetch(`/api/products/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem)
      });

      if (response.ok) {
        onRefreshData();
        setEditingItem(null);
        alert("Product updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this clothing listing from Loopwear?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: "processing" | "delivered") => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Courier shipping triggers
  const handleShipOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrderId) return;

    try {
      const response = await fetch(`/api/orders/${shippingOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "shipped",
          courierName,
          trackingNumber
        })
      });

      if (response.ok) {
        onRefreshData();
        setShippingOrderId(null);
        setTrackingNumber("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnAction = async (returnId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Platform Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-950">Vintage Seller Studio</h2>
          <p className="text-xs text-gray-500">Shopify-styled management center for pre-loved fashion listings</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "analytics" ? "bg-white text-emerald-800 shadow" : "text-gray-650 hover:text-emerald-700"}`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveSubTab("manage")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "manage" ? "bg-white text-emerald-800 shadow" : "text-gray-650 hover:text-emerald-700"}`}
          >
            My Racks
          </button>
          <button
            onClick={() => setActiveSubTab("add")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "add" ? "bg-white text-emerald-800 shadow" : "text-gray-650 hover:text-emerald-700"}`}
          >
            + Item
          </button>
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "orders" ? "bg-white text-emerald-800 shadow" : "text-gray-650 hover:text-emerald-700"}`}
          >
            Orders ({sellerInboundOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab("returns")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${activeSubTab === "returns" ? "bg-white text-emerald-800 shadow" : "text-gray-650 hover:text-emerald-700"}`}
          >
            Refunds ({sellerReturns.length})
          </button>
        </div>
      </div>

      {/* SUB TAB 1: ANALYTICS */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* Bento analytics deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gross Sales Volume</span>
                <DollarSign className="h-5 w-5 text-emerald-600 bg-emerald-50 p-1 rounded-lg" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">PKR {totalSalesVolume.toLocaleString()}</p>
              <div className="text-[10px] text-gray-500">
                Value of all delivered custom orders
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Net Payouts (Est.)</span>
                <TrendingUp className="h-5 w-5 text-emerald-600 bg-emerald-50 p-1 rounded-lg" />
              </div>
              <p className="text-lg font-black font-mono text-emerald-700">PKR {netEarnings.toLocaleString()}</p>
              <div className="text-[10px] text-gray-500">
                After <strong className="font-bold">8% plat commission</strong> deduction
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">In-Stock Pieces</span>
                <Package className="h-5 w-5 text-indigo-600 bg-indigo-50 p-1 rounded-lg" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">{activeCount}</p>
              <div className="text-[10px] text-gray-500">
                Active listings in search indices
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inbound Requests</span>
                <CheckCircle className="h-5 w-5 text-amber-600 bg-amber-50 p-1 rounded-lg" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">
                {sellerInboundOrders.filter((o) => o.status !== "delivered").length}
              </p>
              <div className="text-[10px] text-gray-500">
                Orders requiring delivery packout
              </div>
            </div>
          </div>

          {/* High visual mini sale trends layout using built-in vector grids */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-950">Active Sales Trajectory</h3>
              <p className="text-xs text-gray-400">Track monthly earnings for sustainable fashion items</p>
            </div>
            {/* Custom SVG chart of area curve under the hood */}
            <div className="h-48 w-full border-b border-gray-100 flex items-end justify-between px-10 pt-5 relative">
              <div className="absolute left-0 bottom-10 right-0 border-t border-gray-50 -z-10"></div>
              <div className="absolute left-0 bottom-24 right-0 border-t border-gray-50 -z-10"></div>
              
              {/* Bars demonstrating trend */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 bg-emerald-100/50 hover:bg-emerald-250 transition h-14 rounded-t-lg relative group">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[9px] font-mono p-1 rounded opacity-0 group-hover:opacity-100">PKR 12.5K</span>
                </div>
                <span className="text-[10px] font-bold text-gray-450 uppercase">April</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 bg-emerald-200/50 hover:bg-emerald-250 transition h-20 rounded-t-lg relative group">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[9px] font-mono p-1 rounded opacity-0 group-hover:opacity-100">PKR 18.2K</span>
                </div>
                <span className="text-[10px] font-bold text-gray-450 uppercase">May</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 bg-emerald-800 hover:bg-emerald-950 transition h-32 rounded-t-lg relative group">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[9px] font-mono p-1 rounded opacity-0 group-hover:opacity-100">PKR 35.8K</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-900 uppercase font-extrabold flex items-center gap-0.5">June <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: PORT CATALOGING */}
      {activeSubTab === "add" && (
        <div className="bg-white border border-gray-100 p-6 rounded-2xl max-w-xl mx-auto shadow-xs text-left space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-gray-950 uppercase tracking-widest flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-800" /> Catalog Pre-Loved Fashion
            </h3>
            <p className="text-[11px] text-gray-500">Every item must represent high clean hygiene and capped at PKR 8000</p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Garment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Classic Ochre Ribbed Corduroy Overshirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Listing Price (PKR)</label>
                <input
                  type="number"
                  placeholder="Max 8000"
                  max="8000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Original Brand (or Thrifted)</label>
                <input
                  type="text"
                  placeholder="e.g. Levi's, Zara, Outfitters"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                >
                  <option value="Shirts">Shirts</option>
                  <option value="Pants">Pants</option>
                  <option value="Jackets">Jackets</option>
                  <option value="Hoodies">Hoodies</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Bags">Bags</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Size</label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, 32, 10 US"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hygiene Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Like New", "Gently Used", "Worn"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCondition(val as ProductCondition)}
                      className={`p-2 rounded-lg border text-xs font-bold transition text-center ${
                        condition === val
                          ? "bg-emerald-950 text-white border-emerald-950"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Garment Picture Link (Unsplash/Web image)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2 focus:border-emerald-500"
                />
                <p className="text-[9px] text-gray-400 leading-none">Leave empty to use high-quality default catalog image.</p>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description and Fabric Details</label>
                <textarea
                  placeholder="Fleece lining is thick, sanitized pre-shrunk cotton, zero marks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-gray-200 bg-gray-50/50 p-2.5 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white py-2.5 text-xs font-bold transition shadow"
            >
              Expose to Marketplace
            </button>
          </form>
        </div>
      )}

      {/* SUB TAB 3: MANAGE RACKS LISTINGS */}
      {activeSubTab === "manage" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="font-bold text-sm text-gray-990">Curated Active Rack listings</h3>
              <p className="text-[11px] text-gray-500">Edit prices, size classifications or verify stocks</p>
            </div>
            <span className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded font-bold">
              Pieces total: {sellerProducts.length}
            </span>
          </div>

          {editingItem ? (
            <form onSubmit={handleUpdateProduct} className="bg-white p-5 border rounded-2xl space-y-4 max-w-md">
              <h4 className="font-bold text-xs uppercase text-gray-700">Quick Edit Piece Specs</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Title</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full text-xs border rounded p-1.5 focus:outline-emerald-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Price PKR</label>
                    <input
                      type="number"
                      max="8000"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                      className="w-full text-xs font-bold border rounded p-1.5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Stock</label>
                    <input
                      type="number"
                      value={editingItem.stock}
                      onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                      className="w-full text-xs border rounded p-1.5"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 text-center py-2 border rounded-xl text-xs bg-gray-50 hover:bg-gray-150 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-850 text-white text-center py-2 rounded-xl text-xs font-bold hover:bg-emerald-950"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : sellerProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3 bg-white">
              <Plus className="h-8 w-8 text-emerald-850 mx-auto" strokeWidth={1} />
              <p className="text-xs text-gray-500">Your rack of second-hand items is empty. Add your first item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.map((p) => (
                <div key={p.id} className="bg-white border rounded-2xl overflow-hidden p-4 flex flex-col justify-between">
                  <div className="flex gap-3 text-left">
                    <img src={p.images[0]} alt={p.name} className="h-14 w-14 object-cover rounded bg-gray-50 shrink-0 border" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="text-[9px] font-mono whitespace-nowrap bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold">
                        {p.condition} Condition
                      </span>
                      <h4 className="font-bold text-xs truncate text-gray-955">{p.name}</h4>
                      <p className="text-[10px] font-mono font-bold text-emerald-800">PKR {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-50 mt-4 pt-3 flex justify-between items-center gap-2">
                    <span className="text-[10px] text-gray-500">Stock count: <strong className="font-extrabold text-gray-900">{p.stock}</strong></span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingItem(p)}
                        className="p-1 rounded hover:bg-emerald-50 text-emerald-850"
                        title="Edit Spec"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 rounded hover:bg-rose-50 text-rose-600"
                        title="Remove Gear"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 4: ORDERS CONTROL */}
      {activeSubTab === "orders" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="font-bold text-sm text-gray-990">Inbound Customer Purchase Orders</h3>
              <p className="text-[11px] text-gray-500">Pack garments, manage courier states and TCS tracker info</p>
            </div>
          </div>

          {sellerInboundOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center bg-white">
              <p className="text-xs text-gray-400">No purchase records logged to your rack items yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerInboundOrders.map((o) => {
                const myInvoicedItems = o.items.filter((item) => item.sellerId === currentUser.id);

                return (
                  <div key={o.id} className="bg-white border rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-gray-650 bg-gray-50 py-1 px-2 rounded">
                          ORDER SPEC: #{o.id}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">Address: {o.deliveryAddress}, {o.city} | Mobile: {o.phoneNumber}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        o.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                        o.status === "shipped" ? "bg-yellow-50 text-yellow-750" :
                        "bg-sky-50 text-sky-700"
                      }`}>
                        Stage: {o.status}
                      </span>
                    </div>

                    {/* My sales items nested */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">My Items Purchased</p>
                      {myInvoicedItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-xs">
                          <img src={item.image} alt={item.name} className="h-8 w-8 object-cover rounded shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <span className="font-mono text-gray-950">PKR {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery updates controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {o.status === "pending" && (
                          <button
                            onClick={() => handleOrderStatusUpdate(o.id, "processing")}
                            className="bg-emerald-800 text-white rounded px-3 py-1 font-bold text-[10px] shadow"
                          >
                            Mark: Packed / Processing
                          </button>
                        )}
                        {o.status === "processing" && (
                          <button
                            onClick={() => {
                              setShippingOrderId(o.id);
                              setTrackingNumber(`TCS${Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                            className="bg-amber-600 font-bold text-white rounded px-3 py-1 text-[10px] shadow flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" /> Ship using TCS/Leopards
                          </button>
                        )}
                        {o.status === "shipped" && (
                          <button
                            onClick={() => handleOrderStatusUpdate(o.id, "delivered")}
                            className="bg-emerald-950 font-bold text-white rounded px-3 py-1 text-[10px] shadow"
                          >
                            Mark: Delivered
                          </button>
                        )}
                      </div>

                      {/* Display active carrier */}
                      {o.trackingNumber && (
                        <div className="text-[10px] text-gray-500 font-mono tracking-wide">
                          Carrier: {o.courierName} / tracking PIN: {o.trackingNumber}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Courier logistics form popup */}
          {shippingOrderId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form onSubmit={handleShipOrderSubmit} className="bg-white rounded-2xl max-w-sm w-full p-6 text-left space-y-4">
                <h4 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-emerald-850" /> Dispatch Sustainable Order
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Courier Operator</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full border rounded p-1.5 text-xs bg-white focus:border-emerald-500"
                    >
                      <option value="TCS Express">TCS Express (Courier Pakistan)</option>
                      <option value="Leopards Courier">Leopards Courier (Fast Flat)</option>
                      <option value="M&P Logistics">M&P Logistics</option>
                      <option value="Post Pakistan">Post Pakistan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logistic Tracking Code</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                      placeholder="e.g. TCS09048325"
                      className="w-full border rounded p-1.5 font-mono"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShippingOrderId(null)}
                    className="flex-1 py-1.5 border hover:bg-gray-50 rounded text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded text-xs font-bold"
                  >
                    Dispatch Carton
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 5: RETURNS / REFUND DISPUTES */}
      {activeSubTab === "returns" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h3 className="font-bold text-sm text-gray-990">Logged Hygiene & Return Claims</h3>
              <p className="text-[11px] text-gray-500">Approve or reject customer refund tickets securely</p>
            </div>
          </div>

          {sellerReturns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center bg-white">
              <p className="text-xs text-gray-400">Zero return requests registered for your items currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sellerReturns.map((r) => (
                <div key={r.id} className="bg-white border rounded-2xl p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono bg-orange-50 text-orange-700 px-2 py-0.5 rounded uppercase font-bold">
                        Claim Ticket: #{r.id}
                      </span>
                      <span className={`text-[10px] font-bold capitalize ${
                        r.status === "approved" ? "text-emerald-700 font-extrabold" :
                        r.status === "rejected" ? "text-rose-600 font-extrabold" : "text-amber-600"
                      }`}>
                        State: {r.status}
                      </span>
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-gray-900">{r.productName}</h4>
                      <p className="text-[11px] text-gray-500">Sold for: PKR {r.productPrice.toLocaleString()} | Customer: {r.customerName}</p>
                    </div>
                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded italic">
                      "Reason: {r.reason}"
                    </p>
                  </div>

                  {r.status === "pending" && (
                    <div className="flex gap-2 border-t mt-4 pt-3">
                      <button
                        onClick={() => handleReturnAction(r.id, "rejected")}
                        className="flex-1 border text-center py-1.5 text-[10px] font-bold rounded text-rose-600 hover:bg-rose-50"
                      >
                        Refuse Refund
                      </button>
                      <button
                        onClick={() => handleReturnAction(r.id, "approved")}
                        className="flex-1 bg-emerald-800 text-white text-center py-1.5 text-[10px] font-bold rounded hover:bg-emerald-950"
                      >
                        Authorize & Restock
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
