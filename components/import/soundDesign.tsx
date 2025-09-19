import { soundDesign } from "@/app/data/sample";
import { Button } from "../ui/button";

type SoundDesignProps = {
  selectedSoundDesign: (typeof soundDesign)[number][];
  setSelectedSoundDesign: React.Dispatch<
    React.SetStateAction<(typeof soundDesign)[number][]>
  >;
};

export default function SoundDesign({
  selectedSoundDesign,
  setSelectedSoundDesign,
}: SoundDesignProps) {
  function toggleSoundDesign(design: (typeof soundDesign)[number]) {
    setSelectedSoundDesign((prev) =>
      prev.includes(design)
        ? prev.filter((d) => d !== design)
        : [...prev, design]
    );
  }
  return (
    <div className="py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Sound Design
      </h3>

      <div className="flex flex-wrap gap-3">
        {soundDesign.map((design) => (
          <Button
            key={design}
            onClick={() => toggleSoundDesign(design)}
            className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedSoundDesign.includes(design)
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {design}
          </Button>
        ))}
      </div>
    </div>
  );
}
