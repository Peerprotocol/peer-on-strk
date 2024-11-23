// "use client";
// import Sidebar from "./sidebar";
// import Dashboard from "./dashboard";
// import Market from "./market";
// import Footer from "./footer";
// import Nav from "./Nav";

// export default function Home() {
//   return (
//     <main className="bg-[#F5F5F5]">
//         <div className="flex h-screen">
//           <Sidebar />
//           <div className="flex-1 flex flex-col h-full max-h-screen overflow-auto">
//             <Nav/>
//             <main className="flex-1 p-4">
//               <Dashboard />
//               <Market />
//               <Footer />
//             </main>
//           </div>
//         </div>
//     </main>
//   );
// }

// File: /frontend/app/app/quests/page.tsx

import React from "react";

export default function QuestsWelcomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center p-6">
      {/* Header */}
      <header className="absolute top-4 left-4">
        <img
          src="/logo.svg" // Replace with actual logo path
          alt="Peerprotocol Logo"
          className="h-8 w-8"
        />
      </header>

      {/* Main Content */}
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Peerprotocol’s Quests
        </h1>
        <p className="text-gray-600 mb-6">
          Journey through each Period and succeed by completing the Quests,
          stack your XPs - and wait for magic.
        </p>
        <button
          className="px-6 py-3 bg-black text-white font-medium rounded-lg shadow hover:bg-gray-800"
        >
          Login with <span className="font-bold text-xl">𝕏</span>
        </button>
      </div>

      {/* Decorative Lines */}
      <div className="mt-12 w-full max-w-2xl">
        <svg
          viewBox="0 0 500 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 200 Q 250 50 500 200"
            fill="none"
            stroke="black"
            strokeWidth="1"
          />
          {[...Array(10)].map((_, i) => (
            <path
              key={i}
              d={`M${i * 50} 200 Q 250 50 ${500 - i * 50} 200`}
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
