"use client";
import Dashboard from "./dashboard";
import Sidebar from "../sidebar";
import Nav from "../Nav";

export default function Home() {
  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
          <Nav />
          <main className="flex-1 p-4">
            <Dashboard />
          </main>
        </div>
      </div>
    </main>
  );
}
