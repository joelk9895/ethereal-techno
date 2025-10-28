interface FileMetadata {
  soundGroup: string;
  soundType: string;
  contentType: string;
  name: string;
  key?: string;
  tempo?: number;
  extension?: string;
}

export function getFileName(fileMetadata: FileMetadata): string {
  const isLoop =
    fileMetadata.contentType === "Sample Loop" ||
    fileMetadata.contentType === "Loop+MIDI Bundle";
  const isOneShot = fileMetadata.contentType === "One-Shot";

  let typeSuffix = "";
  if (isOneShot) {
    typeSuffix = "_One_Shot";
  }
  let fileName = "ET";

  if (isLoop && fileMetadata.tempo) {
    fileName += `_${fileMetadata.tempo}`;
  }

  const capitalizedSoundType = fileMetadata.soundType
    .trim()
    .replace(/\s+/g, "_")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  fileName += `_${capitalizedSoundType}`;

  fileName += `${typeSuffix}`;

  const capitalizedName = fileMetadata.name
    .replace(/\s+/g, "_")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  fileName += `_${capitalizedName}`;

  if (fileMetadata.key) {
    const capitalizedKey = fileMetadata.key
      .replace(/\s+/g, "_")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("_");

    fileName += `_${capitalizedKey}`;
  }
  if (fileMetadata.extension) {
    fileName += `.${fileMetadata.extension}`;
  }
  return fileName;
}
