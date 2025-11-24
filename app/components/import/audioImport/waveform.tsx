"use client";

import { useEffect, useRef, useState } from "react";

interface WaveformProps {
  waveformData: number[];
  progress: number;
  isLoading: boolean;
  onPositionChange: (position: number) => void;
}

export default function Waveform({
  waveformData,
  progress,
  isLoading,
  onPositionChange,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length;
    const barGap = 1;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform bars
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Determine color based on progress
      const isPlayed = index / waveformData.length <= progress;
      ctx.fillStyle = isPlayed ? "#22c55e" : "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(x, y, barWidth - barGap, barHeight);
    });

    // Draw progress line
    const progressX = progress * width;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  }, [waveformData, progress]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;
    onPositionChange(Math.max(0, Math.min(1, position)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-24 flex items-center justify-center">
        <div className="animate-pulse text-white/40 text-sm">Loading waveform...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-24 cursor-pointer relative"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
