"use client";

import { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { GripHorizontal } from "lucide-react";
import { Course } from "@/types/course";

// Extend Course with a unique ID
export interface CourseWithUid extends Course {
  uid: string;
}

interface DraggableCourseProps {
  course: CourseWithUid;
}

function DraggableCourse({ course }: DraggableCourseProps) {
  // always call the hook:
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: course.uid });

  // strip out the dynamic aria-describedby
  const { "aria-describedby": _ignored, ...cleanAttrs } = attributes;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...cleanAttrs}
      {...listeners}
      className="group"
    >
      <div
        className={`
          flex items-center gap-3 p-3 rounded-lg border
          bg-white text-gray-800 shadow-sm hover:shadow-md
          transition-shadow cursor-grab
          ${isDragging ? "opacity-75" : "opacity-100"}
        `}
      >
        <GripHorizontal className="w-5 h-5 text-orange-500 opacity-50 group-hover:opacity-80" />
        <div>
          <div className="font-semibold text-orange-600">{course.code}</div>
          <div className="text-sm text-gray-600">{course.title}</div>
        </div>
      </div>
    </li>
  );
}

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
          <DraggableCourse key={course.uid} course={course} />
        ))}
      </ul>
    </div>
  );
}
