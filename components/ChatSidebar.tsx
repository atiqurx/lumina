"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Bot, Send, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Message = { role: "system" | "user" | "assistant"; content: string };

export interface CourseWithUid {
  uid: string;
  code: string;
  title: string;
  credits: number;
  prereqs: string[];
}

function isProfessorQuery(text: string) {
  return /\b(?:professor|prof|dr\.)\s+([A-Za-z]+\s?[A-Za-z]*)/i.test(text);
}
function extractProfessorName(text: string) {
  const m = text.match(/\b(?:professor|prof|dr\.)\s+([A-Za-z]+\s?[A-Za-z]*)/i);
  return m ? m[1] : "";
}

export function ChatSidebar({
  catalog,
  assignments,
}: {
  catalog: CourseWithUid[];
  assignments: Record<string, number>;
}) {
  const [collapsed, setCollapsed] = useState(true); // default collapsed
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextBlob = useMemo(() => {
    const courseLines = catalog.map(
      (c) =>
        `- ${c.code}: ${c.title} (${c.credits}cr)` +
        (c.prereqs.length ? ` prereqs: ${c.prereqs.join(", ")}` : "")
    );
    const planLines = Object.entries(assignments)
      .map(([uid, sem]) => {
        const course = catalog.find((c) => c.uid === uid);
        return course ? `Sem ${sem}: ${course.code}` : null;
      })
      .filter(Boolean) as string[];

    return `
Course catalog:
${courseLines.join("\n")}

Current plan:
${planLines.length ? planLines.join("\n") : "(none yet)"}
    `.trim();
  }, [catalog, assignments]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  async function sendMessage() {
    if (!draft.trim()) return;
    const text = draft.trim();
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setLoading(true);

    // Professor lookup
    if (isProfessorQuery(text)) {
      const profName = extractProfessorName(text);
      try {
        const res = await fetch("/api/professor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ professorName: profName }),
        });
        const data = await res.json();
        let reply: Message;
        if (res.ok) {
          reply = {
            role: "assistant",
            content: `🧑‍🏫 ${data.name}: ${data.rating}/5 ⭐ from ${
              data.reviews
            } reviews, ${Math.round(
              data.wouldTakeAgainPct
            )}% would take again, difficulty ${data.difficulty}/5.`,
          };
        } else {
          reply = {
            role: "assistant",
            content: `❗️Professor not found: ${profName}`,
          };
        }
        setMessages((m) => [...m, reply]);
      } catch (e: any) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `❗️Lookup error: ${e.message}` },
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Academic-advice flow
    const systemPrompt: Message = {
      role: "system",
      content: `
You are an expert academic advisor. Base your advice on the
course catalog and the student's current plan provided below.
Please keep every answer under two sentences—short, concise, and to the point.

${contextBlob}
      `.trim(),
    };
    const payload = { messages: [systemPrompt, ...messages, userMsg] };

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.reply?.content) {
        setMessages((m) => [...m, data.reply as Message]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "❗️Error: " + (data.error || "") },
        ]);
      }
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "❗️Network error: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`
        flex flex-col h-full bg-white border-l border-gray-200
        transition-all duration-300 ease-in-out shadow-md
        ${collapsed ? "w-16" : "w-80"}
      `}
    >
      {/* Header */}
      <header
        className={`
        flex items-center p-3 border-b border-gray-200
     
      `}
      >
        <div className="flex items-center">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-800">
                AI Advisor
              </h2>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1 hover:bg-gray-100 rounded-full transition-colors"
          title={collapsed ? "Open AI Assistant" : "Close AI Assistant"}
        >
          <Bot className="w-6 h-6 text-[#FF7D3B]" />
        </button>
      </header>

      {!collapsed && (
        <>
          {/* Messages Container */}
          <div className="flex-1 p-3 overflow-y-auto bg-[#FAFAFA]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Bot className="w-12 h-12 text-[#FFB38A] mb-3 opacity-50" />
                <p className="text-sm text-gray-500">
                  I'm your AI academic advisor. Ask me about courses,
                  prerequisites, professors or your degree plan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        p-3 rounded-lg max-w-[85%] shadow-sm
                        ${
                          msg.role === "user"
                            ? "bg-[#FF9A68] text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex items-center">
                      <Loader2 className="w-4 h-4 text-[#FF7D3B] animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="relative">
              <textarea
                rows={2}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#FF7D3B] focus:border-[#FF7D3B] text-sm"
                placeholder="Ask about your courses..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className={`
                  absolute right-2 bottom-3 p-2 rounded-full
                  ${
                    draft.trim()
                      ? "bg-[#FF7D3B] text-white hover:bg-[#E05F1A]"
                      : "bg-gray-100 text-gray-400"
                  }
                  transition-colors
                `}
                onClick={sendMessage}
                disabled={loading || !draft.trim()}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {messages.length > 0 && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => setMessages([])}
                  className="text-xs text-gray-500 hover:text-[#FF7D3B]"
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
