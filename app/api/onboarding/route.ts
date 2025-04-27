// app/api/onboarding/route.ts
export const auth = false;      // skip Clerk protection
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await connect();

    const { name, email, major, degree } = await req.json();
    if (!name || !email || !major || !degree) {
      return NextResponse.json(
        { error: 'Missing one of: name, email, major, degree' },
        { status: 400 }
      );
    }

    // Upsert so repeated submits update instead of error
    const user = await User.findOneAndUpdate(
      { email },
      { name, email, major, degree },
      { upsert: true, new: true }
    );

    return NextResponse.json({ userId: user._id });
  } catch (err: any) {
    console.error('🚨 Onboarding API error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}

// You can optionally add a GET handler here if you want to test via browser
export async function GET() {
  return NextResponse.json({ message: 'POST to this endpoint with {name,email,major,degree}' });
}
