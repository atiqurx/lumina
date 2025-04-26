"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripHorizontal } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Course } from "@/types/course";

// Extend Course with a unique ID
export interface CourseWithUid extends Course {
  uid: string;
}

interface DraggableCourseCardProps {
  course: CourseWithUid;
}

/**
 * A card that is both draggable (via dnd-kit) and clickable (opens a shadcn Popover).
 * Used in the Sidebar, in each SemesterCard, and as the DragOverlay preview.
 */
export function DraggableCourseCard({ course }: DraggableCourseCardProps) {
  // hook into dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: course.uid });

  // drop the dynamic aria-describedby to avoid hydration mismatches
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
              flex items-center gap-3 p-3 rounded-lg border
              bg-white shadow-sm hover:shadow-md transition-shadow
              cursor-grab select-none
              ${isDragging ? "opacity-75 cursor-grabbing" : "opacity-100"}
            `}
          >
            <GripHorizontal className="w-5 h-5 text-orange-500 opacity-50 group-hover:opacity-80" />
            <div>
              <div className="font-semibold text-orange-600">{course.code}</div>
              <div className="text-sm text-gray-600">{course.title}</div>
            </div>
          </div>
        </PopoverTrigger>
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
