"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { Play, Pause, Upload, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface AudioDropZoneProps {
  onFileSelected: (file: File | File[]) => void;
  type: string;
}

const FILE_TYPES = {
  AUDIO: "Audio",
  MIDI: "MIDI",
  PRESET: "Preset",
};

interface AudioFile {
  id: string;
  file: File;
  url: string;
  isPlaying: boolean;
  duration: string;
  currentTime: string;
  audioRef: HTMLAudioElement | null;
  fileType: string;
}

export default function AudioDropZone({
  onFileSelected,
  type,
}: AudioDropZoneProps) {
  useEffect(() => {
    setAudioFiles([]);
  }, [type]);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [playLoop, setPlayLoop] = useState(false);
  const [isLoadingWaveform, setIsLoadingWaveform] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isDraggingWaveform, setIsDraggingWaveform] = useState(false);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformContainerRef = useRef<HTMLDivElement | null>(null);

  const isMidiMode = type === "Sample Loop+MIDI";
  const isMidiOnly = type === "MIDI";
  const isPreset = type === "Preset";

  const getRequiredFileTypes = () => {
    if (isMidiOnly) {
      return [FILE_TYPES.MIDI];
    }
    if (isMidiMode) {
      return [FILE_TYPES.AUDIO, FILE_TYPES.MIDI];
    }
    if (isPreset) {
      return [FILE_TYPES.AUDIO, FILE_TYPES.MIDI, FILE_TYPES.PRESET];
    }
  };

  const hasAllRequiredFiles = () => {
    if (!isMidiMode && !isPreset) {
      return audioFiles.length > 0;
    }

    const requiredTypes = getRequiredFileTypes() ?? [];
    const currentTypes = new Set(audioFiles.map((file) => file.fileType));
    return requiredTypes.every((type) => currentTypes.has(type));
  };

  const getMissingFileTypes = () => {
    if (!isMidiMode && !isPreset) {
      return audioFiles.length === 0 ? ["Audio"] : [];
    }

    const requiredTypes = getRequiredFileTypes() ?? [];
    const currentTypes = new Set(audioFiles.map((file) => file.fileType));
    return requiredTypes.filter((type) => !currentTypes.has(type));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generateWaveformData = async (audioBuffer: AudioBuffer) => {
    const rawData = audioBuffer.getChannelData(0);
    const samples = 200;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map((n) => n * multiplier);
  };

  const loadWaveform = async (file: File) => {
    setIsLoadingWaveform(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const waveform = await generateWaveformData(audioBuffer);
      setWaveformData(waveform);
      audioContext.close();
    } catch (error) {
      console.error("Error generating waveform:", error);
    } finally {
      setIsLoadingWaveform(false);
    }
  };

  const determineFileType = (file: File): string => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".mid") || fileName.endsWith(".midi")) {
      return FILE_TYPES.MIDI;
    }
    if (file.type.startsWith("audio/")) {
      return FILE_TYPES.AUDIO;
    }
    if (
      fileName.endsWith(".fxp") ||
      fileName.endsWith(".serumpreset") ||
      fileName.endsWith(".h2p")
    ) {
      return FILE_TYPES.PRESET;
    }
    return FILE_TYPES.AUDIO;
  };

  const addAudioFile = (file: File, fileType: string) => {
    if (!isMidiMode && !isPreset) {
      audioFiles.forEach((existingFile) => {
        if (existingFile.audioRef) {
          existingFile.audioRef.pause();
        }
        URL.revokeObjectURL(existingFile.url);
      });
      setAudioFiles([]);
    }

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

    setAudioFiles((prev) => {
      if (isMidiMode || isPreset) {
        const filtered = prev.filter((f) => f.fileType !== fileType);
        return [...filtered, newAudioFile];
      }
      return [newAudioFile];
    });

    if (fileType === FILE_TYPES.AUDIO) {
      loadWaveform(file);
    }

    setTimeout(() => {
      const updatedFiles =
        isMidiMode || isPreset
          ? audioFiles
              .filter((f) => f.fileType !== fileType)
              .concat(newAudioFile)
          : [newAudioFile];

      if (isMidiMode) {
        const hasAudio = updatedFiles.some(
          (f) => f.fileType === FILE_TYPES.AUDIO
        );
        const hasMidi = updatedFiles.some(
          (f) => f.fileType === FILE_TYPES.MIDI
        );

        if (hasAudio && hasMidi) {
          onFileSelected(updatedFiles.map((f) => f.file));
        }
      } else {
        onFileSelected(file);
      }
    }, 0);

    setTempFile(null);
    setSelectedFileType(null);
    setIsFileModalOpen(false);
  };

  const removeAudioFile = (id: string) => {
    const fileToRemove = audioFiles.find((f) => f.id === id);
    if (fileToRemove) {
      if (fileToRemove.audioRef) {
        fileToRemove.audioRef.pause();
      }
      URL.revokeObjectURL(fileToRemove.url);
    }
    setAudioFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audioFile = audioFiles.find((f) => f.fileType === FILE_TYPES.AUDIO);
    if (!audioFile?.audioRef || !waveformContainerRef.current) return;

    const rect = waveformContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * audioFile.audioRef.duration;

    if (!isNaN(newTime) && isFinite(newTime)) {
      const wasPlaying = !audioFile.audioRef.paused;
      audioFile.audioRef.currentTime = newTime;
      setProgress(percentage);

      if (wasPlaying && audioFile.audioRef.paused) {
        audioFile.audioRef.play().catch(console.error);
      }
    }
  };

  const handleWaveformMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingWaveform(true);
    handleWaveformClick(e);
  };

  const handleWaveformMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingWaveform) return;
    handleWaveformClick(e);
  };

  const handleWaveformMouseUp = () => {
    setIsDraggingWaveform(false);
  };

  const drawWaveform = () => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / waveformData.length;
    const centerY = height / 2;

    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.8;
      const x = index * barWidth;

      const barProgress = index / waveformData.length;
      const isPlayed = barProgress <= progress;

      ctx.fillStyle = isPlayed ? "rgb(59, 130, 246)" : "rgb(75, 85, 99)";

      ctx.fillRect(x + 1, centerY - barHeight / 2, barWidth - 2, barHeight / 2);
      ctx.fillRect(x + 1, centerY, barWidth - 2, barHeight / 2);
    });

    const progressX = progress * width;
    ctx.strokeStyle = "rgb(59, 130, 246)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const suggestedFileType = determineFileType(files[0]);

      if (!isMidiMode && !isPreset && suggestedFileType === FILE_TYPES.AUDIO) {
        addAudioFile(files[0], FILE_TYPES.AUDIO);
        return;
      }
      if (isMidiOnly && suggestedFileType === FILE_TYPES.MIDI) {
        addAudioFile(files[0], FILE_TYPES.MIDI);
        return;
      }
      if (isMidiMode || isPreset) {
        setTempFile(files[0]);
        setSelectedFileType(suggestedFileType);
        setIsFileModalOpen(true);
      }
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
    if (isMidiOnly) {
      input.accept = ".mid,.midi";
    } else if (isMidiMode) {
      input.accept = "audio/*,.mid,.midi";
    } else if (isPreset) {
      console.log("Preset mode");
      input.accept =
        ".fxp,.serumpreset,.h2p, audio/mp3,audio/wav,audio/x-m4a,audio/m4a, .mid,.midi";
    } else {
      input.accept = "audio/mp3,audio/wav,audio/x-m4a,audio/m4a";
    }

    input.onchange = (e: Event) => {
      const inputTarget = e.target as HTMLInputElement;
      const files = inputTarget.files;
      if (files && files[0]) {
        const suggestedFileType = determineFileType(files[0]);

        if (
          !isMidiMode &&
          !isPreset &&
          suggestedFileType === FILE_TYPES.AUDIO
        ) {
          addAudioFile(files[0], FILE_TYPES.AUDIO);
          return;
        }

        if (isMidiOnly && suggestedFileType === FILE_TYPES.MIDI) {
          addAudioFile(files[0], FILE_TYPES.MIDI);
          return;
        }

        if (isMidiMode || isPreset) {
          setTempFile(files[0]);
          setSelectedFileType(suggestedFileType);
          setIsFileModalOpen(true);
        }
      }
    };
    input.click();
  };

  const setupAudio = (audioFile: AudioFile) => {
    if (audioFile.fileType !== FILE_TYPES.AUDIO || !audioFile.url) return;

    const audio = new Audio(audioFile.url);
    audio.loop = playLoop;
    audio.preload = "metadata";
    audioFile.audioRef = audio;

    const updateTime = () => {
      if (
        !isDraggingWaveform &&
        audioFile.audioRef &&
        !audioFile.audioRef.paused
      ) {
        const currentProgress =
          audioFile.audioRef.currentTime / audioFile.audioRef.duration || 0;
        setProgress(currentProgress);
        setAudioFiles((prev) =>
          prev.map((f) =>
            f.id === audioFile.id
              ? {
                  ...f,
                  currentTime: formatTime(audioFile.audioRef!.currentTime),
                }
              : f
          )
        );
      }
    };

    const setAudioDuration = () => {
      if (audioFile.audioRef && audioFile.audioRef.duration) {
        setAudioFiles((prev) =>
          prev.map((f) =>
            f.id === audioFile.id
              ? {
                  ...f,
                  duration: formatTime(audioFile.audioRef!.duration),
                }
              : f
          )
        );
      }
    };

    const handleEnded = () => {
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id ? { ...f, isPlaying: false } : f
        )
      );
      if (!playLoop) {
        setProgress(0);
        if (audioFile.audioRef) {
          audioFile.audioRef.currentTime = 0;
        }
      }
    };

    const handlePause = () => {
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id ? { ...f, isPlaying: false } : f
        )
      );
    };

    const handlePlay = () => {
      setAudioFiles((prev) =>
        prev.map((f) => (f.id === audioFile.id ? { ...f, isPlaying: true } : f))
      );
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.pause();
    };
  };

  const togglePlay = async () => {
    const audioFile = audioFiles.find((f) => f.fileType === FILE_TYPES.AUDIO);
    if (!audioFile?.audioRef) return;

    try {
      if (audioFile.isPlaying) {
        audioFile.audioRef.pause();
      } else {
        const allAudio = document.querySelectorAll("audio");
        allAudio.forEach((audio) => {
          if (audio !== audioFile.audioRef) {
            audio.pause();
          }
        });
        await audioFile.audioRef.play();
      }
    } catch (error) {
      console.error("Error toggling audio playback:", error);
      setAudioFiles((prev) =>
        prev.map((f) =>
          f.id === audioFile.id ? { ...f, isPlaying: false } : f
        )
      );
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.AUDIO:
        return "bg-green-600/20 text-green-300";
      case FILE_TYPES.MIDI:
        return "bg-purple-600/20 text-purple-300";
      case FILE_TYPES.PRESET:
        return "bg-yellow-600/20 text-yellow-300";
      default:
        return "bg-gray-600/20 text-gray-300";
    }
  };

  const getFileTypeDescription = (fileType: string) => {
    switch (fileType) {
      case FILE_TYPES.AUDIO:
        return "Audio file • MP3, WAV, M4A";
      case FILE_TYPES.MIDI:
        return "MIDI file • .mid or .midi";
      case FILE_TYPES.PRESET:
        return "Preset file • .fxp, .serumpreset, .h2p";
      default:
        return "File";
    }
  };

  useEffect(() => {
    audioFiles.forEach((audioFile) => {
      if (audioFile.fileType === FILE_TYPES.AUDIO && !audioFile.audioRef) {
        setupAudio(audioFile);
      }
    });
  }, [audioFiles, playLoop]);

  useEffect(() => {
    drawWaveform();
  }, [waveformData, progress]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingWaveform(false);
    };

    if (isDraggingWaveform) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDraggingWaveform]);

  useEffect(() => {
    return () => {
      audioFiles.forEach((audioFile) => {
        URL.revokeObjectURL(audioFile.url);
      });
    };
  }, []);

  const audioFile = audioFiles.find((f) => f.fileType === FILE_TYPES.AUDIO);

  return (
    <>
      <div className="h-fit transition-all bg-black text-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Required Files Indicator for Sample Loop+MIDI */}
          {(isMidiMode || isPreset) && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/70 mb-2">
                Required Files for Sample Loop+MIDI
              </h3>
              <div className="flex flex-wrap gap-2">
                {getRequiredFileTypes()?.map((fileType) => {
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
          )}

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-white/20 hover:border-white/40"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowse}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white/60" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Drop your{" "}
                  {isMidiOnly ? "MIDI file" : isMidiMode ? "files" : "file"}{" "}
                  here
                </p>
                <p className="text-sm text-white/60">
                  {isMidiMode ? (
                    getMissingFileTypes().length > 0 ? (
                      <>Missing: {getMissingFileTypes().join(" & ")}</>
                    ) : (
                      "Both Audio and MIDI files required"
                    )
                  ) : (
                    "or click to browse • MP3, WAV, M4A supported"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {audioFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-white">
                Files ({audioFiles.length}
                {isMidiMode ? "/2" : ""})
              </h3>
              <div className="space-y-3">
                {audioFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
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
                        <p className="text-sm text-white/60">
                          {(file.file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeAudioFile(file.id)}
                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-full flex items-center justify-center ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {file.fileType === FILE_TYPES.AUDIO && (
                      <>
                        <div className="px-6 py-4 bg-white/5">
                          {isLoadingWaveform ? (
                            <div className="w-full h-20 rounded-lg bg-black/20 flex items-center justify-center">
                              <div className="text-white/60 text-sm">
                                Generating waveform...
                              </div>
                            </div>
                          ) : (
                            <div
                              ref={waveformContainerRef}
                              className="w-full h-20 rounded-lg bg-black/20 cursor-pointer select-none relative overflow-hidden"
                              onMouseDown={handleWaveformMouseDown}
                              onMouseMove={handleWaveformMouseMove}
                              onMouseUp={handleWaveformMouseUp}
                              onMouseLeave={handleWaveformMouseUp}
                            >
                              <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                                width={800}
                                height={80}
                              />
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={togglePlay}
                              className="w-12 h-12 bg-primary hover:bg-primary/80 text-black rounded-full flex items-center justify-center transition-colors duration-200"
                              disabled={isLoadingWaveform}
                            >
                              {file.isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1 text-center">
                              <span className="text-sm font-mono text-white/80">
                                {file.currentTime} / {file.duration}
                              </span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={playLoop}
                                onChange={(e) => setPlayLoop(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary bg-white/10"
                              />
                              <span className="text-sm text-white/80">
                                Loop
                              </span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isMidiMode || isPreset) &&
            !hasAllRequiredFiles() &&
            audioFiles.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm text-center">
                  Both Audio and MIDI files are required. Missing:{" "}
                  {getMissingFileTypes().join(" & ")}
                </p>
              </div>
            )}

          {isMidiMode && hasAllRequiredFiles() && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm text-center">
                ✓ All required files uploaded successfully
              </p>
            </div>
          )}
        </div>
      </div>

      {isMidiMode ||
        (isPreset && (
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
                {getRequiredFileTypes()?.map((fileType) => {
                  const isAlreadyUploaded = audioFiles.some(
                    (f) => f.fileType === fileType
                  );
                  return (
                    <button
                      key={fileType}
                      className={`p-3 border text-left transition-all rounded-lg ${
                        selectedFileType === fileType
                          ? "bg-primary/10 border-primary text-primary"
                          : isAlreadyUploaded
                          ? "bg-gray-800/50 border-gray-600 text-gray-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      }`}
                      onClick={() => setSelectedFileType(fileType)}
                      disabled={isAlreadyUploaded}
                    >
                      <div className="font-medium">
                        {fileType} {isAlreadyUploaded && "(Already uploaded)"}
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {getFileTypeDescription(fileType)}
                      </div>
                    </button>
                  );
                })}
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
        ))}
    </>
  );
}
