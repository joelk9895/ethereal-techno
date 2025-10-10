import { FILE_TYPES } from "./types";

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function determineFileType(file: File): string {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  if (fileName.endsWith(".mid") || fileType.includes("midi")) {
    return FILE_TYPES.MIDI;
  }

  if (
    fileName.endsWith(".serumpreset") ||
    fileName.endsWith(".h2p") ||
    fileName.endsWith(".fxp") ||
    fileName.endsWith(".preset")
  ) {
    return FILE_TYPES.PRESET;
  }

  if (
    fileType.includes("audio") ||
    fileName.endsWith(".wav") ||
    fileName.endsWith(".mp3") ||
    fileName.endsWith(".aiff") ||
    fileName.endsWith(".aif")
  ) {
    return FILE_TYPES.AUDIO;
  }

  if (fileName.includes("preset")) {
    return FILE_TYPES.PRESET;
  }

  if (fileType.includes("audio")) {
    return FILE_TYPES.AUDIO;
  }

  return "Unknown";
}

export const getFileTypeColor = (fileType: string) => {
  switch (fileType) {
    case FILE_TYPES.AUDIO:
      return "bg-green-600/20 text-green-300";
    case FILE_TYPES.MIDI:
      return "bg-purple-600/20 text-purple-300";
    case FILE_TYPES.PRESET:
      return "bg-yellow-600/20 text-yellow-300";
    default:
      return "bg-gray-600/20 text-gray-300";
  }
};

export const getFileTypeDescription = (fileType: string) => {
  switch (fileType) {
    case FILE_TYPES.AUDIO:
      return "Audio file • WAV";
    case FILE_TYPES.MIDI:
      return "MIDI file • .mid ";
    case FILE_TYPES.PRESET:
      return "Preset file •  .wav, .mid, .SerumPreset, .h2p";
    default:
      return "File";
  }
};

export const generateWaveformData = async (audioBuffer: AudioBuffer) => {
  const rawData = audioBuffer.getChannelData(0);
  const samples = 200;
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];

  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[blockStart + j]);
    }
    filteredData.push(sum / blockSize);
  }

  const multiplier = Math.pow(Math.max(...filteredData), -1);
  return filteredData.map((n) => n * multiplier);
};
