import { Metadata } from "next";
import { Explore } from "@/components/Explore";

export const metadata: Metadata = {
  title: "Explore Beyond",
  description:
    "Get AI-driven recommendations for clubs, events, and co-curricular activities at Dartmouth CS",
};

export default function ExplorePage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Explore Beyond Your Courses</h1>
      <Explore />
    </main>
  );
}
