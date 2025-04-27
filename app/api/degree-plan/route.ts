// app/api/degree-plan/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connect from "@/lib/mongodb";
import DegreePlan from "@/lib/models/DegreePlan";

// POST /api/degree-plan
export async function POST(request: Request) {
  await connect();

  const { userId, assignments } = (await request.json()) as {
    userId: string;
    assignments: Record<string, number>;
  };

  if (!userId || typeof assignments !== "object") {
    return NextResponse.json(
      { error: "Missing userId or assignments map" },
      { status: 400 }
    );
  }

  // build sems array
  const semMap: Record<number, string[]> = {};
  for (const [uid, sem] of Object.entries(assignments)) {
    const code = uid.split("-")[0];
    semMap[sem] ??= [];
    semMap[sem].push(code);
  }
  const sems = Object.entries(semMap)
    .map(([semNumber, courses]) => ({
      semNumber: Number(semNumber),
      courses,
    }))
    .sort((a, b) => a.semNumber - b.semNumber);

  // upsert
  const plan = await DegreePlan.findOneAndUpdate(
    { user: userId },
    { user: userId, sems },
    { upsert: true, new: true }
  );

  return NextResponse.json({ planId: plan._id });
}

// GET /api/degree-plan?userId=...
export async function GET(request: Request) {
  await connect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  const plan = await DegreePlan.findOne({ user: userId });
  return NextResponse.json({ plan });
}
