import {
  loopGroups,
  midiGroups,
  oneShotGroup,
  presetGroup,
} from "@/app/data/sample";
import { Button } from "../ui/button";

type OneShotGroupKey = keyof typeof oneShotGroup;
type LoopGroupKey = keyof typeof loopGroups;
type MidiGroupKey = keyof typeof midiGroups;

type SoundGroupKey = OneShotGroupKey | LoopGroupKey | MidiGroupKey;

type SoundGroupProps = {
  selectedSoundGroup: SoundGroupKey | null;
  selectedContentType: string | undefined;
  setSelectedSoundGroup: (group: SoundGroupKey) => void;
};

export default function SoundGroup({
  selectedSoundGroup,
  selectedContentType,
  setSelectedSoundGroup,
}: SoundGroupProps) {
  return (
    <div className=" py-8">
      <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
        Sound Group
      </h3>
      <div className="flex flex-wrap gap-3">
        {(selectedContentType === "One-Shot"
          ? Object.keys(oneShotGroup)
          : selectedContentType === "Sample Loop"
          ? Object.keys(loopGroups)
          : selectedContentType === "Sample Loop+MIDI"
          ? Object.keys(loopGroups)
          : selectedContentType === "Preset"
          ? Object.keys(presetGroup)
          : Object.keys(midiGroups)
        ).map((group) => (
          <Button
            key={group}
            onClick={() => setSelectedSoundGroup(group as SoundGroupKey)}
            className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedSoundGroup === group
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {group}
          </Button>
        ))}
      </div>
    </div>
  );
}
