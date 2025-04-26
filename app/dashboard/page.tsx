"use client";

import { useState } from "react";
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

export default function DashboardPage() {
  const allCourses = (catalog as Course[]).map((c, i) => ({
    ...c,
    uid: `${c.code}-${i}`,
  })) as CourseWithUid[];

  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over) {
      const uid = active.id as string;
      if (over.id === "sidebar") {
        setAssignments((prev) => {
          const next = { ...prev };
          delete next[uid];
          return next;
        });
      } else if ((over.id as string).startsWith("semester-")) {
        const sem = parseInt((over.id as string).replace("semester-", ""), 10);
        setAssignments((prev) => ({ ...prev, [uid]: sem }));
      }
    }
    setActiveId(null);
  }

  const unassigned = allCourses.filter((c) => !assignments[c.uid]);
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const activeCourse = activeId
    ? allCourses.find((c) => c.uid === activeId) || null
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
          {semesters.map((sem) => (
            <SemesterCard
              key={sem}
              semester={sem}
              courses={allCourses.filter((c) => assignments[c.uid] === sem)}
            />
          ))}
        </main>
      </div>

      <DragOverlay>
        {activeCourse && <DraggableCourseCard course={activeCourse} />}
      </DragOverlay>
    </DndContext>
  );
}
