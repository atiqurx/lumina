"use client";

import { Course } from "@/types/course";

export interface SemesterCardProps {
  semester: number;
  courses?: Course[];
}

export function SemesterCard({ semester, courses = [] }: SemesterCardProps) {
  return (
    <div className="p-4 border rounded h-64 flex flex-col">
      <h2 className="font-semibold mb-2">Semester {semester}</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {courses.map((c) => (
          <div key={c.code} className="p-2 bg-gray-100 rounded">
            {c.code}
          </div>
        ))}
      </div>
    </div>
  );
}
