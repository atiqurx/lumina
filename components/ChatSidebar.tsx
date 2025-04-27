"use client";

import { useState, useMemo } from "react";

type Message = { role: "system" | "user" | "assistant"; content: string };

export interface CourseWithUid {
  uid: string;
  code: string;
  title: string;
  credits: number;
  prereqs: string[];
}

// Detect "professor X" or "prof X" or "Dr. X"
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  // Build catalog + plan context as before…
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

  async function sendMessage() {
    if (!draft.trim()) return;
    const text = draft.trim();
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setLoading(true);

    // ➊ Professor path
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

    // ➋ Otherwise: regular AI-advisor flow
    const systemPrompt: Message = {
      role: "system",
      content: `
        You are an expert academic advisor. Base your advice on the
        course catalog and the student’s current plan provided below.
        Please keep every answer under two sentences—short, concise, and to the point.

        ${contextBlob}
      `.trim(),
    };

    const payload = {
      messages: [systemPrompt, ...messages, userMsg] as Message[],
    };

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
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b">
        <h2 className="text-lg font-medium">AI Academic Advisor</h2>
      </header>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded max-w-[80%] ${
              m.role === "user"
                ? "bg-[#FFEBE7] text-[#D03A16] self-end"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Typing…</div>}
      </div>
      <div className="p-4 border-t">
        <textarea
          rows={2}
          className="w-full p-2 border rounded resize-none focus:outline-none"
          placeholder="Ask about your degree plan…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          className="mt-2 w-full py-2 bg-[#FF7D3B] text-white rounded hover:bg-[#e66c29]"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
