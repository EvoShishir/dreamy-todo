"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { LuBell, LuCalendar } from "react-icons/lu";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDayName = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  return days[today.getDay()];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <div className="ml-72">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <Image src="/logo.png" alt="Logo" width={90} height={90} />
            <div className="flex items-center gap-4">
              <button className="p-2 bg-[#5272FF] text-white rounded-md hover:bg-[#3D5AE6] transition-colors">
                <LuBell size={20} />
              </button>
              <button className="p-2 bg-[#5272FF] text-white rounded-md hover:bg-[#3D5AE6] transition-colors">
                <LuCalendar size={20} />
              </button>
              <div className="text-sm text-gray-600">
                <div className="font-medium">{getDayName()}</div>
                <div>{getCurrentDate()}</div>
              </div>
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
