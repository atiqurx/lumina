// components/AdvisorChat.tsx
"use client";

import { useState, useEffect } from "react";

export function AdvisorChat() {
  const [history, setHistory] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // On mount, grab the userId you saved during onboarding
  useEffect(() => {
    const stored = localStorage.getItem("luminaUserId");
    setUserId(stored);
  }, []);

  async function send() {
    const question = input.trim();
    if (!question || !userId) return;

    setInput("");
    setHistory((h) => [...h, { user: question, bot: "..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userId }),
      });
      const { answer } = await res.json();
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1].bot = answer;
        return copy;
      });
    } catch (err) {
      console.error("Chat API error:", err);
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1].bot = "Oops—could not reach the advisor.";
        return copy;
      });
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2 max-h-80 overflow-auto">
        {history.map((msg, i) => (
          <div key={i}>
            <p>
              <strong>You:</strong> {msg.user}
            </p>
            <p>
              <strong>Advisor:</strong> {msg.bot}
            </p>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-grow border p-2 disabled:opacity-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            userId ? "Ask about COSC 32, prerequisites, etc." : "Loading user…"
          }
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={!userId}
        />
        <button
          className="ml-2 px-4 bg-blue-600 text-white disabled:opacity-50"
          onClick={send}
          disabled={!userId || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
