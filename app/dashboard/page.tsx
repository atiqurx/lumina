import { SemesterCard } from "@/components/SemesterCard";

export default function DashboardPage() {
  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Degree Planner</h1>
      <div className="grid grid-cols-4 gap-4">
        {semesters.map((sem) => (
          <SemesterCard key={sem} semester={sem} />
        ))}
      </div>
    </>
  );
}
