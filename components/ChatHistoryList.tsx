"use client";

import { useState, useEffect } from "react";

type HistoryItem = {
  id: string;
  snippet: string;
};

export function ChatHistoryList({
  onSelect,
  selectedId,
}: {
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
          const fetched: HistoryItem[] = Array.isArray(data.items)
            ? data.items
            : [];
          setItems(fetched.slice().reverse());
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

  const filteredItems = searchTerm
    ? items.filter((item) =>
        item.snippet.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">History</h2>
        {/*  */}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-32 p-4">
            {searchTerm ? (
              <div>
                <p className="text-gray-500 mb-2">
                  No conversations match your search.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-orange-500 hover:text-orange-700 text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="h-8 w-8 text-gray-400 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-500">No conversation history yet.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Start a new chat to see it here.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`block w-full text-left py-3 px-4 hover:bg-gray-100 transition duration-150 focus:outline-none focus:bg-gray-100 ${
                  selectedId === item.id
                    ? "bg-orange-50 border-l-4 border-orange-500"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedId === item.id
                          ? "text-orange-600"
                          : "text-gray-800"
                      }`}
                    >
                      {item.snippet}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {/* Format relative date would go here */}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
