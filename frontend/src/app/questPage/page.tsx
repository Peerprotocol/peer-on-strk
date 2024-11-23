// app/QuestPage/page.tsx
'use client'
// import { ChevronDown } from "lucide-react";
import { useContext, useState } from 'react'
import { DarkModeContext } from "./components/DarkMode";
import Task from './components/Tasks'
import TaskMobile from './components/TasksMobile'
interface Quest {
    id: number;
    title: string;
    description: string;
    reward: string;
    status: 'available' | 'in_progress' | 'completed';
}

export default function QuestsPage() {
    const { isDarkMode } = useContext(DarkModeContext);


    const [isOpen, setIsOpen] = useState<Boolean>(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <section className="md:p-4 flex flex-col gap-6">
            <div className='flex flex-col gap-2'>
                <h1 className={`font-[600] xl:text-[3.1rem] lg:text-[2.9rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Tasks</h1>

                <p className={` xl:max-w-[70%] opacity-60 md:w-[80%] md:text-lg text-[1rem] ${isDarkMode ? "  text-white" : "   text-black"}`}>Get rewarded for completing Quests</p>

            </div>

            <div className="hidden lg:grid gap-6 md:grid-cols-1 lg:grid-rows-4">
                {/* <div className="p-2 flex flex-col gap-2 w-full">
                    <h2 className={`font-[600] xl:text-[1.25rem] lg:text-[1rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem] sm:mt-[-1rem] text-[3rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Partner Tasks</h2>
                    <div className="bg-white flex flex-col gap-2 rounded-2xl p-4">
                        <div className="flex justify-between px-2 items-center">
                            <p className="text-gray-600">Completed 1/4 tasks</p>
                            <ChevronDown onClick={toggleOpen}
                                className={`w-[50px] lg:w-[60px] transition-transform ${isOpen ? 'rotate-[180deg]' : ''
                                    }`}
                                size={30}
                                color="#000"
                                strokeWidth={1.25}
                            />

                        </div>
                        {isOpen && (
                            <div className='flex flex-col pt-2 gap-4 transition ease-in-out delay-150 duration-200 '>

                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow us on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Like, comment & retweet pinned post</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @duchekelvinn on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @d_prof_in_tech on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="p-2 flex flex-col gap-2 w-full">
                    <h2 className={`font-[600] xl:text-[1.25rem] lg:text-[1rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem] sm:mt-[-1rem] text-[3rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Ambassador Tasks</h2>
                    <div className="bg-white flex flex-col gap-2 rounded-2xl p-4">
                        <div className="flex justify-between px-2 items-center">
                            <p className="text-gray-600">Completed 1/4 tasks</p>
                            <ChevronDown onClick={toggleOpen}
                                className={`w-[50px] lg:w-[60px] transition-transform ${isOpen ? 'rotate-[180deg]' : ''
                                    }`}
                                size={30}
                                color="#000"
                                strokeWidth={1.25}
                            />

                        </div>
                        {isOpen && (
                            <div className='flex flex-col pt-2 gap-4 transition ease-in-out delay-150 duration-200 '>

                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow us on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Like, comment & retweet pinned post</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @duchekelvinn on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @d_prof_in_tech on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                <div className="p-2 flex flex-col gap-2 w-full">
                    <h2 className={`font-[600] xl:text-[1.25rem] lg:text-[1rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem] sm:mt-[-1rem] text-[3rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>Social Tasks</h2>
                    <div className="bg-white flex flex-col gap-2 rounded-2xl p-4">
                        <div className="flex justify-between px-2 items-center">
                            <p className="text-gray-600">Completed 1/4 tasks</p>
                            <ChevronDown onClick={toggleOpen}
                                className={`w-[50px] lg:w-[60px] transition-transform ${isOpen ? 'rotate-[180deg]' : ''
                                    }`}
                                size={30}
                                color="#000"
                                strokeWidth={1.25}
                            />

                        </div>
                        {isOpen && (
                            <div className='flex flex-col pt-2 gap-4 transition ease-in-out delay-150 duration-200 '>

                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow us on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Like, comment & retweet pinned post</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @duchekelvinn on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600">Follow @d_prof_in_tech on Twitter</p>
                                        <button className=" text-white bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
                 */}

                 {/* this is a component for the task made it reuseable  */}
                 <Task title='Partner Tasks' completedText="Completed 1/4 tasks"/>
            </div>
                <div className='flex flex-col lg:hidden gap-4'>
                {/* <div className="bg-[#fff] rounded-2xl p-[0.8rem]">
                                    <div className="flex justify-between px-2 items-center">
                                        <p className="text-gray-600 text-xs">Follow @peer_protocol on 𝕏 (Mandatory)</p>
                                        <button className=" text-white text-xs bg-gray-950 opacity-80 rounded-full  py-2 px-6 ">
                                            Perform
                                        </button>
                                    </div>
                                    </div> */}
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='perform'/>
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='pending'/>
                 <TaskMobile title='Follow @peer_protocol on 𝕏 ' task='completed'/>
                
                </div>
            
        </section>
    )
}