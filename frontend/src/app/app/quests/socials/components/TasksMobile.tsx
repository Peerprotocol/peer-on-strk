import React, { useContext, useState } from 'react';
import { DarkModeContext } from "./DarkMode";

interface TasksMobileProps {
    title: string;
    task: 'perform' | 'pending' | 'completed'; // Define specific task types
}

const TasksMobile: React.FC<TasksMobileProps> = ({ title, task }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDarkMode } = useContext(DarkModeContext);

    return (
        <div className="bg-[#fff] rounded-2xl border p-[0.8rem]">
            <div className="flex justify-between px-2 gap-2 items-center">
                <p className={` text-xs ${isDarkMode ? "  text-white" : "   text-black"}`}>{title} (Mandatory)</p>
                {task === 'perform' ? (
                    <button className={`  rounded-full bg-black text-sm  text-white transition-all duration-300 hover:rounded-[30px] py-2 px-6 ${isDarkMode ? "  text-white" : "   text-black"}`}
                    >
                        Perform
                    </button>
                ) : task === 'pending' ? (
                    <button className={`   text-white bg-gray-950 opacity-50 rounded-full text-sm  py-2 px-6  ${isDarkMode ? "  text-white" : "   text-black"}`}>
                        Pending
                    </button>
                ) : task === 'completed' ? (
                    <button className={` flex flex-row items-center text-sm gap-1 py-2 px-6 ${isDarkMode ? "  text-white" : "   text-black"}`}
                    
                    >
                     Completed <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                                
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default TasksMobile;