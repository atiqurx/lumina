// components/AdvisorChat.tsx
"use client";
import { useState } from "react";

export function AdvisorChat() {
  const [history, setHistory] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    const question = input.trim();
    if (!question) return;
    setInput("");

    // add user message
    setHistory((h) => [...h, { user: question, bot: "..." }]);

    // call our API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const { answer } = await res.json();

    // replace last placeholder
    setHistory((h) => {
      const copy = [...h];
      copy[copy.length - 1].bot = answer;
      return copy;
    });
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
          className="flex-grow border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about COSC 32, prerequisites, etc."
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="ml-2 px-4 bg-blue-600 text-white" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
