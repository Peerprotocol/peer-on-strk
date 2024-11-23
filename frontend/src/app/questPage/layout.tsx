
'use client'
import { DarkModeContext } from "@/components/LandingPage/DarkMode";
import Sidebar from './components/sidebar'
import Nav from './components/Nav'
import NavMain from './components/NavMain'
import { ReactNode, useContext } from "react";
import { usePathname } from 'next/navigation'

export default function QuestRootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { isDarkMode } = useContext(DarkModeContext);
  const pathname = usePathname();


  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        <Sidebar />
        <div className='flex-1 flex flex-col h-full max-h-screen overflow-auto '>
          {<NavMain />}

          <main className='flex-1 px-3 md:px-6 '>
            {children}
          </main>
        </div>
      </div>
    </main>
  );
}