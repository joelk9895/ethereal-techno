"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
};

export default function ContentList({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {item.contentName}{" "}
              <span className="text-gray-400">({item.key})</span>
            </CardTitle>
            <p className="text-sm text-gray-500">{item.contentType}</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">BPM:</span> {item.bpm}
            </p>
            <p>
              <span className="font-medium">Sound Group:</span>{" "}
              {item.soundGroup}
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
              {item.processing
                .map((p) => JSON.parse(p))
                .flat()
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>
              <span className="font-medium">Sound Design:</span>{" "}
              {item.soundDesign
                .map((s) => JSON.parse(s))
                .flat()
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-xs text-gray-400">
              Added: {new Date(item.createdAt).toLocaleDateString()}
            </p>
            {item.file.fileUrl && (
              <a
                href={item.file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
