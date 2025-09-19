import { useState, useRef, useEffect, DragEvent, use } from "react";
import { Upload } from "lucide-react";
import { AudioFile, AudioDropZoneProps, FILE_TYPES } from "./types";
import { determineFileType, formatTime, generateWaveformData } from "./utils";
import AudioFileComponent from "./AudioFile";
import FileTypeModal from "./FileTypeModal";
import { RequiredFiles, StatusMessage } from "./StatusIndicators";

export default function AudioDropZone({
  onFileSelected,
  type,
}: AudioDropZoneProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [playLoop, setPlayLoop] = useState(false);
  const [isLoadingWaveform, setIsLoadingWaveform] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);

  const isMidiMode = type === "Sample Loop+MIDI";
  const isMidiOnly = type === "MIDI";
  const isPreset = type === "Preset";

  useEffect(() => {
    if (type === "One-Shot") {
      setPlayLoop(false);
    } else {
      setPlayLoop(true);
    }
  }, [type]);

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
    return [FILE_TYPES.AUDIO];
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

      if ((isMidiMode || isPreset) && hasAllRequiredFiles()) {
        onFileSelected(updatedFiles.map((f) => f.file));
      } else if (!isMidiMode && !isPreset) {
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
      input.accept = ".mid";
    } else if (isMidiMode) {
      input.accept = "audio/wav,.mid";
    } else if (isPreset) {
      input.accept = ".SerumPreset,.h2p,audio/wav, .mid";
    } else {
      input.accept = "audio/wav";
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
      const currentProgress = audio.currentTime / (audio.duration || 1);
      setProgress(currentProgress);
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
      if (!playLoop) {
        setProgress(0);
        audio.currentTime = 0;
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

  useEffect(() => {
    audioFiles.forEach((audioFile) => {
      if (audioFile.fileType === FILE_TYPES.AUDIO && audioFile.audioRef) {
        audioFile.audioRef.loop = playLoop;
      }
    });
  }, [playLoop]);

  const handlePositionChange = (position: number) => {
    const audioFile = audioFiles.find((f) => f.fileType === FILE_TYPES.AUDIO);
    if (!audioFile?.audioRef) return;

    const newTime = position * audioFile.audioRef.duration;
    if (!isNaN(newTime) && isFinite(newTime)) {
      audioFile.audioRef.currentTime = newTime;
      setProgress(position);
    }
  };

  const handleModalConfirm = () => {
    if (tempFile && selectedFileType) {
      addAudioFile(tempFile, selectedFileType);
    }
  };

  useEffect(() => {
    setAudioFiles([]);
  }, [type]);

  useEffect(() => {
    audioFiles.forEach((audioFile) => {
      if (audioFile.fileType === FILE_TYPES.AUDIO && !audioFile.audioRef) {
        setupAudio(audioFile);
      }
    });
  }, [audioFiles, playLoop]);

  useEffect(() => {
    return () => {
      audioFiles.forEach((audioFile) => {
        URL.revokeObjectURL(audioFile.url);
      });
    };
  }, []);

  return (
    <>
      <div className="h-fit transition-all bg-black text-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {(isMidiMode || isPreset) && (
            <RequiredFiles
              title={`Required Files for ${type}`}
              requiredTypes={getRequiredFileTypes() || []}
              uploadedFiles={audioFiles}
            />
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
                  or click to browse the file
                </p>
              </div>
            </div>
          </div>

          {audioFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-white">
                Files ({audioFiles.length}
                {isMidiMode ? "/2" : ""})
              </h3>
              <div className="space-y-3">
                {audioFiles.map((file) => (
                  <AudioFileComponent
                    key={file.id}
                    file={file}
                    isLoadingWaveform={
                      isLoadingWaveform && file.fileType === FILE_TYPES.AUDIO
                    }
                    waveformData={waveformData}
                    progress={progress}
                    playLoop={playLoop}
                    onRemove={removeAudioFile}
                    onTogglePlay={togglePlay}
                    onPlayLoop={(loop: boolean) => setPlayLoop(loop)}
                    onPositionChange={handlePositionChange}
                  />
                ))}
              </div>
            </div>
          )}

          {(isMidiMode || isPreset) && audioFiles.length > 0 && (
            <StatusMessage
              isComplete={hasAllRequiredFiles()}
              missingTypes={getMissingFileTypes()}
            />
          )}
        </div>
      </div>

      {(isMidiMode || isPreset) && (
        <FileTypeModal
          isOpen={isFileModalOpen}
          onOpenChange={setIsFileModalOpen}
          tempFile={tempFile}
          requiredFileTypes={getRequiredFileTypes() || []}
          selectedFileType={selectedFileType}
          setSelectedFileType={setSelectedFileType}
          uploadedFileTypes={audioFiles.map((f) => f.fileType)}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
}
