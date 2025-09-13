"use client";
import React, { useState, useEffect } from "react";
import { Edit3, Trash2 } from "lucide-react";
import {
  contentTypes,
  keys,
  styles,
  oneShotGroup,
  midiGroups,
  loopGroups,
  presetGroup,
  moods,
  processing,
  soundDesign,
} from "../../data/sample";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AudioDropZone from "@/components/general/audioImport";

export default function ImportPage() {
  interface ImportedContentItem {
    id: string | number;
    contentName: string;
    type: string;
    bpm?: number | string;
    key?: string;
  }

  const [sideData, setSideData] = useState<ImportedContentItem[] | null>(null);
  useEffect(() => {
    document.title = "Import Content - Ethereal Techno";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("Escape key pressed - close sidebar/modal");
      }
    };
    const fetchContent = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/content`
        );
        const data = await response.json();
        setSideData(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
    fetchContent().then(() => {
      console.log("Fetched content:", sideData);
    });

    window.addEventListener("keydown", (event) => {
      if (
        (event.metaKey && event.key.toLowerCase() === "s") ||
        (event.ctrlKey && event.key.toLowerCase() === "s")
      ) {
        event.preventDefault();
        console.log("Save shortcut triggered");
      }
      handleKeyDown(event);
    });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const [selectedContentType, setSelectedContentType] =
    useState("Sample One-Shot");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contentName, setContentName] = useState("");
  const [bpm, setBpm] = useState("122");
  const [selectedKey, setSelectedKey] = useState("");
  type OneShotGroupKey = keyof typeof oneShotGroup;
  type LoopGroupKey = keyof typeof loopGroups;
  type MidiGroupKey = keyof typeof midiGroups;
  type SoundGroupKey = OneShotGroupKey | LoopGroupKey | MidiGroupKey;

  const [selectedSoundGroup, setSelectedSoundGroup] = useState<SoundGroupKey>(
    "Melodic & Harmonic Element"
  );
  const [selectedSubGroup, setSelectedSubGroup] = useState("");
  const [selectedStyles, setSelectedStyles] = useState([""]);
  const [selectedMoods, setSelectedMoods] = useState([""]);
  const [selectedProcessing, setSelectedProcessing] = useState([""]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState([""]);

  function toggleSoundDesign(design: (typeof soundDesign)[number]) {
    setSelectedSoundDesign((prev) =>
      prev.includes(design)
        ? prev.filter((d) => d !== design)
        : [...prev, design]
    );
  }

  function toggleProcessing(proc: (typeof processing)[number]) {
    setSelectedProcessing((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
  }

  function toggleMood(mood: (typeof moods)[number]) {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }

  function toggleStyle(style: (typeof styles)[number]) {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  function handleFileSelected(file: File) {
    setSelectedFile(file);
  }
  function importContent() {
    const formData = new FormData();
    formData.append("file", selectedFile!);
    formData.append("contentType", selectedContentType);
    formData.append("contentName", contentName);
    formData.append("bpm", String(parseInt(bpm, 10)));
    formData.append("key", selectedKey);
    formData.append("soundGroup", String(selectedSoundGroup));
    formData.append("subGroup", selectedSubGroup);
    formData.append("styles", JSON.stringify(selectedStyles));
    formData.append("moods", JSON.stringify(selectedMoods));
    formData.append("processing", JSON.stringify(selectedProcessing));
    formData.append("soundDesign", JSON.stringify(selectedSoundDesign));
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/import`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Content imported successfully:", data);
      })
      .catch((error) => {
        console.error("Error importing content:", error);
      });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h1 className="font-bold uppercase font-main text-4xl tracking-tight mb-12">
                Import Content
              </h1>

              <div className="space-y-6">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Content Type
                </h3>
                <div className="flex flex-wrap gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedContentType(type)}
                      className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                        selectedContentType === type
                          ? "bg-primary text-black"
                          : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {<AudioDropZone onFileSelected={handleFileSelected} />}
            {selectedContentType === "MIDI" ||
            selectedContentType === "Sample Loop+MIDI" ? (
              <div className="grid w-full max-w-sm items-center gap-3">
                <label
                  htmlFor="midi"
                  className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider"
                >
                  MIDI File
                </label>
                <Input
                  id="midi"
                  type="file"
                  accept=".mid,.midi"
                  className="border border-white/10 bg-white/5 text-white p-2 rounded"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                  Content Name
                </label>
                <input
                  type="text"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                  BPM
                </label>
                <input
                  type="text"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                  Key
                </label>
                <Select
                  value={selectedKey}
                  onValueChange={(value) => setSelectedKey(value)}
                >
                  <SelectTrigger className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-white/10 bg-black/95 text-white shadow-lg backdrop-blur-md">
                    <SelectGroup>
                      {keys.map((key) => (
                        <SelectItem key={key} value={key} className="bg-black">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                  Tap Tempo
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="bg-white/10 hover:bg-primary/80 text-white px-4 py-2 rounded transition-all"
                    onClick={() => {
                      {
                        const now = Date.now();

                        interface WindowWithTapTimes extends Window {
                          _tapTimes?: number[];
                        }
                        const win = window as WindowWithTapTimes;
                        if (!win._tapTimes) win._tapTimes = [];
                        const tapTimes = win._tapTimes;
                        tapTimes.push(now);
                        if (tapTimes.length > 5) tapTimes.shift();
                        if (tapTimes.length > 1) {
                          const intervals = tapTimes
                            .slice(1)
                            .map((t: number, i: number) => t - tapTimes[i]);
                          const avgMs =
                            intervals.reduce(
                              (a: number, b: number) => a + b,
                              0
                            ) / intervals.length;
                          const newBpm = Math.round(60000 / avgMs);
                          if (!isNaN(newBpm) && newBpm > 0 && newBpm < 400)
                            setBpm(String(newBpm));
                        }
                      }
                    }}
                  >
                    Tap
                  </button>
                  <span className="text-white/60 text-sm">Tap to set BPM</span>
                </div>
              </div>
            </div>

            {selectedContentType !== "Construction Kit" && (
              <>
                {selectedContentType !== "MIDI" && (
                  <div>
                    <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                      Sound Group
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(selectedContentType === "Sample One-Shot"
                        ? Object.keys(oneShotGroup)
                        : selectedContentType === "Sample Loop"
                        ? Object.keys(loopGroups)
                        : selectedContentType === "Sample Loop+MIDI"
                        ? Object.keys(loopGroups)
                        : selectedContentType === "Preset"
                        ? Object.keys(presetGroup)
                        : Object.keys(midiGroups)
                      ).map((group) => (
                        <button
                          key={group}
                          onClick={() =>
                            setSelectedSoundGroup(group as SoundGroupKey)
                          }
                          className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                            selectedSoundGroup === group
                              ? "bg-primary text-black"
                              : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                    Sub Group
                  </h3>
                  <div className="w-full max-w-Ssm bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all">
                    <Select
                      value={String(selectedSubGroup) || ""}
                      onValueChange={(value) => setSelectedSubGroup(value)}
                    >
                      <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-black/40 text-white shadow-sm focus:ring-2 focus:ring-yellow-400 transition-colors">
                        <SelectValue placeholder="🎶 Select sound group" />
                      </SelectTrigger>

                      <SelectContent className="rounded-2xl border border-white/10 bg-black/95 text-white shadow-lg backdrop-blur-md">
                        <SelectGroup>
                          <SelectLabel className="px-2 py-1 text-xs uppercase tracking-wider text-white/40">
                            {selectedSubGroup as string}
                          </SelectLabel>
                          {(
                            (selectedContentType === "Sample One-Shot"
                              ? oneShotGroup[
                                  selectedSoundGroup as keyof typeof oneShotGroup
                                ] || []
                              : selectedContentType === "Sample Loop+MIDI"
                              ? loopGroups[
                                  selectedSoundGroup as keyof typeof loopGroups
                                ] || []
                              : selectedContentType === "Sample Loop"
                              ? loopGroups[
                                  selectedSoundGroup as keyof typeof loopGroups
                                ] || []
                              : selectedContentType === "Preset"
                              ? presetGroup[
                                  selectedSoundGroup as keyof typeof presetGroup
                                ] || []
                              : midiGroups[
                                  selectedSoundGroup as keyof typeof midiGroups
                                ] || []) as string[]
                          ).map((group) => (
                            <SelectItem
                              key={group}
                              value={group}
                              className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors hover:bg-yellow-500/20 focus:bg-yellow-500/30"
                            >
                              {group}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div>
              <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                Style
              </h3>
              <div className="flex flex-wrap gap-3">
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                      selectedStyles.includes(style)
                        ? "bg-primary text-black"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                Mood
              </h3>
              <div className="flex flex-wrap gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                      selectedMoods.includes(mood)
                        ? "bg-primary text-black"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                Processing
              </h3>
              <div className="flex flex-wrap gap-3">
                {processing.map((proc) => (
                  <button
                    key={proc}
                    onClick={() => toggleProcessing(proc)}
                    className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                      selectedProcessing.includes(proc)
                        ? "bg-primary text-black"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {proc}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-6 uppercase tracking-wider">
                Sound Design
              </h3>
              <div className="flex flex-wrap gap-3">
                {soundDesign.map((design) => (
                  <button
                    key={design}
                    onClick={() => toggleSoundDesign(design)}
                    className={`px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 ${
                      selectedSoundDesign.includes(design)
                        ? "bg-primary text-black"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {design}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-8">
              <button
                onClick={importContent}
                className="w-full bg-primary hover:bg-primary/90 text-black font-medium py-4 text-lg tracking-wide transition-colors duration-200"
              >
                Import Content
              </button>
            </div>

            <div className="flex flex-col gap-6 fixed right-0 top-0 h-screen w-[30vw] bg-gray-600/10 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
              <h2 className="text-xl font-main font-medium text-white">
                Imported Content
              </h2>
              {sideData?.map((item: ImportedContentItem) => (
                <div
                  key={item.id}
                  className="border border-white/10 p-6 hover:border-white/20 transition-colors duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-medium">
                        {item.contentName ?? "Untitled"}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {item.type ?? "Type"}
                        {item.bpm ? ` • ${item.bpm} BPM` : ""}
                        {item.key ? ` • ${item.key}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                        <Edit3 className="h-5 w-5 text-white/80" />
                      </button>
                      <button className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                        <Trash2 className="h-5 w-5 text-white/80" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
