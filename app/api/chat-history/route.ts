// app/api/chat-history/route.ts
export const auth = false;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import ChatHistory from '@/lib/models/ChatHistory';
import Conversation from '@/lib/models/Conversation';

export async function GET(req: NextRequest) {
  try {
    await connect();

    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    // 1) Load & cast so TS knows there's a `convos` array
    const histDoc = (await ChatHistory.findOne({ user: userId })
      .populate({ path: 'convos', select: 'history' })
      .lean()) as
      | { convos?: Array<{ _id: string; history?: { message: string }[] }> }
      | null;

    if (!histDoc?.convos?.length) {
      return NextResponse.json({ items: [] });
    }

    // 2) Build snippet list from the first message of each convo
    const items = histDoc.convos.map((c) => {
      const first = c.history?.[0]?.message;
      return {
        id: c._id.toString(),
        snippet: first ? first.slice(0, 50) : '(no messages yet)',
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error('🚨 /api/chat-history error:', err);
    return NextResponse.json({ items: [] });
  }
}
