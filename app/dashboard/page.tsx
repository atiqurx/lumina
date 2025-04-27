"use client";

import React, { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarRail,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  BookOpen,
  MessageCircle,
  Bell,
  Settings,
  User,
} from "lucide-react";
import { AdvisorChat } from "@/components/AdvisorChat";

export default function Dashboard() {
  const [page, setPage] = useState<
    "home" | "courses" | "ai" | "notifications" | "settings" | "profile"
  >("home");

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <h2 className="text-2xl font-bold text-[#00693E]">Dartmouth AI</h2>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {/* Home */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "home"}
                  asChild
                  onClick={() => setPage("home")}
                >
                  <a className="flex items-center gap-2">
                    <Home /> Home
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Courses */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "courses"}
                  asChild
                  onClick={() => setPage("courses")}
                >
                  <a className="flex items-center gap-2">
                    <BookOpen /> Courses
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Advisor Chat */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "ai"}
                  asChild
                  onClick={() => setPage("ai")}
                >
                  <a className="flex items-center gap-2">
                    <MessageCircle /> AI Chatbot
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Notifications */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "notifications"}
                  asChild
                  onClick={() => setPage("notifications")}
                >
                  <a className="flex items-center gap-2">
                    <Bell /> Notifications
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Settings */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "settings"}
                  asChild
                  onClick={() => setPage("settings")}
                >
                  <a className="flex items-center gap-2">
                    <Settings /> Settings
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Profile */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === "profile"}
                  asChild
                  onClick={() => setPage("profile")}
                >
                  <a className="flex items-center gap-2">
                    <User /> Profile
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <p className="text-xs text-sidebar-foreground/70 p-2">
              Logged in as Student
            </p>
          </SidebarFooter>

          {/* Rail toggle */}
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {page === "home" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">Home</h1>
              <p>Welcome to your dashboard. Overview of your academic path.</p>
            </section>
          )}

          {page === "courses" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">
                Courses
              </h1>
              <p>View and manage your enrolled courses here.</p>
            </section>
          )}

          {page === "ai" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">
                AI Chatbot
              </h1>
              <AdvisorChat />
            </section>
          )}

          {page === "notifications" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">
                Notifications
              </h1>
              <p>Check your latest alerts and messages.</p>
            </section>
          )}

          {page === "settings" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">
                Settings
              </h1>
              <p>Configure your account preferences here.</p>
            </section>
          )}

          {page === "profile" && (
            <section>
              <h1 className="text-3xl font-bold text-[#00693E] mb-4">
                Profile
              </h1>
              <p>View and edit your profile information.</p>
            </section>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
