export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import courses from "@data/dartmouth_courses.json";
import connect from '@/lib/mongodb';
import ChatHistory from '@/lib/models/ChatHistory';
import Conversation from '@/lib/models/Conversation';

export async function POST(request: Request) {
  try {
    // 1) Parse input (expect question and userId)
    const { question, userId } = await request.json();
    if (!question || !userId) {
      return NextResponse.json({ answer: "Missing question or userId" }, { status: 400 });
    }

    // 2) Build catalog context for Gemini
    const context = JSON.stringify(courses.slice(0, 100), null, 2);
    const promptText = `
You are a friendly academic advisor for University of Texas at Arlington CS students. Use this catalog excerpt to answer concisely:
${context}

Student: "${question}"
Advisor:
`;

    // 3) Call Gemini 2.0 Flash
    const apiKey = process.env.GOOGLE_API_KEY!;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
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

    // 4) Parse the JSON response
    const payload = await resp.json();
    const answer =
      payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I’m sorry, I don’t know.";

    // 5) Persist to MongoDB
    await connect();
    // find or create chat history for this user
    let hist = await ChatHistory.findOne({ user: userId });
    if (!hist) {
      hist = await ChatHistory.create({ user: userId, convos: [] });
    }
    // create a conversation document
    const convo = await Conversation.create({
      history: [
        { role: 'user', message: question },
        { role: 'bot', message: answer }
      ]
    });
    hist.convos.push(convo._id);
    await hist.save();

    // 6) Return the answer
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("🚨 /api/chat error:", err);
    return NextResponse.json(
      { answer: "Oops—something went wrong. Check server logs." },
      { status: 500 }
    );
  }
}
