"use client";

import { useState, useMemo } from "react";
import catalog from "@/catalog.json";
import { Course } from "@/types/course";
import { Input } from "@/components/ui/input";
import { GripHorizontal } from "lucide-react";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const courses = catalog as Course[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return Array.from(new Map(courses.map((c) => [c.code, c])).values());
    }
    const exactCode: Course[] = [];
    const exactTitle: Course[] = [];
    const partial: Course[] = [];
    const seen = new Set<string>();

    for (const c of courses) {
      const codeL = c.code.toLowerCase();
      if (!seen.has(c.code) && codeL.startsWith(q)) {
        exactCode.push(c);
        seen.add(c.code);
      }
    }
    for (const c of courses) {
      const titleL = c.title.toLowerCase();
      if (!seen.has(c.code) && titleL.startsWith(q)) {
        exactTitle.push(c);
        seen.add(c.code);
      }
    }
    for (const c of courses) {
      const hay = (c.code + " " + c.title).toLowerCase();
      if (!seen.has(c.code) && hay.includes(q)) {
        partial.push(c);
        seen.add(c.code);
      }
    }

    return [...exactCode, ...exactTitle, ...partial];
  }, [query, courses]);

  return (
    <div className="flex flex-col h-full bg-primary-50">
      {/* Sticky Search */}
      <div className="sticky top-0 bg-primary-50 p-4 z-10 border-b border-primary-200">
        <Input
          placeholder="🔍 Search courses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border-primary-300 focus:border-primary focus:ring-primary/40"
        />
      </div>

      {/* Course List */}
      <ul className="overflow-auto flex-1 p-4 space-y-3">
        {filtered.map((course) => (
          <li
            key={course.code}
            draggable
            data-course={course.code}
            className="group"
          >
            <div className="flex items-center gap-3 p-3 bg-white border border-primary-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab">
              {/* Drag Handle */}
              <GripHorizontal className="text-primary opacity-50 group-hover:opacity-80 w-5 h-5" />

              {/* Course Info */}
              <div>
                <div className="font-semibold text-primary">{course.code}</div>
                <div className="text-sm text-gray-700">{course.title}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
