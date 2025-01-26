"use client";
import Sidebar from "./components/sidebar";
import Dashboard from "./components/dashboard";
import Nav from "./components/nav";
import { reserveDashboardData } from "@/data/reserveDashboardData";

export default function Home() {
  return (
    <main className="bg-[#F5F5F5]">
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
