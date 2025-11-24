import React, { useState, JSX, useEffect } from "react";
import {
  Upload,
  Music,
  AudioWaveform,
  Settings,
  X,
  ArrowRight,
  Check,
  Loader2,
} from "lucide-react";
import { midiGroups } from "@/app/data/sample";
import { CustomSelect } from "./CustomSelect";
import {
  determineFileType,
  getCategoryTypeOptions,
  updateFileData,
  determineMimeType,
} from "./utils";
import { FileObject, FileDataMap, FileDataItem } from "./types";
import AudioFile from "../audioImport/AudioFile";
import Loading from "../../general/loading";
import Alert, { AlertModal } from "../../general/alert";
import { calculateBPMFromFile, formatBPMResult } from "@/app/services/getBpm";

const contentTypes = ["One-Shot", "Sample Loop", "Full Loop"];

type FileIconType = "wav" | "MIDI" | "Preset" | string;

// Define types for API responses
interface ContentItem {
  id: string;
  contentType: string;
  contentName: string;
  soundGroup: string;
  subGroup: string;
  streamUrl?: string; // Add optional streamUrl
}

interface ConstructionKitData {
  contents: ContentItem[];
  defaultFullLoopId: string | null;
}

interface UploadData {
  presignedUrl: string;
  key: string;
  url: string;
  filename: string;
}

interface UploadResponse {
  uploads: UploadData[];
}

interface AudioFileType {
  id: string;
  file: File;
  url: string;
  fileType: string;
  isPlaying: boolean;
  duration: string;
  currentTime: string;
  audioRef: HTMLAudioElement | null;
  contentType: string;
}

interface AlertState {
  show: boolean;
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
}

const getFileIcon = (fileType: FileIconType): JSX.Element => {
  switch (fileType) {
    case "wav":
      return <AudioWaveform className="w-5 h-5 text-primary/70" />;
    case "MIDI":
      return <Music className="w-5 h-5 text-primary/70" />;
    case "Preset":
      return <Settings className="w-5 h-5 text-primary/70" />;
    default:
      return <Upload className="w-5 h-5 text-primary/70" />;
  }
};

