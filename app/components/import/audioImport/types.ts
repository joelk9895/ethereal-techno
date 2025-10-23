export const FILE_TYPES = {
  AUDIO: "Audio",
  MIDI: "MIDI",
  PRESET: "Preset",
};

export interface AudioFile {
  id: string;
  file: File;
  url: string;
  isPlaying: boolean;
  duration: string;
  currentTime: string;
  audioRef: HTMLAudioElement | null;
  fileType: string;
  contentType?: string;
}

export interface AudioDropZoneProps {
  onFileSelected: (file: File | File[]) => void;
  onBPMCalculated?: (bpm: string) => void;
  type: string;
}
