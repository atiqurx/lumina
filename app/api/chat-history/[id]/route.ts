// app/api/chat-history/[id]/route.ts
export const auth = false;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const { id } = params;

  // Tell TS that this .lean() result has a `history` array
  const convoDoc = (await Conversation.findById(id).lean()) as
    | { history: Array<{ role: 'user' | 'bot'; message: string; timestamp: Date }> }
    | null;

  if (!convoDoc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ history: convoDoc.history });
}
