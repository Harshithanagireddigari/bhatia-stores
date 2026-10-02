"use client";

import { useState } from "react";
import { MessageSquare, Bot, X, Send, Sparkles, Tag, Package, Headphones, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
};

export default function AIChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: "Hi! I'm Bhatia AI 🤖 Your Shopping Assistant. I can help you find products, check live order status, explore coupon offers, or connect with our support team!",
    },
  ]);

  function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = { id: `usr_${Date.now()}`, sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // Generate intelligent AI response based on query
    setTimeout(() => {
      let aiText = "I'm here to assist! Let me know if you need help with products, coupons, or order tracking.";
      const lower = query.toLowerCase();

      if (lower.includes("faucet") || lower.includes("under 1000") || lower.includes("1000") || lower.includes("price")) {
        aiText = "Looking for premium faucets under ₹1,000? We have wall-mounted and single-lever brass taps starting from ₹450! I can redirect you to our Faucets & Taps catalog.";
        setTimeout(() => router.push("/shop?category=Faucets%20%26%20Taps"), 1500);
      } else if (lower.includes("order") || lower.includes("status") || lower.includes("track")) {
        aiText = "You can view your order tracking details anytime in your My Orders section or Delivery Agent Portal. Redirecting to your orders...";
        setTimeout(() => router.push("/orders"), 1500);
      } else if (lower.includes("offer") || lower.includes("coupon") || lower.includes("discount")) {
        aiText = "🎉 Current active offers: Use WELCOME10 for 10% OFF on your first order (min. ₹2,000), or BATH500 for ₹500 OFF on bathroom tiles!";
      } else if (lower.includes("human") || lower.includes("support") || lower.includes("call")) {
        aiText = "You can talk to our hardware support team on WhatsApp at +91 98765 43210 or email us at support@bhatias.com!";
      }

      const aiMsg: Message = { id: `ai_${Date.now()}`, sender: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#b49663] to-[#8c7143] px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot size={20} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <span>Bhatia AI Assistant</span>
        </button>
      )}

      {/* Chatbot Popover (Matches Image 9) */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-[#1a1613]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-[#251f1a] p-4 text-white dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b49663] text-white shadow">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm">Bhatia AI</h3>
                <p className="text-[10px] text-stone-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Your Shopping Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-[#faf8f5] dark:bg-[#14110e]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm ${
                    m.sender === "user"
                      ? "bg-[#b49663] text-white font-medium"
                      : "bg-white text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Option Chips (Matches Image 9) */}
          <div className="border-t border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-[#1a1613] space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              {[
                "Find bathroom faucets under ₹1,000",
                "Check my order status",
                "Show current offers",
                "Talk to human support",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-semibold text-stone-700 hover:border-[#b49663] hover:bg-amber-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 transition text-left"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative mt-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-full border border-stone-200 bg-stone-50 py-2.5 pl-4 pr-10 text-xs text-stone-900 outline-none focus:border-[#b49663] dark:border-stone-800 dark:bg-stone-900 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#b49663] text-white hover:bg-[#967b4b] transition"
              >
                <Send size={13} />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
