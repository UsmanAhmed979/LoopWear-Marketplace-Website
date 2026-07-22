/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShoppingBag, Search, Bell, Sparkles, LogOut, User as UserIcon, RefreshCw, Layers } from "lucide-react";
import { User } from "../types.ts";

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onSelectRole: (role: "customer" | "seller" | "admin" | null) => void;
  notifications: any[];
  onMarkRead: (id: string) => void;
  onOpenStylist: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  currentUser,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onLogout,
  onSearch,
  onSelectRole,
  notifications,
  onMarkRead,
  onOpenStylist,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Shortcut login helper for evaluation
  const loginPreviewAs = (role: "customer" | "seller" | "admin") => {
    onSelectRole(role);
    setShowProfile(false);
  };

  return (
    <header id="loopwear-header" className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      {/* Quick Role Tester Bar (Promotes transparent seamless sandbox preview toggling) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold tracking-wide uppercase">Loopwear Sandbox Environment:</span>
          <span>Click to switch logged-in roles instantly for testing:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loginPreviewAs("customer")}
            className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
              currentUser?.role === "customer"
                ? "bg-emerald-500 text-white font-bold"
                : "bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200"
            }`}
          >
            Customer (Usman PK)
          </button>
          <button
            onClick={() => loginPreviewAs("seller")}
            className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
              currentUser?.role === "seller"
                ? "bg-emerald-500 text-white font-bold"
                : "bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200"
            }`}
          >
            Seller (Vintage Vault)
          </button>
          <button
            onClick={() => loginPreviewAs("admin")}
            className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
              currentUser?.role === "admin"
                ? "bg-emerald-500 text-white font-bold"
                : "bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200"
            }`}
          >
            Admin (Super Controller)
          </button>
          {currentUser && (
            <button
              onClick={onLogout}
              className="text-[10px] text-emerald-400 hover:text-emerald-200 ml-2 underline underline-offset-2 flex items-center gap-1"
            >
              <LogOut className="h-2.5 w-2.5" /> Logout
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              onSelectRole(null);
              setActiveTab("home");
            }}
            className="flex flex-col items-start focus:outline-none"
          >
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-mono text-xl font-black tracking-tighter text-gray-900 leading-none">
                LOOP<span className="text-emerald-600">WEAR</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 leading-none">
                Thrift PK
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 font-mono tracking-tight mt-0.5 uppercase">
              "Loop it, dont lose it "
            </span>
          </button>

          {/* Quick Nav (Only if Customer or anonymous) */}
          {(!currentUser || currentUser.role === "customer") && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button
                onClick={() => setActiveTab("home")}
                className={`hover:text-emerald-600 transition ${activeTab === "home" ? "text-emerald-600 font-semibold" : ""}`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`hover:text-emerald-600 transition ${activeTab === "orders" ? "text-emerald-600 font-semibold" : ""}`}
              >
                My Orders
              </button>
              <button
                onClick={onOpenStylist}
                className="hover:text-emerald-600 transition flex items-center gap-1 text-emerald-700"
              >
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
                Rida Stylist
              </button>
            </nav>
          )}
        </div>

        {/* Global Search Bar - customer side */}
        {(!currentUser || currentUser.role === "customer") && (
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative max-w-sm w-full mx-8">
            <input
              type="text"
              placeholder="Search vintage clothing, boots, accessories..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-1.5 pl-4 pr-10 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none transition"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600">
              <Search className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenStylist}
            className="flex sm:hidden items-center justify-center p-2 rounded-full text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
            title="Ask Rida Stylist"
          >
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          </button>

          {/* Cart Icon (Customer Only) */}
          {(!currentUser || currentUser.role === "customer") && (
            <button
              onClick={onOpenCart}
              className="group relative p-2 text-gray-600 hover:text-emerald-600 transition"
              id="navbar-cart-btn"
            >
              <ShoppingBag className="h-5 w-5 stroke-[2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown Container */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotif(!showNotif);
                  setShowProfile(false);
                }}
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="flex items-center justify-between border-b border-gray-50 px-3 py-2 text-xs font-semibold text-gray-900">
                    <span>Notifications ({unreadNotifs.length})</span>
                    <button onClick={() => setShowNotif(false)} className="text-[10px] text-gray-400 hover:text-emerald-600">
                      Close
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto pt-1">
                    {notifications.length === 0 ? (
                      <p className="py-8 text-center text-xs text-gray-400">All caught up! No notifications.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkRead(n.id);
                          }}
                          className={`flex flex-col gap-0.5 p-2 rounded-lg text-left text-xs transition cursor-pointer mb-0.5 hover:bg-gray-50 ${
                            !n.read ? "bg-emerald-50/50 border-l-2 border-emerald-500" : ""
                          }`}
                        >
                          <div className="flex justify-between font-medium text-gray-900">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotif(false);
                }}
                className="flex items-center gap-2 rounded-full border border-gray-100 p-1 pr-2 hover:bg-gray-50 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full object-cover bg-emerald-100"
                />
                <span className="hidden md:inline text-xs font-semibold text-gray-700">
                  {currentUser.name.split(" ")[0]}
                </span>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="px-3 py-2 border-b border-gray-50 text-left">
                    <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-700 font-mono capitalize">{currentUser.role} Account</p>
                  </div>
                  <div className="py-1">
                    {currentUser.role === "customer" && (
                      <button
                        onClick={() => {
                          setActiveTab("orders");
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg text-left"
                      >
                        Order History
                      </button>
                    )}
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                    >
                      <span>Sign Out</span>
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              id="login-register-btn"
            >
              <UserIcon className="h-3.5 w-3.5" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
