// app/api/degree-plan/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import connect from '@/lib/mongodb';
import DegreePlan from '@/lib/models/DegreePlan';

export async function POST(request: Request) {
  await connect();

  const { userId, assignments }: { userId: string; assignments: Record<string, number> } = await request.json();
  if (!userId || !assignments || typeof assignments !== 'object') {
    return NextResponse.json(
      { error: 'Missing userId or assignments map' },
      { status: 400 }
    );
  }

  // Build an array of { semNumber, courses } from assignments: { uid: sem }
  const semMap: Record<number, string[]> = {};
  for (const [uid, sem] of Object.entries(assignments)) {
    const courseCode = uid.split('-')[0]; // strip off the uid suffix
    semMap[sem as number] = semMap[sem as number] || [];
    semMap[sem].push(courseCode);
  }
  const sems = Object.entries(semMap)
    .map(([num, courses]) => ({
      semNumber: Number(num),
      courses,
    }))
    // optional: sort by semester
    .sort((a, b) => a.semNumber - b.semNumber);

  // Upsert the degree plan document for this user
  const plan = await DegreePlan.findOneAndUpdate(
    { user: userId },
    { user: userId, sems },
    { upsert: true, new: true }
  );

  return NextResponse.json({ planId: plan._id });
}

// Optional: allow a GET to retrieve the existing plan
export async function GET(request: Request) {
  await connect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const plan = await DegreePlan.findOne({ user: userId });
  return NextResponse.json({ plan });
}
