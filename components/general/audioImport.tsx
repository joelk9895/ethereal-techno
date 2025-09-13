"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import { Play, Pause, Upload } from "lucide-react";

interface AudioDropZoneProps {
  onFileSelected: (file: File) => void;
}

export default function AudioDropZone({ onFileSelected }: AudioDropZoneProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playLoop, setPlayLoop] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      onFileSelected(file);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e: Event) => {
      const inputTarget = e.target as HTMLInputElement;
      const files = inputTarget.files;
      if (files && files[0]) {
        const file = files[0];
        setAudioFile(file);
        onFileSelected(file);
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(URL.createObjectURL(file));
      }
    };
    input.click();
  };

  useEffect(() => {
    if (!audioUrl || !canvasRef.current) return;

    const audio = new Audio(audioUrl);
    audio.loop = playLoop;
    audioRef.current = audio;

    const updateTime = () => {
      setCurrentTime(formatTime(audio.currentTime));
    };

    const setAudioDuration = () => {
      setDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);

    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    src.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const cctx = canvas.getContext("2d")!;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      cctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bufferLength;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        cctx.fillStyle = "rgb(59, 130, 246)";
        cctx.fillRect(
          i * barWidth + 1,
          canvas.height - barHeight,
          barWidth - 2,
          barHeight
        );
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
      ctx.close();
    };
  }, [audioUrl, playLoop]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="h-fit transition-all bg-black text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/10"
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
                Drop your audio file here
              </p>
              <p className="text-sm text-white/60">
                or click to browse • MP3, WAV, M4A supported
              </p>
            </div>
          </div>
        </div>

        {audioFile && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="font-medium text-white truncate">
                {audioFile.name}
              </h3>
              <p className="text-sm text-white/60 mt-1">
                {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>

            <div className="px-6 py-4 bg-white/5">
              <canvas
                ref={canvasRef}
                className="w-full h-20 rounded-lg bg-black/20"
                width={800}
                height={80}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-primary hover:bg-primary/80 text-black rounded-full flex items-center justify-center transition-colors duration-200"
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
                    onChange={(e) => setPlayLoop(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary bg-white/10"
                  />
                  <span className="text-sm text-white/80">Loop</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
