import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect, MouseEventHandler, ReactNode } from "react";

type DropdownOption = {
  label: string | ReactNode;
  value: string | number;
};

// Define overloads for DropdownProps
interface BaseDropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
}

interface SingleSelectDropdownProps extends BaseDropdownProps {
  multiSelect?: false; // Explicitly false for single-select
  onValueChange: (selected: DropdownOption) => void; // Single option
}

interface MultiSelectDropdownProps extends BaseDropdownProps {
  multiSelect: true; // Explicitly true for multi-select
  onValueChange: (selected: DropdownOption[]) => void; // Array of options
}

type DropdownProps = SingleSelectDropdownProps | MultiSelectDropdownProps;

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = 'Select an option',
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
      (onValueChange as (selected: DropdownOption[]) => void)(newSelection);
    } else {
      setSelectedOptions([option]);
      (onValueChange as (selected: DropdownOption) => void)(option);
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
    setIsOpen((prev) => !prev);
  };

  const adjustDropdownPosition = () => {
    if (dropdownRef.current && dropdownMenuRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = dropdownMenuRef.current.offsetHeight;

      const isNearBottom =
        window.innerHeight - dropdownRect.bottom < menuHeight;
      setIsDropdownFlipped(isNearBottom);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', adjustDropdownPosition);
    window.addEventListener('scroll', adjustDropdownPosition);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', adjustDropdownPosition);
      window.removeEventListener('scroll', adjustDropdownPosition);
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
        className="w-full flex items-center gap-2 text-black border border-black bg-transparent text-left px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
      >
        {multiSelect
          ? selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.label).join(', ')
            : placeholder
          : selectedOptions[0]?.label || placeholder}

        <ChevronDown className="ml-auto text-black" />
      </button>

      {isOpen && (
        <div
          ref={dropdownMenuRef}
          className={`absolute z-10 mt-1 max-h-60 w-full overflow-x-auto rounded-md border border-gray-300 bg-white ${
            isDropdownFlipped ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-2 cursor-pointer text-black hover:bg-gray-200 ${
                selectedOptions.some((selected) => selected.value === option.value)
                  ? 'bg-gray-300'
                  : ''
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

