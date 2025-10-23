import {
  Category,
  FileType,
  FileObject,
  FileDataFieldKey,
  FileDataItem,
} from "./types";
import { loopGroups, oneShotGroup, presetGroup } from "@/app/data/sample";

export const determineFileType = (
  file: File | FileObject
): FileType | string => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".mid") || fileName.endsWith(".midi")) {
    return "MIDI";
  }

  if (
    file.type?.startsWith("audio/") ||
    fileName.endsWith(".wav") ||
    fileName.endsWith(".wave")
  ) {
    return "wav";
  }

  if (
    fileName.endsWith(".fxp") ||
    fileName.endsWith(".preset") ||
    fileName.endsWith(".vstpreset") ||
    fileName.endsWith(".serumpreset") ||
    fileName.endsWith(".h2p")
  ) {
    return "Preset";
  }

  return "Other";
};

export const determineMimeType = (contentType: string): string => {
  switch (contentType.toLowerCase()) {
    case "midi":
      return "audio/midi";
    case "preset":
      return "application/octet-stream";
    case "one-shot":
    case "sample loop":
    case "full loop":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
};

export const generatePairId = (
  wav: File,
  midi: File,
  preset?: File
): string => {
  return `${wav.name}-${midi.name}-${preset?.name || ""}-${Date.now()}`;
};

export const transformGroup = (group: Record<string, string[]>): Category[] => {
  return Object.entries(group).map(([groupName, items], groupIndex) => ({
    id: `cat-${groupIndex}`,
    name: groupName,
    subcategories: items.map((item, i) => ({
      id: `cat-${groupIndex}-sub-${i}`,
      name: item,
    })),
  }));
};

export const getCategoryTypeOptions = (
  categorySelected: boolean,
  data: { category: string }
) => {
  if (!categorySelected) return [];

  switch (data.category) {
    case "One-Shot":
      return transformGroup(oneShotGroup);
    case "Sample Loop":
      return transformGroup(loopGroups);
    case "Full Loop":
      return transformGroup(loopGroups);
    case "Preset":
      return transformGroup(presetGroup);
    default:
      return [];
  }
};

export const updateFileData = (
  index: number,
  field: FileDataFieldKey,
  value: string,
  setFileData: React.Dispatch<
    React.SetStateAction<Record<number, FileDataItem>>
  >
): void => {
  setFileData((prev: Record<number, FileDataItem>) => {
    const updated: Record<number, FileDataItem> = {
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    };

    if (field === "category") {
      updated[index].type = "";
    }

    return updated;
  });
};
