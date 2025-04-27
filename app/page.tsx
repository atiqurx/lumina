// app/page.tsx
"use client";
import React, { useState } from "react";
import Image from "next/image";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Menu, X } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Navbar Inline */}
      <nav className="bg-white shadow-md fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <Link href="/about" className="hover:text-blue-600">
                About
              </Link>
              <Link href="/services" className="hover:text-blue-600">
                Services
              </Link>
              <Link href="/contact" className="hover:text-blue-600">
                Contact
              </Link>
            </div>

            {/* Right Section: Auth Buttons */}
            <div className="flex items-center space-x-4 ml-auto">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-700 transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="redirect">
                  <button className="px-4 py-2 rounded-md text-sm font-medium bg-white text-orange-500 hover:bg-gray-100 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="focus:outline-none"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              >
                About
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              >
                Services
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100"
              >
                Contact
              </Link>
              {/* Mobile Auth Buttons */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-teal-800 text-white hover:bg-teal-900 transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white text-teal-800 hover:bg-gray-100 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
          <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
            <span className="text-orange">LUMINA</span>{" "}
          </h1>

          <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
            Get instant, personalized course recommendations, prerequisite
            pathways, and semester planning—all powered by cutting-edge AI.
          </p>

          <Link
            className={buttonVariants({
              size: "lg",
              className: "mt-5",
            })}
            href="/dashboard"
          >
            Get started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </MaxWidthWrapper>

        {/* add bg blob */}
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative right-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#34d399] to-[#b3fd32] opacity-30 sm:right-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                  src="/landing.png"
                  alt="product preview"
                  width={1364}
                  height={866}
                  quality={100}
                  className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                />
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#e99c3e] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
