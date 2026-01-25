"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import Layout from "@/components/Layout";
import UploadProgressModal from "@/app/components/import/uploadProgressBar";
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

type OneShotGroupKey = keyof typeof oneShotGroup;
type LoopGroupKey = keyof typeof loopGroups;
type MidiGroupKey = keyof typeof midiGroups;
type SoundGroupKey = OneShotGroupKey | LoopGroupKey | MidiGroupKey;

interface UploadedContent {
  name: string;
  contentType: string;
  metadata: {
    bpm?: number | undefined;
    key?: string;
    soundGroup?: SoundGroupKey | null;
    subGroup?: string;
  };
  id?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedContentType, setSelectedContentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentName, setContentName] = useState("");
  const [bpm, setBpm] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedSoundGroup, setSelectedSoundGroup] =
    useState<SoundGroupKey | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedProcessing, setSelectedProcessing] = useState<string[]>([]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState<string[]>([]);
  const [enableUpload, setEnableUpload] = useState(false);
  const [conId, setConId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedContent, setUploadedContent] =
    useState<UploadedContent | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  // Authentication check - MUST be before any conditional returns
  useEffect(() => {
    const checkAuth = () => {
      const user = getAuthUser();

      if (!user) {
        router.push("/signin");
        return;
      }

      // Only allow ARTIST and ADMIN users
      if (user.type !== "ARTIST" && user.type !== "ADMIN") {
        router.push("/profile");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Reset form when content type changes - MUST be before any conditional returns
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

  // Check if form is complete - MUST be before any conditional returns
  useEffect(() => {
    const isFormComplete = () => {
      if (selectedContentType === "Construction Kit") {
        return true;
      }

      if (!selectedFile || selectedFile.length === 0) {
        return false;
      }

      if (selectedContentType === "MIDI" && selectedFile.length < 1) {
        return false;
      }

      if (selectedContentType === "Preset" && selectedFile.length < 3) {
        return false;
      }

      if (!contentName.trim()) {
        return false;
      }

      if (
        !(selectedContentType === "One-Shot" || selectedContentType === "MIDI" || selectedContentType === "Preset") &&
        !bpm
      ) {
        return false;
      }

      if (selectedContentType !== "Preset" && !selectedKey) {
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

  // Modal close handler - MUST be before any conditional returns
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSidebarKey((prev) => prev + 1);
  }, []);

  // BPM calculation handler - MUST be before any conditional returns
  const handleBPMCalculated = useCallback((calculatedBPM: string) => {
    setBpm(calculatedBPM);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-mono tracking-widest text-white/50">
              VERIFYING ACCESS...
            </span>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render the page if not authorized
  if (!isAuthorized) {
    return null;
  }

  function handleFileSelected(file: File | File[]) {
    setSelectedFile(Array.isArray(file) ? file : [file]);
  }

  async function importContent() {
    setLoading(true);
    setIsModalOpen(true);
    setUploadedContent(null);

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
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(constructionKitData),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create construction kit: ${response.statusText}`
          );
        }

        setUploadedContent({
          name: contentName,
          contentType: "Construction Kit",
          metadata: {
            bpm: bpm ? parseInt(bpm, 10) : undefined,
            key: selectedKey,
          },
        });

        resetForm();
        return;
      }

      if (!selectedFile || selectedFile.length === 0) {
        alert("Please select a file to upload.");
        setLoading(false);
        return;
      }

      const uploadFiles = selectedFile || [];
      const awsKeys: string[] = [];

      if (selectedContentType === "MIDI") {
        if (uploadFiles.length < 1) {
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
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!uploadUrlResponse.ok) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
        }

        const { uploadUrl, key } = await uploadUrlResponse.json();
        awsKeys.push(key);

        await new Promise<void>((resolve, reject) => {
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
              resolve();
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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const data = await response.json();
      setUploadProgress(100);

      setUploadedContent({
        name: contentName,
        contentType: selectedContentType,
        metadata: {
          bpm: bpm ? parseInt(bpm, 10) : undefined,
          key: selectedKey,
          soundGroup: selectedSoundGroup,
          subGroup: selectedSubGroup,
        },
        id: data.id || "",
      });

      resetForm();
    } catch (error) {
      console.error("Error importing content:", error);
      alert("Failed to process your request. Please try again.");
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="min-h-screen bg-background text-white">
        <UploadProgressModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          progress={uploadProgress}
          uploadedContent={uploadedContent}
          loading={loading}
        />

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary/5 blur-[150px] rounded-full opacity-50" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-blue-500/5 blur-[150px] rounded-full opacity-50" />
        </div>

        <div className="relative z-10 max-w-screen px-8 py-12">
          <div className="flex max-w-2/3 gap-16">
            <div className="space-y-4">
              <div>
                <h1 className="uppercase font-main text-2xl md:text-4xl mb-12 mt-8 tracking-tight text-white leading-none">
                  Import Content
                </h1>
              </div>

              <ContentType
                selectedContentType={selectedContentType}
                setSelectedContentType={setSelectedContentType}
              />

              <p className="text-sm font-medium tracking-wide mt-12 mb-4 text-white/80 ">
                {notes[selectedContentType] || ""}
              </p>

              {selectedContentType !== "Construction Kit" ? (
                <AudioDropZone
                  onFileSelected={handleFileSelected}
                  onBPMCalculated={handleBPMCalculated}
                  type={selectedContentType}
                />
              ) : (
                <ConstructionKit id={conId} onBPMDetected={setBpm} />
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
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:bg-white/10 transition-all duration-300"
                  />
                </div>
                {!(selectedContentType === "One-Shot" || selectedContentType === "MIDI" || selectedContentType === "Preset") && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                      BPM
                    </label>
                    <input
                      type="number"
                      value={bpm || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d+$/.test(value)) {
                          setBpm(value);
                        }
                      }}
                      min="1"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:bg-white/10 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" ||
                          e.key === "Delete" ||
                          e.key === "Tab" ||
                          e.key === "Escape" ||
                          e.key === "Enter" ||
                          e.key.includes("Arrow")
                        ) {
                          return;
                        }

                        if (!/\d/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                )}
                {selectedContentType !== "Preset" && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">
                      Key
                    </label>
                    <Select
                      value={selectedKey}
                      onValueChange={(value) => setSelectedKey(value)}
                    >
                      <SelectTrigger className="w-full py-3 text-md bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all duration-300">
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-white/10 bg-black/90 text-white shadow-2xl backdrop-blur-xl">
                        <SelectGroup>
                          {keys.map((key) => (
                            <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white cursor-pointer">
                              {key}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
              {selectedContentType !== "MIDI" && (
                <>
                  <Processing
                    selectedProcessing={selectedProcessing}
                    setSelectedProcessing={setSelectedProcessing}
                  />

                  <SoundDesign
                    selectedSoundDesign={selectedSoundDesign}
                    setSelectedSoundDesign={setSelectedSoundDesign}
                  />
                </>
              )}

              <p className="text-sm text-white/60 mt-4">
                By clicking Import, you confirm that the uploaded material is your
                original work and does not infringe on any third-party copyrights.
              </p>

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

            <ImportSidebar key={sidebarKey} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
