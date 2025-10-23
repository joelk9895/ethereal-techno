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

type ExtendedFile = File & FileObject;
import { SubcategorySelect } from "./SubCategorySelect";
import AudioFile from "../audioImport/AudioFile";
import Loading from "../../general/loading";

const contentTypes = ["One-Shot", "Sample Loop", "Full Loop"];

type FileIconType = "wav" | "MIDI" | "Preset" | string;

// Define types for API responses
interface ContentItem {
  id: string;
  contentType: string;
  contentName: string;
  soundGroup: string;
  subGroup: string;
}

interface ConstructionKitData {
  contents: ContentItem[];
}

interface UploadData {
  presignedUrl: string;
  key: string;
  url: string;
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
}: {
  id: string;
  onFileUploaded: () => void;
  onFileCountChange: (count: number) => void;
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

  useEffect(() => {
    if (previewIndex !== null && files[previewIndex]) {
      const file = files[previewIndex];
      const audioFile: AudioFileType = {
        id: `preview-${previewIndex}`,
        file: file as File,
        url: URL.createObjectURL(file as File),
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
      if (previewAudioFile?.url) {
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
              })
            );

            setFiles(existingFiles);

            const newData: Record<number, FileDataItem> = {};
            data.contents.forEach((content: ContentItem, index: number) => {
              const soundGroup = content.soundGroup || "Default";
              const subGroup = content.subGroup || "Default";
              const typeValue =
                content.contentType === "MIDI"
                  ? soundGroup
                  : `${soundGroup} > ${subGroup}`;

              newData[index] = {
                category: content.contentType || "",
                type: typeValue,
                isExisting: true,
                originalCategory: content.contentType || "",
                originalType: typeValue,
                contentId: content.id,
              };
            });

            setFileData(newData);
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
    const droppedFiles = Array.from(e.dataTransfer.files) as ExtendedFile[];
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
      alert(
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
    files.every(
      (_, index) => fileData[index]?.category && fileData[index]?.type
    );

  const handleUploadAllFiles = async (e?: React.MouseEvent): Promise<void> => {
    const allFilesOrganized = files.every(
      (_, index) => fileData[index]?.category && fileData[index]?.type
    );

    if (!allFilesOrganized) {
      alert(
        "Please assign a category and type to all files before continuing."
      );
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({});
      setOverallProgress(0);

      const newFilesToUpload = files.filter(
        (_, index) => !fileData[index]?.isExisting
      );
      const newFilesIndices = files
        .map((_, index) => index)
        .filter((index) => !fileData[index]?.isExisting);

      const modifiedExistingFiles = files.filter((_, index) => {
        const data = fileData[index];
        if (!data?.isExisting) return false;

        const currentCategory = data.category || "";
        const currentType = data.type || "";
        const originalCategory = data.originalCategory || "";
        const originalType = data.originalType || "";

        return (
          currentCategory !== originalCategory || currentType !== originalType
        );
      });

      const updatePromises = modifiedExistingFiles.map(async (file) => {
        const fileIndex = files.findIndex((f) => f === file);
        const data = fileData[fileIndex];

        if (!data?.contentId || !data.category || !data.type) {
          throw new Error(`Invalid data for file ${file.name}`);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "cors",
            credentials: "same-origin",
            body: JSON.stringify({
              contentId: data.contentId,
              category: data.category,
              type: data.type,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update ${file.name}: ${errorText}`);
        }

        return file.name;
      });

      await Promise.all(updatePromises);

      if (newFilesToUpload.length === 0) {
        if (modifiedExistingFiles.length > 0) {
          alert(`Successfully updated ${modifiedExistingFiles.length} file(s)`);
        }
        onFileUploaded();
        return;
      }

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/import/upload/" + id,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      if (!response.ok) {
        throw new Error("Failed to get upload URLs");
      }

      const data: UploadResponse = await response.json();

      const uploadPromises = data.uploads.map(
        async (uploadData: UploadData, uploadIndex: number) => {
          const fileIndex = newFilesIndices[uploadIndex];
          const file = files[fileIndex];

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round(
                  (event.loaded / event.total) * 100
                );
                setUploadProgress((prev) => {
                  const newProgress = {
                    ...prev,
                    [fileIndex]: percentComplete,
                  };

                  const totalProgress = Object.values(newProgress);
                  let averageProgress = 0;

                  if (totalProgress.length > 0) {
                    const sum = totalProgress.reduce((a, b) => a + b, 0);
                    averageProgress = sum / newFilesToUpload.length;
                  }

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
              reject(
                new Error(`Network error occurred while uploading ${file.name}`)
              );
            });

            xhr.open("PUT", uploadData.presignedUrl);
            xhr.setRequestHeader(
              "Content-Type",
              file.type || "application/octet-stream"
            );
            xhr.send(file instanceof File ? file : (file as unknown as File));
          });

          await fetch(
            process.env.NEXT_PUBLIC_API_BASE_URL +
              "/import/constructionKit/" +
              id,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              mode: "cors",
              credentials: "same-origin",
              body: JSON.stringify({
                id,
                fileName: file.name,
                category: fileData[fileIndex]?.category,
                type: fileData[fileIndex]?.type,
                key: uploadData.key,
                url: uploadData.url,
              }),
            }
          );

          return file.name;
        }
      );

      const uploadedFiles = await Promise.all(uploadPromises);

      const remainingFiles = files.filter(
        (_, index) => fileData[index]?.isExisting
      );
      setFiles(remainingFiles);

      const remainingData: Record<number, FileDataItem> = {};
      remainingFiles.forEach((_, newIndex) => {
        const originalIndex = files.findIndex(
          (f) => f === remainingFiles[newIndex]
        );
        remainingData[newIndex] = fileData[originalIndex];
      });
      setFileData(remainingData);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress({});
      setOverallProgress(0);
      onFileUploaded();
    }
  };

  return (
    <>
      {loadingExisting ? (
        <div className="h-screen w-full fixed inset-0 transition-all bg-black/90 backdrop-blur-md text-white z-50">
          <Loading />
        </div>
      ) : (
        <>
          <div className="h-fit w-full transition-all text-white">
            <div className="max-w-7xl mx-auto">
              {files.length === 0 && (
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    isDragging
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
                        disabled={!allFilesOrganized || uploading}
                        className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          allFilesOrganized && !uploading
                            ? "bg-white text-black hover:bg-white/90"
                            : "bg-white/10 text-white/50 cursor-not-allowed"
                        }`}
                        onClick={handleUploadAllFiles}
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

                      const isComplete = category && type;
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
                          className={`bg-white/[0.03] rounded-lg p-4 border transition-all ${
                            isComplete
                              ? "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                              : "border-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* File Icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                isComplete
                                  ? "bg-green-500/10 border border-green-500/30"
                                  : "bg-white/5 border border-white/10"
                              }`}
                            >
                              {getFileIcon(fileType as string)}
                            </div>

                            {/* File Info */}
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

                            {/* Type Section */}
                            <div className="w-96 flex-shrink-0">
                              <label className="block text-xs font-medium text-white/70 mb-1">
                                {isMidiFile
                                  ? "MIDI Type"
                                  : isPresetFile
                                  ? "Preset Type"
                                  : "Type"}
                              </label>

                              {isMidiFile ? (
                                // MIDI files: Simple single selection
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
                                <SubcategorySelect
                                  categories={categoryTypeOptions}
                                  placeholder={
                                    categorySelected
                                      ? "Choose type"
                                      : "Select category first"
                                  }
                                  disabled={!categorySelected}
                                  selectedValue={data.type}
                                  onSelect={(
                                    _,
                                    subcategoryId,
                                    displayValue
                                  ) => {
                                    updateFileData(
                                      index,
                                      "type",
                                      displayValue,
                                      setFileData
                                    );
                                  }}
                                  className="w-full"
                                />
                              )}
                            </div>

                            {/* Status and Actions */}
                            <div className="flex flex-col justify-center items-center gap-3 flex-shrink-0">
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
                                  type !== originalType) && (
                                  <div className="flex items-center text-yellow-400 text-xs font-medium">
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Modified
                                  </div>
                                )}
                              {isComplete &&
                                data.isExisting &&
                                category === originalCategory &&
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
                          {uploading &&
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
                            )}

                          {uploading && fileProgress === 100 && (
                            <div className="flex items-center gap-1 text-green-400 text-xs mt-3">
                              <Check size={14} />
                              <span>Upload complete</span>
                            </div>
                          )}
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
      )}
    </>
  );
}
