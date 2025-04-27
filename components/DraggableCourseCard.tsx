"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripHorizontal, AlertTriangle, Lock, Unlock } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Course } from "@/types/course";

export interface CourseWithUid extends Course {
  uid: string;
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : ""
    )
    .join(" ");
}

interface DraggableCourseCardProps {
  course: CourseWithUid;
  missingPrereqs?: string[];
  semesterLocked?: boolean; // disable because its semester is locked
  courseLocked?: boolean; // individual lock
  onToggleCourseLock?: () => void; // handler for that toggle
}

export function DraggableCourseCard({
  course,
  missingPrereqs = [],
  semesterLocked = false,
  courseLocked = false,
  onToggleCourseLock,
}: DraggableCourseCardProps) {
  // disabled if either lock is active
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: course.uid, disabled: semesterLocked || courseLocked });

  const { "aria-describedby": _ignore, ...cleanAttrs } = attributes;
  const style: React.CSSProperties = {
    zIndex: 9999,
    ...(transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : {}),
  };

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
              bg-white shadow-sm hover:shadow-md transition-shadow
              ${
                semesterLocked || courseLocked
                  ? "opacity-50 cursor-not-allowed"
                  : isDragging
                  ? "opacity-75 cursor-grabbing"
                  : "cursor-grab"
              }
            `}
          >
            {/* drag handle + info */}
            <div className="flex items-center gap-3">
              <GripHorizontal
                className={`w-5 h-5 ${
                  semesterLocked || courseLocked
                    ? "text-gray-400"
                    : "text-orange-500 opacity-50 group-hover:opacity-80"
                }`}
              />
              <div>
                <div className="font-semibold text-orange-600">
                  {course.code}
                </div>
                <div className="text-sm text-gray-600">
                  {toTitleCase(course.title)}
                </div>
              </div>
            </div>

            {/* warnings + course‐lock toggle */}
            <div className="flex items-center gap-2">
              {missingPrereqs.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <AlertTriangle
                      className="w-5 h-5 text-red-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <h4 className="font-semibold mb-1 text-red-600">
                      Missing Prereqs
                    </h4>
                    <ul className="ml-2 list-disc text-sm">
                      {missingPrereqs.map((pr) => (
                        <li key={pr}>{pr}</li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              )}

              {onToggleCourseLock && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCourseLock();
                  }}
                  className="p-1"
                >
                  {courseLocked ? (
                    <Lock className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        </PopoverTrigger>

        {/* course details popover */}
        <PopoverContent align="start" className="w-64">
          <h3 className="font-semibold mb-2">
            {course.code}: {course.title}
          </h3>
          <p className="text-sm text-gray-700">{course.description}</p>
          {course.prereqs.length > 0 ? (
            <p className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Prereqs:</span>{" "}
              {course.prereqs.join(", ")}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-gray-500">
              No prerequisites
            </p>
          )}
        </PopoverContent>
      </Popover>
    </li>
  );
}
