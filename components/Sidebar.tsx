"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { DraggableCourseCard, CourseWithUid } from "./DraggableCourseCard";

export function Sidebar({ courses }: { courses: CourseWithUid[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    const exactCode: CourseWithUid[] = [];
    const exactTitle: CourseWithUid[] = [];
    const partial: CourseWithUid[] = [];
    const seen = new Set<string>();

    for (const c of courses) {
      if (!seen.has(c.uid) && c.code.toLowerCase().startsWith(q)) {
        exactCode.push(c);
        seen.add(c.uid);
      }
    }
    for (const c of courses) {
      if (!seen.has(c.uid) && c.title.toLowerCase().startsWith(q)) {
        exactTitle.push(c);
        seen.add(c.uid);
      }
    }
    for (const c of courses) {
      if (
        !seen.has(c.uid) &&
        (c.code + " " + c.title).toLowerCase().includes(q)
      ) {
        partial.push(c);
        seen.add(c.uid);
      }
    }

    return [...exactCode, ...exactTitle, ...partial];
  }, [query, courses]);

  return (
    <div className="flex flex-col h-full bg-orange-50">
      <div className="sticky top-0 bg-orange-50 p-4 border-b border-orange-200 z-10">
        <Input
          placeholder="🔍 Search courses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-orange-300 focus:border-orange-500 focus:ring-orange-300"
        />
      </div>
      <ul className="flex-1 overflow-auto p-4 space-y-3">
        {filtered.map((course) => (
          <DraggableCourseCard key={course.uid} course={course} />
        ))}
      </ul>
    </div>
  );
}
