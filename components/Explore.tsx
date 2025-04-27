// components/Explore.tsx

"use client";
import { useState } from "react";

export function Explore() {
  const [major, setMajor] = useState<string>("Computer Science");
  const [year, setYear] = useState<string>("Freshman");
  const [suggestions, setSuggestions] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ major, year }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setSuggestions(data.suggestions || "");
    } catch (e: any) {
      console.error("Explore fetch error:", e);
      setError("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Explore Beyond Your Courses
      </h2>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Major
          </label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option>Freshman</option>
            <option>Sophomore</option>
            <option>Junior</option>
            <option>Senior</option>
          </select>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {suggestions && (
        <ul className="list-disc list-inside space-y-2">
          {suggestions
            .split(/\r?\n/)
            .map((line) => line.replace(/^[-*]\s*/, "").trim())
            .filter((line) => line)
            .map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
        </ul>
      )}
    </div>
  );
}
