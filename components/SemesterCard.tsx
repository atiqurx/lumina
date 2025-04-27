"use client";

import { useDroppable } from "@dnd-kit/core";
import { Lock, Unlock, AlertTriangle } from "lucide-react";
import { CourseWithUid } from "./DraggableCourseCard";
import { DraggableCourseItem } from "./DraggableCourseItem";
import { theme } from "./ui/theme";

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
    disabled: semesterLocked,
  });

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const year = Math.ceil(semester / 3);
  const terms = ["Fall", "Spring", "Summer"];
  const term = terms[(semester - 1) % 3];
  const hasWarnings = courses.some((c) => missingPrereqsMap[c.uid]?.length > 0);

  // Calculate credit status
  let creditStatus = "optimal";
  if (totalCredits > 18) creditStatus = "overload";
  else if (totalCredits < 12) creditStatus = "underload";

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col h-full
        ${semesterLocked ? "opacity-90" : ""}
        ${isOver && !semesterLocked ? "ring-2 ring-[#FF7D3B]" : ""}
      `}
    >
      {/* Header */}
      <div
        className={`
        p-3 rounded-t-lg flex justify-between items-center
        ${semesterLocked ? "bg-gray-100" : "bg-[#FFF0E8]"}
        ${hasWarnings ? "border-b-2 border-[#FFCDB2]" : ""}
      `}
      >
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-medium text-gray-800">
                {term} {year}
              </h2>
              <button
                onClick={onToggleSemesterLock}
                className="p-1 hover:bg-[#FFE8D9] rounded-full transition-colors"
                title={semesterLocked ? "Unlock semester" : "Lock semester"}
              >
                {semesterLocked ? (
                  <Lock className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-gray-500" />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500">Semester {semester}</div>
          </div>
        </div>

        <div
          className={`
          text-xs font-medium px-2 py-1 rounded-full
          ${
            creditStatus === "optimal"
              ? "bg-[#E6F7EB] text-[#2E7D42]"
              : creditStatus === "underload"
              ? "bg-[#FFF8E6] text-[#B78103]"
              : "bg-[#FFEBE7] text-[#D03A16]"
          }
        `}
        >
          {totalCredits} credits
        </div>
      </div>

      {/* Course list */}
      <div
        className={`
        flex-1 p-3 border border-t-0 rounded-b-lg
        ${semesterLocked ? "bg-gray-50" : "bg-white"}
        ${isOver && !semesterLocked ? "bg-[#FFF9F5]" : ""}
      `}
      >
        {courses.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400 italic">
            {semesterLocked ? "Semester locked" : "Drop courses here"}
          </div>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <div key={course.uid} className="relative">
                <DraggableCourseItem
                  course={course}
                  missingPrereqs={missingPrereqsMap[course.uid] || []}
                  semesterLocked={semesterLocked}
                  courseLocked={!!courseLocks[course.uid]}
                  onToggleCourseLock={() => onToggleCourseLock(course.uid)}
                />

                {!!courseLocks[course.uid] && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Lock className="w-3 h-3 text-gray-500" />
                  </div>
                )}

                {missingPrereqsMap[course.uid]?.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFEBE7] rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-[#D03A16]" />
                  </div>
                )}
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
