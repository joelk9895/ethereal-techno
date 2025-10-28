export const FILE_TYPES = {
  MIDI: "MIDI",
  AUDIO_LOOP: "Sample Loop",
  AUDIO_ONE_SHOT: "One-Shot",
  FULL_LOOP: "Full Loop",
  PRESET: "Preset",
  AUDIO: "wav",
};

export const ALLOWED_FILE_EXTENSIONS = {
  [FILE_TYPES.MIDI]: [".mid"],
  [FILE_TYPES.AUDIO_LOOP]: [".wav"],
  [FILE_TYPES.AUDIO_ONE_SHOT]: [".wav"],
  [FILE_TYPES.FULL_LOOP]: [".wav"],
  [FILE_TYPES.PRESET]: [".SerumPreset", ".h2p"],
};

export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  placeholder: string;
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export interface FileType {
  name: string;
  size?: number;
  type?: string;
}

export interface FileObject {
  id?: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  categories?: Category[];
  streamUrl?: string;
  isExisting?: boolean;
}

export interface SubcategorySelectProps {
  categories?: Category[];
  onSelect?: (
    categoryId: string,
    subcategoryId: string,
    displayValue: string
  ) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  selectedValue?: string;
}

export interface FileDataItem {
  originalDefaultLoopId: string | undefined;
  category: string;
  soundGroup?: string;
  type: string;
  isExisting?: boolean;
  originalCategory?: string;
  originalSoundGroup?: string;
  originalType?: string;
  contentId?: string;
  group?: string;
  originalGroup?: string;
  isDefaultFullLoop?: boolean;
}

export interface FileDataMap {
  [key: number]: FileDataItem;
}

export type FileDataFieldKey = keyof FileDataItem;
