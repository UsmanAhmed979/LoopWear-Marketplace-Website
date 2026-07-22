/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Send, X, ArrowRight, User, ShoppingCart, RefreshCw } from "lucide-react";
import { Product } from "../types.ts";

interface GeminiStylistProps {
  onClose: () => void;
  inventory: Product[];
  onSelectProduct: (p: Product) => void;
}

export default function GeminiStylist({ onClose, inventory, onSelectProduct }: GeminiStylistProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "rida"; text: string; products?: Product[] }>>([
    {
      sender: "rida",
      text: "Asalam-o-Alaikum! I'm **Rida**, your Loopwear Sustainable Fashion Stylist from Pakistan. 🌿✨ We are on a mission to circularize fashion in Karachi, Lahore, and Islamabad!\n\nTell me: what vibe or occasion are you styling for today? Or pick one of our local premium curated themes below so I can analyze our actual second-hand stock for you:"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [stylePreference, setStylePreference] = useState("Streetwear");
  const [budgetLimit, setBudgetLimit] = useState(8000);
  const [loading, setLoading] = useState(false);

  const localStyleSuggestions = [
    { label: "🍔 Gulberg Cafe Streetwear", prompt: "I need a stylish warm layered streetwear outfit for a cold Lahore night hanging out with friends around Gulberg." },
    { label: "🌊 Clifton Breezy Casual", prompt: "Looking for an ultra-breathable, lightweight casual look suited for hot Clifton Karachi ocean breeze." },
    { label: "🎓 Askari University Chill", prompt: "Suggest a sleek oversized minimalist vintage campus aesthetic for university wearing under a mid budget." },
    { label: "☕ Islamabad Winter Cozy", prompt: "Looking for a heavy flannel, wool jacket, or comfortable retro hoodie suited for Islamabad aesthetic winter." }
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue;
    if (!textToSend.trim()) return;

    // Push User Msg
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customPrompt) setInputValue("");

    setLoading(true);

    try {
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: textToSend,
          stylePreference,
          currentBudget: budgetLimit
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult stylist.");
      }

      const data = await response.json();

      // Look up matching product objects from inventory
      const matchingIds: string[] = data.recommendedProductIds || [];
      const recommendedItems = inventory.filter((item) => matchingIds.includes(item.id));

      setMessages((prev) => [
        ...prev,
        {
          sender: "rida",
          text: data.recommendationText,
          products: recommendedItems
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "rida",
          text: "Aray, I faced a minor signal error filtering the racks. Try checking out our **Classic Plaid Vintage Flannel Shirt** (PKR 1,850) or **Levi's Distressed Denim Jeans** (PKR 2,400) for a timeless, bulletproof streetwear pairing! 👖💫"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown link and bold styler helper
  const renderStyledText = (text: string) => {
    // Basic substitution for bolding and line endings
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let styledLine = line;
      // Bold converter **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-emerald-900 font-bold bg-emerald-50 px-1 py-0.5 rounded">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={idx} className="mb-2 leading-relaxed text-gray-700">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div id="gemini-stylist-panel" className="fixed right-0 bottom-0 top-0 sm:right-4 sm:top-20 sm:bottom-4 z-50 w-full max-w-md bg-white border border-gray-100 shadow-2xl flex flex-col sm:rounded-2xl overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-950 px-5 py-4 flex items-center justify-between text-white border-b border-emerald-900 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-emerald-200">AI Sustainable Stylist</h3>
            <h4 className="font-semibold text-sm leading-tight">Consult Rida Stylist</h4>
          </div>
        </div>
        <button onClick={onClose} className="text-emerald-100/75 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Controller Parameters (Inline configuration matching Amazon/Nike tailored selectors) */}
      <div className="bg-emerald-50/50 border-b border-gray-100 p-3 text-xs text-gray-600 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">Category Priority:</span>
            <select
              value={stylePreference}
              onChange={(e) => setStylePreference(e.target.value)}
              className="bg-white border border-gray-200 rounded px-1.5 py-0.5 focus:outline-emerald-500 font-medium"
            >
              <option value="Casual Streets">Casual Streets</option>
              <option value="90s Grunge">90s Grunge</option>
              <option value="Minimalist Core">Minimalist Core</option>
              <option value="Winter Retro">Winter Retro</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">Max Budget:</span>
            <input
              type="number"
              min="500"
              max="8000"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="bg-white border border-gray-200 rounded w-16 px-1.5 py-0.5 text-right focus:outline-emerald-500 font-bold"
            />
            <span className="font-mono text-[10px]">PKR</span>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
              msg.sender === "user"
                ? "bg-emerald-700 text-white rounded-br-none"
                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
            }`}>
              {/* Message Sender Title */}
              <div className="mb-1 opacity-75 font-mono text-[9px] uppercase tracking-wider">
                {msg.sender === "user" ? "You" : "🤖 Rida (Stylist)"}
              </div>

              {/* Message text with customized rendering */}
              <div className="space-y-1">
                {renderStyledText(msg.text)}
              </div>

              {/* Recommendations item deck list nested inside chatbubble (Very slick Shopify feature) */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1 mb-1.5">
                    <ShoppingCart className="h-3 w-3" /> Instantly wearable matches from our inventory:
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {msg.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onSelectProduct(p)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-100/40 text-left transition text-xs w-full focus:outline-none"
                      >
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 object-cover rounded-md bg-white border shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-950 truncate leading-snug">{p.name}</p>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-0.5">
                            <span className="font-mono font-semibold text-emerald-700">PKR {p.price.toLocaleString()}</span>
                            <span>Size: {p.size} ({p.condition})</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-emerald-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
              <span>Rida is auditing vintage clothing racks in Karachi...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested chips panel (Ideal for onboarding / zero friction queries) */}
      <div className="bg-white border-t border-gray-100 p-2.5 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
        {localStyleSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.prompt)}
            disabled={loading}
            className="text-[10px] font-medium bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 rounded-full px-2.5 py-1 transition shrink-0 disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Message Input Controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Type e.g., Looking for comfortable flannel shirts..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none transition disabled:opacity-75"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="rounded-xl bg-emerald-800 p-2 text-white hover:bg-emerald-950 focus:outline-none transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
