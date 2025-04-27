"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Sidebar } from "@/components/Sidebar";
import { SemesterCard } from "@/components/SemesterCard";
import {
  DraggableCourseCard,
  CourseWithUid,
} from "@/components/DraggableCourseCard";
import { Course } from "@/types/course";
import catalog from "@/catalog.json";

// 1) Build the full list of courses with stable uids **once**, outside the component
const ALL_COURSES = (catalog as Course[]).map((c, i) => ({
  ...c,
  uid: `${c.code}-${i}`,
})) as CourseWithUid[];

export default function DashboardPage() {
  // 2) Track assignments: uid → semester
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  // 3) Track which item is actively being dragged (for DragOverlay)
  const [activeId, setActiveId] = useState<string | null>(null);

  // 4) Sensors for pointer dragging
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // 5) Handlers
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const uid = active.id as string;
    const overId = over.id as string;

    if (overId === "sidebar") {
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    } else if (overId.startsWith("semester-")) {
      const sem = Number(overId.split("-")[1]);
      setAssignments((prev) => ({ ...prev, [uid]: sem }));
    }

    setActiveId(null);
  }

  // 6) Which courses are unassigned?
  const unassigned = ALL_COURSES.filter((c) => !(c.uid in assignments));

  // 7) Precompute missing-prereqs map **only** when assignments change
  const missingPrereqsMap = useMemo(() => {
    const map: Record<string, string[]> = {};

    ALL_COURSES.forEach((course) => {
      const sem = assignments[course.uid];
      if (typeof sem !== "number") return;

      // Codes completed in earlier semesters
      const completed = new Set(
        ALL_COURSES.filter((c) => {
          const s = assignments[c.uid];
          return typeof s === "number" && s < sem;
        }).map((c) => c.code.trim().toLowerCase())
      );

      // Which prereqs aren’t in that set?
      map[course.uid] = course.prereqs.filter(
        (pr) => !completed.has(pr.trim().toLowerCase())
      );
    });

    return map;
  }, [assignments]);

  // 8) Semesters 1…8
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  // 9) Active course for overlay
  const activeCourse = activeId
    ? ALL_COURSES.find((c) => c.uid === activeId) || null
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen">
        <aside className="w-1/4 border-r p-4 overflow-y-auto">
          <Sidebar courses={unassigned} />
        </aside>

        <main className="flex-1 p-6 grid grid-cols-4 gap-4 overflow-auto">
          {semesters.map((sem) => {
            const semCourses = ALL_COURSES.filter(
              (c) => assignments[c.uid] === sem
            );
            return (
              <SemesterCard
                key={sem}
                semester={sem}
                courses={semCourses}
                missingPrereqsMap={missingPrereqsMap}
              />
            );
          })}
        </main>
      </div>

      <DragOverlay>
        {activeCourse && <DraggableCourseCard course={activeCourse} />}
      </DragOverlay>
    </DndContext>
  );
}
