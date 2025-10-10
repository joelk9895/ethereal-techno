import {
  oneShotGroup,
  loopGroups,
  presetGroup,
  midiGroups,
} from "@/app/data/sample";
import { Button } from "../ui/button";

type OneShotGroupKey = keyof typeof oneShotGroup;
type LoopGroupKey = keyof typeof loopGroups;
type MidiGroupKey = keyof typeof midiGroups;

type SoundGroupKey = OneShotGroupKey | LoopGroupKey | MidiGroupKey;

type SubGroupProps = {
  selectedContentType: string;
  selectedSoundGroup: SoundGroupKey | null;
  selectedSubGroup: string | null;
  setSelectedSubGroup: (group: string) => void;
};

export default function SubGroup({
  selectedContentType,
  selectedSoundGroup,
  selectedSubGroup,
  setSelectedSubGroup,
}: SubGroupProps) {
  return (
    <div className="py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Sound Type
      </h3>
      <div className="w-full   text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all">
        <div className="flex flex-wrap gap-3">
          {(
            (selectedContentType === "One-Shot"
              ? oneShotGroup[selectedSoundGroup as keyof typeof oneShotGroup] ||
                []
              : selectedContentType === "Sample Loop+MIDI"
              ? loopGroups[selectedSoundGroup as keyof typeof loopGroups] || []
              : selectedContentType === "Sample Loop"
              ? loopGroups[selectedSoundGroup as keyof typeof loopGroups] || []
              : selectedContentType === "Preset"
              ? presetGroup[selectedSoundGroup as keyof typeof presetGroup] ||
                []
              : midiGroups || []) as string[]
          ).map((group) => (
            <Button
              key={group}
              onClick={() => setSelectedSubGroup(group)}
              variant={"default"}
              className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
                selectedSubGroup === group
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {group}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
