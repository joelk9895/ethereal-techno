import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SubcategorySelectProps } from "./types";

export const SubcategorySelect = ({
  categories = [],
  onSelect,
  placeholder = "Select a subcategory",
  className = "",
  disabled = false,
  selectedValue = "",
}: SubcategorySelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current && menuRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const menuHeight = 320; // Fixed height for calculation
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom;
      setOpenUpwards(spaceBelow < menuHeight + 40);
    }
  }, [isOpen]);

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
  };

  const handleSubcategorySelect = (
    categoryId: string,
    subcategoryId: string,
    subcategoryName: string
  ) => {
    const category = categories.find((c) => c.id === categoryId);
    const displayValue = category
      ? `${category.name} > ${subcategoryName}`
      : subcategoryName;

    setIsOpen(false);
    setHoveredCategory(null);

    if (onSelect) {
      onSelect(categoryId, subcategoryId, displayValue);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const hoveredCategoryData = categories.find((c) => c.id === hoveredCategory);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={`w-full px-3 py-2 text-left border rounded-md transition-all focus:outline-none flex items-center justify-between ${
          disabled
            ? "bg-white/[0.02] border-white/5 text-white/30 cursor-not-allowed"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10 focus:border-white/30"
        }`}
      >
        <span className={selectedValue ? "text-white" : "text-white/60"}>
          {selectedValue || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            disabled ? "text-white/20" : "text-white/50"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && categories.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={menuRef}
            className={`absolute z-[9999] w-full bg-black border border-white/20 rounded-md shadow-lg max-h-[320px] ${
              openUpwards ? "bottom-full mb-1" : "top-full mt-1"
            }`}
            style={{ maxHeight: "320px" }}
          >
            <div className="flex h-full">
              <div className="flex-1 overflow-y-auto max-h-[320px] min-w-0">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-white/10 transition-colors text-sm group ${
                      hoveredCategory === category.id ? "bg-white/10" : ""
                    }`}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                  >
                    <div className="relative flex-1 min-w-0">
                      <span className="text-white font-medium truncate block">
                        {category.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0 ml-2" />
                    <div className="absolute left-0 -top-1 translate-y-[-100%] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/90 text-white px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap z-[1000000]">
                      {category.name}
                    </div>
                  </div>
                ))}
              </div>

              {hoveredCategoryData &&
                hoveredCategoryData.subcategories &&
                hoveredCategoryData.subcategories.length > 0 && (
                  <div className="w-1/2 border-l border-white/20 max-h-[320px] bg-white/5 flex flex-col">
                    <div className="px-3 py-2 border-b border-white/10">
                      <h4 className="text-xs font-semibold text-white/80 truncate">
                        {hoveredCategoryData.name}
                      </h4>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {hoveredCategoryData.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          type="button"
                          onClick={() =>
                            handleSubcategorySelect(
                              hoveredCategoryData.id,
                              subcategory.id,
                              subcategory.name
                            )
                          }
                          className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
