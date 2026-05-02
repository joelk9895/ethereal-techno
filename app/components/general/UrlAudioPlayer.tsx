"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import Waveform from "@/app/components/import/audioImport/waveform";
import { generateWaveformData, formatTime } from "@/app/components/import/audioImport/utils";

interface UrlAudioPlayerProps {
  url: string;
  label?: string;
  variant?: "demo" | "row";
  isActive?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  loop?: boolean;
}

export default function UrlAudioPlayer({
  url,
  label,
  variant = "demo",
  isActive,
  onPlayStateChange,
  loop = false,
}: UrlAudioPlayerProps) {
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

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
        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new window.AudioContext();
        }
        setIsLoading(true);
        const arrayBuffer = await (await fetch(url)).arrayBuffer();
        if (!arrayBuffer || arrayBuffer.byteLength === 0) throw new Error("empty");
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice(0));
        audioBufferRef.current = audioBuffer;
        setDuration(formatTime(audioBuffer.duration));
        const waveform = await generateWaveformData(audioBuffer);
        setWaveformData(waveform);
        setIsLoading(false);
        if (!gainNodeRef.current) {
          gainNodeRef.current = audioContextRef.current.createGain();
          gainNodeRef.current.connect(audioContextRef.current.destination);
        }
      } catch (err) {
        console.error("Error loading audio:", err);
        setIsLoading(false);
      }
    };
    loadAudio();

    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [url]);

  updateProgressRef.current = () => {
    if (!audioContextRef.current || !audioBufferRef.current || !isPlayingRef.current) return;
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current + offsetRef.current;
    const totalDuration = audioBufferRef.current.duration;
    let normalizedElapsed = elapsed;
    if (loop && elapsed >= totalDuration) normalizedElapsed = elapsed % totalDuration;
    const newProgress = Math.min(normalizedElapsed / totalDuration, 1);
    setProgress(newProgress);
    setCurrentTime(formatTime(normalizedElapsed));

    if (!loop && elapsed >= totalDuration) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      onPlayStateChange?.(false);
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
      animationFrameRef.current = requestAnimationFrame(updateProgressRef.current);
    }
  };

  const playAudioBuffer = async (startOffset?: number) => {
    if (!audioContextRef.current || !audioBufferRef.current || !gainNodeRef.current) return;
    if (audioContextRef.current.state === "suspended") await audioContextRef.current.resume();
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { }
      sourceNodeRef.current.disconnect();
    }
    const offset = startOffset !== undefined ? startOffset : offsetRef.current;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.loop = loop;
    source.connect(gainNodeRef.current);
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime;
    offsetRef.current = offset;

    if (!loop) {
      source.onended = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        onPlayStateChange?.(false);
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
        try { sourceNodeRef.current.stop(); } catch { }
        sourceNodeRef.current.disconnect();
      }
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current + offsetRef.current;
      const totalDuration = audioBufferRef.current.duration;
      offsetRef.current = loop ? elapsed % totalDuration : elapsed;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      onPlayStateChange?.(false);
    } else {
      document.querySelectorAll("audio").forEach((audio) => audio.pause());
      isPlayingRef.current = true;
      setIsPlaying(true);
      onPlayStateChange?.(true);
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

  // Parent-driven active state sync: pause when deactivated; auto-play once when
  // activated and audio is ready (e.g. when parent switches to this player)
  const hasAutoPlayedRef = useRef(false);
  useEffect(() => {
    if (isActive === false && isPlayingRef.current) {
      togglePlay();
      return;
    }
    if (
      isActive === true &&
      !isLoading &&
      audioBufferRef.current &&
      !isPlayingRef.current &&
      !hasAutoPlayedRef.current
    ) {
      hasAutoPlayedRef.current = true;
      togglePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isLoading]);

  if (variant === "row") {
    return (
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${isPlaying ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
        >
          {isPlaying ? <Pause className="w-3 h-3" fill="currentColor" /> : <Play className="w-3 h-3 ml-0.5" fill="currentColor" />}
        </button>
        <div className="flex-1 min-w-0 h-6">
          <Waveform
            waveformData={waveformData}
            progress={progress}
            isLoading={isLoading}
            onPositionChange={handlePositionChange}
          />
        </div>
        <span className="text-[10px] text-neutral-500 font-mono shrink-0 w-10 text-right">
          {isPlaying ? currentTime : duration}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-black border border-neutral-900 rounded-sm px-6 py-5">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-transparent border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all disabled:opacity-40"
        >
          {isPlaying ? <Pause className="w-3 h-3" fill="currentColor" /> : <Play className="w-3 h-3 ml-0.5" fill="currentColor" />}
        </button>
        <div className="flex-1 min-w-0">
          <Waveform
            waveformData={waveformData}
            progress={progress}
            isLoading={isLoading}
            onPositionChange={handlePositionChange}
          />
        </div>
      </div>
      {label && <p className="text-center text-[11px] text-neutral-500 mt-2">{label}</p>}
    </div>
  );
}
