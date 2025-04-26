"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Sidebar, CourseWithUid } from "@/components/Sidebar";
import { SemesterCard } from "@/components/SemesterCard";
import { Course } from "@/types/course";
import catalog from "@/catalog.json";

export default function DashboardPage() {
  const allCourses = (catalog as Course[]).map((c, i) => ({
    ...c,
    uid: `${c.code}-${i}`,
  })) as CourseWithUid[];

  const [assignments, setAssignments] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const uid = active.id as string;
    const dest = over.id as string;

    if (dest === "sidebar") {
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    } else if (dest.startsWith("semester-")) {
      const sem = parseInt(dest.replace("semester-", ""), 10);
      setAssignments((prev) => ({ ...prev, [uid]: sem }));
    }
  }

  const unassigned = allCourses.filter((c) => !assignments[c.uid]);
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        <aside className="w-1/4 border-r p-4 overflow-y-auto">
          <Sidebar courses={unassigned} />
        </aside>
        <main className="flex-1 p-6 grid grid-cols-4 gap-4 overflow-auto">
          {semesters.map((sem) => {
            const semCourses = allCourses.filter(
              (c) => assignments[c.uid] === sem
            );
            return (
              <SemesterCard key={sem} semester={sem} courses={semCourses} />
            );
          })}
        </main>
      </div>
    </DndContext>
  );
}
