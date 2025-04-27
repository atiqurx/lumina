// app/dashboard/page.tsx
"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdvisorChat } from "@/components/AdvisorChat";
import { ChatHistoryList } from "@/components/ChatHistoryList";
import DegreePlannerPage from "@/app/degree-planner/page";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  const [page, setPage] = useState<"chat" | "planner">("chat");
  const [collapsed, setCollapsed] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Custom Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r transition-width duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between h-16 px-4">
          {!collapsed && (
            <h2 className="text-xl font-bold text-black">Lumina</h2>
          )}
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 space-y-1">
          <button
            className={`flex items-center w-full px-3 py-2 rounded hover:bg-gray-100 ${
              page === "chat" ? "bg-gray-200" : ""
            }`}
            onClick={() => setPage("chat")}
          >
            <MessageCircle className="w-5 h-5 text-[#00693E]" />
            {!collapsed && <span className="ml-3">Chat</span>}
          </button>

          <button
            className={`flex items-center w-full px-3 py-2 rounded hover:bg-gray-100 ${
              page === "planner" ? "bg-gray-200" : ""
            }`}
            onClick={() => setPage("planner")}
          >
            <LayoutGrid className="w-5 h-5 text-[#00693E]" />
            {!collapsed && <span className="ml-3">Planner</span>}
          </button>
        </nav>

        {/* Logout / Profile */}
        <div className="p-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden">
        {/* <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <h1 className="text-2xl font-semibold text-gray-800">
            {page === "chat" ? "AI Academic Advisor" : "Degree Planner"}
          </h1>
        </header> */}

        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {page === "chat" ? (
            <>
              {/* Chat History Panel */}
              <div className="w-1/4 border-r overflow-auto">
                <ChatHistoryList onSelect={setConversationId} />
              </div>

              {/* Chat Window */}
              <div className="flex-1 p-4 flex flex-col">
                <AdvisorChat conversationId={conversationId} />
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto">
              <DegreePlannerPage />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