export default function FileDrop({
  id,
  onFileUploaded,
  onFileCountChange,
  onBPMDetected,
}: {
  id: string;
  onFileUploaded: () => void;
  onFileCountChange: (count: number) => void;
  onBPMDetected: (bpm: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [fileData, setFileData] = useState<Record<number, FileDataItem>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {}
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [previewAudioFile, setPreviewAudioFile] =
    useState<AudioFileType | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [defaultFullLoopIndex, setDefaultFullLoopIndex] = useState<number | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    variant: "info",
    title: "",
    description: "",
  });

  const showAlert = (
    variant: AlertState["variant"],
    title: string,
    description?: string
  ) => {
    setAlertState({ show: true, variant, title, description });
  };

  const closeAlert = () => {
    setAlertState({ ...alertState, show: false });
  };

  useEffect(() => {
    if (previewIndex !== null && files[previewIndex]) {
      const file = files[previewIndex];
      const isExistingAudio = file.isExisting && file.streamUrl;

      const audioFile: AudioFileType = {
        id: `preview-${previewIndex}`,
        file: file as File,
        // Use the streamUrl for existing files, otherwise create an object URL for new files
        url: isExistingAudio
          ? file.streamUrl!
          : URL.createObjectURL(file as File),
        fileType: "Audio",
        isPlaying: false,
        duration: "0:00",
        currentTime: "0:00",
        audioRef: null,
        contentType: fileData[previewIndex]?.category || "Sample Loop",
      };
      setPreviewAudioFile(audioFile);
    } else {
      setPreviewAudioFile(null);
    }
  }, [previewIndex, files, fileData]);

  useEffect(() => {
    return () => {
      // Only revoke URLs that were created with createObjectURL
      if (previewAudioFile?.url && !previewAudioFile.url.startsWith("https")) {
        URL.revokeObjectURL(previewAudioFile.url);
      }
    };
  }, [previewAudioFile]);

  useEffect(() => {
    if (onFileCountChange) {
      onFileCountChange(files.length);
    }
  }, [files.length, onFileCountChange]);

  useEffect(() => {
    setLoadingExisting(true);
    const fetchExistingContents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/${id}`
        );
        if (response.ok) {
          const data: ConstructionKitData = await response.json();
          if (data.contents && data.contents.length > 0) {
            const existingFiles: FileObject[] = data.contents.map(
              (content: ContentItem) => ({
                id: `existing-${content.id}`,
                name: content.contentName,
                size: 0,
                type: determineMimeType(content.contentType),
                isExisting: true,
                contentId: content.id,
                lastModified: Date.now(),
                streamUrl: content.streamUrl,
              })
            );

            setFiles(existingFiles);

            const newData: Record<number, FileDataItem> = {};
            let initialDefaultIndex: number | null = null;

            data.contents.forEach((content: ContentItem, index: number) => {
              const category = content.contentType || "";
              const soundGroup = content.soundGroup || "";
              const subGroup = content.subGroup || "";

              const typeValue =
                category === "MIDI" ? soundGroup : subGroup;

              const isDefault = content.id === data.defaultFullLoopId;
              if (isDefault) {
                initialDefaultIndex = index;
              }

              newData[index] = {
                category: category,
                group: soundGroup,
                type: typeValue,
                isExisting: true,
                originalCategory: category,
                originalType: typeValue,
                originalGroup: soundGroup,
                contentId: content.id,
                isDefaultFullLoop: isDefault,
                originalDefaultLoopId: data.defaultFullLoopId || undefined,
              };
            });

            setFileData(newData);

            // Set the default loop index state
            if (initialDefaultIndex !== null) {
              setDefaultFullLoopIndex(initialDefaultIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching existing contents:", error);
      } finally {
        setLoadingExisting(false);
      }
    };

    fetchExistingContents();
  }, [id]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    addFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const addFiles = (newFiles: (FileObject | File)[]): void => {
    if (!newFiles || newFiles.length === 0) return;

    const currentLength = files.length;
    const duplicateFiles = newFiles.filter((newFile) =>
      files.some(
        (existingFile: FileObject) => existingFile.name === newFile.name
      )
    );

    if (duplicateFiles.length > 0) {
      showAlert(
        "warning",
        "Duplicate Files Detected",
        `${duplicateFiles.length} file(s) already added: ${duplicateFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      newFiles = newFiles.filter(
        (newFile) =>
          !files.some(
            (existingFile: FileObject) => existingFile.name === newFile.name
          )
      );

      if (newFiles.length === 0) return;
    }

    setFiles((prev: FileObject[]) => [...prev, ...(newFiles as FileObject[])]);

    const newData: Record<number, FileDataItem> = { ...fileData };
    newFiles.forEach((file, index) => {
      const fileType = determineFileType(file);
      let category = "";

      if (fileType === "MIDI") {
        category = "MIDI";
      } else if (fileType === "Preset") {
        category = "Preset";
      }

      newData[currentLength + index] = {
        category,
        type: "",
        originalCategory: category,
        originalType: "",
        group: "",
        originalDefaultLoopId: "",
      };
    });
    setFileData(newData);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/wav,.mid,.midi,.SerumPreset,.h2p,.mp3,.aiff";
    input.multiple = true;

    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files && target.files.length > 0) {
        addFiles(Array.from(target.files));
      }
    };
    input.click();
  };

  const removeFile = (index: number): void => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedData: FileDataMap = {};

    updatedFiles.forEach((_, newIndex) => {
      const originalIndex = newIndex >= index ? newIndex + 1 : newIndex;
      updatedData[newIndex] = fileData[
        originalIndex as keyof typeof fileData
      ] || {
        category: "",
        type: "",
      };
    });

    setFiles(updatedFiles);
    setFileData(updatedData);
  };

  const allFilesOrganized =
    files.length > 0 &&
    files.every((_, index) => {
      const data = fileData[index];
      const fileType = determineFileType(files[index]);
      
      // Full Loop only needs category
      if (data?.category === "Full Loop") {
        return Boolean(data.category);
      }

      // MIDI and Preset files need category and type
      if (fileType === "MIDI" || fileType === "Preset") {
        return data?.category && data?.type;
      }
      
      // Other audio files need category, group, and type
      return data?.category && data?.group && data?.type;
    });

  const hasFullLoop = files.some((_, index) => {
    const data = fileData[index];
    return data?.category === "Full Loop";
  });

  const canContinue = allFilesOrganized && hasFullLoop;

  const setAsDefaultFullLoop = (index: number) => {
    setDefaultFullLoopIndex(index);

    setFileData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        const idx = parseInt(key);
        if (updated[idx].category === "Full Loop") {
          updated[idx].isDefaultFullLoop = idx === index;
        }
      });
      return updated;
    });
  };

  useEffect(() => {
    const fullLoopIndices = files
      .map((_, index) => index)
      .filter(index => fileData[index]?.category === "Full Loop");

    if (fullLoopIndices.length > 0 && defaultFullLoopIndex === null) {
      setAsDefaultFullLoop(fullLoopIndices[0]);
    }
  }, [files, fileData]);

  useEffect(() => {
    if (defaultFullLoopIndex !== null) {
      const file = files[defaultFullLoopIndex];
      // Only calculate BPM for new, local files that have a size.
      if (file && !file.isExisting && file.size > 0) {
        calculateBPMFromFile(file as File).then((result) => {
          if (result) {
            const formattedBpm = formatBPMResult(result);
            onBPMDetected(formattedBpm);
          }
        });
      }
    }
  }, [defaultFullLoopIndex, files, onBPMDetected]);

  const handleUploadAllFiles = async (e?: React.MouseEvent): Promise<void> => {
    const allFilesOrganized = files.every((_, index) => {
      const data = fileData[index];
      const fileType = determineFileType(files[index]);

      // Full Loop only needs category
      if (data?.category === "Full Loop") {
        return Boolean(data.category);
      }

      // MIDI and Preset files need category and type  
      if (fileType === "MIDI" || fileType === "Preset") {
        return data?.category && data?.type;
      }
      
      // Other files need category, group, and type
      return data?.category && data?.group && data?.type;
    });

    if (!allFilesOrganized) {
      showAlert(
        "warning",
        "Incomplete File Organization",
        "Please assign the required fields for all files before continuing."
      );
      return;
    }

    const hasFullLoop = files.some((_, index) => {
      const data = fileData[index];
      return data?.category === "Full Loop";
    });

    if (!hasFullLoop) {
      showAlert(
        "warning",
        "Full Loop Required",
        "At least one 'Full Loop' file is required before continuing."
      );
      return;
    }

    if (defaultFullLoopIndex === null) {
      showAlert(
        "warning",
        "Default Full Loop Required",
        "Please select a default Full Loop."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({});
      setOverallProgress(0);

      // This flag will track if we need to make a separate PUT request
      // to update the default loop.
      let defaultLoopUpdateNeeded = false;
      const originalDefaultLoopIndex = files.findIndex(
        (f, i) => fileData[i]?.contentId === fileData[i]?.originalDefaultLoopId
      );

      if (
        defaultFullLoopIndex !== null &&
        defaultFullLoopIndex !== originalDefaultLoopIndex
      ) {
        defaultLoopUpdateNeeded = true;
      }

      // Step 1: Handle existing file updates
      const modifiedExistingFiles = files.filter((_, index) => {
        const data = fileData[index];
        if (!data?.isExisting) return false;
        return (
          data.category !== data.originalCategory ||
          data.group !== data.originalGroup ||
          data.type !== data.originalType
        );
      });

      const updatePromises = modifiedExistingFiles.map(async (file) => {
        const fileIndex = files.findIndex((f) => f === file);
        const data = fileData[fileIndex];
        if (!data?.contentId) return;

        const fileType = determineFileType(file);
        const isMidi = fileType === "MIDI";
        const typeToSend = isMidi ? data.type : `${data.group} > ${data.type}`;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/content/${data.contentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "same-origin",
            body: JSON.stringify({
              category: data.category,
              type: typeToSend,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update ${file.name}`);
        }
        return response;
      });

      // Step 2: Handle new file uploads
      const newFilesToUpload = files.filter(
        (_, index) => !fileData[index]?.isExisting
      );

      if (newFilesToUpload.length > 0) {
        const presignResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/upload/${id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "same-origin",
            body: JSON.stringify({
              files: newFilesToUpload.map((file) => ({
                filename: file.name,
                contentType: file.type || "application/octet-stream",
              })),
            }),
          }
        );

        if (!presignResponse.ok) {
          throw new Error("Failed to get upload URLs");
        }

        const presignData: UploadResponse = await presignResponse.json();

        const s3UploadPromises = presignData.uploads.map((uploadData: UploadData) => {
          const fileIndex = files.findIndex((f) => f.name === uploadData.filename);
          const file = files[fileIndex];

          return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress((prev) => {
                  const newProgress = { ...prev, [fileIndex]: percentComplete };
                  const totalProgress = Object.values(newProgress);
                  const averageProgress = totalProgress.length > 0
                    ? totalProgress.reduce((a, b) => a + b, 0) / newFilesToUpload.length
                    : 0;
                  setOverallProgress(Math.round(averageProgress));
                  return newProgress;
                });
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Failed to upload ${file.name}`));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error(`Network error uploading ${file.name}`));
            });

            xhr.open("PUT", uploadData.presignedUrl);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            xhr.send(file instanceof File ? file : (file as unknown as File));
          });
        });

        await Promise.all(s3UploadPromises);

        const filesMetadata = presignData.uploads.map((uploadData: UploadData) => {
          const fileIndex = files.findIndex((f) => f.name === uploadData.filename);
          const data = fileData[fileIndex];
          const fileType = determineFileType(files[fileIndex]);
          const isMidi = fileType === "MIDI";
          const typeToSend = isMidi ? data.type : `${data.group} > ${data.type}`;

          return {
            fileName: uploadData.filename,
            category: data.category,
            type: typeToSend,
            key: uploadData.key,
            url: uploadData.url,
          };
        });

        const dbResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/${id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            credentials: "same-origin",
            body: JSON.stringify({
              files: filesMetadata,
              defaultFullLoopFileName: defaultFullLoopIndex !== null
                ? files[defaultFullLoopIndex].name
                : null
            }),
          }
        );

        if (!dbResponse.ok) {
          const errorText = await dbResponse.text();
          throw new Error(`Failed to save file metadata: ${errorText}`);
        }
        // Since the POST handles the default loop, we don't need a separate PUT
        defaultLoopUpdateNeeded = false;
      }

      // Wait for individual content updates to finish
      await Promise.all(updatePromises);

      // If there were no new files, but the default loop changed, send a PUT request
      if (defaultLoopUpdateNeeded && newFilesToUpload.length === 0) {
        const defaultLoopContentId =
          defaultFullLoopIndex !== null
            ? fileData[defaultFullLoopIndex]?.contentId
            : null;

        if (defaultLoopContentId) {
          const putResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/${id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                defaultFullLoopIdentifier: defaultLoopContentId,
              }),
            }
          );
          if (!putResponse.ok) {
            throw new Error("Failed to update the default full loop.");
          }
        }
      }

      showAlert(
        "success",
        "Upload Complete",
        "All files processed successfully!"
      );

      onFileUploaded();

    } catch (error) {
      console.error("Upload failed:", error);
      showAlert(
        "error",
        "Upload Failed",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setUploading(false);
      setUploadProgress({});
      setOverallProgress(0);
    }
  };

  return (
    <>
      {/* Alert Modal */}
      <AlertModal isOpen={alertState.show} onClose={closeAlert}>
        <Alert
          variant={alertState.variant}
          title={alertState.title}
          description={alertState.description}
          onClose={closeAlert}
        />
      </AlertModal>

      {loadingExisting ? (
        <div className="h-screen w-full fixed inset-0 transition-all bg-black/90 backdrop-blur-md text-white z-50">
          <Loading />
        </div>
      ) : (
        <>
          <div className="h-fit w-full transition-all text-white mb-6">
            <div className="max-w-2xl mx-auto">
              {files.length === 0 && (
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${isDragging
                    ? "border-blue-400 bg-blue-400/10"
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
                        Drop your audio files, MIDI or presets here
                      </p>
                      <p className="text-sm text-white/60">
                        Supports WAV, MIDI, Serum and H2P presets • Click to
                        browse
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {files.length > 0 && (
            <div className=" bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center w-full">
              <div className="bg-black/90 border border-white/20 rounded-xl w-full min-h-[60vh] max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-medium font-main uppercase tracking-wider text-white mb-1">
                        Organize Your Files ({files.length})
                      </h2>
                      <p className="text-sm text-white/70 mt-1">
                        Choose category and type for each file
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBrowse}
                        disabled={uploading}
                        className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add More
                      </button>
                      <button
                        disabled={!canContinue || uploading}
                        className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${canContinue && !uploading
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-white/10 text-white/50 cursor-not-allowed"
                          }`}
                        onClick={handleUploadAllFiles}
                        title={!hasFullLoop ? "At least one Full Loop is required" : ""}
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />{" "}
                            Uploading...
                          </>
                        ) : (
                          <>
                            Continue <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {!hasFullLoop && files.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        ⚠️ At least one &apos;Full Loop&apos; file is required to continue
                      </p>
                    </div>
                  )}

                  {uploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">
                          Uploading files...
                        </span>
                        <span className="text-sm text-white/70">
                          {overallProgress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] min-h-[60vh]">
                  <div className="space-y-3">
                    {files.map((file, index) => {
                      const fileType = determineFileType(file);
                      const data = fileData[index] || {
                        category: "",
                        type: "",
                      };

                      // Add validation for data integrity
                      const category = data.category || "";
                      const type = data.type || "";
                      const originalCategory = data.originalCategory || "";
                      const originalType = data.originalType || "";

                      // Update completion logic for Full Loop
                      const isFullLoop = category === "Full Loop";
                      const isComplete = isFullLoop ? Boolean(category) : Boolean(category && type);
                      const categorySelected = Boolean(category);
                      const fileProgress = uploadProgress[index] || 0;

                      const getMidiTypeOptions = () => {
                        return midiGroups.map((item) => ({
                          value: item,
                          label: item,
                        }));
                      };

                      const midiTypeOptions = getMidiTypeOptions();
                      const categoryTypeOptions = getCategoryTypeOptions(
                        categorySelected,
                        data
                      );
                      const isMidiFile = fileType === "MIDI";
                      const isPresetFile = fileType === "Preset";

                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className={`bg-white/[0.03] rounded-lg p-4 border transition-all ${isComplete
                            ? "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                            : "border-white/10"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* File Icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isComplete
                                ? "bg-green-500/10 border border-green-500/30"
                                : "bg-white/5 border border-white/10"
                                }`}
                            >
                              {getFileIcon(fileType as string)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium truncate text-sm text-white leading-tight"
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <p className="text-xs text-white/50">
                                {String(fileType).toUpperCase()} •{" "}
                                {Math.round((file.size || 0) / 1024)} KB
                              </p>
                            </div>

                            {/* Category Section - Only show for audio files */}
                            {!isMidiFile && !isPresetFile && (
                              <div className="w-48 flex-shrink-0">
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Category
                                </label>
                                <CustomSelect
                                  placeholder="Choose category"
                                  options={contentTypes.map((ct) => ({
                                    value: ct,
                                    label: ct,
                                  }))}
                                  value={data.category}
                                  onChange={(value: string) =>
                                    updateFileData(
                                      index,
                                      "category",
                                      value,
                                      setFileData
                                    )
                                  }
                                />
                              </div>
                            )}

                            {/* MIDI Type or Sound Group - Hide for Full Loop */}
                            {!isFullLoop && (
                              <div className="w-96 flex-shrink-0">
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  {isMidiFile
                                    ? "MIDI Type"
                                    : "Sound Group"}
                                </label>

                                {isMidiFile ? (
                                  <CustomSelect
                                    placeholder="Choose MIDI type"
                                    options={midiTypeOptions}
                                    value={data.type}
                                    onChange={(value: string) =>
                                      updateFileData(
                                        index,
                                        "type",
                                        value,
                                        setFileData
                                      )
                                    }
                                  />
                                ) : (
                                  <CustomSelect
                                    placeholder="Choose sound group"
                                    options={categoryTypeOptions.map((option) => ({
                                      value: option.name,
                                      label: option.name,
                                    }))}
                                    value={data.group}
                                    disabled={!data.category}
                                    onChange={(value: string) =>
                                      updateFileData(
                                        index,
                                        "group",
                                        value,
                                        setFileData
                                      )
                                    }
                                  />
                                )}
                              </div>
                            )}

                            {/* Content Type - Hide for MIDI and Full Loop */}
                            {!isMidiFile && !isFullLoop && (
                              <div className="w-96 flex-shrink-0">
                                <label className="block text-xs font-medium text-white/70 mb-1">
                                  Content Type
                                </label>
                                <CustomSelect
                                  placeholder="Choose content type"
                                  options={
                                    categoryTypeOptions
                                      .find((option) => option.name === data.group)
                                      ?.subcategories?.map((sub) => ({
                                        value: sub.name,
                                        label: sub.name,
                                      })) || []
                                  }
                                  value={data.type.split(" > ").pop() || ""}
                                  disabled={!data.group}
                                  onChange={(value: string) =>
                                    updateFileData(
                                      index,
                                      "type",
                                      value,
                                      setFileData
                                    )
                                  }
                                />
                              </div>
                            )}

                            {/* Status and Actions */}
                            <div className="flex flex-col justify-center items-center gap-3 flex-shrink-0 w-24">
                              {/* Show "Set as Default" button for Full Loop files */}
                              {data.category === "Full Loop" && (
                                <button
                                  onClick={() => setAsDefaultFullLoop(index)}
                                  disabled={uploading}
                                  className={`text-xs px-3 py-1 rounded transition-all ${data.isDefaultFullLoop
                                    ? "bg-blue-500 text-white"
                                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                    }`}
                                  title={data.isDefaultFullLoop ? "Default Full Loop" : "Set as default"}
                                >
                                  {data.isDefaultFullLoop ? "★ Default" : "Set Default"}
                                </button>
                              )}

                              {!data.isExisting && (
                                <button
                                  onClick={() => removeFile(index)}
                                  disabled={uploading}
                                  className="text-white/40 hover:text-white transition-colors p-1 -m-1"
                                  title="Remove file"
                                >
                                  <X size={16} />
                                </button>
                              )}
                              {isComplete && !data.isExisting && (
                                <div className="flex items-center text-green-400 text-xs font-medium">
                                  <Check className="w-3.5 h-3.5 mr-1" />
                                  Ready
                                </div>
                              )}
                              {isComplete &&
                                data.isExisting &&
                                (category !== originalCategory ||
                                  data.group !== data.originalGroup ||
                                  type !== originalType) && (
                                  <div className="flex items-center text-yellow-400 text-xs font-medium">
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Modified
                                  </div>
                                )}
                              {isComplete &&
                                data.isExisting &&
                                category === originalCategory &&
                                data.group === data.originalGroup &&
                                type === originalType && (
                                  <div className="flex items-center text-blue-400 text-xs font-medium">
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Imported
                                  </div>
                                )}

                              <div className="flex flex-col items-center gap-2">
                                {(() => {
                                  const audioFileType = determineFileType(file);
                                  if (
                                    audioFileType === "wav" ||
                                    audioFileType === "mp3" ||
                                    audioFileType === "aiff"
                                  ) {
                                    return (
                                      <button
                                        onClick={() => {
                                          setPreviewIndex(
                                            index === previewIndex
                                              ? null
                                              : index
                                          );
                                        }}
                                        className="text-white/60 hover:text-white transition-colors text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                                      >
                                        Preview
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Progress bars for uploading files */}
                          {
                            uploading &&
                            fileProgress > 0 &&
                            fileProgress < 100 && (
                              <div className="mt-3">
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${fileProgress}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-right text-white/50 mt-1">
                                  {fileProgress}%
                                </div>
                              </div>
                            )
                          }

                          {
                            uploading && fileProgress === 100 && (
                              <div className="flex items-center gap-1 text-green-400 text-xs mt-3">
                                <Check size={14} />
                                <span>Upload complete</span>
                              </div>
                            )
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          {previewIndex !== null && previewAudioFile && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-black/90 border border-white/20 rounded-xl w-full max-w-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-medium text-white">
                    Preview: {files[previewIndex].name}
                  </h2>
                  <button
                    onClick={() => setPreviewIndex(null)}
                    className="text-white/40 hover:text-white/80 p-1 -m-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                <AudioFile file={previewAudioFile} onRemove={undefined} />
              </div>
            </div>
          )}
        </>
      )
      }
    </>
  );
}
