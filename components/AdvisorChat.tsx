// components/AdvisorChat.tsx
"use client";

import { useState, useEffect } from "react";

export function AdvisorChat({
  conversationId: propConversationId,
}: {
  conversationId: string | null;
}) {
  const [history, setHistory] = useState<{ user: string; bot: string }[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    propConversationId
  );

  // load userId once
  useEffect(() => {
    setUserId(localStorage.getItem("luminaUserId"));
  }, []);

  // whenever propConversationId changes, fetch its messages
  useEffect(() => {
    setConversationId(propConversationId);
    if (!propConversationId) {
      setHistory([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/chat-history/${propConversationId}`);
        const data = await res.json();
        // map the raw history into your UI shape
        setHistory(
          (data.history || []).map((m: any) => ({
            user: m.role === "user" ? m.message : "",
            bot: m.role === "bot" ? m.message : "",
          }))
        );
      } catch (err) {
        console.error("Failed to load conversation:", err);
        setHistory([]);
      }
    })();
  }, [propConversationId]);

  async function send() {
    const question = input.trim();
    if (!question || !userId) return;

    setInput("");
    // show placeholder
    setHistory((h) => [...h, { user: question, bot: "..." }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, question, conversationId }),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from chat API:", text);
      data = {};
    }

    // capture new conversationId if first message
    if (data.conversationId) {
      setConversationId(data.conversationId);
    }
    const answer = data.answer || "⚠️ No answer";

    // update last placeholder
    setHistory((h) => {
      const copy = [...h];
      copy[copy.length - 1].bot = answer;
      return copy;
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {history.map((msg, i) => (
          <div key={i}>
            {msg.user && (
              <p>
                <strong>You:</strong> {msg.user}
              </p>
            )}
            {msg.bot && (
              <p>
                <strong>Advisor:</strong> {msg.bot}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* input */}
      <div className="p-4 border-t flex">
        <input
          className="flex-grow border p-2 mr-2 disabled:opacity-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={!userId}
          placeholder={userId ? "Type your question…" : "Loading…"}
        />
        <button
          className="px-4 bg-blue-600 text-white disabled:opacity-50"
          onClick={send}
          disabled={!userId || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
