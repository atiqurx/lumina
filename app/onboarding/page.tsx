// app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    major: "",
    degree: "bachelor" as "bachelor" | "master" | "phd",
  });

  async function handleSubmit() {
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // grab raw text so we can see HTML or JSON
      const text = await res.text();
      console.log("⇨ /api/onboarding status:", res.status);
      console.log("⇨ /api/onboarding body:\n", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.warn("Response was not JSON");
      }

      if (!res.ok) {
        console.error("Onboarding failed:", res.status, data?.error || text);
        return;
      }

      console.log("Onboarding success:", data);
      localStorage.setItem("luminaUserId", data.userId);
      router.push("/dashboard");
    } catch (err) {
      console.error("Network error on onboarding:", err);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Progress */}
      <div className="flex justify-between mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 mx-1 ${
              step >= i ? "bg-[#00693E]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-2">
          <label>Your name</label>
          <input
            type="text"
            className="w-full border p-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
      )}

      {/* Step 2: Email */}
      {step === 2 && (
        <div className="space-y-2">
          <label>Your email</label>
          <input
            type="email"
            className="w-full border p-2"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
      )}

      {/* Step 3: Major */}
      {step === 3 && (
        <div className="space-y-2">
          <label>Your major</label>
          <input
            type="text"
            className="w-full border p-2"
            value={form.major}
            onChange={(e) => setForm((f) => ({ ...f, major: e.target.value }))}
          />
        </div>
      )}

      {/* Step 4: Degree */}
      {step === 4 && (
        <div className="space-y-2">
          <label>Degree</label>
          <select
            className="w-full border p-2"
            value={form.degree}
            onChange={(e) =>
              setForm((f) => ({ ...f, degree: e.target.value as any }))
            }
          >
            <option value="bachelor">Bachelor’s</option>
            <option value="master">Master’s</option>
            <option value="phd">PhD</option>
          </select>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between">
        {step > 1 && (
          <button onClick={() => setStep((s) => s - 1)} className="px-4 py-2">
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="px-4 py-2 bg-[#00693E] text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#00693E] text-white rounded"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
