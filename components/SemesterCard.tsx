// components/SemesterCard.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { Lock, Unlock } from "lucide-react";
import { DraggableCourseCard, CourseWithUid } from "./DraggableCourseCard";

export interface SemesterCardProps {
  semester: number;
  courses?: CourseWithUid[];
  missingPrereqsMap: Record<string, string[]>;
  semesterLocked: boolean;
  onToggleSemesterLock: () => void;
  courseLocks: Record<string, boolean>;
  onToggleCourseLock: (uid: string) => void;
}

export function SemesterCard({
  semester,
  courses = [],
  missingPrereqsMap,
  semesterLocked,
  onToggleSemesterLock,
  courseLocks,
  onToggleCourseLock,
}: SemesterCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `semester-${semester}`,
  });

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative p-4 border rounded flex flex-col min-h-64
        bg-[var(--card)] text-[var(--card-foreground)]
        ${isOver ? "ring-2 ring-[var(--primary)]" : ""}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-[var(--primary)]">
            Semester {semester}
          </h2>
          <button onClick={onToggleSemesterLock} className="p-1">
            {semesterLocked ? (
              <Lock className="w-4 h-4 text-gray-600" />
            ) : (
              <Unlock className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
        <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
          {totalCredits} cr
        </span>
      </div>

      {/* If no courses, show placeholder */}
      {courses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 italic">
          Drag and drop course here
        </div>
      ) : (
        <ul className="space-y-2">
          {courses.map((course) => (
            <DraggableCourseCard
              key={course.uid}
              course={course}
              missingPrereqs={missingPrereqsMap[course.uid] || []}
              semesterLocked={semesterLocked}
              courseLocked={!!courseLocks[course.uid]}
              onToggleCourseLock={() => onToggleCourseLock(course.uid)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
