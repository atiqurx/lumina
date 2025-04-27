"use client";

import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CourseWithUid } from "./DraggableCourseCard";
import { theme } from "./ui/theme";
import { DraggableCourseItem } from "./DraggableCourseItem";

export function Sidebar({ courses }: { courses: CourseWithUid[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
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
      className={
        `flex flex-col h-full transition-all duration-300 ` +
        (collapsed ? "w-16" : "w-80") +
        (isOver ? ` ring-2 ring-[${theme.colors.primary}]` : "")
      }
    >
      {/* Header with title and toggle */}
      <div className="sticky top-0 p-5 border-b border-[#dddddd] z-10 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-lg font-medium text-[#213448]">Course Catalog</h2>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 hover:bg-[#FFE8D9] rounded-full transition-colors"
          title={collapsed ? "Expand catalog" : "Collapse catalog"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Content shown when expanded */}
      {!collapsed && (
        <>
          <div className="sticky top-[64px]  p-5 border-b border-[#dddddd] z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full  focus:border-[#FF7D3B] focus:ring-[#FFE8D9] pl-10 py-2 rounded-lg"
              />
            </div>
          </div>

          {/* <div className="p-2 text-sm text-[#666] border-b border-[#FFE8D9]">
            <span className="font-medium">{filtered.length}</span> courses
            available
          </div> */}

          <ul className="flex-1 overflow-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center text-gray-500 p-6">
                No courses match your search
              </div>
            ) : (
              filtered.map((course) => (
                <DraggableCourseItem key={course.uid} course={course} />
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}
