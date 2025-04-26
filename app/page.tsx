// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center items-center px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          AI Academic Advisor
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl">
          Instantly get personalized course recommendations, prerequisites
          guidance, and study tips tailored to Dartmouth's computer science
          curriculum.
        </p>
        <Link href="/dashboard">
          <button className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto grid gap-12 md:grid-cols-2 px-4">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Course Lookup</h3>
            <p className="text-gray-600">
              Quickly search any COSC course and learn its description, credits,
              and term offerings.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Prerequisite Paths</h3>
            <p className="text-gray-600">
              Understand prerequisite chains and alternative paths to plan your
              ideal course sequence.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Interactive Chat</h3>
            <p className="text-gray-600">
              Ask follow-up questions in a conversational interface powered by
              Google Gemini.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Study Tips</h3>
            <p className="text-gray-600">
              Get AI-generated study strategies based on course workload and
              difficulty.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AI Academic Advisor. All rights
          reserved.
        </p>
      </footer>
    </main>
  );
}
