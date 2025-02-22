"use client";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface SingleFilterBarProps {
  filterOption: string;
  filterValue: string;
  onOptionChange: (option: string) => void;
  onValueChange: (value: string) => void;
}

const SingleFilterBar: React.FC<SingleFilterBarProps> = ({
  filterOption,
  filterValue,
  onOptionChange,
  onValueChange
}) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const options = ["token", "amount", "interestRate", "duration"];

  return (
    <>
      {/* Outer container with justify-end to align children to the right */}
      <div className="p-4 flex items-center gap-4 relative">
        {/* "Filter By" label to the left within the right-aligned group */}
        <label className="text-sm font-medium text-black">Filter by</label>
        
        {/* Container with toggle button and input */}
        <div className="relative ">
          <div className="w-full h-[70px] border border-black rounded-full flex items-center overflow-hidden">

          <button
            type="button"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="rounded-full mx-4 px-4 py-2 flex items-center gap-1 border border-black"
          >
            <span className="text-[#000000]">{filterOption}</span>
            <ChevronDown size={16} className="text-black" />
          </button>

            <input
              type="text"
              placeholder={`Enter ${filterOption}...`}
              value={filterValue}
              onChange={(e) => onValueChange(e.target.value)}
              className="flex-1 h-full px-4 py-4 text-black placeholder:text-[#0000004D] outline-none"
            />
          </div>
          {/* Dropdown for filter options */}
          {isOptionsOpen && (
            <div className="origin-top-left absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-100 focus:outline-none z-10">
              <div className="py-1">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onOptionChange(option);
                      setIsOptionsOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm ${
                      option === filterOption
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SingleFilterBar;
