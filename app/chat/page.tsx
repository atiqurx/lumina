"use client";

import { useState } from "react";
import { ChatHistoryList } from "@/components/ChatHistoryList";
import { AdvisorChat } from "@/components/AdvisorChat";

export default function DashboardPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* History Column */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="font-semibold">History</h2>
          <button
            onClick={() => setConversationId(null)}
            className="text-sm text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
          >
            New
          </button>
        </div>
        <ChatHistoryList onSelect={setConversationId} />
      </aside>

      {/* Chat Column */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* <header className="p-4 border-b">
          <h1 className="text-2xl font-bold">AI Academic Advisor</h1>
        </header> */}
        <div className="flex-1 min-h-0">
          <AdvisorChat conversationId={conversationId} />
        </div>
      </main>
    </div>
  );
}
