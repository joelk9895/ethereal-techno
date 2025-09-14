"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import {
  Play,
  Pause,
  Upload,
  X,
  Check,
  ChevronDown,
  Plus,
  Save,
} from "lucide-react";
import {
  oneShotGroup,
  loopGroups,
  presetGroup,
  midiGroups,
} from "@/app/data/sample";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger as UiSelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// Define the kit types
const KIT_TYPES = [
  "Full Loop",
  "Sample One-Shot",
  "Sample Loop",
  "Sample Loop + MIDI",
  "Sample Loop + MIDI + Preset",
];

// Define the file types
const FILE_TYPES = {
  AUDIO_LOOP: "Sample Loop",
  AUDIO_ONE_SHOT: "Sample One-Shot",
  MIDI: "MIDI",
  PRESET: "Preset",
  FULL_LOOP: "Full Loop",
};

interface AudioFile {
  id: string;
  file: File;
  url: string;
  isPlaying: boolean;
  duration: string;
  currentTime: string;
  audioRef: HTMLAudioElement | null;
  fileType: string; // The actual type of file (Sample Loop, MIDI, etc.)
  soundGroup?: string;
  subGroup?: string;
}

export interface ConstructionKitResult {
  name: string;
  bpm: string;
  key: string;
  kitType: string; // The selected kit type
  files: {
    file: File;
    fileType: string;
    soundGroup?: string;
    subGroup?: string;
  }[];
}

interface ConstructionKitModalProps {
  trigger: React.ReactNode;
  onComplete: (result: ConstructionKitResult) => void;
}

