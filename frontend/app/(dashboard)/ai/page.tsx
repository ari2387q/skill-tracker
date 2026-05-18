"use client";

import { useEffect, useRef, useState } from "react";
import { aiApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
useEffect(() => {
  const loadHistory = async () => {
    try {
      const data = await aiApi.getHistory();
      setMessages(data.messages || []);
    } catch {
      // silent fail
    }
  };

  loadHistory();
}, []);

const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMessage: Message = { role: "user", content: input };

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setLoading(true);

  try {
    const data = await aiApi.send(userMessage.content);

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: data.response },
    ]);
  } catch {
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "⚠️ AI request failed." },
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 text-lg font-semibold">
          BroSKIL
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-900 rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-5 py-4 rounded-2xl shadow text-gray-500 animate-pulse">
                AI is thinking<span className="ml-1">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Skill Tracker AI anything…"
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm max-h-40"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
