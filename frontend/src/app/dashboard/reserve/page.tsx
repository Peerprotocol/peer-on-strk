"use client";

import Dashboard from "@/components/custom/reserve/dashboard";
import Nav from "@/components/custom/Nav";
import Sidebar from "@/components/custom/sidebar";
import { reserveDashboardData } from "@/data/reserveDashboardData";

export default function Home() {
  return (
    <main className="bg-[#efefef]">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
            <Nav/>
            <main className="flex-1 p-4 lg:px-14">
              <Dashboard tokenReserved={reserveDashboardData[2]}/>
            </main>
          </div>
        </div>
    </main>
  );
}