export default function ConstructionKitModal({
  trigger,
  onComplete,
}: ConstructionKitModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kitName, setKitName] = useState("");
  const [kitBpm, setKitBpm] = useState("");
  const [kitKey, setKitKey] = useState("");
  const [selectedKitType, setSelectedKitType] = useState<string>("Full Loop");
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [playLoop, setPlayLoop] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [isKitTypeModalOpen, setIsKitTypeModalOpen] = useState(false);

  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const analyserRefs = useRef<Map<string, AnalyserNode>>(new Map());
  const animationRefs = useRef<Map<string, number>>(new Map());

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get allowed file types based on selected kit type
  const getAllowedFileTypes = () => {
    switch (selectedKitType) {
      case "Full Loop":
        return [FILE_TYPES.FULL_LOOP];
      case "Sample One-Shot":
        return [FILE_TYPES.AUDIO_ONE_SHOT];
      case "Sample Loop":
        return [FILE_TYPES.AUDIO_LOOP];
      case "Sample Loop + MIDI":
        return [FILE_TYPES.AUDIO_LOOP, FILE_TYPES.MIDI];
      case "Sample Loop + MIDI + Preset":
        return [FILE_TYPES.AUDIO_LOOP, FILE_TYPES.MIDI, FILE_TYPES.PRESET];
      default:
        return [FILE_TYPES.AUDIO_LOOP];
    }
  };

  // Helper to determine file type based on file
  const determineFileType = (file: File) => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".mid") || fileName.endsWith(".midi")) {
      return FILE_TYPES.MIDI;
    }

    if (file.type.startsWith("audio/")) {
      return FILE_TYPES.AUDIO_LOOP;
    }

    return FILE_TYPES.PRESET;
  };

  const addAudioFile = (file: File, fileType: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const url = URL.createObjectURL(file);

    const newAudioFile: AudioFile = {
      id,
      file,
      url,
      isPlaying: false,
      duration: "0:00",
      currentTime: "0:00",
      audioRef: null,
      fileType,
    };

    setAudioFiles((prev) => [...prev, newAudioFile]);
    setTempFile(null);
    setSelectedFileType(null);
    setIsFileModalOpen(false);
  };

  const updateAudioFileGroup = (id: string, soundGroup: string) => {
    setAudioFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, soundGroup } : file))
    );
  };

  const updateAudioFileSubGroup = (id: string, subGroup: string) => {
    setAudioFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, subGroup } : file))
    );
  };

  const removeAudioFile = (id: string) => {
    const fileToRemove = audioFiles.find((f) => f.id === id);
    if (fileToRemove) {
      if (fileToRemove.audioRef) {
        fileToRemove.audioRef.pause();
      }
      URL.revokeObjectURL(fileToRemove.url);

      const animationId = animationRefs.current.get(id);
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationRefs.current.delete(id);
      }

      canvasRefs.current.delete(id);
      analyserRefs.current.delete(id);
    }

    setAudioFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const suggestedFileType = determineFileType(files[0]);
      setTempFile(files[0]);
      setSelectedFileType(suggestedFileType);
      setIsFileModalOpen(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      "audio/*,.mid,.midi,.fxp,.preset,.vstpreset,.h2p, .SerumPreset";

    input.onchange = (e: Event) => {
      const inputTarget = e.target as HTMLInputElement;
      const files = inputTarget.files;
      if (files && files[0]) {
        const suggestedFileType = determineFileType(files[0]);
        setTempFile(files[0]);
        setSelectedFileType(suggestedFileType);
        setIsFileModalOpen(true);
      }
    };
    input.click();
  };

  const setupAudioVisualization = (audioFile: AudioFile) => {
    if (!audioFile.url || !audioFile.file.type.startsWith("audio/")) return;

    const canvas = canvasRefs.current.get(audioFile.id);
    if (!canvas) return;

    const audio = new Audio(audioFile.url);
    audio.loop = playLoop;
    audioFile.audioRef = audio;

    const updateTime = () => {
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id
            ? { ...f, currentTime: formatTime(audio.currentTime) }
            : f
        )
      );
    };

    const setAudioDuration = () => {
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id
            ? { ...f, duration: formatTime(audio.duration) }
            : f
        )
      );
    };

    const handleEnded = () => {
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id ? { ...f, isPlaying: false } : f
        )
      );
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);

    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    src.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRefs.current.set(audioFile.id, analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const cctx = canvas.getContext("2d")!;

    const draw = () => {
      const animationId = requestAnimationFrame(draw);
      animationRefs.current.set(audioFile.id, animationId);

      analyser.getByteFrequencyData(dataArray);
      cctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        cctx.fillStyle = "#c4a730";
        cctx.fillRect(
          i * barWidth + 1,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );
      }
    };

    draw();

    return () => {
      const animationId = animationRefs.current.get(audioFile.id);
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationRefs.current.delete(audioFile.id);
      }
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
      ctx.close();
    };
  };

  const togglePlay = async (id: string) => {
    const audioFile = audioFiles.find((f) => f.id === id);
    if (!audioFile?.audioRef) return;

    try {
      if (audioFile.isPlaying) {
        audioFile.audioRef.pause();
        setAudioFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isPlaying: false } : f))
        );
      } else {
        if (audioFile.file.type.startsWith("audio/")) {
          await audioFile.audioRef.play();
          setAudioFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isPlaying: true } : f))
          );
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, isPlaying: false } : f))
      );
    }
  };

  const handleChangeKitType = (kitType: string) => {
    // Reset files when kit type changes
    audioFiles.forEach((audioFile) => {
      if (audioFile.audioRef) {
        audioFile.audioRef.pause();
      }
      URL.revokeObjectURL(audioFile.url);
    });

    setAudioFiles([]);
    setSelectedKitType(kitType);
    setIsKitTypeModalOpen(false);
  };

  useEffect(() => {
    audioFiles.forEach((audioFile) => {
      if (audioFile.file.type.startsWith("audio/") && !audioFile.audioRef) {
        setupAudioVisualization(audioFile);
      }
    });
  }, [audioFiles, playLoop]);

  useEffect(() => {
    return () => {
      audioFiles.forEach((audioFile) => {
        URL.revokeObjectURL(audioFile.url);
      });
      animationRefs.current.forEach((animationId) => {
        cancelAnimationFrame(animationId);
      });
    };
  }, []);

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.AUDIO_ONE_SHOT:
        return "bg-blue-600/20 text-blue-300";
      case FILE_TYPES.AUDIO_LOOP:
      case FILE_TYPES.FULL_LOOP:
        return "bg-green-600/20 text-green-300";
      case FILE_TYPES.MIDI:
        return "bg-purple-600/20 text-purple-300";
      case FILE_TYPES.PRESET:
        return "bg-orange-600/20 text-orange-300";
      default:
        return "bg-gray-600/20 text-gray-300";
    }
  };

  const getFileTypeDescription = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.AUDIO_ONE_SHOT:
        return "Audio file • Single hit sample";
      case FILE_TYPES.AUDIO_LOOP:
        return "Audio file • Looping sample";
      case FILE_TYPES.FULL_LOOP:
        return "Audio file • Full song loop";
      case FILE_TYPES.MIDI:
        return "MIDI file • .mid or .midi";
      case FILE_TYPES.PRESET:
        return "Configuration file • .fxp, .vstpreset, etc.";
      default:
        return "File";
    }
  };

  // Helper functions for sound groups
  const getSoundGroupOptions = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.AUDIO_ONE_SHOT:
        return Object.keys(oneShotGroup);
      case FILE_TYPES.AUDIO_LOOP:
      case FILE_TYPES.FULL_LOOP:
        return Object.keys(loopGroups);
      case FILE_TYPES.MIDI:
        return Object.keys(midiGroups);
      case FILE_TYPES.PRESET:
        return Object.keys(presetGroup);
      default:
        return [];
    }
  };

  const getSubGroupOptions = (fileType: string, soundGroup: string): string[] => {
    if (!soundGroup) return [];

    let result: unknown = [];
    switch (fileType) {
      case FILE_TYPES.AUDIO_ONE_SHOT:
        result = oneShotGroup[soundGroup as keyof typeof oneShotGroup] || [];
        break;
      case FILE_TYPES.AUDIO_LOOP:
      case FILE_TYPES.FULL_LOOP:
        result = loopGroups[soundGroup as keyof typeof loopGroups] || [];
        break;
      case FILE_TYPES.MIDI:
        result = midiGroups[soundGroup as keyof typeof midiGroups] || [];
        break;
      case FILE_TYPES.PRESET:
        result = presetGroup[soundGroup as keyof typeof presetGroup] || [];
        break;
      default:
        result = [];
    }
    return Array.isArray(result) ? result : [];
  };

  // Check if the current kit has all required file types
  const hasAllRequiredFileTypes = () => {
    const allowedTypes = getAllowedFileTypes();
    const currentTypes = new Set(audioFiles.map((file) => file.fileType));

    return allowedTypes.every((type) => currentTypes.has(type));
  };

  // Get missing file types
  const getMissingFileTypes = () => {
    const allowedTypes = getAllowedFileTypes();
    const currentTypes = new Set(audioFiles.map((file) => file.fileType));

    return allowedTypes.filter((type) => !currentTypes.has(type));
  };

  const handleCreateKit = () => {
    // Create a Construction Kit object with all metadata and files
    const result: ConstructionKitResult = {
      name: kitName,
      bpm: kitBpm,
      key: kitKey,
      kitType: selectedKitType,
      files: audioFiles.map((file) => ({
        file: file.file,
        fileType: file.fileType,
        soundGroup: file.soundGroup,
        subGroup: file.subGroup,
      })),
    };

    onComplete(result);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    // Clean up and reset state
    audioFiles.forEach((audioFile) => {
      if (audioFile.audioRef) {
        audioFile.audioRef.pause();
      }
      URL.revokeObjectURL(audioFile.url);
    });

    animationRefs.current.forEach((animationId) => {
      cancelAnimationFrame(animationId);
    });

    setKitName("");
    setKitBpm("");
    setKitKey("");
    setAudioFiles([]);
    setTempFile(null);
    setSelectedFileType(null);
    canvasRefs.current = new Map();
    analyserRefs.current = new Map();
    animationRefs.current = new Map();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="bg-black border border-white/10 text-white sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Create Construction Kit
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Add files and metadata to create a new construction kit
            </DialogDescription>
          </DialogHeader>

          {/* Kit Type Selector */}
          <div className="flex justify-between items-center py-4">
            <Label className="text-white/70">Kit Type</Label>
            <Dialog
              open={isKitTypeModalOpen}
              onOpenChange={setIsKitTypeModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 flex items-center gap-2"
                >
                  {selectedKitType}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border border-white/10 text-white p-0 max-w-md">
                <DialogHeader className="p-4 border-b border-white/10">
                  <DialogTitle>Select Kit Type</DialogTitle>
                </DialogHeader>
                <div className="p-3">
                  {KIT_TYPES.map((kitType) => (
                    <button
                      key={kitType}
                      onClick={() => handleChangeKitType(kitType)}
                      className={`w-full text-left px-4 py-3 mb-2 transition-colors ${
                        selectedKitType === kitType
                          ? "bg-primary text-black"
                          : "hover:bg-white/5 text-white"
                      }`}
                    >
                      {kitType}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Required File Types */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-white/70 mb-2">
              Required Files for {selectedKitType}
            </h3>
            <div className="flex flex-wrap gap-2">
              {getAllowedFileTypes().map((fileType) => {
                const hasFileType = audioFiles.some(
                  (file) => file.fileType === fileType
                );
                return (
                  <div
                    key={fileType}
                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${
                      hasFileType
                        ? "bg-green-900/30 text-green-300 border border-green-600/40"
                        : "bg-white/5 text-white/70 border border-white/20"
                    }`}
                  >
                    {hasFileType && <Check className="w-3 h-3" />}
                    {fileType}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kit Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div>
              <Label htmlFor="name" className="text-white/70">
                Kit Name
              </Label>
              <Input
                id="name"
                value={kitName}
                onChange={(e) => setKitName(e.target.value)}
                placeholder="My Construction Kit"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bpm" className="text-white/70">
                BPM
              </Label>
              <Input
                id="bpm"
                value={kitBpm}
                onChange={(e) => setKitBpm(e.target.value)}
                placeholder="120"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="key" className="text-white/70">
                Key
              </Label>
              <Input
                id="key"
                value={kitKey}
                onChange={(e) => setKitKey(e.target.value)}
                placeholder="C Minor"
                className="bg-white/5 border-white/10 text-white mt-1"
              />
            </div>
          </div>

          {/* File Uploader */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer mt-2 ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-white/20 hover:border-white/40"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowse}
          >
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-white/60" />
              </div>
              <div>
                <p className="font-medium text-white">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-white/60 mt-1">
                  {getMissingFileTypes().length > 0 ? (
                    <>Missing: {getMissingFileTypes().join(", ")}</>
                  ) : (
                    "Add more files to your kit"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {audioFiles.length > 0 && (
            <div className="space-y-4 mt-4">
              <h3 className="text-md font-medium text-white">
                Files ({audioFiles.length})
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {audioFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getFileTypeColor(
                              file.fileType
                            )}`}
                          >
                            {file.fileType}
                          </span>
                          <h3 className="font-medium text-white truncate">
                            {file.file.name}
                          </h3>
                        </div>
                        <p className="text-xs text-white/60">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeAudioFile(file.id)}
                        className="w-7 h-7 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-full flex items-center justify-center ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Audio Preview */}
                    {file.file.type.startsWith("audio/") && (
                      <>
                        <div className="px-3 py-2 bg-white/5">
                          <canvas
                            ref={(el) => {
                              if (el) canvasRefs.current.set(file.id, el);
                            }}
                            className="w-full h-12 rounded bg-black/20"
                            width={600}
                            height={48}
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => togglePlay(file.id)}
                              className="w-8 h-8 bg-primary hover:bg-primary/80 text-black rounded-full flex items-center justify-center"
                            >
                              {file.isPlaying ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 text-center">
                              <span className="text-xs font-mono text-white/80">
                                {file.currentTime} / {file.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Sound Group Selection */}
                    <div className="p-3 pt-0 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/60 mb-1">
                          Sound Group
                        </label>
                        <Select
                          value={file.soundGroup}
                          onValueChange={(value) =>
                            updateAudioFileGroup(file.id, value)
                          }
                        >
                          <UiSelectTrigger className="w-full bg-white/5 border-white/10 text-white text-xs h-8">
                            <SelectValue placeholder="Select group" />
                          </UiSelectTrigger>
                          <SelectContent className="bg-black border-white/10">
                            <SelectGroup>
                              {getSoundGroupOptions(file.fileType).map(
                                (group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                )
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {file.soundGroup && (
                        <div>
                          <label className="block text-xs text-white/60 mb-1">
                            Sub Group
                          </label>
                          <Select
                            value={file.subGroup}
                            onValueChange={(value) =>
                              updateAudioFileSubGroup(file.id, value)
                            }
                          >
                            <UiSelectTrigger className="w-full bg-white/5 border-white/10 text-white text-xs h-8">
                              <SelectValue placeholder="Select subgroup" />
                            </UiSelectTrigger>
                            <SelectContent className="bg-black border-white/10">
                              <SelectGroup>
                                {getSubGroupOptions(
                                  file.fileType,
                                  file.soundGroup
                                ).map((subGroup) => (
                                  <SelectItem key={subGroup} value={subGroup}>
                                    {subGroup}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateKit}
              className="bg-primary text-black hover:bg-primary/90 flex items-center gap-2"
              disabled={
                !kitName || !kitBpm || !kitKey || !hasAllRequiredFileTypes()
              }
            >
              <Save className="w-4 h-4" />
              Create Construction Kit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Type Selection Modal */}
      <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
        <DialogContent className="bg-black border border-white/10 text-white sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select File Type</DialogTitle>
            <DialogDescription className="text-white/60">
              {tempFile?.name && (
                <>
                  Choose the file type for:{" "}
                  <span className="text-white font-medium">
                    {tempFile.name}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {getAllowedFileTypes().map((fileType) => (
              <button
                key={fileType}
                className={`p-3 border text-left transition-all ${
                  selectedFileType === fileType
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }`}
                onClick={() => setSelectedFileType(fileType)}
              >
                <div className="font-medium">{fileType}</div>
                <div className="text-xs mt-1 opacity-70">
                  {getFileTypeDescription(fileType)}
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTempFile(null);
                setSelectedFileType(null);
                setIsFileModalOpen(false);
              }}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (tempFile && selectedFileType) {
                  addAudioFile(tempFile, selectedFileType);
                }
              }}
              className="bg-primary text-black hover:bg-primary/90"
              disabled={!selectedFileType || !tempFile}
            >
              Add File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
