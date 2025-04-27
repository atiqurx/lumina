// app/api/explore/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1) Build your “freshman CS” prompt
    const prompt = `
You are an expert Academic Advisor. A freshman computer-science major asks:
“What clubs, hackathons, research groups, and other co-curricular activities should I join to get the most out of as a CS student?” 
`;

    // 2) Call Google Gemini
    const apiKey = process.env.GOOGLE_API_KEY!;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("🌐 Gemini error:", resp.status, errText);
      return NextResponse.json(
        { suggestions: `Error ${resp.status} from Gemini.` },
        { status: 500 }
      );
    }

    // 3) Extract the text from the response
    const payload = await resp.json();
    console.log("💬 Explore payload:", payload);
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const suggestions = raw.trim();

    // 4) Return as JSON
    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error("🚨 /api/explore error:", e);
    return NextResponse.json(
      { suggestions: "Sorry—couldn’t fetch suggestions right now." },
      { status: 500 }
    );
  }
}
