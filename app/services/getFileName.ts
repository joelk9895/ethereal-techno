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
  const isFullLoop = fileMetadata.contentType === "Construction Kit";

  let typeSuffix = "";
  if (isOneShot) {
    typeSuffix = "_One_Shot";
  } else if (isFullLoop) {
    typeSuffix = "_Full_Loop";
  }

  let fileName = "ET";

  // Add tempo for loops and full loops
  if ((isLoop || isFullLoop) && fileMetadata.tempo) {
    fileName += `_${fileMetadata.tempo}`;
  }

  // For Full Loop, we don't have soundType, so we skip it
  if (!isFullLoop) {
    const capitalizedSoundType = fileMetadata.soundType
      .trim()
      .replace(/\s+/g, "_")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("_");

    fileName += `_${capitalizedSoundType}`;
  }

  // Add the type suffix (One_Shot, Full_Loop, etc.)
  fileName += `${typeSuffix}`;

  // Add the name
  const capitalizedName = fileMetadata.name
    .replace(/\s+/g, "_")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("_");

  fileName += `_${capitalizedName}`;

  // Add key if provided
  if (fileMetadata.key) {
    const capitalizedKey = fileMetadata.key
      .replace(/\s+/g, "_")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("_");

    fileName += `_${capitalizedKey}`;
  }

  // Add extension if provided
  if (fileMetadata.extension) {
    fileName += `.${fileMetadata.extension}`;
  }

  return fileName;
}
