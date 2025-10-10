"use client";
import React, { useEffect, useState } from "react";
import {
  keys,
  oneShotGroup,
  midiGroups,
  loopGroups,
  notes,
} from "../../data/sample";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import AudioDropZone from "@/app/components/import/audioImport";
import ImportSidebar from "@/app/components/import/importSidebar";
import SubGroup from "@/app/components/import/soundType";
import Styles from "@/app/components/import/styles";
import Mood from "@/app/components/import/mood";
import Processing from "@/app/components/import/processing";
import SoundDesign from "@/app/components/import/soundDesign";
import SoundGroup from "@/app/components/import/soundGroup";
import ContentType from "@/app/components/import/contentType";
import { ConstructionKit } from "@/app/components/import/newConstruction";
import { v4 as uuid } from "uuid";

export default function ImportPage() {
  const [selectedContentType, setSelectedContentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentName, setContentName] = useState("");
  const [bpm, setBpm] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
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
  const [enableUpload, setEnableUpload] = useState(false);
  const [conId, setConId] = useState<string>("");

  useEffect(() => {
    setSelectedFile(null);
    setSelectedSoundGroup(null);
    setSelectedSubGroup("");
    setSelectedStyles([]);
    setSelectedMoods([]);
    setSelectedProcessing([]);
    setSelectedSoundDesign([]);
    setBpm(null);
    setSelectedKey("");
    setContentName("");
    if (selectedContentType === "Construction Kit") {
      const newId = uuid();
      setConId(newId);
    } else {
      setConId("");
    }
  }, [selectedContentType]);

  function handleFileSelected(file: File | File[]) {
    setSelectedFile(Array.isArray(file) ? file : [file]);
  }
  async function importContent() {
    setLoading(true);

    try {
      if (selectedContentType === "Construction Kit") {
        const constructionKitData = {
          id: conId,
          kitName: contentName,
          description: "",
          styles: selectedStyles,
          moods: selectedMoods,
          bpm: bpm || "120",
          key: selectedKey || "C",
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(constructionKitData),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create construction kit: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Construction kit created:", data);

        resetForm();
        return;
      }

      if (!selectedFile || selectedFile.length === 0) {
        alert("Please select a file to upload.");
        setLoading(false);
        return;
      }

      const uploadFiles = selectedFile || [];
      const awsKeys = [];

      if (selectedContentType === "MIDI") {
        if (uploadFiles.length < 2) {
          alert("Please select both MIDI file and audio preview.");
          setLoading(false);
          return;
        }
      } else if (selectedContentType === "Preset") {
        if (uploadFiles.length < 3) {
          alert("Please select preset file, MIDI file, and audio preview.");
          setLoading(false);
          return;
        }
      }

      for (const file of uploadFiles) {
        if (!file) continue;

        let fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (
          fileName.endsWith(".serumpreset") ||
          fileName.endsWith(".h2p") ||
          fileName.endsWith(".fxp") ||
          fileName.endsWith(".preset")
        ) {
          fileType = "application/octet-stream";
        }

        const uploadUrlResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/upload`,
          {
            method: "POST",
            body: JSON.stringify({ fileName: file.name, fileType }),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!uploadUrlResponse.ok) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
        }

        const { uploadUrl, key } = await uploadUrlResponse.json();
        awsKeys.push(key);

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.min(
                99,
                Math.round((event.loaded / event.total) * 100)
              );
              setUploadProgress(percentComplete);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.response);
            } else {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream"
          );
          xhr.send(file);
        });
      }

      const formData = new FormData();
      formData.append("awsKeys", JSON.stringify(awsKeys));
      formData.append("contentType", selectedContentType);
      formData.append("contentName", contentName);
      formData.append("bpm", bpm || "");
      formData.append("key", selectedKey);
      formData.append("soundGroup", String(selectedSoundGroup));
      formData.append("subGroup", selectedSubGroup);
      formData.append("styles", JSON.stringify(selectedStyles));
      formData.append("moods", JSON.stringify(selectedMoods));
      formData.append("processing", JSON.stringify(selectedProcessing));
      formData.append("soundDesign", JSON.stringify(selectedSoundDesign));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setUploadProgress(100);
      setContentName("");
      setSelectedFile(null);
      setBpm(null);
      setSelectedKey("");
      setSelectedSoundGroup(null);
      setSelectedSubGroup("");
      setSelectedStyles([]);
      setSelectedMoods([]);
      setSelectedProcessing([]);
      setSelectedSoundDesign([]);
      setSelectedContentType("");
    } catch (error) {
      console.error("Error importing content:", error);
      alert("Failed to process your request. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  function resetForm() {
    setContentName("");
    setSelectedFile(null);
    setBpm(null);
    setSelectedKey("");
    setSelectedSoundGroup(null);
    setSelectedSubGroup("");
    setSelectedStyles([]);
    setSelectedMoods([]);
    setSelectedProcessing([]);
    setSelectedSoundDesign([]);
    setSelectedContentType("");
  }

  useEffect(() => {
    const isFormComplete = () => {
      if (selectedContentType === "Construction Kit") {
        return true;
      }

      if (!selectedFile || selectedFile.length === 0) {
        return false;
      }

      if (selectedContentType === "MIDI" && selectedFile.length < 2) {
        return false;
      }

      if (selectedContentType === "Preset" && selectedFile.length < 3) {
        return false;
      }

      if (!contentName.trim()) {
        return false;
      }

      if (selectedContentType !== "One-Shot" && !bpm) {
        return false;
      }

      if (!selectedKey) {
        return false;
      }

      if (
        selectedContentType !== "MIDI" &&
        selectedContentType !== "Preset" &&
        !selectedSoundGroup
      ) {
        return false;
      }

      if (
        selectedSoundGroup &&
        !selectedSubGroup &&
        selectedContentType !== "MIDI"
      ) {
        return false;
      }

      return true;
    };

    setEnableUpload(isFormComplete());
  }, [
    selectedFile,
    contentName,
    bpm,
    selectedKey,
    selectedSoundGroup,
    selectedSubGroup,
    selectedContentType,
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-screen px-8 py-12">
        <div className="flex max-w-2/3 gap-16">
          <div className="space-y-4">
            <div>
              <h1 className="font-bold uppercase font-main text-4xl mb-12 tracking-wide">
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
              <ConstructionKit id={conId} />
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
                    value={bpm || ""}
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
                {selectedContentType === "" ||
                  (selectedContentType !== "MIDI" && (
                    <SoundGroup
                      selectedSoundGroup={selectedSoundGroup ?? null}
                      selectedContentType={selectedContentType}
                      setSelectedSoundGroup={setSelectedSoundGroup}
                    />
                  ))}
                {(selectedSoundGroup || selectedContentType === "MIDI") && (
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
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-white/10 rounded-full h-2.5 mb-1 relative overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(134,239,172,0.7),0_0_20px_rgba(134,239,172,0.5)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  {uploadProgress > 20 && (
                    <div
                      className="absolute top-0 h-full w-10 bg-white/20 blur-sm animate-pulse"
                      style={{
                        left: `${uploadProgress - 10}%`,
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span
                    className={
                      uploadProgress === 100
                        ? "text-primary font-medium animate-pulse"
                        : ""
                    }
                  >
                    {uploadProgress < 100
                      ? "Uploading file..."
                      : "Upload complete!"}
                  </span>
                  <span
                    className={
                      uploadProgress === 100 ? "text-primary font-medium" : ""
                    }
                  >
                    {uploadProgress}%
                  </span>
                </div>
              </div>
            )}
            <div className="pt-1">
              <button
                onClick={importContent}
                disabled={!enableUpload || loading}
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
