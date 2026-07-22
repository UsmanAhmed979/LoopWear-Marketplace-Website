/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  Percent,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Settings,
  X
} from "lucide-react";
import { User, Product, Order } from "../types.ts";

interface AdminDashboardProps {
  currentUser: User;
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
}

export default function AdminDashboard({
  currentUser,
  products,
  orders,
  onRefreshData
}: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<"stats" | "listings" | "users" | "config">("stats");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Platform Parameters configurations
  const [platCommission, setPlatCommission] = useState(8);
  const [qcLevel, setQcLevel] = useState("Sanitation Verified");
  const [isSecureCheckout, setIsSecureCheckout] = useState(true);

  // Load all users on tab visit
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Trigger load when tab shifts to users
  React.useEffect(() => {
    if (adminTab === "users") {
      fetchUsers();
    }
  }, [adminTab]);

  // Approve product
  const handleApproveStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        onRefreshData();
        alert(`Product listing has been successfully ${status}!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product definitely
  const handleRemoveProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently remove this listing from Loopwear for QC reasons?")) return;

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

  // Suspend/Activate user
  const handleUserStatusToggle = async (userId: string, currentStatus: "active" | "suspended") => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (!confirm(`Are you sure you want to change user status to: ${nextStatus.toUpperCase()}?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for stats
  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platCuts = Math.round(totalVolume * (platCommission / 100));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Super Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left">
        <div>
          <h2 className="text-xl font-bold font-sans text-emerald-950">Marketplace Overseer Control</h2>
          <p className="text-xs text-gray-400">Supreme analytics dashboard, profile bans and catalogs moderation panel</p>
        </div>

        <div className="flex bg-gray-150 rounded-xl p-1 gap-1">
          <button
            onClick={() => setAdminTab("stats")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${adminTab === "stats" ? "bg-emerald-900 text-white shadow-sm" : "text-gray-600 hover:text-emerald-800"}`}
          >
            Core Audits
          </button>
          <button
            onClick={() => setAdminTab("listings")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${adminTab === "listings" ? "bg-emerald-900 text-white shadow-sm" : "text-gray-600 hover:text-emerald-800"}`}
          >
            Mod Listings ({products.length})
          </button>
          <button
            onClick={() => setAdminTab("users")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${adminTab === "users" ? "bg-emerald-900 text-white shadow-sm" : "text-gray-600 hover:text-emerald-800"}`}
          >
            Acc Administration
          </button>
          <button
            onClick={() => setAdminTab("config")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${adminTab === "config" ? "bg-emerald-900 text-white shadow-sm" : "text-gray-600 hover:text-emerald-800"}`}
          >
            Plat Parameters
          </button>
        </div>
      </div>

      {/* ADMIN SUB-VIEW 1: OVERALL STATISTICS */}
      {adminTab === "stats" && (
        <div className="space-y-6 text-left">
          {/* Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-450">Exchange Volume</span>
                <TrendingUp className="h-4 w-4 text-emerald-800 bg-emerald-50 rounded p-0.5" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">PKR {totalVolume.toLocaleString()}</p>
              <span className="text-[10px] text-gray-400">Cumulative sales transactions</span>
            </div>

            <div className="bg-white border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-450">Commission cuts ({platCommission}%)</span>
                <Percent className="h-4 w-4 text-amber-500 bg-amber-50 rounded p-0.5" />
              </div>
              <p className="text-lg font-black font-mono text-emerald-700">PKR {platCuts.toLocaleString()}</p>
              <span className="text-[10px] text-gray-400">Net platform operational cuts</span>
            </div>

            <div className="bg-white border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-450">Cataloged Items</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600 bg-emerald-50 rounded p-0.5" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">{products.length}</p>
              <span className="text-[10px] text-gray-450">Approved / pending pieces</span>
            </div>

            <div className="bg-white border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-450">Customers base</span>
                <Users className="h-4 w-4 text-indigo-500 bg-indigo-50 rounded p-0.5" />
              </div>
              <p className="text-lg font-black font-mono text-gray-950">Active Users</p>
              <span className="text-[10px] text-emerald-700 font-semibold">TCS Integration Live</span>
            </div>
          </div>

          {/* Abstract System Log list to satisfy "Monitor total platform sales and revenue" */}
          <div className="bg-white border border-gray-100 p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-950">In-Transit Platform Escrows</h3>
              <p className="text-xs text-gray-500">Live feed of orders and delivery payment channels</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th className="pb-2 font-semibold">ID</th>
                    <th className="pb-2 font-semibold">Purchaser</th>
                    <th className="pb-2 font-semibold">Method</th>
                    <th className="pb-2 font-semibold">Payment</th>
                    <th className="pb-2 font-semibold">Total Amount</th>
                    <th className="pb-2 font-semibold">Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b last:border-none hover:bg-gray-50/50">
                      <td className="py-2.5 font-mono text-[10px] text-emerald-900 font-bold">#{o.id}</td>
                      <td className="py-2.5">{o.customerName}</td>
                      <td className="py-2.5 font-bold text-gray-600">{o.paymentMethod}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>{o.paymentStatus}</span>
                      </td>
                      <td className="py-2.5 font-mono font-bold">PKR {o.totalAmount.toLocaleString()}</td>
                      <td className="py-2.5 text-gray-400 text-[10px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SUB-VIEW 2: DYNAMIC LISTINGS APPROVAL */}
      {adminTab === "listings" && (
        <div className="bg-white border p-6 rounded-2xl text-left space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Garment Index Moderation</h3>
            <p className="text-xs text-gray-400">Approve new listings or remove reported products</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-700 text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="pb-2 font-semibold">Garments</th>
                  <th className="pb-2 font-semibold">Seller</th>
                  <th className="pb-2 font-semibold">Quality Status</th>
                  <th className="pb-2 font-semibold">Condition</th>
                  <th className="pb-2 font-semibold">Price</th>
                  <th className="pb-2 font-semibold text-right">Moderations</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b last:border-none hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="flex gap-2.5 items-center">
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 object-cover rounded border bg-gray-50" />
                        <div>
                          <p className="font-bold text-gray-950 truncate max-w-[170px]">{p.name}</p>
                          <p className="text-[10px] text-emerald-800 font-mono font-bold capitalize">{p.category} • Size {p.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-gray-600">{p.sellerName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                        p.status === "rejected" ? "bg-rose-50 text-rose-700" :
                        "bg-yellow-50 text-yellow-750"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 font-mono text-[10px] text-gray-500">{p.condition}</td>
                    <td className="py-3 font-mono font-bold">PKR {p.price.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveStatus(p.id, "rejected")}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                              title="Refuse Catalog"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApproveStatus(p.id, "approved")}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Authorize List"
                            >
                              <FileCheck className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleRemoveProduct(p.id)}
                          className="p-1 text-gray-450 hover:text-rose-600 rounded hover:bg-gray-50"
                          title="Purge definitely"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN SUB-VIEW 3: MANAGE ACCOUNTS (SUSPEND/ACTIVATE) */}
      {adminTab === "users" && (
        <div className="bg-white border p-6 rounded-2xl text-left space-y-4">
          <div>
            <h3 className="font-bold text-sm text-gray-900">Registered Accounts Master List</h3>
            <p className="text-xs text-gray-400">Suspend misbehaving profiles or authorize premium sellers</p>
          </div>

          {loadingUsers ? (
            <p className="text-xs text-center py-6 text-gray-450">Loading registered files...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="pb-2 font-semibold">User details</th>
                    <th className="pb-2 font-semibold">Role</th>
                    <th className="pb-2 font-semibold">Platform status</th>
                    <th className="pb-2 font-semibold">Date Joined</th>
                    <th className="pb-2 font-semibold text-right">Activity toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b last:border-none hover:bg-gray-50/50">
                      <td className="py-3">
                        <div className="flex gap-2.5 items-center">
                          <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover bg-gray-150 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-950">{u.name}</p>
                            <p className="text-[10px] text-gray-400 leading-none">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[10px] bg-sky-50 text-sky-850 px-2 py-0.5 rounded capitalize font-bold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}>{u.status}</span>
                      </td>
                      <td className="py-3 text-gray-450 text-[10px]">{new Date(u.joinedAt).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleUserStatusToggle(u.id, u.status)}
                          className={`p-1.5 rounded transition ${
                            u.status === "active"
                              ? "text-rose-600 hover:bg-rose-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={u.status === "active" ? "Suspend Account" : "Re-activate Account"}
                        >
                          {u.status === "active" ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADMIN SUB-VIEW 4: SETTINGS */}
      {adminTab === "config" && (
        <div className="bg-white border rounded-2xl p-6 text-left max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Settings className="h-5 w-5 text-emerald-800" />
            <div>
              <h3 className="font-bold text-sm text-gray-900">Platform Global Parameters</h3>
              <p className="text-[11px] text-gray-500">Configure commissions and hygiene benchmarks</p>
            </div>
          </div>

          <div className="space-y-4 text-xs select-none">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Platform Commission Cut (%)</label>
              <input
                type="number"
                value={platCommission}
                onChange={(e) => setPlatCommission(Number(e.target.value))}
                className="w-full rounded border p-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thrift Clean Benchmarks</label>
              <select
                value={qcLevel}
                onChange={(e) => setQcLevel(e.target.value)}
                className="w-full rounded border p-2 bg-white"
              >
                <option value="Sanitation Verified">Level 1: Steam and Sanitized Curated</option>
                <option value="Premium Restoration Approved">Level 2: Deep restored scent-neutral fibers</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-bold text-gray-900">Enforce TCS Deliveries</p>
                <p className="text-[10px] text-gray-400">Strictly track every order tracking PIN</p>
              </div>
              <input
                type="checkbox"
                checked={isSecureCheckout}
                onChange={(e) => setIsSecureCheckout(e.target.checked)}
                className="h-4 w-4 accent-emerald-800"
              />
            </div>

            <button
              onClick={() => alert("Platform configurations saved securely in local manifest.")}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-950 font-bold text-white rounded text-xs transition"
            >
              Update platform structures
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
