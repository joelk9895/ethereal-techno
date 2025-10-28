"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Edit3,
  Trash2,
  Play,
  Pause,
  Repeat,
  ChevronDown,
  Package,
  FileAudio,
  Music,
  FileCode,
  VolumeX,
  Volume2,
  Loader2,
} from "lucide-react";
import Loading from "@/app/components/general/loading";
import { getFileName } from "@/app/services/getFileName";

let audioContext: AudioContext | null = null;

interface ImportedContentItem {
  id: string;
  name: string;
  contentType: string;
  createdAt: string;
  soundGroup?: string;
  subGroup?: string;
  metadata?: {
    bpm?: string;
    key?: string;
  };
  file?: {
    name: string;
    key: string;
    streamUrl?: string | null;
  };
  files?: Array<{
    type: string;
    name: string;
    key: string;
    contentId: string;
    streamUrl?: string | null;
  }>;
  contents?: number;
  presets?: number;
  loopAndMidis?: number;
  // Add defaultFullLoop to the interface
  defaultFullLoop?: {
    id: string;
    name: string;
    streamUrl: string;
  } | null;
}

export default function ImportSidebar() {
  const [sideData, setSideData] = useState<ImportedContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [contentFilter, setContentFilter] = useState<string | null>(null);

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBufferCache = useRef<Record<string, AudioBuffer>>({});
  const previousVolume = useRef<number>(1);

  useEffect(() => {
    if (typeof window !== "undefined" && !audioContext) {
      audioContext = new (window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext)();

      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1;
      gainNode.connect(audioContext.destination);
      gainNodeRef.current = gainNode;
    }

    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/import`
        );
        const data = await response.json();
        const sortedData: ImportedContentItem[] = data.content.sort(
          (a: ImportedContentItem, b: ImportedContentItem) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        setSideData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching content:", error);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const loadAudioBuffer = useCallback(
    async (url: string): Promise<AudioBuffer> => {
      if (audioBufferCache.current[url]) {
        return audioBufferCache.current[url];
      }

      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        if (!audioContext) {
          throw new Error("Audio context not initialized");
        }

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        audioBufferCache.current[url] = audioBuffer;

        return audioBuffer;
      } catch (error) {
        console.error("Error loading audio:", error);
        throw error;
      }
    },
    []
  );

  const handlePlayAudio = useCallback(
    async (streamUrl: string, id: string) => {
      if (!streamUrl) {
        console.error("No stream URL provided for audio playback.");
        return;
      }

      // Ensure AudioContext is initialized
      if (!audioContext) {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      // Ensure GainNode is initialized and connected
      if (!gainNodeRef.current && audioContext) {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = isMuted ? 0 : 1;
        gainNode.connect(audioContext.destination);
        gainNodeRef.current = gainNode;
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      if (playingId === id && sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
        setPlayingId(null);
        return;
      }

      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      try {
        setLoadingAudioId(id);
        const audioBuffer = await loadAudioBuffer(streamUrl);
        setLoadingAudioId(null);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        if (gainNodeRef.current) {
          source.connect(gainNodeRef.current);
        } else {
          source.connect(audioContext.destination);
          console.error("GainNode was not available, connecting directly to destination.");
        }

        source.loop = loopEnabled;
        source.start(0);
        sourceRef.current = source;
        setPlayingId(id);

        source.onended = () => {
          if (!loopEnabled) {
            setPlayingId(null);
            sourceRef.current = null;
          }
        };
      } catch (error) {
        console.error("Error playing audio:", error);
        setLoadingAudioId(null);
      }
    },
    [playingId, loopEnabled, isMuted, loadAudioBuffer]
  );

  const toggleLoop = useCallback(() => {
    setLoopEnabled((prev) => {
      const newLoopState = !prev;

      if (sourceRef.current) {
        sourceRef.current.loop = newLoopState;
      }

      return newLoopState;
    });
  }, []);

  const toggleMute = useCallback(() => {
    if (!gainNodeRef.current) return;

    setIsMuted((prev) => {
      const newMuteState = !prev;

      if (newMuteState) {
        previousVolume.current = gainNodeRef.current!.gain.value;
        gainNodeRef.current!.gain.value = 0;
      } else {
        gainNodeRef.current!.gain.value = previousVolume.current;
      }

      return newMuteState;
    });
  }, []);

  useEffect(() => {
    if (sourceRef.current) {
      sourceRef.current.loop = loopEnabled;
    }
  }, [loopEnabled]);

  const isAudioFile = (fileName: string | undefined): boolean => {
    if (!fileName) return false;
    const lowerName = fileName.toLowerCase();
    return (
      lowerName.endsWith(".wav") ||
      lowerName.endsWith(".mp3") ||
      lowerName.endsWith(".aiff") ||
      lowerName.endsWith(".aif")
    );
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "Construction Kit":
        return <Package className="w-3 h-3 text-yellow-400" />;
      case "Preset Bundle":
      case "Preset":
        return <FileCode className="w-3 h-3 text-purple-400" />;
      case "Loop+MIDI Bundle":
      case "MIDI":
        return <Music className="w-3 h-3 text-blue-400" />;
      default:
        return <FileAudio className="w-3 h-3 text-green-400" />;
    }
  };

  const filteredData = contentFilter
    ? sideData?.filter((item) => item.contentType === contentFilter)
    : sideData;

  return (
    <aside className="flex flex-col fixed right-0 top-0 h-screen w-1/4 bg-black border-l border-white/5 overflow-hidden pt-12">
      {/* Header and global controls remain the same */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Imports</h2>
        <p className="text-sm text-white/60">
          Recently imported content and kits
        </p>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white/70 hover:bg-white/20"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
            <input
              type="checkbox"
              checked={loopEnabled}
              onChange={(e) => setLoopEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-primary focus:ring-primary bg-white/10"
            />
            Loop Previews
          </label>
        </div>
      </div>

      {/* Filter buttons remain the same */}
      <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setContentFilter(null)}
          className={`px-2 py-1 text-xs rounded-full transition-all shrink-0 ${contentFilter === null
            ? "bg-white/20 text-white"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setContentFilter("Construction Kit")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "Construction Kit"
            ? "bg-yellow-900/30 text-yellow-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <Package className="w-3 h-3" /> Kit
        </button>
        <button
          onClick={() => setContentFilter("Preset")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "Preset"
            ? "bg-purple-900/30 text-purple-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <FileCode className="w-3 h-3" /> Preset
        </button>
        <button
          onClick={() => setContentFilter("Loop+MIDI Bundle")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "Loop+MIDI Bundle"
            ? "bg-blue-900/30 text-blue-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <Music className="w-3 h-3" /> Loop+MIDI
        </button>
        <button
          onClick={() => setContentFilter("Sample Loop")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "Sample Loop"
            ? "bg-green-900/30 text-green-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <FileAudio className="w-3 h-3" /> Loop
        </button>
        <button
          onClick={() => setContentFilter("One-Shot")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "One-Shot"
            ? "bg-green-900/30 text-green-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <FileAudio className="w-3 h-3" /> One-Shot
        </button>
        <button
          onClick={() => setContentFilter("MIDI")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 shrink-0 ${contentFilter === "MIDI"
            ? "bg-blue-900/30 text-blue-300"
            : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
        >
          <Music className="w-3 h-3" /> MIDI
        </button>
      </div>

      {/* Simplified item list */}
      <div className="flex-1 overflow-y-scroll p-3 space-y-2">
        {loading ? (
          <Loading />
        ) : (
          filteredData?.map((item) => {
            // Consolidate audio info from different item types
            let audioId: string | null = null;
            let streamUrl: string | null = null;

            if (item.contentType === "Construction Kit" && item.defaultFullLoop) {
              audioId = item.defaultFullLoop.id;
              streamUrl = item.defaultFullLoop.streamUrl;
            } else if (item.file?.streamUrl) {
              audioId = item.id;
              streamUrl = item.file.streamUrl;
            } else if (item.files) {
              const audioFile = item.files.find(
                (f) => f.type === "AUDIO" && f.streamUrl
              );
              if (audioFile) {
                audioId = audioFile.contentId;
                streamUrl = audioFile.streamUrl ?? null;
              }
            }

            return (
              <div
                key={item.id}
                className="bg-white/[.03] rounded-lg p-3 hover:bg-white/5 transition-colors duration-150"
              >
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Top Row: Name */}
                  <p className="text-base text-white truncate font-medium">
                    {getFileName({
                      contentType: item.contentType,
                      soundGroup: item.soundGroup || "Unknown",
                      soundType: item.subGroup || "Unknown",
                      tempo: item.metadata?.bpm
                        ? Number(item.metadata.bpm)
                        : undefined,
                      key: item.metadata?.key,
                      name: item.name,
                    })}
                  </p>

                  {/* Bottom Row: Metadata and Actions */}
                  <div className="flex items-center justify-between mt-2">
                    {/* Metadata Tags */}
                    <div className="flex items-center gap-2 shrink-0 text-xs text-white/40">
                      <span className="bg-white/5 px-2 py-0.5 rounded-full font-mono">
                        {item.contentType.replace(" Bundle", "").replace("Sample ", "")}
                      </span>
                      {item.metadata?.key && (
                        <span className="font-mono">{item.metadata.key}</span>
                      )}
                      {item.metadata?.bpm && (
                        <span className="font-mono">{item.metadata.bpm} BPM</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {streamUrl && audioId && (
                        <>
                          <button
                            onClick={toggleLoop}
                            className={`p-1.5 rounded-full transition-all ${loopEnabled && (playingId === audioId || playingId === null)
                              ? "bg-primary/20 text-primary"
                              : "bg-white/5 text-white/40 hover:bg-white/10"
                              }`}
                            title="Toggle loop"
                          >
                            <Repeat className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handlePlayAudio(streamUrl, audioId!)}
                            disabled={loadingAudioId === audioId}
                            className={`p-1.5 rounded-full transition-all ${playingId === audioId
                              ? "bg-primary text-black"
                              : "bg-white/5 text-white/60 hover:bg-primary/20 hover:text-primary"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {loadingAudioId === audioId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : playingId === audioId ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </>
                      )}
                      <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <Edit3 className="h-3.5 w-3.5 text-white/40 hover:text-white/60" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                        <Trash2 className="h-3.5 w-3.5 text-white/40 hover:text-white/60" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
