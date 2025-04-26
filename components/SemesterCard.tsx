"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableCourseCard, CourseWithUid } from "./DraggableCourseCard";

export interface SemesterCardProps {
  semester: number;
  courses?: CourseWithUid[];
}

export function SemesterCard({ semester, courses = [] }: SemesterCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `semester-${semester}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-4 border rounded h-64 flex flex-col
        bg-[var(--card)] text-[var(--card-foreground)]
        ${isOver ? "ring-2 ring-[var(--primary)]" : ""}
      `}
    >
      <h2 className="font-semibold mb-2 text-[var(--primary)]">
        Semester {semester}
      </h2>
      <ul className="flex-1 overflow-y-auto space-y-3">
        {courses.map((course) => (
          <DraggableCourseCard key={course.uid} course={course} />
        ))}
      </ul>
    </div>
  );
}
