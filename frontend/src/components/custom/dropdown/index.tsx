import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect, MouseEventHandler, ReactNode } from "react";

type DropdownOption = {
  label: string | ReactNode;
  value: string | number;
};

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  multiSelect?: boolean;
  onValueChange: (selected: DropdownOption | DropdownOption[]) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "Select an option",
  multiSelect = false,
  onValueChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>(
    multiSelect ? [] : [{} as DropdownOption]
  );
  const [isDropdownFlipped, setIsDropdownFlipped] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: DropdownOption) => {
    if (multiSelect) {
      const isAlreadySelected = selectedOptions.some(
        (selected) => selected.value === option.value
      );
      const newSelection = isAlreadySelected
        ? selectedOptions.filter((selected) => selected.value !== option.value)
        : [...selectedOptions, option];

      setSelectedOptions(newSelection);
      onValueChange(newSelection);
    } else {
      setSelectedOptions([option]);
      onValueChange(option);
      setIsOpen(false);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const handleDropdownDisplay: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setIsOpen(prev => !prev);
  }

  const adjustDropdownPosition = () => {
    if (dropdownRef.current && dropdownMenuRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = dropdownMenuRef.current.offsetHeight;

      // Check if the dropdown fits below; if not, flip it above
      const isNearBottom =
        window.innerHeight - dropdownRect.bottom < menuHeight;
      setIsDropdownFlipped(isNearBottom);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", adjustDropdownPosition);
    window.addEventListener("scroll", adjustDropdownPosition);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", adjustDropdownPosition);
      window.removeEventListener("scroll", adjustDropdownPosition);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      adjustDropdownPosition();
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      <button
        onClick={handleDropdownDisplay}
        className={`w-full flex items-center gap-2 border border-black dark:border-gray-200 bg-transparent text-left px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black ${placeholder && "text-gray-400"}`}
      >
        {multiSelect
          ? selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.label).join(", ")
            : placeholder
          : selectedOptions[0]?.label || placeholder}

        <ChevronDown className="ml-auto" />
      </button>

      {isOpen && (
        <div
          ref={dropdownMenuRef}
          className={`absolute z-10 mt-1 max-h-60 w-full overflow-x-auto rounded-md border border-gray-300 bg-white dark:bg-black shadow-lg ${
            isDropdownFlipped ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-500/40 ${
                selectedOptions.some((selected) => selected.value === option.value)
                  ? "bg-gray-300 dark:bg-neutral-700"
                  : ""
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
