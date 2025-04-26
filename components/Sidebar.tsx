// components/Sidebar.tsx
"use client";

import { useState, useMemo } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { GripHorizontal } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CourseWithUid } from "./DraggableCourseCard";

// A reusable draggable-popover card:
function DraggableCourseCard({ course }: { course: CourseWithUid }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: course.uid });
  const { "aria-describedby": _ignore, ...cleanAttrs } = attributes;

  const style: React.CSSProperties = {
    zIndex: 9999,
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : {}),
  };

  return (
    <li className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...cleanAttrs}
            {...listeners}
            className={`
              flex items-center gap-3 p-3 rounded-lg border
              bg-white shadow-sm hover:shadow-md transition-shadow
              ${
                isDragging
                  ? "opacity-75 cursor-grabbing"
                  : "opacity-100 cursor-grab"
              }
            `}
          >
            <GripHorizontal className="w-5 h-5 text-orange-500 opacity-50" />
            <div>
              <div className="font-semibold text-orange-600">{course.code}</div>
              <div className="text-sm text-gray-600">{course.title}</div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <h3 className="font-semibold mb-2">
            {course.code}: {course.title}
          </h3>
          <p className="text-sm text-gray-700">{course.description}</p>
          {course.prereqs.length > 0 ? (
            <p className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Prereqs:</span>{" "}
              {course.prereqs.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-gray-500">
              No prerequisites
            </p>
          )}
        </PopoverContent>
      </Popover>
    </li>
  );
}

export function Sidebar({ courses }: { courses: CourseWithUid[] }) {
  const [query, setQuery] = useState("");

  // Make the sidebar droppable under the id "sidebar"
  const { setNodeRef, isOver } = useDroppable({ id: "sidebar" });

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
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full bg-orange-50
        ${isOver ? "ring-2 ring-[var(--primary)]" : ""}
      `}
    >
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
