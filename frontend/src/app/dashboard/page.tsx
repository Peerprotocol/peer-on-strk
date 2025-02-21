"use client";
import Sidebar from "../../components/custom/sidebar";
import Dashboard from "../../components/custom/dashboard";
import Market from "../../components/custom/market";
import Footer from "../../components/custom/footer";
import Nav from "../../components/custom/Nav";

export default function Home() {
  return (
    <main className="bg-[#efefef]">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
            <Nav/>
            <main className="flex-1 p-4">
              <Dashboard />
              <Market />
              <Footer />
            </main>
          </div>
        </div>
    </main>
  );
}
