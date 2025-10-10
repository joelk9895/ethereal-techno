"use client";
import { useEffect, useState, useRef } from "react";
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
  FileCode, // Add these icons
} from "lucide-react";
import Loading from "@/app/components/general/loading";

interface ImportedContentItem {
  id: string;
  name: string;
  contentType: string;
  createdAt: string;
  metadata?: {
    bpm?: string;
    key?: string;
  };
  file?: {
    name: string;
    key: string;
  };
  files?: Array<{
    type: string;
    name: string;
    key: string;
    contentId: string;
  }>;
  // Add properties for construction kits
  contents?: number;
  presets?: number;
  loopAndMidis?: number;
}

export default function ImportSidebar() {
  const [sideData, setSideData] = useState<ImportedContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add filter state to toggle between showing all content vs specific types
  const [contentFilter, setContentFilter] = useState<string | null>(null);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!loopEnabled) return;

      const buffer = 0.5;
      if (audio.currentTime > audio.duration - buffer) {
        audio.currentTime = 0;
        audio.play();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [loopEnabled]);

  const handlePlayAudio = async (key: string, id: string) => {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (playingId === id) {
        audio.pause();
        audio.currentTime = 0;
        setPlayingId(null);
        setLoopEnabled(false);
        return;
      }

      if (playingId) {
        audio.pause();
        audio.currentTime = 0;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/stream?key=${key}`
      );
      const data = await response.json();

      if (data.url) {
        audio.src = data.url;
        await audio.play();
        setPlayingId(id);
      }
    } catch (error) {
      console.error("Error getting audio URL:", error);
    }
  };

  const toggleLoop = () => {
    setLoopEnabled(!loopEnabled);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleAudioEnded = () => {
      if (!loopEnabled) {
        setPlayingId(null);
      }
    };

    audio.addEventListener("ended", handleAudioEnded);

    return () => {
      audio.removeEventListener("ended", handleAudioEnded);
    };
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

  // Get icon for content type
  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case "Construction Kit":
        return <Package className="w-3 h-3 text-yellow-400" />;
      case "Preset Bundle":
        return <FileCode className="w-3 h-3 text-purple-400" />;
      case "Loop+MIDI Bundle":
        return <Music className="w-3 h-3 text-blue-400" />;
      default:
        return <FileAudio className="w-3 h-3 text-green-400" />;
    }
  };

  // Filter content items based on the current filter
  const filteredData = contentFilter
    ? sideData?.filter((item) => item.contentType === contentFilter)
    : sideData;

  return (
    <aside className="flex flex-col fixed right-0 top-0 h-screen w-1/4 bg-black border-l border-white/5 overflow-hidden pt-12">
      <div className="px-4 border-b border-white/10">
        <h2 className="font-bold uppercase font-main text-4xl mb-12 tracking-wide">
          Imported Content
        </h2>
      </div>

      {/* Optional: Add content type filters */}
      <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setContentFilter(null)}
          className={`px-2 py-1 text-xs rounded-full transition-all ${
            contentFilter === null
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setContentFilter("Construction Kit")}
          className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 ${
            contentFilter === "Construction Kit"
              ? "bg-yellow-900/30 text-yellow-300"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Package className="w-3 h-3" /> Kits
        </button>
        {/* Add more filter buttons if needed */}
      </div>

      <audio ref={audioRef} className="hidden" />

      <div className="flex-1 overflow-y-scroll p-3 space-y-2">
        {loading ? (
          <Loading />
        ) : filteredData && filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div
              key={item.id}
              className={`bg-white/[0.02] border rounded-sm hover:border-primary/30 transition-all duration-200 overflow-hidden ${
                item.contentType === "Construction Kit"
                  ? "border-yellow-900/30"
                  : "border-white/5"
              }`}
            >
              <div className="px-3 py-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {getContentTypeIcon(item.contentType)}
                    <h3 className="text-sm font-medium leading-tight text-white truncate">
                      {item.name || "Untitled"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/40 uppercase tracking-wide">
                      {item.contentType || "Unknown"}
                    </span>
                    {item.metadata?.bpm && (
                      <span className="text-[10px] text-primary/60">
                        {item.metadata.bpm}
                      </span>
                    )}
                    {item.metadata?.key && (
                      <span className="text-[10px] text-primary/60">
                        {item.metadata.key}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-white/5 rounded transition-colors">
                    <Edit3 className="h-3 w-3 text-white/40 hover:text-white/60" />
                  </button>
                  <button className="p-1 hover:bg-white/5 rounded transition-colors">
                    <Trash2 className="h-3 w-3 text-white/40 hover:text-white/60" />
                  </button>
                </div>
              </div>

              {/* Construction Kit specific info */}
              {item.contentType === "Construction Kit" && (
                <div className="px-3 pb-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between text-[11px] text-white/40">
                    <div>Contents: {item.contents || 0}</div>
                    <div>Presets: {item.presets || 0}</div>
                    <div>Loop+MIDI: {item.loopAndMidis || 0}</div>
                  </div>
                </div>
              )}

              {/* Regular file display */}
              {item.file && (
                <div className="px-3 pb-2 flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                  <span className="text-[11px] text-white/40 truncate flex-1">
                    {item.file.name}
                  </span>
                  {isAudioFile(item.file.name) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={toggleLoop}
                        className={`p-1 rounded-full transition-all ${
                          loopEnabled && playingId === item.id
                            ? "bg-primary/30 text-primary"
                            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                        }`}
                        title="Toggle loop"
                      >
                        <Repeat className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handlePlayAudio(item.file!.key, item.id)}
                        className={`p-1 rounded-full transition-all ${
                          playingId === item.id
                            ? "bg-primary text-black"
                            : "bg-white/5 text-white/60 hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        {playingId === item.id ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3 ml-0.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Files collection display */}
              {item.files && item.files.length > 0 && (
                <div className="border-t border-white/5">
                  <details className="group">
                    <summary className="px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <span className="text-[11px] text-white/40 uppercase tracking-wide">
                        Files ({item.files.length})
                      </span>
                      <ChevronDown className="w-3 h-3 text-white/30 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-3 pb-2 pt-1 space-y-1.5 bg-black/40">
                      {item.files.map((file) => (
                        <div
                          key={file.contentId}
                          className="flex items-center justify-between gap-2 text-[11px]"
                        >
                          <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                            <span className="uppercase text-primary/40 font-mono text-[9px] bg-primary/5 px-1.5 py-0.5 rounded shrink-0">
                              {file.type}
                            </span>
                            <span className="text-white/40 truncate">
                              {file.name}
                            </span>
                          </div>
                          {isAudioFile(file.name) && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={toggleLoop}
                                className={`p-1 rounded-full transition-all ${
                                  loopEnabled && playingId === file.contentId
                                    ? "bg-primary/30 text-primary"
                                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                                }`}
                                title="Toggle loop"
                              >
                                <Repeat className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handlePlayAudio(file.key, file.contentId)
                                }
                                className={`p-1 rounded-full transition-all shrink-0 ${
                                  playingId === file.contentId
                                    ? "bg-primary text-black"
                                    : "bg-white/5 text-white/60 hover:bg-primary/20 hover:text-primary"
                                }`}
                              >
                                {playingId === file.contentId ? (
                                  <Pause className="h-3 w-3" />
                                ) : (
                                  <Play className="h-3 w-3 ml-0.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-white/30 text-sm">
            No content imported yet
          </div>
        )}
      </div>
    </aside>
  );
}
