// app/api/chat/route.ts
import { NextResponse } from "next/server";
import courses from "@data/dartmouth_courses.json";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    // 1) Build a small catalog context
    const context = JSON.stringify(courses.slice(0, 100), null, 2);
    const promptText = `
You are a friendly academic advisor for Dartmouth CS students. Use this catalog excerpt to answer concisely:
${context}

Student: "${question}"
Advisor:
`;

    // 2) Call Gemini 2.0 Flash
    const apiKey = process.env.GOOGLE_API_KEY!;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: promptText }] }
        ]
      }),
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      console.error("Gemini error:", resp.status, errBody);
      return NextResponse.json(
        { answer: `Gemini error ${resp.status}. Check server logs.` },
        { status: 500 }
      );
    }

    // 3) Parse the JSON
    const payload = await resp.json();
    console.log("💬 Gemini payload:", payload);

    // 4) Extract the assistant’s text
    const answer =
      payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m sorry, I don’t know.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("🚨 /api/chat error:", err);
    return NextResponse.json(
      { answer: "Oops—something went wrong. Check server logs." },
      { status: 500 }
    );
  }
}
