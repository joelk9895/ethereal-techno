import React, { useState, JSX } from "react";
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
} from "./utils";
import { FileObject, FileDataMap, FileDataItem } from "./types";
type ExtendedFile = File & FileObject;
import { SubcategorySelect } from "./SubCategorySelect";
import AudioFile from "../audioImport/AudioFile";

const contentTypes = ["One-Shot", "Sample Loop"];

type FileIconType = "wav" | "MIDI" | "Preset" | string;

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
}: {
  id: string;
  onFileUploaded: () => void;
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

      newData[currentLength + index] = { category, type: "" };
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
            files: files.map((file) => ({
              filename: file.name,
              contentType: file.type || "application/octet-stream",
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get upload URLs");
      }

      const data = await response.json();

      interface UploadData {
        presignedUrl: string;
        key: string;
        url: string;
      }

      const uploadPromises = data.uploads.map(
        async (uploadData: UploadData, index: number) => {
          const file = files[index];
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
                    [index]: percentComplete,
                  };

                  const totalProgress = Object.values(newProgress);
                  let averageProgress = 0;

                  if (totalProgress.length > 0) {
                    const sum = totalProgress.reduce((a, b) => a + b, 0);
                    averageProgress = sum / files.length;
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
                category: fileData[index]?.category,
                type: fileData[index]?.type,
                key: uploadData.key,
                url: uploadData.url,
              }),
            }
          );

          return file.name;
        }
      );

      const uploadedFiles = await Promise.all(uploadPromises);

      alert(`Successfully uploaded ${uploadedFiles.length} files`);
      setFiles([]);
      setFileData({});
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
      <div className="h-fit transition-all bg-black text-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
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
                  Supports WAV, MIDI, Serum and H2P presets • Click to browse
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {files.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-black/90 border border-white/20 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-white mb-1">
                    Organize Your Files ({files.length})
                  </h2>
                  <p className="text-white/60">
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => {
                  const fileType = determineFileType(file);
                  const data = fileData[index] || { category: "", type: "" };
                  const isComplete = data.category && data.type;
                  const categorySelected = Boolean(data.category);
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
                  const isMidiCategory = data.category === "MIDI";

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className={`bg-white/[0.03] rounded-lg p-5 border transition-all ${
                        isComplete
                          ? "border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                          : "border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                            isComplete
                              ? "bg-green-500/10 border border-green-500/30"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          {getFileIcon(fileType as string)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p
                                className="font-medium truncate text-sm text-white"
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <p className="text-xs text-white/50 mt-1">
                                {String(fileType).toUpperCase()} •{" "}
                                {Math.round((file.size || 0) / 1024)} KB
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
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
                                          index === previewIndex ? null : index
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
                              <button
                                onClick={() => removeFile(index)}
                                className="text-white/40 hover:text-white/80 p-1 rounded-full hover:bg-white/5 transition-colors"
                                title="Remove file"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {fileType === "MIDI" || fileType === "Preset" ? null : (
                          <div>
                            <label className="block text-xs font-medium text-white/70 mb-1.5">
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
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1.5">
                            Type
                          </label>
                          {isMidiCategory ? (
                            <CustomSelect
                              placeholder={
                                categorySelected
                                  ? "Choose type"
                                  : "Select category first"
                              }
                              options={midiTypeOptions}
                              value={data.type}
                              disabled={!categorySelected}
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
                              onSelect={(_, subcategoryId, displayValue) => {
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
                        {isComplete && (
                          <div className="flex items-center mt-1 text-green-400 text-xs font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Ready to import
                          </div>
                        )}
                      </div>

                      {uploading && fileProgress > 0 && fileProgress < 100 && (
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
      {previewIndex !== null && (
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
            <AudioFile
              file={{
                id: `preview-${previewIndex}`,
                file: files[previewIndex] as unknown as File,
                url: URL.createObjectURL(
                  files[previewIndex] as unknown as File
                ),
                fileType: "Audio",
                isPlaying: false,
                duration: "0",
                currentTime: "0",
                audioRef: null,
              }}
              onRemove={undefined}
            />
          </div>
        </div>
      )}
    </>
  );
}
