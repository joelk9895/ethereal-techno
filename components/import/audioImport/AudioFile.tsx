import { Play, Pause, X } from "lucide-react";
import { AudioFile as AudioFileType } from "./types";
import Waveform from "./waveform";
import { getFileTypeColor } from "./utils";

interface AudioFileProps {
  file: AudioFileType;
  isLoadingWaveform: boolean;
  waveformData: number[];
  progress: number;
  playLoop: boolean;
  onRemove: (id: string) => void;
  onTogglePlay: () => void;
  onPositionChange: (position: number) => void;
  onPlayLoop: (loop: boolean) => void;
}

export default function AudioFile({
  file,
  isLoadingWaveform,
  waveformData,
  progress,
  playLoop,
  onRemove,
  onTogglePlay,
  onPositionChange,
  onPlayLoop,
}: AudioFileProps) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${getFileTypeColor(
                file.fileType
              )}`}
            >
              {file.fileType}
            </span>
            <h3 className="font-medium text-white truncate">
              {file.file.name}
            </h3>
          </div>
          <p className="text-sm text-white/60">
            {(file.file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        <button
          onClick={() => onRemove(file.id)}
          className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-full flex items-center justify-center ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {file.fileType === "Audio" && (
        <>
          <div className="px-6 py-4 bg-white/5">
            <Waveform
              data={waveformData}
              progress={progress}
              isLoading={isLoadingWaveform}
              onPositionChange={onPositionChange}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onTogglePlay}
                className="w-12 h-12 bg-primary hover:bg-primary/80 text-black rounded-full flex items-center justify-center transition-colors duration-200"
                disabled={isLoadingWaveform}
              >
                {file.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <div className="flex-1 text-center">
                <span className="text-sm font-mono text-white/80">
                  {file.currentTime} / {file.duration}
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playLoop}
                  onChange={(e) => {
                    onPlayLoop(e.target.checked);
                  }}
                  className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary bg-white/10"
                />
                <span className="text-sm text-white/80">Loop</span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
