"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, X } from "lucide-react";
import { AudioFile as AudioFileType } from "./types";
import Waveform, { generateWaveformData } from "./waveform";
import { getFileTypeColor, formatTime } from "./utils";

interface AudioFileProps {
  file: AudioFileType;
  onRemove?: (id: string) => void;
}

export default function AudioFile({ file, onRemove }: AudioFileProps) {
  const [isLoadingWaveform, setIsLoadingWaveform] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [playLoop, setPlayLoop] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const updateProgressRef = useRef<(() => void) | undefined>(undefined);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        if (typeof window === "undefined") return;

        if (
          !audioContextRef.current ||
          audioContextRef.current.state === "closed"
        ) {
          audioContextRef.current = new window.AudioContext();
        }

        const arrayBuffer = await file.file.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(
          arrayBuffer
        );
        audioBufferRef.current = audioBuffer;
        setDuration(formatTime(audioBuffer.duration));

        if (!gainNodeRef.current) {
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    if (file.fileType === "Audio") {
      loadAudio();
    }

    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {
          console.error("Error stopping audio source:", e);
        }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [file]);

  updateProgressRef.current = () => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !isPlayingRef.current
    ) {
      return;
    }

    const elapsed =
      audioContextRef.current.currentTime -
      startTimeRef.current +
      offsetRef.current;
    const duration = audioBufferRef.current.duration;

    let normalizedElapsed = elapsed;
    if (playLoop && elapsed >= duration) {
      normalizedElapsed = elapsed % duration;
    }

    const newProgress = Math.min(normalizedElapsed / duration, 1);

    setProgress(newProgress);
    setCurrentTime(formatTime(normalizedElapsed));

    if (!playLoop && elapsed >= duration) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime("0:00");
      offsetRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (updateProgressRef.current) {
      animationFrameRef.current = requestAnimationFrame(
        updateProgressRef.current
      );
    }
  };

  const playAudioBuffer = async (startOffset?: number) => {
    if (
      !audioContextRef.current ||
      !audioBufferRef.current ||
      !gainNodeRef.current
    )
      return;

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        console.error("Error stopping audio source:", e);
      }
      sourceNodeRef.current.disconnect();
    }

    const offset = startOffset !== undefined ? startOffset : offsetRef.current;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.loop = playLoop;
    source.connect(gainNodeRef.current);

    source.start(0, offset);

    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime;
    offsetRef.current = offset;

    if (!playLoop) {
      source.onended = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime("0:00");
        offsetRef.current = 0;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  };

  const togglePlay = async () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {
          console.error("Error stopping audio source:", e);
        }
        sourceNodeRef.current.disconnect();
      }
      const elapsed =
        audioContextRef.current.currentTime -
        startTimeRef.current +
        offsetRef.current;
      const duration = audioBufferRef.current.duration;
      offsetRef.current = playLoop ? elapsed % duration : elapsed;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      document.querySelectorAll("audio").forEach((audio) => audio.pause());
      isPlayingRef.current = true;
      setIsPlaying(true);
      await playAudioBuffer();
      updateProgressRef.current!();
    }
  };

  const handlePositionChange = (position: number) => {
    if (!audioBufferRef.current || !audioContextRef.current) return;

    const newTime = position * audioBufferRef.current.duration;
    offsetRef.current = newTime;
    setProgress(position);
    setCurrentTime(formatTime(newTime));

    if (isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      playAudioBuffer(newTime);
      updateProgressRef.current!();
    }
  };

  const handlePlayLoopToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLoopValue = e.target.checked;
    setPlayLoop(newLoopValue);

    if (sourceNodeRef.current && isPlaying) {
      const elapsed =
        audioContextRef.current!.currentTime -
        startTimeRef.current +
        offsetRef.current;
      const duration = audioBufferRef.current!.duration;
      const currentOffset = newLoopValue ? elapsed % duration : elapsed;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      playAudioBuffer(currentOffset);
      updateProgressRef.current!();
    }
  };

  useEffect(() => {
    const fetchWaveform = async () => {
      setIsLoadingWaveform(true);
      try {
        const waveform = await generateWaveformData(file.file);
        setWaveformData(waveform);
      } catch (error) {
        console.error("Error generating waveform:", error);
      } finally {
        setIsLoadingWaveform(false);
      }
    };

    if (file.fileType === "Audio") {
      fetchWaveform();
    }
  }, [file]);

  useEffect(() => {
    if (file.contentType === "One-Shot") {
      setPlayLoop(false);
    } else {
      setPlayLoop(true);
    }
  }, [file.contentType]);

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
        {onRemove && (
          <button
            onClick={() => onRemove(file.id)}
            className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-full flex items-center justify-center ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {file.fileType === "Audio" && (
        <>
          <div className="px-6 py-4 bg-white/5">
            <Waveform
              data={waveformData}
              progress={progress}
              isLoading={isLoadingWaveform}
              onPositionChange={handlePositionChange}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-primary hover:bg-primary/80 text-black rounded-full flex items-center justify-center transition-colors duration-200"
                disabled={isLoadingWaveform || !audioBufferRef.current}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <div className="flex-1 text-center">
                <span className="text-sm font-mono text-white/80">
                  {currentTime} / {duration}
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playLoop}
                  onChange={handlePlayLoopToggle}
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
