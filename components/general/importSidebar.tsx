"use client";
import { useEffect, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import Loading from "./loading";

interface ImportedContentItem {
  id: string | number;
  contentName: string;
  type: string;
  bpm?: number | string;
  key?: string;
}

export default function ImportSidebar() {
  const [sideData, setSideData] = useState<ImportedContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/content`
        );
        const data = await response.json();
        setSideData(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };
    fetchContent();
    fetchContent().then(() => {
      setLoading(false);
    });
  }, []);
  return (
    <div className="flex flex-col gap-6 fixed right-0 top-0 h-screen w-1/4 bg-gray-600/10 backdrop-blur-lg border-l border-white/10 p-6 overflow-y-auto">
      <h2 className="text-xl font-main font-medium text-white">
        Imported Content
      </h2>
      {loading ? (
        <Loading />
      ) : sideData && sideData.length > 0 ? (
        sideData.map((item) => (
          <div key={item.id}>
            <div className="border border-white/10 px-4 py-2 hover:border-white/20 transition-colors duration-300 rounded flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-medium leading-tight">
                  {item.contentName ?? "Untitled"}
                </h3>
                <p className="text-xs text-white/60">
                  {item.type ?? "Type"}
                  {item.bpm ? ` • ${item.bpm} BPM` : ""}
                  {item.key ? ` • ${item.key}` : ""}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <Edit3 className="h-4 w-4 text-white/80" />
                </button>
                <button className="p-1 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <Trash2 className="h-4 w-4 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-white">No content imported yet.</div>
      )}
    </div>
  );
}
