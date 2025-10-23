import { useState, useRef} from "react";
import { CustomSelectProps, SelectOption } from "./types";
import { ChevronDown } from "lucide-react";

export const CustomSelect = ({
  placeholder,
  options = [] as SelectOption[],
  value,
  onChange,
  disabled = false,
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string): void => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`w-full border rounded-md px-3 py-2 text-left text-sm transition-all focus:outline-none flex items-center justify-between ${
          disabled
            ? "bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10 focus:border-white/30"
        }`}
      >
        <span>
          {(value && options.find((opt) => opt.value === value)?.label) ||
            placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            disabled ? "text-white/20" : "text-white/50"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className={`absolute z-[9999] w-full max-h-60 overflow-y-auto bg-black/95 border border-white/20 rounded-md shadow-xl backdrop-blur-sm`}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-md last:rounded-b-md"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
