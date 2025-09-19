import { useRef, useEffect, useState } from "react";

interface WaveformProps {
  data: number[];
  progress: number;
  isLoading: boolean;
  onPositionChange: (position: number) => void;
}

export default function Waveform({
  data,
  progress,
  isLoading,
  onPositionChange,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const position = Math.max(0, Math.min(1, clickX / rect.width));

    onPositionChange(position);
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

  const drawWaveform = () => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / data.length;
    const centerY = height / 2;

    data.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.8;
      const x = index * barWidth;

      const barProgress = index / data.length;
      const isPlayed = barProgress <= progress;

      ctx.fillStyle = isPlayed ? "rgb(59, 130, 246)" : "rgb(75, 85, 99)";

      ctx.fillRect(x + 1, centerY - barHeight / 2, barWidth - 2, barHeight / 2);
      ctx.fillRect(x + 1, centerY, barWidth - 2, barHeight / 2);
    });

    const progressX = progress * width;
    ctx.strokeStyle = "rgb(59, 130, 246)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
  };

  useEffect(() => {
    drawWaveform();
  }, [data, progress]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  if (isLoading) {
    return (
      <div className="w-full h-20 rounded-lg bg-black/20 flex items-center justify-center">
        <div className="text-white/60 text-sm">Generating waveform...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-20 rounded-lg bg-black/20 cursor-pointer select-none relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={80}
      />
    </div>
  );
}
