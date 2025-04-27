"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CourseWithUid } from "./DraggableCourseCard";
import { theme } from "./ui/theme";

export function DraggableCourseItem({
  course,
  missingPrereqs = [],
  semesterLocked = false,
  courseLocked = false,
  onToggleCourseLock,
  showIcons = true,
}: {
  course: CourseWithUid;
  missingPrereqs?: string[];
  semesterLocked?: boolean;
  courseLocked?: boolean;
  onToggleCourseLock?: () => void;
  showIcons?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: course.uid,
      disabled: semesterLocked || courseLocked,
    });

  const { "aria-describedby": _ignore, ...cleanAttrs } = attributes;

  const style: React.CSSProperties = {
    zIndex: 9999,
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : {}),
  };

  const hasPrereqWarning = missingPrereqs && missingPrereqs.length > 0;

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
              group flex items-center justify-between gap-2 p-3 rounded-lg border
              bg-white transition-all duration-200
              ${
                hasPrereqWarning
                  ? "border-[#FFCDB2] bg-[#FFF9F5]"
                  : "border-gray-200"
              }
              ${
                semesterLocked || courseLocked
                  ? "opacity-60 cursor-not-allowed"
                  : isDragging
                  ? "opacity-75 cursor-grabbing shadow-md"
                  : "hover:shadow-md hover:border-[#FFCDB2] cursor-grab"
              }
            `}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <GripVertical
                className={`
                w-5 h-5 flex-shrink-0
                ${
                  semesterLocked || courseLocked
                    ? "text-gray-300"
                    : "text-[#FF9A68] opacity-60 group-hover:opacity-100"
                }
              `}
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#102E50] truncate">
                  {course.code}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {course.title}
                </div>

                <div className="mt-1 flex items-center">
                  <span className="text-xs px-2 py-0.5 bg-[#FF7D3B] text-[#ffffff] rounded-full">
                    {course.credits} Credits
                  </span>

                  {course.prereqs.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      {course.prereqs.length} prereq
                      {course.prereqs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {showIcons && (
                <div className="flex-shrink-0">
                  <Info className="w-4 h-4 text-[#FF9A68] opacity-60 group-hover:opacity-100" />
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-72 p-4 shadow-lg">
          <h3 className="font-semibold text-lg text-[#102E50] mb-3">
            {course.code}
          </h3>
          <h4 className="font-medium text-gray-800 mb-2">{course.title}</h4>

          <p className="text-sm text-gray-700 mb-3">{course.description}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium px-2 py-1 bg-[#FF7D3B] text-[#ffffff] rounded-full">
              {course.credits} Credits
            </span>
          </div>

          {course.prereqs.length > 0 ? (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">
                Prerequisites:
              </h5>
              <ul className="text-xs text-gray-600 ml-1 space-y-1">
                {course.prereqs.map((prereq) => (
                  <li key={prereq} className="flex items-center">
                    <span className="mr-1">•</span> {prereq}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs italic text-gray-500">
              No prerequisites required
            </p>
          )}

          {hasPrereqWarning && (
            <div className="mt-3 p-2 bg-[#FFEBE7] text-[#D03A16] rounded-md text-xs">
              <strong>Warning:</strong> Missing prerequisites:{" "}
              {missingPrereqs.join(", ")}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </li>
  );
}
