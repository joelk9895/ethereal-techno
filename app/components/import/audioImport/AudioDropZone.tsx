import { useState, useEffect, DragEvent } from "react";
import { Upload } from "lucide-react";
import { AudioFile, AudioDropZoneProps, FILE_TYPES } from "./types";
import { determineFileType } from "./utils";
import AudioFileComponent from "./AudioFile";
import { RequiredFiles, StatusMessage } from "./StatusIndicators";

export default function AudioDropZone({
  onFileSelected,
  type,
}: AudioDropZoneProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [prevType, setPrevType] = useState(type);

  useEffect(() => {
    if (type !== prevType) {
      audioFiles.forEach((file) => {
        if (file.audioRef) {
          file.audioRef.pause();
        }
        URL.revokeObjectURL(file.url);
      });
      setAudioFiles([]);
      setPrevType(type);
    }
  }, [type, prevType, audioFiles]);

  useEffect(() => {
    return () => {
      audioFiles.forEach((file) => {
        if (file.audioRef) {
          file.audioRef.pause();
        }
        URL.revokeObjectURL(file.url);
      });
    };
  }, [audioFiles]);

  const [isDragging, setIsDragging] = useState(false);

  const isOneShot = type === "One-Shot";
  const isSampleLoop = type === "Sample Loop";
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
    return [FILE_TYPES.AUDIO];
  };

  const getFileTypePrompt = () => {
    const currentTypes = new Set(audioFiles.map((file) => file.fileType));

    if (isMidiMode) {
      if (
        currentTypes.has(FILE_TYPES.AUDIO) &&
        !currentTypes.has(FILE_TYPES.MIDI)
      ) {
        return "Drop your MIDI file (.mid)";
      }
      if (
        !currentTypes.has(FILE_TYPES.AUDIO) &&
        currentTypes.has(FILE_TYPES.MIDI)
      ) {
        return "Drop your audio file (.wav)";
      }
      return "Drop your audio (.wav) and MIDI (.mid) files";
    }

    if (isPreset) {
      const missingTypes = getMissingFileTypes();
      if (missingTypes.length === 1) {
        if (missingTypes[0] === FILE_TYPES.AUDIO) {
          return "Drop your audio file (.wav)";
        } else if (missingTypes[0] === FILE_TYPES.MIDI) {
          return "Drop your MIDI file (.mid)";
        } else if (missingTypes[0] === FILE_TYPES.PRESET) {
          return "Drop your preset file (.SerumPreset, .h2p)";
        }
      }
      return "Drop your audio (.wav), MIDI (.mid), and preset (.SerumPreset, .h2p) files";
    }

    if (isMidiOnly) {
      return "Drop your MIDI file (.mid)";
    }

    if (isOneShot || isSampleLoop) {
      return "Drop your audio file (.wav)";
    }

    return "Drop your file";
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
      contentType: type,
    };

    setAudioFiles((prev) => {
      const updatedFiles =
        isMidiMode || isPreset
          ? [...prev.filter((f) => f.fileType !== fileType), newAudioFile]
          : [newAudioFile];

      if (isMidiMode || isPreset) {
        const allRequiredTypes = getRequiredFileTypes() || [];
        const currentTypes = new Set(updatedFiles.map((f) => f.fileType));
        const hasAllTypes = allRequiredTypes.every((type) =>
          currentTypes.has(type)
        );

        if (hasAllTypes) {
          setTimeout(() => {
            onFileSelected(updatedFiles.map((f) => f.file));
          }, 0);
        }
      } else {
        setTimeout(() => {
          onFileSelected(file);
        }, 0);
      }

      return updatedFiles;
    });
  };

  const removeAudioFile = (id: string) => {
    const fileToRemove = audioFiles.find((f) => f.id === id);
    if (fileToRemove) {
      if (fileToRemove.audioRef) {
        fileToRemove.audioRef.pause();
      }
      URL.revokeObjectURL(fileToRemove.url);
    }

    setAudioFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== id);

      setTimeout(() => {
        if (updatedFiles.length === 0) {
          onFileSelected([]);
        } else if (isMidiMode || isPreset) {
          const allRequiredTypes = getRequiredFileTypes() || [];
          const currentTypes = new Set(updatedFiles.map((f) => f.fileType));
          const hasAllTypes = allRequiredTypes.every((type) =>
            currentTypes.has(type)
          );

          if (hasAllTypes) {
            onFileSelected(updatedFiles.map((f) => f.file));
          } else {
            onFileSelected([]);
          }
        } else {
          onFileSelected(updatedFiles.map((f) => f.file));
        }
      }, 0);

      return updatedFiles;
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      files.map((file) => {
        const fileType = determineFileType(file);
        const requiredTypes = getRequiredFileTypes() || [];
        if (requiredTypes.includes(fileType)) {
          addAudioFile(file, fileType);
        }
      });
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
    if (type === "") {
      return;
    }
    const input = document.createElement("input");
    input.type = "file";

    const currentTypes = new Set(audioFiles.map((file) => file.fileType));

    if (isMidiOnly) {
      input.accept = ".mid";
    } else if (isMidiMode) {
      if (currentTypes.has(FILE_TYPES.AUDIO)) {
        input.accept = ".mid";
      } else if (currentTypes.has(FILE_TYPES.MIDI)) {
        input.accept = "audio/wav";
      } else {
        input.accept = "audio/wav,.mid";
        input.multiple = true;
      }
    } else if (isPreset) {
      const missingTypes = getMissingFileTypes();
      if (missingTypes.length === 1) {
        if (missingTypes[0] === FILE_TYPES.AUDIO) {
          input.accept = "audio/wav";
        } else if (missingTypes[0] === FILE_TYPES.MIDI) {
          input.accept = ".mid";
        } else if (missingTypes[0] === FILE_TYPES.PRESET) {
          input.accept = ".SerumPreset,.h2p";
        }
      } else {
        input.accept = ".SerumPreset,.h2p,audio/wav,.mid";
        input.multiple = true;
      }
    } else {
      input.accept = "audio/wav";
    }

    input.onchange = (e: Event) => {
      const inputTarget = e.target as HTMLInputElement;
      const files = inputTarget.files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        if (fileArray.length === 1) {
          const file = fileArray[0];
          const fileType = determineFileType(file);
          const requiredTypes = getRequiredFileTypes() || [];
          if (requiredTypes.includes(fileType)) {
            addAudioFile(file, fileType);
          }
        } else {
          fileArray.forEach((file) => {
            const fileType = determineFileType(file);
            const requiredTypes = getRequiredFileTypes() || [];
            if (requiredTypes.includes(fileType)) {
              if (isMidiMode || isPreset) {
                addAudioFile(file, fileType);
              }
            }
          });
        }
      }
    };
    input.click();
  };

  const getFileCountText = () => {
    if (isMidiMode) {
      return `(${audioFiles.length}/2)`;
    }
    if (isPreset) {
      return `(${audioFiles.length}/3)`;
    }
    return `(${audioFiles.length})`;
  };

  return (
    <>
      {type !== "" && (
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
                    {getFileTypePrompt()}
                  </p>
                  <p className="text-sm text-white/60">
                    or click to browse{" "}
                    {audioFiles.length > 0 && getMissingFileTypes().length > 0
                      ? "the missing files"
                      : "files"}
                  </p>
                </div>
              </div>
            </div>

            {audioFiles.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-white">
                  Files {getFileCountText()}
                </h3>
                <div className="space-y-3">
                  {audioFiles.map((file) => (
                    <AudioFileComponent
                      key={file.id}
                      file={file}
                      onRemove={() => removeAudioFile(file.id)}
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
      )}
      {type === "" && (
        <div className="p-12 text-center border-2 border-dashed rounded-2xl border-white/10 max-w-2xl mx-auto opacity-50">
          <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-center text-lg font-medium text-white mb-2">
            No Content Type Selected
          </p>
          <p className="text-center text-sm text-white/40">
            Please select a content type above to upload files.
          </p>
        </div>
      )}
    </>
  );
}
