// components/ChatHistoryList.tsx
"use client";

import { useState, useEffect } from "react";

type HistoryItem = {
  id: string;
  updatedAt: string;
};

export function ChatHistoryList({
  onSelect,
}: {
  onSelect: (conversationId: string) => void;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("luminaUserId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`/api/chat-history?userId=${userId}`)
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setItems(data.items || []);
        } catch (err) {
          console.error("Invalid JSON from /api/chat-history:", text);
          setItems([]);
        }
      })
      .catch((err) => {
        console.error("Network error fetching chat history:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4">Loading…</div>;
  }

  if (items.length === 0) {
    return <div className="p-4 text-gray-500">No history yet.</div>;
  }

  return (
    <div className="overflow-auto p-4">
      {items.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          className="block w-full text-left py-2 px-3 hover:bg-gray-100 rounded"
        >
          <div className="font-medium">Conversation {h.id.slice(-6)}</div>
          <div className="text-xs text-gray-500">
            {new Date(h.updatedAt).toLocaleString()}
          </div>
        </button>
      ))}
    </div>
  );
}
