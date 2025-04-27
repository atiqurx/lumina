"use client";

import { useDroppable } from "@dnd-kit/core";
import { DraggableCourseCard, CourseWithUid } from "./DraggableCourseCard";

export interface SemesterCardProps {
  semester: number;
  courses?: CourseWithUid[];
  missingPrereqsMap: Record<string, string[]>;
}

export function SemesterCard({
  semester,
  courses = [],
  missingPrereqsMap,
}: SemesterCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `semester-${semester}`,
  });

  // Sum credits
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative p-4 border rounded h-64 flex flex-col
        bg-[var(--card)] text-[var(--card-foreground)]
        ${isOver ? "ring-2 ring-[var(--primary)]" : ""}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-[var(--primary)]">
          Semester {semester}
        </h2>
        <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
          {totalCredits} cr
        </span>
      </div>

      {/* Courses */}
      <ul className="flex-1 overflow-y-auto space-y-2">
        {courses.map((course) => (
          <DraggableCourseCard
            key={course.uid}
            course={course}
            missingPrereqs={missingPrereqsMap[course.uid] || []}
          />
        ))}
      </ul>
    </div>
  );
}
