import { processing } from "@/app/data/sample";
import { Button } from "../ui/button";

type StylesProps = {
  selectedProcessing: (typeof processing)[number][];
  setSelectedProcessing: React.Dispatch<
    React.SetStateAction<(typeof processing)[number][]>
  >;
};

export default function Processing({
  selectedProcessing,
  setSelectedProcessing,
}: StylesProps) {
  function toggleProcessing(proc: (typeof processing)[number]) {
    setSelectedProcessing((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  }
  return (
    <div className="py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Processing
      </h3>
      <div className="flex flex-wrap gap-3">
        {processing.map((proc) => (
          <Button
            key={proc}
            onClick={() => toggleProcessing(proc)}
            className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedProcessing.includes(proc)
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {proc}
          </Button>
        ))}
      </div>
    </div>
  );
}
