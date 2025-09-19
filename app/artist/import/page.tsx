"use client";
import React, { useState, useEffect } from "react";
import {
  keys,
  oneShotGroup,
  midiGroups,
  loopGroups,
  notes,
  contentTypes,
} from "../../data/sample";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AudioDropZone from "@/components/import/audioImport";
import ConstructionKitUpload from "@/components/import/constructionKit";
import ImportSidebar from "@/components/import/importSidebar";
import SubGroup from "@/components/import/soundType";
import Styles from "@/components/import/styles";
import Mood from "@/components/import/mood";
import Processing from "@/components/import/processing";
import SoundDesign from "@/components/import/soundDesign";
import SoundGroup from "@/components/import/soundGroup";
import ContentType from "@/components/import/contentType";

export default function ImportPage() {
  const [selectedContentType, setSelectedContentType] = useState("One-Shot");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentName, setContentName] = useState("");
  const [bpm, setBpm] = useState("122");
  const [selectedKey, setSelectedKey] = useState("");
  type OneShotGroupKey = keyof typeof oneShotGroup;
  type LoopGroupKey = keyof typeof loopGroups;
  type MidiGroupKey = keyof typeof midiGroups;
  type SoundGroupKey = OneShotGroupKey | LoopGroupKey | MidiGroupKey;

  const [selectedSoundGroup, setSelectedSoundGroup] =
    useState<SoundGroupKey | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedProcessing, setSelectedProcessing] = useState<string[]>([]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState<string[]>([]);

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
        setSelectedSoundGroup("Melodic & Harmonic Element" as SoundGroupKey);
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
          <div className="space-y-4">
            <div>
              <h1 className="font-bold uppercase font-main text-4xl mb-12">
                Import Content
              </h1>
            </div>
            <ContentType
              selectedContentType={selectedContentType}
              setSelectedContentType={setSelectedContentType}
            />
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
                  className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                />
              </div>
              {selectedContentType !== "One-Shot" && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                    BPM
                  </label>
                  <input
                    type="text"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-gray-700 px-4 py-3 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                  Key
                </label>
                <Select
                  value={selectedKey}
                  onValueChange={(value) => setSelectedKey(value)}
                >
                  <SelectTrigger className="w-full py-3 text-md bg-white/5 border rounded-xl border-gray-700 px-4 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-gray-700 bg-black/95 text-white shadow-lg backdrop-blur-md">
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
                  <SoundGroup
                    selectedSoundGroup={selectedSoundGroup ?? null}
                    selectedContentType={selectedContentType}
                    setSelectedSoundGroup={setSelectedSoundGroup}
                  />
                )}
                {selectedSoundGroup && (
                  <SubGroup
                    selectedContentType={selectedContentType}
                    selectedSoundGroup={selectedSoundGroup ?? null}
                    selectedSubGroup={selectedSubGroup}
                    setSelectedSubGroup={setSelectedSubGroup}
                  />
                )}
              </>
            )}
            <Styles
              selectedStyles={selectedStyles}
              setSelectedStyles={setSelectedStyles}
            />
            <Mood
              selectedMoods={selectedMoods}
              setSelectedMoods={setSelectedMoods}
            />
            <Processing
              selectedProcessing={selectedProcessing}
              setSelectedProcessing={setSelectedProcessing}
            />

            <SoundDesign
              selectedSoundDesign={selectedSoundDesign}
              setSelectedSoundDesign={setSelectedSoundDesign}
            />

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
          </div>
          <ImportSidebar />
        </div>
      </div>
    </div>
  );
}
