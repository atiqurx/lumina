"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripHorizontal, AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Course } from "@/types/course";

export interface CourseWithUid extends Course {
  uid: string;
}

interface DraggableCourseCardProps {
  course: CourseWithUid;
  // list of codes missing for prereqs
  missingPrereqs?: string[];
}

export function DraggableCourseCard({
  course,
  missingPrereqs = [],
}: DraggableCourseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: course.uid });

  // drop dynamic aria-describedby
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
              group flex items-center justify-between gap-3 p-3 rounded-lg border
              bg-white shadow-sm hover:shadow-md transition-shadow
              ${
                isDragging
                  ? "opacity-75 cursor-grabbing"
                  : "opacity-100 cursor-grab"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <GripHorizontal className="w-5 h-5 text-orange-500 opacity-50 group-hover:opacity-80" />
              <div>
                <div className="font-semibold text-orange-600">
                  {course.code}
                </div>
                <div className="text-sm text-gray-600">{course.title}</div>
              </div>
            </div>

            {/* Warning icon if any prereqs are missing */}
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
          </div>
        </PopoverTrigger>

        {/* Course detail popover on clicking anywhere else */}
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
