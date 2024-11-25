// app/QuestPage/page.tsx
'use client'
import { useContext, useState } from "react";
// import { ChevronDown } from "lucide-react";

import { DarkModeContext } from "./components/DarkMode";
import Task from './components/Tasks'
import TaskMobile from './components/TasksMobile'
import NavMain from './components/NavMain'
import Sidebar from './components/sidebar'

interface Quest {
    id: number;
    title: string;
    description: string;
    reward: string;
    status: 'available' | 'in_progress' | 'completed';
}

export default function Socials() {
    const { isDarkMode } = useContext(DarkModeContext);


    const [isOpen, setIsOpen] = useState<Boolean>(false)

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };
  return (
    <main className="bg-[#F5F5F5]">
      <div className="flex h-screen">
        <Sidebar />
        <div className='flex-1 flex flex-col h-full max-h-screen overflow-auto '>
          {<NavMain />}

          <main className='flex-1 px-3 md:px-6 '>
          <section className="md:p-4 flex flex-col gap-6">
            <div className='flex flex-col gap-2'>
                <h1 className={`font-[600] xl:text-[3.1rem] lg:text-[2.9rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Tasks</h1>

                <p className={` xl:max-w-[70%] opacity-60 md:w-[80%] md:text-lg text-[1rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Get rewarded for completing Quests</p>

            </div>

            <div className="hidden lg:grid gap-6 md:grid-cols-1 lg:grid-rows-4">

                 {/* this is a component for the task made it reuseable  */}
                 <Task title='Partner Tasks' completedText="Completed 1/4 tasks"/>
            </div>
                <div className='flex flex-col lg:hidden gap-4'>
            {/* this is a component for the task  made it reuseable for mobile  */}
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='perform'/>
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='pending'/>
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='completed'/>
                
                </div>
            
        </section>
          </main>
        </div>
      </div>
    </main>
  );
}