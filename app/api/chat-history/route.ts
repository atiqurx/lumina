// app/api/chat-history/route.ts
export const auth = false;       // ← skip Clerk auth here
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import ChatHistory from '@/lib/models/ChatHistory';

export async function GET(req: NextRequest) {
  try {
    await connect();
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ items: [], error: 'Missing userId' }, { status: 400 });
    }

    const hist = (await ChatHistory.findOne({ user: userId })
      .populate({ path: 'convos', select: '_id updatedAt' })
      .lean()) as { convos?: { _id: string; updatedAt: string }[] } | null;

    const items = hist?.convos?.map(c => ({
      id: c._id,
      updatedAt: c.updatedAt,
    })) || [];

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('🚨 /api/chat-history error:', err);
    return NextResponse.json({ items: [], error: err.message }, { status: 500 });
  }
}
