// app/dashboard/page.tsx
import { Metadata } from "next";
import { AdvisorChat } from "@/components/AdvisorChat";

export const metadata: Metadata = {
  title: "Dashboard – AI Academic Advisor",
  description: "Ask questions about your Dartmouth CS degree plan",
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">AI Academic Advisor</h1>
      <AdvisorChat />
    </main>
  );
}
