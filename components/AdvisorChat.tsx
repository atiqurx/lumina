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
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    })();
  }, [propConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [history]);

  async function send() {
    const question = input.trim();
    if (!question || !userId) return;

    setInput("");
    setIsLoading(true);
    // show placeholder
    setHistory((h) => [...h, { user: question, bot: "..." }]);

    try {
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
    } catch (error) {
      // Update the placeholder with error message
      setHistory((h) => {
        const copy = [...h];
        copy[copy.length - 1].bot =
          "⚠️ Failed to get response. Please try again.";
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-orange-400 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">AI Academic Advisor</h2>
      </div>

      {/* Messages */}
      <div
        id="messages-container"
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {history.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full p-8 text-gray-700">
            <div className="max-w-lg text-center space-y-4">
              <h1 className="text-2xl font-semibold">
                Hi, I’m your AI Academic Advisor.
              </h1>
              <p className="text-gray-500">
                Here are some example questions that I can help you with:
              </p>
              <ul className="list-disc list-inside text-left space-y-1 text-gray-600">
                <li>
                  What classes should a first-year computer science major take?
                </li>
                <li>
                  How can I enroll in classes I don't have prereqs for if I plan
                  to take the prereqs over the summer?
                </li>
                <li>
                  I wanna go into Cyber Security what courses do you recommend?
                </li>
                <li>What are the prerequisites for CSE 4380?</li>
              </ul>
            </div>
          </div>
        )}

        {isLoading && history.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-400">
              Loading conversation...
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className="space-y-3">
            {msg.user && (
              <div className="flex justify-end">
                <div className="bg-orange-100 p-3 rounded-lg max-w-[80%]">
                  <p className="text-gray-800">{msg.user}</p>
                </div>
              </div>
            )}
            {msg.bot && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                  <p className="text-gray-800">
                    {msg.bot === "..." ? (
                      <span className="flex items-center">
                        <span className="animate-pulse">Advisor is typing</span>
                        <span className="inline-flex ml-2">
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                          <span
                            className="h-2 w-2 bg-gray-400 rounded-full animate-bounce mr-1"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                          <span
                            className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></span>
                        </span>
                      </span>
                    ) : (
                      msg.bot
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex items-center">
          <input
            className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && send()}
            disabled={!userId || isLoading}
            placeholder={userId ? "Type your question…" : "Loading…"}
          />
          <button
            className="px-6 py-3 bg-orange-500 text-white rounded-r-lg hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:bg-orange-400"
            onClick={send}
            disabled={!userId || !input.trim() || isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Send
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
