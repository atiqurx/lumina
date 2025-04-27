// app/api/chat/route.ts
export const auth = false;       // skip Clerk
export const runtime = 'nodejs'; // allow mongoose, fetch, etc.

import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import ChatHistory from '@/lib/models/ChatHistory';
import Conversation from '@/lib/models/Conversation';
import courses from '@/data/dartmouth_courses.json';

export async function POST(req: Request) {
  try {
    await connect();
    const { userId, question, conversationId } = await req.json();

    if (!userId || !question) {
      return NextResponse.json(
        { error: 'Missing userId or question' },
        { status: 400 }
      );
    }

    // 1) Ensure there’s a ChatHistory for this user
    let hist = await ChatHistory.findOne({ user: userId });
    if (!hist) {
      hist = await ChatHistory.create({ user: userId, convos: [] });
    }

    // 2) Get or create the Conversation doc
    let convo;
    if (conversationId) {
      convo = await Conversation.findById(conversationId);
      if (!convo) {
        return NextResponse.json(
          { error: 'Invalid conversationId' },
          { status: 400 }
        );
      }
    } else {
      convo = await Conversation.create({ history: [] });
      hist.convos.push(convo._id);
      await hist.save();
    }

    // 3) Append the user’s question
    convo.history.push({ role: 'user', message: question });
    await convo.save();

    // 4) Build your Gemini prompt
    const excerpt = JSON.stringify(courses.slice(0, 100), null, 2);
    const prompt = `
You are a friendly academic advisor for Dartmouth CS students. Use this catalog excerpt to answer concisely:
${excerpt}

Student: "${question}"
Advisor:
`;

    // 5) Call Gemini Flash
    const apiKey = process.env.GOOGLE_API_KEY!;
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini error', geminiRes.status, errText);
      throw new Error(`Gemini failed ${geminiRes.status}`);
    }

    const geminiJson = await geminiRes.json();
    const answer =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I'm sorry, I don't know.";

    // 6) Append the bot’s answer
    convo.history.push({ role: 'bot', message: answer });
    await convo.save();

    // 7) Return the answer and conversationId
    return NextResponse.json({
      answer,
      conversationId: convo._id.toString(),
    });
  } catch (err: any) {
    console.error('🚨 /api/chat error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
