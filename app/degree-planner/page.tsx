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
import { DraggableCourseItem } from "@/components/DraggableCourseItem";
import { CourseWithUid } from "@/components/DraggableCourseCard";
import { Course } from "@/types/course";
import catalog from "@/catalog.json";

// Build once
const ALL_COURSES = (catalog as Course[]).map((c, i) => ({
  ...c,
  uid: `${c.code}-${i}`,
})) as CourseWithUid[];

export default function DegreePlannerPage() {
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [semesterLocks, setSemesterLocks] = useState<Record<number, boolean>>(
    {}
  );
  const [courseLocks, setCourseLocks] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) {
      setActiveId(null);
      return;
    }
    const uid = active.id as string;
    const dest = over.id as string;

    if (dest === "sidebar") {
      setAssignments((p) => {
        const n = { ...p };
        delete n[uid];
        return n;
      });
    } else if (dest.startsWith("semester-")) {
      const sem = Number(dest.split("-")[1]);
      if (!semesterLocks[sem] && !courseLocks[uid]) {
        setAssignments((p) => ({ ...p, [uid]: sem }));
      }
    }
    setActiveId(null);
  }

  const missingPrereqsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    ALL_COURSES.forEach((course) => {
      const sem = assignments[course.uid];
      if (typeof sem !== "number") return;
      const completed = new Set(
        ALL_COURSES.filter((c) => {
          const s = assignments[c.uid];
          return typeof s === "number" && s < sem;
        }).map((c) => c.code.trim().toLowerCase())
      );
      map[course.uid] = course.prereqs.filter(
        (pr) => !completed.has(pr.trim().toLowerCase())
      );
    });
    return map;
  }, [assignments]);

  const unassigned = ALL_COURSES.filter((c) => !(c.uid in assignments));
  const semesters = Array.from({ length: 12 }, (_, i) => i + 1);
  const activeCourse = activeId
    ? ALL_COURSES.find((c) => c.uid === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
        <aside className="w-80 border-r border-gray-200 overflow-hidden flex flex-col">
          <Sidebar courses={unassigned} />
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-xl font-semibold text-[#FF7D3B] mb-6">
            Course Plan
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  semesterLocked={!!semesterLocks[sem]}
                  onToggleSemesterLock={() =>
                    setSemesterLocks((p) => ({ ...p, [sem]: !p[sem] }))
                  }
                  courseLocks={courseLocks}
                  onToggleCourseLock={(uid) =>
                    setCourseLocks((p) => ({ ...p, [uid]: !p[uid] }))
                  }
                />
              );
            })}
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeCourse && (
          <DraggableCourseItem course={activeCourse} showIcons={false} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
