"use client";

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
import { DraggableCourseItem } from "@/components/DraggableCourseItem";
import { ChatSidebar } from "@/components/ChatSidebar";
import { CourseWithUid } from "@/components/DraggableCourseCard";
import { Course } from "@/types/course";
import catalog from "@/catalog.json";

// Build once
const ALL_COURSES = (catalog as Course[]).map((c, i) => ({
  ...c,
  uid: `${c.code}-${i}`,
})) as CourseWithUid[];

export default function DegreePlannerPage() {
  const { user, isLoaded } = useUser();
  const [assignments, setAssignments] = useState<Record<string, number>>({});
  const [semesterLocks, setSemesterLocks] = useState<Record<number, boolean>>(
    {}
  );
  const [courseLocks, setCourseLocks] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // ➊ On mount, fetch saved plan
  useEffect(() => {
    if (!isLoaded || !user) return;
    fetch(`/api/degree-plan?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const sems = data.plan?.sems as
          | { semNumber: number; courses: string[] }[]
          | undefined;
        if (!sems) return;
        const loaded: Record<string, number> = {};
        sems.forEach(({ semNumber, courses }) => {
          courses.forEach((code) => {
            const course = ALL_COURSES.find((c) => c.code === code);
            if (course) {
              loaded[course.uid] = semNumber;
            }
          });
        });
        setAssignments(loaded);
      })
      .catch(console.error);
  }, [isLoaded, user]);

  // log whenever assignments change
  useEffect(() => {
    console.log("🗺️ assignments:", assignments);
  }, [assignments]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) {
      setActiveId(null);
      return;
    }
    const uid = active.id as string;
    const dest = over.id as string;

    if (dest === "sidebar") {
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    } else if (dest.startsWith("semester-")) {
      const sem = Number(dest.split("-")[1]);
      if (!semesterLocks[sem] && !courseLocks[uid]) {
        setAssignments((prev) => ({ ...prev, [uid]: sem }));
      }
    }
    setActiveId(null);
  }

  const missingPrereqsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    ALL_COURSES.forEach((course) => {
      const sem = assignments[course.uid];
      if (typeof sem !== "number") return;
      const completed = new Set(
        ALL_COURSES.filter((c) => {
          const s = assignments[c.uid];
          return typeof s === "number" && s < sem;
        }).map((c) => c.code.trim().toLowerCase())
      );
      map[course.uid] = course.prereqs.filter(
        (pr) => !completed.has(pr.trim().toLowerCase())
      );
    });
    return map;
  }, [assignments]);

  const unassigned = ALL_COURSES.filter((c) => !(c.uid in assignments));
  const semesters = Array.from({ length: 12 }, (_, i) => i + 1);
  const activeCourse = activeId
    ? ALL_COURSES.find((c) => c.uid === activeId)
    : null;

  // ➋ Save handler
  const handleSave = async () => {
    if (!user) return alert("You must be signed in to save your plan");
    try {
      const res = await fetch("/api/degree-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          assignments,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("✅ Plan saved!");
    } catch (err: any) {
      console.error(err);
      alert("❌ Failed to save plan: " + err.message);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
        {/* Left: Catalog Sidebar */}
        <aside className="flex-none border-r border-gray-200 overflow-hidden flex flex-col">
          <Sidebar courses={unassigned} />
        </aside>

        {/* Middle: Degree Planner */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Header with Save */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-[#213448]">
              Course Plan
            </h1>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#FF7D3B] text-white rounded hover:bg-[#e66c29] transition"
            >
              Save
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesters.map((sem) => {
              const semCourses = ALL_COURSES.filter(
                (c) => assignments[c.uid] === sem
              );
              return (
                <SemesterCard
                  key={sem}
                  semester={sem}
                  courses={semCourses}
                  missingPrereqsMap={missingPrereqsMap}
                  semesterLocked={!!semesterLocks[sem]}
                  onToggleSemesterLock={() =>
                    setSemesterLocks((prev) => ({
                      ...prev,
                      [sem]: !prev[sem],
                    }))
                  }
                  courseLocks={courseLocks}
                  onToggleCourseLock={(uid) =>
                    setCourseLocks((prev) => ({
                      ...prev,
                      [uid]: !prev[uid],
                    }))
                  }
                />
              );
            })}
          </div>
        </main>

        {/* Right: AI Chat Sidebar */}
        <aside className="flex-none border-l border-gray-200 overflow-hidden flex flex-col">
          <ChatSidebar catalog={ALL_COURSES} assignments={assignments} />
        </aside>
      </div>

      {/* Drag preview overlay */}
      <DragOverlay>
        {activeCourse && (
          <DraggableCourseItem course={activeCourse} showIcons={false} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
