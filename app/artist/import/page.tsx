"use client";
import React, { useState, useEffect } from "react";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import AudioDropZone from "@/components/general/audioImport";
import ConstructionKitUpload from "@/components/general/constructionKit";
import ImportSidebar from "@/components/general/importSidebar";

export default function ImportPage() {
  useEffect(() => {
    document.title = "Import Content - Ethereal Techno";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("Escape key pressed - close sidebar/modal");
      }
    };

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
  }, []);

  const [selectedContentType, setSelectedContentType] =
    useState("Sample One-Shot");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
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
  const notes: { [key: string]: string } = {
    "Sample One-Shot":
      "Single audio files that can be used as individual sounds in your productions. Ideal for drums, percussion, and one-shot instruments.",
    "Sample Loop":
      "Short audio loops that can be seamlessly repeated to create rhythmic or melodic patterns. Perfect for building grooves and textures.",
    "Sample Loop+MIDI":
      "Includes both audio loops and corresponding MIDI files, allowing you to customize the performance and instrumentation of the loops.",
    MIDI: "MIDI files that can be imported into your DAW to trigger virtual instruments. Great for melodies, chords, and basslines.",
    Preset:
      "Currently we accept only Diva and Serum2. Please upload the preset file, a MIDI file, and a seamlessly looping audio preview. See the guidelines for details.",
    "Construction Kit":
      "A collection of related audio loops and samples that can be combined to create full tracks. Often includes multiple elements like drums, bass, and melodies.",
  };

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

  function handleFileSelected(file: File | File[]) {
    if (Array.isArray(file)) {
      setSelectedFile(file[0] ?? null);
    } else {
      setSelectedFile(file);
    }
  }
  function importContent() {
    setLoading(true);
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
        setContentName("");
        setSelectedFile(null);
        setBpm("122");
        setSelectedKey("");
        setSelectedSoundGroup("Melodic & Harmonic Element");
        setSelectedSubGroup("");
        setSelectedStyles([]);
        setSelectedMoods([]);
        setSelectedProcessing([]);
        setSelectedSoundDesign([]);
        setSelectedFile(null);
      })
      .catch((error) => {
        console.error("Error importing content:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-screen px-8 py-12">
        <div className="flex max-w-2/3 gap-16">
          <div className="space-y-6">
            <div>
              <h1 className="font-bold uppercase font-main text-4xl tracking-tight mb-12">
                Import Content
              </h1>

              <div className="space-y-6 p-0">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Content Type
                </h3>
                <div className="flex flex-wrap gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedContentType(type);
                      }}
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
            <p className="text-lg font-regular text-white ">
              {notes[selectedContentType] || ""}
            </p>
            {selectedContentType !== "Construction Kit" ? (
              <AudioDropZone
                onFileSelected={handleFileSelected}
                type={selectedContentType}
              />
            ) : (
              <ConstructionKitUpload
                trigger={
                  <button className="bg-white/10 hover:bg-primary/80 text-white px-4 py-2 rounded transition-all">
                    Upload Construction Kit
                  </button>
                }
                onComplete={() => {
                  console.log("Construction kit upload complete");
                }}
              />
            )}
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
                  <div className="w-full   text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all">
                    <div className="flex flex-wrap gap-3">
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
                        <button
                          key={group}
                          onClick={() => setSelectedSubGroup(group)}
                          className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                            selectedSubGroup === group
                              ? "bg-primary text-black"
                              : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
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
            <p className="text-sm text-white/60 mt-4">
              By clicking Import, you confirm that the uploaded material is your
              original work and does not infringe on any third-party copyrights.
            </p>
            <div className="pt-1">
              <button
                onClick={importContent}
                disabled={!selectedFile || loading}
                className="disabled:opacity-50 disabled:cursor-not-allowed w-full bg-primary hover:bg-primary/90 text-black font-medium py-4 text-lg tracking-wide transition-colors duration-200"
              >
                {loading ? "Importing..." : "Import Content"}
              </button>
            </div>
            <ImportSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
