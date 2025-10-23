"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Package,
  FileAudio,
  Download,
} from "lucide-react";

type ContentItem = {
  id: string;
  contentType: string;
  contentName: string;
  bpm: string;
  key: string;
  soundGroup: string;
  subGroup: string;
  styles: string[];
  moods: string[];
  processing: string[];
  soundDesign: string[];
  createdAt: string;
  fileId: string;
  file: {
    fileName: string;
    fileUrl: string;
    awsKey: string;
  };
  constructionKitId?: string;
};

type ConstructionKit = {
  id: string;
  kitName: string;
  description: string;
  bpm: string;
  key: string;
  styles: string[];
  moods: string[];
  userId: string;
  contents: ContentItem[];
  createdAt: string;
};

type ContentListProps = {
  items: ContentItem[];
  constructionKits?: ConstructionKit[];
  showKits?: boolean;
};

export default function ContentList({
  items,
  constructionKits = [],
  showKits = false,
}: ContentListProps) {
  const [expandedKits, setExpandedKits] = useState<Record<string, boolean>>({});

  const toggleKit = (kitId: string) => {
    setExpandedKits((prev) => ({
      ...prev,
      [kitId]: !prev[kitId],
    }));
  };

  const standaloneItems = showKits
    ? items.filter((item) => !item.constructionKitId)
    : items;

  const renderContentItem = (item: ContentItem, isInKit = false) => (
    <Card
      key={item.id}
      className={`shadow-lg ${
        isInKit ? "border-l-4 border-blue-500 ml-4" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileAudio className="h-4 w-4" />
          {item.contentName} <span className="text-gray-400">({item.key})</span>
        </CardTitle>
        <p className="text-sm text-gray-500">{item.contentType}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="font-medium">BPM:</span> {item.bpm}
        </p>
        <p>
          <span className="font-medium">Sound Group:</span> {item.soundGroup}
        </p>
        <p>
          <span className="font-medium">Sub Group:</span> {item.subGroup}
        </p>
        <p>
          <span className="font-medium">Styles:</span>{" "}
          {item.styles.filter(Boolean).join(", ")}
        </p>
        <p>
          <span className="font-medium">Moods:</span>{" "}
          {item.moods.filter(Boolean).join(", ")}
        </p>
        <p>
          <span className="font-medium">Processing:</span>{" "}
          {Array.isArray(item.processing) && item.processing.length > 0
            ? item.processing
                .map((p) => {
                  try {
                    return typeof p === "string" ? JSON.parse(p) : p;
                  } catch (e) {
                    console.error("Error parsing processing data:", e);
                    return p;
                  }
                })
                .flat()
                .filter(Boolean)
                .join(", ")
            : "None"}
        </p>
        <p>
          <span className="font-medium">Sound Design:</span>{" "}
          {Array.isArray(item.soundDesign) && item.soundDesign.length > 0
            ? item.soundDesign
                .map((s) => {
                  try {
                    return typeof s === "string" ? JSON.parse(s) : s;
                  } catch (e) {
                    console.error("Error parsing sound design data:", e);
                    return s;
                  }
                })
                .flat()
                .filter(Boolean)
                .join(", ")
            : "None"}
        </p>
        <p className="text-xs text-gray-400">
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        {item.file.fileUrl && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={item.file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Download File
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderConstructionKit = (kit: ConstructionKit) => {
    const isExpanded = expandedKits[kit.id] || false;

    return (
      <div key={kit.id} className="col-span-full">
        <Card className="shadow-lg border-2 border-blue-700">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                <Package className="h-5 w-5" />
                {kit.kitName}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700"
                onClick={() => toggleKit(kit.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p>
                  <span className="font-medium">BPM:</span> {kit.bpm}
                </p>
                <p>
                  <span className="font-medium">Key:</span> {kit.key}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Styles:</span>{" "}
                  {kit.styles.join(", ")}
                </p>
                <p>
                  <span className="font-medium">Moods:</span>{" "}
                  {kit.moods.join(", ")}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{kit.description}</p>
            <p className="text-xs text-gray-500">
              Created: {new Date(kit.createdAt).toLocaleDateString()}
            </p>

            {isExpanded && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 text-gray-700">
                  Kit Contents ({kit.contents.length} items):
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {kit.contents.map((contentItem) =>
                    renderContentItem(contentItem, true)
                  )}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant={isExpanded ? "default" : "outline"}
              onClick={() => toggleKit(kit.id)}
              className="w-full"
            >
              {isExpanded ? "Hide Contents" : "Show All Contents"}
              {isExpanded ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {showKits && constructionKits.map(renderConstructionKit)}

      {standaloneItems.map((item) => renderContentItem(item))}
    </div>
  );
}
