import React, { useContext, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DarkModeContext } from "./DarkMode";
interface AmbassadorTasksProps {
    title: string;
    completedText: string;
}

const AmbassadorTasks: React.FC<AmbassadorTasksProps> = ({ title, completedText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode, toggleDark } = useContext(DarkModeContext);

    const toggleOpen = (event: React.MouseEvent<SVGSVGElement>) => {
        event.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <div className="p-2 flex flex-col gap-2 w-full">
            <h2 className={`font-[600] xl:text-[1.25rem] lg:text-[1rem] md:text-[2.8rem] sm:text-[2rem] xs:text-[1.5rem] sm:mt-[-1rem] text-[3rem]  ${isDarkMode ? "  text-white" : "   text-black"}`}>
                {title}
            </h2>
            <div className="bg-white flex flex-col gap-2 rounded-2xl p-4">
                <div className="flex justify-between px-2 items-center">
                    <p className="text-gray-600">{completedText}</p>
                    <ChevronDown
                        onClick={toggleOpen}
                        className={`w-[50px] lg:w-[60px] transition-transform ${isOpen ? 'rotate-[180deg]' : ''
                            }`}
                        size={30}
                        color="#000"
                        strokeWidth={1.25}
                    />
                </div>
                {isOpen && (
                    <div className="flex flex-col pt-2 gap-4 transition ease-in-out delay-150 duration-200">
                        <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                            <div className="flex justify-between px-2 items-center">
                                <p className="text-gray-600">Follow us on Twitter</p>
                                <button className="text-white bg-gray-950 opacity-80 rounded-full py-2 px-6">
                                    Follow
                                </button>
                            </div>

                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                            <div className="flex justify-between px-2 items-center">
                                <p className="text-gray-600">Like, comment & retweet pinned post</p>
                                <button className=" text-white bg-gray-950 opacity-50 rounded-full  py-2 px-6 ">
                                Pending
                                </button>
                            </div>
                        </div>
                        <div className="bg-[#F5F5F5] rounded-2xl p-[0.8rem]">
                            <div className="flex justify-between px-2 items-center">
                                <p className="text-gray-600">Follow @duchekelvinn on Twitter</p>
                                <button className="text-gray-600  flex flex-row gap-2 items-center rounded-full  py-2 px-6 ">
                                Completed <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                                
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
    );
};

export default AmbassadorTasks;