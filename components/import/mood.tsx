import { moods } from "@/app/data/sample";
import { Button } from "../ui/button";

type StylesProps = {
  selectedMoods: (typeof moods)[number][];
  setSelectedMoods: React.Dispatch<
    React.SetStateAction<(typeof moods)[number][]>
  >;
};

export default function Mood({ selectedMoods, setSelectedMoods }: StylesProps) {
  function toggleMood(mood: (typeof moods)[number]) {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }
  return (
    <div className="py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Mood
      </h3>
      <div className="flex flex-wrap gap-3">
        {moods.map((mood) => (
          <Button
            key={mood}
            onClick={() => toggleMood(mood)}
            className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedMoods.includes(mood)
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {mood}
          </Button>
        ))}
      </div>
    </div>
  );
}
