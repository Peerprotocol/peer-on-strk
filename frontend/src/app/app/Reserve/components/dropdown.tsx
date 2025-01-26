import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

interface DropdownProps {
  options: { label: string; value: string }[];
  selected: string;
  selectedClassname?: string;
  dropdownClassname?: string;
  onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  selected,
  selectedClassname,
  dropdownClassname,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className={`inline-flex py-2 px-4 rounded-3xl w-full ${
            selectedClassname ?? "bg-black text-white"
          }`}
          onClick={toggleDropdown}
        >
          {selected}
          <ChevronDownIcon
            className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-300 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`origin-top-right absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            dropdownClassname ?? "bg-black text-white"
          }`}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className="block w-full text-left px-4 py-2 text-sm "
                onClick={() => handleOptionSelect(option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
