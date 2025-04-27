import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: { role: "system" | "user" | "assistant"; content: string }[];
  } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const res = await openai.chat.completions.create({
      model: "o4-mini",
      messages,
    });

    const reply = res.choices[0]?.message;
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("OpenAI error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
