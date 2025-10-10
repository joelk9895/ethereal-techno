import { styles } from "@/app/data/sample";
import { Button } from "../ui/button";

type StylesProps = {
  selectedStyles: (typeof styles)[number][];
  setSelectedStyles: React.Dispatch<
    React.SetStateAction<(typeof styles)[number][]>
  >;
};

export default function Styles({
  selectedStyles,
  setSelectedStyles,
}: StylesProps) {
  function toggleStyle(style: (typeof styles)[number]) {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  return (
    <div className="py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Style
      </h3>
      <div className="flex flex-wrap gap-3">
        {styles.map((style) => (
          <Button
            key={style}
            onClick={() => toggleStyle(style)}
            className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedStyles.includes(style)
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {style}
          </Button>
        ))}
      </div>
    </div>
  );
}
